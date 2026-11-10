-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(12,2);

-- AlterTable ProductVariant
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(12,2);
