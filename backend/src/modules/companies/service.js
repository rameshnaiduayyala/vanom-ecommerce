import { prisma } from "../../infrastructure/database/prisma.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

/**
 * CompanyService
 * Direct Prisma company registration, multi-country tax entity setup, member management, and document uploads
 */
export class CompanyService {
  async registerCompany(userId, { legalName, tradingName, registrationNumber, taxId, countryCode }) {
    if (!legalName || !countryCode) {
      throw new BadRequestError("Legal name and country code are required");
    }

    const country = await prisma.country.findUnique({
      where: { code: countryCode.toUpperCase() },
    });
    if (!country) {
      throw new NotFoundError(`Country code '${countryCode}' not supported`);
    }

    return prisma.company.create({
      data: {
        legalName,
        tradingName,
        registrationNumber,
        taxId,
        countryId: country.id,
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

  async getCompanyById(id, user) {
    const company = await prisma.company.findUnique({
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

    if (!company) {
      throw new NotFoundError("Company not found");
    }

    const isMember = company.members.some((m) => m.userId === user.id);
    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("You do not have permission to view this company profile");
    }

    return company;
  }

  async updateCompany(id, user, data) {
    await this.getCompanyById(id, user);
    return prisma.company.update({
      where: { id },
      data,
    });
  }

  async uploadDocument(id, user, { fileAssetId, documentType, documentNumber, expiresAt }) {
    await this.getCompanyById(id, user);

    if (!fileAssetId || !documentType) {
      throw new BadRequestError("File asset ID and document type are required", ERROR_CODES.DOCUMENT_REQUIRED);
    }

    return prisma.businessDocument.create({
      data: {
        companyId: id,
        fileAssetId,
        documentType,
        documentNumber,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: "UPLOADED",
      },
      include: { file: true },
    });
  }

  async listDocuments(id, user) {
    await this.getCompanyById(id, user);
    return prisma.businessDocument.findMany({
      where: { companyId: id },
      include: { file: true },
      orderBy: { uploadedAt: "desc" },
    });
  }

  async submitVerification(id, user) {
    const company = await this.getCompanyById(id, user);
    const docs = await this.listDocuments(id, user);

    if (!docs || docs.length === 0) {
      throw new BusinessRuleError(
        "Please upload at least one valid business document before submitting for verification.",
        ERROR_CODES.DOCUMENT_REQUIRED
      );
    }

    await prisma.company.update({
      where: { id },
      data: { status: "UNDER_REVIEW" },
    });

    return prisma.verificationApplication.upsert({
      where: { companyId: id },
      create: {
        companyId: id,
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
