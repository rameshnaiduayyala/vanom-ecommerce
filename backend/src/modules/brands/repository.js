import { prisma } from "../../infrastructure/database/prisma.js";

export class BrandRepository {
  static async listBrands() {
    return prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  }

  static async getById(id) {
    return prisma.brand.findUnique({
      where: { id },
      include: { products: { where: { status: "ACTIVE" } } },
    });
  }

  static async create(data) {
    return prisma.brand.create({ data });
  }
}
