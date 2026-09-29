import * as categoryService from "./category.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { AppError } from "../../common/errors/app-error.js";
import { replaceFile } from "../../common/utils/file-upload.js";

async function getCategoryInput(request, oldImageKey = null) {
  if (!request.isMultipart?.()) return request.body;
  const input = {};

  for await (const part of request.parts()) {
    if (part.type === "file") {
      if (part.fieldname !== "image") {
        throw new AppError("Only the image file field is supported", HTTP_STATUS.BAD_REQUEST, "INVALID_UPLOAD_FIELD");
      }
      const file = oldImageKey
        ? await replaceFile("categories", part, oldImageKey)
        : await request.server.uploadFile("categories", part);
      input.imageUrl = file.storageKey;
      continue;
    }

    if (part.fieldname === "data") {
      try {
        Object.assign(input, JSON.parse(part.value));
      } catch {
        throw new AppError("The data field must contain valid JSON", HTTP_STATUS.BAD_REQUEST, "INVALID_CATEGORY_DATA");
      }
      continue;
    }

    input[part.fieldname] = part.fieldname === "isActive" ? part.value === "true" : part.value;
  }
  return input;
}

export async function create(request, reply) {
  const category = await categoryService.createCategory(await getCategoryInput(request));
  return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.CATEGORY_CREATED, data: category });
}

export async function list(request, reply) {
  const pagination = getPagination(request.query);
  const result = await categoryService.listCategories({
    ...pagination,
    search: request.query.search,
    isActive: request.query.isActive,
    parentId: request.query.parentId,
    rootOnly: request.query.rootOnly === true || request.query.rootOnly === "true"
  });
  return sendSuccess(reply, {
    message: MESSAGES.CATEGORIES_FETCHED,
    data: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total)
  });
}

export async function getTree(request, reply) {
  const tree = await categoryService.getCategoryTree();
  return sendSuccess(reply, {
    message: "Category tree fetched successfully",
    data: tree
  });
}

export async function getById(request, reply) {
  const category = await categoryService.getCategoryById(request.params.id);
  return sendSuccess(reply, { message: MESSAGES.CATEGORY_FETCHED, data: category });
}

export async function update(request, reply) {
  const current = request.isMultipart?.()
    ? await categoryService.getCategoryById(request.params.id)
    : null;
  const category = await categoryService.updateCategory(
    request.params.id,
    await getCategoryInput(request, current?.imageUrl)
  );
  return sendSuccess(reply, { message: MESSAGES.CATEGORY_UPDATED, data: category });
}

export async function remove(request, reply) {
  await categoryService.deleteCategory(request.params.id);
  return sendSuccess(reply, { message: MESSAGES.CATEGORY_DELETED, data: null });
}
