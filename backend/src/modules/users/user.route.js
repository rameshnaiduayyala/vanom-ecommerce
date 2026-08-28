import * as controller from "./user.controller.js";

export default async function routes(app) {
  app.get("/users", controller.list);
  app.get("/users/:id", controller.getById);
  app.post("/users", controller.create);
  app.patch("/users/:id", controller.update);
  app.delete("/users/:id", controller.remove);
}
