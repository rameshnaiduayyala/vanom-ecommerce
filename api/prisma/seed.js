import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const usd = await prisma.currency.upsert({
    where: { code: "USD" },
    update: {},
    create: { code: "USD", name: "US Dollar", symbol: "$" }
  });

  const ca = await prisma.currency.upsert({
    where: { code: "CAD" },
    update: {},
    create: { code: "CAD", name: "Canadian Dollar", symbol: "$" }
  });

  await prisma.country.upsert({
    where: { code: "CA" },
    update: { currencyId: ca.id },
    create: { code: "CA", name: "Canada", currencyId: ca.id }
  });

  await prisma.country.upsert({
    where: { code: "US" },
    update: { currencyId: usd.id },
    create: { code: "US", name: "United States", currencyId: usd.id }
  });

  await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" }
  });

  await prisma.brand.upsert({
    where: { slug: "demo-brand" },
    update: {},
    create: { name: "Demo Brand", slug: "demo-brand" }
  });

  await prisma.user.upsert({
    where: { email: "admin@vanom.com" },
    update: {
      passwordHash: await hashPassword("Password@123"),
      isActive: true,
      role: "SUPERADMIN",
      emailVerifiedAt: new Date(),
      firstName: "Vanom",
      lastName: "Admin"
    },
    create: {
      email: "admin@vanom.com",
      passwordHash: await hashPassword("Password@123"),
      firstName: "Vanom",
      lastName: "Admin",
      isActive: true,
      role: "SUPERADMIN",
      emailVerifiedAt: new Date()
    }
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
