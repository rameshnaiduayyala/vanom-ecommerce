/**
 * Prisma `include` shape for bulk products.
 * Ordered so images and pricing tiers are returned in a predictable order.
 */
export const productInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  countryPrices: {
    include: {
      tiers: { orderBy: { minQuantity: "asc" } }
    }
  },
  variants: {
    include: {
      countryPrices: {
        include: {
          tiers: { orderBy: { minQuantity: "asc" } }
        }
      }
    }
  }
};

/**
 * Prisma `include` shape for bulk orders.
 * Includes line items and a lightweight business summary.
 */
export const orderInclude = {
  items: true,
  business: {
    select: {
      id: true,
      businessName: true,
      businessEmail: true,
      businessPhone: true,
      taxRegistrationNumber: true,
      registrationNumber: true,
      countryCode: true,
      address: true,
      contactPersonName: true,
      status: true,
      isLocked: true
    }
  }
};

