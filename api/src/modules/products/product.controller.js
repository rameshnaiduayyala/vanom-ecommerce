import * as productService from "./product.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { AppError } from "../../common/errors/app-error.js";

async function getProductInput(request) {
  if (!request.isMultipart?.()) return request.body;

  let input = {};
  const images = [];
  let imageOrder = 0;

  for await (const part of request.parts()) {
    if (part.type === "file") {
      if (part.fieldname !== "images") {
        throw new AppError("Only images files are supported", HTTP_STATUS.BAD_REQUEST, "INVALID_UPLOAD_FIELD");
      }

      const file = await request.server.uploadFile("products", part);
      images.push({ url: file.storageKey, fileId: file.id, sortOrder: imageOrder++ });
      continue;
    }

    if (part.fieldname === "data") {
      try {
        input = JSON.parse(part.value);
      } catch {
        throw new AppError("The data field must contain valid JSON", HTTP_STATUS.BAD_REQUEST, "INVALID_PRODUCT_DATA");
      }
    }
  }

  return { ...input, ...(images.length ? { images } : {}) };
}

export async function create(request, reply) {
  const product = await productService.createProduct(await getProductInput(request));

  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: MESSAGES.PRODUCT_CREATED,
    data: product
  });
}

export async function list(request, reply) {
  const pagination = getPagination(request.query);

  const result = await productService.listProducts({
    ...pagination,
    search: request.query.search,
    categoryId: request.query.categoryId,
    type: request.query.type,
    isActive: request.query.isActive,
    isNew: request.query.isNew,
    isFeatured: request.query.isFeatured,
    isTrending: request.query.isTrending,
    isBestSeller: request.query.isBestSeller
  });

  return sendSuccess(reply, {
    message: MESSAGES.PRODUCTS_FETCHED,
    data: result.items,
    meta: getPaginationMeta(
      pagination.page,
      pagination.limit,
      result.total
    )
  });
}

export async function highlights(request, reply) {
  const pagination = getPagination(request.query);
  const result = await productService.listHighlightedProducts(request.params.type, pagination);
  return sendSuccess(reply, {
    message: MESSAGES.PRODUCTS_FETCHED,
    data: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total)
  });
}

export async function getById(request, reply) {
  const product = await productService.getProductById(request.params.id);

  return sendSuccess(reply, {
    message: MESSAGES.PRODUCT_FETCHED,
    data: product
  });
}

export async function update(request, reply) {
  const product = await productService.updateProduct(
    request.params.id,
    request.body
  );

  return sendSuccess(reply, {
    message: MESSAGES.PRODUCT_UPDATED,
    data: product
  });
}

export async function remove(request, reply) {
  await productService.deleteProduct(request.params.id);

  return sendSuccess(reply, {
    message: MESSAGES.PRODUCT_DELETED,
    data: null
  });
}

export async function createVariant(request, reply) {
  const variant = await productService.createVariant(request.params.productId, request.body);
  return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.VARIANT_CREATED, data: variant });
}

export async function getVariant(request, reply) {
  const variant = await productService.getVariantById(request.params.productId, request.params.id);
  return sendSuccess(reply, { message: MESSAGES.VARIANT_FETCHED, data: variant });
}

export async function listVariants(request, reply) {
  const variants = await productService.listVariants(request.params.productId);
  return sendSuccess(reply, { message: MESSAGES.VARIANT_FETCHED, data: variants });
}

export async function updateVariant(request, reply) {
  const variant = await productService.updateVariant(request.params.productId, request.params.id, request.body);
  return sendSuccess(reply, { message: MESSAGES.VARIANT_UPDATED, data: variant });
}

export async function deleteVariant(request, reply) {
  await productService.deleteVariant(request.params.productId, request.params.id);
  return sendSuccess(reply, { message: MESSAGES.VARIANT_DELETED, data: null });
}
