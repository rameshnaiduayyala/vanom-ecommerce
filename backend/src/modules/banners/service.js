import { prisma } from "../../infrastructure/database/prisma.js";
import { NotFoundError } from "../../common/errors/index.js";

/**
 * BannerService
 * Handles sliders, promotional carousels, hero banners, and popups
 */
export class BannerService {
  async listBanners({ type, active = true } = {}) {
    const where = {};
    if (active !== undefined) {
      where.active = active === true || active === "true";
    }
    if (type) {
      where.type = type;
    }

    const now = new Date();
    // Only return banners within active schedule window if specified
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

  async getBannerById(id) {
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundError(`Banner with ID '${id}' not found`);
    }
    return banner;
  }

  async createBanner(data) {
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

  async updateBanner(id, data) {
    await this.getBannerById(id);

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

  async deleteBanner(id) {
    await this.getBannerById(id);
    return prisma.banner.delete({ where: { id } });
  }
}
