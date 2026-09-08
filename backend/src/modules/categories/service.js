import { prisma } from "../../infrastructure/database/prisma.js";
import { getStorageProvider, s3Service } from "../../infrastructure/storage/index.js";
import { HashUtil } from "../../common/utils/hash.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../common/errors/index.js";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * CategoryService
 * Direct Prisma queries, business logic, validation, and S3 file management.
 * Clean, scalable architecture without unnecessary repository abstraction layer.
 */
export class CategoryService {
  constructor(storageProvider = getStorageProvider()) {
    this.storageProvider = storageProvider;
  }

  /**
   * Internal helper to upload category image to S3/storage and record FileAsset in Prisma
   */
  async uploadCategoryImage({ fileBuffer, originalName, mimeType, userId }) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestError(`Invalid image type: ${mimeType}. Allowed: jpg, png, webp, svg, gif.`);
    }

    const checksum = HashUtil.sha256(fileBuffer);
    const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : ".jpg";
    const uniqueKey = `categories/${Date.now()}-${HashUtil.generateRandomToken(6)}${ext}`;

    const uploadResult = await this.storageProvider.upload(fileBuffer, uniqueKey, {
      originalName,
      mimeType,
      contentType: mimeType,
    });

    const fileAsset = await prisma.fileAsset.create({
      data: {
        type: "CATEGORY_IMAGE",
        storageKey: uniqueKey,
        originalName,
        mimeType,
        sizeBytes: BigInt(fileBuffer.length),
        checksum,
        uploadedById: userId || null,
      },
    });

    return {
      fileAsset,
      url: uploadResult?.url || `/api/v1/files/${uniqueKey}`,
    };
  }

  /**
   * List categories
   */
  async list({ activeOnly = true, rootOnly = false, search } = {}) {
    const where = {};
    if (activeOnly) where.active = true;
    if (rootOnly) where.parentId = null;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          where: activeOnly ? { active: true } : {},
          include: { imageAsset: true },
          orderBy: { sortOrder: "asc" },
        },
        parent: {
          select: { id: true, name: true, slug: true },
        },
        imageAsset: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    return categories.map((cat) => this._formatCategory(cat));
  }

  /**
   * Get category by ID or unique slug
   */
  async getById(idOrSlug) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const where = isUuid ? { id: idOrSlug } : { slug: idOrSlug };

    const category = await prisma.category.findFirst({
      where,
      include: {
        children: {
          include: { imageAsset: true },
          orderBy: { sortOrder: "asc" },
        },
        parent: true,
        imageAsset: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError(`Category not found: ${idOrSlug}`);
    }

    return this._formatCategory(category);
  }

  /**
   * Create category
   */
  async create(data, user) {
    let {
      name,
      slug,
      parentId,
      description,
      imageUrl,
      imageAssetId,
      sortOrder = 0,
      active = true,
      imageFile,
    } = data;

    if (!name || typeof name !== "string") {
      throw new BadRequestError("Category name is required");
    }

    slug = slug ? slugify(slug) : slugify(name);

    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundError(`Parent category not found: ${parentId}`);
      }
    }

    if (imageFile && imageFile.fileBuffer) {
      const { fileAsset, url } = await this.uploadCategoryImage({
        fileBuffer: imageFile.fileBuffer,
        originalName: imageFile.originalName || "category-image.jpg",
        mimeType: imageFile.mimeType || "image/jpeg",
        userId: user?.id,
      });
      imageAssetId = fileAsset.id;
      imageUrl = url;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
        description: description || null,
        imageUrl: imageUrl || null,
        imageAssetId: imageAssetId || null,
        sortOrder: Number(sortOrder) || 0,
        active: active !== undefined ? Boolean(active) : true,
      },
      include: {
        parent: true,
        imageAsset: true,
      },
    });

    return this._formatCategory(category);
  }

  /**
   * Update category
   */
  async update(id, data, user) {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { imageAsset: true },
    });

    if (!existing) {
      throw new NotFoundError(`Category not found with id: ${id}`);
    }

    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;

    if (data.slug !== undefined) {
      const formattedSlug = slugify(data.slug);
      const slugOwner = await prisma.category.findUnique({ where: { slug: formattedSlug } });
      if (slugOwner && slugOwner.id !== id) {
        throw new ConflictError(`Slug '${formattedSlug}' is already in use by another category`);
      }
      updateData.slug = formattedSlug;
    }

    if (data.description !== undefined) updateData.description = data.description;
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);
    if (data.active !== undefined) updateData.active = Boolean(data.active);

    if (data.parentId !== undefined) {
      if (data.parentId === id) {
        throw new BadRequestError("Category cannot be its own parent");
      }
      if (data.parentId) {
        const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
        if (!parent) {
          throw new NotFoundError(`Parent category not found: ${data.parentId}`);
        }
      }
      updateData.parentId = data.parentId || null;
    }

    // Direct image replacement
    if (data.imageFile && data.imageFile.fileBuffer) {
      if (existing.imageAsset) {
        try {
          await this.storageProvider.delete(existing.imageAsset.storageKey);
          await prisma.fileAsset.delete({ where: { id: existing.imageAsset.id } });
        } catch (e) {
          // ignore cleanup failures
        }
      }

      const { fileAsset, url } = await this.uploadCategoryImage({
        fileBuffer: data.imageFile.fileBuffer,
        originalName: data.imageFile.originalName || "category-image.jpg",
        mimeType: data.imageFile.mimeType || "image/jpeg",
        userId: user?.id,
      });

      updateData.imageAssetId = fileAsset.id;
      updateData.imageUrl = url;
    } else if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    } else if (data.imageAssetId !== undefined) {
      updateData.imageAssetId = data.imageAssetId;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        imageAsset: true,
      },
    });

    return this._formatCategory(updated);
  }

  /**
   * Upload and attach image to category
   */
  async uploadImageForCategory(id, { fileBuffer, originalName, mimeType }, user) {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { imageAsset: true },
    });

    if (!existing) {
      throw new NotFoundError(`Category not found with id: ${id}`);
    }

    const { fileAsset, url } = await this.uploadCategoryImage({
      fileBuffer,
      originalName,
      mimeType,
      userId: user?.id,
    });

    if (existing.imageAsset) {
      try {
        await this.storageProvider.delete(existing.imageAsset.storageKey);
        await prisma.fileAsset.delete({ where: { id: existing.imageAsset.id } });
      } catch (e) {
        // ignore
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        imageAssetId: fileAsset.id,
        imageUrl: url,
      },
      include: {
        parent: true,
        imageAsset: true,
      },
    });

    return this._formatCategory(updated);
  }

  /**
   * Delete category image
   */
  async deleteCategoryImage(id) {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { imageAsset: true },
    });

    if (!existing) {
      throw new NotFoundError(`Category not found with id: ${id}`);
    }

    if (existing.imageAsset) {
      try {
        await this.storageProvider.delete(existing.imageAsset.storageKey);
        await prisma.fileAsset.delete({ where: { id: existing.imageAsset.id } });
      } catch (e) {
        // ignore
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        imageAssetId: null,
        imageUrl: null,
      },
      include: {
        parent: true,
        imageAsset: true,
      },
    });

    return this._formatCategory(updated);
  }

  /**
   * Generate pre-signed S3 upload URL for direct client-to-S3 upload
   */
  async getPresignedUploadUrl(id, { filename, mimeType }) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Category not found with id: ${id}`);
    }

    const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : ".jpg";
    const key = `categories/${id}-${Date.now()}${ext}`;

    const result = await s3Service.getSignedUploadUrl({
      key,
      contentType: mimeType,
      expiresIn: 900,
    });

    return {
      categoryId: id,
      storageKey: key,
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      expiresIn: result.expiresIn,
    };
  }

  /**
   * Delete category (hard removal by default or soft)
   */
  async delete(id, { hard = true } = {}) {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { imageAsset: true, children: true, products: true },
    });

    if (!existing) {
      throw new NotFoundError(`Category not found with id: ${id}`);
    }

    if (hard) {
      // Unlink any sub-categories so foreign key constraint doesn't fail
      if (existing.children && existing.children.length > 0) {
        await prisma.category.updateMany({
          where: { parentId: id },
          data: { parentId: existing.parentId || null },
        });
      }

      // Remove product-category relationships
      if (existing.products && existing.products.length > 0) {
        await prisma.productCategory.deleteMany({
          where: { categoryId: id },
        });
      }

      if (existing.imageAsset) {
        try {
          await this.storageProvider.delete(existing.imageAsset.storageKey);
          await prisma.fileAsset.delete({ where: { id: existing.imageAsset.id } });
        } catch (e) {
          // ignore cleanup error
        }
      }

      return prisma.category.delete({ where: { id } });
    }

    return prisma.category.update({
      where: { id },
      data: { active: false },
    });
  }

  _formatCategory(cat) {
    if (!cat) return null;
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parentId: cat.parentId,
      sortOrder: cat.sortOrder,
      active: cat.active,
      imageUrl: cat.imageUrl || (cat.imageAsset ? `/api/v1/files/${cat.imageAsset.storageKey}` : null),
      imageAsset: cat.imageAsset
        ? {
            id: cat.imageAsset.id,
            storageKey: cat.imageAsset.storageKey,
            originalName: cat.imageAsset.originalName,
            mimeType: cat.imageAsset.mimeType,
            sizeBytes: Number(cat.imageAsset.sizeBytes),
          }
        : null,
      parent: cat.parent || null,
      children: cat.children ? cat.children.map((c) => this._formatCategory(c)) : [],
      productCount: cat._count?.products || 0,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }
}
