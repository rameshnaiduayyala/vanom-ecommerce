import * as service from "./currency.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

export async function create(request, reply) { return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.CURRENCY_CREATED, data: await service.createCurrency(request.body) }); }
export async function list(request, reply) {
  const pagination = getPagination(request.query); const result = await service.listCurrencies({ ...pagination, search: request.query.search });
  return sendSuccess(reply, { message: MESSAGES.CURRENCIES_FETCHED, data: result.items, meta: getPaginationMeta(pagination.page, pagination.limit, result.total) });
}
export async function getById(request, reply) { return sendSuccess(reply, { message: MESSAGES.CURRENCY_FETCHED, data: await service.getCurrencyById(request.params.id) }); }
export async function update(request, reply) { return sendSuccess(reply, { message: MESSAGES.CURRENCY_UPDATED, data: await service.updateCurrency(request.params.id, request.body) }); }
export async function remove(request, reply) { await service.deleteCurrency(request.params.id); return sendSuccess(reply, { message: MESSAGES.CURRENCY_DELETED, data: null }); }
