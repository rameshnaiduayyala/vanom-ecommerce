import * as controller from "./auth.controller.js";

export default async function routes(app) {
  app.get("/auth", controller.list);
  app.get("/auth/:id", controller.getById);
  app.post("/auth", controller.create);
  app.patch("/auth/:id", controller.update);
  app.delete("/auth/:id", controller.remove);
}
