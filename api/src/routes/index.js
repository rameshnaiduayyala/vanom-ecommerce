import { productRoutes } from "../modules/products/product.routes.js";
import { userRoutes } from "../modules/users/user.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { categoryRoutes } from "../modules/categories/category.routes.js";
import { brandRoutes } from "../modules/brands/brand.routes.js";
import { cartRoutes } from "../modules/carts/cart.routes.js";
import { orderRoutes } from "../modules/orders/order.routes.js";
import { currencyRoutes } from "../modules/currencies/currency.routes.js";
import { countryRoutes } from "../modules/countries/country.routes.js";
import { couponRoutes } from "../modules/coupons/coupon.routes.js";
import { pricingRoutes } from "../modules/pricing/pricing.routes.js";
import { reviewRoutes } from "../modules/reviews/review.routes.js";
import { bulkRoutes } from "../modules/bulk/routes/index.js";
import { adminRoutes } from "../modules/admin/admin.routes.js";
import { uploadRoutes } from "../modules/upload/upload.routes.js";
import { invoiceRoutes } from "../modules/invoice/invoice.routes.js";
import { storeRoutes } from "../modules/store/store.routes.js";
import { contactRoutes } from "../modules/contact/contact.routes.js";
import { paymentRoutes } from "../modules/payments/payment.routes.js";

export async function registerRoutes(fastify) {
  await fastify.register(paymentRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(uploadRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(invoiceRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(storeRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(contactRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(productRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(userRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(authRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(categoryRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(brandRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(cartRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(orderRoutes, {
    prefix: "/api/v1"
  });
  await fastify.register(currencyRoutes, { prefix: "/api/v1" });
  await fastify.register(countryRoutes, { prefix: "/api/v1" });
  await fastify.register(couponRoutes, { prefix: "/api/v1" });
  await fastify.register(pricingRoutes, { prefix: "/api/v1" });
  await fastify.register(reviewRoutes, { prefix: "/api/v1" });
  await fastify.register(bulkRoutes, { prefix: "/api/v1" });
  await fastify.register(adminRoutes, { prefix: "/api/v1" });
}
