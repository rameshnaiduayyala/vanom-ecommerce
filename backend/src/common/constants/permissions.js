export const PERMISSIONS = Object.freeze({
  CATALOG_READ: "catalog.read",
  CATALOG_CREATE: "catalog.create",
  CATALOG_UPDATE: "catalog.update",
  CATALOG_DELETE: "catalog.delete",

  PRICING_READ: "pricing.read",
  PRICING_CREATE: "pricing.create",
  PRICING_UPDATE: "pricing.update",

  INVENTORY_READ: "inventory.read",
  INVENTORY_ADJUST: "inventory.adjust",
  INVENTORY_TRANSFER: "inventory.transfer",

  ORDERS_READ: "orders.read",
  ORDERS_CREATE: "orders.create",
  ORDERS_UPDATE: "orders.update",
  ORDERS_CANCEL: "orders.cancel",

  COMPANIES_READ: "companies.read",
  COMPANIES_CREATE: "companies.create",
  COMPANIES_UPDATE: "companies.update",
  COMPANIES_APPROVE: "companies.approve",
  COMPANIES_REJECT: "companies.reject",

  QUOTES_READ: "quotes.read",
  QUOTES_CREATE: "quotes.create",
  QUOTES_UPDATE: "quotes.update",
  QUOTES_APPROVE: "quotes.approve",

  PAYMENTS_READ: "payments.read",
  PAYMENTS_REFUND: "payments.refund",

  ADMIN_DASHBOARD: "admin.dashboard",
  ADMIN_USERS: "admin.users",
  ADMIN_COMPANIES: "admin.companies",
  ADMIN_PRICING: "admin.pricing",
  ADMIN_INVENTORY: "admin.inventory",
  ADMIN_ORDERS: "admin.orders",
});
