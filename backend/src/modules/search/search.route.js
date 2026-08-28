import * as controller from "./search.controller.js";

export default async function routes(app) {
  app.get("/search", controller.list);
  app.get("/search/:id", controller.getById);
  app.post("/search", controller.create);
  app.patch("/search/:id", controller.update);
  app.delete("/search/:id", controller.remove);
}
