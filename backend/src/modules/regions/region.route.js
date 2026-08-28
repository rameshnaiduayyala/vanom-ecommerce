import * as controller from "./region.controller.js";

export default async function routes(app) {
  app.get("/regions", controller.list);
  app.get("/regions/:id", controller.getById);
  app.post("/regions", controller.create);
  app.patch("/regions/:id", controller.update);
  app.delete("/regions/:id", controller.remove);
}
