import { apiClient } from "@/services/api/axios.js";

/**
 * Directly downloads or opens the generated PDF invoice in a new browser tab.
 * No modal or local/S3 database record needed.
 *
 * @param {string} orderId The Retail or B2B Order ID.
 * @param {boolean} [isB2B=false] Whether the order is a B2B Bulk Order.
 * @param {string} [orderNumber] Optional order number for the downloaded filename.
 */
export async function openDirectInvoicePdf(orderId, isB2B = false, orderNumber = null) {
  if (!orderId) return;

  const url = isB2B ? `/bulk/orders/${orderId}/invoice` : `/orders/${orderId}/invoice`;

  try {
    const response = await apiClient.get(url, {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    });

    const rawBlob =
      response instanceof Blob
        ? response
        : response.data instanceof Blob
        ? response.data
        : new Blob([response.data || response], { type: "application/pdf" });

    const blobUrl = window.URL.createObjectURL(rawBlob);
    
    // Open directly in browser PDF viewer
    window.open(blobUrl, "_blank", "noopener,noreferrer");

    // Revoke after 60s
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);
  } catch (err) {
    console.error("Failed to open direct invoice PDF:", err);
    alert("Unable to generate invoice. Please try again.");
  }
}
