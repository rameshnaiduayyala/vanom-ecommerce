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

export function resolveProductImageUrl(product) {
  if (!product) return FALLBACK_PRODUCT_IMAGE;

  // 1. Direct string images or media asset objects
  let rawUrl = null;

  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string") {
      rawUrl = first;
    } else if (first) {
      rawUrl = first.url || first.mediaAsset?.url || first.mediaAsset?.path || first.mediaAssetId || first.file?.url;
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
