import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env.js";

/**
 * Enterprise S3 Service Client
 * Production-ready wrapper around AWS S3 SDK v3 supporting:
 * - Direct upload (Buffers, Streams, Strings)
 * - Pre-signed GET (download) URLs
 * - Pre-signed PUT (direct client-to-S3 upload) URLs
 * - Direct object fetch (Stream & Buffer)
 * - Object deletion & head verification
 * - Compatible with AWS S3, MinIO, LocalStack, Cloudflare R2, Ceph
 */
export class S3Service {
  /**
   * @param {Object} [config]
   * @param {string} [config.region]
   * @param {string} [config.bucket]
   * @param {string} [config.accessKeyId]
   * @param {string} [config.secretAccessKey]
   * @param {string} [config.endpoint] - Optional custom endpoint for MinIO / LocalStack / R2
   * @param {boolean} [config.forcePathStyle] - Needed for MinIO/LocalStack
   */
  constructor(config = {}) {
    this.region = config.region || env.AWS_REGION || "us-east-1";
    this.bucket = config.bucket || env.AWS_S3_BUCKET;
    this.endpoint = config.endpoint || env.AWS_S3_ENDPOINT;
    this.forcePathStyle = config.forcePathStyle ?? env.AWS_S3_FORCE_PATH_STYLE ?? false;

    const accessKeyId = config.accessKeyId || env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = config.secretAccessKey || env.AWS_SECRET_ACCESS_KEY;

    const clientConfig = {
      region: this.region,
      forcePathStyle: this.forcePathStyle,
    };

    if (this.endpoint) {
      clientConfig.endpoint = this.endpoint;
    }

    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  /**
   * Ensure bucket is defined
   * @private
   */
  _getBucket(bucketOverride) {
    const bucket = bucketOverride || this.bucket;
    if (!bucket) {
      throw new Error("S3 Bucket name is required. Set AWS_S3_BUCKET or pass bucket in options.");
    }
    return bucket;
  }

  /**
   * Upload a file or buffer directly to S3
   *
   * @param {Object} params
   * @param {string} params.key - S3 Object Key (e.g. 'products/123/image.png')
   * @param {Buffer|Uint8Array|Blob|string|ReadableStream} params.body - File content
   * @param {string} [params.contentType] - MIME type (e.g. 'image/png')
   * @param {string} [params.bucket] - Optional bucket override
   * @param {Object} [params.metadata] - Key-value metadata
   * @param {string} [params.acl] - e.g. 'private' | 'public-read'
   * @param {string} [params.cacheControl] - e.g. 'public, max-age=31536000'
   * @returns {Promise<{ key: string, bucket: string, url: string, eTag: string }>}
   */
  async upload({
    key,
    body,
    contentType = "application/octet-stream",
    bucket,
    metadata = {},
    acl,
    cacheControl,
  }) {
    if (!key) throw new Error("S3 upload requires a valid 'key'");
    if (!body) throw new Error("S3 upload requires a 'body'");

    const targetBucket = this._getBucket(bucket);

    const command = new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
      ...(acl && { ACL: acl }),
      ...(cacheControl && { CacheControl: cacheControl }),
    });

    const response = await this.client.send(command);

    return {
      key,
      bucket: targetBucket,
      url: this.getPublicUrl(key, targetBucket),
      eTag: response.ETag ? response.ETag.replace(/"/g, "") : undefined,
    };
  }

  /**
   * Generate a pre-signed URL for direct CLIENT-SIDE UPLOAD (HTTP PUT)
   * Best practice for frontend large file uploads without taxing backend memory.
   *
   * @param {Object} params
   * @param {string} params.key - Destination key in S3
   * @param {string} [params.contentType] - Expected MIME type
   * @param {number} [params.expiresIn=900] - Expiry in seconds (default 15 minutes)
   * @param {string} [params.bucket] - Optional bucket override
   * @param {Object} [params.metadata] - Optional metadata
   * @returns {Promise<{ uploadUrl: string, key: string, publicUrl: string, expiresIn: number }>}
   */
  async getSignedUploadUrl({
    key,
    contentType,
    expiresIn = 900,
    bucket,
    metadata = {},
  }) {
    if (!key) throw new Error("Key is required to generate a signed upload URL");

    const targetBucket = this._getBucket(bucket);

    const command = new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      ...(contentType && { ContentType: contentType }),
      ...(Object.keys(metadata).length > 0 && { Metadata: metadata }),
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      uploadUrl,
      key,
      publicUrl: this.getPublicUrl(key, targetBucket),
      expiresIn,
    };
  }

  /**
   * Generate a pre-signed URL for secure time-limited DOWNLOAD (HTTP GET)
   *
   * @param {Object} params
   * @param {string} params.key - S3 Object Key
   * @param {number} [params.expiresIn=3600] - Expiration in seconds (default 1 hour)
   * @param {string} [params.bucket] - Optional bucket override
   * @param {string} [params.responseContentType] - Override Content-Type header on download
   * @param {string} [params.responseContentDisposition] - e.g. 'attachment; filename="invoice.pdf"'
   * @returns {Promise<string>}
   */
  async getSignedDownloadUrl({
    key,
    expiresIn = 3600,
    bucket,
    responseContentType,
    responseContentDisposition,
  }) {
    if (!key) throw new Error("Key is required to generate a signed download URL");

    const targetBucket = this._getBucket(bucket);

    const command = new GetObjectCommand({
      Bucket: targetBucket,
      Key: key,
      ...(responseContentType && { ResponseContentType: responseContentType }),
      ...(responseContentDisposition && { ResponseContentDisposition: responseContentDisposition }),
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Alias helper: get pre-signed URL for read/download
   * @param {string} key
   * @param {number} [expiresIn=3600]
   * @param {string} [bucket]
   * @returns {Promise<string>}
   */
  async getSignedUrl(key, expiresIn = 3600, bucket) {
    return this.getSignedDownloadUrl({ key, expiresIn, bucket });
  }

  /**
   * Fetch object from S3 and return as a Node.js stream + metadata
   *
   * @param {Object} params
   * @param {string} params.key
   * @param {string} [params.bucket]
   * @returns {Promise<{ stream: import('stream').Readable, contentType: string, contentLength: number, metadata: Object }>}
   */
  async getObjectStream({ key, bucket }) {
    if (!key) throw new Error("Key is required to retrieve object stream");

    const targetBucket = this._getBucket(bucket);

    const command = new GetObjectCommand({
      Bucket: targetBucket,
      Key: key,
    });

    const response = await this.client.send(command);

    return {
      stream: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      metadata: response.Metadata || {},
      lastModified: response.LastModified,
      eTag: response.ETag,
    };
  }

  /**
   * Fetch object from S3 and return as a Buffer in memory
   *
   * @param {Object} params
   * @param {string} params.key
   * @param {string} [params.bucket]
   * @returns {Promise<Buffer>}
   */
  async getObjectBuffer({ key, bucket }) {
    const { stream } = await this.getObjectStream({ key, bucket });

    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  /**
   * Check if an object exists in S3
   *
   * @param {Object} params
   * @param {string} params.key
   * @param {string} [params.bucket]
   * @returns {Promise<boolean>}
   */
  async exists({ key, bucket }) {
    if (!key) return false;

    const targetBucket = this._getBucket(bucket);

    try {
      const command = new HeadObjectCommand({
        Bucket: targetBucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch (err) {
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Delete an object from S3
   *
   * @param {Object} params
   * @param {string} params.key
   * @param {string} [params.bucket]
   * @returns {Promise<boolean>}
   */
  async delete({ key, bucket }) {
    if (!key) throw new Error("Key is required for deletion");

    const targetBucket = this._getBucket(bucket);

    const command = new DeleteObjectCommand({
      Bucket: targetBucket,
      Key: key,
    });

    await this.client.send(command);
    return true;
  }

  /**
   * Get standard public URL for an S3 object
   *
   * @param {string} key
   * @param {string} [bucket]
   * @returns {string}
   */
  getPublicUrl(key, bucket) {
    const targetBucket = this._getBucket(bucket);
    if (this.endpoint) {
      const trimmedEndpoint = this.endpoint.replace(/\/$/, "");
      return this.forcePathStyle
        ? `${trimmedEndpoint}/${targetBucket}/${key}`
        : `${trimmedEndpoint.replace("://", `://${targetBucket}.`)}/${key}`;
    }
    return `https://${targetBucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

// Export singleton instance initialized with default environment configs
export const s3Service = new S3Service();
