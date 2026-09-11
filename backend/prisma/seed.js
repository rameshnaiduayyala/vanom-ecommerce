import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Simple Database Seed (3 Roles/Users, 3 Categories, 3 Products)...");

  // 1. Currencies & Countries
  const inr = await prisma.currency.upsert({
    where: { code: "INR" },
    update: {},
    create: { code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 2 },
  });

  const usd = await prisma.currency.upsert({
    where: { code: "USD" },
    update: {},
    create: { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 },
  });

  const inCountry = await prisma.country.upsert({
    where: { code: "IN" },
    update: {},
    create: { code: "IN", name: "India", currencyId: inr.id },
  });

  const usCountry = await prisma.country.upsert({
    where: { code: "US" },
    update: {},
    create: { code: "US", name: "United States", currencyId: usd.id },
  });

  // 2. Customer Groups
  const b2cGroup = await prisma.customerGroup.upsert({
    where: { code: "B2C" },
    update: {},
    create: { code: "B2C", name: "Retail Customers", description: "Standard retail consumers" },
  });

  const b2bGroup = await prisma.customerGroup.upsert({
    where: { code: "B2B" },
    update: {},
    create: { code: "B2B", name: "Wholesale Buyers", description: "Verified B2B bulk buyers" },
  });

  // 3. Price Lists
  const inB2CList = await prisma.priceList.upsert({
    where: { code: "IN-B2C-RETAIL" },
    update: {},
    create: {
      code: "IN-B2C-RETAIL",
      name: "India Retail B2C",
      countryId: inCountry.id,
      currencyId: inr.id,
      customerGroupId: b2cGroup.id,
      priority: 1,
    },
  });

  const inB2BList = await prisma.priceList.upsert({
    where: { code: "IN-B2B-WHOLESALE" },
    update: {},
    create: {
      code: "IN-B2B-WHOLESALE",
      name: "India Wholesale B2B",
      countryId: inCountry.id,
      currencyId: inr.id,
      customerGroupId: b2bGroup.id,
      priority: 10,
    },
  });

  // 4. Roles (3 Roles: SUPER_ADMIN, COMPANY_ADMIN, CUSTOMER)
  const roleSuperAdmin = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN", description: "Full system super administrator" },
  });

  const roleB2BAdmin = await prisma.role.upsert({
    where: { name: "COMPANY_ADMIN" },
    update: {},
    create: { name: "COMPANY_ADMIN", description: "B2B wholesale company administrator" },
  });

  const roleCustomer = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: { name: "CUSTOMER", description: "B2C retail consumer" },
  });

  // 5. 3 Users (Role-wise)
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
      customerType: "B2B",
      roles: {
        create: { roleId: roleSuperAdmin.id },
      },
      profile: { create: {} },
    },
  });

  // User 2: B2B Wholesale Buyer / Company Admin
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
      roles: {
        create: { roleId: roleB2BAdmin.id },
      },
      profile: { create: {} },
    },
  });

  // Create Company for B2B user
  await prisma.company.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      legalName: "AgroWholesale India Private Limited",
      tradingName: "AgroWholesale",
      registrationNumber: "U01100MH2020PTC345678",
      taxId: "27AAACA1234A1Z5",
      countryId: inCountry.id,
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: adminUser.id,
      members: {
        create: {
          userId: b2bUser.id,
          title: "Chief Procurement Officer",
          isPrimary: true,
          roles: { create: { roleName: "COMPANY_ADMIN" } },
        },
      },
    },
  });

  // User 3: Regular Customer
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
      roles: {
        create: { roleId: roleCustomer.id },
      },
      profile: { create: {} },
    },
  });

  // 6. 3 Categories
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
      description: "Organic staples, cold-pressed oils, Himalayan salt, and whole grains.",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    },
  });

  const cat2 = await prisma.category.upsert({
    where: { slug: "value-combos" },
    update: {},
    create: {
      name: "Value Combos & Bundles",
      slug: "value-combos",
      description: "Super-saver multi-packs and curated bundle savings.",
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    },
  });

  const cat3 = await prisma.category.upsert({
    where: { slug: "gardening-supplies" },
    update: {},
    create: {
      name: "Gardening Supplies",
      slug: "gardening-supplies",
      description: "Organic nutrient-rich soils, fertilizers, and horticultural containers.",
      imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
    },
  });

  // 7. 3 Products

  // Product 1: Pure Organic Kashmiri Saffron
  const product1 = await prisma.product.upsert({
    where: { slug: "pure-kashmiri-saffron" },
    update: {},
    create: {
      name: "Pure Organic Kashmiri Saffron 1g",
      slug: "pure-kashmiri-saffron",
      sku: "GROC-SAFF-1G",
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
    update: {},
    create: {
      productId: product1.id,
      sku: "GROC-SAFF-1G-PACK",
      name: "1g Sealed Bottle",
      status: "ACTIVE",
      weight: new Prisma.Decimal("0.05"),
    },
  });

  await prisma.productPrice.createMany({
    data: [
      { productId: product1.id, variantId: variant1.id, priceListId: inB2CList.id, currencyId: inr.id, amount: new Prisma.Decimal("499.00"), minQuantity: 1 },
      { productId: product1.id, variantId: variant1.id, priceListId: inB2BList.id, currencyId: inr.id, amount: new Prisma.Decimal("380.00"), minQuantity: 10 },
    ],
  });

  // Product 2: Immunity Booster Duo Pack (Combo)
  const product2 = await prisma.product.upsert({
    where: { slug: "immunity-booster-combo" },
    update: {},
    create: {
      name: "Immunity Booster Duo Pack",
      slug: "immunity-booster-combo",
      sku: "CMB-IMMUNITY-01",
      brandId: brand.id,
      status: "ACTIVE",
      isFeatured: true,
      description: "Kadha Herbal Sips (30 Sachets) + 100% Raw Forest Honey (500g).",
      categories: { create: { categoryId: cat2.id } },
    },
  });

  const variant2 = await prisma.productVariant.upsert({
    where: { sku: "CMB-IMMUNITY-01-BOX" },
    update: {},
    create: {
      productId: product2.id,
      sku: "CMB-IMMUNITY-01-BOX",
      name: "Duo Pack Bundle",
      status: "ACTIVE",
      weight: new Prisma.Decimal("0.85"),
    },
  });

  await prisma.productPrice.createMany({
    data: [
      { productId: product2.id, variantId: variant2.id, priceListId: inB2CList.id, currencyId: inr.id, amount: new Prisma.Decimal("699.00"), minQuantity: 1 },
      { productId: product2.id, variantId: variant2.id, priceListId: inB2BList.id, currencyId: inr.id, amount: new Prisma.Decimal("520.00"), minQuantity: 10 },
    ],
  });

  // Product 3: Premium Organic Garden Soil
  const product3 = await prisma.product.upsert({
    where: { slug: "premium-organic-garden-soil" },
    update: {},
    create: {
      name: "Premium Organic Garden Soil (50 KG Sack)",
      slug: "premium-organic-garden-soil",
      sku: "SOIL-PREM-50KG",
      brandId: brand.id,
      status: "ACTIVE",
      isBestSeller: true,
      description: "Nutrient-rich potting mix with vermicompost, coco peat, and organic bio-fertilizers.",
      categories: { create: { categoryId: cat3.id } },
    },
  });

  const variant3 = await prisma.productVariant.upsert({
    where: { sku: "SOIL-50KG-SACK" },
    update: {},
    create: {
      productId: product3.id,
      sku: "SOIL-50KG-SACK",
      name: "50 KG Commercial Sack",
      status: "ACTIVE",
      weight: new Prisma.Decimal("50.00"),
    },
  });

  await prisma.productPrice.createMany({
    data: [
      { productId: product3.id, variantId: variant3.id, priceListId: inB2CList.id, currencyId: inr.id, amount: new Prisma.Decimal("499.00"), minQuantity: 1 },
      { productId: product3.id, variantId: variant3.id, priceListId: inB2BList.id, currencyId: inr.id, amount: new Prisma.Decimal("360.00"), minQuantity: 20 },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log("------------------------------------------");
  console.log("👥 3 USERS (Password: Password123!):");
  console.log("  1. SUPER_ADMIN   : admin@vanom.com");
  console.log("  2. COMPANY_ADMIN : buyer@agrowholesale.in");
  console.log("  3. CUSTOMER      : customer@vanom.com");
  console.log("------------------------------------------");
  console.log("📂 3 CATEGORIES:");
  console.log("  1. Groceries & Superfoods (slug: groceries)");
  console.log("  2. Value Combos & Bundles (slug: value-combos)");
  console.log("  3. Gardening Supplies (slug: gardening-supplies)");
  console.log("------------------------------------------");
  console.log("📦 3 PRODUCTS:");
  console.log("  1. Pure Organic Kashmiri Saffron 1g (slug: pure-kashmiri-saffron)");
  console.log("  2. Immunity Booster Duo Pack (slug: immunity-booster-combo)");
  console.log("  3. Premium Organic Garden Soil (slug: premium-organic-garden-soil)");
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
