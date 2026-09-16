import * as controller from "../controllers/product.controller.js";
import { authenticate, authorize } from "../../../common/guards/auth.guard.js";
import { pageQuery, productBody, idParams } from "../schema.js";

const admin = [authenticate, authorize("SUPERADMIN")];
export async function productRoutes(fastify) {
  fastify.get("/bulk/products", { schema: { querystring: pageQuery } }, controller.list);
  fastify.get("/bulk/products/:id", { schema: { params: idParams } }, controller.getById);
  fastify.post("/admin/bulk/products", { preHandler: admin, schema: { body: productBody } }, controller.create);
  fastify.put("/admin/bulk/products/:id", { preHandler: admin, schema: { params: idParams, body: { ...productBody, required: [], minProperties: 1 } } }, controller.update);
  fastify.delete("/admin/bulk/products/:id", { preHandler: admin, schema: { params: idParams } }, controller.remove);
}
