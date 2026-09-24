import * as invoiceService from "./invoice.service.js";
import { generateInvoiceBuffer } from "./invoice.pdf.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

/**
 * Download or stream invoice PDF (Authenticated & Authorized)
 * GET /api/v1/invoices/:invoiceId/download
 */
export async function download(request, reply) {
  const invoice = await invoiceService.getInvoiceForDownload({
    invoiceId: request.params.invoiceId,
    user: request.user
  });

  const orderData = invoice.bulkOrder || invoice.order;
  const isB2B = !!invoice.bulkOrderId;

  const buffer = await generateInvoiceBuffer(orderData, {
    type: isB2B ? "B2B" : "RETAIL",
    invoiceNumber: invoice.invoiceNumber
  });

  const filename = `${invoice.invoiceNumber}.pdf`;
  reply.header("Content-Type", "application/pdf");
  reply.header("Content-Disposition", `attachment; filename="${filename}"`);
  reply.header("Content-Length", buffer.length);
  return reply.send(buffer);
}

/**
 * Public invoice verification endpoint
 * GET /api/v1/invoices/verify/:invoiceNumber
 */
export async function verify(request, reply) {
  const verificationData = await invoiceService.getPublicInvoiceVerification(request.params.invoiceNumber);
  return sendSuccess(reply, {
    message: "Invoice verified successfully",
    data: verificationData
  });
}

/**
 * Retrieve or issue invoice by Retail Order ID
 * GET /api/v1/orders/:id/invoice
 */
export async function getOrderInvoice(request, reply) {
  const invoice = await invoiceService.getInvoiceForDownload({
    orderId: request.params.id,
    user: request.user
  });

  const buffer = await generateInvoiceBuffer(invoice.order, {
    type: "RETAIL",
    invoiceNumber: invoice.invoiceNumber
  });

  const filename = `${invoice.invoiceNumber}.pdf`;
  reply.header("Content-Type", "application/pdf");
  reply.header("Content-Disposition", `inline; filename="${filename}"`);
  reply.header("Content-Length", buffer.length);
  return reply.send(buffer);
}

/**
 * Retrieve or issue invoice by Bulk Order ID
 * GET /api/v1/bulk/orders/:id/invoice
 */
export async function getBulkOrderInvoice(request, reply) {
  const invoice = await invoiceService.getInvoiceForDownload({
    bulkOrderId: request.params.id,
    user: request.user
  });

  const buffer = await generateInvoiceBuffer(invoice.bulkOrder, {
    type: "B2B",
    invoiceNumber: invoice.invoiceNumber
  });

  const filename = `${invoice.invoiceNumber}.pdf`;
  reply.header("Content-Type", "application/pdf");
  reply.header("Content-Disposition", `inline; filename="${filename}"`);
  reply.header("Content-Length", buffer.length);
  return reply.send(buffer);
}
