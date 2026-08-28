import * as controller from "./report.controller.js";

export default async function routes(app) {
  app.get("/reports", controller.list);
  app.get("/reports/:id", controller.getById);
  app.post("/reports", controller.create);
  app.patch("/reports/:id", controller.update);
  app.delete("/reports/:id", controller.remove);
}
