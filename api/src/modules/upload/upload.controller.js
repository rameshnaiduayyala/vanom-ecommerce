import { uploadFile, getFilePublicUrl } from "../../common/utils/file-upload.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { AppError } from "../../common/errors/app-error.js";

/**
 * Handle single file upload and return public URL + file metadata.
 * POST /api/v1/uploads?folder=products
 */
export async function uploadSingle(request, reply) {
  if (!request.isMultipart?.()) {
    throw new AppError("Multipart form-data is required for file upload", HTTP_STATUS.BAD_REQUEST, "MULTIPART_REQUIRED");
  }

  const folder = request.query?.folder || "general";
  const part = await request.file();

  if (!part) {
    throw new AppError("No file provided in the request", HTTP_STATUS.BAD_REQUEST, "FILE_REQUIRED");
  }

  const file = await uploadFile(folder, part);

  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "File uploaded successfully",
    data: {
      id: file.id,
      url: file.url,
      storageKey: file.storageKey,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size
    }
  });
}

/**
 * Handle multiple file uploads and return list of public URLs + file metadata.
 * POST /api/v1/uploads/multiple?folder=products
 */
export async function uploadMultiple(request, reply) {
  if (!request.isMultipart?.()) {
    throw new AppError("Multipart form-data is required for file upload", HTTP_STATUS.BAD_REQUEST, "MULTIPART_REQUIRED");
  }

  const folder = request.query?.folder || "general";
  const uploadedFiles = [];

  for await (const part of request.parts()) {
    if (part.type === "file") {
      const file = await uploadFile(folder, part);
      uploadedFiles.push({
        id: file.id,
        url: file.url,
        storageKey: file.storageKey,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size
      });
    }
  }

  if (uploadedFiles.length === 0) {
    throw new AppError("No files found in upload request", HTTP_STATUS.BAD_REQUEST, "FILES_REQUIRED");
  }

  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: `${uploadedFiles.length} file(s) uploaded successfully`,
    data: uploadedFiles
  });
}
