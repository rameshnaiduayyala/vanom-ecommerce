import * as controller from "./category.controller.js";

export default async function routes(app) {
  app.get("/categories", controller.list);
  app.get("/categories/:id", controller.getById);
  app.post("/categories", controller.create);
  app.patch("/categories/:id", controller.update);
  app.delete("/categories/:id", controller.remove);
}
