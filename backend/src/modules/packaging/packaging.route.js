import * as controller from "./packaging.controller.js";

export default async function routes(app) {
  app.get("/packaging", controller.list);
  app.get("/packaging/:id", controller.getById);
  app.post("/packaging", controller.create);
  app.patch("/packaging/:id", controller.update);
  app.delete("/packaging/:id", controller.remove);
}
