import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { env } from "../config/env.js";
import { uploadFile } from "../common/utils/file-upload.js";

export async function registerUploadPlugin(fastify) {
  await fastify.register(multipart, {
    limits: {
      fileSize: env.uploadMaxFileSize,
      files: 1
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

  fastify.decorate("uploadFile", (folder, part) => uploadFile(folder, part));
}
