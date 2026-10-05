import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  HardDrive,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  File,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Eye,
  Download,
  Grid,
  List,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
  Info,
  X
} from "lucide-react";
import { uploadService } from "@/services/api/upload.service.js";
import { toast } from "@/stores/ui.store.js";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";

// Helper for formatting byte sizes
function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Check if file is visual image
function isImage(mimeType = "", originalName = "") {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(originalName || "");
}

// Available folder categories for organization
const FOLDER_TABS = [
  { id: "all", label: "All Folders" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "brands", label: "Brands" },
  { id: "banners", label: "Banners" },
  { id: "documents", label: "Documents" },
  { id: "general", label: "General" },
];

export function AdminFilesPage() {
  // State
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSizeBytes: 0,
    provider: "s3",
    bucket: "vanom",
    region: "auto",
    folderBreakdown: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Controls
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'images' | 'documents'
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Modals & Active Selections
  const [previewFile, setPreviewFile] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Upload Modal State
  const [uploadFolder, setUploadFolder] = useState("products");
  const [selectedFilesToUpload, setSelectedFilesToUpload] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch stats from backend
  const fetchStats = useCallback(async () => {
    try {
      const res = await uploadService.getFileStats();
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error("Failed to load file stats", err);
    }
  }, []);

  // Fetch files list with current filters
  const fetchFiles = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = {
          page,
          limit: pagination.limit,
          sortBy,
          sortOrder,
        };

        if (selectedFolder !== "all") params.folder = selectedFolder;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (typeFilter !== "all") params.type = typeFilter;

        const res = await uploadService.getFiles(params);
        if (res) {
          setFiles(res.files || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        console.error("Failed to fetch files", err);
        toast.error("Failed to load media files", err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFolder, searchQuery, typeFilter, sortBy, sortOrder, pagination.limit]
  );

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refetch when filters or page changes
  useEffect(() => {
    fetchFiles(1);
  }, [fetchFiles]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchFiles(pagination.page)]);
    setIsRefreshing(false);
    toast.success("Refreshed", "Media library updated from AWS S3");
  };

  // Copy URL with clipboard & visual feedback
  const handleCopyUrl = (file, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    toast.success("URL Copied", "AWS S3 URL copied to clipboard");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Delete file action
  const handleDeleteConfirm = async () => {
    if (!deletingFile) return;
    setIsDeleting(true);
    try {
      await uploadService.deleteFile(deletingFile.id);
      toast.success("File Deleted", `${deletingFile.originalName} removed from AWS S3.`);
      setDeletingFile(null);
      if (previewFile?.id === deletingFile.id) {
        setPreviewFile(null);
      }
      fetchFiles(pagination.page);
      fetchStats();
    } catch (err) {
      toast.error("Delete Failed", err.message || "Could not delete file from AWS S3");
    } finally {
      setIsDeleting(false);
    }
  };

  // Upload handler
  const handleStartUpload = async () => {
    if (selectedFilesToUpload.length === 0) return;
    setIsUploading(true);
    setUploadProgress(10);

    try {
      if (selectedFilesToUpload.length === 1) {
        await uploadService.uploadFile(
          selectedFilesToUpload[0],
          uploadFolder,
          (percent) => setUploadProgress(percent)
        );
      } else {
        await uploadService.uploadMultipleFiles(
          selectedFilesToUpload,
          uploadFolder,
          (percent) => setUploadProgress(percent)
        );
      }

      toast.success(
        "Upload Complete",
        `Successfully uploaded ${selectedFilesToUpload.length} file(s) to folder "${uploadFolder}" on AWS S3`
      );
      setSelectedFilesToUpload([]);
      setIsUploadOpen(false);
      setUploadProgress(0);
      fetchFiles(1);
      fetchStats();
    } catch (err) {
      toast.error("Upload Failed", err.message || "Could not complete upload to S3");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDropFiles = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      setSelectedFilesToUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) {
      setSelectedFilesToUpload(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ─── Top Stats & AWS S3 Cloud Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Cloud className="w-3.5 h-3.5 animate-pulse" />
                AWS S3 Cloud Storage
              </span>
              <span className="text-xs text-slate-400">
                Bucket: <strong className="text-slate-200">{stats.bucket}</strong> ({stats.region})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <HardDrive className="w-8 h-8 text-emerald-400" />
              AWS S3 Media Library
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Centralized repository for all catalog photos, category banners, brand marks, and enterprise
              documents directly hosted on Amazon Web Services S3.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
              Sync / Refresh
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                setUploadFolder(selectedFolder !== "all" ? selectedFolder : "products");
                setIsUploadOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Upload className="w-4 h-4" />
              Upload Files to S3
            </Button>
          </div>
        </div>

        {/* Storage Metrics Row */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-0.5">Total Media Assets</span>
            <span className="text-xl font-bold text-white">{stats.totalFiles.toLocaleString()}</span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-0.5">Storage Footprint</span>
            <span className="text-xl font-bold text-emerald-400">
              {formatBytes(stats.totalSizeBytes)}
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-0.5">Storage Provider</span>
            <span className="text-xl font-bold text-white uppercase tracking-wider text-sm flex items-center gap-1.5 mt-1">
              <Database className="w-4 h-4 text-emerald-400" />
              {stats.provider === "s3" ? "Amazon S3" : stats.provider}
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-0.5">Current View</span>
            <span className="text-xl font-bold text-amber-300 capitalize text-sm flex items-center gap-1.5 mt-1">
              <FolderOpen className="w-4 h-4" />
              {selectedFolder === "all" ? "Root / All" : selectedFolder}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Folder Pills / Tabs Bar ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FOLDER_TABS.map((tab) => {
          const isActive = selectedFolder === tab.id;
          const count =
            tab.id === "all"
              ? stats.totalFiles
              : stats.folderBreakdown?.[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFolder(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-700/20"
                  : "bg-white text-text-secondary border border-border hover:bg-surface-muted hover:text-text-primary"
              }`}
            >
              {isActive ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4 text-slate-400" />}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Search, Filter, Sort & View Controls ─── */}
      <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Type Filter, Sort Selector & View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Type Filter */}
          <div className="flex items-center bg-surface-muted/80 p-1 rounded-xl border border-border">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                typeFilter === "all" ? "bg-white text-emerald-600 shadow-xs font-semibold" : "text-text-muted hover:text-text-primary"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter("images")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "images" ? "bg-white text-emerald-600 shadow-xs font-semibold" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <ImageIcon className="w-3 h-3" /> Images
            </button>
            <button
              onClick={() => setTypeFilter("documents")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "documents" ? "bg-white text-emerald-600 shadow-xs font-semibold" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <FileText className="w-3 h-3" /> Docs
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(":");
              setSortBy(field);
              setSortOrder(order);
            }}
            className="text-xs bg-white border border-border rounded-xl px-3 py-1.5 text-text-secondary focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="size:desc">Size: High to Low</option>
            <option value="size:asc">Size: Low to High</option>
            <option value="originalName:asc">Name: A-Z</option>
          </select>

          {/* Grid vs List View */}
          <div className="flex items-center bg-surface-muted/80 p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-white text-emerald-600 shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list" ? "bg-white text-emerald-600 shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Files Gallery View ─── */}
      {isLoading ? (
        <div className="min-h-[360px] bg-white rounded-2xl border border-border flex flex-col items-center justify-center p-12">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-md animate-pulse" />
            <Cloud className="w-12 h-12 text-emerald-600 relative z-10 animate-bounce" />
          </div>
          <p className="text-sm font-semibold text-text-primary">Loading files from AWS S3...</p>
          <p className="text-xs text-text-muted mt-1">Connecting to storage bucket: {stats.bucket}</p>
        </div>
      ) : files.length === 0 ? (
        <div className="min-h-[360px] bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-text-primary">No files in this folder</h3>
          <p className="text-xs text-text-muted max-w-sm mt-1 mb-5">
            {searchQuery
              ? `No files matching "${searchQuery}" in ${selectedFolder === "all" ? "any folder" : selectedFolder}.`
              : `You haven't uploaded any media into "${selectedFolder}" yet. Upload files to AWS S3 to make them available across the platform.`}
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setUploadFolder(selectedFolder !== "all" ? selectedFolder : "products");
              setIsUploadOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload File Now
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* ─── GRID VIEW ─── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => {
            const isImg = isImage(file.mimeType, file.originalName);
            const isCopied = copiedId === file.id;

            return (
              <div
                key={file.id}
                className="group relative bg-white rounded-2xl border border-border hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Visual Thumbnail Area */}
                <div
                  onClick={() => setPreviewFile(file)}
                  className="relative aspect-square w-full bg-slate-50 overflow-hidden cursor-pointer flex items-center justify-center border-b border-border/60"
                >
                  {isImg ? (
                    <img
                      src={file.url}
                      alt={file.originalName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <FileText className="w-12 h-12 stroke-[1.5]" />
                      <span className="text-[10px] font-mono uppercase mt-1 px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                        {file.originalName.split(".").pop()}
                      </span>
                    </div>
                  )}

                  {/* Folder Tag Badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-semibold text-white uppercase tracking-wider">
                    {file.folder || "general"}
                  </span>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFile(file);
                      }}
                      title="Preview"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleCopyUrl(file, e)}
                      title="Copy AWS S3 URL"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={file.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Open / Download"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* File Info Bar */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      className="text-xs font-semibold text-text-primary truncate"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {formatBytes(file.size)} •{" "}
                      {new Date(file.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Bottom Row Actions */}
                  <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
                    <button
                      onClick={(e) => handleCopyUrl(file, e)}
                      className={`text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        isCopied ? "text-emerald-600" : "text-slate-500 hover:text-emerald-600"
                      }`}
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copied" : "Copy URL"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingFile(file);
                      }}
                      title="Delete from S3"
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── LIST / TABLE VIEW ─── */
        <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted/60 text-text-secondary font-semibold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Folder</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {files.map((file) => {
                  const isImg = isImage(file.mimeType, file.originalName);
                  const isCopied = copiedId === file.id;

                  return (
                    <tr key={file.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewFile(file)}
                            className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 cursor-pointer flex items-center justify-center border border-border"
                          >
                            {isImg ? (
                              <img
                                src={file.url}
                                alt={file.originalName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span
                              onClick={() => setPreviewFile(file)}
                              className="font-semibold text-text-primary hover:text-emerald-600 cursor-pointer truncate block"
                              title={file.originalName}
                            >
                              {file.originalName}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono truncate block">
                              {file.storageKey}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {file.folder || "general"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{formatBytes(file.size)}</td>
                      <td className="py-3 px-4 text-text-muted uppercase text-[10px]">
                        {file.mimeType || "file"}
                      </td>
                      <td className="py-3 px-4 text-text-muted">
                        {new Date(file.createdAt).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyUrl(file)}
                            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                              isCopied
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-white border-border text-slate-600 hover:text-emerald-600 hover:border-emerald-300"
                            }`}
                            title="Copy S3 URL"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline text-[11px]">
                              {isCopied ? "Copied" : "Copy"}
                            </span>
                          </button>

                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 rounded-lg border border-border bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-300 cursor-pointer transition-colors"
                            title="Preview File"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={file.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-border bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-300 cursor-pointer transition-colors"
                            title="Download / Open"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => setDeletingFile(file)}
                            className="p-1.5 rounded-lg border border-border bg-white text-slate-400 hover:text-red-600 hover:border-red-300 cursor-pointer transition-colors"
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Pagination Bar ─── */}
      {pagination.totalPages > 1 && (
        <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs flex items-center justify-between gap-4">
          <span className="text-xs text-text-muted">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} files
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchFiles(pagination.page - 1)}
              className="text-xs px-2.5 py-1.5 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            <span className="px-3 py-1 bg-surface-muted rounded-lg text-xs font-mono font-semibold">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchFiles(pagination.page + 1)}
              className="text-xs px-2.5 py-1.5 rounded-lg cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Lightbox / Preview Modal ─── */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title={previewFile.originalName}
          size="2xl"
        >
          <div className="space-y-4">
            {/* Visual Display */}
            <div className="max-h-[60vh] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-800">
              {isImage(previewFile.mimeType, previewFile.originalName) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.originalName}
                  className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <FileText className="w-20 h-20 mx-auto text-emerald-400 mb-3" />
                  <p className="text-sm font-semibold text-white">Document File</p>
                  <p className="text-xs text-slate-400 mt-1">{previewFile.mimeType}</p>
                </div>
              )}
            </div>

            {/* File Metadata Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-muted/60 p-3.5 rounded-xl border border-border text-xs">
              <div>
                <span className="text-text-muted block text-[11px]">Storage Folder</span>
                <span className="font-semibold text-text-primary uppercase">
                  {previewFile.folder || "general"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">File Size</span>
                <span className="font-semibold text-text-primary">{formatBytes(previewFile.size)}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">MIME Type</span>
                <span className="font-semibold text-text-primary truncate block">
                  {previewFile.mimeType || "application/octet-stream"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Uploaded</span>
                <span className="font-semibold text-text-primary">
                  {new Date(previewFile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* AWS S3 URL Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  AWS S3 Public URL
                </span>
                <p className="text-xs font-mono text-slate-700 truncate select-all">{previewFile.url}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCopyUrl(previewFile)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {copiedId === previewFile.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy URL
                  </>
                )}
              </Button>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeletingFile(previewFile)}
                className="text-xs text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete File
              </Button>

              <div className="flex items-center gap-2">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface-muted border border-border rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </a>
                <Button variant="secondary" size="sm" onClick={() => setPreviewFile(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Direct AWS S3 Upload Modal ─── */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          if (!isUploading) {
            setIsUploadOpen(false);
            setSelectedFilesToUpload([]);
            setUploadProgress(0);
          }
        }}
        title="Upload Media to AWS S3"
        description="Store images and documents directly on Amazon S3 cloud storage"
        size="lg"
      >
        <div className="space-y-4">
          {/* Target Folder Selector */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Target AWS S3 Folder / Directory
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {["products", "categories", "brands", "banners", "general"].map((folderName) => (
                <button
                  key={folderName}
                  type="button"
                  onClick={() => setUploadFolder(folderName)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    uploadFolder === folderName
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs"
                      : "bg-white border-border text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  {folderName}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-1.5">
              Files will be stored with prefix: <code className="font-mono text-emerald-600">{uploadFolder}/</code>
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropFiles}
            className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-2xl p-8 text-center transition-colors cursor-pointer relative"
          >
            <input
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 mb-3">
              <Upload className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-text-primary">
              Drag & Drop files here, or click to browse
            </h4>
            <p className="text-xs text-text-muted mt-1">
              Supports JPEG, PNG, WebP, GIF, SVG, PDF, and Documents (up to 50MB per file)
            </p>
          </div>

          {/* Selected Files List Preview */}
          {selectedFilesToUpload.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">
                  {selectedFilesToUpload.length} file(s) selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFilesToUpload([])}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedFilesToUpload.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-surface-muted/60 p-2 rounded-xl text-xs border border-border"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate font-medium text-text-primary">{f.name}</span>
                    </div>
                    <span className="font-mono text-text-muted text-[11px] shrink-0 ml-2">
                      {formatBytes(f.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                <span>Uploading directly to AWS S3...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => {
                setIsUploadOpen(false);
                setSelectedFilesToUpload([]);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStartUpload}
              disabled={isUploading || selectedFilesToUpload.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              {isUploading ? "Uploading..." : `Upload ${selectedFilesToUpload.length} File(s) to S3`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Delete Confirmation Dialog ─── */}
      <ConfirmDialog
        isOpen={!!deletingFile}
        onClose={() => setDeletingFile(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete file from AWS S3?"
        description={`Are you sure you want to permanently delete "${deletingFile?.originalName}" from AWS S3 storage? Any product or banner referencing this URL may display a broken link.`}
        confirmText="Yes, Delete Permanently"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default AdminFilesPage;
