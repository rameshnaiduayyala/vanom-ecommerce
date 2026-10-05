import { apiClient } from "./axios.js";

export const uploadService = {
  /**
   * Upload a single File or Blob and get back the public URL & metadata.
   *
   * @param {File|Blob} file File to upload
   * @param {string} folder Target subfolder (e.g. "products", "categories", "banners", "brands", "avatars")
   * @param {Function} [onProgress] Optional upload progress callback (percent 0-100)
   * @returns {Promise<{ url: string, storageKey: string, id: string, originalName: string, mimeType: string, size: number }>}
   */
  uploadFile: async (file, folder = "general", onProgress = null) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(`/uploads?folder=${encodeURIComponent(folder)}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });

    const data = response?.data || response;
    return data;
  },

  /**
   * Convenience helper to upload a file and return just the direct public URL.
   *
   * @param {File|Blob} file
   * @param {string} folder
   * @returns {Promise<string>} Direct image/file URL
   */
  uploadAndGetUrl: async (file, folder = "general") => {
    const result = await uploadService.uploadFile(file, folder);
    return result?.url || result?.data?.url;
  },

  /**
   * Upload multiple files at once.
   *
   * @param {File[]} files Array of files
   * @param {string} folder Target subfolder
   * @param {Function} [onProgress]
   * @returns {Promise<Array<{ url: string, storageKey: string, id: string }>>}
   */
  uploadMultipleFiles: async (files = [], folder = "general", onProgress = null) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const response = await apiClient.post(`/uploads/multiple?folder=${encodeURIComponent(folder)}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });

    const data = response?.data || response;
    return Array.isArray(data) ? data : data?.data || [];
  },

  /**
   * List files stored in AWS S3 with pagination, folder filtering, and search.
   *
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=24]
   * @param {string} [params.folder]
   * @param {string} [params.search]
   * @param {string} [params.type] 'images' | 'documents' | 'all'
   * @param {string} [params.sortBy] 'createdAt' | 'size' | 'originalName'
   * @param {string} [params.sortOrder] 'desc' | 'asc'
   * @returns {Promise<{ files: Array, pagination: Object }>}
   */
  getFiles: async (params = {}) => {
    return apiClient.get("/admin/files", { params });
  },

  /**
   * Get AWS S3 storage statistics.
   *
   * @returns {Promise<{ totalFiles: number, totalSizeBytes: number, provider: string, bucket: string, region: string, folderBreakdown: Object }>}
   */
  getFileStats: async () => {
    return apiClient.get("/admin/files/stats");
  },

  /**
   * Delete a file from AWS S3 and database by ID.
   *
   * @param {string} id
   * @returns {Promise<{ id: string, storageKey: string }>}
   */
  deleteFile: async (id) => {
    return apiClient.delete(`/admin/files/${id}`);
  }
};

