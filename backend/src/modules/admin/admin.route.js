import * as controller from "./admin.controller.js";

export default async function routes(app) {
  app.get("/admin", controller.list);
  app.get("/admin/:id", controller.getById);
  app.post("/admin", controller.create);
  app.patch("/admin/:id", controller.update);
  app.delete("/admin/:id", controller.remove);
}
