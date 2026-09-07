import { LocalStorageProvider } from "./local-storage.provider.js";
import { S3StorageProvider } from "./s3-storage.provider.js";
import { s3Service, S3Service } from "./s3.service.js";
import { env } from "../../config/env.js";

let defaultStorageProvider = null;

export function getStorageProvider() {
  if (!defaultStorageProvider) {
    if (env.STORAGE_DRIVER === "s3") {
      defaultStorageProvider = new S3StorageProvider();
    } else {
      defaultStorageProvider = new LocalStorageProvider(env.LOCAL_STORAGE_PATH);
    }
  }
  return defaultStorageProvider;
}

export * from "./storage-provider.js";
export * from "./local-storage.provider.js";
export * from "./s3-storage.provider.js";
export * from "./s3.service.js";
