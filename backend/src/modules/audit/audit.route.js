import * as controller from "./audit.controller.js";

export default async function routes(app) {
  app.get("/audit", controller.list);
  app.get("/audit/:id", controller.getById);
  app.post("/audit", controller.create);
  app.patch("/audit/:id", controller.update);
  app.delete("/audit/:id", controller.remove);
}
