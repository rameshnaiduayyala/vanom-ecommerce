import { prisma } from "../../infrastructure/database/prisma.js";
import { getStorageProvider } from "../../infrastructure/storage/index.js";
import { HashUtil } from "../../common/utils/hash.js";
import { NotFoundError, ForbiddenError } from "../../common/errors/index.js";

/**
 * FileService
 * Direct Prisma queries and storage driver operations without repository layer
 */
export class FileService {
  constructor(storageProvider = getStorageProvider()) {
    this.storageProvider = storageProvider;
  }

  async uploadFile({ fileBuffer, originalName, mimeType, type = "BUSINESS_DOCUMENT", uploadedById }) {
    const checksum = HashUtil.sha256(fileBuffer);
    const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : "";
    const uniqueKey = `${type.toLowerCase()}/${Date.now()}-${HashUtil.generateRandomToken(8)}${ext}`;

    await this.storageProvider.upload(fileBuffer, uniqueKey, { originalName, mimeType });

    const asset = await prisma.fileAsset.create({
      data: {
        type,
        storageKey: uniqueKey,
        originalName,
        mimeType,
        sizeBytes: BigInt(fileBuffer.length),
        checksum,
        uploadedById,
      },
    });

    return {
      id: asset.id,
      storageKey: asset.storageKey,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      sizeBytes: Number(asset.sizeBytes),
      type: asset.type,
    };
  }

  async getFileStream(storageKey, user) {
    const asset = await prisma.fileAsset.findUnique({
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

    if (!asset) {
      throw new NotFoundError("File not found");
    }

    if (asset.type === "BUSINESS_DOCUMENT") {
      if (!user) {
        throw new ForbiddenError("Authentication required to view this document");
      }
      const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");
      const isOwner = asset.uploadedById === user.id;
      const isCompanyMember = asset.businessDocuments?.some((bd) =>
        bd.company?.members?.some((m) => m.userId === user.id)
      );

      if (!isAdmin && !isOwner && !isCompanyMember) {
        throw new ForbiddenError("You do not have permission to view this business document");
      }
    }

    const buffer = await this.storageProvider.download(storageKey);
    return { buffer, mimeType: asset.mimeType, originalName: asset.originalName };
  }
}
