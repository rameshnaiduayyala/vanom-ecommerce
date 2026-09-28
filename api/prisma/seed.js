import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/utils/password.js";
import { seedCategories } from "./seed-categories.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Resetting and cleaning entire database...");

  // Clear relations on User to prevent foreign key constraint issues
  try {
    await prisma.user.updateMany({
      data: { bulkBusinessId: null, organizationId: null },
    });
  } catch {}

  // 1. Delete inventory & warehouse related tables
  await prisma.inventoryTransferItem.deleteMany({});
  await prisma.inventoryTransfer.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.warehouse.deleteMany({});

  // 2. Delete B2B bulk tables
  await prisma.bulkOrderItem.deleteMany({});
  await prisma.bulkOrder.deleteMany({});
  await prisma.bulkCartItem.deleteMany({});
  await prisma.bulkCart.deleteMany({});
  await prisma.bulkAddress.deleteMany({});
  await prisma.bulkPricingTier.deleteMany({});
  await prisma.bulkVariantCountryPrice.deleteMany({});
  await prisma.bulkProductCountryPrice.deleteMany({});
  await prisma.bulkProductVariant.deleteMany({});
  await prisma.bulkProductImage.deleteMany({});
  await prisma.bulkProduct.deleteMany({});
  await prisma.bulkBusiness.deleteMany({});

  // 3. Delete Invoices & Orders & Products
  try {
    if (prisma.invoiceItem) await prisma.invoiceItem.deleteMany({});
    if (prisma.invoice) await prisma.invoice.deleteMany({});
  } catch {}

  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.orderAddress.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariantCountry.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productCountry.deleteMany({});
  await prisma.product.deleteMany({});

  // 4. Delete tokens, users, organization, categories, brands
  await prisma.bannerCountry.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.emailVerificationToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.file.deleteMany({});

  console.log("🌱 Database clean. Seeding required records...");

  // 1. Currencies & Countries
  const usd = await prisma.currency.upsert({
    where: { code: "USD" },
    update: {},
    create: { code: "USD", name: "US Dollar", symbol: "$" },
  });

  const cad = await prisma.currency.upsert({
    where: { code: "CAD" },
    update: {},
    create: { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  });

  const inr = await prisma.currency.upsert({
    where: { code: "INR" },
    update: {},
    create: { code: "INR", name: "Indian Rupee", symbol: "₹" },
  });

  const usCountry = await prisma.country.upsert({
    where: { code: "US" },
    update: { currencyId: usd.id },
    create: { code: "US", name: "United States", currencyId: usd.id },
  });

  await prisma.country.upsert({
    where: { code: "CA" },
    update: { currencyId: cad.id },
    create: { code: "CA", name: "Canada", currencyId: cad.id },
  });

  await prisma.country.upsert({
    where: { code: "IN" },
    update: { currencyId: inr.id },
    create: { code: "IN", name: "India", currencyId: inr.id },
  });

  // 2. Default Multi-Tenant Organization & Warehouse
  const org = await prisma.organization.create({
    data: {
      name: "Vanom Global Enterprise",
      slug: "vanom-global",
      code: "VANOM-HQ",
      isActive: true,
    },
  });

  await prisma.warehouse.create({
    data: {
      organizationId: org.id,
      name: "Hyderabad Central Hub",
      code: "HYD-01",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      postalCode: "500081",
      address: "HITEC City Phase 2",
      isActive: true,
      isDefault: true,
    },
  });

  // 3. Categories (Parent & Subcategories)
  console.log("📁 Seeding categories...");
  await seedCategories();

  // 4. Exactly 1 Brand
  console.log("🏷️  Seeding exactly 1 brand...");
  const brand = await prisma.brand.create({
    data: {
      name: "Vanom Organics",
      slug: "vanom-organics",
      isActive: true,
    },
  });

  const defaultPassword = await hashPassword("Password@123");

  // 5. Exactly 3 Type Users
  console.log("👥 Seeding 3 user types...");

  // Type 1: SUPERADMIN
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@vanom.com",
      passwordHash: defaultPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPERADMIN",
      isActive: true,
      emailVerifiedAt: new Date(),
      countryId: usCountry.id,
      organizationId: org.id,
    },
  });

  // Type 2: Standard Retail Customer (USER)
  const customer = await prisma.user.create({
    data: {
      email: "customer@vanom.com",
      passwordHash: defaultPassword,
      firstName: "Ramesh",
      lastName: "Ayyala",
      role: "USER",
      isActive: true,
      emailVerifiedAt: new Date(),
      countryId: usCountry.id,
      organizationId: org.id,
    },
  });

  // Approved B2B Wholesale Company Application
  const bulkBusiness = await prisma.bulkBusiness.create({
    data: {
      businessName: "Acme Organic Imports LLC",
      businessEmail: "purchasing@acmecorp.com",
      businessPhone: "+1-800-555-0199",
      registrationNumber: "REG-9928172",
      taxRegistrationNumber: "US-TAX-8827110",
      countryCode: "US",
      address: "100 Enterprise Way, Suite 400, Chicago, IL 60601",
      contactPersonName: "Robert Davis",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: "SUPERADMIN",
    },
  });

  // Type 3: Wholesale Customer (B2B_USER)
  const b2bUser = await prisma.user.create({
    data: {
      email: "b2b@acmecorp.com",
      passwordHash: defaultPassword,
      firstName: "Robert",
      lastName: "Davis",
      role: "B2B_USER",
      isActive: true,
      emailVerifiedAt: new Date(),
      countryId: usCountry.id,
      organizationId: org.id,
      bulkBusinessId: bulkBusiness.id,
    },
  });

  console.log("\n========================================================");
  console.log("✨ DATABASE RESET & SEED COMPLETE!");
  console.log("========================================================");
  console.log("🏢 Organization : Vanom Global Enterprise (VANOM-HQ)");
  console.log("🏭 Warehouse    : Hyderabad Central Hub (HYD-01)");
  console.log(`🏷️  Brand (1)    : ${brand.name} (${brand.slug})`);
  console.log("📁 Categories   : Seeded parent and subcategories");
  console.log("--------------------------------------------------------");
  console.log("👥 3 USER TYPES:");
  console.log("  1. SUPERADMIN : admin@vanom.com    / Password@123");
  console.log("  2. USER (B2C) : customer@vanom.com / Password@123");
  console.log("  3. B2B_USER   : b2b@acmecorp.com   / Password@123");
  console.log("========================================================\n");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
