import { QuoteService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";
import { PaginationUtil } from "../../common/utils/pagination.js";

export class QuoteController {
  constructor(service = new QuoteService()) {
    this.service = service;
  }

  create = async (request, reply) => {
    const countryCode = request.headers["x-country-code"] || request.body?.countryCode || "IN";
    const currencyCode = request.headers["x-currency-code"] || request.body?.currencyCode || "INR";
    const data = await this.service.createQuote(request.user, {
      ...request.body,
      countryCode,
      currencyCode,
    });
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(data));
  };

  list = async (request, reply) => {
    const { page, limit } = PaginationUtil.parseParams(request.query);
    const data = await this.service.getQuoteById(request.query.id, request.user);
    return reply.send(ApiResponse.success(data));
  };

  getById = async (request, reply) => {
    const data = await this.service.getQuoteById(request.params.id, request.user);
    return reply.send(ApiResponse.success(data));
  };

  submit = async (request, reply) => {
    const data = await this.service.submitQuote(request.params.id, request.user);
    return reply.send(ApiResponse.success(data));
  };

  counter = async (request, reply) => {
    const data = await this.service.createCounterQuoteVersion(request.params.id, request.user, request.body);
    return reply.send(ApiResponse.success(data));
  };

  accept = async (request, reply) => {
    const data = await this.service.acceptQuote(request.params.id, request.user);
    return reply.send(ApiResponse.success(data));
  };

  convertToOrder = async (request, reply) => {
    const order = await this.service.convertToOrder(request.params.id, request.user, request.body);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(order));
  };
}
