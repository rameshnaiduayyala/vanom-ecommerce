-- AlterTable
ALTER TABLE "BulkProductVariant" ADD COLUMN IF NOT EXISTS "weight" DECIMAL(10,3);
ALTER TABLE "BulkProductVariant" ADD COLUMN IF NOT EXISTS "weightUnit" TEXT DEFAULT 'kg';
ALTER TABLE "BulkProductVariant" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BulkProductCountryPrice" ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "BulkVariantCountryPrice" ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BulkOrderItem" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "BulkOrderItem" ADD COLUMN IF NOT EXISTS "weight" DECIMAL(10,3);
ALTER TABLE "BulkOrderItem" ADD COLUMN IF NOT EXISTS "weightUnit" TEXT DEFAULT 'kg';
ALTER TABLE "BulkOrderItem" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "BulkOrderItem" ALTER COLUMN "appliedTier" DROP NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BulkProductVariant_isActive_idx" ON "BulkProductVariant"("isActive");
