import * as service from "./pricing.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { MESSAGES } from "../../constants/messages.js";

export async function productList(request, reply) { return sendSuccess(reply, { message: MESSAGES.PRICING_FETCHED, data: await service.listProductPricing(request.params.productId) }); }
export async function productUpsert(request, reply) { return sendSuccess(reply, { message: MESSAGES.PRICING_UPDATED, data: await service.upsertProductPricing(request.params.productId, request.body) }); }
export async function productDelete(request, reply) { await service.deleteProductPricing(request.params.productId, request.params.countryId); return sendSuccess(reply, { message: MESSAGES.PRICING_DELETED, data: null }); }
export async function variantList(request, reply) { return sendSuccess(reply, { message: MESSAGES.PRICING_FETCHED, data: await service.listVariantPricing(request.params.productId, request.params.variantId) }); }
export async function variantUpsert(request, reply) { return sendSuccess(reply, { message: MESSAGES.PRICING_UPDATED, data: await service.upsertVariantPricing(request.params.productId, request.params.variantId, request.body) }); }
export async function variantDelete(request, reply) { await service.deleteVariantPricing(request.params.productId, request.params.variantId, request.params.countryId); return sendSuccess(reply, { message: MESSAGES.PRICING_DELETED, data: null }); }
