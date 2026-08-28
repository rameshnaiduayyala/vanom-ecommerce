import { prisma } from "../../infrastructure/database/prisma.js";

export class BusinessVerificationRepository {
  static async listApplications({ status, page = 1, limit = 20 }) {
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  static async getApplicationById(id) {
    return prisma.verificationApplication.findUnique({
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
  }

  static async approveApplication({ applicationId, companyId, reviewerId, notes }, tx = null) {
    const db = tx || prisma;

    const application = await db.verificationApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        decidedAt: new Date(),
        decisionReason: notes || "Approved by Administrator",
      },
    });

    await db.company.update({
      where: { id: companyId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedById: reviewerId,
      },
    });

    await db.businessDocument.updateMany({
      where: { companyId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    const review = await db.verificationReview.create({
      data: {
        applicationId,
        reviewerId,
        decision: "APPROVED",
        notes,
      },
    });

    return { application, review };
  }

  static async rejectApplication({ applicationId, companyId, reviewerId, reason }, tx = null) {
    const db = tx || prisma;

    const application = await db.verificationApplication.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        decidedAt: new Date(),
        decisionReason: reason,
      },
    });

    await db.company.update({
      where: { id: companyId },
      data: {
        status: "REJECTED",
      },
    });

    const review = await db.verificationReview.create({
      data: {
        applicationId,
        reviewerId,
        decision: "REJECTED",
        notes: reason,
      },
    });

    return { application, review };
  }
}
