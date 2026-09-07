import { prisma } from "../../infrastructure/database/prisma.js";
import { NotFoundError } from "../../common/errors/index.js";

export class BrandService {
  async list() {
    return prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  }

  async getById(id) {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { products: { where: { status: "ACTIVE" } } },
    });
    if (!brand) {
      throw new NotFoundError(`Brand not found with id: ${id}`);
    }
    return brand;
  }

  async create(data) {
    return prisma.brand.create({ data });
  }

  async update(id, data) {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Brand not found with id: ${id}`);
    }
    return prisma.brand.update({ where: { id }, data });
  }

  async delete(id) {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Brand not found with id: ${id}`);
    }
    return prisma.brand.update({ where: { id }, data: { active: false } });
  }
}
