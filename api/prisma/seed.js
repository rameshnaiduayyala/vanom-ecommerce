import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  // 1. Currencies
  const usd = await prisma.currency.upsert({
    where: { code: "USD" },
    update: {},
    create: { code: "USD", name: "US Dollar", symbol: "$" }
  });

  const ca = await prisma.currency.upsert({
    where: { code: "CAD" },
    update: {},
    create: { code: "CAD", name: "Canadian Dollar", symbol: "CA$" }
  });

  const inr = await prisma.currency.upsert({
    where: { code: "INR" },
    update: {},
    create: { code: "INR", name: "Indian Rupee", symbol: "₹" }
  });

  // 2. Countries
  await prisma.country.upsert({
    where: { code: "US" },
    update: { currencyId: usd.id },
    create: { code: "US", name: "United States", currencyId: usd.id }
  });

  await prisma.country.upsert({
    where: { code: "CA" },
    update: { currencyId: ca.id },
    create: { code: "CA", name: "Canada", currencyId: ca.id }
  });

  await prisma.country.upsert({
    where: { code: "IN" },
    update: { currencyId: inr.id },
    create: { code: "IN", name: "India", currencyId: inr.id }
  });

  // 3. Categories
  const catGroceries = await prisma.category.upsert({
    where: { slug: "groceries" },
    update: { name: "Groceries & Pantry", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" },
    create: { name: "Groceries & Pantry", slug: "groceries", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" }
  });

  const catSuperfoods = await prisma.category.upsert({
    where: { slug: "superfoods" },
    update: { name: "Organic Superfoods", imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80" },
    create: { name: "Organic Superfoods", slug: "superfoods", imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80" }
  });

  const catWellness = await prisma.category.upsert({
    where: { slug: "wellness" },
    update: { name: "Ayurvedic Wellness", imageUrl: "https://images.unsplash.com/photo-1608248597359-009a25b12a21?auto=format&fit=crop&w=600&q=80" },
    create: { name: "Ayurvedic Wellness", slug: "wellness", imageUrl: "https://images.unsplash.com/photo-1608248597359-009a25b12a21?auto=format&fit=crop&w=600&q=80" }
  });

  const catNuts = await prisma.category.upsert({
    where: { slug: "dryfruits-nuts" },
    update: { name: "Dry Fruits & Nuts", imageUrl: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80" },
    create: { name: "Dry Fruits & Nuts", slug: "dryfruits-nuts", imageUrl: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80" }
  });

  // 4. Brands
  const brand = await prisma.brand.upsert({
    where: { slug: "vanom-organics" },
    update: {},
    create: { name: "Vanom Organics", slug: "vanom-organics" }
  });

  // 5. Admin User
  const passwordHash = await hashPassword("Password@123");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@vanom.com" },
    update: {
      passwordHash,
      isActive: true,
      role: "SUPERADMIN",
      emailVerifiedAt: new Date(),
      firstName: "Super",
      lastName: "Admin"
    },
    create: {
      email: "admin@vanom.com",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      isActive: true,
      role: "SUPERADMIN",
      emailVerifiedAt: new Date()
    }
  });

  // 6. Regular Customer
  await prisma.user.upsert({
    where: { email: "customer@vanom.com" },
    update: {
      passwordHash,
      isActive: true,
      role: "USER",
      emailVerifiedAt: new Date(),
      firstName: "Ramesh",
      lastName: "Ayyala"
    },
    create: {
      email: "customer@vanom.com",
      passwordHash,
      firstName: "Ramesh",
      lastName: "Ayyala",
      isActive: true,
      role: "USER",
      emailVerifiedAt: new Date()
    }
  });

  // 7. Storefront Products
  const products = [
    {
      name: "Wild Organic Sundarbans Forest Honey 500g",
      slug: "wild-organic-sundarbans-forest-honey-500g",
      sku: "HONEY-SUN-500",
      description: "100% raw, unpasteurized and unprocessed organic forest honey sourced from natural hives.",
      categoryId: catGroceries.id,
      brandId: brand.id,
      basePrice: 699,
      isFeatured: true,
      isBestSeller: true,
      isNewLaunch: true,
      images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80"]
    },
    {
      name: "California Whole Raw Almonds 500g",
      slug: "california-whole-raw-almonds-500g",
      sku: "NUTS-ALM-500",
      description: "Premium Nonpareil variety whole California raw almonds packed with natural vitamin E and plant protein.",
      categoryId: catNuts.id,
      brandId: brand.id,
      basePrice: 599,
      isFeatured: true,
      isBestSeller: true,
      isNewLaunch: false,
      images: ["https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80"]
    },
    {
      name: "Cold Pressed Extra Virgin Olive Oil 1L",
      slug: "cold-pressed-extra-virgin-olive-oil-1l",
      sku: "OIL-EVOO-1000",
      description: "First single cold pressed Spanish Arbequina olives with ultra-low acidity and rich polyphenols.",
      categoryId: catGroceries.id,
      brandId: brand.id,
      basePrice: 1299,
      isFeatured: true,
      isBestSeller: false,
      isNewLaunch: true,
      images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80"]
    },
    {
      name: "Ceremonial Grade Matcha Green Tea 100g",
      slug: "ceremonial-grade-matcha-green-tea-100g",
      sku: "TEA-MATCHA-100",
      description: "First harvest shade-grown Japanese Uji matcha stone-ground for smooth sustained energy.",
      categoryId: catSuperfoods.id,
      brandId: brand.id,
      basePrice: 1199,
      isFeatured: true,
      isBestSeller: true,
      isNewLaunch: true,
      images: ["https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80"]
    },
    {
      name: "Pure Himalayan Pink Rock Salt 1kg",
      slug: "pure-himalayan-pink-rock-salt-1kg",
      sku: "SALT-PINK-1000",
      description: "Mineral-rich unrefined pink crystal salt containing 84+ essential trace minerals.",
      categoryId: catGroceries.id,
      brandId: brand.id,
      basePrice: 199,
      isFeatured: false,
      isBestSeller: true,
      isNewLaunch: false,
      images: ["https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80"]
    },
    {
      name: "24K Kashmiri Saffron Kumkumadi Facial Oil 30ml",
      slug: "24k-kashmiri-saffron-kumkumadi-facial-oil-30ml",
      sku: "OIL-KUM-30",
      description: "Traditional classical formulation infused with pure Kashmiri Mongra Saffron and sandalwood.",
      categoryId: catWellness.id,
      brandId: brand.id,
      basePrice: 1899,
      isFeatured: true,
      isBestSeller: true,
      isNewLaunch: true,
      images: ["https://images.unsplash.com/photo-1608248597359-009a25b12a21?auto=format&fit=crop&w=600&q=80"]
    }
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        category: p.categoryId ? { connect: { id: p.categoryId } } : undefined,
        brand: p.brandId ? { connect: { id: p.brandId } } : undefined,
        basePrice: p.basePrice,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isNew: p.isNewLaunch,
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        category: p.categoryId ? { connect: { id: p.categoryId } } : undefined,
        brand: p.brandId ? { connect: { id: p.brandId } } : undefined,
        basePrice: p.basePrice,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isNew: p.isNewLaunch,
        isActive: true,
      }
    });

    // Add product image
    if (p.images && p.images[0]) {
      const existingImg = await prisma.productImage.findFirst({ where: { productId: created.id } });
      if (!existingImg) {
        await prisma.productImage.create({
          data: {
            productId: created.id,
            url: p.images[0],
            sortOrder: 0,
          }
        });
      }
    }
  }

  // 8. Bulk Business
  await prisma.bulkBusiness.upsert({
    where: { businessEmail: "purchasing@acmecorp.com" },
    update: {
      userId: adminUser.id,
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: "SUPERADMIN"
    },
    create: {
      userId: adminUser.id,
      businessName: "Acme Industrial Corp",
      businessEmail: "purchasing@acmecorp.com",
      businessPhone: "+1-800-555-0199",
      registrationNumber: "REG-9928172",
      taxRegistrationNumber: "US-TAX-8827110",
      countryCode: "US",
      address: "100 Enterprise Way, Suite 400, Chicago, IL 60601",
      contactPersonName: "Robert Davis",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: "SUPERADMIN"
    }
  });

  console.log("✅ Seed completed with rich Categories, Products, Currencies, and B2B data!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
