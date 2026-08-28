import * as controller from "./company.controller.js";

export default async function routes(app) {
  app.get("/companies", controller.list);
  app.get("/companies/:id", controller.getById);
  app.post("/companies", controller.create);
  app.patch("/companies/:id", controller.update);
  app.delete("/companies/:id", controller.remove);
}
