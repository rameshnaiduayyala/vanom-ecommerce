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

// ─── Executive Corporate Design Tokens ──────────────────────────────────────
const T = {
  // Brand & Corporate Accents
  brandPrimary: "#0B4627",      // Deep Forest Emerald
  brandDark: "#082F1B",         // Midnight Forest
  brandAccent: "#16A34A",       // Crisp Vibrant Green
  brandMuted: "#15803D",        // Forest Mid Tone

  // Neutral Typography (Executive Slate)
  inkHead: "#0F172A",           // Slate 900 - Headlines, Primary Values
  inkBody: "#1E293B",           // Slate 800 - Body & Titles
  inkMuted: "#475569",          // Slate 600 - Secondary Metadata
  inkFaint: "#64748B",          // Slate 500 - Captions, Table Notes
  inkLight: "#94A3B8",          // Slate 400 - Subtle Indicators & Labels

  // Structural Surfaces & Borders
  white: "#FFFFFF",
  surfaceCard: "#F8FAFC",       // Slate 50 Card Background
  surfaceStripe: "#F9FBFA",     // Subtle Mint-Slate Zebra Tint
  borderLight: "#E2E8F0",       // Slate 200 Structural Line
  borderDark: "#CBD5E1",        // Slate 300 Separator

  // Status Badges
  statusPaidBg: "#ECFDF5",
  statusPaidText: "#065F46",
  statusPaidBorder: "#86EFAC",

  statusDueBg: "#FFFBEB",
  statusDueText: "#92400E",
  statusDueBorder: "#FDE68A",

  // Table Aesthetics
  tableHeaderBg: "#0B3020",
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
  const paymentMethod = order?.paymentMethod || (isB2B ? "DIRECT_CORPORATE_WIRE" : "ONLINE_GATEWAY");
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
    name: "Valued Commercial Partner",
    companyName: null,
    email: "billing@enterprise.com",
    phone: "N/A",
    taxId: null,
    regNo: null,
    address: "Registered Commercial Headquarters",
    city: "",
    state: "",
    postalCode: "",
    country: "US"
  };

  if (isB2B && order.business) {
    customer.name = order.business.contactPersonName || order.business.businessName;
    customer.companyName = order.business.businessName;
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
  if (Array.isArray(order.addresses)) {
    const shipping = order.addresses.find((a) => a.type === "SHIPPING") || order.addresses[0];
    if (shipping) shippingAddress = shipping;
  }
  if (typeof shippingAddress === "string") {
    try { shippingAddress = JSON.parse(shippingAddress); } catch { shippingAddress = { addressLine1: shippingAddress }; }
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
    const total = Number(it.total ?? (quantity * unitPrice));
    const tier = it.appliedTier ? (typeof it.appliedTier === "string" ? JSON.parse(it.appliedTier) : it.appliedTier) : null;

    return {
      index: idx + 1,
      productName,
      sku,
      quantity,
      unitPrice,
      total,
      tierMin: tier?.minQuantity || null,
      tierMax: tier?.maxQuantity || null
    };
  });

  const invoiceRec = options.invoice || (order?.invoices && order.invoices[0]) || null;

  const subtotal = Number(order.subtotal ?? invoiceRec?.subtotal ?? options.subtotal ?? items.reduce((sum, i) => sum + i.total, 0));
  const discount = Number(order.discount ?? invoiceRec?.discount ?? options.discount ?? 0);
  const shippingCharges = Number(order.shippingCharges ?? order.shippingAmount ?? invoiceRec?.shippingAmount ?? options.shippingAmount ?? options.shippingCharges ?? 0);
  const tax = Number(order.tax ?? order.taxAmount ?? invoiceRec?.taxAmount ?? options.taxAmount ?? options.tax ?? 0);
  const total = Number(order.total ?? order.totalAmount ?? invoiceRec?.totalAmount ?? options.totalAmount ?? (subtotal - discount + shippingCharges + tax));

  // Secure Verification URL for Audit Gateway
  const verifyBaseUrl = env.clientUrl || env.appUrl || "https://vanom-commerce.com";
  const verifyUrl = `${verifyBaseUrl.replace(/\/+$/, "")}/invoice/verify/${encodeURIComponent(invoiceNumber)}`;

  return {
    invoiceNumber,
    orderNumber,
    orderId: order.id,
    invoiceType,
    date: formattedDate,
    dueDate: formattedDueDate,
    paymentMethod,
    paymentTerms,
    status: (order.status || "ISSUED").toUpperCase(),
    paymentStatus: (order.paymentStatus || (isB2B ? "INVOICED_NET15" : "PAID")).toUpperCase(),
    currencyCode,
    company,
    customer,
    shippingAddress,
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
        dark: "#0B3020",
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
  // Setting margins to 0 prevents automatic unwanted page breaks near bottom margins
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: true,
    info: {
      Title: `Invoice ${invoice.invoiceNumber} - ${invoice.company.brandName}`,
      Author: invoice.company.legalName,
      Subject: `Commercial Tax Invoice for ${invoice.customer.name}`,
      Keywords: "invoice, tax invoice, b2b, corporate, enterprise"
    }
  });

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const ML = 36;
  const MR = 36;
  const CW = PAGE_WIDTH - ML - MR; // 523.28pt printable width

  const qrBuffer = await generateQrBuffer(invoice.verifyUrl);

  // ── 1. Top Decorative Brand Bar (Full Bleed) ─────────────────────────────
  doc.rect(0, 0, PAGE_WIDTH, 4).fill(T.brandPrimary);

  // ── 2. Header Area (Brand Identity on Left, Invoice Card on Right) ──────
  let y = 26;

  // Left: Brand Logo & Legal Entity
  const logoWidth = 120;
  const logoHeight = 32;
  let logoDrawn = false;

  if (invoice.company.logoUrl && fs.existsSync(invoice.company.logoUrl)) {
    try {
      doc.image(invoice.company.logoUrl, ML, y, { fit: [logoWidth, logoHeight] });
      logoDrawn = true;
    } catch {}
  }

  if (!logoDrawn && fs.existsSync(DEFAULT_LOGO_PATH)) {
    try {
      doc.image(DEFAULT_LOGO_PATH, ML, y, { fit: [logoWidth, logoHeight] });
      logoDrawn = true;
    } catch {}
  }

  if (!logoDrawn) {
    doc.fontSize(19).font("Helvetica-Bold").fillColor(T.brandPrimary).text(invoice.company.brandName, ML, y, { lineBreak: false });
  }

  // Company details below logo
  const compDetailsY = y + logoHeight + 4;
  let compY = compDetailsY;

  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(T.inkHead);
  doc.text(invoice.company.legalName, ML, compY, { width: 315, lineBreak: false });
  compY = doc.y + 2;

  doc.fontSize(6.8).font("Helvetica").fillColor(T.inkMuted);
  doc.text(invoice.company.address, ML, compY, { width: 315, lineBreak: false });
  compY = doc.y + 2;

  doc.fontSize(6.5).font("Helvetica").fillColor(T.inkFaint);
  doc.text(`${invoice.company.email}   •   ${invoice.company.phone}`, ML, compY, { width: 315, lineBreak: false });
  compY = doc.y + 2;

  doc.fontSize(6.5).font("Helvetica-Bold").fillColor(T.inkMuted);
  doc.text(invoice.company.taxIds, ML, compY, { width: 315, lineBreak: false });
  compY = doc.y;

  // Right: Document Identification & Status Badge
  const rightWidth = 195;
  const rightX = PAGE_WIDTH - MR - rightWidth;
  const docTitle = invoice.invoiceType === "B2B" ? "COMMERCIAL TAX INVOICE" : "TAX INVOICE";

  doc.fontSize(14).font("Helvetica-Bold").fillColor(T.inkHead).text(docTitle, rightX, y, { width: rightWidth, align: "right", lineBreak: false });
  doc.fontSize(12).font("Helvetica-Bold").fillColor(T.brandPrimary).text(invoice.invoiceNumber, rightX, y + 17, { width: rightWidth, align: "right", lineBreak: false });

  // Status Pill Badge
  const isPaid = invoice.paymentStatus.includes("PAID") || invoice.status === "COMPLETED";
  const statusLabel = isPaid ? "PAID" : invoice.paymentStatus.replace(/_/g, " ");
  const badgeBg = isPaid ? T.statusPaidBg : T.statusDueBg;
  const badgeBorder = isPaid ? T.statusPaidBorder : T.statusDueBorder;
  const badgeText = isPaid ? T.statusPaidText : T.statusDueText;
  
  const badgeW = Math.max(50, statusLabel.length * 6 + 14);
  const badgeH = 14;
  const badgeX = PAGE_WIDTH - MR - badgeW;
  const badgeY = y + 35;

  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 7).fillAndStroke(badgeBg, badgeBorder);
  doc.fontSize(6.5).font("Helvetica-Bold").fillColor(badgeText).text(statusLabel, badgeX, badgeY + 3.5, { width: badgeW, align: "center", lineBreak: false });

  // Metadata block (Dates & Order Ref)
  doc.fontSize(7).font("Helvetica").fillColor(T.inkMuted);
  doc.text(`Order Ref: #${invoice.orderNumber}`, rightX, y + 53, { width: rightWidth, align: "right", lineBreak: false });
  doc.text(`Issued: ${invoice.date}   •   Due: ${invoice.dueDate}`, rightX, y + 63, { width: rightWidth, align: "right", lineBreak: false });

  y = Math.max(compY + 8, y + 78);
  doc.moveTo(ML, y).lineTo(PAGE_WIDTH - MR, y).lineWidth(0.75).strokeColor(T.borderLight).stroke();
  y += 8;

  // ── 3. 3-Column Structured Information Panel ─────────────────────────────
  const colGap = 9;
  const colWidth = (CW - colGap * 2) / 3; // ~168.4pt
  const c1X = ML;
  const c2X = ML + colWidth + colGap;
  const c3X = c2X + colWidth + colGap;
  const panelHeight = 78;

  const drawInfoPanel = (x, title, accentColor) => {
    doc.roundedRect(x, y, colWidth, panelHeight, 4).fillAndStroke(T.surfaceCard, T.borderLight);
    doc.roundedRect(x, y, 3, panelHeight, 1.5).fill(accentColor);
    doc.fontSize(6.5).font("Helvetica-Bold").fillColor(T.inkLight).text(title, x + 8, y + 6, { width: colWidth - 16, lineBreak: false });
  };

  // Card 1: Supplier / Issued By
  drawInfoPanel(c1X, "ISSUED BY (SUPPLIER)", T.brandPrimary);
  doc.fontSize(8).font("Helvetica-Bold").fillColor(T.inkHead).text(invoice.company.brandName, c1X + 8, y + 17, { width: colWidth - 16, lineBreak: false });
  doc.fontSize(6.8).font("Helvetica").fillColor(T.inkMuted);
  doc.text(invoice.company.legalName, c1X + 8, y + 28, { width: colWidth - 16, height: 9, ellipsis: true, lineBreak: false });
  doc.text(invoice.company.address, c1X + 8, y + 38, { width: colWidth - 16, height: 18, ellipsis: true });
  doc.text(invoice.company.email, c1X + 8, y + 59, { width: colWidth - 16, height: 9, ellipsis: true, lineBreak: false });

  // Card 2: Billed To / Recipient
  drawInfoPanel(c2X, "BILLED TO (RECIPIENT)", T.brandMuted);
  const custTitle = invoice.customer.companyName || invoice.customer.name;
  doc.fontSize(8).font("Helvetica-Bold").fillColor(T.inkHead).text(custTitle, c2X + 8, y + 17, { width: colWidth - 16, height: 10, ellipsis: true, lineBreak: false });
  doc.fontSize(6.8).font("Helvetica").fillColor(T.inkMuted);
  if (invoice.customer.taxId) {
    doc.text(`Tax ID: ${invoice.customer.taxId}`, c2X + 8, y + 28, { width: colWidth - 16, height: 9, ellipsis: true, lineBreak: false });
    doc.text(invoice.customer.address || "Standard Registered Address", c2X + 8, y + 38, { width: colWidth - 16, height: 18, ellipsis: true });
  } else {
    doc.text(invoice.customer.email, c2X + 8, y + 28, { width: colWidth - 16, height: 9, ellipsis: true, lineBreak: false });
    doc.text(invoice.customer.address || "Standard Registered Address", c2X + 8, y + 38, { width: colWidth - 16, height: 18, ellipsis: true });
  }
  doc.text(invoice.customer.phone || invoice.customer.email, c2X + 8, y + 59, { width: colWidth - 16, height: 9, ellipsis: true, lineBreak: false });

  // Card 3: Settlement Terms & Logistics
  drawInfoPanel(c3X, "TERMS & SETTLEMENT", T.inkHead);
  doc.fontSize(6.8).font("Helvetica").fillColor(T.inkMuted);
  
  doc.text("Payment Method:", c3X + 8, y + 18, { width: 70, lineBreak: false });
  doc.font("Helvetica-Bold").fillColor(T.inkHead).text(invoice.paymentMethod, c3X + 76, y + 18, { width: colWidth - 82, lineBreak: false, ellipsis: true });

  doc.font("Helvetica").fillColor(T.inkMuted).text("Payment Terms:", c3X + 8, y + 29, { width: 70, lineBreak: false });
  doc.font("Helvetica-Bold").fillColor(T.inkHead).text(invoice.paymentTerms, c3X + 76, y + 29, { width: colWidth - 82, lineBreak: false });

  doc.font("Helvetica").fillColor(T.inkMuted).text("Currency Snapshot:", c3X + 8, y + 40, { width: 70, lineBreak: false });
  doc.font("Helvetica-Bold").fillColor(T.brandPrimary).text(invoice.currencyCode, c3X + 76, y + 40, { width: colWidth - 82, lineBreak: false });

  doc.font("Helvetica").fillColor(T.inkMuted).text("Status Snapshot:", c3X + 8, y + 51, { width: 70, lineBreak: false });
  doc.font("Helvetica-Bold").fillColor(T.inkHead).text(invoice.paymentStatus, c3X + 76, y + 51, { width: colWidth - 82, lineBreak: false, ellipsis: true });

  y += panelHeight + 10;

  // ── 4. Line Items Table ──────────────────────────────────────────────────
  const tableHeaderHeight = 20;
  const colIndexW = 24;
  const colQtyW = 44;
  const colPriceW = 95;
  const colTotalW = 100;
  const colItemW = CW - colIndexW - colQtyW - colPriceW - colTotalW; // ~260.28pt

  const drawTableHeader = (atY) => {
    doc.roundedRect(ML, atY, CW, tableHeaderHeight, 3).fill(T.tableHeaderBg);
    doc.fontSize(7).font("Helvetica-Bold").fillColor(T.white);
    doc.text("#", ML + 6, atY + 6, { width: colIndexW - 6, lineBreak: false });
    doc.text("ITEM DESCRIPTION & SPECIFICATION", ML + colIndexW, atY + 6, { width: colItemW, lineBreak: false });
    doc.text("QTY", ML + colIndexW + colItemW, atY + 6, { width: colQtyW, align: "center", lineBreak: false });
    doc.text("UNIT PRICE", ML + colIndexW + colItemW + colQtyW, atY + 6, { width: colPriceW - 8, align: "right", lineBreak: false });
    doc.text("AMOUNT", ML + colIndexW + colItemW + colQtyW + colPriceW, atY + 6, { width: colTotalW - 8, align: "right", lineBreak: false });
  };

  drawTableHeader(y);
  y += tableHeaderHeight;

  // Render Table Rows
  const rowHeight = 23;
  const maxTableY = PAGE_HEIGHT - 170; // Guarantee single-page space for summary + verification + footer

  invoice.items.forEach((item, i) => {
    // If table exceeds page limit, flow to next page cleanly
    if (y + rowHeight > maxTableY) {
      doc.addPage();
      doc.rect(0, 0, PAGE_WIDTH, 4).fill(T.brandPrimary);
      y = 30;
      drawTableHeader(y);
      y += tableHeaderHeight;
    }

    const isEven = i % 2 === 0;
    if (!isEven) {
      doc.rect(ML, y, CW, rowHeight).fill(T.surfaceStripe);
    }

    // Row Index
    doc.fontSize(7.5).font("Helvetica").fillColor(T.inkLight);
    doc.text(String(item.index), ML + 6, y + 6, { width: colIndexW - 6, lineBreak: false });

    // Item Name & SKU
    doc.fontSize(8).font("Helvetica-Bold").fillColor(T.inkHead);
    doc.text(item.productName, ML + colIndexW, y + 4, { width: colItemW - 8, height: 10, ellipsis: true, lineBreak: false });

    doc.fontSize(6.5).font("Helvetica").fillColor(T.inkFaint);
    const skuMeta = `SKU: ${item.sku || "N/A"}${item.tierMin ? ` • Tier: ${item.tierMin}+ units` : ""}`;
    doc.text(skuMeta, ML + colIndexW, y + 13, { width: colItemW - 8, height: 8, ellipsis: true, lineBreak: false });

    // Quantity
    doc.fontSize(8).font("Helvetica-Bold").fillColor(T.inkHead);
    doc.text(item.quantity.toLocaleString(), ML + colIndexW + colItemW, y + 6, { width: colQtyW, align: "center", lineBreak: false });

    // Unit Price
    doc.fontSize(7.8).font("Helvetica").fillColor(T.inkMuted);
    doc.text(formatCurrency(item.unitPrice, invoice.currencyCode), ML + colIndexW + colItemW + colQtyW, y + 6, { width: colPriceW - 8, align: "right", lineBreak: false });

    // Amount
    doc.fontSize(8.2).font("Helvetica-Bold").fillColor(T.inkHead);
    doc.text(formatCurrency(item.total, invoice.currencyCode), ML + colIndexW + colItemW + colQtyW + colPriceW, y + 6, { width: colTotalW - 8, align: "right", lineBreak: false });

    // Subtle bottom border
    doc.moveTo(ML, y + rowHeight).lineTo(PAGE_WIDTH - MR, y + rowHeight).lineWidth(0.5).strokeColor(T.borderLight).stroke();
    y += rowHeight;
  });

  y += 10;

  // ── 5. Financial Summary & Verification Panel ─────────────────────────────
  const summaryBoxWidth = 220;
  const summaryBoxX = PAGE_WIDTH - MR - summaryBoxWidth;
  const qrPanelWidth = CW - summaryBoxWidth - 10;
  const bottomCardHeight = invoice.discount > 0 ? 94 : 84;

  // Left: Digital Verification & Authenticity Card
  doc.roundedRect(ML, y, qrPanelWidth, bottomCardHeight, 4).fillAndStroke(T.surfaceCard, T.borderLight);

  const qrSize = 58;
  const qrX = ML + 10;
  const qrY = y + 13;

  if (qrBuffer) {
    try {
      doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });
    } catch (e) {
      console.warn("QR render issue:", e);
    }
  }

  const qrTextX = qrX + qrSize + 12;
  const qrTextW = qrPanelWidth - qrSize - 28;

  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(T.brandPrimary).text("DIGITALLY VERIFIED INVOICE", qrTextX, y + 10, { width: qrTextW, lineBreak: false });
  doc.fontSize(6.8).font("Helvetica").fillColor(T.inkMuted).text("Scan this secure QR code to verify invoice authenticity, payment state, and cryptographic transaction snapshots.", qrTextX, y + 21, { width: qrTextW, height: 24 });
  doc.fontSize(6.5).font("Helvetica").fillColor(T.inkFaint).text(`Direct URL: ${invoice.verifyUrl}`, qrTextX, y + 47, { width: qrTextW, height: 16, ellipsis: true });
  doc.fontSize(6.5).font("Helvetica-Bold").fillColor(T.brandMuted).text(`Official Merchant Ledger  •  ${invoice.company.brandName}`, qrTextX, y + 66, { width: qrTextW, lineBreak: false });

  // Right: Grand Totals Breakdown Card
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, bottomCardHeight, 4).fillAndStroke(T.surfaceCard, T.borderLight);

  let tY = y + 8;
  const rowH = 13;

  const drawTotalLine = (label, val, isBold = false, color = T.inkHead) => {
    doc.fontSize(7.5).font(isBold ? "Helvetica-Bold" : "Helvetica").fillColor(T.inkMuted).text(label, summaryBoxX + 10, tY, { width: 100, lineBreak: false });
    doc.fontSize(7.8).font(isBold ? "Helvetica-Bold" : "Helvetica").fillColor(color).text(val, summaryBoxX + 10, tY, { width: summaryBoxWidth - 20, align: "right", lineBreak: false });
    tY += rowH;
  };

  drawTotalLine("Subtotal:", formatCurrency(invoice.subtotal, invoice.currencyCode));

  if (invoice.discount > 0) {
    drawTotalLine("Corporate Discount:", `-${formatCurrency(invoice.discount, invoice.currencyCode)}`, false, T.statusDueText);
  }

  // Tax / VAT (always explicitly displayed to match DB records)
  const taxFormatted = invoice.tax > 0 ? formatCurrency(invoice.tax, invoice.currencyCode) : `${formatCurrency(0, invoice.currencyCode)} (0%)`;
  drawTotalLine("Estimated Tax / VAT:", taxFormatted);

  // Shipping / Freight (always explicitly displayed to match DB records)
  const shippingFormatted = invoice.shippingCharges > 0 ? formatCurrency(invoice.shippingCharges, invoice.currencyCode) : "Free / $0.00";
  drawTotalLine("Shipping & Freight:", shippingFormatted);

  // Divider line before grand total
  doc.moveTo(summaryBoxX + 8, tY + 2).lineTo(summaryBoxX + summaryBoxWidth - 8, tY + 2).lineWidth(0.75).strokeColor(T.borderDark).stroke();
  tY += 6;

  // Grand Total Highlight
  const totalLabel = isPaid ? "TOTAL PAID:" : "TOTAL DUE:";
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(T.inkHead).text(totalLabel, summaryBoxX + 10, tY + 3, { width: 90, lineBreak: false });
  doc.fontSize(12).font("Helvetica-Bold").fillColor(T.brandPrimary).text(formatCurrency(invoice.total, invoice.currencyCode), summaryBoxX + 10, tY, { width: summaryBoxWidth - 20, align: "right", lineBreak: false });

  // ── 6. Header/Footer Finalizer on All Pages ──────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    // Top brand bar
    doc.rect(0, 0, PAGE_WIDTH, 4).fill(T.brandPrimary);

    // Bottom document footer
    const footerY = 806;

    if (invoice.company.footerNote) {
      doc.fontSize(6.5).font("Helvetica-Oblique").fillColor(T.inkFaint);
      doc.text(`Notice: ${invoice.company.footerNote}`, ML, footerY - 10, { width: CW, align: "center", lineBreak: false });
    }

    doc.moveTo(ML, footerY).lineTo(PAGE_WIDTH - MR, footerY).lineWidth(0.5).strokeColor(T.borderLight).stroke();
    
    const pageIndicator = range.count > 1 ? `   •   Page ${i + 1} of ${range.count}` : "";
    doc.fontSize(6.5).font("Helvetica").fillColor(T.inkLight);
    doc.text(
      `${invoice.company.legalName}   •   Document Ref: ${invoice.invoiceNumber}   •   Issued: ${invoice.date}${pageIndicator}`,
      ML,
      footerY + 4,
      { width: CW, align: "center", lineBreak: false }
    );

    doc.fontSize(6).font("Helvetica").fillColor(T.inkLight);
    doc.text(
      "This is an official computer-generated commercial tax invoice. Registered office: " + invoice.company.address,
      ML,
      footerY + 13,
      { width: CW, align: "center", lineBreak: false }
    );

    // Bottom brand accent bar (Full Bleed)
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
