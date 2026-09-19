const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const SERVER_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

export const FALLBACK_PRODUCT_IMAGE = null;

export function formatImageUrl(url) {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${SERVER_ORIGIN}${cleanPath}`;
}

export function resolveProductImageUrl(product) {
  if (!product) return null;
  const rawUrl =
    product.imageUrl ||
    product.image ||
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    (product.images?.[0]?.fileId ? `/static/${product.images[0].fileId}` : null);

  return formatImageUrl(rawUrl);
}
