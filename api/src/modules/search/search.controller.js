import * as searchService from "./search.service.js";
import { sendSuccess } from "../../common/response/api-response.js";

export async function search(request, reply) {
  const q = request.query.q ?? request.query.search ?? "";
  const categoryId = request.query.categoryId;
  const limit = Math.min(20, Math.max(1, parseInt(request.query.limit, 10) || 10));
  const countryCode = request.headers["x-country-code"] || request.query.country || "US";

  const result = await searchService.searchCatalog({
    query: q,
    categoryId,
    limit,
    countryCode,
  });

  return sendSuccess(reply, {
    message: "Search completed successfully",
    data: result,
  });
}

