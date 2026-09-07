import { ReviewService } from "./service.js";

export class ReviewController {
  constructor(service = new ReviewService()) {
    this.service = service;
  }

  listByProduct = async (req, reply) => {
    const data = await this.service.listByProduct(req.params.productId, req.query);
    return reply.send({ success: true, ...data });
  };

  create = async (req, reply) => {
    const data = await this.service.createReview({
      ...req.body,
      userId: req.user.id,
    });
    return reply.status(201).send({ success: true, data });
  };
}
