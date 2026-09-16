import { prisma } from "../../infrastructure/database/prisma.js";
import { NotFoundError } from "../../common/errors/index.js";
import crypto from "crypto";

// Default seed promotional banner items
const inMemoryBanners = [
  {
    id: "banner-seed-hero-1",
    title: "Pure Organic Kashmiri Saffron & Gourmet Essentials",
    subtitle: "Farm Direct Export Quality",
    description: "Experience the richest aroma and golden essence with Grade A1 Super Mongra natural Kashmiri saffron.",
    type: "HERO_CAROUSEL",
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1400&q=80",
    buttonText: "Shop Saffron",
    buttonLink: "/products/pure-kashmiri-saffron",
    badgeText: "Best Seller",
    bgGradient: "from-amber-900 to-yellow-950",
    sortOrder: 1,
    active: true,
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "banner-seed-hero-2",
    title: "Immunity Booster & Raw Herbal Formulations",
    subtitle: "Ayurvedic Wellness Solutions",
    description: "Infused with 100% Raw Forest Honey and Kadha Herbal Sips for optimal immune vitality and everyday wellness.",
    type: "HERO_CAROUSEL",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1400&q=80",
    buttonText: "Discover Bundles",
    buttonLink: "/products/immunity-booster-combo",
    badgeText: "New Launch",
    bgGradient: "from-emerald-900 to-teal-950",
    sortOrder: 2,
    active: true,
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * BannerService
 * Handles sliders, promotional carousels, hero banners, and popups
 */
export class BannerService {
  async listBanners({ type, active = true } = {}) {
    if (prisma.banner) {
      const where = {};
      if (active !== undefined) {
        where.active = active === true || active === "true";
      }
      if (type) {
        where.type = type;
      }
      const now = new Date();
      if (where.active) {
        where.AND = [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ];
      }
      return prisma.banner.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    }

    // In-memory fallback
    const isActive = active === true || active === "true";
    return inMemoryBanners
      .filter((b) => (!isActive || b.active) && (!type || b.type === type))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getBannerById(id) {
    if (prisma.banner) {
      const banner = await prisma.banner.findUnique({ where: { id } });
      if (!banner) throw new NotFoundError(`Banner with ID '${id}' not found`);
      return banner;
    }

    const banner = inMemoryBanners.find((b) => b.id === id);
    if (!banner) {
      throw new NotFoundError(`Banner with ID '${id}' not found`);
    }
    return banner;
  }

  async createBanner(data) {
    if (prisma.banner) {
      return prisma.banner.create({
        data: {
          title: data.title,
          subtitle: data.subtitle || null,
          description: data.description || null,
          type: data.type || "HERO_CAROUSEL",
          imageUrl: data.imageUrl,
          buttonText: data.buttonText || "Shop Now",
          buttonLink: data.buttonLink || "/products",
          badgeText: data.badgeText || null,
          bgGradient: data.bgGradient || null,
          sortOrder: data.sortOrder ? parseInt(data.sortOrder, 10) : 0,
          active: data.active !== undefined ? Boolean(data.active) : true,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
      });
    }

    const newBanner = {
      id: crypto.randomUUID(),
      title: data.title,
      subtitle: data.subtitle || null,
      description: data.description || null,
      type: data.type || "HERO_CAROUSEL",
      imageUrl: data.imageUrl,
      buttonText: data.buttonText || "Shop Now",
      buttonLink: data.buttonLink || "/products",
      badgeText: data.badgeText || null,
      bgGradient: data.bgGradient || null,
      sortOrder: data.sortOrder ? parseInt(data.sortOrder, 10) : 0,
      active: data.active !== undefined ? Boolean(data.active) : true,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryBanners.push(newBanner);
    return newBanner;
  }

  async updateBanner(id, data) {
    const existing = await this.getBannerById(id);

    if (prisma.banner) {
      const updateData = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.buttonText !== undefined) updateData.buttonText = data.buttonText;
      if (data.buttonLink !== undefined) updateData.buttonLink = data.buttonLink;
      if (data.badgeText !== undefined) updateData.badgeText = data.badgeText;
      if (data.bgGradient !== undefined) updateData.bgGradient = data.bgGradient;
      if (data.sortOrder !== undefined) updateData.sortOrder = parseInt(data.sortOrder, 10);
      if (data.active !== undefined) updateData.active = Boolean(data.active);
      if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
      if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

      return prisma.banner.update({
        where: { id },
        data: updateData,
      });
    }

    Object.assign(existing, data, { updatedAt: new Date() });
    return existing;
  }

  async deleteBanner(id) {
    await this.getBannerById(id);

    if (prisma.banner) {
      return prisma.banner.delete({ where: { id } });
    }

    const index = inMemoryBanners.findIndex((b) => b.id === id);
    if (index !== -1) {
      const [deleted] = inMemoryBanners.splice(index, 1);
      return deleted;
    }
    return null;
  }
}
