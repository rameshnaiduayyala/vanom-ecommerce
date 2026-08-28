import * as controller from "./document.controller.js";

export default async function routes(app) {
  app.get("/business-documents", controller.list);
  app.get("/business-documents/:id", controller.getById);
  app.post("/business-documents", controller.create);
  app.patch("/business-documents/:id", controller.update);
  app.delete("/business-documents/:id", controller.remove);
}
