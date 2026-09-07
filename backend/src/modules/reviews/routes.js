import { ReviewController } from "./controller.js";

export default async function reviewRoutes(fastify, options) {
  const controller = new ReviewController();

  fastify.get("/reviews/product/:productId", controller.listByProduct);

  fastify.post("/reviews", {
    preHandler: [fastify.authenticate],
    handler: controller.create,
  });
}
