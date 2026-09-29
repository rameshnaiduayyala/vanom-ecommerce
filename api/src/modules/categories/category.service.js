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
    if (input.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
      if (!parent) {
        throw new AppError("Parent category not found", HTTP_STATUS.NOT_FOUND, "PARENT_CATEGORY_NOT_FOUND");
      }
    }

    return await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug ?? slugify(input.name),
        imageUrl: input.imageUrl ?? null,
        parentId: input.parentId ?? null,
        isActive: input.isActive ?? true
      },
      include: {
        parent: true,
        children: true
      }
    });
  } catch (error) {
    handleCategoryError(error);
  }
}

export async function listCategories({ page, limit, skip, search, isActive, parentId, rootOnly }) {
  const where = {
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } }
      ]
    } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(rootOnly ? { parentId: null } : {}),
    ...(parentId !== undefined ? { parentId: parentId === "null" || parentId === null ? null : parentId } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        },
        children: {
          where: isActive !== undefined ? { isActive } : {},
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            isActive: true,
            _count: {
              select: {
                products: {
                  where: { isActive: true, deletedAt: null }
                }
              }
            }
          }
        },
        _count: {
          select: {
            products: {
              where: { isActive: true, deletedAt: null }
            },
            children: true
          }
        }
      }
    }),
    prisma.category.count({ where })
  ]);

  return {
    items: items.map((cat) => ({
      ...cat,
      count: cat._count?.products ?? 0,
      subcategoriesCount: cat._count?.children ?? 0
    })),
    total
  };
}

export async function getCategoryTree() {
  const roots = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { name: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true, deletedAt: null }
              }
            }
          }
        }
      },
      _count: {
        select: {
          products: {
            where: { isActive: true, deletedAt: null }
          },
          children: true
        }
      }
    }
  });

  return roots.map((cat) => {
    const directProductCount = cat._count?.products ?? 0;
    const childrenWithCounts = (cat.children || []).map((sub) => ({
      ...sub,
      count: sub._count?.products ?? 0
    }));

    const totalChildrenProductCount = childrenWithCounts.reduce((acc, sub) => acc + (sub.count || 0), 0);

    return {
      ...cat,
      directCount: directProductCount,
      count: directProductCount + totalChildrenProductCount,
      children: childrenWithCounts
    };
  });
}

export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          products: {
            where: { isActive: true, deletedAt: null }
          },
          children: true
        }
      }
    }
  });
  if (!category) throw new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "CATEGORY_NOT_FOUND");
  return {
    ...category,
    count: category._count?.products ?? 0,
    subcategoriesCount: category._count?.children ?? 0
  };
}

export async function updateCategory(id, input) {
  await getCategoryById(id);
  try {
    if (input.parentId && input.parentId === id) {
      throw new AppError("Category cannot be its own parent", HTTP_STATUS.BAD_REQUEST, "INVALID_PARENT_CATEGORY");
    }

    return await prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.parentId !== undefined && { parentId: input.parentId || null }),
        ...(input.isActive !== undefined && { isActive: input.isActive })
      },
      include: {
        parent: true,
        children: true
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
