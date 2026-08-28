import * as controller from "./review.controller.js";

export default async function routes(app) {
  app.get("/reviews", controller.list);
  app.get("/reviews/:id", controller.getById);
  app.post("/reviews", controller.create);
  app.patch("/reviews/:id", controller.update);
  app.delete("/reviews/:id", controller.remove);
}
