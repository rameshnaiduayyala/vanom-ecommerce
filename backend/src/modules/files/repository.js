import { prisma } from "../../infrastructure/database/prisma.js";

export class FileRepository {
  static async createFileAsset({ type, storageKey, originalName, mimeType, sizeBytes, checksum, uploadedById }) {
    return prisma.fileAsset.create({
      data: {
        type,
        storageKey,
        originalName,
        mimeType,
        sizeBytes: BigInt(sizeBytes),
        checksum,
        uploadedById,
      },
    });
  }

  static async findByStorageKey(storageKey) {
    return prisma.fileAsset.findUnique({
      where: { storageKey },
      include: {
        businessDocuments: {
          include: {
            company: {
              include: { members: true },
            },
          },
        },
      },
    });
  }
}
