import { CatalogService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { PaginationUtil } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class CatalogController {
  constructor(service = new CatalogService()) {
    this.service = service;
  }

  list = async (request, reply) => {
    const { page, limit } = PaginationUtil.parseParams(request.query);
    const { total, items } = await this.service.listProducts({
      search: request.query.search,
      categoryId: request.query.categoryId,
      brandId: request.query.brandId,
      isFeatured: request.query.isFeatured,
      isBestSeller: request.query.isBestSeller,
      page,
      limit,
    });
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.paginated(items, { page, limit, total }));
  };

  getFeatured = async (request, reply) => {
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 10;
    const items = await this.service.getFeaturedProducts({ limit });
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(items));
  };

  getBestSellers = async (request, reply) => {
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 10;
    const items = await this.service.getBestSellers({ limit });
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(items));
  };

  getById = async (request, reply) => {
    const context = {
      countryCode: request.headers["x-country-code"] || request.query.countryCode || "IN",
      currencyCode: request.headers["x-currency-code"] || request.query.currencyCode || "INR",
      user: request.user,
    };
    const data = await this.service.getProductById(request.params.id, context);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };

  create = async (request, reply) => {
    const data = await this.service.createProduct(request.body);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(data));
  };

  update = async (request, reply) => {
    const data = await this.service.updateProduct(request.params.id, request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };

  delete = async (request, reply) => {
    const data = await this.service.deleteProduct(request.params.id);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };
}
