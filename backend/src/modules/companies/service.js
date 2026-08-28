import { CompanyRepository } from "./repository.js";
import { GeographyRepository } from "../geography/repository.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class CompanyService {
  async registerCompany(userId, { legalName, tradingName, registrationNumber, taxId, countryCode }) {
    if (!legalName || !countryCode) {
      throw new BadRequestError("Legal name and country code are required");
    }

    const country = await GeographyRepository.getCountryByCode(countryCode);
    if (!country) {
      throw new NotFoundError(`Country code '${countryCode}' not supported`);
    }

    return CompanyRepository.createCompany({
      legalName,
      tradingName,
      registrationNumber,
      taxId,
      countryId: country.id,
      userId,
    });
  }

  async getCompanyById(id, user) {
    const company = await CompanyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    const isMember = company.members.some(m => m.userId === user.id);
    const userRoles = Array.isArray(user?.roles) ? user.roles.map(r => typeof r === "string" ? r : r.name || r.role?.name) : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("You do not have permission to view this company profile");
    }

    return company;
  }

  async updateCompany(id, user, data) {
    await this.getCompanyById(id, user);
    return CompanyRepository.updateCompany(id, data);
  }

  async uploadDocument(id, user, { fileAssetId, documentType, documentNumber, expiresAt }) {
    await this.getCompanyById(id, user);

    if (!fileAssetId || !documentType) {
      throw new BadRequestError("File asset ID and document type are required", ERROR_CODES.DOCUMENT_REQUIRED);
    }

    return CompanyRepository.addDocument({
      companyId: id,
      fileAssetId,
      documentType,
      documentNumber,
      expiresAt,
    });
  }

  async listDocuments(id, user) {
    await this.getCompanyById(id, user);
    return CompanyRepository.listDocuments(id);
  }

  async submitVerification(id, user) {
    const company = await this.getCompanyById(id, user);
    const docs = await CompanyRepository.listDocuments(id);

    if (!docs || docs.length === 0) {
      throw new BusinessRuleError(
        "Please upload at least one valid business document before submitting for verification.",
        ERROR_CODES.DOCUMENT_REQUIRED
      );
    }

    return CompanyRepository.submitVerification(id);
  }
}
