import * as controller from "./customer-group.controller.js";

export default async function routes(app) {
  app.get("/customer-groups", controller.list);
  app.get("/customer-groups/:id", controller.getById);
  app.post("/customer-groups", controller.create);
  app.patch("/customer-groups/:id", controller.update);
  app.delete("/customer-groups/:id", controller.remove);
}
