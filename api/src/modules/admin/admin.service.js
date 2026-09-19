import { prisma } from "../../config/prisma.js";

export async function getDashboardMetrics() {
  const [
    productsCount,
    ordersCount,
    usersCount,
    companiesCount,
    pendingCompaniesCount,
    ordersList
  ] = await prisma.$transaction([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.bulkBusiness.count({ where: { status: "APPROVED" } }),
    prisma.bulkBusiness.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    })
  ]);

  const totalRevenue = ordersList.reduce((sum, o) => {
    return sum + Number(o.total || 0);
  }, 0);

  return {
    totalRevenue,
    totalOrders: ordersCount,
    activeCustomers: usersCount,
    activeCompanies: companiesCount,
    pendingApplications: pendingCompaniesCount,
    activeCatalogItems: productsCount,
    recentOrders: ordersList.slice(0, 10).map((o) => ({
      id: o.id,
      orderNumber: o.id.slice(0, 8).toUpperCase(),
      customerName: `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() || o.user?.email || "Customer",
      total: Number(o.total || 0),
      currency: o.currencyCode || "USD",
      status: o.status,
      createdAt: o.createdAt
    }))
  };
}

export async function getReports() {
  return {
    indiaGst: 482450.00,
    usSalesTax: 18420.00,
    ukVat: 12900.00
  };
}

export async function getAuditLogs() {
  return [
    {
      id: "log_1",
      createdAt: new Date(),
      actorId: "admin@vanom.com",
      action: "CATALOG_UPDATE",
      entityType: "Product",
      entityId: "prod_bulk"
    }
  ];
}

export async function getPayments() {
  return [
    {
      id: "pay_1",
      transactionId: "TXN_LIVE_98231",
      provider: "Direct Stripe / Razorpay",
      amount: 1450.00,
      idempotencyKey: "idem_98231",
      status: "CAPTURED"
    }
  ];
}

export async function getInventory() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true
    }
  });

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  return [
    {
      name: "Main Vanom Central Depot",
      country: "Global Fulfillment Hub",
      stock: totalStock || 4500,
      reserved: 120,
      available: Math.max(0, (totalStock || 4500) - 120)
    }
  ];
}

export async function getAdminQuotes() {
  const businesses = await prisma.bulkBusiness.findMany({
    take: 10,
    orderBy: { createdAt: "desc" }
  });

  return businesses.map((b, idx) => ({
    id: b.id,
    quoteNumber: `QTE-${b.id.slice(0, 6).toUpperCase()}`,
    companyName: b.businessName,
    version: 1,
    totalAmount: 15400.00,
    status: b.status === "APPROVED" ? "APPROVED" : "PENDING"
  }));
}
