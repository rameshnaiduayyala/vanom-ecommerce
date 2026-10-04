-- Enable pg_trgm extension for typo tolerance and similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- B-Tree index on product name
CREATE INDEX IF NOT EXISTS "Product_name_idx" ON "Product"("name");

-- Trigram GIN indexes for fast fuzzy/ILIKE/similarity searches
CREATE INDEX IF NOT EXISTS "idx_product_name_trgm" ON "Product" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_product_sku_trgm" ON "Product" USING gin ("sku" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_category_name_trgm" ON "Category" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_brand_name_trgm" ON "Brand" USING gin ("name" gin_trgm_ops);
