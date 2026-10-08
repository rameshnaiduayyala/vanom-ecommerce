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

  // Touch swipe & Drag scroll handlers for Amazon-style manual scroll
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const isDraggingMainRef = useRef(false);
  const dragStartXRef = useRef(null);

  const handleMainTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleMainTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Only register horizontal swipe if it's more horizontal than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        // Swiped left -> next image
        onSelectImage(selectedImage < gallery.length - 1 ? selectedImage + 1 : 0);
      } else {
        // Swiped right -> prev image
        onSelectImage(selectedImage > 0 ? selectedImage - 1 : gallery.length - 1);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleMainMouseDown = (e) => {
    dragStartXRef.current = e.clientX;
    isDraggingMainRef.current = false;
  };

  const handleMainMouseMove = (e) => {
    if (dragStartXRef.current !== null) {
      if (Math.abs(dragStartXRef.current - e.clientX) > 6) {
        isDraggingMainRef.current = true;
      }
    }
  };

  const handleMainMouseUp = (e) => {
    if (dragStartXRef.current !== null && isDraggingMainRef.current) {
      const diffX = dragStartXRef.current - e.clientX;
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          onSelectImage(selectedImage < gallery.length - 1 ? selectedImage + 1 : 0);
        } else {
          onSelectImage(selectedImage > 0 ? selectedImage - 1 : gallery.length - 1);
        }
      }
    }
    dragStartXRef.current = null;
    setTimeout(() => {
      isDraggingMainRef.current = false;
    }, 50);
  };

  const handleMainImageClick = () => {
    if (!isDraggingMainRef.current) {
      openViewer(selectedImage);
    }
  };

  return (
    <>
      <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-3 sm:gap-4 select-none">
        {/* Thumbnail Strip (Desktop vertical, Mobile horizontal scrollable) */}
        {gallery.length > 1 && (
          <div className="hidden sm:flex md:flex-col gap-2 shrink-0 md:max-h-[500px] overflow-x-auto md:overflow-y-auto no-scrollbar py-1">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectImage(idx)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border p-1 bg-white flex items-center justify-center overflow-hidden transition-all cursor-pointer shadow-2xs ${selectedImage === idx
                    ? "border-[#003D2B] ring-2 ring-[#003D2B]/30 scale-102"
                    : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                  }`}
                title={`Thumbnail ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </button>
            ))}
          </div>
        )}

        {/* Central Main Image Container with Amazon-style touch/drag swipe and pagination dots */}
        <div
          className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 relative min-h-[350px] sm:min-h-[460px] md:min-h-[500px] shadow-sm group overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
          onTouchStart={handleMainTouchStart}
          onTouchEnd={handleMainTouchEnd}
          onMouseDown={handleMainMouseDown}
          onMouseMove={handleMainMouseMove}
          onMouseUp={handleMainMouseUp}
        >
          {gallery.length > 0 ? (
            <div className="relative w-full h-full min-h-[350px] sm:min-h-[460px] md:min-h-[500px] overflow-hidden">
              {/* Sliding Image Track for smooth Amazon-like manual scroll experience */}
              <div
                className="flex h-full w-full transition-transform duration-300 ease-out will-change-transform"
                style={{ transform: `translateX(-${selectedImage * 100}%)` }}
              >
                {gallery.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={handleMainImageClick}
                    className="w-full h-full min-h-[350px] sm:min-h-[460px] md:min-h-[500px] flex-none flex items-center justify-center p-6 sm:p-10 cursor-zoom-in"
                    title="Click to enlarge"
                  >
                    <img
                      src={img}
                      alt={`${title} - view ${idx + 1}`}
                      className="max-h-[340px] sm:max-h-[440px] md:max-h-[480px] w-full object-contain drop-shadow-md select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]"
                      loading={idx === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* Amazon-style Carousel Dots Indicator */}
              {gallery.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-sm pointer-events-auto">
                  {gallery.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectImage(idx);
                      }}
                      aria-label={`Go to image ${idx + 1}`}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${selectedImage === idx
                          ? "w-5 h-1.5 bg-white shadow-xs"
                          : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* Expand to Full-Screen Image Viewer Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openViewer(selectedImage);
                }}
                className="absolute right-3 top-3 z-10 p-2 sm:p-2.5 rounded-xl bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-700 border border-gray-200/90 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold hover:shadow-md active:scale-95"
                title="Open full-screen image viewer"
              >
                <Maximize2 className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Enlarge</span>
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-emerald-50/70 rounded-2xl border-2 border-dashed border-emerald-300">
              <span className="font-extrabold text-2xl text-[#1a3c2e] leading-snug max-w-sm">
                {title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── FULL-SCREEN IMAGE VIEWER LIGHTBOX MODAL (CLEAN LIGHT THEME) ─── */}
      {isViewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-xl flex flex-col justify-between animate-in fade-in duration-200 select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Top Control Bar */}
          <div className="w-full px-4 sm:px-6 py-3.5 flex items-center justify-between text-slate-800 border-b border-slate-200/80 bg-white/80 backdrop-blur-md z-10 shadow-2xs">
            {/* Title & Counter */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                {title}
              </span>
              {gallery.length > 1 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#003D2B] border border-slate-200">
                  {viewerIndex + 1} / {gallery.length}
                </span>
              )}
            </div>

            {/* Action Buttons: Zoom & Close */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold px-2 text-[#003D2B]">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-colors border-l border-slate-200 ml-0.5 cursor-pointer"
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
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-all cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
                title="Close Viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Viewer Stage */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4 sm:p-8 bg-slate-50/60">
            {/* Previous Image Arrow */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-md transition-all cursor-pointer active:scale-95"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Displayed Image */}
            <div
              onDoubleClick={toggleDoubleZoom}
              onMouseDown={handleMouseDown}
              className={`relative max-w-full max-h-full flex items-center justify-center transition-transform ${
                zoomLevel > 1
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
                className="max-h-[72vh] max-w-[85vw] object-contain drop-shadow-xl rounded-xl pointer-events-none"
              />
            </div>

            {/* Next Image Arrow */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-md transition-all cursor-pointer active:scale-95"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="w-full py-3 sm:py-4 px-6 bg-white/90 border-t border-slate-200/80 flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar z-10 shadow-2xs">
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
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 p-1 bg-white flex items-center justify-center overflow-hidden transition-all cursor-pointer shrink-0 shadow-2xs ${
                    viewerIndex === idx
                      ? "border-[#003D2B] ring-2 ring-[#003D2B]/30 scale-105 opacity-100"
                      : "border-slate-200 hover:border-slate-400 opacity-60 hover:opacity-100"
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
