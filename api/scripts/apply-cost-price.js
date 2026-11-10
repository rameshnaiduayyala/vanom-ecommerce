import { prisma } from "../src/config/prisma.js";

async function main() {
  try {
    console.log("Applying costPrice columns to database...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(12,2);
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(12,2);
    `);
    console.log("Columns added successfully!");

    const count = await prisma.product.count();
    console.log(`Total products in database: ${count}`);

    // Backfill: set costPrice = ROUND(basePrice * 0.65, 2) where costPrice is NULL
    const updated = await prisma.$executeRawUnsafe(`
      UPDATE "Product" 
      SET "costPrice" = ROUND(("basePrice" * 0.65), 2) 
      WHERE "costPrice" IS NULL AND "basePrice" IS NOT NULL;
    `);
    console.log(`Updated ${updated} existing products with costPrice.`);

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

main();
