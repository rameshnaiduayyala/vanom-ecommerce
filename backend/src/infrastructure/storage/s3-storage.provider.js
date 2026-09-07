import { StorageProvider } from "./storage-provider.js";
import { s3Service, S3Service } from "./s3.service.js";

/**
 * Production AWS S3 Storage Provider implementation
 * Conforms to StorageProvider contract.
 */
export class S3StorageProvider extends StorageProvider {
  /**
   * @param {Object} [options]
   */
  constructor(options = {}) {
    super();
    this.service = new S3Service(options);
  }

  /**
   * Upload file to S3
   */
  async upload(fileBuffer, key, metadata = {}) {
    const result = await this.service.upload({
      key,
      body: fileBuffer,
      contentType: metadata?.contentType || "application/octet-stream",
      metadata,
    });

    return {
      storageKey: key,
      sizeBytes: fileBuffer?.length || 0,
      url: result.url,
      metadata,
    };
  }

  /**
   * Download / Get stream
   */
  async download(key) {
    const { stream } = await this.service.getObjectStream({ key });
    return stream;
  }

  /**
   * Download buffer directly
   */
  async downloadBuffer(key) {
    return await this.service.getObjectBuffer({ key });
  }

  /**
   * Delete object
   */
  async delete(key) {
    return await this.service.delete({ key });
  }

  /**
   * Check existence
   */
  async exists(key) {
    return await this.service.exists({ key });
  }

  /**
   * Pre-signed URL (default download)
   */
  async getSignedUrl(key, expiresInSeconds = 3600) {
    return await this.service.getSignedDownloadUrl({
      key,
      expiresIn: expiresInSeconds,
    });
  }

  /**
   * Pre-signed upload URL for direct client PUT
   */
  async getSignedUploadUrl(key, contentType, expiresInSeconds = 900) {
    return await this.service.getSignedUploadUrl({
      key,
      contentType,
      expiresIn: expiresInSeconds,
    });
  }
}
