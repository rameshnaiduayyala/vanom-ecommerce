const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const SERVER_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

export const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80";

export function formatImageUrl(url) {
  if (!url || typeof url !== "string") return FALLBACK_PRODUCT_IMAGE;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${SERVER_ORIGIN}${cleanPath}`;
}

export function resolveProductImageUrl(product) {
  if (!product) return FALLBACK_PRODUCT_IMAGE;
  const rawUrl =
    product.imageUrl ||
    product.image ||
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    (product.images?.[0]?.fileId ? `/static/${product.images[0].fileId}` : null);

  return formatImageUrl(rawUrl);
}
