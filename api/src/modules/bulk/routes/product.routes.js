import * as controller from "../controllers/product.controller.js";
import { authenticate } from "../../../common/guards/auth.guard.js";
import { idParams, pageQuery } from "../schema.js";
import { productBody, updateProductBody } from "../schemas/product.schema.js";
import { adminGuard } from "../lib/guards.js";

export async function productRoutes(fastify) {
  // Public catalog — no auth required
  fastify.get("/bulk/products", {
    schema: { querystring: pageQuery }
  }, controller.list);

  fastify.get("/bulk/products/:id", {
    schema: { params: idParams }
  }, controller.getById);

  // Admin-only product management
  fastify.post("/admin/bulk/products", {
    preHandler: adminGuard,
    schema: { body: productBody }
  }, controller.create);

  fastify.put("/admin/bulk/products/:id", {
    preHandler: adminGuard,
    schema: { params: idParams, body: updateProductBody }
  }, controller.update);

  fastify.delete("/admin/bulk/products/:id", {
    preHandler: adminGuard,
    schema: { params: idParams }
  }, controller.remove);
}
