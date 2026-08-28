export class StorageProvider {
  async upload(fileBuffer, key, metadata = {}) {
    throw new Error("upload() must be implemented by storage provider");
  }

  async download(key) {
    throw new Error("download() must be implemented by storage provider");
  }

  async delete(key) {
    throw new Error("delete() must be implemented by storage provider");
  }

  async getSignedUrl(key, expiresInSeconds = 3600) {
    throw new Error("getSignedUrl() must be implemented by storage provider");
  }
}
