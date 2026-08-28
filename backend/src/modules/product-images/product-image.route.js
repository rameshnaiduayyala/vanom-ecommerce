import * as controller from "./product-image.controller.js";

export default async function routes(app) {
  app.get("/product-images", controller.list);
  app.get("/product-images/:id", controller.getById);
  app.post("/product-images", controller.create);
  app.patch("/product-images/:id", controller.update);
  app.delete("/product-images/:id", controller.remove);
}
