import * as controller from "./brand.controller.js";

export default async function routes(app) {
  app.get("/brands", controller.list);
  app.get("/brands/:id", controller.getById);
  app.post("/brands", controller.create);
  app.patch("/brands/:id", controller.update);
  app.delete("/brands/:id", controller.remove);
}
