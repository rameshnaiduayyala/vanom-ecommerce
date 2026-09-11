import { BulkProductsService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { PaginationUtil } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class BulkProductsController {
  constructor(service = new BulkProductsService()) {
    this.service = service;
  }

  list = async (request, reply) => {
    const { page, limit } = PaginationUtil.parseParams(request.query);
    const { total, items } = await this.service.listBulkProducts({
      search: request.query.search,
      categoryId: request.query.categoryId,
      page,
      limit,
    });
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.paginated(items, { page, limit, total }));
  };

  getById = async (request, reply) => {
    const data = await this.service.getBulkProductById(request.params.id);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };

  create = async (request, reply) => {
    const data = await this.service.createBulkProduct(request.body);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(data));
  };

  update = async (request, reply) => {
    const data = await this.service.updateBulkProduct(request.params.id, request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };

  delete = async (request, reply) => {
    const data = await this.service.deleteBulkProduct(request.params.id);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };
}
