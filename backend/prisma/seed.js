import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed for updated schema (USA + Canada, USD + CAD, B2C + B2B)...");

  // 1. Countries
  const usCountry = await prisma.country.upsert({
    where: { code: "US" },
    update: { currency: "USD", name: "United States" },
    create: { code: "US", name: "United States", currency: "USD", active: true },
  });

  const caCountry = await prisma.country.upsert({
    where: { code: "CA" },
    update: { currency: "CAD", name: "Canada" },
    create: { code: "CA", name: "Canada", currency: "CAD", active: true },
  });

  // 1.1 States / Provinces
  await prisma.stateProvince.upsert({
    where: { countryId_code: { countryId: usCountry.id, code: "NY" } },
    update: {},
    create: { countryId: usCountry.id, code: "NY", name: "New York", active: true },
  });

  await prisma.stateProvince.upsert({
    where: { countryId_code: { countryId: usCountry.id, code: "CA" } },
    update: {},
    create: { countryId: usCountry.id, code: "CA", name: "California", active: true },
  });

  await prisma.stateProvince.upsert({
    where: { countryId_code: { countryId: caCountry.id, code: "ON" } },
    update: {},
    create: { countryId: caCountry.id, code: "ON", name: "Ontario", active: true },
  });

  // 2. Warehouses
  const usWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-US-EAST" },
    update: {},
    create: {
      code: "WH-US-EAST",
      name: "US East Coast Logistics Hub",
      countryId: usCountry.id,
      active: true,
    },
  });

  const caWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-CA-TORONTO" },
    update: {},
    create: {
      code: "WH-CA-TORONTO",
      name: "Toronto Central Fulfillment Center",
      countryId: caCountry.id,
      active: true,
    },
  });

  // 3. Roles
  const roleSuperAdmin = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN", description: "Full system super administrator" },
  });

  const roleAdmin = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Operations and catalog administrator" },
  });

  const roleCustomer = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: { name: "CUSTOMER", description: "B2C retail consumer" },
  });

  const roleBusinessUser = await prisma.role.upsert({
    where: { name: "BUSINESS_USER" },
    update: {},
    create: { name: "BUSINESS_USER", description: "B2B enterprise member" },
  });

  // 4. Users
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // User 1: Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@vanom.com" },
    update: {},
    create: {
      email: "admin@vanom.com",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      status: "ACTIVE",
      customerType: "B2C",
      preferredCurrency: "USD",
      roles: {
        create: [
          { roleId: roleSuperAdmin.id },
          { roleId: roleAdmin.id }
        ],
      },
    },
  });

  // User 2: B2B Business Buyer
  const b2bUser = await prisma.user.upsert({
    where: { email: "buyer@agrowholesale.in" },
    update: {},
    create: {
      email: "buyer@agrowholesale.in",
      passwordHash,
      firstName: "Ramesh",
      lastName: "Patel",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      status: "ACTIVE",
      customerType: "B2B",
      preferredCurrency: "USD",
      roles: {
        create: { roleId: roleBusinessUser.id },
      },
    },
  });

  // User 3: Regular Retail Customer
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@vanom.com" },
    update: {},
    create: {
      email: "customer@vanom.com",
      passwordHash,
      firstName: "Ramesh",
      lastName: "Ayyala",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
      status: "ACTIVE",
      customerType: "B2C",
      preferredCurrency: "USD",
      roles: {
        create: { roleId: roleCustomer.id },
      },
    },
  });

  // 5. B2B Business Account
  await prisma.business.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      legalName: "AgroWholesale North America Corp",
      tradingName: "AgroWholesale",
      registrationNumber: "US-CORP-991283",
      taxId: "EIN-88291039",
      countryId: usCountry.id,
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: adminUser.id,
      paymentTermsDays: 30,
      creditLimit: new Prisma.Decimal("50000.00"),
      members: {
        create: {
          userId: b2bUser.id,
          role: "OWNER",
          title: "Chief Procurement Officer",
          isPrimary: true,
        },
      },
    },
  });

  // 6. Brand & Categories
  const brand = await prisma.brand.upsert({
    where: { slug: "vanom-organics" },
    update: {},
    create: { name: "Vanom Organics", slug: "vanom-organics" },
  });

  const cat1 = await prisma.category.upsert({
    where: { slug: "groceries" },
    update: {},
    create: {
      name: "Groceries & Superfoods",
      slug: "groceries",
      description: "Organic staples, cold-pressed oils, and superfoods.",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    },
  });

  const cat2 = await prisma.category.upsert({
    where: { slug: "value-combos" },
    update: {},
    create: {
      name: "Value Combos & Bundles",
      slug: "value-combos",
      description: "Super-saver multi-packs and bundle savings.",
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    },
  });

  const cat3 = await prisma.category.upsert({
    where: { slug: "gardening-supplies" },
    update: {},
    create: {
      name: "Gardening Supplies",
      slug: "gardening-supplies",
      description: "Organic soils, nutrient-rich potting mixes, and amendments.",
      imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
    },
  });

  // 7. Products, Variants & Listings with B2C/B2B Prices
  // Product 1: Pure Organic Kashmiri Saffron
  const product1 = await prisma.product.upsert({
    where: { slug: "pure-kashmiri-saffron" },
    update: { status: "ACTIVE" },
    create: {
      name: "Pure Organic Kashmiri Saffron 1g",
      slug: "pure-kashmiri-saffron",
      brandId: brand.id,
      status: "ACTIVE",
      isFeatured: true,
      isBestSeller: true,
      description: "Grade A1 Super Mongra natural aromatic saffron stigmas.",
      categories: { create: { categoryId: cat1.id } },
    },
  });

  const variant1 = await prisma.productVariant.upsert({
    where: { sku: "GROC-SAFF-1G-PACK" },
    update: { status: "ACTIVE" },
    create: {
      productId: product1.id,
      sku: "GROC-SAFF-1G-PACK",
      name: "1g Sealed Bottle",
      status: "ACTIVE",
      weight: new Prisma.Decimal("0.05"),
    },
  });

  // B2C Listing & Prices
  await prisma.b2CProductListing.upsert({
    where: { productId: product1.id },
    update: {},
    create: {
      productId: product1.id,
      status: "ACTIVE",
      prices: {
        create: [
          { variantId: variant1.id, currency: "USD", price: new Prisma.Decimal("12.99"), compareAt: new Prisma.Decimal("15.99") },
          { variantId: variant1.id, currency: "CAD", price: new Prisma.Decimal("17.50"), compareAt: new Prisma.Decimal("21.50") },
        ],
      },
    },
  });

  // B2B Listing & Prices
  let b2bListing1 = await prisma.b2BProductListing.findFirst({ where: { productId: product1.id, businessId: null } });
  if (!b2bListing1) {
    b2bListing1 = await prisma.b2BProductListing.create({
      data: {
        productId: product1.id,
        status: "ACTIVE",
        moq: 10,
        leadTimeDays: 3,
        prices: {
          create: [
            { variantId: variant1.id, currency: "USD", unitPrice: new Prisma.Decimal("9.50") },
            { variantId: variant1.id, currency: "CAD", unitPrice: new Prisma.Decimal("12.80") },
          ],
        },
        tiers: {
          create: [
            { tierNumber: 1, name: "Tier 1 (10-49)", minQuantity: 10, maxQuantity: 49, discountType: "PERCENTAGE", discountValue: new Prisma.Decimal("0.05") },
            { tierNumber: 2, name: "Tier 2 (50+)", minQuantity: 50, discountType: "PERCENTAGE", discountValue: new Prisma.Decimal("0.12") },
          ],
        },
      },
    });
  }

  // Product 2: Immunity Booster Duo Pack
  const product2 = await prisma.product.upsert({
    where: { slug: "immunity-booster-combo" },
    update: { status: "ACTIVE" },
    create: {
      name: "Immunity Booster Duo Pack",
      slug: "immunity-booster-combo",
      brandId: brand.id,
      status: "ACTIVE",
      isFeatured: true,
      description: "Kadha Herbal Sips (30 Sachets) + 100% Raw Forest Honey (500g).",
      categories: { create: { categoryId: cat2.id } },
    },
  });

  const variant2 = await prisma.productVariant.upsert({
    where: { sku: "CMB-IMMUNITY-01-BOX" },
    update: { status: "ACTIVE" },
    create: {
      productId: product2.id,
      sku: "CMB-IMMUNITY-01-BOX",
      name: "Duo Pack Bundle",
      status: "ACTIVE",
      weight: new Prisma.Decimal("0.85"),
    },
  });

  await prisma.b2CProductListing.upsert({
    where: { productId: product2.id },
    update: {},
    create: {
      productId: product2.id,
      status: "ACTIVE",
      prices: {
        create: [
          { variantId: variant2.id, currency: "USD", price: new Prisma.Decimal("18.99") },
          { variantId: variant2.id, currency: "CAD", price: new Prisma.Decimal("25.50") },
        ],
      },
    },
  });

  let b2bListing2 = await prisma.b2BProductListing.findFirst({ where: { productId: product2.id, businessId: null } });
  if (!b2bListing2) {
    b2bListing2 = await prisma.b2BProductListing.create({
      data: {
        productId: product2.id,
        status: "ACTIVE",
        moq: 10,
        leadTimeDays: 5,
        prices: {
          create: [
            { variantId: variant2.id, currency: "USD", unitPrice: new Prisma.Decimal("14.00") },
            { variantId: variant2.id, currency: "CAD", unitPrice: new Prisma.Decimal("18.90") },
          ],
        },
      },
    });
  }

  // Product 3: Premium Organic Garden Soil
  const product3 = await prisma.product.upsert({
    where: { slug: "premium-organic-garden-soil" },
    update: { status: "ACTIVE" },
    create: {
      name: "Premium Organic Garden Soil (50 KG Sack)",
      slug: "premium-organic-garden-soil",
      brandId: brand.id,
      status: "ACTIVE",
      isBestSeller: true,
      description: "Nutrient-rich potting mix with vermicompost, coco peat, and organic bio-fertilizers.",
      categories: { create: { categoryId: cat3.id } },
    },
  });

  const variant3 = await prisma.productVariant.upsert({
    where: { sku: "SOIL-50KG-SACK" },
    update: { status: "ACTIVE" },
    create: {
      productId: product3.id,
      sku: "SOIL-50KG-SACK",
      name: "50 KG Commercial Sack",
      status: "ACTIVE",
      weight: new Prisma.Decimal("50.00"),
    },
  });

  await prisma.b2CProductListing.upsert({
    where: { productId: product3.id },
    update: {},
    create: {
      productId: product3.id,
      status: "ACTIVE",
      prices: {
        create: [
          { variantId: variant3.id, currency: "USD", price: new Prisma.Decimal("24.99") },
          { variantId: variant3.id, currency: "CAD", price: new Prisma.Decimal("33.50") },
        ],
      },
    },
  });

  let b2bListing3 = await prisma.b2BProductListing.findFirst({ where: { productId: product3.id, businessId: null } });
  if (!b2bListing3) {
    b2bListing3 = await prisma.b2BProductListing.create({
      data: {
        productId: product3.id,
        status: "ACTIVE",
        moq: 20,
        leadTimeDays: 7,
        prices: {
          create: [
            { variantId: variant3.id, currency: "USD", unitPrice: new Prisma.Decimal("18.00") },
            { variantId: variant3.id, currency: "CAD", unitPrice: new Prisma.Decimal("24.00") },
          ],
        },
        tiers: {
          create: [
            { tierNumber: 1, name: "Tier 1 (20-49)", minQuantity: 20, maxQuantity: 49, discountType: "PERCENTAGE", discountValue: new Prisma.Decimal("0.0833") },
            { tierNumber: 2, name: "Tier 2 (50-99)", minQuantity: 50, maxQuantity: 99, discountType: "PERCENTAGE", discountValue: new Prisma.Decimal("0.15") },
            { tierNumber: 3, name: "Tier 3 (100+)", minQuantity: 100, discountType: "PERCENTAGE", discountValue: new Prisma.Decimal("0.22") },
          ],
        },
      },
    });
  }

  // 8. Files & Images
  await prisma.productImage.deleteMany();
  await prisma.fileAsset.deleteMany({ where: { type: "PRODUCT_IMAGE" } });

  const file1 = await prisma.fileAsset.create({
    data: {
      type: "PRODUCT_IMAGE",
      fileName: "saffron-mongra.jpg",
      storageKey: "prod_saffron_01.jpg",
      url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      mimeType: "image/jpeg",
      sizeBytes: BigInt(245000),
    },
  });
  await prisma.productImage.create({
    data: {
      productId: product1.id,
      variantId: variant1.id,
      fileAssetId: file1.id,
      altText: "Pure Organic Kashmiri Saffron 1g",
    },
  });

  const file2 = await prisma.fileAsset.create({
    data: {
      type: "PRODUCT_IMAGE",
      fileName: "immunity-booster.jpg",
      storageKey: "prod_immunity_01.jpg",
      url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
      mimeType: "image/jpeg",
      sizeBytes: BigInt(310000),
    },
  });
  await prisma.productImage.create({
    data: {
      productId: product2.id,
      variantId: variant2.id,
      fileAssetId: file2.id,
      altText: "Immunity Booster Duo Pack",
    },
  });

  const file3 = await prisma.fileAsset.create({
    data: {
      type: "PRODUCT_IMAGE",
      fileName: "garden-soil.jpg",
      storageKey: "prod_soil_01.jpg",
      url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
      mimeType: "image/jpeg",
      sizeBytes: BigInt(450000),
    },
  });
  await prisma.productImage.create({
    data: {
      productId: product3.id,
      variantId: variant3.id,
      fileAssetId: file3.id,
      altText: "Premium Organic Garden Soil 50KG",
    },
  });

  // 9. Inventory Items
  await prisma.inventoryItem.deleteMany();
  await prisma.inventoryItem.createMany({
    data: [
      { warehouseId: usWarehouse.id, variantId: variant1.id, onHand: 150, reserved: 15, available: 135 },
      { warehouseId: caWarehouse.id, variantId: variant1.id, onHand: 80, reserved: 5, available: 75 },
      { warehouseId: usWarehouse.id, variantId: variant2.id, onHand: 95, reserved: 10, available: 85 },
      { warehouseId: caWarehouse.id, variantId: variant2.id, onHand: 45, reserved: 0, available: 45 },
      { warehouseId: usWarehouse.id, variantId: variant3.id, onHand: 240, reserved: 30, available: 210 },
      { warehouseId: caWarehouse.id, variantId: variant3.id, onHand: 110, reserved: 10, available: 100 },
    ],
  });

  // 10. Sample Orders
  await prisma.order.upsert({
    where: { orderNumber: "ORD-2026-8801" },
    update: {},
    create: {
      orderNumber: "ORD-2026-8801",
      userId: customerUser.id,
      customerType: "B2C",
      channel: "B2C",
      source: "WEB",
      status: "PROCESSING",
      countryId: usCountry.id,
      currency: "USD",
      subtotal: new Prisma.Decimal("31.98"),
      discountAmount: new Prisma.Decimal("0.00"),
      shippingAmount: new Prisma.Decimal("5.00"),
      taxAmount: new Prisma.Decimal("2.80"),
      totalAmount: new Prisma.Decimal("39.78"),
      billingAddress: {
        name: "Ramesh Ayyala",
        line1: "124 Grand Avenue",
        city: "Austin",
        stateCode: "TX",
        postalCode: "78701",
        country: "United States",
      },
      shippingAddress: {
        name: "Ramesh Ayyala",
        line1: "124 Grand Avenue",
        city: "Austin",
        stateCode: "TX",
        postalCode: "78701",
        country: "United States",
      },
      customerSnapshot: {
        id: customerUser.id,
        email: customerUser.email,
        firstName: customerUser.firstName,
        lastName: customerUser.lastName,
      },
      placedAt: new Date(Date.now() - 86400000 * 2),
      items: {
        create: [
          {
            productId: product1.id,
            variantId: variant1.id,
            productNameSnapshot: "Pure Organic Kashmiri Saffron 1g",
            skuSnapshot: "GROC-SAFF-1G-PACK",
            quantity: 1,
            unitPrice: new Prisma.Decimal("12.99"),
            subtotal: new Prisma.Decimal("12.99"),
            totalAmount: new Prisma.Decimal("12.99"),
            currency: "USD",
          },
          {
            productId: product2.id,
            variantId: variant2.id,
            productNameSnapshot: "Immunity Booster Duo Pack",
            skuSnapshot: "CMB-IMMUNITY-01-BOX",
            quantity: 1,
            unitPrice: new Prisma.Decimal("18.99"),
            subtotal: new Prisma.Decimal("18.99"),
            totalAmount: new Prisma.Decimal("18.99"),
            currency: "USD",
          },
        ],
      },
    },
  });

  // 11. Sample Coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off storewide discount",
      status: "ACTIVE",
      discountType: "PERCENTAGE",
      discountValue: new Prisma.Decimal("10.00"),
      minOrderValue: new Prisma.Decimal("20.00"),
      maxDiscount: new Prisma.Decimal("50.00"),
      usageLimit: 1000,
    },
  });

  console.log("✅ Seed completed successfully with updated schema!");
  console.log("------------------------------------------");
  console.log("👥 USERS (Password: Password123!):");
  console.log("  1. SUPER_ADMIN   : admin@vanom.com");
  console.log("  2. B2B OWNER     : buyer@agrowholesale.in");
  console.log("  3. CUSTOMER      : customer@vanom.com");
  console.log("------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
