import ExcelJS from "exceljs";

/**
 * Enterprise ExcelJS export utilities for VANOM E-Commerce.
 *
 * Public API:
 *   - ENTERPRISE_THEME
 *   - downloadExcelBuffer
 *   - exportToExcel
 *   - exportOrdersToExcel
 *
 * Design goals:
 *   - One source of truth for Excel styling
 *   - Reusable sheet/table builders
 *   - Orders Overview + Line Items Detail
 *   - Single-order commercial invoice layout
 *   - Real Excel formulas for totals
 */

export const ENTERPRISE_THEME = {
  fontFamily: "Segoe UI",
  brandGreenDark: "FF0A4D2E",
  brandGreenMedium: "FF006B3C",
  brandGreenLight: "FFE6F4EA",
  brandNavy: "FF0F172A",
  brandSlateDark: "FF1E293B",
  brandSlateMuted: "FF64748B",
  brandSlateBorder: "FFE2E8F0",
  brandSlateZebra: "FFF8FAFC",
  white: "FFFFFFFF",
  slateSoft: "FFF1F5F9",
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

const EXCEL_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const DEFAULT_BORDER = ENTERPRISE_THEME.brandSlateBorder;

const font = (size = 10, options = {}) => ({
  name: ENTERPRISE_THEME.fontFamily,
  size,
  ...options,
});

const solidFill = (argb) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb },
});

const currencyFormat = (symbol) =>
  `"${symbol}"#,##0.00;("${symbol}"#,##0.00);"-"`;

function currencySymbol(code = "USD") {
  const symbols = {
    INR: "₹",
    USD: "$",
    CAD: "C$",
    AUD: "A$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[String(code).toUpperCase()] || String(code).toUpperCase() || "$";
}

function resolveCurrency(orderOrCode) {
  if (!orderOrCode) return "USD";
  if (typeof orderOrCode === "string") return orderOrCode;
  return (
    orderOrCode.currencyCode ||
    orderOrCode.currency?.code ||
    (typeof orderOrCode.currency === "string" ? orderOrCode.currency : null) ||
    "USD"
  );
}

function normalizeStatus(value, fallback = "PROCESSING") {
  return String(value || fallback).trim().toUpperCase();
}

function isB2BOrder(order = {}) {
  return Boolean(
    order.bulkProduct ||
    order.company ||
    order.orderNumber?.startsWith("BLK") ||
    order.orderNumber?.startsWith("BULK") ||
    order.type === "B2B",
  );
}

function getOrderNumber(order = {}) {
  const b2b = isB2BOrder(order);
  return (
    order.orderNumber ||
    `${b2b ? "BLK" : "ORD"}-${String(order.id || "")
      .slice(0, 8)
      .toUpperCase()}`
  );
}

function getOrderItems(order = {}) {
  if (Array.isArray(order.items) && order.items.length) return order.items;
  if (Array.isArray(order.commodityLines) && order.commodityLines.length) {
    return order.commodityLines;
  }
  return [];
}

function getShippingAddress(order = {}) {
  return (
    order.shippingAddress ||
    (Array.isArray(order.addresses)
      ? order.addresses.find(
        (a) => a.type === "SHIPPING" || a.type === "DELIVERY",
      )
      : null) ||
    (Array.isArray(order.addresses) ? order.addresses[0] : null)
  );
}

function getCustomerName(order = {}) {
  const b2b = isB2BOrder(order);

  return (
    (b2b && order.company?.legalName) ||
    `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
    order.requestedBy?.firstName ||
    order.shippingAddress?.name ||
    order.shippingAddress?.fullName ||
    order.user?.email ||
    "N/A"
  );
}

function getProductName(item = {}) {
  return (
    item.product?.name ||
    item.bulkProduct?.name ||
    item.name ||
    item.commodityName ||
    "Item"
  );
}

function getProductSku(item = {}) {
  return (
    item.product?.sku ||
    item.bulkProduct?.sku ||
    item.sku ||
    item.id?.slice(0, 8).toUpperCase() ||
    "SKU-PROD"
  );
}

function getProductDescription(item = {}) {
  return (
    item.description ||
    item.product?.description ||
    item.bulkProduct?.description ||
    ""
  );
}

function getItemVariant(item = {}) {
  if (item.weight) {
    return `${item.weight}${item.weightUnit || "kg"}`;
  }
  if (item.variant?.weight) {
    return `${item.variant.weight}${item.variant.weightUnit || "kg"}`;
  }
  return (
    item.variant?.title ||
    item.variant?.name ||
    item.packagingType ||
    item.grade ||
    "Standard"
  );
}

function getItemCountry(item = {}, order = {}) {
  return (
    item.countryCode ||
    order.countryCode ||
    order.shippingAddress?.countryCode ||
    (order.currencyCode === "CAD" ? "CA" : "US")
  );
}

function getItemPricing(item = {}, order = {}) {
  const quantity = Number(item.quantity || 1);
  const unitPrice = Number(
    item.price ||
    item.unitPrice ||
    (order.totalAmount && getOrderItems(order).length
      ? Number(order.totalAmount) / getOrderItems(order).length
      : 0),
  );
  const lineTotal = Number(item.total ?? unitPrice * quantity);

  return { quantity, unitPrice, lineTotal };
}

function getOrderFinancials(order = {}, rawItems = []) {
  const subtotal = Number(
    order.subtotal ??
    (rawItems.length > 0 ? 0 : order.totalAmount ?? order.total ?? 0),
  );
  const tax = Number(order.tax ?? 0);
  const shipping = Number(order.shippingCharges ?? 0);
  const discount = Number(order.discount ?? 0);
  const total = Number(
    order.totalAmount ??
    order.total ??
    subtotal + tax + shipping - discount,
  );

  return { subtotal, tax, shipping, discount, total };
}

function formatDate(value, fallback = "") {
  if (!value) return fallback;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toISOString().replace("T", " ").slice(0, 16);
  } catch {
    return String(value);
  }
}

function applyCellBorder(
  cell,
  {
    top = "thin",
    bottom = "thin",
    left = "thin",
    right = "thin",
    color = DEFAULT_BORDER,
  } = {},
) {
  cell.border = {
    top: { style: top, color: { argb: color } },
    bottom: { style: bottom, color: { argb: color } },
    left: { style: left, color: { argb: color } },
    right: { style: right, color: { argb: color } },
  };
}

function styleCell(cell, options = {}) {
  const {
    size = 10,
    bold = false,
    italic = false,
    color = ENTERPRISE_THEME.brandSlateDark,
    fill,
    horizontal = "left",
    vertical = "middle",
    wrapText = false,
    border = true,
  } = options;

  cell.font = font(size, {
    bold,
    italic,
    color: { argb: color },
  });
  cell.alignment = { vertical, horizontal, wrapText };

  if (fill) cell.fill = solidFill(fill);
  if (border) applyCellBorder(cell);
}

function formatStatusCell(cell, rawStatus) {
  const statusKey = normalizeStatus(rawStatus);
  const palette =
    ENTERPRISE_THEME.statusColors[statusKey] ||
    ENTERPRISE_THEME.statusColors.DRAFT;

  cell.value = `●  ${statusKey}`;
  cell.font = font(9.5, {
    bold: true,
    color: { argb: palette.text },
  });
  cell.fill = solidFill(palette.fill);
  cell.alignment = { vertical: "middle", horizontal: "center" };
}

function styleHeaderRow(row, columns) {
  row.height = 28;

  columns.forEach((column, index) => {
    const cell = row.getCell(index + 1);

    cell.value = String(column.header || column.key).toUpperCase();
    cell.font = font(9.5, {
      bold: true,
      color: { argb: ENTERPRISE_THEME.white },
    });
    cell.fill = solidFill(ENTERPRISE_THEME.brandNavy);
    cell.alignment = {
      vertical: "middle",
      horizontal:
        column.align || (column.isNumber ? "right" : "left"),
      wrapText: Boolean(column.wrapText),
    };

    applyCellBorder(cell, {
      top: "thin",
      bottom: "medium",
      left: "thin",
      right: "thin",
      color: "FF334155",
    });
  });
}

function writeDataRow(row, columns, source, rowIndex) {
  const isZebra = rowIndex % 2 === 1;
  row.height = 24;

  columns.forEach((column, index) => {
    const cell = row.getCell(index + 1);
    let value = source[column.key];

    if (typeof column.format === "function") {
      value = column.format(value, source);
    }

    if (column.isStatus) {
      formatStatusCell(cell, value);
    } else {
      if (column.isNumber) {
        const numeric = Number(value);
        cell.value = Number.isNaN(numeric) ? 0 : numeric;
      } else {
        cell.value = value ?? "";
      }

      if (column.numFmt) cell.numFmt = column.numFmt;

      cell.font = font(9.5, {
        color: { argb: ENTERPRISE_THEME.brandSlateDark },
      });
      cell.alignment = {
        vertical: "middle",
        horizontal:
          column.align || (column.isNumber ? "right" : "left"),
        wrapText: Boolean(column.wrapText),
      };

      if (isZebra) cell.fill = solidFill(ENTERPRISE_THEME.brandSlateZebra);
    }

    applyCellBorder(cell);
  });
}

function addTotalsRow(
  worksheet,
  rowIndex,
  columns,
  {
    labelKey,
    label,
    sumKeys = [],
    startRow,
    endRow,
  } = {},
) {
  const row = worksheet.getRow(rowIndex);
  row.height = 28;

  columns.forEach((column, index) => {
    const cell = row.getCell(index + 1);

    if (column.key === labelKey) {
      cell.value = label || "TOTAL";
      cell.alignment = { vertical: "middle", horizontal: "left" };
    } else if (sumKeys.includes(column.key) && startRow <= endRow) {
      const letter = worksheet.getColumn(index + 1).letter;
      cell.value = {
        formula: `SUM(${letter}${startRow}:${letter}${endRow})`,
      };
      if (column.numFmt) cell.numFmt = column.numFmt;
      cell.alignment = { vertical: "middle", horizontal: "right" };
    } else {
      cell.value = "";
    }

    styleCell(cell, {
      size: 10,
      bold: true,
      color: ENTERPRISE_THEME.brandSlateDark,
      fill: ENTERPRISE_THEME.slateSoft,
    });

    cell.border = {
      top: { style: "thin", color: { argb: "FF94A3B8" } },
      bottom: { style: "double", color: { argb: "FF0F172A" } },
      left: { style: "thin", color: { argb: DEFAULT_BORDER } },
      right: { style: "thin", color: { argb: DEFAULT_BORDER } },
    };
  });

  return row;
}

function addBanner(worksheet, {
  row = 1,
  title,
  subtitle,
  columnCount,
}) {
  worksheet.getRow(row).height = 36;
  worksheet.mergeCells(row, 1, row, columnCount);

  const titleCell = worksheet.getCell(row, 1);
  titleCell.value = `  ${String(title || "").toUpperCase()}`;
  titleCell.font = font(13.5, {
    bold: true,
    color: { argb: ENTERPRISE_THEME.white },
  });
  titleCell.fill = solidFill(ENTERPRISE_THEME.brandGreenDark);
  titleCell.alignment = { vertical: "middle", horizontal: "left" };

  let nextRow = row + 1;

  if (subtitle) {
    worksheet.getRow(nextRow).height = 22;
    worksheet.mergeCells(nextRow, 1, nextRow, columnCount);

    const subtitleCell = worksheet.getCell(nextRow, 1);
    subtitleCell.value = `  ${subtitle}`;
    subtitleCell.font = font(9.5, {
      italic: true,
      color: { argb: ENTERPRISE_THEME.brandSlateMuted },
    });
    subtitleCell.fill = solidFill(ENTERPRISE_THEME.brandSlateZebra);
    subtitleCell.alignment = { vertical: "middle", horizontal: "left" };

    nextRow += 1;
  }

  worksheet.getRow(nextRow).height = 8;
  return nextRow + 1;
}

function addKpiRibbon(worksheet, row, cards, columnCount) {
  if (!Array.isArray(cards) || !cards.length) return row;

  const labelRow = worksheet.getRow(row);
  const valueRow = worksheet.getRow(row + 1);

  labelRow.height = 18;
  valueRow.height = 26;

  const colsPerCard = Math.max(
    2,
    Math.floor(columnCount / cards.length),
  );

  cards.forEach((card, index) => {
    const startCol = index * colsPerCard + 1;
    if (startCol > columnCount) return;

    const endCol = Math.min(
      startCol + colsPerCard - 1,
      columnCount,
    );

    const labelCell = labelRow.getCell(startCol);
    labelCell.value = String(card.label || "").toUpperCase();
    labelCell.font = font(8.5, {
      bold: true,
      color: { argb: ENTERPRISE_THEME.brandSlateMuted },
    });
    labelCell.alignment = { vertical: "middle", horizontal: "center" };
    labelCell.fill = solidFill(ENTERPRISE_THEME.slateSoft);

    const valueCell = valueRow.getCell(startCol);
    valueCell.value = card.value;
    valueCell.font = font(12.5, {
      bold: true,
      color: {
        argb:
          card.highlightColor ||
          ENTERPRISE_THEME.brandGreenDark,
      },
    });
    valueCell.alignment = { vertical: "middle", horizontal: "center" };
    valueCell.fill = solidFill(ENTERPRISE_THEME.white);

    if (endCol > startCol) {
      worksheet.mergeCells(row, startCol, row, endCol);
      worksheet.mergeCells(row + 1, startCol, row + 1, endCol);
    }

    for (let col = startCol; col <= endCol; col += 1) {
      applyCellBorder(labelRow.getCell(col));
      applyCellBorder(valueRow.getCell(col));
    }
  });

  return row + 2;
}

function setColumnWidths(worksheet, columns, data = [], {
  dynamic = true,
  maxWidth = 48,
} = {}) {
  columns.forEach((column, index) => {
    let width = Number(column.width) || 12;

    if (dynamic) {
      let maxLength = String(column.header || column.key || "").length + 4;

      data.forEach((row) => {
        let value = row?.[column.key];
        if (typeof column.format === "function") {
          value = column.format(value, row);
        }

        if (value !== null && value !== undefined) {
          maxLength = Math.max(maxLength, String(value).length);
        }
      });

      width = Math.max(width, Math.min(maxLength + 3, maxWidth));
    }

    width = Math.max(
      Number(column.minWidth) || 10,
      Math.min(width, Number(column.maxWidth) || maxWidth),
    );

    worksheet.getColumn(index + 1).width = width;
  });
}

function freezeAndFilter(
  worksheet,
  headerRow,
  columnCount,
  { showGridLines = true } = {},
) {
  const lastColumn = worksheet.getColumn(columnCount).letter;

  worksheet.autoFilter = `A${headerRow}:${lastColumn}${headerRow}`;
  worksheet.views = [
    {
      state: "frozen",
      ySplit: headerRow,
      activeCell: `A${headerRow + 1}`,
      showGridLines,
    },
  ];
}

function createWorkbook() {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "VANOM Enterprise Portal";
  workbook.lastModifiedBy = "VANOM Operations";
  workbook.created = new Date();
  workbook.modified = new Date();

  return workbook;
}

export function downloadExcelBuffer(
  buffer,
  filename = "export.xlsx",
) {
  const blob = new Blob([buffer], { type: EXCEL_MIME });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}

async function downloadWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelBuffer(buffer, filename);
}

/**
 * Generic reusable enterprise exporter.
 */
export async function exportToExcel({
  filename = "export.xlsx",
  sheetName = "Summary",
  title = null,
  subtitle = null,
  kpiCards = [],
  columns = [],
  data = [],
  totals = null,
  statusKey = null,
  freezePanes = true,
}) {
  const workbook = createWorkbook();
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
  });

  let rowIndex = 1;
  const columnCount = Math.max(columns.length, 1);

  if (title) {
    rowIndex = addBanner(worksheet, {
      row: rowIndex,
      title,
      subtitle,
      columnCount,
    });
  }

  rowIndex = addKpiRibbon(
    worksheet,
    rowIndex,
    kpiCards,
    columnCount,
  );

  const headerRow = rowIndex;
  styleHeaderRow(worksheet.getRow(headerRow), columns);
  rowIndex += 1;

  const dataStart = rowIndex;

  data.forEach((row, index) => {
    writeDataRow(
      worksheet.getRow(rowIndex),
      columns.map((column) => ({
        ...column,
        isStatus:
          column.isStatus || column.key === statusKey,
      })),
      row,
      index,
    );
    rowIndex += 1;
  });

  const dataEnd = rowIndex - 1;

  if (totals && data.length) {
    addTotalsRow(worksheet, rowIndex, columns, {
      ...totals,
      startRow: dataStart,
      endRow: dataEnd,
    });
    rowIndex += 1;
  }

  setColumnWidths(worksheet, columns, data);

  if (freezePanes && columns.length) {
    freezeAndFilter(worksheet, headerRow, columns.length);
  }

  await downloadWorkbook(workbook, filename);
}

/**
 * Normalizes an order into one export-friendly structure.
 */
function normalizeOrder(order) {
  const b2b = isB2BOrder(order);
  const items = getOrderItems(order);
  const address = getShippingAddress(order);
  const status = normalizeStatus(order.status);
  const financials = getOrderFinancials(order, items);

  const itemCount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0,
  );

  const itemsSummary =
    items
      .map((item) => {
        const qty = item.quantity ? ` (x${item.quantity})` : "";
        return `${getProductName(item)}${qty}`;
      })
      .join("; ") || "Enterprise Wholesale Batch";

  const currency = resolveCurrency(order);

  return {
    rawOrder: order,
    rawItems: items,
    orderNumber: getOrderNumber(order),
    orderType: b2b ? "Wholesale (B2B)" : "Retail (B2C)",
    date: formatDate(order.createdAt),
    customerName: getCustomerName(order),
    customerEmail:
      order.user?.email ||
      order.requestedBy?.email ||
      order.company?.email ||
      "",
    customerPhone:
      address?.phone ||
      order.user?.phone ||
      order.requestedBy?.phone ||
      order.company?.phone ||
      "",
    destination: address?.city
      ? `${address.city}${address.country ? `, ${address.country}` : ""}`
      : "Standard Logistics",
    fullAddress:
      [
        address?.addressLine1,
        address?.city,
        address?.state,
        address?.postalCode,
        address?.country || address?.countryCode,
      ]
        .filter(Boolean)
        .join(", ") || "N/A",
    itemsCount: itemCount || 1,
    itemsSummary,
    paymentStatus:
      order.paymentStatus ||
      (["DELIVERED", "COMPLETED"].includes(status) ? "PAID" : "PENDING"),
    orderStatus: status,
    currency,
    subtotal: financials.subtotal,
    tax: financials.tax,
    shippingCharges: financials.shipping,
    discount: financials.discount,
    totalAmount: financials.total,
  };
}

function getOrdersKpis(normalizedOrders) {
  let revenue = 0;
  let completed = 0;
  let pending = 0;
  let units = 0;

  normalizedOrders.forEach((order) => {
    revenue += Number(order.totalAmount || 0);
    units += Number(order.itemsCount || 0);

    if (
      ["DELIVERED", "COMPLETED", "APPROVED"].includes(order.orderStatus)
    ) {
      completed += 1;
    } else if (
      !["CANCELLED", "REJECTED"].includes(order.orderStatus)
    ) {
      pending += 1;
    }
  });

  return {
    revenue,
    completed,
    pending,
    units,
  };
}

function buildOrdersColumns(numFmt) {
  return [
    { header: "Order #", key: "orderNumber", width: 17, align: "center" },
    { header: "Type", key: "orderType", width: 15, align: "center" },
    { header: "Date (UTC)", key: "date", width: 18, align: "center" },
    {
      header: "Customer / Enterprise",
      key: "customerName",
      width: 25,
      align: "left",
    },
    {
      header: "Contact Email",
      key: "customerEmail",
      width: 26,
      align: "left",
    },
    { header: "Phone", key: "customerPhone", width: 16, align: "left" },
    {
      header: "Destination",
      key: "destination",
      width: 20,
      align: "left",
    },
    {
      header: "Full Address",
      key: "fullAddress",
      width: 36,
      align: "left",
      wrapText: true,
    },
    {
      header: "Items Qty",
      key: "itemsCount",
      width: 12,
      align: "right",
      isNumber: true,
      numFmt: "#,##0",
    },
    {
      header: "Items Summary",
      key: "itemsSummary",
      width: 42,
      align: "left",
      wrapText: true,
    },
    {
      header: "Payment",
      key: "paymentStatus",
      width: 14,
      align: "center",
      isStatus: true,
    },
    {
      header: "Order Status",
      key: "orderStatus",
      width: 16,
      align: "center",
      isStatus: true,
    },
    { header: "Currency", key: "currency", width: 10, align: "center" },
    {
      header: "Subtotal",
      key: "subtotal",
      width: 15,
      align: "right",
      isNumber: true,
      numFmt,
    },
    {
      header: "Tax",
      key: "tax",
      width: 13,
      align: "right",
      isNumber: true,
      numFmt,
    },
    {
      header: "Shipping",
      key: "shippingCharges",
      width: 13,
      align: "right",
      isNumber: true,
      numFmt,
    },
    {
      header: "Discount",
      key: "discount",
      width: 13,
      align: "right",
      isNumber: true,
      numFmt,
    },
    {
      header: "Total Amount",
      key: "totalAmount",
      width: 18,
      align: "right",
      isNumber: true,
      numFmt,
    },
  ];
}

function buildItemColumns(numFmt) {
  return [
    { header: "Order #", key: "orderNumber", width: 17, align: "center" },
    { header: "Date", key: "date", width: 18, align: "center" },
    { header: "Channel", key: "orderType", width: 15, align: "center" },
    {
      header: "Customer / Enterprise",
      key: "customerName",
      width: 25,
      align: "left",
    },
    {
      header: "Product / Item Name",
      key: "name",
      width: 32,
      align: "left",
    },
    {
      header: "Description",
      key: "description",
      width: 28,
      align: "left",
    },
    { header: "SKU / Code", key: "sku", width: 16, align: "center" },
    { header: "Country", key: "country", width: 10, align: "center" },
    {
      header: "Weight / Spec",
      key: "variant",
      width: 16,
      align: "center",
    },
    { header: "Currency", key: "currency", width: 10, align: "center" },
    {
      header: "Unit Price",
      key: "unitPrice",
      width: 14,
      align: "right",
      isNumber: true,
      numFmt,
    },
    {
      header: "Quantity",
      key: "quantity",
      width: 11,
      align: "right",
      isNumber: true,
      numFmt: "#,##0",
    },
    {
      header: "Line Total",
      key: "lineTotal",
      width: 16,
      align: "right",
      isNumber: true,
      numFmt,
    },
    {
      header: "Order Status",
      key: "status",
      width: 15,
      align: "center",
      isStatus: true,
    },
  ];
}

function buildLineItemRows(normalizedOrders) {
  const rows = [];

  normalizedOrders.forEach((order) => {
    const items =
      order.rawItems.length > 0
        ? order.rawItems
        : [
          {
            name: "Standard Fulfillment Batch",
            quantity: order.itemsCount,
            price: order.totalAmount,
          },
        ];

    items.forEach((item) => {
      const { unitPrice, quantity, lineTotal } = getItemPricing(
        item,
        order.rawOrder,
      );

      rows.push({
        orderNumber: order.orderNumber,
        date: order.date,
        orderType: order.orderType,
        customerName: order.customerName,
        name: getProductName(item),
        description: getProductDescription(item),
        sku: getProductSku(item),
        country: getItemCountry(item, order.rawOrder),
        variant: getItemVariant(item),
        currency: item.currencyCode || order.currency,
        unitPrice,
        quantity,
        lineTotal,
        status: order.orderStatus,
      });
    });
  });

  return rows;
}

function buildLineItemsSheet(workbook, normalizedOrders, numFmt) {
  const columns = buildItemColumns(numFmt);
  const rows = buildLineItemRows(normalizedOrders);

  const sheet = workbook.addWorksheet("Line Items Detail", {
    views: [{ showGridLines: true }],
  });

  let rowIndex = addBanner(sheet, {
    row: 1,
    title: "VANOM E-COMMERCE | ITEMIZED ORDER FULFILLMENT BREAKDOWN",
    subtitle:
      "Granular item-by-item breakdown for accounting reconciliations, auditing, and warehouse packing.",
    columnCount: columns.length,
  });

  const headerRow = rowIndex;
  styleHeaderRow(sheet.getRow(headerRow), columns);
  rowIndex += 1;

  const dataStart = rowIndex;

  rows.forEach((row, index) => {
    writeDataRow(sheet.getRow(rowIndex), columns, row, index);
    rowIndex += 1;
  });

  const dataEnd = rowIndex - 1;

  if (rows.length) {
    addTotalsRow(sheet, rowIndex, columns, {
      labelKey: "orderNumber",
      label: `TOTAL (${rows.length} line items)`,
      sumKeys: ["quantity", "lineTotal"],
      startRow: dataStart,
      endRow: dataEnd,
    });
  }

  setColumnWidths(sheet, columns, rows, {
    dynamic: false,
    maxWidth: 48,
  });

  freezeAndFilter(sheet, headerRow, columns.length);
}

async function exportSingleOrderCommercialSlip(order, options = {}) {
  const workbook = createWorkbook();
  const sheet = workbook.addWorksheet("Order Slip", {
    views: [{ showGridLines: true }],
  });

  const b2b = isB2BOrder(order);
  const orderNumber = getOrderNumber(order);
  const currency = resolveCurrency(order);
  const numFmt = currencyFormat(currencySymbol(currency));
  const items = getOrderItems(order);
  const financials = getOrderFinancials(order, items);
  const address = getShippingAddress(order);

  const customerName = getCustomerName(order);
  const customerEmail =
    order.user?.email ||
    order.requestedBy?.email ||
    order.company?.email ||
    "N/A";
  const customerPhone =
    address?.phone ||
    order.user?.phone ||
    order.requestedBy?.phone ||
    "N/A";

  const addressLine =
    address?.addressLine1 || address?.address || "Standard Logistics Center";
  const cityStateZip =
    [address?.city, address?.state, address?.postalCode || address?.zipCode]
      .filter(Boolean)
      .join(", ") || "City, State, Zip";
  const country =
    address?.country || address?.countryCode || "Standard Territory";

  sheet.mergeCells("A1:G1");
  const banner = sheet.getCell("A1");
  banner.value = `  VANOM E-COMMERCE  |  ${b2b
      ? "COMMERCIAL WHOLESALE PURCHASE ORDER"
      : "OFFICIAL ORDER INVOICE"
    }`;
  banner.font = font(13, {
    bold: true,
    color: { argb: ENTERPRISE_THEME.white },
  });
  banner.fill = solidFill(ENTERPRISE_THEME.brandGreenDark);
  banner.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 34;

  sheet.mergeCells("A2:G2");
  const metadata = sheet.getCell("A2");
  metadata.value =
    `  ORDER REFERENCE: ${orderNumber}  |  STATUS: ${normalizeStatus(
      order.status,
    )}  |  DATE: ${new Date(order.createdAt || Date.now()).toLocaleString()}`;
  metadata.font = font(9.5, {
    bold: true,
    color: { argb: "FF334155" },
  });
  metadata.fill = solidFill(ENTERPRISE_THEME.slateSoft);
  metadata.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(2).height = 22;
  sheet.getRow(3).height = 10;

  sheet.mergeCells("A4:C4");
  sheet.mergeCells("E4:G4");

  ["A4", "E4"].forEach((cellAddress) => {
    const cell = sheet.getCell(cellAddress);
    cell.font = font(9.5, {
      bold: true,
      color: { argb: ENTERPRISE_THEME.white },
    });
    cell.fill = solidFill(ENTERPRISE_THEME.brandNavy);
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  sheet.getCell("A4").value = "  BILLING & CUSTOMER ACCOUNT";
  sheet.getCell("E4").value = "  FULFILLMENT & SHIPPING ADDRESS";
  sheet.getRow(4).height = 22;

  const details = [
    {
      leftLabel: "Account Name:",
      leftVal: customerName,
      rightLabel: "Recipient:",
      rightVal: address?.fullName || customerName,
    },
    {
      leftLabel: "Email:",
      leftVal: customerEmail,
      rightLabel: "Address:",
      rightVal: addressLine,
    },
    {
      leftLabel: "Phone:",
      leftVal: customerPhone,
      rightLabel: "City/Zip:",
      rightVal: cityStateZip,
    },
    {
      leftLabel: "Channel:",
      leftVal: b2b
        ? "Enterprise Wholesale (B2B)"
        : "Consumer Retail (B2C)",
      rightLabel: "Country:",
      rightVal: country,
    },
  ];

  details.forEach((item, index) => {
    const rowNumber = 5 + index;
    sheet.getRow(rowNumber).height = 20;

    sheet.getCell(`A${rowNumber}`).value = item.leftLabel;
    sheet.getCell(`A${rowNumber}`).font = font(9, {
      bold: true,
      color: { argb: ENTERPRISE_THEME.brandSlateMuted },
    });

    sheet.mergeCells(`B${rowNumber}:C${rowNumber}`);
    sheet.getCell(`B${rowNumber}`).value = item.leftVal;
    sheet.getCell(`B${rowNumber}`).font = font(9.5, {
      color: { argb: ENTERPRISE_THEME.brandNavy },
    });

    sheet.getCell(`E${rowNumber}`).value = item.rightLabel;
    sheet.getCell(`E${rowNumber}`).font = font(9, {
      bold: true,
      color: { argb: ENTERPRISE_THEME.brandSlateMuted },
    });

    sheet.mergeCells(`F${rowNumber}:G${rowNumber}`);
    sheet.getCell(`F${rowNumber}`).value = item.rightVal;
    sheet.getCell(`F${rowNumber}`).font = font(9.5, {
      color: { argb: ENTERPRISE_THEME.brandNavy },
    });

    ["A", "B", "C", "E", "F", "G"].forEach((column) =>
      applyCellBorder(sheet.getCell(`${column}${rowNumber}`)),
    );
  });

  sheet.getRow(9).height = 12;

  const tableHeaders = [
    ["A", "ITEM #", 8, "center"],
    ["B", "PRODUCT / COMMODITY DESCRIPTION", 34, "left"],
    ["C", "SKU / CODE", 16, "center"],
    ["D", "SPECIFICATION / VARIANT", 20, "left"],
    ["E", "UNIT PRICE", 14, "right"],
    ["F", "QTY", 10, "right"],
    ["G", "LINE TOTAL", 18, "right"],
  ];

  tableHeaders.forEach(([column, title, width, align]) => {
    const cell = sheet.getCell(`${column}10`);
    cell.value = title;
    cell.font = font(9.5, {
      bold: true,
      color: { argb: ENTERPRISE_THEME.white },
    });
    cell.fill = solidFill(ENTERPRISE_THEME.brandNavy);
    cell.alignment = { vertical: "middle", horizontal: align };
    applyCellBorder(cell, { color: "FF334155" });
    sheet.getColumn(column).width = width;
  });

  let rowIndex = 11;

  if (!items.length) {
    sheet.mergeCells(`A${rowIndex}:G${rowIndex}`);
    const cell = sheet.getCell(`A${rowIndex}`);
    cell.value =
      "Standard Order Batch (Detailed commodity line specifications recorded in system)";
    cell.font = font(9.5, {
      italic: true,
      color: { argb: ENTERPRISE_THEME.brandSlateMuted },
    });
    cell.alignment = { vertical: "middle", horizontal: "center" };
    rowIndex += 1;
  } else {
    items.forEach((item, index) => {
      const { unitPrice, quantity, lineTotal } = getItemPricing(
        item,
        order,
      );
      const zebra = index % 2 === 1;
      const values = [
        index + 1,
        getProductName(item),
        getProductSku(item),
        getItemVariant(item),
        unitPrice,
        quantity,
        lineTotal,
      ];

      values.forEach((value, columnIndex) => {
        const cell = sheet.getCell(rowIndex, columnIndex + 1);
        cell.value = value;

        if (columnIndex === 4 || columnIndex === 6) {
          cell.numFmt = numFmt;
        }
        if (columnIndex === 5) cell.numFmt = "#,##0";

        cell.font = font(9.5, {
          color: { argb: ENTERPRISE_THEME.brandNavy },
        });
        cell.alignment = {
          vertical: "middle",
          horizontal:
            columnIndex === 0
              ? "center"
              : [4, 5, 6].includes(columnIndex)
                ? "right"
                : "left",
        };

        if (zebra) cell.fill = solidFill(ENTERPRISE_THEME.brandSlateZebra);
        applyCellBorder(cell);
      });

      sheet.getRow(rowIndex).height = 24;
      rowIndex += 1;
    });
  }

  const itemsEndRow = rowIndex - 1;

  const financeRows = [
    {
      label: "Items Subtotal",
      value: financials.subtotal,
      formula:
        items.length > 0
          ? `SUM(G11:G${itemsEndRow})`
          : null,
    },
    { label: "Estimated Tax", value: financials.tax },
    { label: "Shipping & Logistics", value: financials.shipping },
    {
      label: "Discount / Rebate",
      value: financials.discount > 0 ? -financials.discount : 0,
    },
    {
      label: "GRAND TOTAL",
      value: financials.total,
      grandTotal: true,
    },
  ];

  financeRows.forEach((entry) => {
    const label = sheet.getCell(`E${rowIndex}`);
    const value = sheet.getCell(`G${rowIndex}`);

    sheet.mergeCells(`E${rowIndex}:F${rowIndex}`);

    label.value = entry.label;
    label.font = font(entry.grandTotal ? 11 : 9.5, {
      bold: true,
      color: {
        argb: entry.grandTotal
          ? ENTERPRISE_THEME.brandGreenDark
          : "FF475569",
      },
    });
    label.alignment = { vertical: "middle", horizontal: "right" };

    value.value = entry.formula
      ? { formula: entry.formula }
      : entry.value;
    value.numFmt = numFmt;
    value.font = font(entry.grandTotal ? 12 : 9.5, {
      bold: true,
      color: {
        argb: entry.grandTotal
          ? ENTERPRISE_THEME.brandGreenDark
          : ENTERPRISE_THEME.brandNavy,
      },
    });
    value.alignment = { vertical: "middle", horizontal: "right" };

    if (entry.grandTotal) {
      label.fill = solidFill(ENTERPRISE_THEME.brandGreenLight);
      value.fill = solidFill(ENTERPRISE_THEME.brandGreenLight);
      const border = {
        top: { style: "thin", color: { argb: ENTERPRISE_THEME.brandGreenDark } },
        bottom: { style: "double", color: { argb: ENTERPRISE_THEME.brandGreenDark } },
        left: { style: "thin", color: { argb: DEFAULT_BORDER } },
        right: { style: "thin", color: { argb: DEFAULT_BORDER } },
      };
      label.border = border;
      value.border = border;
    } else {
      applyCellBorder(label);
      applyCellBorder(value);
    }

    sheet.getRow(rowIndex).height = entry.grandTotal ? 28 : 22;
    rowIndex += 1;
  });

  rowIndex += 1;
  sheet.mergeCells(`A${rowIndex}:G${rowIndex}`);
  const footer = sheet.getCell(`A${rowIndex}`);
  footer.value =
    "Official Document generated by VANOM Global E-Commerce & Wholesale Trading System.";
  footer.font = font(8.5, {
    italic: true,
    color: { argb: "FF94A3B8" },
  });
  footer.alignment = { vertical: "middle", horizontal: "center" };

  await downloadWorkbook(
    workbook,
    options.filename || `vanom-order-${orderNumber}.xlsx`,
  );
}

/**
 * Enterprise master orders export.
 *
 * One order:
 *   -> commercial order slip
 *
 * Multiple orders:
 *   -> Orders Overview
 *   -> Line Items Detail
 */
export async function exportOrdersToExcel(
  orders = [],
  options = {},
) {
  if (!Array.isArray(orders)) {
    throw new TypeError("exportOrdersToExcel expects an array of orders.");
  }

  if (orders.length === 1) {
    return exportSingleOrderCommercialSlip(orders[0], options);
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename =
    options.filename ||
    `vanom-enterprise-orders-${timestamp}.xlsx`;

  const normalizedOrders = orders.map(normalizeOrder);
  const kpis = getOrdersKpis(normalizedOrders);

  // A workbook can contain multiple currencies. Use the first order's
  // currency for presentation formatting, while retaining the Currency column.
  const currency = resolveCurrency(orders[0]);
  const numFmt = currencyFormat(currencySymbol(currency));

  const columns = buildOrdersColumns(numFmt);

  const workbook = createWorkbook();
  const summary = workbook.addWorksheet("Orders Overview", {
    views: [{ showGridLines: true }],
  });

  const filterContext = options.filterContext
    ? `Scope: ${options.filterContext}`
    : "Scope: All Master Records";

  let rowIndex = addBanner(summary, {
    row: 1,
    title:
      options.title ||
      "VANOM E-COMMERCE | EXECUTIVE MASTER ORDERS REPORT",
    subtitle:
      `Exported: ${new Date().toLocaleString()}  |  ${filterContext}  |  Total Records: ${normalizedOrders.length}`,
    columnCount: columns.length,
  });

  rowIndex = addKpiRibbon(
    summary,
    rowIndex,
    [
      {
        label: "Total Orders",
        value: normalizedOrders.length,
        highlightColor: ENTERPRISE_THEME.brandNavy,
      },
      {
        label: "Total Revenue",
        value: `${currencySymbol(currency)}${kpis.revenue.toLocaleString(
          undefined,
          { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        )}`,
        highlightColor: ENTERPRISE_THEME.brandGreenDark,
      },
      {
        label: "Completed / Delivered",
        value: `${kpis.completed} Orders`,
        highlightColor: "FF166534",
      },
      {
        label: "In-Flight / Pending",
        value: `${kpis.pending} Orders`,
        highlightColor: "FF92400E",
      },
      {
        label: "Total Units Packed",
        value: `${kpis.units.toLocaleString()} Units`,
        highlightColor: ENTERPRISE_THEME.brandSlateDark,
      },
    ],
    columns.length,
  );

  const headerRow = rowIndex;
  styleHeaderRow(summary.getRow(headerRow), columns);
  rowIndex += 1;

  const dataStart = rowIndex;

  normalizedOrders.forEach((order, index) => {
    writeDataRow(
      summary.getRow(rowIndex),
      columns,
      order,
      index,
    );
    rowIndex += 1;
  });

  const dataEnd = rowIndex - 1;

  if (normalizedOrders.length) {
    addTotalsRow(summary, rowIndex, columns, {
      labelKey: "orderNumber",
      label: `TOTAL (${normalizedOrders.length} orders)`,
      sumKeys: [
        "itemsCount",
        "subtotal",
        "tax",
        "shippingCharges",
        "discount",
        "totalAmount",
      ],
      startRow: dataStart,
      endRow: dataEnd,
    });
  }

  setColumnWidths(summary, columns, normalizedOrders);
  freezeAndFilter(summary, headerRow, columns.length);

  buildLineItemsSheet(workbook, normalizedOrders, numFmt);

  await downloadWorkbook(workbook, filename);
}
