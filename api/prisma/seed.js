import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/utils/password.js";
import { seedCategories } from "./seed-categories.js";

const prisma = new PrismaClient();

async function main() {
  console.log("\n========================================================");
  console.log("🧹 1. RESETTING & PURGING ALL EXISTING APPLICATION DATA");
  console.log("========================================================");

  // 1. Unlink foreign-key relations on User to prevent cyclic constraint violations
  try {
    await prisma.user.updateMany({
      data: {
        bulkBusinessId: null,
        organizationId: null,
        countryId: null
      }
    });
  } catch (err) {
    console.warn("Notice unlinking user relations:", err.message);
  }

  // 2. Delete all records in strict reverse-dependency order
  await prisma.shippoWebhookEvent.deleteMany({});
  await prisma.shipmentItem.deleteMany({});
  await prisma.shippingRateSnapshot.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.invoice.deleteMany({});

  await prisma.bulkOrderItem.deleteMany({});
  await prisma.bulkOrder.deleteMany({});
  await prisma.bulkCartItem.deleteMany({});
  await prisma.bulkCart.deleteMany({});
  await prisma.bulkAddress.deleteMany({});

  await prisma.orderItem.deleteMany({});
  await prisma.orderAddress.deleteMany({});
  await prisma.order.deleteMany({});

  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});

  await prisma.inventoryTransferItem.deleteMany({});
  await prisma.inventoryTransfer.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.warehouse.deleteMany({});

  await prisma.review.deleteMany({});
  await prisma.productVariantCountry.deleteMany({});
  await prisma.productCountry.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  await prisma.bulkPricingTier.deleteMany({});
  await prisma.bulkVariantCountryPrice.deleteMany({});
  await prisma.bulkProductCountryPrice.deleteMany({});
  await prisma.bulkProductVariant.deleteMany({});
  await prisma.bulkProductImage.deleteMany({});
  await prisma.bulkProduct.deleteMany({});
  await prisma.bulkBusiness.deleteMany({});

  await prisma.bannerCountry.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.storeSetting.deleteMany({});
  await prisma.file.deleteMany({});

  await prisma.passwordResetToken.deleteMany({});
  await prisma.emailVerificationToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.country.deleteMany({});
  await prisma.currency.deleteMany({});

  console.log("✅ Database completely sanitized. Zero residual application records.");

  console.log("\n========================================================");
  console.log("🌱 2. SEEDING PRODUCTION-LIKE CLEAN DEMO DATASET");
  console.log("========================================================");

  // ── A. Currencies & Countries (ONLY USA and Canada) ───────────────────
  console.log("📍 Seeding 2 Currencies (USD, CAD) & 2 Countries (US, CA)...");
  const usd = await prisma.currency.create({
    data: { code: "USD", name: "US Dollar", symbol: "$" }
  });

  const cad = await prisma.currency.create({
    data: { code: "CAD", name: "Canadian Dollar", symbol: "CA$" }
  });

  const usCountry = await prisma.country.create({
    data: { code: "US", name: "United States", currencyId: usd.id }
  });

  const caCountry = await prisma.country.create({
    data: { code: "CA", name: "Canada", currencyId: cad.id }
  });

  // ── B. Multi-Tenant Root Organization ──────────────────────────────────
  console.log("🏢 Seeding Root Organization (Vanom Global Enterprise)...");
  const org = await prisma.organization.create({
    data: {
      name: "Vanom Global Enterprise",
      slug: "vanom-global",
      code: "VANOM-HQ",
      isActive: true
    }
  });

  // ── C. Exactly ONE Warehouse (Main USA Warehouse) ──────────────────────
  console.log("🏭 Seeding exactly 1 Warehouse (Main USA Warehouse)...");
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      organizationId: org.id,
      name: "Main USA Warehouse",
      code: "WH-USA-01",
      country: "USA",
      city: "Dallas",
      state: "TX",
      postalCode: "75261",
      address: "1200 Logistics Blvd, Suite 100",
      phone: "+1-800-555-0150",
      email: "warehouse-dallas@vanom.com",
      isDefault: true,
      isActive: true
    }
  });

  // ── D. Brand, Category & Store Settings ───────────────────────────────
  console.log("🏷️  Seeding Brand, Store Settings & Categories...");
  const brand = await prisma.brand.create({
    data: {
      name: "Vanom Organics",
      slug: "vanom-organics",
      isActive: true
    }
  });

  await seedCategories();
  const category = (await prisma.category.findFirst({ where: { slug: "spices-masalas" } }))
    || (await prisma.category.findFirst({ where: { slug: "staples-pantry" } }))
    || (await prisma.category.findFirst());

  await prisma.storeSetting.create({
    data: {
      storeName: "Vanom Organics",
      invoicePrefix: "VANOM",
      defaultCurrency: "USD",
      supportEmail: "support@vanom.com",
      legalName: "Vanom Global Enterprise LLC",
      addressLine1: "1200 Logistics Blvd, Suite 100",
      city: "Dallas",
      state: "TX",
      postalCode: "75261",
      country: "USA"
    }
  });

  // ── E. Exactly ONE B2B Company ─────────────────────────────────────────
  console.log("💼 Seeding exactly 1 B2B Business (Demo USA Wholesale Inc.)...");
  const b2bBusiness = await prisma.bulkBusiness.create({
    data: {
      businessName: "Demo USA Wholesale Inc.",
      businessEmail: "purchasing@demousawholesale.com",
      businessPhone: "+1-800-555-0199",
      registrationNumber: "REG-US-778899",
      taxRegistrationNumber: "US-TAX-123456",
      countryCode: "US",
      address: "500 Enterprise Pkwy, Chicago, IL 60601",
      contactPersonName: "David Miller",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: "SUPERADMIN"
    }
  });

  await prisma.bulkAddress.create({
    data: {
      businessId: b2bBusiness.id,
      label: "Corporate HQ Warehouse",
      contactName: "David Miller",
      phone: "+1-800-555-0199",
      addressLine1: "500 Enterprise Pkwy",
      city: "Chicago",
      state: "IL",
      postalCode: "60601",
      countryCode: "US",
      isDefault: true
    }
  });

  // ── F. Exactly 3 Users (Credentials from ENV with safe development defaults) ───
  console.log("👥 Seeding exactly 3 Users (SUPERADMIN, B2C Customer, B2B Admin)...");

  const SUPERADMIN_EMAIL = process.env.SEED_SUPERADMIN_EMAIL || "admin@vanom.com";
  const SUPERADMIN_PASSWORD = process.env.SEED_SUPERADMIN_PASSWORD || "Admin@123456";

  const B2C_EMAIL = process.env.SEED_B2C_EMAIL || "customer@vanom.com";
  const B2C_PASSWORD = process.env.SEED_B2C_PASSWORD || "Customer@123456";

  const B2B_EMAIL = process.env.SEED_B2B_EMAIL || "wholesale@demousawholesale.com";
  const B2B_PASSWORD = process.env.SEED_B2B_PASSWORD || "Wholesale@123456";

  // 1. SUPERADMIN
  const superadminUser = await prisma.user.create({
    data: {
      email: SUPERADMIN_EMAIL,
      passwordHash: await hashPassword(SUPERADMIN_PASSWORD),
      firstName: "Super",
      lastName: "Admin",
      role: "SUPERADMIN",
      isActive: true,
      emailVerifiedAt: new Date(),
      countryId: usCountry.id,
      organizationId: org.id
    }
  });

  // 2. B2C CUSTOMER
  const b2cUser = await prisma.user.create({
    data: {
      email: B2C_EMAIL,
      passwordHash: await hashPassword(B2C_PASSWORD),
      firstName: "Sarah",
      lastName: "Connor",
      role: "USER",
      isActive: true,
      emailVerifiedAt: new Date(),
      countryId: usCountry.id,
      organizationId: org.id
    }
  });

  // 3. B2B CUSTOMER / BUSINESS ADMIN
  const b2bUser = await prisma.user.create({
    data: {
      email: B2B_EMAIL,
      passwordHash: await hashPassword(B2B_PASSWORD),
      firstName: "David",
      lastName: "Miller",
      role: "B2B_USER",
      isActive: true,
      emailVerifiedAt: new Date(),
      countryId: usCountry.id,
      organizationId: org.id,
      bulkBusinessId: b2bBusiness.id
    }
  });

  // ── G. Products & Inventory (Minimal required for store testing) ───────
  console.log("📦 Seeding minimal products attached strictly to Main USA Warehouse...");

  // 1 Retail Product with US & Canada pricing
  const retailProduct = await prisma.product.create({
    data: {
      name: "Royal Kashmiri Saffron Grade-A",
      slug: "royal-kashmiri-saffron-grade-a",
      sku: "SAFFRON-A-01",
      description: "Premium hand-harvested Grade-A Royal Kashmiri Saffron with high crocin potency.",
      basePrice: 45.0,
      stock: 100,
      isActive: true,
      isFeatured: true,
      categoryId: category.id,
      brandId: brand.id,
      countries: {
        create: [
          {
            countryId: usCountry.id,
            price: 45.0,
            oldPrice: 55.0,
            stock: 60,
            isAvailable: true,
          },
          {
            countryId: caCountry.id,
            price: 60.0,
            oldPrice: 75.0,
            stock: 40,
            isAvailable: true,
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
            sortOrder: 0,
          },
        ],
      },
    }
  });

  // Attach inventory to the single warehouse
  await prisma.inventory.create({
    data: {
      organizationId: org.id,
      warehouseId: mainWarehouse.id,
      productId: retailProduct.id,
      quantity: 100,
      reservedQuantity: 0,
      reorderLevel: 10,
      reorderQuantity: 25
    }
  });

  // 1 Wholesale Bulk Product with Dynamic Weight Variants & Independent Country Pricing
  await prisma.bulkProduct.create({
    data: {
      name: "Premium Basmati Rice Wholesale",
      slug: "premium-basmati-rice-wholesale",
      sku: "RICE-001",
      type: "VARIABLE",
      category: "Groceries & Daily Needs",
      brand: "Vanom Organics",
      description: "Aged long-grain aromatic Basmati rice for commercial kitchens, restaurants, and bulk distribution.",
      isActive: true,
      images: {
        create: [
          {
            mediaAssetId: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
            sortOrder: 0,
            isPrimary: true
          }
        ]
      },
      variants: {
        create: [
          {
            name: "500g",
            sku: "RICE-001-500G",
            weight: 500,
            weightUnit: "g",
            sortOrder: 1,
            isActive: true,
            countryPrices: {
              create: [
                { countryCode: "US", currencyCode: "USD", unitPrice: 4.50, moq: 1, stock: 500, isAvailable: true },
                { countryCode: "CA", currencyCode: "CAD", unitPrice: 6.00, moq: 1, stock: 300, isAvailable: true }
              ]
            }
          },
          {
            name: "1kg",
            sku: "RICE-001-1KG",
            weight: 1,
            weightUnit: "kg",
            sortOrder: 2,
            isActive: true,
            countryPrices: {
              create: [
                { countryCode: "US", currencyCode: "USD", unitPrice: 8.00, moq: 1, stock: 500, isAvailable: true },
                { countryCode: "CA", currencyCode: "CAD", unitPrice: 10.50, moq: 1, stock: 300, isAvailable: true }
              ]
            }
          },
          {
            name: "2kg",
            sku: "RICE-001-2KG",
            weight: 2,
            weightUnit: "kg",
            sortOrder: 3,
            isActive: true,
            countryPrices: {
              create: [
                { countryCode: "US", currencyCode: "USD", unitPrice: 15.00, moq: 1, stock: 500, isAvailable: true },
                { countryCode: "CA", currencyCode: "CAD", unitPrice: 20.00, moq: 1, stock: 300, isAvailable: true }
              ]
            }
          }
        ]
      }
    }
  });

  // ── H. AUTOMATED VALIDATION & AUDIT ────────────────────────────────────
  console.log("\n========================================================");
  console.log("🔍 3. AUTOMATED POST-SEED VERIFICATION");
  console.log("========================================================");

  const totalUsers = await prisma.user.count();
  const superadminCount = await prisma.user.count({ where: { role: "SUPERADMIN" } });
  const b2cCount = await prisma.user.count({ where: { role: "USER" } });
  const b2bCount = await prisma.user.count({ where: { role: "B2B_USER" } });
  const warehouseCount = await prisma.warehouse.count();
  const countryCount = await prisma.country.count();
  const businessCount = await prisma.bulkBusiness.count();

  const countries = await prisma.country.findMany({ select: { code: true, name: true } });
  const warehouse = await prisma.warehouse.findFirst({ select: { name: true, country: true, code: true } });
  const b2bUserCheck = await prisma.user.findUnique({
    where: { id: b2bUser.id },
    select: { bulkBusinessId: true, role: true }
  });

  const categoryCount = await prisma.category.count();
  const parentCategoryCount = await prisma.category.count({ where: { parentId: null } });

  console.log(`• Total Users         : ${totalUsers} (Expected: 3)`);
  console.log(`• SUPERADMIN Users    : ${superadminCount} (Expected: 1)`);
  console.log(`• B2C Users           : ${b2cCount} (Expected: 1)`);
  console.log(`• B2B Users           : ${b2bCount} (Expected: 1)`);
  console.log(`• Warehouses          : ${warehouseCount} (Expected: 1 - "${warehouse?.name}")`);
  console.log(`• Businesses (B2B)    : ${businessCount} (Expected: 1)`);
  console.log(`• Countries           : ${countryCount} (Expected: 2 - ${countries.map(c => c.code).join(", ")})`);
  console.log(`• Categories          : ${categoryCount} (${parentCategoryCount} parents + subcategories)`);

  if (totalUsers !== 3) throw new Error(`Validation failed: Expected 3 users, got ${totalUsers}`);
  if (superadminCount !== 1) throw new Error(`Validation failed: Expected 1 SUPERADMIN, got ${superadminCount}`);
  if (b2cCount !== 1) throw new Error(`Validation failed: Expected 1 B2C user, got ${b2cCount}`);
  if (b2bCount !== 1) throw new Error(`Validation failed: Expected 1 B2B user, got ${b2bCount}`);
  if (warehouseCount !== 1) throw new Error(`Validation failed: Expected 1 warehouse, got ${warehouseCount}`);
  if (countryCount !== 2) throw new Error(`Validation failed: Expected 2 countries (US, CA), got ${countryCount}`);
  if (businessCount !== 1) throw new Error(`Validation failed: Expected 1 business, got ${businessCount}`);
  if (b2bUserCheck?.bulkBusinessId !== b2bBusiness.id) {
    throw new Error("Validation failed: B2B user is not linked to B2B company");
  }

  console.log("\n========================================================");
  console.log("✨ DATABASE RESET & SEED VALIDATED SUCCESSFULLY!");
  console.log("========================================================");
  console.log("🏢 Organization : Vanom Global Enterprise (VANOM-HQ)");
  console.log("🏭 Warehouse    : Main USA Warehouse (WH-USA-01 - Dallas, TX)");
  console.log("💼 B2B Business : Demo USA Wholesale Inc. (US)");
  console.log("🌎 Countries    : United States (US), Canada (CA)");
  console.log("--------------------------------------------------------");
  console.log("👥 3 DEMO ACCOUNTS CREATED:");
  console.log(`  1. SUPERADMIN : ${SUPERADMIN_EMAIL}`);
  console.log(`  2. B2C USER   : ${B2C_EMAIL}`);
  console.log(`  3. B2B USER   : ${B2B_EMAIL}`);
  console.log("========================================================\n");
}

main()
  .catch((error) => {
    console.error("❌ Seed execution error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
