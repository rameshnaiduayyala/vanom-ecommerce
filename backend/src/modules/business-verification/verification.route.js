import * as controller from "./verification.controller.js";

export default async function routes(app) {
  app.get("/business-verification", controller.list);
  app.get("/business-verification/:id", controller.getById);
  app.post("/business-verification", controller.create);
  app.patch("/business-verification/:id", controller.update);
  app.delete("/business-verification/:id", controller.remove);
}
