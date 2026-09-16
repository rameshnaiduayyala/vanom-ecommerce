-- CreateEnum
CREATE TYPE "BulkBusinessStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BulkBusinessUserRole" AS ENUM ('PRIMARY_CONTACT', 'BUYER', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "BulkProductType" AS ENUM ('SIMPLE', 'VARIABLE');

-- CreateEnum
CREATE TYPE "BulkOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BulkPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BulkShippingStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED');

-- CreateTable
CREATE TABLE "BulkBusiness" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "businessPhone" TEXT NOT NULL,
    "taxRegistrationNumber" TEXT,
    "registrationNumber" TEXT,
    "countryCode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "status" "BulkBusinessStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkBusinessUser" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "BulkBusinessUserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkBusinessUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "category" TEXT,
    "brand" TEXT,
    "type" "BulkProductType" NOT NULL DEFAULT 'SIMPLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT,
    "sku" TEXT NOT NULL,
    "attributes" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkProductCountryPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "moq" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BulkProductCountryPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkVariantCountryPrice" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "moq" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BulkVariantCountryPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkPricingTier" (
    "id" TEXT NOT NULL,
    "productPriceId" TEXT,
    "variantPriceId" TEXT,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "BulkPricingTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkCart" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkCartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkAddress" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "status" "BulkOrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "BulkPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "shippingStatus" "BulkShippingStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shippingCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "appliedTier" JSONB NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "BulkOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BulkBusiness_businessEmail_key" ON "BulkBusiness"("businessEmail");

-- CreateIndex
CREATE INDEX "BulkBusiness_status_idx" ON "BulkBusiness"("status");

-- CreateIndex
CREATE INDEX "BulkBusiness_businessName_idx" ON "BulkBusiness"("businessName");

-- CreateIndex
CREATE INDEX "BulkBusiness_countryCode_idx" ON "BulkBusiness"("countryCode");

-- CreateIndex
CREATE INDEX "BulkBusiness_createdAt_idx" ON "BulkBusiness"("createdAt");

-- CreateIndex
CREATE INDEX "BulkBusinessUser_userId_idx" ON "BulkBusinessUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BulkBusinessUser_businessId_userId_key" ON "BulkBusinessUser"("businessId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BulkProduct_slug_key" ON "BulkProduct"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BulkProduct_sku_key" ON "BulkProduct"("sku");

-- CreateIndex
CREATE INDEX "BulkProduct_name_idx" ON "BulkProduct"("name");

-- CreateIndex
CREATE INDEX "BulkProduct_sku_idx" ON "BulkProduct"("sku");

-- CreateIndex
CREATE INDEX "BulkProduct_isActive_idx" ON "BulkProduct"("isActive");

-- CreateIndex
CREATE INDEX "BulkProduct_createdAt_idx" ON "BulkProduct"("createdAt");

-- CreateIndex
CREATE INDEX "BulkProductImage_productId_idx" ON "BulkProductImage"("productId");

-- CreateIndex
CREATE INDEX "BulkProductImage_mediaAssetId_idx" ON "BulkProductImage"("mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "BulkProductVariant_sku_key" ON "BulkProductVariant"("sku");

-- CreateIndex
CREATE INDEX "BulkProductVariant_productId_idx" ON "BulkProductVariant"("productId");

-- CreateIndex
CREATE INDEX "BulkProductVariant_isActive_idx" ON "BulkProductVariant"("isActive");

-- CreateIndex
CREATE INDEX "BulkProductCountryPrice_countryCode_idx" ON "BulkProductCountryPrice"("countryCode");

-- CreateIndex
CREATE INDEX "BulkProductCountryPrice_isAvailable_idx" ON "BulkProductCountryPrice"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "BulkProductCountryPrice_productId_countryCode_key" ON "BulkProductCountryPrice"("productId", "countryCode");

-- CreateIndex
CREATE INDEX "BulkVariantCountryPrice_countryCode_idx" ON "BulkVariantCountryPrice"("countryCode");

-- CreateIndex
CREATE INDEX "BulkVariantCountryPrice_isAvailable_idx" ON "BulkVariantCountryPrice"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "BulkVariantCountryPrice_variantId_countryCode_key" ON "BulkVariantCountryPrice"("variantId", "countryCode");

-- CreateIndex
CREATE INDEX "BulkPricingTier_productPriceId_minQuantity_idx" ON "BulkPricingTier"("productPriceId", "minQuantity");

-- CreateIndex
CREATE INDEX "BulkPricingTier_variantPriceId_minQuantity_idx" ON "BulkPricingTier"("variantPriceId", "minQuantity");

-- CreateIndex
CREATE UNIQUE INDEX "BulkCart_businessId_key" ON "BulkCart"("businessId");

-- CreateIndex
CREATE INDEX "BulkCartItem_cartId_idx" ON "BulkCartItem"("cartId");

-- CreateIndex
CREATE INDEX "BulkCartItem_productId_idx" ON "BulkCartItem"("productId");

-- CreateIndex
CREATE INDEX "BulkCartItem_variantId_idx" ON "BulkCartItem"("variantId");

-- CreateIndex
CREATE INDEX "BulkAddress_businessId_idx" ON "BulkAddress"("businessId");

-- CreateIndex
CREATE INDEX "BulkAddress_isDefault_idx" ON "BulkAddress"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "BulkOrder_orderNumber_key" ON "BulkOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "BulkOrder_businessId_idx" ON "BulkOrder"("businessId");

-- CreateIndex
CREATE INDEX "BulkOrder_status_idx" ON "BulkOrder"("status");

-- CreateIndex
CREATE INDEX "BulkOrder_countryCode_idx" ON "BulkOrder"("countryCode");

-- CreateIndex
CREATE INDEX "BulkOrder_createdAt_idx" ON "BulkOrder"("createdAt");

-- CreateIndex
CREATE INDEX "BulkOrderItem_orderId_idx" ON "BulkOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "BulkOrderItem_productId_idx" ON "BulkOrderItem"("productId");

-- AddForeignKey
ALTER TABLE "BulkBusinessUser" ADD CONSTRAINT "BulkBusinessUser_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BulkBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkProductImage" ADD CONSTRAINT "BulkProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BulkProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkProductVariant" ADD CONSTRAINT "BulkProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BulkProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkProductCountryPrice" ADD CONSTRAINT "BulkProductCountryPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BulkProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkVariantCountryPrice" ADD CONSTRAINT "BulkVariantCountryPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "BulkProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPricingTier" ADD CONSTRAINT "BulkPricingTier_productPriceId_fkey" FOREIGN KEY ("productPriceId") REFERENCES "BulkProductCountryPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPricingTier" ADD CONSTRAINT "BulkPricingTier_variantPriceId_fkey" FOREIGN KEY ("variantPriceId") REFERENCES "BulkVariantCountryPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkCart" ADD CONSTRAINT "BulkCart_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BulkBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkCartItem" ADD CONSTRAINT "BulkCartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "BulkCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkCartItem" ADD CONSTRAINT "BulkCartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BulkProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkCartItem" ADD CONSTRAINT "BulkCartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "BulkProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkAddress" ADD CONSTRAINT "BulkAddress_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BulkBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkOrder" ADD CONSTRAINT "BulkOrder_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BulkBusiness"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkOrderItem" ADD CONSTRAINT "BulkOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BulkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkOrderItem" ADD CONSTRAINT "BulkOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BulkProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkOrderItem" ADD CONSTRAINT "BulkOrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "BulkProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
