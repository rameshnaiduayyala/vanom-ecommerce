import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryService } from "../src/modules/categories/service.js";
import { prisma } from "../src/infrastructure/database/prisma.js";

describe("Category Service with Image Management (Routes -> Controller -> Service)", () => {
  let mockStorageProvider;
  let service;

  beforeEach(() => {
    mockStorageProvider = {
      upload: vi.fn().mockResolvedValue({ url: "https://s3.amazonaws.com/test-bucket/categories/img.jpg" }),
      delete: vi.fn().mockResolvedValue(true),
    };
    service = new CategoryService(mockStorageProvider);
  });

  it("should create a category without image", async () => {
    vi.spyOn(prisma.category, "findUnique").mockResolvedValue(null);
    vi.spyOn(prisma.category, "create").mockImplementation(async ({ data }) => ({
      id: "cat-1",
      ...data,
      children: [],
      parent: null,
      imageAsset: null,
      _count: { products: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await service.create({
      name: "Smartphones",
      description: "Mobile phones",
    });

    expect(result.name).toBe("Smartphones");
    expect(result.slug).toBe("smartphones");
    expect(result.imageUrl).toBeNull();
  });

  it("should create a category with an image upload", async () => {
    vi.spyOn(prisma.category, "findUnique").mockResolvedValue(null);
    vi.spyOn(prisma.fileAsset, "create").mockResolvedValue({
      id: "file-asset-1",
      storageKey: "categories/123-img.jpg",
      originalName: "cat.jpg",
      mimeType: "image/jpeg",
      sizeBytes: BigInt(1024),
    });

    vi.spyOn(prisma.category, "create").mockImplementation(async ({ data }) => ({
      id: "cat-2",
      ...data,
      children: [],
      parent: null,
      imageAsset: {
        id: "file-asset-1",
        storageKey: "categories/123-img.jpg",
        originalName: "cat.jpg",
        mimeType: "image/jpeg",
        sizeBytes: BigInt(1024),
      },
      _count: { products: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await service.create({
      name: "Laptops",
      imageFile: {
        fileBuffer: Buffer.from("fake-image-bytes"),
        originalName: "laptop.png",
        mimeType: "image/png",
      },
    });

    expect(mockStorageProvider.upload).toHaveBeenCalled();
    expect(prisma.fileAsset.create).toHaveBeenCalled();
    expect(result.name).toBe("Laptops");
    expect(result.imageAsset).toBeDefined();
    expect(result.imageAsset.id).toBe("file-asset-1");
  });

  it("should update category and replace existing image", async () => {
    vi.spyOn(prisma.category, "findUnique")
      .mockResolvedValueOnce({
        id: "cat-2",
        name: "Laptops",
        slug: "laptops",
        imageAsset: {
          id: "file-asset-old",
          storageKey: "categories/old.jpg",
        },
      })
      .mockResolvedValueOnce(null); // slug check

    vi.spyOn(prisma.fileAsset, "delete").mockResolvedValue({});
    vi.spyOn(prisma.fileAsset, "create").mockResolvedValue({
      id: "file-asset-new",
      storageKey: "categories/new.jpg",
      originalName: "new.jpg",
      mimeType: "image/jpeg",
      sizeBytes: BigInt(2048),
    });

    vi.spyOn(prisma.category, "update").mockImplementation(async ({ where, data }) => ({
      id: where.id,
      name: "Ultra Laptops",
      slug: "ultra-laptops",
      ...data,
      imageAsset: {
        id: "file-asset-new",
        storageKey: "categories/new.jpg",
        originalName: "new.jpg",
        mimeType: "image/jpeg",
        sizeBytes: BigInt(2048),
      },
      parent: null,
      children: [],
      _count: { products: 0 },
    }));

    const updated = await service.update("cat-2", {
      name: "Ultra Laptops",
      imageFile: {
        fileBuffer: Buffer.from("new-image-data"),
        originalName: "new.jpg",
        mimeType: "image/jpeg",
      },
    });

    expect(mockStorageProvider.delete).toHaveBeenCalledWith("categories/old.jpg");
    expect(prisma.fileAsset.delete).toHaveBeenCalledWith({ where: { id: "file-asset-old" } });
    expect(updated.name).toBe("Ultra Laptops");
    expect(updated.imageAsset.id).toBe("file-asset-new");
  });

  it("should delete category image", async () => {
    vi.spyOn(prisma.category, "findUnique").mockResolvedValue({
      id: "cat-1",
      name: "Audio",
      imageAsset: {
        id: "file-asset-1",
        storageKey: "categories/audio.jpg",
      },
    });

    vi.spyOn(prisma.fileAsset, "delete").mockResolvedValue({});
    vi.spyOn(prisma.category, "update").mockResolvedValue({
      id: "cat-1",
      name: "Audio",
      slug: "audio",
      imageUrl: null,
      imageAsset: null,
      parent: null,
      children: [],
      _count: { products: 0 },
    });

    const result = await service.deleteCategoryImage("cat-1");
    expect(mockStorageProvider.delete).toHaveBeenCalledWith("categories/audio.jpg");
    expect(prisma.fileAsset.delete).toHaveBeenCalledWith({ where: { id: "file-asset-1" } });
    expect(result.imageUrl).toBeNull();
    expect(result.imageAsset).toBeNull();
  });
});
