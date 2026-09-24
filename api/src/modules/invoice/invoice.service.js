import { prisma } from "../../config/prisma.js";
import { getCompanyConfig } from "../../config/company.config.js";
import { generateInvoiceBuffer, normalizeInvoiceSnapshot } from "./invoice.pdf.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

/**
 * Generates an enterprise invoice number format:
 * e.g., INV-2026-000001 (Retail) or VANOM-2026-000001 (B2B)
 */
export async function generateInvoiceNumber(prefix = "INV") {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-%`;

  // Count existing invoices for this year & prefix to safely increment
  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: `${prefix}-${year}-`
      }
    }
  });

  const nextSeq = String(count + 1).padStart(6, "0");
  return `${prefix}-${year}-${nextSeq}`;
}

/**
 * Idempotent Invoice Creation & On-The-Fly PDF Generation Service.
 * Does not store static PDF files in S3; streams dynamically on demand.
 */
export async function issueInvoiceForOrder({ orderId, bulkOrderId, companyOverride = null, forceRegenerate = false }) {
  // 1. Check if invoice already exists
  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      OR: [
        ...(orderId ? [{ orderId }] : []),
        ...(bulkOrderId ? [{ bulkOrderId }] : [])
      ]
    },
    include: {
      order: {
        include: {
          items: true,
          addresses: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } }
        }
      },
      bulkOrder: {
        include: {
          items: true,
          business: true
        }
      }
    }
  });

  if (existingInvoice && existingInvoice.status === "ISSUED" && !forceRegenerate) {
    return existingInvoice;
  }

  // 2. Load order snapshot
  let orderData = null;
  let isB2B = false;
  let organizationId = "default";
  let prefix = "INV";

  if (orderId) {
    orderData = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        addresses: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } }
      }
    });
    if (!orderData) throw new AppError("Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
    organizationId = orderData.userId || "retail";
  } else if (bulkOrderId) {
    orderData = await prisma.bulkOrder.findUnique({
      where: { id: bulkOrderId },
      include: {
        items: true,
        business: true
      }
    });
    if (!orderData) throw new AppError("Bulk Order not found", HTTP_STATUS.NOT_FOUND, "BULK_ORDER_NOT_FOUND");
    isB2B = true;
    organizationId = orderData.businessId || "corporate";
    prefix = "VANOM";
  }

  // 2.5 Resolve store settings from database
  const storeSetting = await prisma.storeSetting.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (storeSetting?.invoicePrefix) {
    prefix = storeSetting.invoicePrefix.replace(/-+$/, "");
  }

  // 3. Resolve dynamic company configuration
  const company = getCompanyConfig(companyOverride || (isB2B ? orderData.business : null), storeSetting);

  // 4. Generate unique invoice number if not already present
  const invoiceNumber = existingInvoice?.invoiceNumber || (await generateInvoiceNumber(prefix));

  // 5. Calculate and persist financial snapshot in database
  const subtotal = Number(orderData.subtotal || 0);
  const discount = Number(orderData.discount || 0);
  const shippingAmount = Number(orderData.shippingCharges || 0);
  const taxAmount = Number(orderData.tax || 0);
  const totalAmount = Number(orderData.total || (subtotal - discount + shippingAmount + taxAmount));
  const currencyCode = orderData.currencyCode || "USD";

  const invoiceData = {
    invoiceNumber,
    orderId: orderId || null,
    bulkOrderId: bulkOrderId || null,
    status: "ISSUED",
    fileUrl: null,
    storageKey: null,
    currencyCode,
    subtotal,
    discount,
    shippingAmount,
    taxAmount,
    totalAmount,
    issuedAt: new Date(),
    metadata: {
      isB2B,
      company: {
        legalName: company.legalName,
        brandName: company.brandName
      }
    }
  };

  const invoice = existingInvoice
    ? await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: invoiceData
      })
    : await prisma.invoice.create({
        data: invoiceData
      });

  // 6. Generate PDF buffer on the fly using strict order & invoice snapshot
  const pdfBuffer = await generateInvoiceBuffer(orderData, {
    type: isB2B ? "B2B" : "RETAIL",
    invoiceNumber,
    company,
    invoice
  });

  return {
    ...invoice,
    pdfBuffer
  };
}

/**
 * Retrieve public, non-sensitive audit verification data
 */
export async function getPublicInvoiceVerification(invoiceNumber) {
  const invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      },
      bulkOrder: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          business: {
            select: { businessName: true }
          }
        }
      }
    }
  });

  if (!invoice) {
    throw new AppError("Invoice not found or invalid reference number", HTTP_STATUS.NOT_FOUND, "INVOICE_NOT_FOUND");
  }

  const isB2B = !!invoice.bulkOrderId;
  const company = getCompanyConfig(invoice.metadata?.company || null);

  return {
    verified: true,
    invoiceNumber: invoice.invoiceNumber,
    orderNumber: isB2B ? invoice.bulkOrder?.orderNumber : (invoice.order?.id ? `ORD-${invoice.order.id.slice(0, 8).toUpperCase()}` : null),
    invoiceDate: invoice.issuedAt,
    subtotal: Number(invoice.subtotal),
    discount: Number(invoice.discount),
    shippingAmount: Number(invoice.shippingAmount),
    taxAmount: Number(invoice.taxAmount),
    totalAmount: Number(invoice.totalAmount),
    currency: invoice.currencyCode,
    paymentStatus: isB2B ? (invoice.bulkOrder?.paymentStatus || "NET_15_INVOICED") : "PAID",
    invoiceStatus: invoice.status,
    issuingCompany: company.legalName,
    brandName: company.brandName,
    auditTimestamp: new Date()
  };
}

/**
 * Fetch invoice by ID or Order with authorization check
 */
export async function getInvoiceForDownload({ invoiceId, orderId, bulkOrderId, user }) {
  const where = invoiceId
    ? { id: invoiceId }
    : orderId
    ? { orderId }
    : { bulkOrderId };

  let invoice = await prisma.invoice.findFirst({
    where,
    include: {
      order: {
        include: {
          items: true,
          addresses: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } }
        }
      },
      bulkOrder: {
        include: {
          items: true,
          business: true
        }
      }
    }
  });

  // If invoice record does not exist yet, auto-issue it dynamically
  if (!invoice) {
    if (orderId || bulkOrderId) {
      invoice = await issueInvoiceForOrder({ orderId, bulkOrderId });
      // Reload with relations
      invoice = await prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          order: {
            include: {
              items: true,
              addresses: true,
              user: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
          },
          bulkOrder: {
            include: {
              items: true,
              business: true
            }
          }
        }
      });
    } else {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, "INVOICE_NOT_FOUND");
    }
  }

  // Authorization check
  if (user && user.role !== "SUPERADMIN") {
    if (invoice.order && invoice.order.userId !== user.sub) {
      throw new AppError("Unauthorized access to invoice", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
    }
    if (invoice.bulkOrder && user.bulkBusinessId && invoice.bulkOrder.businessId !== user.bulkBusinessId) {
      throw new AppError("Unauthorized access to organization invoice", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
    }
  }

  return invoice;
}
