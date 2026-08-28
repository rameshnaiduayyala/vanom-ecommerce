import { LocalStorageProvider } from "./local-storage.provider.js";
import { env } from "../../config/env.js";

let defaultStorageProvider = null;

export function getStorageProvider() {
  if (!defaultStorageProvider) {
    // Easily switchable for S3 or GCS when configured
    defaultStorageProvider = new LocalStorageProvider(env.LOCAL_STORAGE_PATH);
  }
  return defaultStorageProvider;
}

export * from "./storage-provider.js";
export * from "./local-storage.provider.js";
