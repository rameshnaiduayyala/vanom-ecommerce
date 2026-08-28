import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { prisma, disconnectPrisma } from "../../src/infrastructure/database/prisma.js";

describe("Cart, Checkout, Orders & Idempotency Pipeline", () => {
  let app;
  let userToken;
  let user;
  let soilVariant;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();

    // Register test user
    const email = `orderuser_${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email,
        password: "Password123!",
        firstName: "Order",
        lastName: "Tester",
      },
    });
    const regBody = JSON.parse(regRes.payload);
    user = regBody.data.user;
    userToken = regBody.data.tokens.accessToken;

    soilVariant = await prisma.productVariant.findUnique({
      where: { sku: "SOIL-50KG-SACK" },
    });
  });

  afterAll(async () => {
    await app.close();
    await disconnectPrisma();
  });

  it("should add items to cart and calculate dynamic preview", async () => {
    if (!soilVariant) return;

    const addRes = await app.inject({
      method: "POST",
      url: "/api/v1/cart/items",
      headers: {
        authorization: `Bearer ${userToken}`,
        "x-country-code": "IN",
        "x-currency-code": "INR",
      },
      payload: {
        variantId: soilVariant.id,
        quantity: 2,
      },
    });

    expect(addRes.statusCode).toBe(201);
    const body = JSON.parse(addRes.payload);
    expect(body.success).toBe(true);
    expect(body.data.itemCount).toBe(1);
    expect(body.data.items[0].quantity).toBe(2);
  });

  it("should authoritatively validate checkout calculation", async () => {
    if (!soilVariant) return;

    const valRes = await app.inject({
      method: "POST",
      url: "/api/v1/checkout/validate",
      headers: {
        authorization: `Bearer ${userToken}`,
        "x-country-code": "IN",
        "x-currency-code": "INR",
      },
      payload: {
        items: [{ variantId: soilVariant.id, quantity: 2 }],
        shippingAddress: {
          line1: "123 Green Lane",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001",
        },
      },
    });

    expect(valRes.statusCode).toBe(200);
    const body = JSON.parse(valRes.payload);
    expect(body.success).toBe(true);
    expect(Number(body.data.subtotal)).toBe(998); // 2 * 499
    expect(body.data.taxAmount).toBeDefined();
    expect(body.data.totalAmount).toBeDefined();
  });

  let createdOrder;
  const idempotencyKey = `idem_${Date.now()}_abc123`;

  it("should atomically place an order and create inventory reservation", async () => {
    if (!soilVariant) return;

    const orderRes = await app.inject({
      method: "POST",
      url: "/api/v1/checkout/place-order",
      headers: {
        authorization: `Bearer ${userToken}`,
        "idempotency-key": idempotencyKey,
        "x-country-code": "IN",
        "x-currency-code": "INR",
      },
      payload: {
        items: [{ variantId: soilVariant.id, quantity: 2 }],
        shippingAddress: {
          line1: "123 Green Lane",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001",
        },
      },
    });

    expect(orderRes.statusCode).toBe(201);
    const body = JSON.parse(orderRes.payload);
    expect(body.success).toBe(true);
    expect(body.data.orderNumber).toMatch(/^ORD-/);
    createdOrder = body.data;

    // Check inventory reservation in DB
    const reservation = await prisma.inventoryReservation.findFirst({
      where: { orderId: createdOrder.id },
    });
    expect(reservation).toBeDefined();
    expect(reservation.quantity).toBe(2);
    expect(reservation.status).toBe("ACTIVE");
  });

  it("should return cached response on duplicate request with same Idempotency-Key without creating duplicate order", async () => {
    if (!createdOrder) return;

    const dupRes = await app.inject({
      method: "POST",
      url: "/api/v1/checkout/place-order",
      headers: {
        authorization: `Bearer ${userToken}`,
        "idempotency-key": idempotencyKey,
        "x-country-code": "IN",
        "x-currency-code": "INR",
      },
      payload: {
        items: [{ variantId: soilVariant.id, quantity: 2 }],
      },
    });

    expect(dupRes.statusCode).toBe(201);
    const body = JSON.parse(dupRes.payload);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdOrder.id); // Same order returned!
    expect(dupRes.headers["x-cache-lookup"]).toBe("HIT-IDEMPOTENT");

    // Total orders count for this user should still be exactly 1
    const userOrderCount = await prisma.order.count({ where: { userId: user.id } });
    expect(userOrderCount).toBe(1);
  });

  it("should cancel order and release inventory reservation", async () => {
    if (!createdOrder) return;

    const cancelRes = await app.inject({
      method: "POST",
      url: `/api/v1/orders/${createdOrder.id}/cancel`,
      headers: { authorization: `Bearer ${userToken}` },
      payload: { reason: "Changed my mind" },
    });

    expect(cancelRes.statusCode).toBe(200);
    const body = JSON.parse(cancelRes.payload);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("CANCELLED");

    // Check reservation status changed to RELEASED
    const reservation = await prisma.inventoryReservation.findFirst({
      where: { orderId: createdOrder.id },
    });
    expect(reservation.status).toBe("RELEASED");
  });
});
