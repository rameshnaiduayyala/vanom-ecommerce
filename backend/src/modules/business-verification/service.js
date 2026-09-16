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
    const where = status ? { status } : { status: { in: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"] } };
    const [total, items] = await Promise.all([
      prisma.business.count({ where }),
      prisma.business.findMany({
        where,
        include: {
          country: true,
          documents: { include: { file: true } },
          members: { include: { user: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);
    const formatted = items.map(b => ({
      id: b.id,
      companyId: b.id,
      legalName: b.legalName,
      tradingName: b.tradingName,
      status: b.status,
      createdAt: b.createdAt,
      submittedAt: b.createdAt,
      country: b.country,
      documents: b.documents,
      members: b.members,
      company: b,
    }));
    return { total, items: formatted };
  }

  async getApplicationById(id) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        country: true,
        documents: { include: { file: true } },
        members: { include: { user: true } },
      },
    });

    if (!business) {
      throw new NotFoundError("Business application not found");
    }
    return {
      id: business.id,
      companyId: business.id,
      company: business,
      business,
      status: business.status,
      documents: business.documents,
      members: business.members,
    };
  }

  async approveApplication(applicationId, reviewer, { notes } = {}) {
    const app = await this.getApplicationById(applicationId);
    const business = app.business || app.company;

    if (!business) {
      throw new NotFoundError("Associated business not found");
    }

    if (!business.documents || business.documents.length === 0) {
      throw new BusinessRuleError(
        "Cannot approve business without verified documents",
        ERROR_CODES.DOCUMENT_REQUIRED
      );
    }

    const beforeData = { status: business.status };

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.business.update({
        where: { id: business.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedById: reviewer.id,
        },
      });

      await tx.businessDocument.updateMany({
        where: { businessId: business.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      return b;
    });

    await this.auditService.log({
      actorId: reviewer.id,
      action: "APPROVE",
      entityType: "BUSINESS",
      entityId: business.id,
      beforeData,
      afterData: { status: "APPROVED", approvedById: reviewer.id },
      metadata: { applicationId, notes },
    });

    const primaryMember = business.members?.find((m) => m.isPrimary) || business.members?.[0];
    if (primaryMember?.user) {
      await this.notificationService.sendNotification({
        userId: primaryMember.userId,
        channel: "EMAIL",
        title: "B2B Company Account Approved!",
        body: `Congratulations! ${business.legalName} has been approved for wholesale B2B pricing and bulk ordering.`,
        data: { businessId: business.id },
      });
    }

    return { success: true, business: updated };
  }

  async rejectApplication(applicationId, reviewer, { reason }) {
    const app = await this.getApplicationById(applicationId);
    const business = app.business || app.company;

    if (!business) {
      throw new NotFoundError("Associated business not found");
    }

    const beforeData = { status: business.status };

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: { status: "REJECTED" },
    });

    await this.auditService.log({
      actorId: reviewer.id,
      action: "REJECT",
      entityType: "BUSINESS",
      entityId: business.id,
      beforeData,
      afterData: { status: "REJECTED" },
      metadata: { applicationId, reason },
    });

    const primaryMember = business.members?.find((m) => m.isPrimary) || business.members?.[0];
    if (primaryMember?.user) {
      await this.notificationService.sendNotification({
        userId: primaryMember.userId,
        channel: "EMAIL",
        title: "B2B Company Verification Update",
        body: `Your verification application for ${business.legalName} was not approved. Reason: ${reason}`,
        data: { businessId: business.id, reason },
      });
    }

    return { success: true, business: updated };
  }
}
