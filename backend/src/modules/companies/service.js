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
  /**
   * Register a company with an admin user, legal name, business/trading name, and address
   * If userId is provided or authenticated, links to that user.
   * If adminUser object { email, password, firstName, lastName, phone } is provided, creates the admin user automatically.
   */
  async registerCompany(userId, {
    legalName,
    businessName,
    tradingName,
    registrationNumber,
    taxId,
    countryCode = "USA",
    address,
    user: adminUserData,
    adminUser,
  }) {
    const finalTradingName = businessName || tradingName || legalName;

    if (!legalName) {
      throw new BadRequestError("Legal name is required");
    }

    // Resolve Country dynamically by code or id, or fallback to first available country
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

    let memberUserId = userId;
    const userData = adminUserData || adminUser;

    // If an admin user payload was passed (e.g. public business registration)
    if (!memberUserId && userData?.email) {
      const formattedEmail = userData.email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({ where: { email: formattedEmail } });
      if (existingUser) {
        throw new ConflictError("An account with this admin email already exists", ERROR_CODES.USER_ALREADY_EXISTS);
      }

      if (!userData.password) {
        throw new BadRequestError("Password is required to create company admin user");
      }

      const roleCompanyAdmin = await prisma.role.upsert({
        where: { name: "COMPANY_ADMIN" },
        update: {},
        create: { name: "COMPANY_ADMIN", description: "B2B wholesale company administrator" },
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
          profile: { create: {} },
          roles: {
            create: {
              roleId: roleCompanyAdmin.id,
            },
          },
        },
      });
      memberUserId = newUser.id;
    }

    if (!memberUserId) {
      throw new BadRequestError("Authenticated user or admin user details (email and password) are required to register a company");
    }

    // Ensure member has COMPANY_ADMIN role attached
    const roleCompanyAdmin = await prisma.role.upsert({
      where: { name: "COMPANY_ADMIN" },
      update: {},
      create: { name: "COMPANY_ADMIN", description: "B2B wholesale company administrator" },
    });

    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: memberUserId,
          roleId: roleCompanyAdmin.id,
        },
      },
    });

    if (!existingUserRole) {
      await prisma.userRole.create({
        data: {
          userId: memberUserId,
          roleId: roleCompanyAdmin.id,
        },
      });
    }

    // Create Company with optional address and verification application
    return prisma.company.create({
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
            title: "Company Administrator",
            isPrimary: true,
            roles: {
              create: { roleName: "COMPANY_ADMIN" },
            },
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
              state: address.state || null,
              postalCode: address.postalCode || address.zip || "000000",
              countryId: country.id,
              phone: address.phone || null,
              isDefault: true,
            },
          }
          : undefined,
        verification: {
          create: {
            status: "PENDING",
          },
        },
      },
      include: {
        country: true,
        members: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
            roles: true,
          },
        },
        addresses: true,
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

  async listCompanies(user, { page = 1, limit = 20, status, search } = {}) {
    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    const where = {};
    if (!isAdmin) {
      // Non-admin can only see companies they belong to
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
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        include: {
          country: true,
          members: {
            include: {
              user: { select: { id: true, email: true, firstName: true, lastName: true } },
              roles: true,
            },
          },
          verification: true,
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
    const company = await this.getCompanyById(id, user);

    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    // Once approved, company details are locked against self-edits (only Admin can modify)
    if (company.status === "APPROVED" && !isAdmin) {
      throw new ForbiddenError(
        "Company details are locked after admin verification. Please contact support or an administrator to request changes.",
        ERROR_CODES.FORBIDDEN
      );
    }

    // Whitelist editable fields
    const safeData = {};
    if (data.legalName !== undefined) safeData.legalName = data.legalName;
    if (data.tradingName !== undefined) safeData.tradingName = data.tradingName;
    if (data.registrationNumber !== undefined) safeData.registrationNumber = data.registrationNumber;
    if (data.taxId !== undefined) safeData.taxId = data.taxId;

    // Admin-only fields
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

    return prisma.company.update({
      where: { id },
      data: safeData,
      include: {
        country: true,
        members: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        },
        verification: true,
      },
    });
  }

  async deleteCompany(id, user) {
    const company = await this.getCompanyById(id, user);

    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");
    const isPrimaryOwner = company.members.some((m) => m.userId === user.id && m.isPrimary);

    if (!isAdmin && !isPrimaryOwner) {
      throw new ForbiddenError("Only company primary owner or administrator can delete this company");
    }

    await prisma.company.delete({
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
