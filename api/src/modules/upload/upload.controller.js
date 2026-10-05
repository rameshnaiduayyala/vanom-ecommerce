import { uploadFile, getFilePublicUrl, deleteStoredFile } from "../../common/utils/file-upload.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { AppError } from "../../common/errors/app-error.js";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";

const ADMIN_FOLDERS = new Set(["products", "categories", "banners", "brands"]);

function checkFolderAuthorization(folder, user) {
  const isPrivileged = user?.role === "SUPERADMIN" || user?.role === "COMPANY_ADMIN";
  if (ADMIN_FOLDERS.has(folder) && !isPrivileged) {
    throw new AppError("Forbidden: Administrator privileges required to upload to this directory", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
  }
}

/**
 * Handle single file upload and return public URL + file metadata.
 * POST /api/v1/uploads?folder=products
 */
export async function uploadSingle(request, reply) {
  if (!request.isMultipart?.()) {
    throw new AppError("Multipart form-data is required for file upload", HTTP_STATUS.BAD_REQUEST, "MULTIPART_REQUIRED");
  }

  const folder = request.query?.folder || "general";
  checkFolderAuthorization(folder, request.user);

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
  checkFolderAuthorization(folder, request.user);

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

/**
 * List files stored in AWS S3 / local storage with search, folder filtering, and pagination.
 * GET /api/v1/admin/files
 */
export async function listFiles(request, reply) {
  const {
    page = 1,
    limit = 24,
    search,
    folder,
    type,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = request.query || {};

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
  const skip = (pageNum - 1) * take;

  const where = {};

  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: "insensitive" } },
      { storageKey: { contains: search, mode: "insensitive" } }
    ];
  }

  if (folder && folder !== "all") {
    where.storageKey = { startsWith: `${folder}/` };
  }

  if (type === "images") {
    where.mimeType = { startsWith: "image/" };
  } else if (type === "documents") {
    where.mimeType = { in: ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] };
  }

  const allowedSortFields = ["createdAt", "size", "originalName"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const order = sortOrder === "asc" ? "asc" : "desc";

  const [items, total] = await Promise.all([
    prisma.file.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: order }
    }),
    prisma.file.count({ where })
  ]);

  const data = items.map((f) => {
    const parts = f.storageKey.split("/");
    const detectedFolder = parts.length > 1 ? parts[0] : "general";
    return {
      id: f.id,
      originalName: f.originalName,
      storageKey: f.storageKey,
      mimeType: f.mimeType,
      size: f.size,
      folder: detectedFolder,
      url: getFilePublicUrl(f.storageKey),
      createdAt: f.createdAt
    };
  });

  return sendSuccess(reply, {
    message: "Files fetched successfully",
    data: {
      files: data,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    }
  });
}

/**
 * Get storage statistics (total file count, total size, folder breakdown, AWS S3 bucket).
 * GET /api/v1/admin/files/stats
 */
export async function getFileStats(request, reply) {
  const [totalFiles, sizeAggregate, allFiles] = await Promise.all([
    prisma.file.count(),
    prisma.file.aggregate({
      _sum: { size: true }
    }),
    prisma.file.findMany({
      select: { storageKey: true },
      take: 2000
    })
  ]);

  const folderCounts = {};
  for (const f of allFiles) {
    const folder = f.storageKey.split("/")[0] || "general";
    folderCounts[folder] = (folderCounts[folder] || 0) + 1;
  }

  return sendSuccess(reply, {
    message: "File stats fetched successfully",
    data: {
      totalFiles,
      totalSizeBytes: sizeAggregate._sum.size || 0,
      provider: env.uploadProvider || "s3",
      bucket: env.s3Bucket || "vanom-cloud-storage",
      region: env.s3Region || "auto",
      folderBreakdown: folderCounts
    }
  });
}

/**
 * Delete a file from AWS S3 and database.
 * DELETE /api/v1/admin/files/:id
 */
export async function deleteFile(request, reply) {
  const { id } = request.params;
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    throw new AppError("File not found", HTTP_STATUS.NOT_FOUND, "FILE_NOT_FOUND");
  }

  await deleteStoredFile(file.storageKey);

  return sendSuccess(reply, {
    message: "File deleted successfully from AWS S3 and database",
    data: { id, storageKey: file.storageKey }
  });
}
