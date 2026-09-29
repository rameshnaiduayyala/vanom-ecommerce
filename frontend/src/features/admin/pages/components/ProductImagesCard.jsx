import React from "react";
import { UploadCloud, X } from "lucide-react";

export function ProductImagesCard({ formData, handleAddImageUrl, handleRemoveImageUrl }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <UploadCloud className="w-4 h-4 text-[#358B5B]" />
        <span>Product Images (images[])</span>
      </h3>

      <div className="space-y-3">
        {/* Image Grid Preview */}
        <div className="flex flex-wrap gap-3">
          {(formData.images || []).map((imgUrl, index) => (
            <div
              key={index}
              className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
            >
              <img
                src={imgUrl}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80";
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImageUrl(index)}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#204B38] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Direct Image URL Inputs */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-700">Add Image URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              id="newImageUrlInput"
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImageUrl(e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("newImageUrlInput");
                if (input) {
                  handleAddImageUrl(input.value);
                  input.value = "";
                }
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Add Image
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste public image URLs or CDN paths. The first image will be set as primary thumbnail.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductImagesCard;
