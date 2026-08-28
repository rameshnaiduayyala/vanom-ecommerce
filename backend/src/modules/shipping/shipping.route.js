import * as controller from "./shipping.controller.js";

export default async function routes(app) {
  app.get("/shipping", controller.list);
  app.get("/shipping/:id", controller.getById);
  app.post("/shipping", controller.create);
  app.patch("/shipping/:id", controller.update);
  app.delete("/shipping/:id", controller.remove);
}
