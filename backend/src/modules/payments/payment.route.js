import * as controller from "./payment.controller.js";

export default async function routes(app) {
  app.get("/payments", controller.list);
  app.get("/payments/:id", controller.getById);
  app.post("/payments", controller.create);
  app.patch("/payments/:id", controller.update);
  app.delete("/payments/:id", controller.remove);
}
