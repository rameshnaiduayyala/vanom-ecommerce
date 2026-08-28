import * as controller from "./notification.controller.js";

export default async function routes(app) {
  app.get("/notifications", controller.list);
  app.get("/notifications/:id", controller.getById);
  app.post("/notifications", controller.create);
  app.patch("/notifications/:id", controller.update);
  app.delete("/notifications/:id", controller.remove);
}
