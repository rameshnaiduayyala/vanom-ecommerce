import fs from "fs/promises";
import path from "path";
import { StorageProvider } from "./storage-provider.js";
import { env } from "../../config/env.js";

export class LocalStorageProvider extends StorageProvider {
  constructor(baseDir = env.LOCAL_STORAGE_PATH) {
    super();
    this.baseDir = path.resolve(baseDir);
  }

  async _ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async upload(fileBuffer, key, metadata = {}) {
    const fullPath = path.join(this.baseDir, key);
    await this._ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, fileBuffer);
    return {
      storageKey: key,
      sizeBytes: fileBuffer.length,
      path: fullPath,
      metadata,
    };
  }

  async download(key) {
    const fullPath = path.join(this.baseDir, key);
    return fs.readFile(fullPath);
  }

  async delete(key) {
    const fullPath = path.join(this.baseDir, key);
    try {
      await fs.unlink(fullPath);
      return true;
    } catch (err) {
      if (err.code === "ENOENT") return false;
      throw err;
    }
  }

  async getSignedUrl(key, expiresInSeconds = 3600) {
    return `/api/v1/files/${key}`;
  }
}
