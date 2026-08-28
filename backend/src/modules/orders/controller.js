import { OrderService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";
import { PaginationUtil } from "../../common/utils/pagination.js";

export class OrderController {
  constructor(service = new OrderService()) {
    this.service = service;
  }

  create = async (request, reply) => {
    const countryCode = request.headers["x-country-code"] || request.body?.countryCode || "IN";
    const currencyCode = request.headers["x-currency-code"] || request.body?.currencyCode || "INR";
    const order = await this.service.createOrder(
      request.user,
      {
        ...request.body,
        countryCode,
        currencyCode,
      },
      request.idempotencyKey
    );
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(order));
  };

  list = async (request, reply) => {
    const { page, limit } = PaginationUtil.parseParams(request.query);
    if (request.query.companyId) {
      const data = await this.service.listCompanyOrders(request.query.companyId, request.user, { page, limit });
      return reply.send(ApiResponse.paginated(data.items, { page, limit, total: data.total }));
    }
    const data = await this.service.listUserOrders(request.user, { page, limit });
    return reply.send(ApiResponse.paginated(data.items, { page, limit, total: data.total }));
  };

  getById = async (request, reply) => {
    const order = await this.service.getOrderById(request.params.id, request.user);
    return reply.send(ApiResponse.success(order));
  };

  cancel = async (request, reply) => {
    const cancelled = await this.service.cancelOrder(request.params.id, request.user, request.body?.reason);
    return reply.send(ApiResponse.success(cancelled));
  };
}
