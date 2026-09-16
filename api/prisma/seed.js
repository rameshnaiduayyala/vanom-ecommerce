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

  // ==========================================
  // B2B / BULK COMMERCE SEED DATA
  // ==========================================

  // 1. Bulk Business with direct user relation
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@vanom.com" } });
  const bulkBusiness = await prisma.bulkBusiness.upsert({
    where: { businessEmail: "purchasing@acmecorp.com" },
    update: {
      userId: adminUser?.id,
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: "SUPERADMIN"
    },
    create: {
      userId: adminUser?.id,
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

  // 3. Simple Bulk Product (e.g. Heavy Duty Work Gloves)
  const simpleProduct = await prisma.bulkProduct.upsert({
    where: { slug: "heavy-duty-work-gloves" },
    update: {},
    create: {
      name: "Heavy Duty Work Gloves (Pack of 50)",
      slug: "heavy-duty-work-gloves",
      sku: "BULK-GLOVE-001",
      description: "Industrial grade puncture resistant work gloves for enterprise warehouses.",
      category: "Industrial Equipment",
      brand: "Demo Brand",
      type: "SIMPLE",
      isActive: true,
      countryPrices: {
        create: [
          {
            countryCode: "US",
            currencyCode: "USD",
            moq: 10,
            stock: 2500,
            isAvailable: true,
            tiers: {
              create: [
                { minQuantity: 10, maxQuantity: 49, price: 45.00 },
                { minQuantity: 50, maxQuantity: 99, price: 38.00 },
                { minQuantity: 100, maxQuantity: null, price: 32.00 }
              ]
            }
          },
          {
            countryCode: "CA",
            currencyCode: "CAD",
            moq: 15,
            stock: 1200,
            isAvailable: true,
            tiers: {
              create: [
                { minQuantity: 15, maxQuantity: 49, price: 60.00 },
                { minQuantity: 50, maxQuantity: 99, price: 52.00 },
                { minQuantity: 100, maxQuantity: null, price: 44.00 }
              ]
            }
          }
        ]
      }
    }
  });

  // 4. Variable Bulk Product (e.g. Industrial High-Vis Safety Vests)
  const variableProduct = await prisma.bulkProduct.upsert({
    where: { slug: "industrial-safety-vests" },
    update: {},
    create: {
      name: "Industrial High-Vis Safety Vests",
      slug: "industrial-safety-vests",
      sku: "BULK-VEST-001",
      description: "OSHA compliant high-visibility safety vests with reflective strips.",
      category: "Safety Wear",
      brand: "Demo Brand",
      type: "VARIABLE",
      isActive: true,
      variants: {
        create: [
          {
            name: "Neon Yellow / L",
            sku: "BULK-VEST-YLW-L",
            attributes: { color: "Neon Yellow", size: "L" },
            isActive: true,
            countryPrices: {
              create: [
                {
                  countryCode: "US",
                  currencyCode: "USD",
                  moq: 20,
                  stock: 3000,
                  isAvailable: true,
                  tiers: {
                    create: [
                      { minQuantity: 20, maxQuantity: 99, price: 12.50 },
                      { minQuantity: 100, maxQuantity: 499, price: 10.00 },
                      { minQuantity: 500, maxQuantity: null, price: 8.50 }
                    ]
                  }
                },
                {
                  countryCode: "CA",
                  currencyCode: "CAD",
                  moq: 25,
                  stock: 1500,
                  isAvailable: true,
                  tiers: {
                    create: [
                      { minQuantity: 25, maxQuantity: 99, price: 17.00 },
                      { minQuantity: 100, maxQuantity: 499, price: 14.00 },
                      { minQuantity: 500, maxQuantity: null, price: 11.50 }
                    ]
                  }
                }
              ]
            }
          },
          {
            name: "Neon Yellow / XL",
            sku: "BULK-VEST-YLW-XL",
            attributes: { color: "Neon Yellow", size: "XL" },
            isActive: true,
            countryPrices: {
              create: [
                {
                  countryCode: "US",
                  currencyCode: "USD",
                  moq: 20,
                  stock: 2000,
                  isAvailable: true,
                  tiers: {
                    create: [
                      { minQuantity: 20, maxQuantity: 99, price: 13.00 },
                      { minQuantity: 100, maxQuantity: 499, price: 10.50 },
                      { minQuantity: 500, maxQuantity: null, price: 9.00 }
                    ]
                  }
                },
                {
                  countryCode: "CA",
                  currencyCode: "CAD",
                  moq: 25,
                  stock: 800,
                  isAvailable: true,
                  tiers: {
                    create: [
                      { minQuantity: 25, maxQuantity: 99, price: 18.00 },
                      { minQuantity: 100, maxQuantity: 499, price: 14.50 },
                      { minQuantity: 500, maxQuantity: null, price: 12.00 }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  // 5. Bulk Address
  await prisma.bulkAddress.createMany({
    data: [
      {
        businessId: bulkBusiness.id,
        label: "Primary Warehouse",
        contactName: "Robert Davis",
        phone: "+1-800-555-0199",
        addressLine1: "100 Enterprise Way",
        addressLine2: "Dock 4",
        city: "Chicago",
        state: "IL",
        postalCode: "60601",
        countryCode: "US",
        isDefault: true
      }
    ],
    skipDuplicates: true
  });

  console.log("Seed completed with public and B2B/bulk commerce data");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
