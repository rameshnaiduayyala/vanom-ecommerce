import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export function ProductGallery({
  gallery = [],
  selectedImage = 0,
  onSelectImage,
  title = "",
}) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(selectedImage);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const currentImage = gallery[selectedImage] || gallery[0];
  const activeViewerImage = gallery[viewerIndex] || gallery[0];

  // Sync viewer index when opening modal or selectedImage changes
  useEffect(() => {
    setViewerIndex(selectedImage);
  }, [selectedImage]);

  const openViewer = (idx = selectedImage) => {
    setViewerIndex(idx);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsViewerOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    document.body.style.overflow = "";
  }, []);

  const handlePrev = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setViewerIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
    onSelectImage((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  }, [gallery.length, onSelectImage]);

  const handleNext = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setViewerIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
    onSelectImage((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  }, [gallery.length, onSelectImage]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const toggleDoubleZoom = () => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      setZoomLevel(2);
    }
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeViewer();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "+" || e.key === "=") handleZoomIn();
      else if (e.key === "-") handleZoomOut();
      else if (e.key === "0") handleResetZoom();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isViewerOpen, closeViewer, handlePrev, handleNext]);

  // Pan / Drag handlers when zoomed in
  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div className="lg:col-span-6 flex gap-4">
        {/* Vertical Thumbnail Strip (Only show if multiple images exist) */}
        {gallery.length > 1 && (
          <div className="flex flex-col gap-2.5 shrink-0 max-h-[460px] overflow-y-auto no-scrollbar py-1">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectImage(idx)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border p-1 bg-white flex items-center justify-center overflow-hidden transition-all cursor-pointer shadow-2xs ${selectedImage === idx
                  ? "border-[#003D2B] ring-2 ring-[#003D2B]/20 scale-102"
                  : "border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100"
                  }`}
                title={`Thumbnail ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}

        {/* Central Main Image Container */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200/80 relative min-h-[380px] sm:min-h-[460px] shadow-xs group overflow-hidden">
          {currentImage ? (
            <>
              <div
                onClick={() => openViewer(selectedImage)}
                className="absolute inset-0 flex items-center justify-center cursor-zoom-in p-6 sm:p-10"
                title="Click to open full-screen viewer"
              >
                <img
                  src={currentImage}
                  alt={title}
                  className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>

              {/* Expand to Full-Screen Image Viewer Button */}
              <button
                type="button"
                onClick={() => openViewer(selectedImage)}
                className="absolute right-4 bottom-4 z-10 p-2.5 rounded-xl bg-white/95 hover:bg-white text-gray-700 hover:text-emerald-700 border border-gray-200 shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold hover:shadow-lg active:scale-95"
                title="Open full-screen image viewer"
              >
                <Maximize2 className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Enlarge</span>
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-emerald-50/70 rounded-2xl border-2 border-dashed border-emerald-300">
              <span className="font-extrabold text-2xl text-[#1a3c2e] leading-snug max-w-sm">
                {title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── FULL-SCREEN IMAGE VIEWER LIGHTBOX MODAL ─── */}
      {isViewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200 select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Top Control Bar */}
          <div className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-white border-b border-white/10 bg-black/40 z-10">
            {/* Title & Counter */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-gray-300 truncate max-w-xs sm:max-w-md">
                {title}
              </span>
              {gallery.length > 1 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-emerald-400 border border-white/10">
                  {viewerIndex + 1} / {gallery.length}
                </span>
              )}
            </div>

            {/* Action Buttons: Zoom & Close */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold px-2 text-emerald-400">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors border-l border-white/10 ml-0.5"
                    title="Reset Zoom (0)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeViewer}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-all cursor-pointer border border-white/10"
                title="Close Viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Viewer Stage */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4 sm:p-8">
            {/* Previous Image Arrow */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer backdrop-blur-md active:scale-95"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Displayed Image */}
            <div
              onDoubleClick={toggleDoubleZoom}
              onMouseDown={handleMouseDown}
              className={`relative max-w-full max-h-full flex items-center justify-center transition-transform ${zoomLevel > 1
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-zoom-in"
                }`}
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                transition: isDragging ? "none" : "transform 0.2s ease-out",
              }}
            >
              <img
                src={activeViewerImage}
                alt={`${title} - view ${viewerIndex + 1}`}
                className="max-h-[72vh] max-w-[85vw] object-contain drop-shadow-2xl rounded-lg pointer-events-none"
              />
            </div>

            {/* Next Image Arrow */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer backdrop-blur-md active:scale-95"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="w-full py-4 px-6 bg-black/50 border-t border-white/10 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar z-10">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setViewerIndex(idx);
                    onSelectImage(idx);
                    setZoomLevel(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className={`w-14 h-14 rounded-xl border-2 p-1 bg-white/10 flex items-center justify-center overflow-hidden transition-all cursor-pointer shrink-0 ${viewerIndex === idx
                    ? "border-emerald-400 ring-2 ring-emerald-400/40 scale-105 opacity-100"
                    : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-90"
                    }`}
                  title={`View image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ProductGallery;
