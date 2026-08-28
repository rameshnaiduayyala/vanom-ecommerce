import * as controller from "./checkout.controller.js";

export default async function routes(app) {
  app.get("/checkout", controller.list);
  app.get("/checkout/:id", controller.getById);
  app.post("/checkout", controller.create);
  app.patch("/checkout/:id", controller.update);
  app.delete("/checkout/:id", controller.remove);
}
