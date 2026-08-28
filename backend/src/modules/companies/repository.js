import { prisma } from "../../infrastructure/database/prisma.js";

export class CompanyRepository {
  static async createCompany({ legalName, tradingName, registrationNumber, taxId, countryId, userId }, tx = null) {
    const db = tx || prisma;
    return db.company.create({
      data: {
        legalName,
        tradingName,
        registrationNumber,
        taxId,
        countryId,
        status: "PENDING",
        members: {
          create: {
            userId,
            title: "Founder / Primary Admin",
            isPrimary: true,
            roles: {
              create: { roleName: "COMPANY_ADMIN" },
            },
          },
        },
        verification: {
          create: {
            status: "PENDING",
          },
        },
      },
      include: {
        country: true,
        members: { include: { user: true } },
        documents: true,
        verification: true,
      },
    });
  }

  static async findById(id) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        country: true,
        members: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
            roles: true,
          },
        },
        addresses: true,
        documents: {
          include: { file: true },
        },
        verification: {
          include: {
            reviews: {
              include: { reviewer: { select: { id: true, email: true, firstName: true, lastName: true } } },
            },
          },
        },
        priceLists: {
          include: { priceList: true },
        },
        creditAccount: true,
      },
    });
  }

  static async updateCompany(id, data, tx = null) {
    const db = tx || prisma;
    return db.company.update({
      where: { id },
      data,
    });
  }

  static async addDocument({ companyId, fileAssetId, documentType, documentNumber, expiresAt }, tx = null) {
    const db = tx || prisma;
    return db.businessDocument.create({
      data: {
        companyId,
        fileAssetId,
        documentType,
        documentNumber,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: "UPLOADED",
      },
      include: { file: true },
    });
  }

  static async listDocuments(companyId) {
    return prisma.businessDocument.findMany({
      where: { companyId },
      include: { file: true },
      orderBy: { uploadedAt: "desc" },
    });
  }

  static async submitVerification(companyId, tx = null) {
    const db = tx || prisma;
    await db.company.update({
      where: { id: companyId },
      data: { status: "UNDER_REVIEW" },
    });

    return db.verificationApplication.upsert({
      where: { companyId },
      create: {
        companyId,
        status: "UNDER_REVIEW",
        submittedAt: new Date(),
      },
      update: {
        status: "UNDER_REVIEW",
        submittedAt: new Date(),
      },
    });
  }
}
