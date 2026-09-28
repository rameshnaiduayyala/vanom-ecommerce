import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getCompanyConfig } from "../../config/company.config.js";
import { env } from "../../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_LOGO_PATH = path.resolve(__dirname, "../../assets/logo.png");

// ─── Executive Corporate Design System & Tokens ──────────────────────────────
const T = {
  // Brand Accents
  brandPrimary: "#0B4627",      // Deep Forest Emerald (Restrained Brand Accent)
  brandDark: "#072B18",         // Midnight Forest
  brandAccent: "#16A34A",       // Crisp Vibrant Green
  brandLight: "#F0FDF4",        // Ultra-light emerald tint

  // Typography (Slate Neutrals)
  inkHead: "#0F172A",           // Slate 900 - Headlines, Primary Values
  inkSub: "#1E293B",            // Slate 800 - Section Headers, Customer Titles
  inkBody: "#334155",           // Slate 700 - Body Text, Descriptions
  inkMuted: "#64748B",          // Slate 500 - Secondary Labels & Captions
  inkLight: "#94A3B8",          // Slate 400 - Table Headers & Metadata Keys
  white: "#FFFFFF",

  // Surfaces & Hairline Dividers
  surfaceCard: "#F8FAFC",       // Slate 50 Card Background
  surfaceAlt: "#F1F5F9",        // Slate 100 Accent Container
  surfaceStripe: "#FBFDFB",     // Subtle Zebra Stripe
  borderLight: "#E2E8F0",       // Slate 200 Structural Line
  borderDark: "#CBD5E1",        // Slate 300 Structural Line

  // Status Badges
  statusPaidBg: "#ECFDF5",
  statusPaidText: "#065F46",
  statusPaidBorder: "#A7F3D0",

  statusDueBg: "#FFFBEB",
  statusDueText: "#92400E",
  statusDueBorder: "#FDE68A",

  statusCancelledBg: "#FEF2F2",
  statusCancelledText: "#991B1B",
  statusCancelledBorder: "#FECACA",

  statusVoidBg: "#FAF5FF",
  statusVoidText: "#6B21A8",
  statusVoidBorder: "#E9D5FF",

  statusDraftBg: "#F1F5F9",
  statusDraftText: "#475569",
  statusDraftBorder: "#CBD5E1",

  statusProcessingBg: "#EFF6FF",
  statusProcessingText: "#1E40AF",
  statusProcessingBorder: "#BFDBFE",

  // Table Aesthetics
  tableHeaderBg: "#0F172A",      // Executive Slate 900
  tableHeaderColor: "#FFFFFF"
};

/**
 * Format monetary amount according to currency code snapshot
 */
export function formatCurrency(amount, currencyCode = "USD") {
  const num = Number(amount || 0);
  const code = (currencyCode || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch {
    return `${code} ${num.toFixed(2)}`;
  }
}

/**
 * Normalize and extract financial snapshot data without querying live product prices.
 */
export function normalizeInvoiceSnapshot(order, options = {}) {
  const isB2B = options.type === "B2B" || order?.orderNumber?.startsWith("BULK") || !!order?.business || !!order?.businessId;
  const invoiceType = isB2B ? "B2B" : "RETAIL";

  // Use existing invoice number, order number or unique generated fallback
  const invoiceNumber = options.invoiceNumber || order?.invoiceNumber || order?.orderNumber || (order?.id ? `INV-${order.id.slice(0, 8).toUpperCase()}` : `INV-${Date.now()}`);
  const orderNumber = order?.orderNumber || (order?.id ? `ORD-${order.id.slice(0, 8).toUpperCase()}` : invoiceNumber);

  const issuedAt = options.issuedAt ? new Date(options.issuedAt) : (order?.createdAt ? new Date(order.createdAt) : new Date());

  // Payment Terms and Due Date resolution
  const paymentMethod = order?.paymentMethod || (isB2B ? "DIRECT_CORPORATE_WIRE" : "STRIPE_CREDIT_CARD");
  const paymentTerms = order?.paymentTerms || (isB2B ? "NET_15" : "PREPAID");

  let dueDate;
  if (order?.dueDate) {
    dueDate = new Date(order.dueDate);
  } else if (paymentTerms === "NET_30") {
    dueDate = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (paymentTerms === "NET_45") {
    dueDate = new Date(issuedAt.getTime() + 45 * 24 * 60 * 60 * 1000);
  } else if (paymentTerms === "NET_15" || isB2B) {
    dueDate = new Date(issuedAt.getTime() + 15 * 24 * 60 * 60 * 1000);
  } else {
    dueDate = issuedAt;
  }

  const formattedDate = issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formattedDueDate = dueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const currencyCode = (order?.currencyCode || options.company?.currencyCode || "USD").toUpperCase();

  // Dynamic Company Profile
  const company = getCompanyConfig(options.company || order?.business || null);

  let customer = {
    name: "Valued Customer",
    companyName: null,
    contactPerson: null,
    email: "billing@customer.com",
    phone: "N/A",
    taxId: null,
    regNo: null,
    address: "Registered Address",
    city: "",
    state: "",
    postalCode: "",
    country: "US"
  };

  if (isB2B && order.business) {
    customer.name = order.business.businessName;
    customer.companyName = order.business.businessName;
    customer.contactPerson = order.business.contactPersonName || null;
    customer.email = order.business.businessEmail;
    customer.phone = order.business.businessPhone || "N/A";
    customer.taxId = order.business.taxRegistrationNumber;
    customer.regNo = order.business.registrationNumber;
    customer.address = order.business.address || "";
  } else if (order.user) {
    customer.name = `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || order.user.email;
    customer.email = order.user.email;
  }

  // Address normalization
  let shippingAddress = order.shippingAddress || {};
  let billingAddress = order.billingAddress || null;

  if (Array.isArray(order.addresses)) {
    const shipping = order.addresses.find((a) => a.type === "SHIPPING") || order.addresses[0];
    const billing = order.addresses.find((a) => a.type === "BILLING");
    if (shipping) shippingAddress = shipping;
    if (billing) billingAddress = billing;
  }
  if (typeof shippingAddress === "string") {
    try { shippingAddress = JSON.parse(shippingAddress); } catch { shippingAddress = { addressLine1: shippingAddress }; }
  }
  if (typeof billingAddress === "string") {
    try { billingAddress = JSON.parse(billingAddress); } catch { billingAddress = { addressLine1: billingAddress }; }
  }

  if (shippingAddress.contactName || shippingAddress.fullName) {
    customer.name = shippingAddress.contactName || shippingAddress.fullName || customer.name;
  }
  if (shippingAddress.phone) customer.phone = shippingAddress.phone;
  if (shippingAddress.addressLine1) customer.address = shippingAddress.addressLine1;
  if (shippingAddress.city) customer.city = shippingAddress.city;
  if (shippingAddress.state) customer.state = shippingAddress.state;
  if (shippingAddress.postalCode) customer.postalCode = shippingAddress.postalCode;
  if (shippingAddress.countryCode || shippingAddress.country) customer.country = shippingAddress.countryCode || shippingAddress.country;

  // Items snapshot parsing (strictly uses OrderItem snapshots)
  const items = (order.items || []).map((it, idx) => {
    const productName = it.productName || it.product?.name || it.name || `Commercial Item #${idx + 1}`;
    const sku = it.sku || it.product?.sku || it.variant?.sku || `SKU-${1000 + idx}`;
    const quantity = Number(it.quantity || 1);
    const unitPrice = Number(it.unitPrice || it.price || 0);
    const discount = Number(it.discount || 0);
    const tax = Number(it.tax || 0);
    const total = Number(it.total ?? (quantity * unitPrice - discount));
    const tier = it.appliedTier ? (typeof it.appliedTier === "string" ? JSON.parse(it.appliedTier) : it.appliedTier) : null;
    const variantName = it.variantName || it.variant?.name || it.variant?.title || null;

    return {
      index: idx + 1,
      productName,
      variantName,
      sku,
      quantity,
      unitPrice,
      discount,
      tax,
      total,
      tierMin: tier?.minQuantity || null,
      tierMax: tier?.maxQuantity || null
    };
  });

  const invoiceRec = options.invoice || (order?.invoices && order.invoices[0]) || null;

  const subtotal = Number(order.subtotal ?? invoiceRec?.subtotal ?? options.subtotal ?? items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0));
  const discount = Number(order.discount ?? invoiceRec?.discount ?? options.discount ?? 0);
  const shippingCharges = Number(order.shippingCharges ?? order.shippingAmount ?? invoiceRec?.shippingAmount ?? options.shippingAmount ?? options.shippingCharges ?? 0);
  const tax = Number(order.tax ?? order.taxAmount ?? invoiceRec?.taxAmount ?? options.taxAmount ?? options.tax ?? 0);
  const total = Number(order.total ?? order.totalAmount ?? invoiceRec?.totalAmount ?? options.totalAmount ?? (subtotal - discount + shippingCharges + tax));

  // Secure Verification URL for Audit Gateway
  const verifyBaseUrl = env.clientUrl || env.appUrl || "https://vanom-commerce.com";
  const verifyUrl = `${verifyBaseUrl.replace(/\/+$/, "")}/invoice/verify/${encodeURIComponent(invoiceNumber)}`;

  const orderStatus = (options.orderStatus || order.status || options.invoice?.metadata?.orderStatus || "PENDING").toUpperCase();
  let paymentStatus = (options.paymentStatus || order.paymentStatus || options.invoice?.metadata?.paymentStatus || "").toUpperCase();

  if (!paymentStatus) {
    if (orderStatus === "PENDING_PAYMENT") {
      paymentStatus = "UNPAID";
    } else if (["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(orderStatus)) {
      paymentStatus = "PAID";
    } else if (orderStatus === "CANCELLED") {
      paymentStatus = (order.inventoryDeducted || order.stripePaymentIntentId) ? "REFUNDED" : "CANCELLED";
    } else {
      paymentStatus = isB2B ? "INVOICED_NET15" : "PENDING";
    }
  }

  const invoiceStatus = (options.invoiceStatus || options.invoice?.status || (paymentStatus === "PAID" ? "ISSUED" : (orderStatus === "CANCELLED" ? "CANCELLED" : "DRAFT"))).toUpperCase();
  const stripePaymentIntentId = order.stripePaymentIntentId || options.invoice?.metadata?.stripePaymentIntentId || null;

  return {
    invoiceNumber,
    orderNumber,
    orderId: order.id,
    invoiceType,
    date: formattedDate,
    dueDate: formattedDueDate,
    paymentMethod,
    paymentTerms,
    status: orderStatus,
    orderStatus,
    paymentStatus,
    invoiceStatus,
    stripePaymentIntentId,
    currencyCode,
    company,
    customer,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    items,
    subtotal,
    discount,
    shippingCharges,
    tax,
    total,
    verifyUrl
  };
}

async function generateQrBuffer(text) {
  try {
    return await QRCode.toBuffer(text, {
      width: 200,
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF"
      }
    });
  } catch (err) {
    console.warn("Invoice QR generation failed:", err);
    return null;
  }
}

/**
 * Builds high-fidelity, corporate executive invoice PDFKit Stream
 */
export async function generateInvoicePdf(rawOrder, options = {}) {
  const invoice = normalizeInvoiceSnapshot(rawOrder, options);

  // A4 geometry: 595.28 x 841.89 points
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: true,
    info: {
      Title: `Invoice ${invoice.invoiceNumber} - ${invoice.company.brandName}`,
      Author: invoice.company.legalName,
      Subject: `Commercial Tax Invoice for ${invoice.customer.name}`,
      Keywords: "invoice, tax invoice, b2b, corporate, enterprise, stripe"
    }
  });

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const ML = 38;
  const MR = 38;
  const CW = PAGE_WIDTH - ML - MR; // ~519.28pt printable width
  const FOOTER_RESERVED = 68;
  const MAX_CONTENT_Y = PAGE_HEIGHT - FOOTER_RESERVED;

  const qrBuffer = await generateQrBuffer(invoice.verifyUrl);

  // ── Function to Render Top Brand Stripe ─────────────────────────────────────
  const drawTopBrandBar = () => {
    doc.rect(0, 0, PAGE_WIDTH, 3).fill(T.brandPrimary);
  };

  // ── Function to Render Compact Header on Subsequent Pages ──────────────────
  const drawCompactPageHeader = (pageNum) => {
    drawTopBrandBar();
    const hY = 24;
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(T.inkHead)
      .text(invoice.company.brandName, ML, hY, { lineBreak: false });
    doc.fontSize(7.5).font("Helvetica").fillColor(T.inkMuted)
      .text(`Invoice ${invoice.invoiceNumber}   •   Order Ref: #${invoice.orderNumber}`, ML + 80, hY + 1, { lineBreak: false });

    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(T.brandPrimary)
      .text(`Page ${pageNum}`, PAGE_WIDTH - MR - 60, hY, { width: 60, align: "right", lineBreak: false });

    doc.moveTo(ML, hY + 15).lineTo(PAGE_WIDTH - MR, hY + 15).lineWidth(0.5).strokeColor(T.borderLight).stroke();
    return hY + 24;
  };

  // ── Function to Render Line Items Table Header ─────────────────────────────
  const colIndexW = 20;
  const colSkuW = 75;
  const colQtyW = 34;
  const colPriceW = 68;
  const colDiscountW = 52;
  const colTaxW = 48;
  const colAmountW = 72;
  const colDescW = CW - (colIndexW + colSkuW + colQtyW + colPriceW + colDiscountW + colTaxW + colAmountW); // ~150pt
  const tableHeaderHeight = 18;

  const drawTableHeader = (atY) => {
    doc.roundedRect(ML, atY, CW, tableHeaderHeight, 2).fill(T.tableHeaderBg);

    doc.fontSize(6.5).font("Helvetica-Bold").fillColor(T.white);
    let curX = ML + 6;
    doc.text("#", curX, atY + 5.5, { width: colIndexW - 6, lineBreak: false });

    curX += colIndexW;
    doc.text("ITEM & DESCRIPTION", curX, atY + 5.5, { width: colDescW - 8, lineBreak: false });

    curX += colDescW;
    doc.text("SKU", curX, atY + 5.5, { width: colSkuW - 6, lineBreak: false });

    curX += colSkuW;
    doc.text("QTY", curX, atY + 5.5, { width: colQtyW, align: "center", lineBreak: false });

    curX += colQtyW;
    doc.text("UNIT PRICE", curX, atY + 5.5, { width: colPriceW - 4, align: "right", lineBreak: false });

    curX += colPriceW;
    doc.text("DISCOUNT", curX, atY + 5.5, { width: colDiscountW - 4, align: "right", lineBreak: false });

    curX += colDiscountW;
    doc.text("TAX", curX, atY + 5.5, { width: colTaxW - 4, align: "right", lineBreak: false });

    curX += colTaxW;
    doc.text("AMOUNT", curX, atY + 5.5, { width: colAmountW - 8, align: "right", lineBreak: false });
  };

  // ── 1. Page 1 Header ───────────────────────────────────────────────────────
  drawTopBrandBar();
  let y = 24;

  // Left Brand Area
  const logoWidth = 110;
  const logoHeight = 28;
  let logoDrawn = false;

  if (invoice.company.logoUrl && fs.existsSync(invoice.company.logoUrl)) {
    try {
      doc.image(invoice.company.logoUrl, ML, y, { fit: [logoWidth, logoHeight] });
      logoDrawn = true;
    } catch { }
  }
  if (!logoDrawn && fs.existsSync(DEFAULT_LOGO_PATH)) {
    try {
      doc.image(DEFAULT_LOGO_PATH, ML, y, { fit: [logoWidth, logoHeight] });
      logoDrawn = true;
    } catch { }
  }
  if (!logoDrawn) {
    doc.fontSize(18).font("Helvetica-Bold").fillColor(T.brandPrimary).text(invoice.company.brandName, ML, y, { lineBreak: false });
  }

  // Company details below logo
  let compY = y + logoHeight + 4;
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(T.inkHead).text(invoice.company.legalName, ML, compY, { width: 310, lineBreak: false });
  compY += 12;

  if (invoice.company.tagline) {
    doc.fontSize(6.8).font("Helvetica-Oblique").fillColor(T.inkMuted).text(invoice.company.tagline, ML, compY, { width: 310, lineBreak: false });
    compY += 10;
  }

  doc.fontSize(6.8).font("Helvetica").fillColor(T.inkBody).text(invoice.company.address, ML, compY, { width: 310, lineBreak: false });
  compY += 10;

  const contactLine = `${invoice.company.email}   •   ${invoice.company.phone}`;
  doc.fontSize(6.5).font("Helvetica").fillColor(T.inkMuted).text(contactLine, ML, compY, { width: 310, lineBreak: false });
  compY += 10;

  if (invoice.company.taxIds) {
    doc.fontSize(6.5).font("Helvetica-Bold").fillColor(T.inkBody).text(invoice.company.taxIds, ML, compY, { width: 310, lineBreak: false });
    compY += 10;
  }

  // Right Header Area: Dominant "INVOICE" Title & Identifiers
  const rightWidth = 185;
  const rightX = PAGE_WIDTH - MR - rightWidth;

  doc.fontSize(22).font("Helvetica-Bold").fillColor(T.inkHead).text("INVOICE", rightX, y, { width: rightWidth, align: "right", characterSpacing: 1.5, lineBreak: false });
  doc.fontSize(10.5).font("Helvetica-Bold").fillColor(T.brandPrimary).text(invoice.invoiceNumber, rightX, y + 26, { width: rightWidth, align: "right", lineBreak: false });

  // Status Badge
  let statusLabel = "DRAFT";
  let badgeBg = T.statusDraftBg;
  let badgeBorder = T.statusDraftBorder;
  let badgeText = T.statusDraftText;

  if (invoice.invoiceStatus === "VOID" || invoice.paymentStatus === "REFUNDED") {
    statusLabel = "REFUNDED / VOID";
    badgeBg = T.statusVoidBg;
    badgeBorder = T.statusVoidBorder;
    badgeText = T.statusVoidText;
  } else if (invoice.invoiceStatus === "CANCELLED" || invoice.orderStatus === "CANCELLED" || invoice.paymentStatus === "CANCELLED") {
    statusLabel = "CANCELLED";
    badgeBg = T.statusCancelledBg;
    badgeBorder = T.statusCancelledBorder;
    badgeText = T.statusCancelledText;
  } else if (invoice.paymentStatus === "PAID" || invoice.invoiceStatus === "ISSUED") {
    if (invoice.orderStatus === "DELIVERED") {
      statusLabel = "PAID • DELIVERED";
    } else if (invoice.orderStatus === "SHIPPED") {
      statusLabel = "PAID • SHIPPED";
    } else {
      statusLabel = "PAID";
    }
    badgeBg = T.statusPaidBg;
    badgeBorder = T.statusPaidBorder;
    badgeText = T.statusPaidText;
  } else if (invoice.paymentStatus.includes("NET")) {
    statusLabel = invoice.paymentStatus.replace(/_/g, " ");
    badgeBg = T.statusProcessingBg;
    badgeBorder = T.statusProcessingBorder;
    badgeText = T.statusProcessingText;
  } else if (invoice.orderStatus === "PENDING_PAYMENT" || invoice.paymentStatus === "UNPAID" || invoice.invoiceStatus === "DRAFT") {
    statusLabel = "PAYMENT PENDING";
    badgeBg = T.statusDueBg;
    badgeBorder = T.statusDueBorder;
    badgeText = T.statusDueText;
  } else {
    statusLabel = invoice.paymentStatus.replace(/_/g, " ");
  }

  const badgeW = Math.max(54, statusLabel.length * 5.8 + 14);
  const badgeH = 14;
  const badgeX = PAGE_WIDTH - MR - badgeW;
  const badgeY = y + 42;

  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3).fillAndStroke(badgeBg, badgeBorder);
  doc.fontSize(6.5).font("Helvetica-Bold").fillColor(badgeText).text(statusLabel, badgeX, badgeY + 3.5, { width: badgeW, align: "center", lineBreak: false });

  // Key Dates Block
  doc.fontSize(7).font("Helvetica").fillColor(T.inkMuted);
  doc.text(`Invoice Date: ${invoice.date}`, rightX, y + 61, { width: rightWidth, align: "right", lineBreak: false });
  doc.text(`Payment Due: ${invoice.dueDate}`, rightX, y + 71, { width: rightWidth, align: "right", lineBreak: false });

  y = Math.max(compY + 8, y + 84);
  doc.moveTo(ML, y).lineTo(PAGE_WIDTH - MR, y).lineWidth(0.5).strokeColor(T.borderLight).stroke();
  y += 10;

  // ── 2. Structured Two-Column Address Section (BILL TO & SHIP TO) ─────────
  const colWidth = (CW - 18) / 2; // ~250pt each
  const bX = ML;
  const sX = ML + colWidth + 18;
  const addrHeight = 70;

  // BILL TO Container
  doc.roundedRect(bX, y, colWidth, addrHeight, 3).fillAndStroke(T.surfaceCard, T.borderLight);
  doc.fontSize(6.2).font("Helvetica-Bold").fillColor(T.inkMuted).text("BILL TO", bX + 10, y + 7, { characterSpacing: 1.2, lineBreak: false });

  const billName = invoice.customer.companyName || invoice.customer.name;
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(T.inkHead).text(billName, bX + 10, y + 18, { width: colWidth - 20, height: 11, ellipsis: true, lineBreak: false });

  let bLineY = y + 30;
  if (invoice.customer.contactPerson && invoice.customer.companyName) {
    doc.fontSize(6.8).font("Helvetica").fillColor(T.inkBody).text(`Attn: ${invoice.customer.contactPerson}`, bX + 10, bLineY, { width: colWidth - 20, lineBreak: false });
    bLineY += 9;
  }
  const billAddrStr = [invoice.billingAddress?.addressLine1, invoice.billingAddress?.city, invoice.billingAddress?.state, invoice.billingAddress?.postalCode, invoice.billingAddress?.countryCode || invoice.billingAddress?.country].filter(Boolean).join(", ");
  doc.fontSize(6.8).font("Helvetica").fillColor(T.inkBody).text(billAddrStr || invoice.customer.address || "Standard Registered Billing Address", bX + 10, bLineY, { width: colWidth - 20, height: 18, ellipsis: true });
  bLineY += 18;
  const billContact = [invoice.customer.email, invoice.customer.phone !== "N/A" ? invoice.customer.phone : null, invoice.customer.taxId ? `Tax ID: ${invoice.customer.taxId}` : null].filter(Boolean).join("  •  ");
  doc.fontSize(6.5).font("Helvetica").fillColor(T.inkMuted).text(billContact, bX + 10, bLineY, { width: colWidth - 20, height: 9, ellipsis: true, lineBreak: false });

  // SHIP TO Container
  doc.roundedRect(sX, y, colWidth, addrHeight, 3).fillAndStroke(T.surfaceCard, T.borderLight);
  doc.fontSize(6.2).font("Helvetica-Bold").fillColor(T.inkMuted).text("SHIP TO", sX + 10, y + 7, { characterSpacing: 1.2, lineBreak: false });

  const shipName = invoice.shippingAddress?.fullName || invoice.shippingAddress?.contactName || invoice.customer.name;
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(T.inkHead).text(shipName, sX + 10, y + 18, { width: colWidth - 20, height: 11, ellipsis: true, lineBreak: false });

  let sLineY = y + 30;
  const shipAddrStr = [invoice.shippingAddress?.addressLine1, invoice.shippingAddress?.addressLine2, invoice.shippingAddress?.city, invoice.shippingAddress?.state, invoice.shippingAddress?.postalCode, invoice.shippingAddress?.countryCode || invoice.shippingAddress?.country].filter(Boolean).join(", ");
  doc.fontSize(6.8).font("Helvetica").fillColor(T.inkBody).text(shipAddrStr || "Same as Billing Address", sX + 10, sLineY, { width: colWidth - 20, height: 18, ellipsis: true });
  sLineY += 18;
  const shipPhone = invoice.shippingAddress?.phone || invoice.customer.phone || "N/A";
  doc.fontSize(6.5).font("Helvetica").fillColor(T.inkMuted).text(`Delivery Contact: ${shipPhone}   •   Carrier: Standard Commercial Tracked`, sX + 10, sLineY, { width: colWidth - 20, height: 9, ellipsis: true, lineBreak: false });

  y += addrHeight + 8;

  // ── 3. Invoice Meta Information Panel (Refined Financial Strip) ───────────
  const metaStripHeight = 28;
  doc.roundedRect(ML, y, CW, metaStripHeight, 3).fillAndStroke(T.surfaceAlt, T.borderLight);

  const metaCols = [
    { label: "ORDER REFERENCE", val: `#${invoice.orderNumber}` },
    { label: "PAYMENT TERMS", val: invoice.paymentTerms.replace(/_/g, " ") },
    { label: "PAYMENT METHOD", val: invoice.paymentMethod.replace(/_/g, " ") },
    { label: "CURRENCY", val: `${invoice.currencyCode} (${invoice.currencyCode === "USD" ? "$" : invoice.currencyCode === "CAD" ? "CA$" : invoice.currencyCode})` },
    { label: "TRANSACTION REF", val: invoice.stripePaymentIntentId ? invoice.stripePaymentIntentId.slice(0, 16) + "..." : "PRE-SETTLEMENT" }
  ];

  const mColW = CW / metaCols.length;
  metaCols.forEach((m, idx) => {
    const mx = ML + (idx * mColW) + 8;
    doc.fontSize(5.8).font("Helvetica-Bold").fillColor(T.inkMuted).text(m.label, mx, y + 5.5, { width: mColW - 12, lineBreak: false, characterSpacing: 0.5 });
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(T.inkHead).text(m.val, mx, y + 14.5, { width: mColW - 12, lineBreak: false, ellipsis: true });
  });

  y += metaStripHeight + 10;

  // ── 4. Line Items Table with Dynamic Pagination ───────────────────────────
  drawTableHeader(y);
  y += tableHeaderHeight;

  let currentPageNum = 1;
  const baseRowHeight = 22;

  invoice.items.forEach((item, i) => {
    // Dynamic height check for multi-line description or variant details
    const hasVariant = !!item.variantName;
    const currentRowHeight = hasVariant ? baseRowHeight + 8 : baseRowHeight;

    // Check if table row exceeds printable limit
    if (y + currentRowHeight > MAX_CONTENT_Y - 140) {
      doc.addPage();
      currentPageNum++;
      y = drawCompactPageHeader(currentPageNum);
      drawTableHeader(y);
      y += tableHeaderHeight;
    }

    const isEven = i % 2 === 0;
    if (!isEven) {
      doc.rect(ML, y, CW, currentRowHeight).fill(T.surfaceStripe);
    }

    let rx = ML + 6;

    // Col 1: Index
    doc.fontSize(7).font("Helvetica").fillColor(T.inkLight).text(String(item.index), rx, y + 5.5, { width: colIndexW - 6, lineBreak: false });
    rx += colIndexW;

    // Col 2: Item & Description
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(T.inkHead).text(item.productName, rx, y + 4, { width: colDescW - 8, height: 10, ellipsis: true, lineBreak: false });
    if (hasVariant) {
      doc.fontSize(6.2).font("Helvetica").fillColor(T.brandPrimary).text(`Variant: ${item.variantName}`, rx, y + 13, { width: colDescW - 8, height: 8, ellipsis: true, lineBreak: false });
    }
    rx += colDescW;

    // Col 3: SKU
    doc.fontSize(6.8).font("Helvetica").fillColor(T.inkMuted).text(item.sku, rx, y + 5.5, { width: colSkuW - 6, ellipsis: true, lineBreak: false });
    rx += colSkuW;

    // Col 4: Qty
    doc.fontSize(7.8).font("Helvetica-Bold").fillColor(T.inkHead).text(item.quantity.toLocaleString(), rx, y + 5.5, { width: colQtyW, align: "center", lineBreak: false });
    rx += colQtyW;

    // Col 5: Unit Price
    doc.fontSize(7.5).font("Helvetica").fillColor(T.inkBody).text(formatCurrency(item.unitPrice, invoice.currencyCode), rx, y + 5.5, { width: colPriceW - 4, align: "right", lineBreak: false });
    rx += colPriceW;

    // Col 6: Discount
    const discStr = item.discount > 0 ? `-${formatCurrency(item.discount, invoice.currencyCode)}` : "—";
    doc.fontSize(7.2).font("Helvetica").fillColor(item.discount > 0 ? T.statusDueText : T.inkLight).text(discStr, rx, y + 5.5, { width: colDiscountW - 4, align: "right", lineBreak: false });
    rx += colDiscountW;

    // Col 7: Tax
    const taxStr = item.tax > 0 ? formatCurrency(item.tax, invoice.currencyCode) : "0.00";
    doc.fontSize(7.2).font("Helvetica").fillColor(T.inkMuted).text(taxStr, rx, y + 5.5, { width: colTaxW - 4, align: "right", lineBreak: false });
    rx += colTaxW;

    // Col 8: Total Amount
    doc.fontSize(7.8).font("Helvetica-Bold").fillColor(T.inkHead).text(formatCurrency(item.total, invoice.currencyCode), rx, y + 5.5, { width: colAmountW - 8, align: "right", lineBreak: false });

    // Subtle row divider line
    doc.moveTo(ML, y + currentRowHeight).lineTo(PAGE_WIDTH - MR, y + currentRowHeight).lineWidth(0.5).strokeColor(T.borderLight).stroke();
    y += currentRowHeight;
  });

  y += 10;

  // ── 5. Financial Totals, Tax Summary & Verification Module ─────────────────
  const totalsBoxWidth = 210;
  const totalsBoxX = PAGE_WIDTH - MR - totalsBoxWidth;
  const leftPanelWidth = CW - totalsBoxWidth - 14; // ~295pt
  const bottomSectionHeight = 110;

  // Check if financial summary fits on the current page; otherwise break cleanly
  if (y + bottomSectionHeight > MAX_CONTENT_Y) {
    doc.addPage();
    currentPageNum++;
    y = drawCompactPageHeader(currentPageNum);
  }

  // ── Left Column: Digital Verification & Audit Card ────────────────────────
  doc.roundedRect(ML, y, leftPanelWidth, bottomSectionHeight, 3).fillAndStroke(T.surfaceCard, T.borderLight);

  const qrSize = 54;
  const qrX = ML + 10;
  const qrY = y + 12;

  if (qrBuffer) {
    try {
      doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });
    } catch { }
  }

  const qTextX = qrX + qrSize + 12;
  const qTextW = leftPanelWidth - qrSize - 28;

  doc.fontSize(7.2).font("Helvetica-Bold").fillColor(T.brandPrimary).text("DIGITAL AUDIT & LEDGER VERIFICATION", qTextX, y + 10, { width: qTextW, characterSpacing: 0.5, lineBreak: false });
  doc.fontSize(6.5).font("Helvetica").fillColor(T.inkMuted).text("Scan this QR code with any mobile device or audit scanner to verify cryptographic order snapshot authenticity, official tax calculation ID, and settlement status.", qTextX, y + 21, { width: qTextW, height: 26 });

  doc.fontSize(6.2).font("Helvetica-Bold").fillColor(T.inkBody).text("VERIFICATION ENDPOINT:", qTextX, y + 50, { width: qTextW, lineBreak: false });
  doc.fontSize(6.2).font("Helvetica").fillColor(T.brandPrimary).text(invoice.verifyUrl, qTextX, y + 59, { width: qTextW, height: 14, ellipsis: true });

  const taxAuditRef = invoice.order?.stripeTaxCalculationId ? `Stripe Tax Calc: ${invoice.order.stripeTaxCalculationId}` : "Stripe Automated Sales Tax Certified";
  doc.fontSize(6).font("Helvetica-Bold").fillColor(T.inkMuted).text(taxAuditRef, qTextX, y + 74, { width: qTextW, lineBreak: false });

  // Payment Settlement Receipt Pill inside left card
  const settleY = y + 87;
  doc.rect(qTextX, settleY, qTextW, 14).fill(T.surfaceAlt);
  const isPaid = invoice.paymentStatus === "PAID" || invoice.invoiceStatus === "ISSUED";
  const settleText = isPaid
    ? `Settled via ${invoice.paymentMethod.replace(/_/g, " ")} (${invoice.stripePaymentIntentId ? invoice.stripePaymentIntentId.slice(0, 14) + "..." : "Authorized"})`
    : `Payment Outstanding: Payment Terms ${invoice.paymentTerms.replace(/_/g, " ")} • Due: ${invoice.dueDate}`;
  doc.fontSize(6.2).font("Helvetica-Bold").fillColor(isPaid ? T.statusPaidText : T.statusDueText).text(settleText, qTextX + 4, settleY + 3.5, { width: qTextW - 8, ellipsis: true, lineBreak: false });

  // ── Right Column: Grand Totals Breakdown Card ─────────────────────────────
  doc.roundedRect(totalsBoxX, y, totalsBoxWidth, bottomSectionHeight, 3).fillAndStroke(T.surfaceCard, T.borderLight);

  let tY = y + 8;
  const drawLine = (label, val, isBold = false, valColor = T.inkHead) => {
    doc.fontSize(7).font(isBold ? "Helvetica-Bold" : "Helvetica").fillColor(T.inkMuted).text(label, totalsBoxX + 10, tY, { width: 110, lineBreak: false });
    doc.fontSize(7.5).font(isBold ? "Helvetica-Bold" : "Helvetica").fillColor(valColor).text(val, totalsBoxX + 10, tY, { width: totalsBoxWidth - 20, align: "right", lineBreak: false });
    tY += 12;
  };

  drawLine("Subtotal:", formatCurrency(invoice.subtotal, invoice.currencyCode));

  if (invoice.discount > 0) {
    drawLine("Corporate Discount:", `-${formatCurrency(invoice.discount, invoice.currencyCode)}`, false, T.statusDueText);
  }

  const shipFormatted = invoice.shippingCharges > 0 ? formatCurrency(invoice.shippingCharges, invoice.currencyCode) : "Free / $0.00";
  drawLine("Shipping & Handling:", shipFormatted);

  const taxFormatted = invoice.tax > 0 ? formatCurrency(invoice.tax, invoice.currencyCode) : `${formatCurrency(0, invoice.currencyCode)} (0%)`;
  drawLine("Sales Tax / GST / VAT:", taxFormatted);

  // Hairline separator before final amounts
  doc.moveTo(totalsBoxX + 8, tY + 1).lineTo(totalsBoxX + totalsBoxWidth - 8, tY + 1).lineWidth(0.5).strokeColor(T.borderDark).stroke();
  tY += 5;

  // Grand Total Highlight Container
  const grandHighlightBg = isPaid ? T.brandLight : T.statusDueBg;
  const grandHighlightBorder = isPaid ? T.brandAccent : T.statusDueBorder;
  doc.roundedRect(totalsBoxX + 8, tY, totalsBoxWidth - 16, 22, 2).fillAndStroke(grandHighlightBg, grandHighlightBorder);

  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(T.inkHead).text("GRAND TOTAL:", totalsBoxX + 14, tY + 6.5, { lineBreak: false });
  doc.fontSize(11).font("Helvetica-Bold").fillColor(T.brandPrimary).text(formatCurrency(invoice.total, invoice.currencyCode), totalsBoxX + 14, tY + 5, { width: totalsBoxWidth - 30, align: "right", lineBreak: false });
  tY += 26;

  // Amount Paid & Balance Due
  const amountPaid = isPaid ? invoice.total : 0;
  const balanceDue = isPaid ? 0 : invoice.total;
  drawLine("Amount Paid:", formatCurrency(amountPaid, invoice.currencyCode), true, isPaid ? T.statusPaidText : T.inkMuted);
  drawLine("Balance Due:", formatCurrency(balanceDue, invoice.currencyCode), true, balanceDue > 0 ? T.statusDueText : T.inkMuted);

  y += bottomSectionHeight + 8;

  // ── 6. Commercial Terms & Warranty Notice (Compact Footer Banner) ──────────
  if (y + 36 <= MAX_CONTENT_Y) {
    doc.roundedRect(ML, y, CW, 28, 2).fillAndStroke(T.surfaceCard, T.borderLight);
    doc.fontSize(6).font("Helvetica-Bold").fillColor(T.inkHead).text("PAYMENT TERMS & RETURN POLICY:", ML + 8, y + 5, { characterSpacing: 0.5, lineBreak: false });
    const policyNote = invoice.company.footerNote || "Payment is governed by applicable commercial contract terms. Standard 30-day return policy applies to unopened items. Certified genuine supply.";
    doc.fontSize(5.8).font("Helvetica").fillColor(T.inkMuted).text(`${policyNote}   •   Inquiries: ${invoice.company.email}`, ML + 8, y + 14, { width: CW - 16, lineBreak: false, ellipsis: true });
  }

  // ── 7. Multi-Page Master Footer on All Buffered Pages ─────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    const footerY = PAGE_HEIGHT - FOOTER_RESERVED + 12;
    doc.moveTo(ML, footerY).lineTo(PAGE_WIDTH - MR, footerY).lineWidth(0.5).strokeColor(T.borderLight).stroke();

    // Line 1: Corporate Entity & Contacts
    doc.fontSize(6.5).font("Helvetica-Bold").fillColor(T.inkHead);
    doc.text(invoice.company.legalName, ML, footerY + 5, { width: CW / 2, lineBreak: false });

    doc.fontSize(6.5).font("Helvetica").fillColor(T.inkMuted);
    doc.text("Thank you for your business.", ML + (CW / 2), footerY + 5, { width: CW / 2, align: "right", lineBreak: false });

    // Line 2: Regulatory & Generation Reference
    const generatedTimestamp = new Date().toUTCString();
    const docMeta = `Document Ref: ${invoice.invoiceNumber}   •   Generated: ${generatedTimestamp}   •   Page ${i + 1} of ${range.count}`;
    doc.fontSize(5.8).font("Helvetica").fillColor(T.inkLight);
    doc.text(docMeta, ML, footerY + 16, { width: CW, align: "center", lineBreak: false });

    // Line 3: Official Legal Disclaimer
    const legalDisclaimer = `This is a computer-generated commercial tax invoice issued by ${invoice.company.brandName}. Registered in USA & international jurisdictions. Registered Office: ${invoice.company.address}`;
    doc.fontSize(5.5).font("Helvetica").fillColor(T.inkLight);
    doc.text(legalDisclaimer, ML, footerY + 25, { width: CW, align: "center", lineBreak: false });

    // Bottom decorative brand bar (Full Bleed)
    doc.rect(0, PAGE_HEIGHT - 3, PAGE_WIDTH, 3).fill(T.brandPrimary);
  }

  doc.end();
  return doc;
}

/**
 * Generates PDF Buffer for inline streaming, downloads, and email attachments.
 */
export async function generateInvoiceBuffer(order, options = {}) {
  const doc = await generateInvoicePdf(order, options);
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
  });
}

