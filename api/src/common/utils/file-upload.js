import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { optimizeImage } from "./image.js";
import { AppError } from "../errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf"]);

function safeExtension(filename) {
  const extension = extname(filename || "").toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension) ? extension : "";
}

function safeName(filename) {
  return String(filename || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
}

function validatePart(part) {
  if (!part?.file || !part.filename) throw new AppError("A file is required", HTTP_STATUS.BAD_REQUEST, "FILE_REQUIRED");
  if (!env.uploadAllowedMimeTypes.includes(part.mimetype)) {
    throw new AppError(`Unsupported file type: ${part.mimetype}`, HTTP_STATUS.BAD_REQUEST, "UNSUPPORTED_MIME_TYPE");
  }
  const ext = safeExtension(part.filename);
  if (!ext) {
    throw new AppError(`Unsupported file extension for: ${part.filename}`, HTTP_STATUS.BAD_REQUEST, "UNSUPPORTED_EXTENSION");
  }
}

function validateBufferMagicNumbers(buffer, mimeType) {
  if (!buffer || buffer.length < 4) {
    throw new AppError("Invalid or empty file content", HTTP_STATUS.BAD_REQUEST, "INVALID_FILE_CONTENT");
  }

  // PNG: 89 50 4E 47
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // WebP: RIFF ... WEBP
  const isWebp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";
  // PDF: %PDF-
  const isPdf = buffer.toString("ascii", 0, 5).startsWith("%PDF-");

  if (mimeType === "image/png" && !isPng) {
    throw new AppError("File content signature does not match image/png", HTTP_STATUS.BAD_REQUEST, "FILE_SIGNATURE_MISMATCH");
  }
  if ((mimeType === "image/jpeg" || mimeType === "image/jpg") && !isJpeg) {
    throw new AppError("File content signature does not match image/jpeg", HTTP_STATUS.BAD_REQUEST, "FILE_SIGNATURE_MISMATCH");
  }
  if (mimeType === "image/webp" && !isWebp) {
    throw new AppError("File content signature does not match image/webp", HTTP_STATUS.BAD_REQUEST, "FILE_SIGNATURE_MISMATCH");
  }
  if (mimeType === "application/pdf" && !isPdf) {
    throw new AppError("File content signature does not match application/pdf", HTTP_STATUS.BAD_REQUEST, "FILE_SIGNATURE_MISMATCH");
  }

  if (!isPng && !isJpeg && !isWebp && !isPdf) {
    throw new AppError("File format not supported. Only verified JPEG, PNG, WebP, and PDF files are allowed.", HTTP_STATUS.BAD_REQUEST, "UNSUPPORTED_FILE_SIGNATURE");
  }
}

function buildKey(part, folder = "general", extension = null) {
  const cleanFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50) || "general";
  const ext = extension || safeExtension(part.filename);
  if (!ext) {
    throw new AppError("Invalid or missing file extension", HTTP_STATUS.BAD_REQUEST, "INVALID_EXTENSION");
  }
  return `${cleanFolder}/${randomUUID()}${ext}`;
}

async function readFileStream(stream) {
  const chunks = [];
  let size = 0;
  for await (const chunk of stream) {
    size += chunk.length;
    if (size > env.uploadMaxFileSize) throw new AppError("File is too large", HTTP_STATUS.BAD_REQUEST, "FILE_TOO_LARGE");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function createS3Client() {
  if (!env.s3Bucket) throw new Error("S3_BUCKET is required when UPLOAD_PROVIDER=s3");

  const config = {
    region: env.s3Region || "auto",
    forcePathStyle: env.s3ForcePathStyle
  };

  if (env.s3Endpoint) {
    config.endpoint = env.s3Endpoint;
  }

  if (env.s3AccessKeyId && env.s3SecretAccessKey) {
    config.credentials = {
      accessKeyId: env.s3AccessKeyId,
      secretAccessKey: env.s3SecretAccessKey
    };
  }

  return new S3Client(config);
}

/**
 * Generates the publicly accessible URL for a given storageKey based on environment & upload provider.
 *
 * @param {string} storageKey e.g. "products/uuid.webp" or "categories/uuid.webp"
 * @returns {string} Fully qualified or public URL
 */
export function getFilePublicUrl(storageKey) {
  if (!storageKey) return null;
  if (storageKey.startsWith("http://") || storageKey.startsWith("https://") || storageKey.startsWith("data:")) {
    return storageKey;
  }

  if (env.uploadProvider === "s3") {
    // Custom Public CDN / R2 Domain URL (e.g. https://pub-xxx.r2.dev or https://cdn.vanom.com)
    if (env.s3PublicUrl) {
      const publicBase = env.s3PublicUrl.replace(/\/+$/, "");
      return `${publicBase}/${storageKey}`;
    }

    // Direct endpoint URL
    if (env.s3Endpoint) {
      const endpoint = env.s3Endpoint.replace(/\/+$/, "");
      return `${endpoint}/${env.s3Bucket}/${storageKey}`;
    }

    // Default AWS S3 public URL
    return `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com/${storageKey}`;
  }

  // Local static hosting under /static/
  const baseUrl = (env.appUrl || "http://localhost:3000").replace(/\/+$/, "");
  const cleanKey = storageKey.startsWith("/") ? storageKey.slice(1) : storageKey;
  return `${baseUrl}/static/${cleanKey}`;
}

export async function deleteStoredFile(storageKey) {
  if (!storageKey || storageKey.startsWith("http://") || storageKey.startsWith("https://")) return;

  if (env.uploadProvider === "s3") {
    const client = createS3Client();
    await client.send(new DeleteObjectCommand({ Bucket: env.s3Bucket, Key: storageKey }));
  } else if (env.uploadProvider === "local") {
    const root = resolve(env.uploadDir);
    const destination = resolve(root, storageKey);
    if (!destination.startsWith(`${root}${join("", "\\")}`) && !destination.startsWith(`${root}/`)) {
      throw new Error("Invalid upload path");
    }
    await unlink(destination).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }

  await prisma.file.deleteMany({ where: { storageKey } });
}

/**
 * Reusable core file upload function that handles validation, optimization, storage (local/S3),
 * database record persistence, and returns public URL alongside file metadata.
 *
 * @param {string} folder Storage folder (e.g. "products", "categories", "banners", "brands", "avatars").
 * @param {object} part Multipart file part returned by request.file() or request.parts().
 * @returns {Promise<{ id: string, storageKey: string, url: string, originalName: string, mimeType: string, size: number }>}
 */
export async function uploadFile(folder = "general", part) {
  validatePart(part);
  const inputBuffer = await readFileStream(part.file);
  validateBufferMagicNumbers(inputBuffer, part.mimetype);
  const isImage = part.mimetype.startsWith("image/");
  const storedBuffer = isImage ? await optimizeImage(inputBuffer) : inputBuffer;
  const storedMimeType = isImage ? "image/webp" : part.mimetype;
  const key = buildKey(part, folder, isImage ? ".webp" : null);

  if (env.uploadProvider === "s3") {
    const client = createS3Client();
    await client.send(new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: key,
      Body: storedBuffer,
      ContentType: storedMimeType
    }));
  } else if (env.uploadProvider === "local") {
    const root = resolve(env.uploadDir);
    const destination = resolve(root, key);
    if (!destination.startsWith(`${root}${join("", "\\")}`) && !destination.startsWith(`${root}/`)) {
      throw new Error("Invalid upload path");
    }
    await mkdir(resolve(destination, ".."), { recursive: true });
    try {
      await writeFile(destination, storedBuffer);
    } catch (error) {
      await unlink(destination).catch(() => {});
      throw error;
    }
  } else {
    throw new Error(`Unsupported upload provider: ${env.uploadProvider}`);
  }

  const fileRecord = await prisma.file.create({
    data: {
      originalName: safeName(part.filename),
      storageKey: key,
      mimeType: storedMimeType,
      size: storedBuffer.length
    }
  });

  const url = getFilePublicUrl(key);

  return {
    ...fileRecord,
    url
  };
}

export async function replaceFile(folder, part, oldStorageKey) {
  const newFile = await uploadFile(folder, part);
  if (oldStorageKey && oldStorageKey !== newFile.storageKey) {
    await deleteStoredFile(oldStorageKey);
  }
  return newFile;
}
