import { prisma } from "../../infrastructure/database/prisma.js";
import { HashUtil } from "../../common/utils/hash.js";
import { authConfig } from "../../config/auth.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BusinessRuleError,
} from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

/**
 * CompanyService
 * Direct Prisma company registration, multi-country tax entity setup, member management, and document uploads
 */
export class CompanyService {
  async registerCompany(userId, {
    legalName,
    businessName,
    tradingName,
    registrationNumber,
    taxId,
    countryCode = "US",
    address,
    user: adminUserData,
    adminUser,
  }) {
    const finalTradingName = businessName || tradingName || legalName;

    if (!legalName) {
      throw new BadRequestError("Legal name is required");
    }

    let country = null;
    if (countryCode) {
      country = await prisma.country.findFirst({
        where: {
          OR: [
            { code: String(countryCode).toUpperCase() },
            { id: String(countryCode) },
            { name: { equals: String(countryCode), mode: "insensitive" } },
          ],
        },
      });
    }
    if (!country) {
      country = await prisma.country.findFirst({
        where: { active: true },
        orderBy: { code: "asc" },
      }) || await prisma.country.findFirst();
    }

    if (registrationNumber && country) {
      const existingReg = await prisma.business.findFirst({
        where: {
          registrationNumber: { equals: registrationNumber.trim(), mode: "insensitive" },
          countryId: country.id,
        },
      });
      if (existingReg) {
        throw new ConflictError(
          `A registered enterprise with Registration Number '${registrationNumber}' already exists in ${country.name || "this jurisdiction"}.`,
          ERROR_CODES.COMPANY_ALREADY_EXISTS || "COMPANY_ALREADY_EXISTS"
        );
      }
    }

    if (taxId && country) {
      const existingTax = await prisma.business.findFirst({
        where: {
          taxId: { equals: taxId.trim(), mode: "insensitive" },
          countryId: country.id,
        },
      });
      if (existingTax) {
        throw new ConflictError(
          `A business with Tax ID '${taxId}' is already registered in ${country.name || "this jurisdiction"}.`,
          ERROR_CODES.COMPANY_ALREADY_EXISTS || "COMPANY_ALREADY_EXISTS"
        );
      }
    }

    let memberUserId = userId;
    const userData = adminUserData || adminUser;

    if (!memberUserId && userData?.email) {
      const formattedEmail = userData.email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({ where: { email: formattedEmail } });
      if (existingUser) {
        throw new ConflictError("An account with this admin email already exists", ERROR_CODES.USER_ALREADY_EXISTS);
      }

      if (!userData.password) {
        throw new BadRequestError("Password is required to create company admin user");
      }

      const roleBusinessUser = await prisma.role.upsert({
        where: { name: "BUSINESS_USER" },
        update: {},
        create: { name: "BUSINESS_USER", description: "B2B wholesale company administrator" },
      });

      const passwordHash = await HashUtil.hashPassword(userData.password, authConfig.saltRounds);
      const newUser = await prisma.user.create({
        data: {
          email: formattedEmail,
          passwordHash,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phone: userData.phone || address?.phone || null,
          customerType: "B2B",
          status: "PENDING",
          roles: {
            create: {
              roleId: roleBusinessUser.id,
            },
          },
        },
      });
      memberUserId = newUser.id;
    }

    if (!memberUserId) {
      throw new BadRequestError("Authenticated user or admin user details (email and password) are required to register a business");
    }

    const roleBusinessUser = await prisma.role.upsert({
      where: { name: "BUSINESS_USER" },
      update: {},
      create: { name: "BUSINESS_USER", description: "B2B wholesale company administrator" },
    });

    const existingUserRole = await prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId: memberUserId,
          roleId: roleBusinessUser.id,
        },
      },
    });

    if (!existingUserRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: memberUserId,
          roleId: roleBusinessUser.id,
        },
      });
    }

    return prisma.business.create({
      data: {
        legalName,
        tradingName: finalTradingName,
        registrationNumber,
        taxId,
        countryId: country.id,
        status: "PENDING",
        members: {
          create: {
            userId: memberUserId,
            title: "Business Owner",
            role: "OWNER",
            isPrimary: true,
          },
        },
        addresses: address
          ? {
            create: {
              type: address.type || "BUSINESS",
              name: address.name || legalName,
              line1: address.line1 || address.addressLine1 || "Address Line 1",
              line2: address.line2 || address.addressLine2 || null,
              city: address.city || "City",
              stateCode: address.stateCode || address.state || "NA",
              postalCode: address.postalCode || address.zip || "000000",
              countryId: country.id,
              phone: address.phone || null,
              isDefault: true,
            },
          }
          : undefined,
      },
      include: {
        country: true,
        members: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
          },
        },
        addresses: true,
        documents: true,
      },
    });
  }

  async getCompanyById(id, user) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        country: true,
        members: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        },
        addresses: true,
        documents: {
          include: { file: true },
        },
      },
    });

    if (!business) {
      throw new NotFoundError("Business not found");
    }

    const isMember = business.members.some((m) => m.userId === user.id);
    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("You do not have permission to view this business profile");
    }

    return business;
  }

  async listCompanies(user, { page = 1, limit = 20, status, search } = {}) {
    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    const where = {};
    if (!isAdmin) {
      where.members = { some: { userId: user.id } };
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { legalName: { contains: search, mode: "insensitive" } },
        { tradingName: { contains: search, mode: "insensitive" } },
        { registrationNumber: { contains: search, mode: "insensitive" } },
        { taxId: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.business.count({ where }),
      prisma.business.findMany({
        where,
        include: {
          country: true,
          members: {
            include: {
              user: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
          },
          documents: { include: { file: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { total, items };
  }

  async updateCompany(id, user, data) {
    const business = await this.getCompanyById(id, user);

    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    if (business.status === "APPROVED" && !isAdmin) {
      throw new ForbiddenError(
        "Business details are locked after admin verification. Please contact support or an administrator to request changes.",
        ERROR_CODES.FORBIDDEN
      );
    }

    const safeData = {};
    const targetCountryId = data.countryCode
      ? (await prisma.country.findUnique({ where: { code: data.countryCode.toUpperCase() } }))?.id || business.countryId
      : business.countryId;

    if (data.registrationNumber !== undefined && data.registrationNumber !== business.registrationNumber) {
      if (data.registrationNumber) {
        const existingReg = await prisma.business.findFirst({
          where: {
            id: { not: id },
            registrationNumber: { equals: data.registrationNumber.trim(), mode: "insensitive" },
            countryId: targetCountryId,
          },
        });
        if (existingReg) {
          throw new ConflictError(
            `Registration Number '${data.registrationNumber}' is already assigned to another business in this jurisdiction.`
          );
        }
      }
      safeData.registrationNumber = data.registrationNumber;
    }

    if (data.taxId !== undefined && data.taxId !== business.taxId) {
      if (data.taxId) {
        const existingTax = await prisma.business.findFirst({
          where: {
            id: { not: id },
            taxId: { equals: data.taxId.trim(), mode: "insensitive" },
            countryId: targetCountryId,
          },
        });
        if (existingTax) {
          throw new ConflictError(
            `Tax ID '${data.taxId}' is already registered by another enterprise.`
          );
        }
      }
      safeData.taxId = data.taxId;
    }

    if (data.legalName !== undefined) safeData.legalName = data.legalName;
    if (data.tradingName !== undefined) safeData.tradingName = data.tradingName;

    if (isAdmin) {
      if (data.status !== undefined) safeData.status = data.status;
      if (data.paymentTermsDays !== undefined) safeData.paymentTermsDays = Number(data.paymentTermsDays);
      if (data.creditLimit !== undefined) safeData.creditLimit = data.creditLimit;
    }

    if (data.countryCode) {
      const country = await prisma.country.findUnique({
        where: { code: data.countryCode.toUpperCase() },
      });
      if (!country) {
        throw new NotFoundError(`Country code '${data.countryCode}' not supported`);
      }
      safeData.countryId = country.id;
    }

    return prisma.business.update({
      where: { id },
      data: safeData,
      include: {
        country: true,
        members: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        },
        documents: true,
      },
    });
  }

  async deleteCompany(id, user) {
    const business = await this.getCompanyById(id, user);

    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");
    const isPrimaryOwner = business.members.some((m) => m.userId === user.id && m.isPrimary);

    if (!isAdmin && !isPrimaryOwner) {
      throw new ForbiddenError("Only business primary owner or administrator can delete this business");
    }

    await prisma.business.delete({
      where: { id },
    });

    return { id, deleted: true };
  }

  async uploadDocument(id, user, { fileAssetId, documentType, documentNumber, expiresAt }) {
    await this.getCompanyById(id, user);

    if (!fileAssetId || !documentType) {
      throw new BadRequestError("File asset ID and document type are required", ERROR_CODES.DOCUMENT_REQUIRED);
    }

    return prisma.businessDocument.create({
      data: {
        businessId: id,
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
      where: { businessId: id },
      include: { file: true },
      orderBy: { uploadedAt: "desc" },
    });
  }

  async submitVerification(id, user) {
    const business = await this.getCompanyById(id, user);
    const docs = await this.listDocuments(id, user);

    if (!docs || docs.length === 0) {
      throw new BusinessRuleError(
        "Please upload at least one valid business document before submitting for verification.",
        ERROR_CODES.DOCUMENT_REQUIRED
      );
    }

    return prisma.business.update({
      where: { id },
      data: { status: "UNDER_REVIEW" },
    });
  }
}
