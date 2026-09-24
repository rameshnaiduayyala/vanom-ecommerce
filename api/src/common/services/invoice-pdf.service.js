import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.resolve(__dirname, "../../assets/logo.png");

// ─── Executive Color Palette ────────────────────────────────────────────────
const C = {
  primary: "#0B4627",          // Deep forest emerald
  primaryLight: "#F0FDF4",     // Crisp emerald tint
  primaryBorder: "#86EFAC",
  navyDark: "#0F172A",         // Rich slate 900
  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",
  amber: "#B45309",
  amberBg: "#FFFBEB",
  amberBorder: "#FDE68A",
  white: "#FFFFFF",
  tableHeaderBg: "#0F291E",    // Luxury deep pine
  tableStripe: "#F8FAF9",
};

const COMPANY_INFO = {
  legalName: "VANOM Global Supply Chain & Commerce Ltd.",
  brandName: "VANOM",
  tagline: "Global Wholesale & Commercial Enterprise Commerce",
  address: "100 World Trade Center Blvd, Suite 400, New York, NY 10007, USA",
  phone: "+1 (800) 555-VANOM  •  +91 7989419864",
  email: "corporate.billing@vanom-global.com",
  website: "https://vanom-commerce.com",
  taxIds: "EIN: 82-9384721  •  VAT: GB-984210984  •  GSTIN: 36AABCV9842K1Z5"
};

function formatCurrency(amount, currencyCode = "USD") {
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

function normalizeInvoiceData(order, type = "AUTO") {
  const isB2B = type === "B2B" || order?.orderNumber?.startsWith("BULK") || !!order?.business || !!order?.businessId;
  const invoiceType = isB2B ? "B2B" : "RETAIL";

  const orderNumber = order?.orderNumber || (order?.id ? `INV-${order.id.slice(0, 8).toUpperCase()}` : `INV-${Date.now()}`);
  const createdAt = order?.createdAt ? new Date(order.createdAt) : new Date();
  const dueDate = new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000);

  const formattedDate = createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formattedDueDate = dueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const currencyCode = order?.currencyCode || "USD";

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

  let shippingAddress = order.shippingAddress || {};
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

  const items = (order.items || []).map((it, idx) => {
    const productName = it.productName || it.product?.name || it.name || `Commercial Commodity Line #${idx + 1}`;
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

  const subtotal = items.reduce((sum, i) => sum + i.total, 0) || Number(order.subtotal || order.total || 0);
  const discount = Number(order.discount || 0);
  const shippingCharges = Number(order.shippingCharges || 0);
  const tax = Number(order.tax || 0);
  const total = Number(order.total ?? (subtotal - discount + shippingCharges + tax));

  return {
    invoiceType,
    orderNumber,
    orderId: order.id,
    date: formattedDate,
    dueDate: formattedDueDate,
    status: (order.status || "CONFIRMED").toUpperCase(),
    paymentStatus: (order.paymentStatus || (isB2B ? "NET_15_INVOICED" : "PAID")).toUpperCase(),
    currencyCode,
    customer,
    shippingAddress,
    items,
    subtotal,
    discount,
    shippingCharges,
    tax,
    total
  };
}

async function generateQrBuffer(text) {
  try {
    return await QRCode.toBuffer(text, {
      width: 220,
      margin: 1,
      color: {
        dark: "#0F291E",
        light: "#FFFFFF"
      }
    });
  } catch (err) {
    console.warn("QR generation failed:", err);
    return null;
  }
}

/**
 * Builds high-fidelity, publication-grade executive invoice PDF
 */
export async function generateInvoicePdf(rawOrder, options = {}) {
  const invoice = normalizeInvoiceData(rawOrder, options.type);
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 36, bottom: 36, left: 36, right: 36 },
    info: {
      Title: `Invoice ${invoice.orderNumber} - VANOM`,
      Author: COMPANY_INFO.legalName,
      Subject: `Official Commercial Tax Invoice for ${invoice.customer.name}`,
      Keywords: "invoice, b2b, wholesale, commercial, tax invoice, vanom"
    }
  });

  const MARGIN = 36;
  const PAGE_WIDTH = doc.page.width;
  const PAGE_HEIGHT = doc.page.height;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  // Encode structured invoice data + invoice number into QR Matrix
  const qrPayload = JSON.stringify({
    invoiceNumber: invoice.orderNumber,
    orderId: invoice.orderId,
    total: `${invoice.currencyCode} ${invoice.total}`,
    date: invoice.date,
    issuer: COMPANY_INFO.brandName,
    verifyUrl: `https://vanom-commerce.com/orders/${invoice.orderId || invoice.orderNumber}`
  });
  const qrBuffer = await generateQrBuffer(qrPayload);

  let y = MARGIN;


  // ── 1. Top Decorative Brand Bar ──────────────────────────────────────────
  doc.rect(MARGIN, y, CONTENT_WIDTH, 4).fill(C.primary);
  y += 14;

  // ── 2. Top Header: Logo + Brand Info (Left) | Luxury Invoice Block (Right) ─
  const headerTopY = y;
  const logoWidth = 145;
  const logoHeight = 42;

  if (fs.existsSync(LOGO_PATH)) {
    try {
      doc.image(LOGO_PATH, MARGIN, y, { width: logoWidth });
    } catch {
      doc.fontSize(22).font("Helvetica-Bold").fillColor(C.primary).text(COMPANY_INFO.brandName, MARGIN, y);
    }
  } else {
    doc.fontSize(22).font("Helvetica-Bold").fillColor(C.primary).text(COMPANY_INFO.brandName, MARGIN, y);
  }

  // Issuer address under logo
  const issuerY = y + logoHeight + 4;
  doc.fontSize(7.5).font("Helvetica").fillColor(C.slate500);
  doc.text(COMPANY_INFO.legalName, MARGIN, issuerY);
  doc.text(COMPANY_INFO.address, MARGIN, doc.y + 1);
  doc.text(`${COMPANY_INFO.email}  •  ${COMPANY_INFO.phone}`, MARGIN, doc.y + 1);
  doc.fontSize(7).font("Helvetica-Bold").fillColor(C.slate600);
  doc.text(COMPANY_INFO.taxIds, MARGIN, doc.y + 2);

  const leftBottom = doc.y;

  // Right Side: Luxury Document Identification Card
  const boxWidth = 215;
  const boxX = PAGE_WIDTH - MARGIN - boxWidth;
  const boxHeight = 78;

  // Card Background with dual shadow & primary accent header
  doc.roundedRect(boxX, headerTopY, boxWidth, boxHeight, 6).fillAndStroke(C.slate50, C.slate300);
  doc.roundedRect(boxX, headerTopY, boxWidth, 20, 6).fill(C.tableHeaderBg);

  // Card Header Tag
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.white);
  doc.text(
    invoice.invoiceType === "B2B" ? "COMMERCIAL TAX INVOICE" : "OFFICIAL TAX INVOICE",
    boxX + 10,
    headerTopY + 5.5,
    { width: boxWidth - 20, align: "center" }
  );

  // Invoice Number
  doc.fontSize(11.5).font("Helvetica-Bold").fillColor(C.navyDark);
  doc.text(`INVOICE NO: ${invoice.orderNumber}`, boxX + 10, headerTopY + 26, { width: boxWidth - 20, align: "right" });

  // Dates & Badges
  doc.fontSize(7.5).font("Helvetica").fillColor(C.slate600);
  doc.text(`Invoice Date: ${invoice.date}`, boxX + 10, headerTopY + 42, { width: boxWidth - 20, align: "right" });
  doc.text(`Payment Due: ${invoice.dueDate}`, boxX + 10, headerTopY + 52, { width: boxWidth - 20, align: "right" });

  doc.fontSize(8).font("Helvetica-Bold").fillColor(C.primary);
  doc.text(`Status: ${invoice.status}`, boxX + 10, headerTopY + 63, { width: boxWidth - 20, align: "right" });


  y = Math.max(leftBottom, headerTopY + boxHeight) + 12;

  // Divider line
  doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).lineWidth(0.75).strokeColor(C.slate200).stroke();
  y += 10;

  // ── 3. 3-Column Structured Information Panel ─────────────────────────────
  const colGap = 8;
  const colWidth = (CONTENT_WIDTH - colGap * 2) / 3;
  const c1X = MARGIN;
  const c2X = MARGIN + colWidth + colGap;
  const c3X = c2X + colWidth + colGap;
  const panelHeight = 88;

  // Col 1: Billed Customer
  doc.roundedRect(c1X, y, colWidth, panelHeight, 5).fillAndStroke(C.slate50, C.slate200);
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(C.slate400).text("BILLED RECIPIENT", c1X + 8, y + 7);
  doc.fontSize(9).font("Helvetica-Bold").fillColor(C.navyDark).text(invoice.customer.companyName || invoice.customer.name, c1X + 8, y + 18, { width: colWidth - 16, height: 11, ellipsis: true });
  doc.fontSize(7.5).font("Helvetica").fillColor(C.slate600);
  if (invoice.customer.taxId) {
    doc.text(`Tax / GSTIN ID: ${invoice.customer.taxId}`, c1X + 8, doc.y + 1, { width: colWidth - 16, ellipsis: true });
  }
  doc.text(invoice.customer.email, c1X + 8, doc.y + 1, { width: colWidth - 16, ellipsis: true });
  doc.text(invoice.customer.phone, c1X + 8, doc.y + 1, { width: colWidth - 16, ellipsis: true });
  if (invoice.invoiceType === "B2B") {
    doc.fontSize(7).font("Helvetica-Bold").fillColor(C.primary).text("✓ Verified Tier Enterprise Partner", c1X + 8, doc.y + 2);
  }

  // Col 2: Shipping Logistics
  doc.roundedRect(c2X, y, colWidth, panelHeight, 5).fillAndStroke(C.slate50, C.slate200);
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(C.slate400).text("FULFILLMENT & DISPATCH", c2X + 8, y + 7);
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.navyDark).text(invoice.customer.name, c2X + 8, y + 18, { width: colWidth - 16, height: 11, ellipsis: true });
  doc.fontSize(7.5).font("Helvetica").fillColor(C.slate600);
  doc.text(invoice.customer.address || "Standard Logistics Warehouse Dock", c2X + 8, doc.y + 1, { width: colWidth - 16, height: 20 });
  const cityState = [invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(", ");
  if (cityState) {
    doc.text(`${cityState}, ${invoice.customer.country}`, c2X + 8, doc.y + 1, { width: colWidth - 16, ellipsis: true });
  }

  // Col 3: Financial & Settlement Terms
  doc.roundedRect(c3X, y, colWidth, panelHeight, 5).fillAndStroke(C.slate50, C.slate200);
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(C.slate400).text("FINANCIAL SETTLEMENT", c3X + 8, y + 7);
  doc.fontSize(7.5).font("Helvetica").fillColor(C.slate600);
  
  doc.text("Payment Method: ", c3X + 8, y + 20, { continued: true });
  doc.font("Helvetica-Bold").fillColor(C.navyDark).text(invoice.invoiceType === "B2B" ? "Direct Corporate Wire / ACH" : "Online Gateway");

  doc.font("Helvetica").fillColor(C.slate600).text("Settlement Terms: ", c3X + 8, doc.y + 2, { continued: true });
  doc.font("Helvetica-Bold").fillColor(C.navyDark).text(invoice.invoiceType === "B2B" ? "Net 15 Direct Billing" : "Prepaid in Full");

  doc.font("Helvetica").fillColor(C.slate600).text("Base Currency: ", c3X + 8, doc.y + 2, { continued: true });
  doc.font("Helvetica-Bold").fillColor(C.primary).text(invoice.currencyCode);

  doc.font("Helvetica").fillColor(C.slate600).text("Fulfillment: ", c3X + 8, doc.y + 2, { continued: true });
  doc.font("Helvetica-Bold").fillColor(C.navyDark).text(invoice.invoiceType === "B2B" ? "Freight Ground Express" : "Direct Courier");

  y += panelHeight + 12;

  // ── 4. Line Items Table (Clean, High-Readability Vector Styling) ──────────
  const tableHeaderHeight = 22;
  const colIndexW = 24;
  const colItemW = CONTENT_WIDTH - 24 - 50 - 85 - 90;
  const colQtyW = 50;
  const colPriceW = 85;
  const colTotalW = 90;

  // Draw Table Header
  const drawTableHeader = (atY) => {
    doc.rect(MARGIN, atY, CONTENT_WIDTH, tableHeaderHeight).fill(C.tableHeaderBg);
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(C.white);
    doc.text("#", MARGIN + 6, atY + 6, { width: colIndexW });
    doc.text("ITEM DETAILS & SPECIFICATIONS", MARGIN + colIndexW + 6, atY + 6, { width: colItemW });
    doc.text("QTY", MARGIN + colIndexW + colItemW, atY + 6, { width: colQtyW, align: "center" });
    doc.text("UNIT PRICE", MARGIN + colIndexW + colItemW + colQtyW, atY + 6, { width: colPriceW, align: "right" });
    doc.text("TOTAL", MARGIN + colIndexW + colItemW + colQtyW + colPriceW - 6, atY + 6, { width: colTotalW, align: "right" });
  };

  drawTableHeader(y);
  y += tableHeaderHeight;

  // Table Body Rows
  invoice.items.forEach((item, i) => {
    const isEven = i % 2 === 0;
    const rowHeight = 25;

    // Multi-page safety
    if (y + rowHeight > PAGE_HEIGHT - 145) {
      doc.addPage();
      y = MARGIN;
      doc.rect(MARGIN, y, CONTENT_WIDTH, 4).fill(C.primary);
      y += 10;
      drawTableHeader(y);
      y += tableHeaderHeight;
    }

    // Alternating Zebra Row Background
    if (!isEven) {
      doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(C.tableStripe);
    }

    doc.fontSize(8).font("Helvetica-Bold").fillColor(C.slate400);
    doc.text(String(item.index), MARGIN + 6, y + 5, { width: colIndexW });

    // Item title & SKU
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.navyDark);
    doc.text(item.productName, MARGIN + colIndexW + 6, y + 4, { width: colItemW - 10, height: 10, ellipsis: true });
    doc.fontSize(7).font("Helvetica").fillColor(C.slate400);
    doc.text(`SKU: ${item.sku || "N/A"}${item.tierMin ? ` • Tier: ${item.tierMin}+ units` : ""}`, MARGIN + colIndexW + 6, y + 14, { width: colItemW - 10, ellipsis: true });

    // Quantity
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.navyDark);
    doc.text(item.quantity.toLocaleString(), MARGIN + colIndexW + colItemW, y + 7, { width: colQtyW, align: "center" });

    // Unit Price
    doc.fontSize(8).font("Helvetica").fillColor(C.slate700);
    doc.text(formatCurrency(item.unitPrice, invoice.currencyCode), MARGIN + colIndexW + colItemW + colQtyW, y + 7, { width: colPriceW, align: "right" });

    // Total
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.navyDark);
    doc.text(formatCurrency(item.total, invoice.currencyCode), MARGIN + colIndexW + colItemW + colQtyW + colPriceW - 6, y + 7, { width: colTotalW, align: "right" });

    // Border line below each row
    doc.moveTo(MARGIN, y + rowHeight).lineTo(PAGE_WIDTH - MARGIN, y + rowHeight).lineWidth(0.5).strokeColor(C.slate200).stroke();
    y += rowHeight;
  });

  y += 10;

  // ── 5. Bottom Section: Embedded Live QR Audit Card (Left) & Totals (Right) ─
  const summaryBoxWidth = 215;
  const summaryBoxX = PAGE_WIDTH - MARGIN - summaryBoxWidth;
  const leftSummaryWidth = CONTENT_WIDTH - summaryBoxWidth - 12;
  const bottomCardHeight = 98;

  // Left Security & Live Audit QR Box
  doc.roundedRect(MARGIN, y, leftSummaryWidth, bottomCardHeight, 5).fillAndStroke(C.slate50, C.slate200);

  const qrSize = 68;
  const qrX = MARGIN + 10;
  const qrY = y + 15;

  if (qrBuffer) {
    try {
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
    } catch (e) {
      console.warn("QR draw error:", e);
    }
  }

  const qrTextX = qrX + qrSize + 12;
  const qrTextWidth = leftSummaryWidth - (qrSize + 30);

  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.primary);
  doc.text("AUTHENTICATION & LIVE VERIFICATION", qrTextX, y + 12, { width: qrTextWidth });

  doc.fontSize(7.5).font("Helvetica").fillColor(C.slate600);
  doc.text(`Document Reference: ${invoice.orderNumber}`, qrTextX, doc.y + 3, { width: qrTextWidth });
  doc.text("Scan with any smartphone camera to open and authenticate live transaction terms, fulfillment milestones, and official receipts.", qrTextX, doc.y + 2, { width: qrTextWidth, height: 26 });
  
  doc.fontSize(7).font("Helvetica-Bold").fillColor(C.slate500);
  doc.text("Corporate Wire Settlement: Net 15 Days • corporate.billing@vanom-global.com", qrTextX, doc.y + 2, { width: qrTextWidth });

  // Right Side: Grand Totals Breakdown
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, bottomCardHeight, 5).fillAndStroke(C.slate50, C.slate200);

  let tY = y + 10;
  doc.fontSize(8).font("Helvetica").fillColor(C.slate600);
  doc.text("Subtotal:", summaryBoxX + 10, tY);
  doc.font("Helvetica-Bold").fillColor(C.navyDark).text(formatCurrency(invoice.subtotal, invoice.currencyCode), summaryBoxX + 10, tY, { width: summaryBoxWidth - 20, align: "right" });
  tY += 15;

  if (invoice.tax > 0) {
    doc.font("Helvetica").fillColor(C.slate600).text("Tax / VAT:", summaryBoxX + 10, tY);
    doc.font("Helvetica-Bold").fillColor(C.navyDark).text(formatCurrency(invoice.tax, invoice.currencyCode), summaryBoxX + 10, tY, { width: summaryBoxWidth - 20, align: "right" });
    tY += 15;
  }

  if (invoice.shippingCharges > 0) {
    doc.font("Helvetica").fillColor(C.slate600).text("Freight Logistics:", summaryBoxX + 10, tY);
    doc.font("Helvetica-Bold").fillColor(C.navyDark).text(formatCurrency(invoice.shippingCharges, invoice.currencyCode), summaryBoxX + 10, tY, { width: summaryBoxWidth - 20, align: "right" });
    tY += 15;
  }

  // Total Line Separator
  doc.moveTo(summaryBoxX + 10, tY + 2).lineTo(PAGE_WIDTH - MARGIN - 10, tY + 2).lineWidth(1).strokeColor(C.slate300).stroke();
  tY += 8;

  doc.fontSize(9.5).font("Helvetica-Bold").fillColor(C.navyDark).text("TOTAL AMOUNT:", summaryBoxX + 10, tY);
  doc.fontSize(13).font("Helvetica-Bold").fillColor(C.primary).text(formatCurrency(invoice.total, invoice.currencyCode), summaryBoxX + 10, tY - 2, { width: summaryBoxWidth - 20, align: "right" });

  // ── 6. Bottom Document Sign-off Footer ────────────────────────────────────
  const footerY = PAGE_HEIGHT - 28;
  doc.moveTo(MARGIN, footerY - 4).lineTo(PAGE_WIDTH - MARGIN, footerY - 4).lineWidth(0.5).strokeColor(C.slate200).stroke();
  doc.fontSize(7).font("Helvetica").fillColor(C.slate400);
  doc.text(
    `${COMPANY_INFO.legalName} • Document Hash: ${invoice.orderId || invoice.orderNumber} • Generated at ${new Date().toUTCString()}`,
    MARGIN,
    footerY,
    { width: CONTENT_WIDTH, align: "center" }
  );

  doc.end();
  return doc;
}

export async function generateInvoiceBuffer(order, options = {}) {
  const doc = await generateInvoicePdf(order, options);
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
  });
}
