import * as controller from "./tax.controller.js";

export default async function routes(app) {
  app.get("/tax", controller.list);
  app.get("/tax/:id", controller.getById);
  app.post("/tax", controller.create);
  app.patch("/tax/:id", controller.update);
  app.delete("/tax/:id", controller.remove);
}
