import * as controller from "./product.controller.js";

export default async function routes(app) {
  app.get("/products", controller.list);
  app.get("/products/:id", controller.getById);
  app.post("/products", controller.create);
  app.patch("/products/:id", controller.update);
  app.delete("/products/:id", controller.remove);
}
