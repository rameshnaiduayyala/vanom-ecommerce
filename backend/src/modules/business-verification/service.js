import { prisma } from "../../infrastructure/database/prisma.js";
import { OutboxService } from "../../infrastructure/outbox/outbox.service.js";
import { AuditService } from "../audit/service.js";
import { NotificationService } from "../notifications/service.js";
import { NotFoundError, BusinessRuleError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

/**
 * BusinessVerificationService
 * Direct Prisma queries for verification workflows, reviews, and compliance transitions
 */
export class BusinessVerificationService {
  constructor(
    notificationService = new NotificationService(),
    auditService = new AuditService()
  ) {
    this.notificationService = notificationService;
    this.auditService = auditService;
  }

  async listApplications({ status, page = 1, limit = 20 } = {}) {
    const where = status ? { status } : {};
    const [total, items] = await Promise.all([
      prisma.verificationApplication.count({ where }),
      prisma.verificationApplication.findMany({
        where,
        include: {
          company: {
            include: {
              country: true,
              documents: { include: { file: true } },
              members: { include: { user: true } },
            },
          },
          reviews: {
            include: { reviewer: true },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { submittedAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  async getApplicationById(id) {
    const app = await prisma.verificationApplication.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            country: true,
            documents: { include: { file: true } },
            members: { include: { user: true } },
          },
        },
        reviews: {
          include: { reviewer: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!app) {
      throw new NotFoundError("Business verification application not found");
    }
    return app;
  }

  async approveApplication(applicationId, reviewer, { notes } = {}) {
    const app = await this.getApplicationById(applicationId);
    const company = app.company;

    if (!company) {
      throw new NotFoundError("Associated company not found");
    }

    if (!company.documents || company.documents.length === 0) {
      throw new BusinessRuleError(
        "Cannot approve company without verified documents",
        ERROR_CODES.DOCUMENT_REQUIRED
      );
    }

    const beforeData = { status: company.status };

    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.verificationApplication.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          decidedAt: new Date(),
          decisionReason: notes || "Approved by Administrator",
        },
      });

      await tx.company.update({
        where: { id: company.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedById: reviewer.id,
        },
      });

      await tx.businessDocument.updateMany({
        where: { companyId: company.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      const review = await tx.verificationReview.create({
        data: {
          applicationId,
          reviewerId: reviewer.id,
          decision: "APPROVED",
          notes,
        },
      });

      await OutboxService.recordEvent(
        {
          aggregateType: "COMPANY",
          aggregateId: company.id,
          eventType: "COMPANY_APPROVED",
          payload: {
            companyId: company.id,
            legalName: company.legalName,
            countryId: company.countryId,
            approvedById: reviewer.id,
          },
        },
        tx
      );

      return { application, review };
    });

    await this.auditService.log({
      actorId: reviewer.id,
      action: "APPROVE",
      entityType: "COMPANY",
      entityId: company.id,
      beforeData,
      afterData: { status: "APPROVED", approvedById: reviewer.id },
      metadata: { applicationId, notes },
    });

    const primaryMember = company.members.find((m) => m.isPrimary) || company.members[0];
    if (primaryMember?.user) {
      await this.notificationService.sendNotification({
        userId: primaryMember.userId,
        channel: "EMAIL",
        title: "B2B Company Account Approved!",
        body: `Congratulations! ${company.legalName} has been approved for wholesale B2B pricing and bulk ordering.`,
        data: { companyId: company.id },
      });
    }

    return result;
  }

  async rejectApplication(applicationId, reviewer, { reason }) {
    const app = await this.getApplicationById(applicationId);
    const company = app.company;

    if (!company) {
      throw new NotFoundError("Associated company not found");
    }

    const beforeData = { status: company.status };

    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.verificationApplication.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          decidedAt: new Date(),
          decisionReason: reason,
        },
      });

      await tx.company.update({
        where: { id: company.id },
        data: { status: "REJECTED" },
      });

      const review = await tx.verificationReview.create({
        data: {
          applicationId,
          reviewerId: reviewer.id,
          decision: "REJECTED",
          notes: reason,
        },
      });

      await OutboxService.recordEvent(
        {
          aggregateType: "COMPANY",
          aggregateId: company.id,
          eventType: "COMPANY_REJECTED",
          payload: {
            companyId: company.id,
            reason,
            rejectedById: reviewer.id,
          },
        },
        tx
      );

      return { application, review };
    });

    await this.auditService.log({
      actorId: reviewer.id,
      action: "REJECT",
      entityType: "COMPANY",
      entityId: company.id,
      beforeData,
      afterData: { status: "REJECTED" },
      metadata: { applicationId, reason },
    });

    const primaryMember = company.members.find((m) => m.isPrimary) || company.members[0];
    if (primaryMember?.user) {
      await this.notificationService.sendNotification({
        userId: primaryMember.userId,
        channel: "EMAIL",
        title: "B2B Company Verification Update",
        body: `Your verification application for ${company.legalName} was not approved. Reason: ${reason}`,
        data: { companyId: company.id, reason },
      });
    }

    return result;
  }
}
