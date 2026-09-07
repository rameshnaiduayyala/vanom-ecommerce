import { describe, it, expect, vi } from "vitest";
import { S3Service } from "../src/infrastructure/storage/s3.service.js";

describe("S3Service Unit Tests", () => {
  const service = new S3Service({
    bucket: "test-bucket",
    region: "us-east-1",
    accessKeyId: "mock-key",
    secretAccessKey: "mock-secret",
  });

  it("should format public URLs properly", () => {
    const url = service.getPublicUrl("uploads/avatar.jpg");
    expect(url).toBe("https://test-bucket.s3.us-east-1.amazonaws.com/uploads/avatar.jpg");
  });

  it("should generate pre-signed upload URL", async () => {
    // Mock the S3Client send/signer
    const spy = vi.spyOn(service.client, "send").mockResolvedValue({});
    
    const res = await service.getSignedUploadUrl({
      key: "products/item-1.jpg",
      contentType: "image/jpeg",
      expiresIn: 600,
    });

    expect(res).toBeDefined();
    expect(res.key).toBe("products/item-1.jpg");
    expect(res.uploadUrl).toContain("https://test-bucket.s3.us-east-1.amazonaws.com/products/item-1.jpg");
    expect(res.expiresIn).toBe(600);
  });

  it("should generate pre-signed download URL", async () => {
    const downloadUrl = await service.getSignedDownloadUrl({
      key: "invoices/inv-123.pdf",
      expiresIn: 3600,
    });

    expect(downloadUrl).toContain("https://test-bucket.s3.us-east-1.amazonaws.com/invoices/inv-123.pdf");
  });

  it("should upload buffer or stream via PutObject", async () => {
    const spy = vi.spyOn(service.client, "send").mockResolvedValue({
      ETag: '"abc123etag"',
    });

    const result = await service.upload({
      key: "test.txt",
      body: Buffer.from("Hello S3"),
      contentType: "text/plain",
    });

    expect(spy).toHaveBeenCalled();
    expect(result.key).toBe("test.txt");
    expect(result.bucket).toBe("test-bucket");
    expect(result.eTag).toBe("abc123etag");
  });

  it("should handle object deletion", async () => {
    const spy = vi.spyOn(service.client, "send").mockResolvedValue({});

    const result = await service.delete({ key: "test.txt" });
    expect(spy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should handle exists checks", async () => {
    const spy = vi.spyOn(service.client, "send").mockResolvedValue({});
    const exists = await service.exists({ key: "test.txt" });
    expect(exists).toBe(true);

    const error = new Error("Not Found");
    error.name = "NotFound";
    spy.mockRejectedValueOnce(error);

    const existsFalse = await service.exists({ key: "missing.txt" });
    expect(existsFalse).toBe(false);
  });
});
