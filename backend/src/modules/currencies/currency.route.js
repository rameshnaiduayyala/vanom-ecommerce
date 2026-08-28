import * as controller from "./currency.controller.js";

export default async function routes(app) {
  app.get("/currencies", controller.list);
  app.get("/currencies/:id", controller.getById);
  app.post("/currencies", controller.create);
  app.patch("/currencies/:id", controller.update);
  app.delete("/currencies/:id", controller.remove);
}
