import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { prisma, disconnectPrisma } from "../../src/infrastructure/database/prisma.js";

describe("Product Catalog CRUD Integration Tests", () => {
  let app;
  let adminUser;
  let adminToken;
  let createdProductId;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();

    // Fetch Admin user and sign token with SUPER_ADMIN role / catalog permissions
    adminUser = await prisma.user.findUnique({
      where: { email: "admin@vanom.com" },
      include: { roles: { include: { role: true } } },
    });

    if (adminUser) {
      adminToken = app.jwt.sign({
        userId: adminUser.id,
        email: adminUser.email,
        roles: ["SUPER_ADMIN"],
      });
    }
  });

  afterAll(async () => {
    // Cleanup created test product if exists
    if (createdProductId) {
      await prisma.product.deleteMany({ where: { id: createdProductId } });
    }
    await app.close();
    await disconnectPrisma();
  });

  it("should list products publicly without authentication", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/products?limit=5",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("should create a new product with admin credentials", async () => {
    if (!adminToken) return;

    const slug = `test-product-${Date.now()}`;
    const sku = `SKU-TEST-${Date.now()}`;

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/products",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        name: "Eco-Friendly Organic Compost 25kg",
        slug,
        sku,
        description: "High quality enriched compost for farming and gardens.",
        status: "ACTIVE",
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Eco-Friendly Organic Compost 25kg");
    expect(body.data.slug).toBe(slug);
    createdProductId = body.data.id;
  });

  it("should get product by ID or slug with contextual pricing", async () => {
    if (!createdProductId) return;

    const res = await app.inject({
      method: "GET",
      url: `/api/v1/products/${createdProductId}`,
      headers: {
        "x-country-code": "IN",
        "x-currency-code": "INR",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdProductId);
    expect(body.data.name).toBe("Eco-Friendly Organic Compost 25kg");
  });

  it("should update product details", async () => {
    if (!createdProductId || !adminToken) return;

    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/products/${createdProductId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        name: "Eco-Friendly Premium Organic Compost 25kg",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Eco-Friendly Premium Organic Compost 25kg");
  });

  it("should retrieve featured products via /api/v1/products/featured", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/products/featured?limit=5",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("should retrieve best-selling products via /api/v1/products/best-sellers", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/products/best-sellers?limit=5",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("should soft-delete (archive) product", async () => {
    if (!createdProductId || !adminToken) return;

    const res = await app.inject({
      method: "DELETE",
      url: `/api/v1/products/${createdProductId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("ARCHIVED");
  });
});
