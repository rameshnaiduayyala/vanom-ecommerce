import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { prisma, disconnectPrisma } from "../../src/infrastructure/database/prisma.js";

describe("Payment & Webhook Processing Integration Tests", () => {
  let app;
  let userToken;
  let testOrder;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();

    const email = `payuser_${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email,
        password: "Password123!",
        firstName: "Pay",
        lastName: "Tester",
      },
    });
    const regBody = JSON.parse(regRes.payload);
    userToken = regBody.data.tokens.accessToken;

    const inCountry = await prisma.country.findUnique({ where: { code: "IN" } });
    const inr = await prisma.currency.findUnique({ where: { code: "INR" } });

    // Create test order
    testOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-TESTPAY`,
        userId: regBody.data.user.id,
        customerType: "B2C",
        source: "WEB",
        status: "PENDING_PAYMENT",
        countryId: inCountry.id,
        currencyId: inr.id,
        subtotal: 500,
        totalAmount: 590,
        billingAddress: {},
        shippingAddress: {},
        customerSnapshot: {},
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await disconnectPrisma();
  });

  let createdPaymentId;

  it("should create a payment intent via provider abstraction", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/payments/create",
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        orderId: testOrder.id,
        provider: "RAZORPAY",
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.paymentId).toBeDefined();
    expect(body.data.providerPaymentId).toBeDefined();
    createdPaymentId = body.data.paymentId;
  });

  it("should capture payment and update order status to PAID", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/payments/${createdPaymentId}/capture`,
      headers: { authorization: `Bearer ${userToken}` },
      payload: { amount: 590 },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);

    const order = await prisma.order.findUnique({ where: { id: testOrder.id } });
    expect(order.status).toBe("PAID");
  });

  it("should handle webhook event idempotently", async () => {
    const webhookId = `evt_webhook_${Date.now()}`;
    const webhookPayload = {
      provider: "RAZORPAY",
      externalEventId: webhookId,
      eventType: "payment.captured",
      payload: { id: `mock_provider_id_${Date.now()}` },
    };

    // First delivery
    const firstRes = await app.inject({
      method: "POST",
      url: "/api/v1/payments/webhook",
      payload: webhookPayload,
    });
    expect(firstRes.statusCode).toBe(200);
    const firstBody = JSON.parse(firstRes.payload);
    expect(firstBody.data.status).toBe("PROCESSED");

    // Second duplicate delivery
    const dupRes = await app.inject({
      method: "POST",
      url: "/api/v1/payments/webhook",
      payload: webhookPayload,
    });
    expect(dupRes.statusCode).toBe(200);
    const dupBody = JSON.parse(dupRes.payload);
    expect(dupBody.data.duplicate).toBe(true);
  });
});
