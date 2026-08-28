import * as controller from "./refund.controller.js";

export default async function routes(app) {
  app.get("/refunds", controller.list);
  app.get("/refunds/:id", controller.getById);
  app.post("/refunds", controller.create);
  app.patch("/refunds/:id", controller.update);
  app.delete("/refunds/:id", controller.remove);
}
