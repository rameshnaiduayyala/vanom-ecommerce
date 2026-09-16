import * as service from "./country.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

export async function create(request, reply) { return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.COUNTRY_CREATED, data: await service.createCountry(request.body) }); }
export async function list(request, reply) { const pagination = getPagination(request.query); const result = await service.listCountries({ ...pagination, search: request.query.search, currencyId: request.query.currencyId }); return sendSuccess(reply, { message: MESSAGES.COUNTRIES_FETCHED, data: result.items, meta: getPaginationMeta(pagination.page, pagination.limit, result.total) }); }
export async function getById(request, reply) { return sendSuccess(reply, { message: MESSAGES.COUNTRY_FETCHED, data: await service.getCountryById(request.params.id) }); }
export async function update(request, reply) { return sendSuccess(reply, { message: MESSAGES.COUNTRY_UPDATED, data: await service.updateCountry(request.params.id, request.body) }); }
export async function remove(request, reply) { await service.deleteCountry(request.params.id); return sendSuccess(reply, { message: MESSAGES.COUNTRY_DELETED, data: null }); }
