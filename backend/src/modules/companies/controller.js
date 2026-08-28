import { CompanyService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class CompanyController {
  constructor(service = new CompanyService()) {
    this.service = service;
  }

  register = async (request, reply) => {
    const result = await this.service.registerCompany(request.user.id, request.body);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(result));
  };

  getById = async (request, reply) => {
    const result = await this.service.getCompanyById(request.params.id, request.user);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  update = async (request, reply) => {
    const result = await this.service.updateCompany(request.params.id, request.user, request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  uploadDocument = async (request, reply) => {
    const result = await this.service.uploadDocument(request.params.id, request.user, request.body);
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
