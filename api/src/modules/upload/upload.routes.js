import * as uploadController from "./upload.controller.js";
import { authenticate } from "../../common/guards/auth.guard.js";

export async function uploadRoutes(fastify) {
  fastify.post("/uploads", {
    preHandler: authenticate,
    schema: {
      tags: ["Uploads"],
      summary: "Upload a single file (returns direct public URL)",
      querystring: {
        type: "object",
        properties: {
          folder: {
            type: "string",
            default: "general",
            description: "Target subfolder e.g. products, categories, banners, brands, avatars"
          }
        }
      }
    }
  }, uploadController.uploadSingle);

  fastify.post("/uploads/multiple", {
    preHandler: authenticate,
    schema: {
      tags: ["Uploads"],
      summary: "Upload multiple files (returns array of direct public URLs)",
      querystring: {
        type: "object",
        properties: {
          folder: {
            type: "string",
            default: "general"
          }
        }
      }
    }
  }, uploadController.uploadMultiple);

  // Admin File Management (AWS S3 & Cloud Storage)
  fastify.get("/admin/files", {
    preHandler: authenticate,
    schema: {
      tags: ["Uploads"],
      summary: "List all files in AWS S3 with pagination and folder filtering"
    }
  }, uploadController.listFiles);

  fastify.get("/admin/files/stats", {
    preHandler: authenticate,
    schema: {
      tags: ["Uploads"],
      summary: "Get AWS S3 / storage stats"
    }
  }, uploadController.getFileStats);

  fastify.delete("/admin/files/:id", {
    preHandler: authenticate,
    schema: {
      tags: ["Uploads"],
      summary: "Delete a file from AWS S3 and database"
    }
  }, uploadController.deleteFile);
}
