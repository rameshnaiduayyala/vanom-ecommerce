import * as controller from "./product-attribute.controller.js";

export default async function routes(app) {
  app.get("/product-attributes", controller.list);
  app.get("/product-attributes/:id", controller.getById);
  app.post("/product-attributes", controller.create);
  app.patch("/product-attributes/:id", controller.update);
  app.delete("/product-attributes/:id", controller.remove);
}
