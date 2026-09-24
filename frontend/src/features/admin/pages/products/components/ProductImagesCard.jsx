import React, { useState } from "react";
import { UploadCloud, X, Plus, Image as ImageIcon } from "lucide-react";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone.jsx";

export function ProductImagesCard({ formData, handleAddImageUrl, handleRemoveImageUrl }) {
  const [urlInput, setUrlInput] = useState("");

  const handleAdd = () => {
    if (!urlInput.trim()) return;
    handleAddImageUrl(urlInput);
    setUrlInput("");
  };

  const handleUploadedUrls = (urlsOrUrl) => {
    if (Array.isArray(urlsOrUrl)) {
      urlsOrUrl.forEach((u) => u && handleAddImageUrl(u));
    } else if (typeof urlsOrUrl === "string") {
      handleAddImageUrl(urlsOrUrl);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-[#358B5B]" />
          <span>Product Media Gallery</span>
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">
          {(formData.images || []).length} images uploaded
        </span>
      </div>

      <div className="space-y-4">
        {/* Reusable File Upload Dropzone */}
        <FileUploadDropzone
          folder="products"
          multiple={true}
          onUploadSuccess={handleUploadedUrls}
          label="Click or drop product photos here"
          hint="Accepts high-res JPG, PNG, WebP (auto-compressed to WebP on upload)"
        />

        {/* Image Grid Preview */}
        <div className="flex flex-wrap gap-3">
          {(formData.images || []).map((imgUrl, index) => (
            <div
              key={index}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
            >
              <img
                src={imgUrl}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80";
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImageUrl(index)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {index === 0 ? (
                <span className="absolute bottom-1.5 left-1.5 bg-[#204B38] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  Primary
                </span>
              ) : (
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded shadow-xs">
                  #{index + 1}
                </span>
              )}
            </div>
          ))}

          {(!formData.images || formData.images.length === 0) && (
            <div className="w-full py-6 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs">
              <ImageIcon className="w-7 h-7 text-slate-300 mb-1" />
              <span>No product images added yet. Upload files above or add an image URL below.</span>
            </div>
          )}
        </div>

        {/* Direct Image URL Inputs */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-bold text-slate-700">Or Add Image from URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... or external image URL"
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:bg-white transition-all text-slate-800"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!urlInput.trim()}
              className="px-4 py-2 bg-[#204B38] hover:bg-[#18392B] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductImagesCard;
