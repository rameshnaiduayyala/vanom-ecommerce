import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { slugify } from "../../common/utils/slug.js";

function handleBrandError(error) {
  if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
    throw new AppError(MESSAGES.BRAND_SLUG_EXISTS, HTTP_STATUS.CONFLICT, "BRAND_SLUG_EXISTS");
  }
  if (error.code === "P2003") {
    throw new AppError(MESSAGES.BRAND_HAS_PRODUCTS, HTTP_STATUS.CONFLICT, "BRAND_HAS_PRODUCTS");
  }
  throw error;
}

export async function createBrand(input) {
  try {
    return await prisma.brand.create({
      data: {
        name: input.name,
        slug: input.slug ?? slugify(input.name),
        imageUrl: input.imageUrl ?? null,
        isActive: input.isActive ?? true
      }
    });
  } catch (error) {
    handleBrandError(error);
  }
}

export async function listBrands({ page, limit, skip, search, isActive }) {
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
    prisma.brand.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.brand.count({ where })
  ]);
  return { items, total };
}

export async function getBrandById(id) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new AppError(MESSAGES.BRAND_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "BRAND_NOT_FOUND");
  return brand;
}

export async function updateBrand(id, input) {
  await getBrandById(id);
  try {
    return await prisma.brand.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.isActive !== undefined && { isActive: input.isActive })
      }
    });
  } catch (error) {
    handleBrandError(error);
  }
}

export async function deleteBrand(id) {
  await getBrandById(id);
  try {
    return await prisma.brand.delete({ where: { id } });
  } catch (error) {
    handleBrandError(error);
  }
}
