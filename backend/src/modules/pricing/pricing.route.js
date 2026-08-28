import * as controller from "./pricing.controller.js";

export default async function routes(app) {
  app.get("/pricing", controller.list);
  app.get("/pricing/:id", controller.getById);
  app.post("/pricing", controller.create);
  app.patch("/pricing/:id", controller.update);
  app.delete("/pricing/:id", controller.remove);
}
