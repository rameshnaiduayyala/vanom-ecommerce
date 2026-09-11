import { CompanyService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class CompanyController {
  constructor(service = new CompanyService()) {
    this.service = service;
  }

  register = async (request, reply) => {
    const userId = request.user?.id || null;
    const result = await this.service.registerCompany(userId, request.body);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(result));
  };


  list = async (request, reply) => {
    const { page, limit, status, search } = request.query || {};
    const result = await this.service.listCompanies(request.user, { page, limit, status, search });
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  getById = async (request, reply) => {
    const result = await this.service.getCompanyById(request.params.id, request.user);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  update = async (request, reply) => {
    const result = await this.service.updateCompany(request.params.id, request.user, request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  delete = async (request, reply) => {
    const result = await this.service.deleteCompany(request.params.id, request.user);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  uploadDocument = async (request, reply) => {
    let payload = {};
    if (request.isMultipart && request.isMultipart()) {
      let fileBuffer = null;
      let originalName = null;
      let mimeType = null;
      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === "file") {
          fileBuffer = await part.toBuffer();
          originalName = part.filename;
          mimeType = part.mimetype;
        } else {
          payload[part.fieldname] = part.value;
        }
      }

      if (fileBuffer) {
        const { FileService } = await import("../files/service.js");
        const fileService = new FileService();
        const asset = await fileService.uploadFile({
          fileBuffer,
          originalName,
          mimeType: mimeType || "application/octet-stream",
          type: "BUSINESS_DOCUMENT",
          uploadedById: request.user.id,
        });
        payload.fileAssetId = asset.id;
      }
    } else {
      payload = request.body || {};
    }

    const result = await this.service.uploadDocument(request.params.id, request.user, payload);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(result));
  };

  listDocuments = async (request, reply) => {
    const result = await this.service.listDocuments(request.params.id, request.user);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  submitVerification = async (request, reply) => {
    const result = await this.service.submitVerification(request.params.id, request.user);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };
}
