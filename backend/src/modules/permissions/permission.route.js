import * as controller from "./permission.controller.js";

export default async function routes(app) {
  app.get("/permissions", controller.list);
  app.get("/permissions/:id", controller.getById);
  app.post("/permissions", controller.create);
  app.patch("/permissions/:id", controller.update);
  app.delete("/permissions/:id", controller.remove);
}
