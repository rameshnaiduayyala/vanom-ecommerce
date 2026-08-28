import * as controller from "./inventory.controller.js";

export default async function routes(app) {
  app.get("/inventory", controller.list);
  app.get("/inventory/:id", controller.getById);
  app.post("/inventory", controller.create);
  app.patch("/inventory/:id", controller.update);
  app.delete("/inventory/:id", controller.remove);
}
