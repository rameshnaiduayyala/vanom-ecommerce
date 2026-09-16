import { businessRoutes } from "./business.routes.js";
import { productRoutes } from "./product.routes.js";
import { cartRoutes } from "./cart.routes.js";
import { orderRoutes } from "./order.routes.js";
import { addressRoutes } from "./address.routes.js";
import { adminRoutes } from "./admin.routes.js";

export async function bulkRoutes(fastify) {
  await fastify.register(businessRoutes);
  await fastify.register(productRoutes);
  await fastify.register(cartRoutes);
  await fastify.register(orderRoutes);
  await fastify.register(addressRoutes);
  await fastify.register(adminRoutes);
}
