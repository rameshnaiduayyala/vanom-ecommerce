import ExcelJS from "exceljs";

/**
 * Enterprise-Grade Reusable ExcelJS Utility for VANOM E-Commerce
 * Produces presentation-grade, publication-ready Excel workbooks (.xlsx).
 * Features:
 * - Executive KPI summary cards ribbon
 * - Frozen header panes for smooth multi-page scrolling
 * - Clean enterprise typography (Segoe UI / Calibri) and VANOM brand palette
 * - Color-coded status badges (soft tints with bold dark text)
 * - Accounting-standard number & currency formatting
 * - Dynamic column auto-fitting with safety padding
 * - Multi-sheet support (Orders Summary + Itemized Line Items Breakdown)
 * - Single-Order Executive Commercial Spec / Invoice layout
 * - Real Excel `=SUM(...)` formulas for dynamic financial totals
 */

// Enterprise Vanom Brand & UI Palettes (ARGB format for ExcelJS)
export const ENTERPRISE_THEME = {
  fontFamily: "Segoe UI",
  brandGreenDark: "FF0A4D2E",    // VANOM Signature Deep Emerald
  brandGreenMedium: "FF006B3C",  // VANOM Accent Green
  brandGreenLight: "FFE6F4EA",   // Soft Emerald Tint
  brandNavy: "FF0F172A",         // Slate-900 Executive Navy
  brandSlateDark: "FF1E293B",    // Slate-800
  brandSlateMuted: "FF64748B",   // Slate-500
  brandSlateBorder: "FFE2E8F0",  // Slate-200
  brandSlateZebra: "FFF8FAFC",   // Slate-50 alternating row
  white: "FFFFFFFF",

  // Status Badge Colors (Soft Fill + High-Contrast Text)
  statusColors: {
    COMPLETED: { fill: "FFDCFCE7", text: "FF166534" },
    DELIVERED: { fill: "FFDCFCE7", text: "FF166534" },
    PAID: { fill: "FFDCFCE7", text: "FF166534" },
    APPROVED: { fill: "FFDCFCE7", text: "FF166534" },

    PROCESSING: { fill: "FFDBEAFE", text: "FF1E40AF" },
    CONFIRMED: { fill: "FFDBEAFE", text: "FF1E40AF" },

    SHIPPED: { fill: "FFEDE9FE", text: "FF4338CA" },

    PENDING: { fill: "FFFEF3C7", text: "FF92400E" },
    DRAFT: { fill: "FFF1F5F9", text: "FF475569" },
    QUOTED: { fill: "FFFEF3C7", text: "FF92400E" },
    SUBMITTED: { fill: "FFFEF3C7", text: "FF92400E" },

    CANCELLED: { fill: "FFFEE2E2", text: "FF991B1B" },
    REJECTED: { fill: "FFFEE2E2", text: "FF991B1B" },
  },
};

/**
 * Triggers a native browser file download from an ExcelJS buffer
 * @param {ArrayBuffer} buffer - ExcelJS writeBuffer result
 * @param {string} filename - Target file name
 */
export function downloadExcelBuffer(buffer, filename = "export.xlsx") {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}

/**
 * Applies subtle borders to a cell
 */
function applyCellBorder(cell, { top = "thin", bottom = "thin", left = "thin", right = "thin", color = "FFE2E8F0" } = {}) {
  cell.border = {
    top: { style: top, color: { argb: color } },
    bottom: { style: bottom, color: { argb: color } },
    left: { style: left, color: { argb: color } },
    right: { style: right, color: { argb: color } },
  };
}

/**
 * Formats a status cell as an executive pill badge
 */
function formatStatusCell(cell, rawStatus) {
  const statusKey = String(rawStatus || "").trim().toUpperCase();
  const palette = ENTERPRISE_THEME.statusColors[statusKey] || { fill: "FFF1F5F9", text: "FF475569" };

  cell.value = `●  ${statusKey}`;
  cell.font = {
    name: ENTERPRISE_THEME.fontFamily,
    size: 9.5,
    bold: true,
    color: { argb: palette.text },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: palette.fill },
  };
  cell.alignment = { vertical: "middle", horizontal: "center" };
}

/**
 * Generic Reusable Enterprise Excel Exporter
 *
 * @param {Object} options
 * @param {string} [options.filename='export.xlsx']
 * @param {string} [options.sheetName='Summary']
 * @param {string} [options.title] - Executive Banner Title
 * @param {string} [options.subtitle] - Metadata or description
 * @param {Array<Object>} [options.kpiCards] - Array of KPI tiles: [{ label: 'TOTAL ORDERS', value: 128 }, ...]
 * @param {Array<Object>} options.columns - Column configuration
 * @param {Array<Object>} options.data - Data rows
 * @param {Object} [options.totals] - Configuration for bottom formulas
 * @param {string} [options.statusKey] - Key of the column containing status to apply badge styling
 * @param {boolean} [options.freezePanes=true] - Pinned header row on scroll
 */
export async function exportToExcel({
  filename = "export.xlsx",
  sheetName = "Summary",
  title = null,
  subtitle = null,
  kpiCards = null,
  columns = [],
  data = [],
  totals = null,
  statusKey = null,
  freezePanes = true,
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VANOM Enterprise Portal";
  workbook.lastModifiedBy = "VANOM Operations";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
  });

  let currentRowIdx = 1;
  const colCount = Math.max(columns.length, 1);

  // 1. Executive Top Brand Banner
  if (title) {
    const titleRow = worksheet.getRow(currentRowIdx);
    titleRow.height = 36;
    titleRow.getCell(1).value = `  ${title.toUpperCase()}`;
    titleRow.getCell(1).font = {
      name: ENTERPRISE_THEME.fontFamily,
      size: 14,
      bold: true,
      color: { argb: ENTERPRISE_THEME.white },
    };
    titleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: ENTERPRISE_THEME.brandGreenDark },
    };
    titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
    currentRowIdx++;

    // Subtitle / Scope Metadata Row
    if (subtitle) {
      const subRow = worksheet.getRow(currentRowIdx);
      subRow.height = 22;
      subRow.getCell(1).value = `  ${subtitle}`;
      subRow.getCell(1).font = {
        name: ENTERPRISE_THEME.fontFamily,
        size: 9.5,
        italic: true,
        color: { argb: ENTERPRISE_THEME.brandSlateMuted },
      };
      subRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" },
      };
      subRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
      worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
      currentRowIdx++;
    }

    // Spacer
    worksheet.getRow(currentRowIdx).height = 8;
    currentRowIdx++;
  }

  // 2. Executive KPI Summary Cards Ribbon (if provided)
  if (Array.isArray(kpiCards) && kpiCards.length > 0) {
    const labelRowIdx = currentRowIdx;
    const valueRowIdx = currentRowIdx + 1;
    const labelRow = worksheet.getRow(labelRowIdx);
    const valueRow = worksheet.getRow(valueRowIdx);

    labelRow.height = 18;
    valueRow.height = 26;

    // Distribute KPI cards evenly across columns
    const colsPerCard = Math.max(2, Math.floor(colCount / kpiCards.length));

    kpiCards.forEach((card, idx) => {
      const startCol = idx * colsPerCard + 1;
      const endCol = Math.min(startCol + colsPerCard - 1, colCount);

      if (startCol <= colCount) {
        // Label cell
        const labelCell = labelRow.getCell(startCol);
        labelCell.value = card.label?.toUpperCase();
        labelCell.font = {
          name: ENTERPRISE_THEME.fontFamily,
          size: 8.5,
          bold: true,
          color: { argb: ENTERPRISE_THEME.brandSlateMuted },
        };
        labelCell.alignment = { vertical: "middle", horizontal: "center" };
        labelCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };

        // Value cell
        const valueCell = valueRow.getCell(startCol);
        valueCell.value = card.value;
        valueCell.font = {
          name: ENTERPRISE_THEME.fontFamily,
          size: 13,
          bold: true,
          color: { argb: card.highlightColor || ENTERPRISE_THEME.brandGreenDark },
        };
        valueCell.alignment = { vertical: "middle", horizontal: "center" };
        valueCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        };

        if (endCol > startCol) {
          worksheet.mergeCells(labelRowIdx, startCol, labelRowIdx, endCol);
          worksheet.mergeCells(valueRowIdx, startCol, valueRowIdx, endCol);
        }

        // Apply borders across card boundary
        for (let c = startCol; c <= endCol; c++) {
          applyCellBorder(labelRow.getCell(c), { color: "FFE2E8F0" });
          applyCellBorder(valueRow.getCell(c), { color: "FFE2E8F0" });
        }
      }
    });

    currentRowIdx += 2;

    // Spacer
    worksheet.getRow(currentRowIdx).height = 10;
    currentRowIdx++;
  }

  // 3. Table Column Headers
  const headerRowIdx = currentRowIdx;
  const headerRow = worksheet.getRow(headerRowIdx);
  headerRow.height = 28;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = (col.header || col.key).toUpperCase();
    cell.font = {
      name: ENTERPRISE_THEME.fontFamily,
      size: 10,
      bold: true,
      color: { argb: ENTERPRISE_THEME.white },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: ENTERPRISE_THEME.brandNavy },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: col.align || (col.isNumber ? "right" : "left"),
      wrapText: false,
    };
    applyCellBorder(cell, {
      top: "thin",
      bottom: "medium",
      left: "thin",
      right: "thin",
      color: "FF334155",
    });
  });

  currentRowIdx++;
  const dataStartRowIdx = currentRowIdx;

  // 4. Data Rows
  data.forEach((rowObj, rowNum) => {
    const dataRow = worksheet.getRow(currentRowIdx);
    dataRow.height = 24;
    const isZebra = rowNum % 2 === 1;

    columns.forEach((col, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      let rawVal = rowObj[col.key];

      if (typeof col.format === "function") {
        rawVal = col.format(rawVal, rowObj);
      }

      // Check if this is the designated status column
      if (col.key === statusKey || col.isStatus) {
        formatStatusCell(cell, rawVal);
      } else {
        if (col.isNumber) {
          const numVal = Number(rawVal);
          cell.value = isNaN(numVal) ? 0 : numVal;
        } else {
          cell.value = rawVal ?? "";
        }

        if (col.numFmt) {
          cell.numFmt = col.numFmt;
        }

        cell.font = {
          name: ENTERPRISE_THEME.fontFamily,
          size: 10,
          color: { argb: ENTERPRISE_THEME.brandSlateDark },
        };

        cell.alignment = {
          vertical: "middle",
          horizontal: col.align || (col.isNumber ? "right" : "left"),
          wrapText: Boolean(col.wrapText),
        };

        if (isZebra) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: ENTERPRISE_THEME.brandSlateZebra },
          };
        }
      }

      applyCellBorder(cell, { color: ENTERPRISE_THEME.brandSlateBorder });
    });

    currentRowIdx++;
  });

  const dataEndRowIdx = currentRowIdx - 1;

  // 5. Executive Totals Row (Formulas with accounting double-underline)
  if (totals && data.length > 0) {
    const totalsRow = worksheet.getRow(currentRowIdx);
    totalsRow.height = 28;

    columns.forEach((col, colIdx) => {
      const cell = totalsRow.getCell(colIdx + 1);

      if (totals.labelColumnKey && col.key === totals.labelColumnKey) {
        cell.value = totals.labelText || "TOTAL";
        cell.alignment = { vertical: "middle", horizontal: "left" };
      } else if (Array.isArray(totals.columns) && totals.columns.includes(col.key)) {
        const colLetter = worksheet.getColumn(colIdx + 1).letter;
        cell.value = {
          formula: `SUM(${colLetter}${dataStartRowIdx}:${colLetter}${dataEndRowIdx})`,
        };
        if (col.numFmt) {
          cell.numFmt = col.numFmt;
        }
        cell.alignment = { vertical: "middle", horizontal: col.align || "right" };
      } else {
        cell.value = "";
      }

      cell.font = {
        name: ENTERPRISE_THEME.fontFamily,
        size: 10.5,
        bold: true,
        color: { argb: ENTERPRISE_THEME.brandSlateDark },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF1F5F9" },
      };

      cell.border = {
        top: { style: "thin", color: { argb: "FF94A3B8" } },
        bottom: { style: "double", color: { argb: "FF0F172A" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });

    currentRowIdx++;
  }

  // 6. Dynamic Column Widths with generous padding
  columns.forEach((col, colIdx) => {
    const worksheetCol = worksheet.getColumn(colIdx + 1);
    let maxLen = (col.header || col.key || "").toString().length + 4;

    data.forEach((rowObj) => {
      let val = rowObj[col.key];
      if (typeof col.format === "function") {
        val = col.format(val, rowObj);
      }
      if (val !== null && val !== undefined) {
        const strLen = String(val).length;
        if (strLen > maxLen) {
          maxLen = strLen;
        }
      }
    });

    const minWidth = col.minWidth || 13;
    const maxWidth = col.maxWidth || 50;
    worksheetCol.width = Math.max(minWidth, Math.min(maxLen + 3, maxWidth));
  });

  // 7. Auto-filter on column headers
  if (columns.length > 0 && data.length > 0) {
    const startCell = worksheet.getCell(headerRowIdx, 1).address;
    const endCell = worksheet.getCell(headerRowIdx, columns.length).address;
    worksheet.autoFilter = `${startCell}:${endCell}`;
  }

  // 8. Freeze Panes for fixed header scrolling
  if (freezePanes) {
    worksheet.views = [
      {
        state: "frozen",
        ySplit: headerRowIdx,
        activeCell: `A${headerRowIdx + 1}`,
        showGridLines: true,
      },
    ];
  }

  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelBuffer(buffer, filename);
}

/**
 * Specialized Single-Order Commercial Specification & Invoice Sheet
 * Generates an executive, formal commercial invoice / purchase order layout.
 */
async function exportSingleOrderCommercialSlip(order, options = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VANOM Enterprise Portal";
  workbook.lastModifiedBy = "VANOM Operations";
  workbook.created = new Date();

  const isB2B = Boolean(
    order.bulkProduct ||
    order.company ||
    order.orderNumber?.startsWith("BLK") ||
    order.orderNumber?.startsWith("BULK") ||
    order.type === "B2B"
  );

  const orderNumber =
    order.orderNumber ||
    (isB2B
      ? `BLK-${(order.id || "").slice(0, 8).toUpperCase()}`
      : `ORD-${(order.id || "").slice(0, 8).toUpperCase()}`);

  const currencyCode =
    order.currencyCode ||
    order.currency?.code ||
    (typeof order.currency === "string" ? order.currency : "USD");

  const currencySymbol = currencyCode === "INR" ? "₹" : "$";
  const numFmt = `"${currencySymbol}"#,##0.00;("${currencySymbol}"#,##0.00);"-"`;

  const sheet = workbook.addWorksheet("Order Slip", {
    views: [{ showGridLines: true }],
  });

  // Header Banner
  sheet.mergeCells("A1:G1");
  const bannerCell = sheet.getCell("A1");
  bannerCell.value = `  VANOM E-COMMERCE  |  ${isB2B ? "COMMERCIAL WHOLESALE PURCHASE ORDER" : "OFFICIAL ORDER INVOICE"}`;
  bannerCell.font = { name: ENTERPRISE_THEME.fontFamily, size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  bannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTERPRISE_THEME.brandGreenDark } };
  bannerCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 34;

  // Metadata Sub-banner
  sheet.mergeCells("A2:G2");
  const subCell = sheet.getCell("A2");
  subCell.value = `  ORDER REFERENCE: ${orderNumber}  |  STATUS: ${order.status || "PROCESSING"}  |  DATE: ${new Date(order.createdAt || Date.now()).toLocaleString()}`;
  subCell.font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, bold: true, color: { argb: "FF334155" } };
  subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  subCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(2).height = 22;

  sheet.getRow(3).height = 10; // spacer

  // Two-Column Section: Customer & Delivery Info
  sheet.mergeCells("A4:C4");
  sheet.getCell("A4").value = "  BILLING & CUSTOMER ACCOUNT";
  sheet.getCell("A4").font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, bold: true, color: { argb: ENTERPRISE_THEME.white } };
  sheet.getCell("A4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTERPRISE_THEME.brandNavy } };

  sheet.mergeCells("E4:G4");
  sheet.getCell("E4").value = "  FULFILLMENT & SHIPPING ADDRESS";
  sheet.getCell("E4").font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, bold: true, color: { argb: ENTERPRISE_THEME.white } };
  sheet.getCell("E4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTERPRISE_THEME.brandNavy } };
  sheet.getRow(4).height = 22;

  // Customer Name / Company
  const customerName =
    (isB2B && order.company?.legalName) ||
    `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
    order.requestedBy?.firstName ||
    order.shippingAddress?.name ||
    "Authorized Buyer";

  const customerEmail = order.user?.email || order.requestedBy?.email || order.company?.email || "N/A";
  const customerPhone = order.shippingAddress?.phone || order.user?.phone || order.requestedBy?.phone || "N/A";

  const shippingAddr =
    order.shippingAddress ||
    (Array.isArray(order.addresses) ? order.addresses.find((a) => a.type === "SHIPPING" || a.type === "DELIVERY") : null) ||
    (Array.isArray(order.addresses) ? order.addresses[0] : null);

  const addressLine = shippingAddr?.addressLine1 || shippingAddr?.address || "Standard Logistics Center";
  const cityStateZip = [shippingAddr?.city, shippingAddr?.state, shippingAddr?.postalCode || shippingAddr?.zipCode].filter(Boolean).join(", ") || "City, State, Zip";
  const country = shippingAddr?.country || shippingAddr?.countryCode || "Standard Territory";

  const details = [
    { leftLabel: "Account Name:", leftVal: customerName, rightLabel: "Recipient:", rightVal: shippingAddr?.fullName || customerName },
    { leftLabel: "Email:", leftVal: customerEmail, rightLabel: "Address:", rightVal: addressLine },
    { leftLabel: "Phone:", leftVal: customerPhone, rightLabel: "City/Zip:", rightVal: cityStateZip },
    { leftLabel: "Channel:", leftVal: isB2B ? "Enterprise Wholesale (B2B)" : "Consumer Retail (B2C)", rightLabel: "Country:", rightVal: country },
  ];

  details.forEach((item, idx) => {
    const rowNum = 5 + idx;
    sheet.getRow(rowNum).height = 20;

    sheet.getCell(`A${rowNum}`).value = item.leftLabel;
    sheet.getCell(`A${rowNum}`).font = { name: ENTERPRISE_THEME.fontFamily, size: 9, bold: true, color: { argb: "FF64748B" } };
    sheet.mergeCells(`B${rowNum}:C${rowNum}`);
    sheet.getCell(`B${rowNum}`).value = item.leftVal;
    sheet.getCell(`B${rowNum}`).font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, color: { argb: "FF0F172A" } };

    sheet.getCell(`E${rowNum}`).value = item.rightLabel;
    sheet.getCell(`E${rowNum}`).font = { name: ENTERPRISE_THEME.fontFamily, size: 9, bold: true, color: { argb: "FF64748B" } };
    sheet.mergeCells(`F${rowNum}:G${rowNum}`);
    sheet.getCell(`F${rowNum}`).value = item.rightVal;
    sheet.getCell(`F${rowNum}`).font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, color: { argb: "FF0F172A" } };

    ["A", "B", "C", "E", "F", "G"].forEach((col) => {
      applyCellBorder(sheet.getCell(`${col}${rowNum}`), { color: "FFE2E8F0" });
    });
  });

  sheet.getRow(9).height = 12; // spacer

  // Items Table Header
  const itemsHeaderRowIdx = 10;
  sheet.getRow(itemsHeaderRowIdx).height = 26;
  const tableHeaders = [
    { col: "A", title: "ITEM #", width: 8, align: "center" },
    { col: "B", title: "PRODUCT / COMMODITY DESCRIPTION", width: 34, align: "left" },
    { col: "C", title: "SKU / CODE", width: 16, align: "center" },
    { col: "D", title: "SPECIFICATION / VARIANT", width: 20, align: "left" },
    { col: "E", title: "UNIT PRICE", width: 14, align: "right" },
    { col: "F", title: "QTY", width: 10, align: "right" },
    { col: "G", title: "LINE TOTAL", width: 18, align: "right" },
  ];

  tableHeaders.forEach((th) => {
    const cell = sheet.getCell(`${th.col}${itemsHeaderRowIdx}`);
    cell.value = th.title;
    cell.font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTERPRISE_THEME.brandNavy } };
    cell.alignment = { vertical: "middle", horizontal: th.align };
    applyCellBorder(cell, { color: "FF334155" });
  });

  // Extract Items
  const rawItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : Array.isArray(order.commodityLines) && order.commodityLines.length > 0
      ? order.commodityLines
      : [];

  let lineRowIdx = 11;
  const itemsStartRow = lineRowIdx;

  if (rawItems.length === 0) {
    sheet.getRow(lineRowIdx).height = 24;
    sheet.mergeCells(`A${lineRowIdx}:G${lineRowIdx}`);
    const emptyCell = sheet.getCell(`A${lineRowIdx}`);
    emptyCell.value = "Standard Order Batch (Detailed commodity line specifications recorded in system)";
    emptyCell.font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, italic: true, color: { argb: "FF64748B" } };
    emptyCell.alignment = { vertical: "middle", horizontal: "center" };
    lineRowIdx++;
  } else {
    rawItems.forEach((itm, itmIdx) => {
      sheet.getRow(lineRowIdx).height = 24;
      const isZebra = itmIdx % 2 === 1;

      const name = itm.product?.name || itm.bulkProduct?.name || itm.name || itm.commodityName || "Item";
      const sku = itm.product?.sku || itm.bulkProduct?.sku || itm.sku || itm.id?.slice(0, 8).toUpperCase() || "SKU-PROD";
      const variant = itm.variant?.title || itm.packagingType || itm.grade || "Standard";
      const unitPrice = Number(itm.price || itm.unitPrice || (order.totalAmount ? order.totalAmount / (rawItems.length || 1) : 0));
      const qty = Number(itm.quantity || 1);
      const lineTotal = Number(itm.total || (unitPrice * qty));

      sheet.getCell(`A${lineRowIdx}`).value = itmIdx + 1;
      sheet.getCell(`A${lineRowIdx}`).alignment = { vertical: "middle", horizontal: "center" };

      sheet.getCell(`B${lineRowIdx}`).value = name;
      sheet.getCell(`B${lineRowIdx}`).alignment = { vertical: "middle", horizontal: "left" };

      sheet.getCell(`C${lineRowIdx}`).value = sku;
      sheet.getCell(`C${lineRowIdx}`).alignment = { vertical: "middle", horizontal: "center" };

      sheet.getCell(`D${lineRowIdx}`).value = variant;
      sheet.getCell(`D${lineRowIdx}`).alignment = { vertical: "middle", horizontal: "left" };

      sheet.getCell(`E${lineRowIdx}`).value = unitPrice;
      sheet.getCell(`E${lineRowIdx}`).numFmt = numFmt;
      sheet.getCell(`E${lineRowIdx}`).alignment = { vertical: "middle", horizontal: "right" };

      sheet.getCell(`F${lineRowIdx}`).value = qty;
      sheet.getCell(`F${lineRowIdx}`).numFmt = "#,##0";
      sheet.getCell(`F${lineRowIdx}`).alignment = { vertical: "middle", horizontal: "right" };

      sheet.getCell(`G${lineRowIdx}`).value = lineTotal;
      sheet.getCell(`G${lineRowIdx}`).numFmt = numFmt;
      sheet.getCell(`G${lineRowIdx}`).alignment = { vertical: "middle", horizontal: "right" };

      ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
        const c = sheet.getCell(`${col}${lineRowIdx}`);
        c.font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, color: { argb: "FF0F172A" } };
        if (isZebra) {
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        }
        applyCellBorder(c, { color: "FFE2E8F0" });
      });

      lineRowIdx++;
    });
  }

  const itemsEndRow = lineRowIdx - 1;

  // Financial Summary Breakdown Box
  const subtotal = Number(order.subtotal ?? (rawItems.length > 0 ? 0 : order.totalAmount ?? order.total ?? 0));
  const tax = Number(order.tax ?? 0);
  const shipping = Number(order.shippingCharges ?? 0);
  const discount = Number(order.discount ?? 0);
  const grandTotal = Number(order.totalAmount ?? order.total ?? (subtotal + tax + shipping - discount));

  const financeRows = [
    { label: "Items Subtotal", value: subtotal, isFormula: rawItems.length > 0, formula: `SUM(G${itemsStartRow}:G${itemsEndRow})` },
    { label: "Estimated Tax", value: tax },
    { label: "Shipping & Logistics", value: shipping },
    { label: "Discount / Rebate", value: discount > 0 ? -discount : 0 },
    { label: "GRAND TOTAL", value: grandTotal, isGrandTotal: true },
  ];

  financeRows.forEach((f) => {
    sheet.getRow(lineRowIdx).height = f.isGrandTotal ? 28 : 22;
    sheet.mergeCells(`E${lineRowIdx}:F${lineRowIdx}`);

    const labelCell = sheet.getCell(`E${lineRowIdx}`);
    labelCell.value = f.label;
    labelCell.font = {
      name: ENTERPRISE_THEME.fontFamily,
      size: f.isGrandTotal ? 11 : 9.5,
      bold: true,
      color: { argb: f.isGrandTotal ? "FF0A4D2E" : "FF475569" },
    };
    labelCell.alignment = { vertical: "middle", horizontal: "right" };

    const valCell = sheet.getCell(`G${lineRowIdx}`);
    if (f.isFormula) {
      valCell.value = { formula: f.formula };
    } else {
      valCell.value = f.value;
    }
    valCell.numFmt = numFmt;
    valCell.font = {
      name: ENTERPRISE_THEME.fontFamily,
      size: f.isGrandTotal ? 12 : 9.5,
      bold: true,
      color: { argb: f.isGrandTotal ? "FF0A4D2E" : "FF0F172A" },
    };
    valCell.alignment = { vertical: "middle", horizontal: "right" };

    if (f.isGrandTotal) {
      labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F4EA" } };
      valCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F4EA" } };
      valCell.border = {
        top: { style: "thin", color: { argb: "FF0A4D2E" } },
        bottom: { style: "double", color: { argb: "FF0A4D2E" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      labelCell.border = valCell.border;
    } else {
      applyCellBorder(labelCell, { color: "FFE2E8F0" });
      applyCellBorder(valCell, { color: "FFE2E8F0" });
    }

    lineRowIdx++;
  });

  // Footer Note
  sheet.getRow(lineRowIdx).height = 12; // spacer
  lineRowIdx++;
  sheet.mergeCells(`A${lineRowIdx}:G${lineRowIdx}`);
  const footerCell = sheet.getCell(`A${lineRowIdx}`);
  footerCell.value = "Official Document generated by VANOM Global E-Commerce & Wholesale Trading System.";
  footerCell.font = { name: ENTERPRISE_THEME.fontFamily, size: 8.5, italic: true, color: { argb: "FF94A3B8" } };
  footerCell.alignment = { vertical: "middle", horizontal: "center" };

  // Set explicit clean column widths
  tableHeaders.forEach((th) => {
    sheet.getColumn(th.col).width = th.width;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelBuffer(buffer, options.filename || `vanom-order-${orderNumber}.xlsx`);
}

/**
 * Specialized Enterprise Master Orders Exporter
 * Generates a full multi-tab workbook:
 * - Sheet 1: Orders Summary (with Executive KPI Ribbon, Freeze Panes, Auto-Filter, Status Pills, Totals)
 * - Sheet 2: Itemized Line Items Breakdown (Pivot-ready line-by-line product breakdown)
 * If only a single order is passed, generates an Executive Commercial Order Slip!
 *
 * @param {Array<Object>} orders - List of orders
 * @param {Object} [options]
 * @param {string} [options.filename]
 * @param {string} [options.title]
 * @param {string} [options.filterContext]
 */
export async function exportOrdersToExcel(orders = [], options = {}) {
  // If exactly 1 order is provided, use the specialized Commercial Slip layout!
  if (Array.isArray(orders) && orders.length === 1) {
    return exportSingleOrderCommercialSlip(orders[0], options);
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = options.filename || `vanom-enterprise-orders-${timestamp}.xlsx`;
  const filterContext = options.filterContext ? `Scope: ${options.filterContext}` : "Scope: All Master Records";

  // 1. Calculate Executive KPI Metrics
  const totalOrdersCount = orders.length;
  let totalRevenue = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let totalUnits = 0;

  const normalizedOrders = orders.map((order) => {
    const isB2B = Boolean(
      order.bulkProduct ||
      order.company ||
      order.orderNumber?.startsWith("BLK") ||
      order.orderNumber?.startsWith("BULK") ||
      order.type === "B2B"
    );

    const orderNumber =
      order.orderNumber ||
      (isB2B
        ? `BLK-${(order.id || "").slice(0, 8).toUpperCase()}`
        : `ORD-${(order.id || "").slice(0, 8).toUpperCase()}`);

    const customerName =
      (isB2B && order.company?.legalName) ||
      `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
      order.requestedBy?.firstName ||
      order.shippingAddress?.name ||
      order.shippingAddress?.fullName ||
      order.user?.email ||
      "N/A";

    const customerEmail =
      order.user?.email ||
      order.requestedBy?.email ||
      order.company?.email ||
      order.shippingAddress?.email ||
      "";

    const customerPhone =
      order.shippingAddress?.phone ||
      order.user?.phone ||
      order.requestedBy?.phone ||
      order.company?.phone ||
      "";

    const shippingAddr =
      order.shippingAddress ||
      (Array.isArray(order.addresses)
        ? order.addresses.find((a) => a.type === "SHIPPING" || a.type === "DELIVERY")
        : null) ||
      (Array.isArray(order.addresses) ? order.addresses[0] : null);

    const destination = shippingAddr?.city
      ? `${shippingAddr.city}${shippingAddr.country ? `, ${shippingAddr.country}` : ""}`
      : "Standard Logistics";

    const fullAddress = [
      shippingAddr?.addressLine1,
      shippingAddr?.city,
      shippingAddr?.state,
      shippingAddr?.postalCode,
      shippingAddr?.country || shippingAddr?.countryCode,
    ].filter(Boolean).join(", ") || "N/A";

    const rawItems = Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : Array.isArray(order.commodityLines) && order.commodityLines.length > 0
        ? order.commodityLines
        : [];

    const itemsCount = rawItems.reduce((acc, itm) => acc + Number(itm.quantity || 1), 0);
    totalUnits += itemsCount || 1;

    const itemsSummary = rawItems
      .map((itm) => {
        const name = itm.product?.name || itm.bulkProduct?.name || itm.name || itm.commodityName || "Item";
        const qty = itm.quantity ? `(x${itm.quantity})` : "";
        return `${name} ${qty}`.trim();
      })
      .join("; ") || "Enterprise Wholesale Batch";

    const subtotal = Number(order.subtotal ?? 0);
    const tax = Number(order.tax ?? 0);
    const shippingCharges = Number(order.shippingCharges ?? 0);
    const discount = Number(order.discount ?? 0);
    const totalAmount = Number(
      order.totalAmount ?? order.total ?? (subtotal + tax + shippingCharges - discount)
    );

    totalRevenue += totalAmount;

    const statusUpper = (order.status || "PROCESSING").toUpperCase();
    if (statusUpper === "DELIVERED" || statusUpper === "COMPLETED" || statusUpper === "APPROVED") {
      completedCount++;
    } else if (statusUpper !== "CANCELLED" && statusUpper !== "REJECTED") {
      pendingCount++;
    }

    const currency =
      order.currencyCode ||
      order.currency?.code ||
      (typeof order.currency === "string" ? order.currency : "USD");

    let dateStr = "";
    if (order.createdAt) {
      try {
        dateStr = new Date(order.createdAt).toISOString().replace("T", " ").slice(0, 16);
      } catch {
        dateStr = String(order.createdAt);
      }
    }

    return {
      rawOrder: order,
      rawItems,
      orderNumber,
      orderType: isB2B ? "Wholesale (B2B)" : "Retail (B2C)",
      date: dateStr,
      customerName,
      customerEmail,
      customerPhone,
      destination,
      fullAddress,
      itemsCount: itemsCount || 1,
      itemsSummary,
      paymentStatus: order.paymentStatus || (statusUpper === "DELIVERED" || statusUpper === "COMPLETED" ? "PAID" : "PENDING"),
      orderStatus: statusUpper,
      currency,
      subtotal,
      tax,
      shippingCharges,
      discount,
      totalAmount,
    };
  });

  const currencySymbol = orders[0]?.currencyCode === "INR" ? "₹" : "$";
  const numFmt = `"${currencySymbol}"#,##0.00;("${currencySymbol}"#,##0.00);"-"`;

  // Executive KPI ribbon cards
  const kpiCards = [
    { label: "Total Orders", value: totalOrdersCount, highlightColor: ENTERPRISE_THEME.brandNavy },
    { label: "Total Revenue", value: `${currencySymbol}${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlightColor: ENTERPRISE_THEME.brandGreenDark },
    { label: "Completed / Delivered", value: `${completedCount} Orders`, highlightColor: "FF166534" },
    { label: "In-Flight / Pending", value: `${pendingCount} Orders`, highlightColor: "FF92400E" },
    { label: "Total Units Packed", value: `${totalUnits.toLocaleString()} Units`, highlightColor: ENTERPRISE_THEME.brandSlateDark },
  ];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VANOM Enterprise Portal";
  workbook.lastModifiedBy = "VANOM Operations";
  workbook.created = new Date();

  // ── SHEET 1: ORDERS OVERVIEW ──
  const summarySheet = workbook.addWorksheet("Orders Overview", {
    views: [{ showGridLines: true }],
  });

  const columns = [
    { header: "Order #", key: "orderNumber", width: 17, align: "center" },
    { header: "Type", key: "orderType", width: 15, align: "center" },
    { header: "Date (UTC)", key: "date", width: 18, align: "center" },
    { header: "Customer / Enterprise", key: "customerName", width: 25, align: "left" },
    { header: "Contact Email", key: "customerEmail", width: 26, align: "left" },
    { header: "Phone", key: "customerPhone", width: 16, align: "left" },
    { header: "Destination", key: "destination", width: 20, align: "left" },
    { header: "Full Address", key: "fullAddress", width: 36, align: "left", wrapText: true },
    { header: "Items Qty", key: "itemsCount", width: 12, align: "right", isNumber: true, numFmt: "#,##0" },
    { header: "Items Summary", key: "itemsSummary", width: 42, align: "left", wrapText: true },
    { header: "Payment", key: "paymentStatus", width: 14, align: "center", isStatus: true },
    { header: "Order Status", key: "orderStatus", width: 16, align: "center", isStatus: true },
    { header: "Currency", key: "currency", width: 10, align: "center" },
    { header: "Subtotal", key: "subtotal", width: 15, align: "right", isNumber: true, numFmt },
    { header: "Tax", key: "tax", width: 13, align: "right", isNumber: true, numFmt },
    { header: "Shipping", key: "shippingCharges", width: 13, align: "right", isNumber: true, numFmt },
    { header: "Discount", key: "discount", width: 13, align: "right", isNumber: true, numFmt },
    { header: "Total Amount", key: "totalAmount", width: 18, align: "right", isNumber: true, numFmt },
  ];

  let curRow = 1;
  const colCount = columns.length;

  // Title Banner
  summarySheet.getRow(curRow).height = 36;
  summarySheet.getCell("A1").value = `  ${(options.title || "VANOM E-COMMERCE  |  EXECUTIVE MASTER ORDERS REPORT").toUpperCase()}`;
  summarySheet.getCell("A1").font = { name: ENTERPRISE_THEME.fontFamily, size: 13.5, bold: true, color: { argb: "FFFFFFFF" } };
  summarySheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTERPRISE_THEME.brandGreenDark } };
  summarySheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
  summarySheet.mergeCells(curRow, 1, curRow, colCount);
  curRow++;

  // Metadata Sub-banner
  summarySheet.getRow(curRow).height = 22;
  summarySheet.getCell(`A${curRow}`).value = `  Exported: ${new Date().toLocaleString()}  |  ${filterContext}  |  Total Records: ${totalOrdersCount}`;
  summarySheet.getCell(`A${curRow}`).font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, italic: true, color: { argb: "FF64748B" } };
  summarySheet.getCell(`A${curRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
  summarySheet.getCell(`A${curRow}`).alignment = { vertical: "middle", horizontal: "left" };
  summarySheet.mergeCells(curRow, 1, curRow, colCount);
  curRow++;

  summarySheet.getRow(curRow).height = 8; // spacer
  curRow++;

  // KPI Ribbon
  const kpiLabelRow = curRow;
  const kpiValRow = curRow + 1;
  summarySheet.getRow(kpiLabelRow).height = 18;
  summarySheet.getRow(kpiValRow).height = 26;

  const colsPerCard = Math.max(3, Math.floor(colCount / kpiCards.length));
  kpiCards.forEach((card, idx) => {
    const sCol = idx * colsPerCard + 1;
    const eCol = Math.min(sCol + colsPerCard - 1, colCount);

    if (sCol <= colCount) {
      const lCell = summarySheet.getCell(kpiLabelRow, sCol);
      lCell.value = card.label.toUpperCase();
      lCell.font = { name: ENTERPRISE_THEME.fontFamily, size: 8.5, bold: true, color: { argb: "FF64748B" } };
      lCell.alignment = { vertical: "middle", horizontal: "center" };
      lCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

      const vCell = summarySheet.getCell(kpiValRow, sCol);
      vCell.value = card.value;
      vCell.font = { name: ENTERPRISE_THEME.fontFamily, size: 12, bold: true, color: { argb: card.highlightColor } };
      vCell.alignment = { vertical: "middle", horizontal: "center" };
      vCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };

      if (eCol > sCol) {
        summarySheet.mergeCells(kpiLabelRow, sCol, kpiLabelRow, eCol);
        summarySheet.mergeCells(kpiValRow, sCol, kpiValRow, eCol);
      }

      for (let c = sCol; c <= eCol; c++) {
        applyCellBorder(summarySheet.getCell(kpiLabelRow, c), { color: "FFE2E8F0" });
        applyCellBorder(summarySheet.getCell(kpiValRow, c), { color: "FFE2E8F0" });
      }
    }
  });

  curRow += 2;
  summarySheet.getRow(curRow).height = 10; // spacer
  curRow++;

  // Headers
  const headerRowIdx = curRow;
  summarySheet.getRow(headerRowIdx).height = 28;
  columns.forEach((col, idx) => {
    const cell = summarySheet.getCell(headerRowIdx, idx + 1);
    cell.value = col.header.toUpperCase();
    cell.font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTERPRISE_THEME.brandNavy } };
    cell.alignment = { vertical: "middle", horizontal: col.align || (col.isNumber ? "right" : "left") };
    applyCellBorder(cell, { color: "FF334155" });
  });

  curRow++;
  const dataStartRow = curRow;

  // Data rows
  normalizedOrders.forEach((o, rIdx) => {
    const r = summarySheet.getRow(curRow);
    r.height = 24;
    const isZebra = rIdx % 2 === 1;

    columns.forEach((col, cIdx) => {
      const cell = r.getCell(cIdx + 1);
      const val = o[col.key];

      if (col.isStatus) {
        formatStatusCell(cell, val);
      } else {
        if (col.isNumber) {
          const num = Number(val);
          cell.value = isNaN(num) ? 0 : num;
        } else {
          cell.value = val ?? "";
        }

        if (col.numFmt) {
          cell.numFmt = col.numFmt;
        }

        cell.font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, color: { argb: "FF0F172A" } };
        cell.alignment = {
          vertical: "middle",
          horizontal: col.align || (col.isNumber ? "right" : "left"),
          wrapText: Boolean(col.wrapText),
        };

        if (isZebra) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        }
      }

      applyCellBorder(cell, { color: "FFE2E8F0" });
    });

    curRow++;
  });

  const dataEndRow = curRow - 1;

  // Totals Row
  const totalRow = summarySheet.getRow(curRow);
  totalRow.height = 28;
  const numSumCols = ["itemsCount", "subtotal", "tax", "shippingCharges", "discount", "totalAmount"];

  columns.forEach((col, cIdx) => {
    const cell = totalRow.getCell(cIdx + 1);
    if (col.key === "orderNumber") {
      cell.value = `TOTAL (${totalOrdersCount} orders)`;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    } else if (numSumCols.includes(col.key)) {
      const colLetter = summarySheet.getColumn(cIdx + 1).letter;
      cell.value = { formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})` };
      if (col.numFmt) cell.numFmt = col.numFmt;
      cell.alignment = { vertical: "middle", horizontal: "right" };
    } else {
      cell.value = "";
    }

    cell.font = { name: ENTERPRISE_THEME.fontFamily, size: 10, bold: true, color: { argb: "FF0F172A" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    cell.border = {
      top: { style: "thin", color: { argb: "FF94A3B8" } },
      bottom: { style: "double", color: { argb: "FF0F172A" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
  });

  // Dynamic Column Widths for Sheet 1
  columns.forEach((col, cIdx) => {
    const sheetCol = summarySheet.getColumn(cIdx + 1);
    let maxLen = col.header.length + 4;
    normalizedOrders.forEach((o) => {
      const val = o[col.key];
      if (val) {
        const len = String(val).length;
        if (len > maxLen) maxLen = len;
      }
    });
    sheetCol.width = Math.max(col.width || 12, Math.min(maxLen + 3, 48));
  });

  // Auto-filter & Frozen Panes for Sheet 1
  summarySheet.autoFilter = `A${headerRowIdx}:${summarySheet.getColumn(colCount).letter}${headerRowIdx}`;
  summarySheet.views = [
    {
      state: "frozen",
      ySplit: headerRowIdx,
      activeCell: `A${headerRowIdx + 1}`,
      showGridLines: true,
    },
  ];

  // ── SHEET 2: ITEMIZED LINE ITEMS DETAIL (Enterprise standard pivot/audit sheet) ──
  const itemsSheet = workbook.addWorksheet("Line Items Detail", {
    views: [{ showGridLines: true }],
  });

  const itemCols = [
    { header: "Order #", key: "orderNumber", width: 17, align: "center" },
    { header: "Date", key: "date", width: 18, align: "center" },
    { header: "Channel", key: "orderType", width: 15, align: "center" },
    { header: "Customer / Enterprise", key: "customerName", width: 25, align: "left" },
    { header: "Product / Item Name", key: "name", width: 34, align: "left" },
    { header: "SKU / Code", key: "sku", width: 16, align: "center" },
    { header: "Variant / Spec", key: "variant", width: 18, align: "left" },
    { header: "Unit Price", key: "unitPrice", width: 14, align: "right", numFmt },
    { header: "Quantity", key: "quantity", width: 11, align: "right", numFmt: "#,##0" },
    { header: "Line Total", key: "lineTotal", width: 16, align: "right", numFmt },
    { header: "Order Status", key: "status", width: 15, align: "center", isStatus: true },
  ];

  let itemRowIdx = 1;

  // Title for Sheet 2
  itemsSheet.getRow(itemRowIdx).height = 32;
  itemsSheet.getCell("A1").value = "  VANOM E-COMMERCE  |  ITEMIZED ORDER FULFILLMENT BREAKDOWN";
  itemsSheet.getCell("A1").font = { name: ENTERPRISE_THEME.fontFamily, size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  itemsSheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTERPRISE_THEME.brandGreenDark } };
  itemsSheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
  itemsSheet.mergeCells(1, 1, 1, itemCols.length);
  itemRowIdx++;

  // Subtitle
  itemsSheet.getRow(itemRowIdx).height = 20;
  itemsSheet.getCell("A2").value = `  Granular item-by-item breakdown for accounting reconciliations, auditing, and warehouse packing.`;
  itemsSheet.getCell("A2").font = { name: ENTERPRISE_THEME.fontFamily, size: 9, italic: true, color: { argb: "FF64748B" } };
  itemsSheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
  itemsSheet.getCell("A2").alignment = { vertical: "middle", horizontal: "left" };
  itemsSheet.mergeCells(2, 1, 2, itemCols.length);
  itemRowIdx++;

  itemsSheet.getRow(itemRowIdx).height = 8; // spacer
  itemRowIdx++;

  // Sheet 2 Headers
  const itemHeaderRow = itemRowIdx;
  itemsSheet.getRow(itemHeaderRow).height = 26;
  itemCols.forEach((col, idx) => {
    const c = itemsSheet.getCell(itemHeaderRow, idx + 1);
    c.value = col.header.toUpperCase();
    c.font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTERPRISE_THEME.brandNavy } };
    c.alignment = { vertical: "middle", horizontal: col.align };
    applyCellBorder(c, { color: "FF334155" });
  });

  itemRowIdx++;
  const itemDataStart = itemRowIdx;
  let lineCount = 0;

  normalizedOrders.forEach((o) => {
    const items = o.rawItems.length > 0 ? o.rawItems : [{ name: "Standard Fulfillment Batch", quantity: o.itemsCount, price: o.totalAmount }];

    items.forEach((itm) => {
      const r = itemsSheet.getRow(itemRowIdx);
      r.height = 22;
      const isZebra = lineCount % 2 === 1;

      const name = itm.product?.name || itm.bulkProduct?.name || itm.name || itm.commodityName || "Item";
      const sku = itm.product?.sku || itm.bulkProduct?.sku || itm.sku || itm.id?.slice(0, 8).toUpperCase() || "SKU-PROD";
      const variant = itm.variant?.title || itm.packagingType || itm.grade || "Standard";
      const uPrice = Number(itm.price || itm.unitPrice || 0);
      const qty = Number(itm.quantity || 1);
      const lTotal = Number(itm.total || (uPrice * qty));

      r.getCell(1).value = o.orderNumber;
      r.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

      r.getCell(2).value = o.date;
      r.getCell(2).alignment = { vertical: "middle", horizontal: "center" };

      r.getCell(3).value = o.orderType;
      r.getCell(3).alignment = { vertical: "middle", horizontal: "center" };

      r.getCell(4).value = o.customerName;
      r.getCell(4).alignment = { vertical: "middle", horizontal: "left" };

      r.getCell(5).value = name;
      r.getCell(5).alignment = { vertical: "middle", horizontal: "left" };

      r.getCell(6).value = sku;
      r.getCell(6).alignment = { vertical: "middle", horizontal: "center" };

      r.getCell(7).value = variant;
      r.getCell(7).alignment = { vertical: "middle", horizontal: "left" };

      r.getCell(8).value = uPrice;
      r.getCell(8).numFmt = numFmt;
      r.getCell(8).alignment = { vertical: "middle", horizontal: "right" };

      r.getCell(9).value = qty;
      r.getCell(9).numFmt = "#,##0";
      r.getCell(9).alignment = { vertical: "middle", horizontal: "right" };

      r.getCell(10).value = lTotal;
      r.getCell(10).numFmt = numFmt;
      r.getCell(10).alignment = { vertical: "middle", horizontal: "right" };

      formatStatusCell(r.getCell(11), o.orderStatus);

      for (let c = 1; c <= 11; c++) {
        const cell = r.getCell(c);
        if (c !== 11) {
          cell.font = { name: ENTERPRISE_THEME.fontFamily, size: 9.5, color: { argb: "FF0F172A" } };
          if (isZebra) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
          }
        }
        applyCellBorder(cell, { color: "FFE2E8F0" });
      }

      itemRowIdx++;
      lineCount++;
    });
  });

  const itemDataEnd = itemRowIdx - 1;

  // Totals for Sheet 2
  if (lineCount > 0) {
    const itmTotalRow = itemsSheet.getRow(itemRowIdx);
    itmTotalRow.height = 28;
    itmTotalRow.getCell(1).value = `TOTAL (${lineCount} line items)`;
    itemsSheet.mergeCells(itemRowIdx, 1, itemRowIdx, 7);

    itmTotalRow.getCell(1).font = { name: ENTERPRISE_THEME.fontFamily, size: 10, bold: true, color: { argb: "FF0F172A" } };
    itmTotalRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
    itmTotalRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

    // Qty Sum
    const qtyColLetter = itemsSheet.getColumn(9).letter;
    itmTotalRow.getCell(9).value = { formula: `SUM(${qtyColLetter}${itemDataStart}:${qtyColLetter}${itemDataEnd})` };
    itmTotalRow.getCell(9).numFmt = "#,##0";
    itmTotalRow.getCell(9).font = { name: ENTERPRISE_THEME.fontFamily, size: 10, bold: true, color: { argb: "FF0F172A" } };
    itmTotalRow.getCell(9).alignment = { vertical: "middle", horizontal: "right" };
    itmTotalRow.getCell(9).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

    // Line Total Sum
    const totalColLetter = itemsSheet.getColumn(10).letter;
    itmTotalRow.getCell(10).value = { formula: `SUM(${totalColLetter}${itemDataStart}:${totalColLetter}${itemDataEnd})` };
    itmTotalRow.getCell(10).numFmt = numFmt;
    itmTotalRow.getCell(10).font = { name: ENTERPRISE_THEME.fontFamily, size: 10.5, bold: true, color: { argb: "FF0A4D2E" } };
    itmTotalRow.getCell(10).alignment = { vertical: "middle", horizontal: "right" };
    itmTotalRow.getCell(10).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

    itmTotalRow.getCell(11).value = "";
    itmTotalRow.getCell(11).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

    for (let c = 1; c <= 11; c++) {
      itemsSheet.getCell(itemRowIdx, c).border = {
        top: { style: "thin", color: { argb: "FF94A3B8" } },
        bottom: { style: "double", color: { argb: "FF0F172A" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    }
  }

  // Widths & Frozen Panes for Sheet 2
  itemCols.forEach((col, idx) => {
    itemsSheet.getColumn(idx + 1).width = col.width;
  });

  itemsSheet.autoFilter = `A${itemHeaderRow}:${itemsSheet.getColumn(itemCols.length).letter}${itemHeaderRow}`;
  itemsSheet.views = [
    {
      state: "frozen",
      ySplit: itemHeaderRow,
      activeCell: `A${itemHeaderRow + 1}`,
      showGridLines: true,
    },
  ];

  // 4. Download file
  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelBuffer(buffer, filename);
}
