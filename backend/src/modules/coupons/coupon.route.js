import * as controller from "./coupon.controller.js";

export default async function routes(app) {
  app.get("/coupons", controller.list);
  app.get("/coupons/:id", controller.getById);
  app.post("/coupons", controller.create);
  app.patch("/coupons/:id", controller.update);
  app.delete("/coupons/:id", controller.remove);
}
