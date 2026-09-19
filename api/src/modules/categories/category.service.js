import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { slugify } from "../../common/utils/slug.js";

function handleCategoryError(error) {
  if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
    throw new AppError(MESSAGES.CATEGORY_SLUG_EXISTS, HTTP_STATUS.CONFLICT, "CATEGORY_SLUG_EXISTS");
  }
  if (error.code === "P2003") {
    throw new AppError(MESSAGES.CATEGORY_HAS_PRODUCTS, HTTP_STATUS.CONFLICT, "CATEGORY_HAS_PRODUCTS");
  }
  throw error;
}

export async function createCategory(input) {
  try {
    return await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug ?? slugify(input.name),
        imageUrl: input.imageUrl ?? null,
        isActive: input.isActive ?? true
      }
    });
  } catch (error) {
    handleCategoryError(error);
  }
}

export async function listCategories({ page, limit, skip, search, isActive }) {
  const where = {
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } }
      ]
    } : {}),
    ...(isActive !== undefined ? { isActive } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.category.count({ where })
  ]);
  return { items, total };
}

export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "CATEGORY_NOT_FOUND");
  return category;
}

export async function updateCategory(id, input) {
  await getCategoryById(id);
  try {
    return await prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.isActive !== undefined && { isActive: input.isActive })
      }
    });
  } catch (error) {
    handleCategoryError(error);
  }
}

export async function deleteCategory(id) {
  await getCategoryById(id);
  try {
    return await prisma.category.delete({ where: { id } });
  } catch (error) {
    handleCategoryError(error);
  }
}
