import * as controller from "./role.controller.js";

export default async function routes(app) {
  app.get("/roles", controller.list);
  app.get("/roles/:id", controller.getById);
  app.post("/roles", controller.create);
  app.patch("/roles/:id", controller.update);
  app.delete("/roles/:id", controller.remove);
}
