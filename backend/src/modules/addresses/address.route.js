import * as controller from "./address.controller.js";

export default async function routes(app) {
  app.get("/addresses", controller.list);
  app.get("/addresses/:id", controller.getById);
  app.post("/addresses", controller.create);
  app.patch("/addresses/:id", controller.update);
  app.delete("/addresses/:id", controller.remove);
}
