import { useState, useCallback } from "react";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";

/**
 * Reusable file upload hook.
 *
 * @param {Object} options
 * @param {string} [options.folder="general"] - Target upload folder on backend (e.g. "products", "categories", "avatars", "banners")
 * @param {Function} [options.onSuccess] - Callback with uploaded URL(s) or file object(s)
 * @param {Function} [options.onError] - Custom error handler
 * @param {boolean} [options.showToast=true] - Whether to show toast notifications
 * @returns {{
 *   uploading: boolean,
 *   progress: number,
 *   uploadSingle: (file: File) => Promise<{ url: string, storageKey: string, id: string } | null>,
 *   uploadMultiple: (files: File[]) => Promise<Array<{ url: string, storageKey: string, id: string }>>,
 *   uploadFiles: (files: FileList | File[]) => Promise<string[]>
 * }}
 */
export function useFileUpload({
  folder = "general",
  onSuccess = null,
  onError = null,
  showToast = true
} = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadSingle = useCallback(async (file, customFolder = null) => {
    if (!file) return null;
    const targetFolder = customFolder || folder;

    setUploading(true);
    setProgress(0);
    try {
      const result = await Api.upload.uploadFile(file, targetFolder, (p) => setProgress(p));
      const url = result?.url || result?.data?.url;

      if (showToast) {
        toast.success("Uploaded", "File uploaded successfully.");
      }

      if (onSuccess) onSuccess(url, result);
      return result;
    } catch (err) {
      const msg = err.message || "Failed to upload file.";
      if (showToast) toast.error("Upload Failed", msg);
      if (onError) onError(err);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [folder, onSuccess, onError, showToast]);

  const uploadMultiple = useCallback(async (files, customFolder = null) => {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return [];
    const targetFolder = customFolder || folder;

    setUploading(true);
    setProgress(0);
    try {
      let results = [];
      if (fileArray.length === 1) {
        const single = await Api.upload.uploadFile(fileArray[0], targetFolder, (p) => setProgress(p));
        results = [single];
      } else {
        results = await Api.upload.uploadMultipleFiles(fileArray, targetFolder, (p) => setProgress(p));
      }

      const urls = results.map((r) => r?.url || r?.data?.url).filter(Boolean);

      if (showToast) {
        toast.success("Uploaded", `${results.length} file(s) uploaded successfully.`);
      }

      if (onSuccess) onSuccess(urls, results);
      return results;
    } catch (err) {
      const msg = err.message || "Failed to upload files.";
      if (showToast) toast.error("Upload Failed", msg);
      if (onError) onError(err);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [folder, onSuccess, onError, showToast]);

  // Convenience helper that takes FileList / File[] and returns string[] of URLs
  const uploadFiles = useCallback(async (files, customFolder = null) => {
    const results = await uploadMultiple(files, customFolder);
    return results.map((r) => r?.url || r?.data?.url).filter(Boolean);
  }, [uploadMultiple]);

  return {
    uploading,
    progress,
    uploadSingle,
    uploadMultiple,
    uploadFiles
  };
}

export default useFileUpload;
