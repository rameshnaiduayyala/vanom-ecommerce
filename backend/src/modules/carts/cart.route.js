import * as controller from "./cart.controller.js";

export default async function routes(app) {
  app.get("/carts", controller.list);
  app.get("/carts/:id", controller.getById);
  app.post("/carts", controller.create);
  app.patch("/carts/:id", controller.update);
  app.delete("/carts/:id", controller.remove);
}
