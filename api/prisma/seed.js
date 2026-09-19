import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning existing database records...");

  // Delete in proper dependency order (child tables first)
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

  await prisma.bannerCountry.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.emailVerificationToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.file.deleteMany({});

  console.log("🌱 Seeding essential records only...");

  // 1. Currencies (USD & CAD required for cross-border pricing)
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

  // 2. Countries (US & CA)
  const usCountry = await prisma.country.upsert({
    where: { code: "US" },
    update: { currencyId: usd.id },
    create: { code: "US", name: "United States", currencyId: usd.id },
  });

  const caCountry = await prisma.country.upsert({
    where: { code: "CA" },
    update: { currencyId: cad.id },
    create: { code: "CA", name: "Canada", currencyId: cad.id },
  });

  // 3. Exactly 1 Category
  const category = await prisma.category.create({
    data: {
      name: "Organic Superfoods",
      slug: "organic-superfoods",
      imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
  });

  // 4. Exactly 1 Brand
  const brand = await prisma.brand.create({
    data: {
      name: "Vanom Organics",
      slug: "vanom-organics",
      isActive: true,
    },
  });

  const defaultPassword = await hashPassword("Password@123");

  // 5. Superadmin User
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
    },
  });

  // 6. Exactly 1 Customer User
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
    },
  });

  // 7. Exactly 1 B2B User & BulkBusiness
  const b2bUser = await prisma.user.create({
    data: {
      email: "b2b@acmecorp.com",
      passwordHash: defaultPassword,
      firstName: "Robert",
      lastName: "Davis",
      role: "USER",
      isActive: true,
      emailVerifiedAt: new Date(),
      countryId: usCountry.id,
    },
  });

  await prisma.bulkBusiness.create({
    data: {
      userId: b2bUser.id,
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

  console.log("\n========================================================");
  console.log("✅ Clean database and minimal seed completed successfully!");
  console.log("========================================================");
  console.log("👤 Superadmin : admin@vanom.com      / Password@123");
  console.log("👤 Customer   : customer@vanom.com   / Password@123");
  console.log("🏢 B2B User   : b2b@acmecorp.com     / Password@123");
  console.log("📁 1 Category : Organic Superfoods (organic-superfoods)");
  console.log("🏷️  1 Brand    : Vanom Organics (vanom-organics)");
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
