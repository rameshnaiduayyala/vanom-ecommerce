import * as controller from "./customer.controller.js";

export default async function routes(app) {
  app.get("/customers", controller.list);
  app.get("/customers/:id", controller.getById);
  app.post("/customers", controller.create);
  app.patch("/customers/:id", controller.update);
  app.delete("/customers/:id", controller.remove);
}
