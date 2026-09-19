import React from "react";
import { Maximize2 } from "lucide-react";

export function ProductGallery({ gallery = [], selectedImage = 0, onSelectImage, title = "" }) {
  const currentImage = gallery[selectedImage] || gallery[0];

  return (
    <div className="lg:col-span-6 flex gap-4">
      {/* Vertical Thumbnail Strip (Only show if multiple images exist) */}
      {gallery.length > 1 && (
        <div className="flex flex-col gap-2.5 shrink-0">
          {gallery.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectImage(idx)}
              className={`w-14 h-14 rounded-xl border p-1 bg-gray-50/50 flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                selectedImage === idx
                  ? "border-[#003D2B] ring-2 ring-[#003D2B]/20"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {/* Central Main Image Container */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[440px]">
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={title}
              className="max-h-[340px] sm:max-h-[400px] w-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
            />
            <button
              type="button"
              className="absolute right-4 bottom-4 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors cursor-pointer"
              title="Expand image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full min-h-[320px] flex items-center justify-center text-center p-8 bg-emerald-50/70 rounded-xl border-2 border-dashed border-emerald-300">
            <span className="font-extrabold text-2xl text-[#1a3c2e] leading-snug max-w-sm">
              {title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
