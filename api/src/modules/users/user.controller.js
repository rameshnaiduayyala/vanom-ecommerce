import * as userService from "./user.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { AppError } from "../../common/errors/app-error.js";
import { replaceFile } from "../../common/utils/file-upload.js";

async function getUserInput(request, oldImageKey = null) {
  const isMultipart = typeof request.isMultipart === "function" && request.isMultipart();
  if (!isMultipart) return request.body ?? {};

  let input = {};
  for await (const part of request.parts()) {
    if (part.type === "file") {
      if (!["image", "avatar", "file"].includes(part.fieldname)) {
        throw new AppError("Use image, avatar, or file as the upload field", HTTP_STATUS.BAD_REQUEST, "INVALID_UPLOAD_FIELD");
      }

      const file = oldImageKey
        ? await replaceFile("avatars", part, oldImageKey)
        : await request.server.uploadFile("avatars", part);
      input.imageUrl = file.storageKey;
      continue;
    }

    if (part.fieldname === "data") {
      try {
        input = { ...input, ...JSON.parse(part.value) };
      } catch {
        throw new AppError("The data field must contain valid JSON", HTTP_STATUS.BAD_REQUEST, "INVALID_USER_DATA");
      }
      continue;
    }

    input[part.fieldname] = part.fieldname === "isActive"
      ? part.value === "true"
      : part.value;
  }

  return input;
}

export async function create(request, reply) {
  const user = await userService.createUser(await getUserInput(request));
  return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.USER_CREATED, data: user });
}

export async function list(request, reply) {
  const pagination = getPagination(request.query);
  const result = await userService.listUsers({
    ...pagination,
    search: request.query.search,
    isActive: request.query.isActive,
    countryId: request.query.countryId
  });
  return sendSuccess(reply, {
    message: MESSAGES.USERS_FETCHED,
    data: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total)
  });
}

export async function getById(request, reply) {
  const user = await userService.getUserById(request.params.id);
  return sendSuccess(reply, { message: MESSAGES.USER_FETCHED, data: user });
}

export async function update(request, reply) {
  const currentUser = request.isMultipart?.()
    ? await userService.getUserById(request.params.id)
    : null;
  const user = await userService.updateUser(
    request.params.id,
    await getUserInput(request, currentUser?.imageUrl)
  );
  return sendSuccess(reply, { message: MESSAGES.USER_UPDATED, data: user });
}

export async function remove(request, reply) {
  await userService.deleteUser(request.params.id);
  return sendSuccess(reply, { message: MESSAGES.USER_DELETED, data: null });
}
