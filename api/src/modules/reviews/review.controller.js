import * as reviewService from "./review.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

export async function create(request, reply) {
  const review = await reviewService.createReview(request.params.productId, request.user.sub, request.body);
  return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.REVIEW_CREATED, data: review });
}

export async function list(request, reply) {
  const pagination = getPagination(request.query);
  const result = await reviewService.listReviews(request.params.productId, {
    ...pagination,
    rating: request.query.rating
  });
  return sendSuccess(reply, {
    message: MESSAGES.REVIEWS_FETCHED,
    data: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total)
  });
}

export async function getById(request, reply) {
  return sendSuccess(reply, { message: MESSAGES.REVIEW_FETCHED, data: await reviewService.getReviewById(request.params.id) });
}

export async function update(request, reply) {
  const review = await reviewService.updateReview(request.params.id, request.user.sub, request.user.role, request.body);
  return sendSuccess(reply, { message: MESSAGES.REVIEW_UPDATED, data: review });
}

export async function remove(request, reply) {
  await reviewService.deleteReview(request.params.id, request.user.sub, request.user.role);
  return sendSuccess(reply, { message: MESSAGES.REVIEW_DELETED, data: null });
}
