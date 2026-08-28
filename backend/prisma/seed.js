import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Enterprise Ecommerce Database Seed...");

  // 1. Currencies
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

  const gbp = await prisma.currency.upsert({
    where: { code: "GBP" },
    update: {},
    create: { code: "GBP", name: "British Pound", symbol: "£", decimals: 2 },
  });

  // 2. Countries
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

  const gbCountry = await prisma.country.upsert({
    where: { code: "GB" },
    update: {},
    create: { code: "GB", name: "United Kingdom", currencyId: gbp.id },
  });

  // 3. Customer Groups
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

  // 4. Permissions
  const permissionsList = [
    { code: "catalog.read", description: "View products and categories" },
    { code: "catalog.create", description: "Create products" },
    { code: "catalog.update", description: "Update products" },
    { code: "catalog.delete", description: "Delete products" },
    { code: "pricing.read", description: "View price lists" },
    { code: "pricing.create", description: "Create price lists" },
    { code: "pricing.update", description: "Update price rules" },
    { code: "inventory.read", description: "View inventory" },
    { code: "inventory.adjust", description: "Adjust stock" },
    { code: "inventory.transfer", description: "Transfer stock" },
    { code: "orders.read", description: "Read orders" },
    { code: "orders.create", description: "Create orders" },
    { code: "orders.update", description: "Update orders" },
    { code: "orders.cancel", description: "Cancel orders" },
    { code: "companies.read", description: "Read companies" },
    { code: "companies.create", description: "Register companies" },
    { code: "companies.update", description: "Update companies" },
    { code: "companies.approve", description: "Approve companies" },
    { code: "companies.reject", description: "Reject companies" },
    { code: "quotes.read", description: "Read quotes" },
    { code: "quotes.create", description: "Request quotes" },
    { code: "quotes.update", description: "Manage quotes" },
    { code: "quotes.approve", description: "Approve quotes" },
    { code: "payments.read", description: "Read payments" },
    { code: "payments.refund", description: "Refund payments" },
    { code: "admin.dashboard", description: "Access admin dashboard" },
    { code: "admin.users", description: "Manage users" },
    { code: "admin.companies", description: "Manage companies" },
    { code: "admin.pricing", description: "Manage enterprise pricing" },
    { code: "admin.inventory", description: "Manage warehouse inventory" },
    { code: "admin.orders", description: "Manage all orders" },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  // 5. Roles
  const rolesList = [
    "CUSTOMER",
    "COMPANY_ADMIN",
    "COMPANY_BUYER",
    "SALES",
    "INVENTORY_MANAGER",
    "FINANCE",
    "ADMIN",
    "SUPER_ADMIN",
  ];

  for (const roleName of rolesList) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    });

    if (roleName === "ADMIN" || roleName === "SUPER_ADMIN") {
      const allPerms = await prisma.permission.findMany();
      for (const p of allPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
          update: {},
          create: { roleId: role.id, permissionId: p.id },
        });
      }
    }
  }

  // 6. Units and Packaging Types
  const sackUnit = await prisma.unitOfMeasure.upsert({
    where: { code: "SACK" },
    update: {},
    create: { code: "SACK", name: "Sack", decimals: 0 },
  });

  const pieceUnit = await prisma.unitOfMeasure.upsert({
    where: { code: "PCS" },
    update: {},
    create: { code: "PCS", name: "Piece", decimals: 0 },
  });

  const palletPackagingType = await prisma.packagingType.upsert({
    where: { code: "PALLET" },
    update: {},
    create: { code: "PALLET", name: "Standard Industrial Pallet" },
  });

  const boxPackagingType = await prisma.packagingType.upsert({
    where: { code: "BOX" },
    update: {},
    create: { code: "BOX", name: "Corrugated Box" },
  });

  // 7. Warehouses
  const mumbaiWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-IN-MUM" },
    update: {},
    create: {
      code: "WH-IN-MUM",
      name: "Mumbai Central Warehouse",
      countryId: inCountry.id,
      addressLine1: "Plot 42, Logistics Park, Bhiwandi",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "421302",
    },
  });

  const dallasWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-US-DFW" },
    update: {},
    create: {
      code: "WH-US-DFW",
      name: "Dallas Fulfillment Hub",
      countryId: usCountry.id,
      addressLine1: "1200 Logistics Blvd",
      city: "Dallas",
      state: "TX",
      postalCode: "75261",
    },
  });

  const londonWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-GB-LON" },
    update: {},
    create: {
      code: "WH-GB-LON",
      name: "London Distribution Hub",
      countryId: gbCountry.id,
      addressLine1: "Unit 7, Heathrow Cargo Terminal",
      city: "London",
      postalCode: "TW6 2GW",
    },
  });

  // 8. Categories & Brands
  const gardenCategory = await prisma.category.upsert({
    where: { slug: "gardening-supplies" },
    update: {},
    create: { name: "Gardening Supplies", slug: "gardening-supplies" },
  });

  const potCategory = await prisma.category.upsert({
    where: { slug: "pots-and-planters" },
    update: {},
    create: { name: "Pots & Planters", slug: "pots-and-planters" },
  });

  const vanomBrand = await prisma.brand.upsert({
    where: { slug: "vanom-commercial" },
    update: {},
    create: { name: "Vanom Commercial", slug: "vanom-commercial" },
  });

  // 9. Price Lists (B2C and B2B per country)
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

  const usB2CList = await prisma.priceList.upsert({
    where: { code: "US-B2C-RETAIL" },
    update: {},
    create: {
      code: "US-B2C-RETAIL",
      name: "USA Retail B2C",
      countryId: usCountry.id,
      currencyId: usd.id,
      customerGroupId: b2cGroup.id,
      priority: 1,
    },
  });

  const usB2BList = await prisma.priceList.upsert({
    where: { code: "US-B2B-WHOLESALE" },
    update: {},
    create: {
      code: "US-B2B-WHOLESALE",
      name: "USA Wholesale B2B",
      countryId: usCountry.id,
      currencyId: usd.id,
      customerGroupId: b2bGroup.id,
      priority: 10,
    },
  });

  const gbB2CList = await prisma.priceList.upsert({
    where: { code: "GB-B2C-RETAIL" },
    update: {},
    create: {
      code: "GB-B2C-RETAIL",
      name: "UK Retail B2C",
      countryId: gbCountry.id,
      currencyId: gbp.id,
      customerGroupId: b2cGroup.id,
      priority: 1,
    },
  });

  const gbB2BList = await prisma.priceList.upsert({
    where: { code: "GB-B2B-WHOLESALE" },
    update: {},
    create: {
      code: "GB-B2B-WHOLESALE",
      name: "UK Wholesale B2B",
      countryId: gbCountry.id,
      currencyId: gbp.id,
      customerGroupId: b2bGroup.id,
      priority: 10,
    },
  });

  // 10. Products & Multi-Tier Pricing
  // Product 1: Premium Garden Soil
  const soilProduct = await prisma.product.upsert({
    where: { slug: "premium-garden-soil" },
    update: {},
    create: {
      name: "Premium Garden Soil",
      slug: "premium-garden-soil",
      sku: "SOIL-PREM-BASE",
      brandId: vanomBrand.id,
      status: "ACTIVE",
      description: "Organic nutrient-rich garden soil suitable for commercial nurseries and home gardening.",
      categories: { create: { categoryId: gardenCategory.id } },
    },
  });

  const soilVariant = await prisma.productVariant.upsert({
    where: { sku: "SOIL-50KG-SACK" },
    update: {},
    create: {
      productId: soilProduct.id,
      sku: "SOIL-50KG-SACK",
      name: "Premium Garden Soil - 50 KG Sack",
      status: "ACTIVE",
      weight: new Prisma.Decimal("50.00"),
    },
  });

  // Packaging & Pallet: 40 Sacks / Pallet
  const soilPackaging = await prisma.productPackaging.create({
    data: {
      variantId: soilVariant.id,
      unitId: sackUnit.id,
      packagingTypeId: palletPackagingType.id,
      quantityPerPackage: 1,
      isDefault: true,
      pallet: {
        create: {
          packagesPerPallet: 40,
          maxWeight: new Prisma.Decimal("2000.00"),
        },
      },
    },
  });

  // Inventory in Mumbai & Dallas
  await prisma.inventoryItem.upsert({
    where: {
      warehouseId_locationId_variantId: {
        warehouseId: mumbaiWarehouse.id,
        locationId: "",
        variantId: soilVariant.id,
      },
    },
    update: {},
    create: {
      warehouseId: mumbaiWarehouse.id,
      locationId: null,
      variantId: soilVariant.id,
      productId: soilProduct.id,
      onHand: 5000,
      reserved: 0,
    },
  });

  await prisma.inventoryItem.upsert({
    where: {
      warehouseId_locationId_variantId: {
        warehouseId: dallasWarehouse.id,
        locationId: "",
        variantId: soilVariant.id,
      },
    },
    update: {},
    create: {
      warehouseId: dallasWarehouse.id,
      locationId: null,
      variantId: soilVariant.id,
      productId: soilProduct.id,
      onHand: 3000,
      reserved: 0,
    },
  });

  // Prices for Soil:
  // India B2C: ₹499
  await prisma.productPrice.create({
    data: {
      productId: soilProduct.id,
      variantId: soilVariant.id,
      priceListId: inB2CList.id,
      currencyId: inr.id,
      amount: new Prisma.Decimal("499.00"),
      minQuantity: 1,
    },
  });

  // India B2B Tiers: 20-49: ₹420 (MOQ = 20), 50-99: ₹390, 100+: ₹350
  await prisma.productPrice.createMany({
    data: [
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: inB2BList.id, currencyId: inr.id, amount: new Prisma.Decimal("420.00"), minQuantity: 20, maxQuantity: 49 },
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: inB2BList.id, currencyId: inr.id, amount: new Prisma.Decimal("390.00"), minQuantity: 50, maxQuantity: 99 },
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: inB2BList.id, currencyId: inr.id, amount: new Prisma.Decimal("350.00"), minQuantity: 100, maxQuantity: null },
    ],
  });

  // USA B2C: $19.99
  await prisma.productPrice.create({
    data: {
      productId: soilProduct.id,
      variantId: soilVariant.id,
      priceListId: usB2CList.id,
      currencyId: usd.id,
      amount: new Prisma.Decimal("19.99"),
      minQuantity: 1,
    },
  });

  // USA B2B: 20-49: $16.50, 50-99: $14.90, 100+: $13.50
  await prisma.productPrice.createMany({
    data: [
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: usB2BList.id, currencyId: usd.id, amount: new Prisma.Decimal("16.50"), minQuantity: 20, maxQuantity: 49 },
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: usB2BList.id, currencyId: usd.id, amount: new Prisma.Decimal("14.90"), minQuantity: 50, maxQuantity: 99 },
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: usB2BList.id, currencyId: usd.id, amount: new Prisma.Decimal("13.50"), minQuantity: 100, maxQuantity: null },
    ],
  });

  // UK B2C: £17.99
  await prisma.productPrice.create({
    data: {
      productId: soilProduct.id,
      variantId: soilVariant.id,
      priceListId: gbB2CList.id,
      currencyId: gbp.id,
      amount: new Prisma.Decimal("17.99"),
      minQuantity: 1,
    },
  });

  // UK B2B: 20-49: £14.90, 50-99: £13.40, 100+: £12.20
  await prisma.productPrice.createMany({
    data: [
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: gbB2BList.id, currencyId: gbp.id, amount: new Prisma.Decimal("14.90"), minQuantity: 20, maxQuantity: 49 },
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: gbB2BList.id, currencyId: gbp.id, amount: new Prisma.Decimal("13.40"), minQuantity: 50, maxQuantity: 99 },
      { productId: soilProduct.id, variantId: soilVariant.id, priceListId: gbB2BList.id, currencyId: gbp.id, amount: new Prisma.Decimal("12.20"), minQuantity: 100, maxQuantity: null },
    ],
  });

  // Product 2: Premium Ceramic Pot
  const potProduct = await prisma.product.upsert({
    where: { slug: "premium-ceramic-pot" },
    update: {},
    create: {
      name: "Premium Ceramic Pot",
      slug: "premium-ceramic-pot",
      sku: "POT-CERAM-BASE",
      brandId: vanomBrand.id,
      status: "ACTIVE",
      description: "Glazed ceramic pot with drainage system.",
      categories: { create: { categoryId: potCategory.id } },
    },
  });

  const potVariant = await prisma.productVariant.upsert({
    where: { sku: "POT-CERAM-12IN" },
    update: {},
    create: {
      productId: potProduct.id,
      sku: "POT-CERAM-12IN",
      name: "12-Inch Glazed Ceramic Pot",
      status: "ACTIVE",
      weight: new Prisma.Decimal("4.50"),
    },
  });

  await prisma.productPrice.createMany({
    data: [
      { productId: potProduct.id, variantId: potVariant.id, priceListId: inB2CList.id, currencyId: inr.id, amount: new Prisma.Decimal("899.00"), minQuantity: 1 },
      { productId: potProduct.id, variantId: potVariant.id, priceListId: inB2BList.id, currencyId: inr.id, amount: new Prisma.Decimal("650.00"), minQuantity: 10 },
      { productId: potProduct.id, variantId: potVariant.id, priceListId: usB2CList.id, currencyId: usd.id, amount: new Prisma.Decimal("29.99"), minQuantity: 1 },
      { productId: potProduct.id, variantId: potVariant.id, priceListId: usB2BList.id, currencyId: usd.id, amount: new Prisma.Decimal("22.00"), minQuantity: 10 },
    ],
  });

  // Product 3: Indoor Foliage Plant
  const plantProduct = await prisma.product.upsert({
    where: { slug: "indoor-foliage-plant" },
    update: {},
    create: {
      name: "Indoor Foliage Plant",
      slug: "indoor-foliage-plant",
      sku: "PLANT-FOLIAGE-BASE",
      brandId: vanomBrand.id,
      status: "ACTIVE",
      description: "Air-purifying indoor ornamental foliage plant.",
      categories: { create: { categoryId: gardenCategory.id } },
    },
  });

  const plantVariant = await prisma.productVariant.upsert({
    where: { sku: "PLANT-MONSTERA-MED" },
    update: {},
    create: {
      productId: plantProduct.id,
      sku: "PLANT-MONSTERA-MED",
      name: "Monstera Deliciosa - Medium",
      status: "ACTIVE",
      weight: new Prisma.Decimal("2.00"),
    },
  });

  await prisma.productPrice.createMany({
    data: [
      { productId: plantProduct.id, variantId: plantVariant.id, priceListId: inB2CList.id, currencyId: inr.id, amount: new Prisma.Decimal("349.00"), minQuantity: 1 },
      { productId: plantProduct.id, variantId: plantVariant.id, priceListId: inB2BList.id, currencyId: inr.id, amount: new Prisma.Decimal("240.00"), minQuantity: 15 },
    ],
  });

  // 11. Demo Admin User
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@vanom.com" },
    update: {},
    create: {
      email: "admin@vanom.com",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      status: "ACTIVE",
      customerType: "B2B",
      roles: {
        create: {
          role: { connect: { name: "SUPER_ADMIN" } },
        },
      },
      profile: { create: {} },
    },
  });

  // 12. Demo Approved B2B Wholesale Company
  const b2bUser = await prisma.user.upsert({
    where: { email: "buyer@agrowholesale.in" },
    update: {},
    create: {
      email: "buyer@agrowholesale.in",
      passwordHash,
      firstName: "Ramesh",
      lastName: "Patel",
      status: "ACTIVE",
      customerType: "B2B",
      roles: {
        create: {
          role: { connect: { name: "COMPANY_ADMIN" } },
        },
      },
      profile: { create: {} },
    },
  });

  const demoCompany = await prisma.company.upsert({
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
      paymentTermsDays: 30,
      creditLimit: new Prisma.Decimal("500000.00"),
      members: {
        create: {
          userId: b2bUser.id,
          title: "Chief Procurement Officer",
          isPrimary: true,
          roles: { create: { roleName: "COMPANY_ADMIN" } },
        },
      },
      verification: {
        create: {
          status: "APPROVED",
          submittedAt: new Date(),
          decidedAt: new Date(),
          decisionReason: "Verified with Ministry of Corporate Affairs and GST portal.",
          reviews: {
            create: {
              reviewerId: adminUser.id,
              decision: "APPROVED",
              notes: "All official compliance documents verified.",
            },
          },
        },
      },
    },
  });

  console.log("✅ Database successfully seeded with full enterprise B2C and B2B dataset!");
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
