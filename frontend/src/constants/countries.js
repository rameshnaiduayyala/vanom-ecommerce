export const SUPPORTED_COUNTRIES = [
  {
    code: "US",
    name: "United States",
    currency: "USD",
    symbol: "$",
    flag: "🇺🇸",
    badge: "North America",
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    flag: "🇬🇧",
    badge: "United Kingdom",
  },
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
