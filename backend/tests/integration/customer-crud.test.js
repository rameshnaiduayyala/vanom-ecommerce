import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { prisma, disconnectPrisma } from "../../src/infrastructure/database/prisma.js";

describe("B2C Customer Profile & Addresses CRUD Integration Tests", () => {
  let app;
  let b2cUser;
  let b2cToken;
  let addressId;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();

    // Register a distinct B2C customer
    const email = `b2c_shopper_${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email,
        password: "SecurePassword123!",
        firstName: "Aarav",
        lastName: "Patel",
        customerType: "B2C",
      },
    });

    const body = JSON.parse(regRes.payload);
    b2cUser = body.data.user;
    b2cToken = body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await disconnectPrisma();
  });

  it("should get and update customer profile", async () => {
    // 1. Get initial profile
    const getRes = await app.inject({
      method: "GET",
      url: "/api/v1/customers/profile",
      headers: { authorization: `Bearer ${b2cToken}` },
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = JSON.parse(getRes.payload);
    expect(getBody.success).toBe(true);

    // 2. Update profile
    const updateRes = await app.inject({
      method: "PATCH",
      url: "/api/v1/customers/profile",
      headers: { authorization: `Bearer ${b2cToken}` },
      payload: {
        firstName: "Aarav Kumar",
        preferredLocale: "en-IN",
        preferredCurrency: "INR",
        marketingOptIn: true,
      },
    });

    expect(updateRes.statusCode).toBe(200);
    const updateBody = JSON.parse(updateRes.payload);
    expect(updateBody.success).toBe(true);
    expect(updateBody.data.user.firstName).toBe("Aarav Kumar");
    expect(updateBody.data.preferredCurrency).toBe("INR");
    expect(updateBody.data.marketingOptIn).toBe(true);
  });

  it("should add a new customer shipping address", async () => {
    const addRes = await app.inject({
      method: "POST",
      url: "/api/v1/customers/addresses",
      headers: { authorization: `Bearer ${b2cToken}` },
      payload: {
        name: "Home Delivery",
        line1: "Flat 402, Lotus Towers",
        line2: "MG Road, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560038",
        countryCode: "IN",
        phone: "+919876543210",
        type: "SHIPPING",
        isDefault: true,
      },
    });

    expect(addRes.statusCode).toBe(201);
    const body = JSON.parse(addRes.payload);
    expect(body.success).toBe(true);
    expect(body.data.city).toBe("Bengaluru");
    expect(body.data.isDefault).toBe(true);
    addressId = body.data.id;
  });

  it("should get addresses and address by id", async () => {
    // List addresses
    const listRes = await app.inject({
      method: "GET",
      url: "/api/v1/customers/addresses",
      headers: { authorization: `Bearer ${b2cToken}` },
    });
    expect(listRes.statusCode).toBe(200);
    const listBody = JSON.parse(listRes.payload);
    expect(listBody.data.length).toBeGreaterThanOrEqual(1);

    // Get specific address
    const getRes = await app.inject({
      method: "GET",
      url: `/api/v1/customers/addresses/${addressId}`,
      headers: { authorization: `Bearer ${b2cToken}` },
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = JSON.parse(getRes.payload);
    expect(getBody.data.line1).toBe("Flat 402, Lotus Towers");
  });

  it("should update existing customer address", async () => {
    const updateRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/customers/addresses/${addressId}`,
      headers: { authorization: `Bearer ${b2cToken}` },
      payload: {
        line2: "Near Metro Station, Indiranagar",
      },
    });

    expect(updateRes.statusCode).toBe(200);
    const body = JSON.parse(updateRes.payload);
    expect(body.data.line2).toBe("Near Metro Station, Indiranagar");
  });

  it("should delete customer address", async () => {
    const delRes = await app.inject({
      method: "DELETE",
      url: `/api/v1/customers/addresses/${addressId}`,
      headers: { authorization: `Bearer ${b2cToken}` },
    });

    expect(delRes.statusCode).toBe(200);
    const body = JSON.parse(delRes.payload);
    expect(body.success).toBe(true);

    // Verify deleted
    const verifyRes = await app.inject({
      method: "GET",
      url: `/api/v1/customers/addresses/${addressId}`,
      headers: { authorization: `Bearer ${b2cToken}` },
    });
    expect(verifyRes.statusCode).toBe(404);
  });
});
