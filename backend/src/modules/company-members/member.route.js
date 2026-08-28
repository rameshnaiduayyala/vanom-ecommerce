import * as controller from "./member.controller.js";

export default async function routes(app) {
  app.get("/company-members", controller.list);
  app.get("/company-members/:id", controller.getById);
  app.post("/company-members", controller.create);
  app.patch("/company-members/:id", controller.update);
  app.delete("/company-members/:id", controller.remove);
}
