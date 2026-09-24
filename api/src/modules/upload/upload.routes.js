import * as uploadController from "./upload.controller.js";

export async function uploadRoutes(fastify) {
  fastify.post("/uploads", {
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
}
