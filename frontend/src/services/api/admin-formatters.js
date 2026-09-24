/**
 * Formats raw backend product payload into UI-friendly structure for Admin pages.
 */
export function formatAdminProducts(res) {
  const rawProducts = Array.isArray(res)
    ? res
    : Array.isArray(res?.items)
    ? res.items
    : Array.isArray(res?.data)
    ? res.data
    : [];

  return rawProducts.map((p) => {
    let catName = "General";
    let catId = "";
    if (p.categories && Array.isArray(p.categories) && p.categories.length > 0) {
      catName = p.categories[0]?.category?.name || p.categories[0]?.name || "General";
      catId = p.categories[0]?.categoryId || p.categories[0]?.category?.id || "";
    } else if (p.category && typeof p.category === "object") {
      catName = p.category.name || "General";
      catId = p.category.id || "";
    } else if (typeof p.category === "string") {
      catName = p.category;
    }

    const inrPrice = p.prices?.find((pr) => pr.currency?.code === "INR")?.amount;
    const usdPrice = p.prices?.find((pr) => pr.currency?.code === "USD")?.amount || p.priceUS || p.price;
    const cadPrice = p.prices?.find((pr) => pr.currency?.code === "CAD")?.amount || p.priceCA;
    const gbpPrice = p.prices?.find((pr) => pr.currency?.code === "GBP")?.amount;
    const oldPriceAttr = p.attributes?.find((a) => a.attribute?.code === "old_price")?.customValue || p.oldPrice || p.comparePrice;
    const isNewAttr = p.attributes?.find((a) => a.attribute?.code === "is_new")?.customValue === "true" || p.isNewProduct || p.isNew;

    return {
      ...p,
      category: catName,
      categoryId: catId || p.categoryId,
      brand: p.brand?.name || (typeof p.brand === "string" ? p.brand : "Vanom Brand"),
      image:
        p.images?.[0]?.file?.url ||
        p.images?.[0]?.url ||
        p.image ||
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
      oldPrice: oldPriceAttr ? Number(oldPriceAttr) : null,
      priceUS: usdPrice ? Number(usdPrice) : null,
      priceCA: cadPrice ? Number(cadPrice) : null,
      isBestSeller: Boolean(p.isBestSeller),
      isNewProduct: Boolean(isNewAttr),
      isFeatured: Boolean(p.isFeatured),
      stock: p.variants?.[0]?.inventoryItems?.reduce((sum, item) => sum + (item.onHand || 0), 0) || p.stock || 500,
      packaging: p.variants?.[0]?.packaging?.[0]
        ? {
            unitName: p.variants[0].packaging[0].unit?.name || "Unit",
            weightKg: Number(p.variants[0].weight || 1),
            dimensionsCm: "Standard",
            palletQuantity: p.variants[0].packaging[0].pallet?.packagesPerPallet || 40,
            palletWeightKg: Number(p.variants[0].packaging[0].pallet?.maxWeight || 1000),
          }
        : p.packaging || {
            unitName: "Standard Pack",
            weightKg: 1,
            dimensionsCm: "Standard",
            palletQuantity: 40,
            palletWeightKg: 1000,
          },
      pricing: p.pricing || {
        US: { currency: "USD", symbol: "$", retailPrice: Number(usdPrice || 35.0), oldPrice: oldPriceAttr ? Number(oldPriceAttr) : null, moq: 1 },
        CA: { currency: "CAD", symbol: "CA$", retailPrice: Number(cadPrice || 45.0), oldPrice: oldPriceAttr ? Number(oldPriceAttr) * 1.3 : null, moq: 1 },
        IN: { currency: "INR", symbol: "₹", retailPrice: Number(inrPrice || 1499), moq: 1 },
        GB: { currency: "GBP", symbol: "£", retailPrice: Number(gbpPrice || 28.0), moq: 1 },
      },
    };
  });
}

/**
 * Formats raw backend category payload into UI-friendly structure for Admin pages.
 */
export function formatAdminCategories(res) {
  const rawCategories = Array.isArray(res)
    ? res
    : Array.isArray(res?.items)
    ? res.items
    : Array.isArray(res?.data)
    ? res.data
    : [];

  return rawCategories.map((c) => ({
    ...c,
    name: typeof c.name === "string" ? c.name : c.name?.name || "Category",
    slug: c.slug || "",
    description: typeof c.description === "string" ? c.description : "",
    imageUrl: c.imageUrl || (c.imageAsset ? `/api/v1/files/${c.imageAsset.storageKey}` : ""),
    active: c.isActive !== undefined ? Boolean(c.isActive) : (c.active !== undefined ? Boolean(c.active) : true),
    sortOrder: c.sortOrder || 0,
    parentId: c.parentId || null,
    parentName: c.parent?.name || null,
    children: c.children || [],
    subcategoriesCount: c.subcategoriesCount || c.children?.length || c._count?.children || 0,
    count:
      c.productCount !== undefined
        ? c.productCount
        : c._count?.products !== undefined
        ? c._count.products
        : c.count || c.products?.length || 0,
  }));
}
