import * as controller from "./promotion.controller.js";

export default async function routes(app) {
  app.get("/promotions", controller.list);
  app.get("/promotions/:id", controller.getById);
  app.post("/promotions", controller.create);
  app.patch("/promotions/:id", controller.update);
  app.delete("/promotions/:id", controller.remove);
}
