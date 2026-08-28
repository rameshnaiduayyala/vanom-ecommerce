import * as controller from "./invoice.controller.js";

export default async function routes(app) {
  app.get("/invoices", controller.list);
  app.get("/invoices/:id", controller.getById);
  app.post("/invoices", controller.create);
  app.patch("/invoices/:id", controller.update);
  app.delete("/invoices/:id", controller.remove);
}
