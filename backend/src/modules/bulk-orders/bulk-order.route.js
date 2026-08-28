import * as controller from "./bulk-order.controller.js";

export default async function routes(app) {
  app.get("/bulk-orders", controller.list);
  app.get("/bulk-orders/:id", controller.getById);
  app.post("/bulk-orders", controller.create);
  app.patch("/bulk-orders/:id", controller.update);
  app.delete("/bulk-orders/:id", controller.remove);
}
