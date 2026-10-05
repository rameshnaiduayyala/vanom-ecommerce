import React, { useState, useEffect, useCallback } from "react";
import {
  Modal
} from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { uploadService } from "@/services/api/upload.service.js";
import { toast } from "@/stores/ui.store.js";
import {
  Search,
  Upload,
  HardDrive,
  Folder,
  Image as ImageIcon,
  FileText,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  Cloud
} from "lucide-react";

function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const FOLDERS = ["all", "products", "categories", "brands", "banners", "general"];

/**
 * Reusable Media Picker Modal for selecting or uploading AWS S3 files across Admin forms.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Modal close handler
 * @param {(url: string, file: Object) => void} props.onSelect - Callback with selected file URL and file record
 * @param {string} [props.defaultFolder="all"] - Default folder to display ("products", "categories", etc.)
 * @param {string} [props.title="Select Media from AWS S3"] - Modal title
 * @param {'all' | 'images' | 'documents'} [props.allowedType="images"] - File type filter
 * @param {string} [props.currentValue=""] - Current URL if any, for highlighting
 */
export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  defaultFolder = "all",
  title = "Select Media from AWS S3",
  allowedType = "images",
  currentValue = "",
}) {
  const [activeTab, setActiveTab] = useState("browse"); // 'browse' | 'upload'
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [folder, setFolder] = useState(defaultFolder);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Upload Tab State
  const [uploadFolder, setUploadFolder] = useState(defaultFolder !== "all" ? defaultFolder : "products");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch files from AWS S3
  const loadFiles = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: 18,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (folder !== "all") params.folder = folder;
      if (search.trim()) params.search = search.trim();
      if (allowedType !== "all") params.type = allowedType;

      const res = await uploadService.getFiles(params);
      if (res) {
        setFiles(res.files || []);
        if (res.pagination) {
          setPage(res.pagination.page);
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load files in media picker", err);
    } finally {
      setIsLoading(false);
    }
  }, [folder, search, allowedType]);

  useEffect(() => {
    if (isOpen) {
      loadFiles(1);
      setSelectedFile(null);
    }
  }, [isOpen, loadFiles]);

  // Handle direct file upload to S3
  const handleUploadFiles = async (filesToUpload) => {
    if (!filesToUpload || filesToUpload.length === 0) return;
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const file = filesToUpload[0];
      const uploaded = await uploadService.uploadFile(file, uploadFolder, (p) => setUploadProgress(p));
      
      toast.success("Uploaded to AWS S3", file.name);
      setIsUploading(false);
      setUploadProgress(0);

      // Select newly uploaded file & switch to browse
      setSelectedFile(uploaded);
      setActiveTab("browse");
      setFolder(uploadFolder);
      loadFiles(1);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("Upload Failed", err.message || "Could not upload to S3");
    }
  };

  const handleConfirmSelect = () => {
    if (!selectedFile) return;
    onSelect(selectedFile.url, selectedFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Choose an existing asset stored in AWS S3 or upload a fresh file"
      size="2xl"
    >
      <div className="space-y-4 font-sans">
        {/* Top Tab Bar & Cloud Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "browse"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-surface-muted text-text-secondary hover:text-text-primary"
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Browse S3 Library
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "upload"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-surface-muted text-text-secondary hover:text-text-primary"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New Asset
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>AWS S3 Cloud</span>
          </div>
        </div>

        {/* ─── BROWSE TAB ─── */}
        {activeTab === "browse" && (
          <div className="space-y-3">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
              {/* Folder Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                {FOLDERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFolder(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                      folder === f
                        ? "bg-slate-900 text-white font-semibold"
                        : "bg-surface-muted text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search file name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Thumbnails Grid */}
            <div className="min-h-[280px] max-h-[400px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-text-muted">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                  <span className="text-xs">Loading files from S3...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-surface-muted/30 rounded-2xl border border-dashed border-border">
                  <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-text-primary">No media found</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Try another folder or upload an asset in the Upload tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {files.map((file) => {
                    const isSelected = selectedFile?.id === file.id || (currentValue && file.url === currentValue);
                    const isImg = file.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.originalName);

                    return (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`group relative rounded-xl border-2 overflow-hidden aspect-square bg-slate-100 cursor-pointer transition-all ${
                          isSelected
                            ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-95"
                            : "border-transparent hover:border-slate-300"
                        }`}
                      >
                        {isImg ? (
                          <img
                            src={file.url}
                            alt={file.originalName}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-400">
                            <FileText className="w-8 h-8" />
                            <span className="text-[9px] uppercase mt-1 truncate max-w-full">
                              {file.originalName.split(".").pop()}
                            </span>
                          </div>
                        )}

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white truncate font-medium">{file.originalName}</p>
                          <p className="text-[9px] text-slate-300 font-mono">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <span className="text-text-muted">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => loadFiles(page - 1)}
                    className="text-xs px-2 py-1 rounded-lg"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => loadFiles(page + 1)}
                    className="text-xs px-2 py-1 rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── UPLOAD TAB ─── */}
        {activeTab === "upload" && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Upload Target Folder:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {["products", "categories", "brands", "banners", "general"].map((folderName) => (
                  <button
                    key={folderName}
                    type="button"
                    onClick={() => setUploadFolder(folderName)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      uploadFolder === folderName
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "bg-white border-border text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    {folderName}
                  </button>
                ))}
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer?.files?.length) {
                  handleUploadFiles(e.dataTransfer.files);
                }
              }}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-2xl p-8 text-center transition-colors cursor-pointer relative"
            >
              <input
                type="file"
                accept={allowedType === "images" ? "image/*" : undefined}
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleUploadFiles(e.target.files);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">
                Click or drag & drop to upload to AWS S3
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                Target: <code className="font-mono text-emerald-600">{uploadFolder}/</code>
              </p>
            </div>

            {isUploading && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                  <span>Uploading to Amazon S3...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Bottom Actions Bar ─── */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Selected File Preview Box */}
          <div className="flex items-center gap-2 min-w-0">
            {selectedFile ? (
              <>
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-border flex items-center justify-center">
                  {selectedFile.mimeType?.startsWith("image/") ? (
                    <img src={selectedFile.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {selectedFile.originalName || "Selected asset"}
                  </p>
                  <p className="text-[10px] text-text-muted font-mono truncate">{selectedFile.url}</p>
                </div>
              </>
            ) : (
              <span className="text-xs text-text-muted italic">No asset selected</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedFile}
              onClick={handleConfirmSelect}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
            >
              Insert Selected File
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default MediaPickerModal;
