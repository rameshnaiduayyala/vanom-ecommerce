import * as controller from "./quote.controller.js";

export default async function routes(app) {
  app.get("/quotes", controller.list);
  app.get("/quotes/:id", controller.getById);
  app.post("/quotes", controller.create);
  app.patch("/quotes/:id", controller.update);
  app.delete("/quotes/:id", controller.remove);
}
