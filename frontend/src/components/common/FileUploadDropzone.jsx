import React, { useRef, useState } from "react";
import { UploadCloud, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useFileUpload } from "@/features/common/hooks/useFileUpload.js";

/**
 * Reusable File/Image Upload Dropzone & Button Component.
 *
 * @param {Object} props
 * @param {string} [props.folder="general"] - Target backend upload subfolder (e.g. "products", "categories", "banners", "brands", "avatars")
 * @param {boolean} [props.multiple=false] - Allow multiple file uploads
 * @param {string} [props.accept="image/jpeg,image/png,image/webp,image/gif"] - Accepted mime types
 * @param {(urlOrUrls: string | string[], fileOrFiles: any) => void} props.onUploadSuccess - Callback receiving the uploaded URL(s)
 * @param {string} [props.label="Click or drag files here to upload"] - Header text
 * @param {string} [props.hint="Supports JPG, PNG, WebP (auto-optimized & uploaded)"] - Subtext description
 * @param {string} [props.className=""] - Extra Tailwind classes
 * @param {boolean} [props.compact=false] - Compact button/strip layout instead of large dropzone
 * @param {React.ReactNode} [props.children] - Custom trigger content
 */
export function FileUploadDropzone({
  folder = "general",
  multiple = false,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  onUploadSuccess,
  label = "Click or drag files here to upload",
  hint = "Supports JPG, PNG, WebP (auto-optimized and returns direct URL)",
  className = "",
  compact = false,
  children
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { uploading, progress, uploadMultiple, uploadSingle } = useFileUpload({
    folder,
    showToast: true,
    onSuccess: (urlsOrUrl, raw) => {
      if (onUploadSuccess) {
        onUploadSuccess(urlsOrUrl, raw);
      }
    }
  });

  const handleFiles = async (files) => {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return;

    if (multiple) {
      await uploadMultiple(fileArray);
    } else {
      await uploadSingle(fileArray[0]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (uploading) return;
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={uploading}
      />

      {children ? (
        <div onClick={() => !uploading && fileInputRef.current?.click()}>
          {typeof children === "function" ? children({ uploading, progress }) : children}
        </div>
      ) : compact ? (
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-[#358B5B] bg-slate-50 hover:bg-emerald-50/40 text-slate-700 hover:text-[#204B38] transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#358B5B]" />
              <span>Uploading ({progress}%)...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-[#358B5B]" />
              <span>Upload Image</span>
            </>
          )}
        </button>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            uploading
              ? "border-[#358B5B] bg-emerald-50/40 cursor-wait"
              : isDragOver
              ? "border-[#358B5B] bg-emerald-50/60 scale-[0.99]"
              : "border-slate-200 hover:border-[#358B5B] hover:bg-emerald-50/20 bg-slate-50/40"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-emerald-800">
              <Loader2 className="w-8 h-8 animate-spin text-[#358B5B]" />
              <div className="space-y-1">
                <p className="text-xs font-bold">Uploading & Optimizing Media...</p>
                {progress > 0 && (
                  <p className="text-[11px] text-slate-500 font-mono font-semibold">{progress}%</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-full bg-emerald-100/80 text-[#204B38] flex items-center justify-center shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUploadDropzone;
