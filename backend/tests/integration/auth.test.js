import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { disconnectPrisma } from "../../src/infrastructure/database/prisma.js";

describe("Authentication & RBAC Integration Tests", () => {
  let app;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await disconnectPrisma();
  });

  const uniqueEmail = `testuser_${Date.now()}@example.com`;

  it("should register a new B2C customer", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: uniqueEmail,
        password: "SecretPassword123!",
        firstName: "Test",
        lastName: "Buyer",
        phone: "+919876543210",
        customerType: "B2C",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(uniqueEmail);
    expect(body.data.tokens.accessToken).toBeDefined();
    expect(body.data.tokens.refreshToken).toBeDefined();
    expect(body.data.user.passwordHash).toBeUndefined(); // Security rule: never expose hash
  });

  it("should reject duplicate registration with conflict error", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: uniqueEmail,
        password: "SecretPassword123!",
      },
    });

    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("USER_ALREADY_EXISTS");
  });

  it("should authenticate valid user credentials and return tokens", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: uniqueEmail,
        password: "SecretPassword123!",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data.tokens.accessToken).toBeDefined();
  });

  it("should reject invalid login password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: uniqueEmail,
        password: "WrongPassword!",
      },
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should rotate refresh tokens and return a new token pair", async () => {
    // 1. Login to get refresh token
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: uniqueEmail,
        password: "SecretPassword123!",
      },
    });
    const { tokens } = JSON.parse(loginRes.payload).data;

    // 2. Call refresh
    const refreshRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: {
        refreshToken: tokens.refreshToken,
      },
    });

    expect(refreshRes.statusCode).toBe(200);
    const newTokens = JSON.parse(refreshRes.payload).data.tokens;
    expect(newTokens.accessToken).toBeDefined();
    expect(newTokens.refreshToken).not.toBe(tokens.refreshToken); // Token rotated
  });
});
