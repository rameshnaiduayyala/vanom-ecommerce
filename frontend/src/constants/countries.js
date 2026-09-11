export const SUPPORTED_COUNTRIES = [
  {
    code: "US",
    name: "United States",
    currency: "USD",
    symbol: "$",
    flag: "🇺🇸",
    flagUrl: "https://flagcdn.com/w40/us.png",
  },
  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    symbol: "CA$",
    flag: "🇨🇦",
    flagUrl: "https://flagcdn.com/w40/ca.png",
  },
];

export const US_STATES = [
  { code: "CA", name: "California (8.82% Sales Tax)" },
  { code: "NY", name: "New York (8.52% Sales Tax)" },
  { code: "TX", name: "Texas (8.20% Sales Tax)" },
  { code: "FL", name: "Florida (7.02% Sales Tax)" },
  { code: "IL", name: "Illinois (8.81% Sales Tax)" },
  { code: "WA", name: "Washington (9.29% Sales Tax)" },
  { code: "PA", name: "Pennsylvania (6.34% Sales Tax)" },
  { code: "OH", name: "Ohio (7.24% Sales Tax)" },
  { code: "GA", name: "Georgia (7.35% Sales Tax)" },
  { code: "NC", name: "North Carolina (7.00% Sales Tax)" },
  { code: "NJ", name: "New Jersey (6.625% Sales Tax)" },
  { code: "VA", name: "Virginia (5.75% Sales Tax)" },
  { code: "OR", name: "Oregon (0% Zero Tax)" },
  { code: "DE", name: "Delaware (0% Zero Tax)" },
  { code: "NH", name: "New Hampshire (0% Zero Tax)" },
  { code: "MT", name: "Montana (0% Zero Tax)" },
];

export const CA_PROVINCES = [
  { code: "ON", name: "Ontario (13% HST)" },
  { code: "BC", name: "British Columbia (12% GST+PST)" },
  { code: "AB", name: "Alberta (5% GST Only)" },
  { code: "QC", name: "Quebec (14.975% GST+QST)" },
  { code: "NS", name: "Nova Scotia (15% HST)" },
  { code: "NB", name: "New Brunswick (15% HST)" },
  { code: "MB", name: "Manitoba (12% GST+RST)" },
  { code: "SK", name: "Saskatchewan (11% GST+PST)" },
];


export const ORDER_STATUSES = {
  PENDING: { label: "Pending", color: "yellow" },
  CONFIRMED: { label: "Confirmed", color: "blue" },
  PROCESSING: { label: "Processing", color: "indigo" },
  PACKED: { label: "Packed", color: "purple" },
  SHIPPED: { label: "Shipped", color: "cyan" },
  DELIVERED: { label: "Delivered", color: "green" },
  CANCELLED: { label: "Cancelled", color: "red" },
};

export const QUOTE_STATUSES = {
  DRAFT: { label: "Draft", color: "gray" },
  REQUESTED: { label: "Requested", color: "blue" },
  UNDER_REVIEW: { label: "Under Review", color: "yellow" },
  QUOTED: { label: "Quoted", color: "indigo" },
  ACCEPTED: { label: "Accepted", color: "green" },
  REJECTED: { label: "Rejected", color: "red" },
  EXPIRED: { label: "Expired", color: "orange" },
  CONVERTED: { label: "Converted", color: "emerald" },
};

export const COMPANY_STATUSES = {
  PENDING: { label: "Pending Verification", color: "yellow" },
  UNDER_REVIEW: { label: "Under Review", color: "blue" },
  APPROVED: { label: "Approved Wholesale", color: "green" },
  REJECTED: { label: "Rejected", color: "red" },
  SUSPENDED: { label: "Suspended", color: "gray" },
};
