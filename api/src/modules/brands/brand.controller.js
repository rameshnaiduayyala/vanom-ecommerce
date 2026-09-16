import * as brandService from "./brand.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { AppError } from "../../common/errors/app-error.js";
import { replaceFile } from "../../common/utils/file-upload.js";

async function getBrandInput(request, oldImageKey = null) {
  if (!request.isMultipart?.()) return request.body;
  const input = {};

  for await (const part of request.parts()) {
    if (part.type === "file") {
      if (part.fieldname !== "image") {
        throw new AppError("Only the image file field is supported", HTTP_STATUS.BAD_REQUEST, "INVALID_UPLOAD_FIELD");
      }
      const file = oldImageKey
        ? await replaceFile("brands", part, oldImageKey)
        : await request.server.uploadFile("brands", part);
      input.imageUrl = file.storageKey;
      continue;
    }

    if (part.fieldname === "data") {
      try {
        Object.assign(input, JSON.parse(part.value));
      } catch {
        throw new AppError("The data field must contain valid JSON", HTTP_STATUS.BAD_REQUEST, "INVALID_BRAND_DATA");
      }
      continue;
    }

    input[part.fieldname] = part.fieldname === "isActive" ? part.value === "true" : part.value;
  }
  return input;
}

export async function create(request, reply) {
  const brand = await brandService.createBrand(await getBrandInput(request));
  return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.BRAND_CREATED, data: brand });
}

export async function list(request, reply) {
  const pagination = getPagination(request.query);
  const result = await brandService.listBrands({
    ...pagination,
    search: request.query.search,
    isActive: request.query.isActive
  });
  return sendSuccess(reply, {
    message: MESSAGES.BRANDS_FETCHED,
    data: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total)
  });
}

export async function getById(request, reply) {
  const brand = await brandService.getBrandById(request.params.id);
  return sendSuccess(reply, { message: MESSAGES.BRAND_FETCHED, data: brand });
}

export async function update(request, reply) {
  const current = request.isMultipart?.()
    ? await brandService.getBrandById(request.params.id)
    : null;
  const brand = await brandService.updateBrand(
    request.params.id,
    await getBrandInput(request, current?.imageUrl)
  );
  return sendSuccess(reply, { message: MESSAGES.BRAND_UPDATED, data: brand });
}

export async function remove(request, reply) {
  await brandService.deleteBrand(request.params.id);
  return sendSuccess(reply, { message: MESSAGES.BRAND_DELETED, data: null });
}
