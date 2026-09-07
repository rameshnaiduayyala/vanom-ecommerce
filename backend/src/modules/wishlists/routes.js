import { WishlistController } from "./controller.js";

export default async function wishlistRoutes(fastify, options) {
  const controller = new WishlistController();

  fastify.get("/wishlists", {
    preHandler: [fastify.authenticate],
    handler: controller.getWishlist,
  });

  fastify.post("/wishlists/items", {
    preHandler: [fastify.authenticate],
    handler: controller.addItem,
  });

  fastify.delete("/wishlists/items/:productId", {
    preHandler: [fastify.authenticate],
    handler: controller.removeItem,
  });
}
