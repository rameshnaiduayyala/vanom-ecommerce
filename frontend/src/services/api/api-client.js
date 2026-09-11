import { authService } from "./auth.service.js";
import { catalogService } from "./catalog.service.js";
import { cartService, orderService } from "./cart.service.js";
import { b2bService } from "./b2b.service.js";
import { adminService } from "./admin.service.js";
import { bannerService } from "./banner.service.js";
import { geographyService } from "./geography.service.js";
import { taxService } from "./tax.service.js";

export { authService } from "./auth.service.js";
export { catalogService } from "./catalog.service.js";
export { cartService, orderService } from "./cart.service.js";
export { b2bService } from "./b2b.service.js";
export { adminService } from "./admin.service.js";
export { bannerService } from "./banner.service.js";
export { geographyService } from "./geography.service.js";
export { taxService } from "./tax.service.js";

export const Api = {
  auth: authService,
  catalog: catalogService,
  cart: cartService,
  orders: orderService,
  b2b: b2bService,
  admin: adminService,
  banners: bannerService,
  geography: geographyService,
  tax: taxService,
};

export default Api;
