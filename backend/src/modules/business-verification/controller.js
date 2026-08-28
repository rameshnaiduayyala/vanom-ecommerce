import { BusinessVerificationService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";
import { PaginationUtil } from "../../common/utils/pagination.js";

export class BusinessVerificationController {
  constructor(service = new BusinessVerificationService()) {
    this.service = service;
  }

  list = async (request, reply) => {
    const { page, limit } = PaginationUtil.parseParams(request.query);
    const { total, items } = await this.service.listApplications({
      status: request.query.status,
      page,
      limit,
    });
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.paginated(items, { page, limit, total }));
  };

  getById = async (request, reply) => {
    const data = await this.service.getApplicationById(request.params.id);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };

  approve = async (request, reply) => {
    const result = await this.service.approveApplication(request.params.id, request.user, request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  reject = async (request, reply) => {
    const result = await this.service.rejectApplication(request.params.id, request.user, request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };
}
