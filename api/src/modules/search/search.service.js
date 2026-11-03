import { prisma } from "../../config/prisma.js";

export async function searchCatalog({
  query = "",
  categoryId = null,
  limit = 10,
  countryCode = "US"
}) {
  const trimmed = (query || "").trim().slice(0, 100);
  if (!trimmed || trimmed.length < 2) {
    return { products: [], categories: [], total: 0 };
  }

  const takeLimit = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));
  const contains = `%${trimmed}%`;
  const prefix = `${trimmed}%`;

  const country = await prisma.country.findFirst({
    where: {
      OR: [
        { code: countryCode.toUpperCase() },
        { id: countryCode }
      ]
    },
    include: { currency: true }
  });

  const countryId = country?.id || null;

  const products = await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.sku,
      p.type,
      p."basePrice",
      p.stock,
      p."isNew",
      p."isFeatured",
      p."isTrending",
      p."isBestSeller",
      c.id AS "categoryId",
      c.name AS "categoryName",
      c.slug AS "categorySlug",
      b.id AS "brandId",
      b.name AS "brandName",
      b.slug AS "brandSlug",
      (
        SELECT url FROM "ProductImage" pi 
        WHERE pi."productId" = p.id 
        ORDER BY pi."sortOrder" ASC 
        LIMIT 1
      ) AS "imageUrl",
      (
        SELECT pc.price FROM "ProductCountry" pc 
        WHERE pc."productId" = p.id AND (${countryId}::text IS NULL OR pc."countryId" = ${countryId}) AND pc."isAvailable" = true
        LIMIT 1
      ) AS "countryPrice",
      (
        SELECT pc."oldPrice" FROM "ProductCountry" pc 
        WHERE pc."productId" = p.id AND (${countryId}::text IS NULL OR pc."countryId" = ${countryId})
        LIMIT 1
      ) AS "countryOldPrice",
      (
        SELECT pc.stock FROM "ProductCountry" pc 
        WHERE pc."productId" = p.id AND (${countryId}::text IS NULL OR pc."countryId" = ${countryId})
        LIMIT 1
      ) AS "countryStock",
      (
        CASE
          WHEN LOWER(p.name) = LOWER(${trimmed}) THEN 100
          WHEN LOWER(p.name) LIKE LOWER(${prefix}) THEN 85
          WHEN LOWER(COALESCE(p.sku, '')) = LOWER(${trimmed}) THEN 75
          WHEN LOWER(COALESCE(b.name, '')) = LOWER(${trimmed}) OR LOWER(COALESCE(b.name, '')) LIKE LOWER(${prefix}) THEN 65
          WHEN LOWER(COALESCE(c.name, '')) = LOWER(${trimmed}) OR LOWER(COALESCE(c.name, '')) LIKE LOWER(${prefix}) THEN 55
          WHEN LOWER(p.name) LIKE LOWER(${contains}) THEN 45
          WHEN LOWER(COALESCE(p.description, '')) LIKE LOWER(${contains}) THEN 30
          ELSE 10
        END
        + GREATEST(
            word_similarity(LOWER(${trimmed}), LOWER(p.name)),
            word_similarity(LOWER(${trimmed}), LOWER(COALESCE(b.name, ''))),
            word_similarity(LOWER(${trimmed}), LOWER(COALESCE(c.name, '')))
          ) * 20
      ) AS rank_score
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    LEFT JOIN "Brand" b ON p."brandId" = b.id
    WHERE p."isActive" = true 
      AND p."deletedAt" IS NULL
      AND (
        ${categoryId}::text IS NULL 
        OR p."categoryId" = ${categoryId} 
        OR c.slug = ${categoryId}
      )
      AND (
        LOWER(p.name) LIKE LOWER(${contains})
        OR LOWER(COALESCE(p.sku, '')) LIKE LOWER(${contains})
        OR LOWER(COALESCE(b.name, '')) LIKE LOWER(${contains})
        OR LOWER(COALESCE(c.name, '')) LIKE LOWER(${contains})
        OR LOWER(COALESCE(p.description, '')) LIKE LOWER(${contains})
        OR word_similarity(LOWER(${trimmed}), LOWER(p.name)) > 0.35
        OR word_similarity(LOWER(${trimmed}), LOWER(COALESCE(b.name, ''))) > 0.35
        OR word_similarity(LOWER(${trimmed}), LOWER(COALESCE(c.name, ''))) > 0.35
        OR EXISTS (
          SELECT 1 FROM "ProductVariant" pv 
          WHERE pv."productId" = p.id 
            AND pv."isActive" = true 
            AND (
              LOWER(pv.sku) LIKE LOWER(${contains}) 
              OR LOWER(COALESCE(pv.name, '')) LIKE LOWER(${contains})
            )
        )
      )
    ORDER BY rank_score DESC, p."isFeatured" DESC, p."createdAt" DESC
    LIMIT ${takeLimit};
  `;

  const categories = await prisma.$queryRaw`
    SELECT 
      c.id, 
      c.name, 
      c.slug,
      (
        SELECT COUNT(*)::int 
        FROM "Product" p 
        WHERE p."categoryId" = c.id AND p."isActive" = true AND p."deletedAt" IS NULL
      ) AS "productCount"
    FROM "Category" c
    WHERE c."isActive" = true
      AND (
        LOWER(c.name) LIKE LOWER(${contains})
        OR word_similarity(LOWER(${trimmed}), LOWER(c.name)) > 0.35
      )
    ORDER BY 
      CASE 
        WHEN LOWER(c.name) = LOWER(${trimmed}) THEN 100
        WHEN LOWER(c.name) LIKE LOWER(${prefix}) THEN 80
        ELSE 50
      END + word_similarity(LOWER(${trimmed}), LOWER(c.name)) * 20 DESC
    LIMIT 4;
  `;

  const formattedProducts = products.map((p) => {
    const rawPrice = p.countryPrice !== null ? p.countryPrice : p.basePrice;
    const price = rawPrice !== null ? Number(rawPrice) : 0;
    const originalPrice = p.countryOldPrice !== null ? Number(p.countryOldPrice) : 0;
    const discount = originalPrice > price && price > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const stock = p.countryStock !== null ? Number(p.countryStock) : Number(p.stock || 0);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      type: p.type,
      price,
      originalPrice: originalPrice > price ? originalPrice : null,
      discount,
      currency: country?.currency?.code || "USD",
      symbol: country?.currency?.symbol || "$",
      stock,
      inStock: stock > 0,
      imageUrl: p.imageUrl || null,
      category: p.categoryId ? {
        id: p.categoryId,
        name: p.categoryName,
        slug: p.categorySlug
      } : null,
      brand: p.brandId ? {
        id: p.brandId,
        name: p.brandName,
        slug: p.brandSlug
      } : null,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
      isBestSeller: p.isBestSeller,
    };
  });

  return {
    products: formattedProducts,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: Number(c.productCount || 0)
    })),
    total: formattedProducts.length
  };
}

