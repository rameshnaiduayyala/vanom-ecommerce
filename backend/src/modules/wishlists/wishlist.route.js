import * as controller from "./wishlist.controller.js";

export default async function routes(app) {
  app.get("/wishlists", controller.list);
  app.get("/wishlists/:id", controller.getById);
  app.post("/wishlists", controller.create);
  app.patch("/wishlists/:id", controller.update);
  app.delete("/wishlists/:id", controller.remove);
}
