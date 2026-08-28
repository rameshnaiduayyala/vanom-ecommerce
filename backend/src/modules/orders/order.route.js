import * as controller from "./order.controller.js";

export default async function routes(app) {
  app.get("/orders", controller.list);
  app.get("/orders/:id", controller.getById);
  app.post("/orders", controller.create);
  app.patch("/orders/:id", controller.update);
  app.delete("/orders/:id", controller.remove);
}
