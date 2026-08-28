import { prisma } from "../../infrastructure/database/prisma.js";

export class CategoryRepository {
  static async listCategories() {
    return prisma.category.findMany({
      where: { active: true },
      include: {
        children: { where: { active: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
      },
    });
  }

  static async getBySlug(slug) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
      },
    });
  }

  static async create(data) {
    return prisma.category.create({ data });
  }

  static async update(id, data) {
    return prisma.category.update({ where: { id }, data });
  }

  static async delete(id) {
    return prisma.category.update({ where: { id }, data: { active: false } });
  }
}
