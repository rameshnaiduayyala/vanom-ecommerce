import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { prisma, disconnectPrisma } from "../../src/infrastructure/database/prisma.js";

describe("Banner & Promotional Carousel Integration Tests", () => {
  let app;
  let adminUser;
  let adminToken;
  let createdBannerId;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();

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
    if (createdBannerId) {
      await prisma.banner.deleteMany({ where: { id: createdBannerId } });
    }
    await app.close();
    await disconnectPrisma();
  });

  it("should list active banners publicly without auth", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/banners",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("should filter banners by type (HERO_CAROUSEL)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/banners?type=HERO_CAROUSEL",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    body.data.forEach((banner) => {
      expect(banner.type).toBe("HERO_CAROUSEL");
    });
  });

  it("should create a new promotional banner with Admin credentials", async () => {
    if (!adminToken) return;

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/banners",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        title: "Exclusive Spring Garden Harvest",
        subtitle: "Seasonal Clearance",
        description: "Up to 30% savings on commercial potting soils, tools and drip irrigation sets.",
        type: "PROMOTIONAL",
        imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        buttonText: "Shop Spring Deals",
        buttonLink: "/products?category=gardening-supplies",
        badgeText: "Spring Special",
        bgGradient: "from-green-800 to-emerald-950",
        sortOrder: 1,
        active: true,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe("Exclusive Spring Garden Harvest");
    expect(body.data.buttonText).toBe("Shop Spring Deals");
    expect(body.data.buttonLink).toBe("/products?category=gardening-supplies");
    createdBannerId = body.data.id;
  });

  it("should get banner by id", async () => {
    if (!createdBannerId) return;

    const res = await app.inject({
      method: "GET",
      url: `/api/v1/banners/${createdBannerId}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdBannerId);
  });

  it("should update banner with Admin credentials", async () => {
    if (!createdBannerId || !adminToken) return;

    const res = await app.inject({
      method: "PUT",
      url: `/api/v1/banners/${createdBannerId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        title: "Updated Spring Harvest Sale",
        buttonText: "Explore Now",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe("Updated Spring Harvest Sale");
    expect(body.data.buttonText).toBe("Explore Now");
  });

  it("should delete banner with Admin credentials", async () => {
    if (!createdBannerId || !adminToken) return;

    const res = await app.inject({
      method: "DELETE",
      url: `/api/v1/banners/${createdBannerId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });
});
