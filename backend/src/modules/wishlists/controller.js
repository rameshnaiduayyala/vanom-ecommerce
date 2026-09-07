import { WishlistService } from "./service.js";

export class WishlistController {
  constructor(service = new WishlistService()) {
    this.service = service;
  }

  getWishlist = async (req, reply) => {
    const data = await this.service.getOrCreateWishlist(req.user.id);
    return reply.send({ success: true, data });
  };

  addItem = async (req, reply) => {
    const data = await this.service.addItem(req.user.id, req.body?.productId);
    return reply.status(201).send({ success: true, data });
  };

  removeItem = async (req, reply) => {
    await this.service.removeItem(req.user.id, req.params.productId);
    return reply.send({ success: true, message: "Item removed from wishlist" });
  };
}
