import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Play,
  Film,
} from "lucide-react";
import { isVideoUrl } from "@/utils/image.js";

const ZOOM_FACTOR = 2.6;

/**
 * ProductGallery — Supports multiple high-resolution images AND video playback.
 * - Interactive thumbnails (with video badge for videos)
 * - Amazon-style desktop hover zoom for images
 * - Full HTML5 Video player with controls & autoplay
 * - Fullscreen Lightbox viewer with zoom & pan for images, and full video playback
 */
export function ProductGallery({
  gallery = [],
  selectedImage = 0,
  onSelectImage,
  title = "",
}) {
  // Lightbox modal states
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(selectedImage);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Amazon Hover Zoom states
  const [isHovering, setIsHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState({ width: 170, height: 170 });
  const [zoomPercent, setZoomPercent] = useState({ x: 50, y: 50 });
  const mainImageContainerRef = useRef(null);

  const currentMedia = gallery[selectedImage] || gallery[0];
  const activeViewerMedia = gallery[viewerIndex] || gallery[0];
  const isCurrentVideo = isVideoUrl(currentMedia);
  const isActiveViewerVideo = isVideoUrl(activeViewerMedia);

  // Sync viewer index when selectedImage changes
  useEffect(() => {
    setViewerIndex(selectedImage);
  }, [selectedImage]);

  // Lightbox handlers
  const openViewer = (idx = selectedImage) => {
    setIsHovering(false);
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
    if (onSelectImage) {
      onSelectImage((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
    }
  }, [gallery.length, onSelectImage]);

  const handleNext = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setViewerIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
    if (onSelectImage) {
      onSelectImage((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
    }
  }, [gallery.length, onSelectImage]);

  const handleZoomIn = () => {
    if (isActiveViewerVideo) return;
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    if (isActiveViewerVideo) return;
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

  // Keyboard navigation & Shortcuts for Lightbox
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

  // Pan / Drag handlers in Lightbox
  const handleMouseDown = (e) => {
    if (zoomLevel <= 1 || isActiveViewerVideo) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1 || isActiveViewerVideo) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ── Amazon Hover Zoom Calculations ──
  const updateLensPosition = useCallback((e) => {
    if (!mainImageContainerRef.current) return;
    const rect = mainImageContainerRef.current.getBoundingClientRect();

    const lWidth = Math.round(rect.width / ZOOM_FACTOR);
    const lHeight = Math.round(rect.height / ZOOM_FACTOR);
    setLensSize({ width: lWidth, height: lHeight });

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const maxLensX = rect.width - lWidth;
    const maxLensY = rect.height - lHeight;

    let clampedX = mouseX - lWidth / 2;
    let clampedY = mouseY - lHeight / 2;

    clampedX = Math.max(0, Math.min(clampedX, maxLensX));
    clampedY = Math.max(0, Math.min(clampedY, maxLensY));

    setLensPos({ x: clampedX, y: clampedY });

    const pX = maxLensX > 0 ? (clampedX / maxLensX) * 100 : 50;
    const pY = maxLensY > 0 ? (clampedY / maxLensY) * 100 : 50;
    setZoomPercent({ x: pX, y: pY });
  }, []);

  const handleContainerMouseEnter = (e) => {
    if (isCurrentVideo) return; // Don't trigger hover zoom on video
    if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
      updateLensPosition(e);
      setIsHovering(true);
    }
  };

  const handleContainerMouseMove = (e) => {
    if (isHovering && !isCurrentVideo) {
      updateLensPosition(e);
    }
  };

  const handleContainerMouseLeave = () => {
    setIsHovering(false);
  };

  // Touch swipe handlers for Mobile
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  const handleMainTouchStart = (e) => {
    if (isCurrentVideo) return;
    setIsHovering(false);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleMainTouchEnd = (e) => {
    if (touchStartXRef.current === null || isCurrentVideo) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        onSelectImage(selectedImage < gallery.length - 1 ? selectedImage + 1 : 0);
      } else {
        onSelectImage(selectedImage > 0 ? selectedImage - 1 : gallery.length - 1);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <>
      <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-3 sm:gap-4 select-none relative">
        {/* ─── Thumbnail Strip ─── */}
        {gallery.length > 1 && (
          <div className="flex md:flex-col gap-2 shrink-0 md:max-h-[520px] overflow-x-auto md:overflow-y-auto no-scrollbar py-1">
            {gallery.map((mediaUrl, idx) => {
              const isVid = isVideoUrl(mediaUrl);
              const isSelected = selectedImage === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectImage(idx)}
                  onMouseEnter={() => !isVid && onSelectImage(idx)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border p-1 bg-white flex items-center justify-center overflow-hidden transition-all cursor-pointer shadow-2xs shrink-0 ${
                    isSelected
                      ? "border-[#003D2B] ring-2 ring-[#003D2B]/30 scale-102"
                      : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                  }`}
                  title={isVid ? `Play Video ${idx + 1}` : `View image ${idx + 1}`}
                >
                  {isVid ? (
                    <div className="w-full h-full bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center relative">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      <span className="text-[9px] font-bold mt-0.5 tracking-tight font-mono">VIDEO</span>
                    </div>
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Main Media Column ─── */}
        <div className="flex-1 flex flex-col gap-2 relative">
          {/* Main Media Box */}
          <div
            ref={mainImageContainerRef}
            className={`bg-white rounded-3xl sm:rounded-2xl border border-gray-200/90 relative aspect-square sm:aspect-[4/3] md:aspect-square w-full max-h-[520px] shadow-sm group overflow-hidden touch-pan-y ${
              isCurrentVideo ? "cursor-default" : "cursor-crosshair"
            }`}
            onMouseEnter={handleContainerMouseEnter}
            onMouseMove={handleContainerMouseMove}
            onMouseLeave={handleContainerMouseLeave}
            onClick={() => !isCurrentVideo && openViewer(selectedImage)}
            onTouchStart={handleMainTouchStart}
            onTouchEnd={handleMainTouchEnd}
          >
            {gallery.length > 0 ? (
              <div className="relative w-full h-full overflow-hidden">
                {isCurrentVideo ? (
                  /* ── Video Player ── */
                  <div className="w-full h-full bg-black flex items-center justify-center relative">
                    <video
                      key={currentMedia}
                      src={currentMedia}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full max-h-[520px] object-contain"
                    />
                  </div>
                ) : (
                  /* ── Sliding Image Track ── */
                  <div
                    className="flex h-full w-full transition-transform duration-300 ease-out will-change-transform"
                    style={{ transform: `translateX(-${selectedImage * 100}%)` }}
                  >
                    {gallery.map((mediaUrl, idx) => (
                      <div
                        key={idx}
                        className="w-full h-full flex-none flex items-center justify-center p-2 sm:p-4"
                        title="Click to expand view"
                      >
                        {isVideoUrl(mediaUrl) ? (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <video
                              src={mediaUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={`${title} - view ${idx + 1}`}
                            className="w-full h-full object-contain select-none pointer-events-none"
                            loading={idx === 0 ? "eager" : "lazy"}
                            draggable={false}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Amazon-style Hover Magnifier Lens (Desktop - Images only) ── */}
                {isHovering && !isViewerOpen && !isCurrentVideo && (
                  <div
                    className="hidden lg:block absolute pointer-events-none border-2 border-emerald-600/60 bg-emerald-500/15 backdrop-brightness-95 shadow-sm rounded-lg transition-none z-20"
                    style={{
                      width: `${lensSize.width}px`,
                      height: `${lensSize.height}px`,
                      left: `${lensPos.x}px`,
                      top: `${lensPos.y}px`,
                    }}
                  />
                )}

                {/* ── Next/Prev Arrow Overlays ── */}
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectImage(selectedImage > 0 ? selectedImage - 1 : gallery.length - 1);
                      }}
                      className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-800 shadow-md border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-95"
                      title="Previous"
                      aria-label="Previous media"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectImage(selectedImage < gallery.length - 1 ? selectedImage + 1 : 0);
                      }}
                      className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-800 shadow-md border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-95"
                      title="Next"
                      aria-label="Next media"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* ── Carousel Dots Indicator ── */}
                {gallery.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-sm pointer-events-auto">
                    {gallery.map((mediaUrl, idx) => {
                      const isVid = isVideoUrl(mediaUrl);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectImage(idx);
                          }}
                          aria-label={`Go to item ${idx + 1}`}
                          className={`rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
                            selectedImage === idx
                              ? "w-5 h-1.5 bg-white shadow-xs"
                              : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                          } ${isVid ? "ring-1 ring-emerald-400" : ""}`}
                        />
                      );
                    })}
                  </div>
                )}

                {/* ── Expand to Full-Screen Viewer Button ── */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openViewer(selectedImage);
                  }}
                  className="absolute right-3 top-3 z-10 p-2 sm:p-2.5 rounded-xl bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-700 border border-gray-200/90 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold hover:shadow-md active:scale-95"
                  title="Open full-screen viewer"
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

          {/* ── Helper Hint Text ── */}
          <div className="hidden sm:flex items-center justify-center gap-2 py-1 text-xs text-gray-500 font-medium">
            {isCurrentVideo ? (
              <div className="flex items-center gap-1.5 text-[#006B3C] font-semibold">
                <Film className="w-3.5 h-3.5" />
                <span>Playing product video demonstration</span>
              </div>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {isHovering ? "Click image to open expanded view" : "Roll over image to zoom in"}
                </span>
              </>
            )}
          </div>

          {/* ── Floating Zoom Preview Window (Desktop - Images only) ── */}
          {isHovering && !isViewerOpen && !isCurrentVideo && (
            <div
              className="hidden lg:block absolute left-[calc(100%+14px)] xl:left-[calc(100%+24px)] top-0 w-full min-w-[760px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200/90 z-50 overflow-hidden pointer-events-none animate-in fade-in duration-150"
            >
              <div
                className="w-full h-full bg-white bg-no-repeat transition-none"
                style={{
                  backgroundImage: `url(${currentMedia})`,
                  backgroundPosition: `${zoomPercent.x}% ${zoomPercent.y}%`,
                  backgroundSize: `${ZOOM_FACTOR * 100}% ${ZOOM_FACTOR * 100}%`,
                }}
              />
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-xs text-[11px] font-semibold text-white tracking-wide flex items-center gap-1.5 shadow-sm">
                <Search className="w-3 h-3 text-emerald-400" />
                <span>{ZOOM_FACTOR}x Zoom</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── FULL-SCREEN MEDIA VIEWER LIGHTBOX MODAL ─── */}
      {isViewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-xl flex flex-col justify-between animate-in fade-in duration-200 select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Top Control Bar */}
          <div className="w-full py-3.5 px-6 bg-white/90 border-b border-slate-200/80 flex items-center justify-between gap-4 z-10 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-slate-800 tracking-tight">
                {title || "Product Media"}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                {viewerIndex + 1} / {gallery.length}
              </span>
              {isActiveViewerVideo && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Video
                </span>
              )}
            </div>

            {/* Viewer Zoom & Close Tools */}
            <div className="flex items-center gap-2">
              {!isActiveViewerVideo && (
                <>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 cursor-pointer shadow-2xs"
                    title="Zoom in (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 cursor-pointer shadow-2xs"
                    title="Zoom out (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    disabled={zoomLevel === 1 && panPosition.x === 0 && panPosition.y === 0}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 cursor-pointer shadow-2xs"
                    title="Reset Zoom (0)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={closeViewer}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer shadow-2xs ml-2"
                title="Close Viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Viewer Stage */}
          <div
            className={`flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden ${
              isActiveViewerVideo ? "" : zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            }`}
            onMouseDown={handleMouseDown}
          >
            {/* Prev Arrow */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-md transition-all cursor-pointer active:scale-95"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Media Content */}
            <div
              className="transition-transform duration-100 ease-out select-none"
              style={{
                transform: isActiveViewerVideo
                  ? "none"
                  : `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
              }}
            >
              {isActiveViewerVideo ? (
                <video
                  key={activeViewerMedia}
                  src={activeViewerMedia}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[75vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <img
                  src={activeViewerMedia}
                  alt={`${title} - view ${viewerIndex + 1}`}
                  className="max-h-[72vh] max-w-[85vw] object-contain drop-shadow-xl rounded-xl pointer-events-none"
                />
              )}
            </div>

            {/* Next Arrow */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-md transition-all cursor-pointer active:scale-95"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="w-full py-3 sm:py-4 px-6 bg-white/90 border-t border-slate-200/80 flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar z-10 shadow-2xs">
              {gallery.map((mediaUrl, idx) => {
                const isVid = isVideoUrl(mediaUrl);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setViewerIndex(idx);
                      if (onSelectImage) onSelectImage(idx);
                      setZoomLevel(1);
                      setPanPosition({ x: 0, y: 0 });
                    }}
                    className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 p-1 bg-white flex items-center justify-center overflow-hidden transition-all cursor-pointer shrink-0 shadow-2xs ${
                      viewerIndex === idx
                        ? "border-[#003D2B] ring-2 ring-[#003D2B]/30 scale-105 opacity-100"
                        : "border-slate-200 hover:border-slate-400 opacity-60 hover:opacity-100"
                    }`}
                    title={isVid ? `Play Video ${idx + 1}` : `View image ${idx + 1}`}
                  >
                    {isVid ? (
                      <div className="w-full h-full bg-slate-900 text-white rounded-lg flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 fill-white text-white" />
                      </div>
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ProductGallery;
