-- AlterTable
ALTER TABLE "ProductCountry" ADD COLUMN     "oldPrice" DECIMAL(12,2),
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductVariantCountry" ADD COLUMN     "oldPrice" DECIMAL(12,2),
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
