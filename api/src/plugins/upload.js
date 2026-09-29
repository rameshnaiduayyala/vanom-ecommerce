import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { env } from "../config/env.js";
import { uploadFile, getFilePublicUrl, deleteStoredFile, replaceFile } from "../common/utils/file-upload.js";

export async function registerUploadPlugin(fastify) {
  await fastify.register(multipart, {
    limits: {
      fileSize: env.uploadMaxFileSize,
      files: 10
    }
  });

  if (env.uploadProvider === "local") {
    const uploadRoot = resolve(env.uploadDir);
    await mkdir(uploadRoot, { recursive: true });
    await fastify.register(fastifyStatic, {
      root: uploadRoot,
      prefix: "/static/",
      decorateReply: false
    });
  }

  await fastify.register(fastifyStatic, {
    root: resolve(env.assetDir),
    prefix: "/assets/",
    decorateReply: false
  });

  // Reusable fastify decoration for direct programmatic uploads from any controller/service
  fastify.decorate("uploadFile", (folder, part) => uploadFile(folder, part));
  fastify.decorate("getFilePublicUrl", (storageKey) => getFilePublicUrl(storageKey));
  fastify.decorate("deleteStoredFile", (storageKey) => deleteStoredFile(storageKey));
  fastify.decorate("replaceFile", (folder, part, oldKey) => replaceFile(folder, part, oldKey));
}
