-- AlterTable
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "showOnHome" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Category_showOnHome_idx" ON "Category"("showOnHome");
