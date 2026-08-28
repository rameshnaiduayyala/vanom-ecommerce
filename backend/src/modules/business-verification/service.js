import { BusinessVerificationRepository } from "./repository.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { OutboxService } from "../../infrastructure/outbox/outbox.service.js";
import { AuditService } from "../audit/service.js";
import { NotificationService } from "../notifications/service.js";
import { NotFoundError, BusinessRuleError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class BusinessVerificationService {
  constructor(
    notificationService = new NotificationService(),
    auditService = new AuditService()
  ) {
    this.notificationService = notificationService;
    this.auditService = auditService;
  }

  async listApplications({ status, page, limit }) {
    return BusinessVerificationRepository.listApplications({ status, page, limit });
  }

  async getApplicationById(id) {
    const app = await BusinessVerificationRepository.getApplicationById(id);
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

    // Atomically approve company, create review, create outbox event, and create audit log
    const result = await prisma.$transaction(async tx => {
      const approval = await BusinessVerificationRepository.approveApplication(
        {
          applicationId,
          companyId: company.id,
          reviewerId: reviewer.id,
          notes,
        },
        tx
      );

      // Create Outbox Event
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

      return approval;
    });

    // Record Audit Log
    await this.auditService.log({
      actorId: reviewer.id,
      action: "APPROVE",
      entityType: "COMPANY",
      entityId: company.id,
      beforeData,
      afterData: { status: "APPROVED", approvedById: reviewer.id },
      metadata: { applicationId, notes },
    });

    // Send Notification to company primary admin
    const primaryMember = company.members.find(m => m.isPrimary) || company.members[0];
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

    const result = await prisma.$transaction(async tx => {
      const rejection = await BusinessVerificationRepository.rejectApplication(
        {
          applicationId,
          companyId: company.id,
          reviewerId: reviewer.id,
          reason,
        },
        tx
      );

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

      return rejection;
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

    const primaryMember = company.members.find(m => m.isPrimary) || company.members[0];
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
