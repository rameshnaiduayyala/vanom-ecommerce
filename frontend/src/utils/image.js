const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const SERVER_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

export const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";

export function formatImageUrl(url) {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${SERVER_ORIGIN}${cleanPath}`;
}

export function isVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".m4v")
  );
}

export function resolveProductImageUrl(product) {
  if (!product) return FALLBACK_PRODUCT_IMAGE;

  // 1. Direct string images or media asset objects
  let rawUrl = null;

  if (Array.isArray(product.images) && product.images.length > 0) {
    const imgItem =
      product.images.find((img) => {
        const u = typeof img === "string" ? img : img.url || img.mediaAsset?.url || img.mediaAssetId;
        return u && !isVideoUrl(u);
      }) || product.images[0];

    if (typeof imgItem === "string") {
      rawUrl = imgItem;
    } else if (imgItem) {
      rawUrl = imgItem.url || imgItem.mediaAsset?.url || imgItem.mediaAsset?.path || imgItem.mediaAssetId || imgItem.file?.url;
    }
  }

  if (!rawUrl) {
    rawUrl = product.imageUrl || product.image;
  }

  if (!rawUrl) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  const formatted = formatImageUrl(rawUrl);
  return formatted || FALLBACK_PRODUCT_IMAGE;
}
