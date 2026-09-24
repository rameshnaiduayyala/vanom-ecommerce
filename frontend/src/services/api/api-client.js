import { authService } from "./auth.service.js";
import { userService } from "./user.service.js";
import { companyService } from "./company.service.js";
import { catalogService } from "./catalog.service.js";
import { cartService } from "./cart.service.js";
import { orderService } from "./order.service.js";
import { b2bService } from "./b2b.service.js";
import { adminService } from "./admin.service.js";
import { bannerService } from "./banner.service.js";
import { geographyService } from "./geography.service.js";
import { taxService } from "./tax.service.js";
import { paymentService } from "./payment.service.js";
import { reviewService } from "./review.service.js";
import { couponService } from "./coupon.service.js";
import { brandService } from "./brand.service.js";
import { uploadService } from "./upload.service.js";
import { storeService } from "./store.service.js";
import { contactService } from "./contact.service.js";

export { authService } from "./auth.service.js";
export { userService } from "./user.service.js";
export { companyService } from "./company.service.js";
export { catalogService } from "./catalog.service.js";
export { cartService } from "./cart.service.js";
export { orderService } from "./order.service.js";
export { b2bService } from "./b2b.service.js";
export { adminService } from "./admin.service.js";
export { bannerService } from "./banner.service.js";
export { geographyService } from "./geography.service.js";
export { taxService } from "./tax.service.js";
export { paymentService } from "./payment.service.js";
export { reviewService } from "./review.service.js";
export { couponService } from "./coupon.service.js";
export { brandService } from "./brand.service.js";
export { uploadService } from "./upload.service.js";
export { storeService } from "./store.service.js";
export { contactService } from "./contact.service.js";

export const Api = {
  auth: authService,
  user: userService,
  company: companyService,
  catalog: catalogService,
  cart: cartService,
  orders: orderService,
  b2b: b2bService,
  admin: adminService,
  banners: bannerService,
  geography: geographyService,
  tax: taxService,
  payments: paymentService,
  reviews: reviewService,
  coupons: couponService,
  brands: brandService,
  upload: uploadService,
  store: storeService,
  contact: contactService,
};
