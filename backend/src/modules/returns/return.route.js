import * as controller from "./return.controller.js";

export default async function routes(app) {
  app.get("/returns", controller.list);
  app.get("/returns/:id", controller.getById);
  app.post("/returns", controller.create);
  app.patch("/returns/:id", controller.update);
  app.delete("/returns/:id", controller.remove);
}
