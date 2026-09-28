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
 * Derive correct production invoice status based on order & payment states
 */
export function deriveInvoiceStatus({ orderStatus, paymentStatus, isB2B = false }) {
  const normOrder = String(orderStatus || "").toUpperCase();
  const normPayment = String(paymentStatus || "").toUpperCase();

  if (normPayment === "REFUNDED") {
    return "VOID";
  }

  if (normOrder === "CANCELLED" || normPayment === "FAILED") {
    // Void if was previously paid/captured; otherwise mark cancelled
    return normPayment === "PAID" ? "VOID" : "CANCELLED";
  }

  if (normOrder === "PENDING_PAYMENT" || normPayment === "PENDING" || normPayment === "UNPAID") {
    return "DRAFT";
  }

  if (
    normPayment === "PAID" ||
    ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(normOrder) ||
    (isB2B && (normPayment.includes("NET") || normPayment === "PAID"))
  ) {
    return "ISSUED";
  }

  return "DRAFT";
}

/**
 * Idempotently synchronize invoice status whenever order or payment status changes
 */
export async function syncInvoiceStatus({ orderId, bulkOrderId, orderStatus = null, paymentStatus = null, metadata = {} }) {
  const where = orderId ? { orderId } : { bulkOrderId };
  let invoice = await prisma.invoice.findFirst({ where });

  let resolvedOrderStatus = orderStatus;
  let resolvedPaymentStatus = paymentStatus;
  let isB2B = !!bulkOrderId;

  if (orderId && (!resolvedOrderStatus || !resolvedPaymentStatus)) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        inventoryDeducted: true,
        stripePaymentIntentId: true,
        metadata: true
      }
    });
    if (order) {
      if (!resolvedOrderStatus) resolvedOrderStatus = order.status;
      if (!resolvedPaymentStatus) {
        if (order.status === "PENDING_PAYMENT") {
          resolvedPaymentStatus = "PENDING_PAYMENT";
        } else if (["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) {
          resolvedPaymentStatus = "PAID";
        } else if (order.status === "CANCELLED") {
          resolvedPaymentStatus = order.inventoryDeducted ? "REFUNDED" : "CANCELLED";
        }
      }
    }
  } else if (bulkOrderId && (!resolvedOrderStatus || !resolvedPaymentStatus)) {
    const bulkOrder = await prisma.bulkOrder.findUnique({
      where: { id: bulkOrderId },
      select: { id: true, status: true, paymentStatus: true }
    });
    if (bulkOrder) {
      if (!resolvedOrderStatus) resolvedOrderStatus = bulkOrder.status;
      if (!resolvedPaymentStatus) resolvedPaymentStatus = bulkOrder.paymentStatus;
      isB2B = true;
    }
  }

  const nextStatus = deriveInvoiceStatus({
    orderStatus: resolvedOrderStatus,
    paymentStatus: resolvedPaymentStatus,
    isB2B
  });

  if (invoice) {
    const updatedMeta = {
      ...(typeof invoice.metadata === "object" ? invoice.metadata : {}),
      ...metadata,
      orderStatus: resolvedOrderStatus,
      paymentStatus: resolvedPaymentStatus,
      lastStatusSyncedAt: new Date().toISOString()
    };

    invoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: nextStatus,
        metadata: updatedMeta
      }
    });
    return invoice;
  }

  // If invoice does not exist yet, issue it
  return issueInvoiceForOrder({
    orderId,
    bulkOrderId,
    forceRegenerate: true
  });
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

  // Derive dynamic payment and invoice statuses
  let paymentStatus = isB2B
    ? (orderData.paymentStatus || "PENDING")
    : (["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(orderData.status) ? "PAID" : orderData.status);

  if (!isB2B && orderData.status === "CANCELLED") {
    paymentStatus = orderData.inventoryDeducted ? "REFUNDED" : "CANCELLED";
  }

  const invoiceStatus = deriveInvoiceStatus({
    orderStatus: orderData.status,
    paymentStatus,
    isB2B
  });

  const invoiceData = {
    invoiceNumber,
    orderId: orderId || null,
    bulkOrderId: bulkOrderId || null,
    status: invoiceStatus,
    fileUrl: null,
    storageKey: null,
    currencyCode,
    subtotal,
    discount,
    shippingAmount,
    taxAmount,
    totalAmount,
    issuedAt: existingInvoice?.issuedAt || new Date(),
    metadata: {
      isB2B,
      orderStatus: orderData.status,
      paymentStatus,
      stripePaymentIntentId: orderData.stripePaymentIntentId || null,
      stripeTaxCalculationId: orderData.stripeTaxCalculationId || null,
      company: {
        legalName: company.legalName,
        brandName: company.brandName
      },
      lastSyncedAt: new Date().toISOString()
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
    invoice,
    orderStatus: orderData.status,
    paymentStatus,
    invoiceStatus
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
          inventoryDeducted: true,
          stripePaymentIntentId: true,
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

  const orderStatus = invoice.bulkOrder?.status || invoice.order?.status || invoice.metadata?.orderStatus || "UNKNOWN";
  let paymentStatus = isB2B
    ? (invoice.bulkOrder?.paymentStatus || "NET_15_INVOICED")
    : (["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(invoice.order?.status) ? "PAID" : invoice.order?.status);

  if (!isB2B && invoice.order?.status === "CANCELLED") {
    paymentStatus = invoice.order?.inventoryDeducted ? "REFUNDED" : "CANCELLED";
  }

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
    orderStatus,
    paymentStatus,
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
  if (!user) {
    throw new AppError("Authentication required to download invoice", HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED");
  }

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

  // If invoice record does not exist yet, verify authorization BEFORE dynamic issue
  if (!invoice) {
    if (orderId || bulkOrderId) {
      if (user.role !== "SUPERADMIN") {
        if (orderId) {
          const ord = await prisma.order.findUnique({ where: { id: orderId } });
          if (!ord || ord.userId !== user.sub) {
            throw new AppError("Unauthorized access to order invoice", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
          }
        }
        if (bulkOrderId) {
          const bulkOrd = await prisma.bulkOrder.findUnique({ where: { id: bulkOrderId } });
          const caller = await prisma.user.findUnique({
            where: { id: user.sub },
            select: { bulkBusinessId: true }
          });
          const userBusinessId = caller?.bulkBusinessId;
          if (!bulkOrd || !userBusinessId || bulkOrd.businessId !== userBusinessId) {
            throw new AppError("Unauthorized access to organization invoice", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
          }
        }
      }

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

  // Strict tenant and ownership authorization check
  if (user.role !== "SUPERADMIN") {
    if (invoice.order && invoice.order.userId !== user.sub) {
      throw new AppError("Unauthorized access to invoice", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
    }
    if (invoice.bulkOrder) {
      const caller = await prisma.user.findUnique({
        where: { id: user.sub },
        select: { bulkBusinessId: true }
      });
      const userBusinessId = caller?.bulkBusinessId;
      if (!userBusinessId || invoice.bulkOrder.businessId !== userBusinessId) {
        throw new AppError("Unauthorized access to organization invoice", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
      }
    }
  }

  return invoice;
}
