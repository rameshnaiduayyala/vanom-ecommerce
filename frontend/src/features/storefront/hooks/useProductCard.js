import { useState, useMemo } from "react";
import { useCountryStore } from "@/stores/country.store.js";
import { useCartStore } from "@/stores/cart.store.js";
import { useWishlistStore } from "@/stores/wishlist.store.js";
import { useUIStore } from "@/stores/ui.store.js";
import { resolveProductImageUrl } from "@/utils/image.js";

/** Resolves price from multiple possible API shapes and country-specific pricing */
function resolvePrice(product, countryCode = "US") {
  if (!product) return { price: 0, originalPrice: 0, discount: 0 };

  const isCanada = countryCode === "CA";

  // 1. Check product.countries table entry
  const countryEntry = Array.isArray(product.countries)
    ? product.countries.find(
        (c) =>
          c.country?.code === countryCode ||
          c.currency === (isCanada ? "CAD" : "USD") ||
          c.country?.name?.toLowerCase()?.includes(isCanada ? "canada" : "united states")
      ) || product.countries[0]
    : null;

  // 2. Check variant country table entry if variable product
  const firstVariant =
    Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants[0]
      : null;

  const variantCountryEntry =
    firstVariant && Array.isArray(firstVariant.countries)
      ? firstVariant.countries.find(
          (c) =>
            c.country?.code === countryCode ||
            c.currency === (isCanada ? "CAD" : "USD") ||
            c.country?.name?.toLowerCase()?.includes(isCanada ? "canada" : "united states")
        ) || firstVariant.countries[0]
      : null;

  let resolvedUnit = 0;
  let resolvedOld = 0;

  if (isCanada) {
    resolvedUnit =
      variantCountryEntry?.price ??
      countryEntry?.price ??
      firstVariant?.price_cad ??
      product.price_cad ??
      product.priceCA ??
      product.pricing?.CA?.retailPrice ??
      (product.basePrice
        ? Number(product.basePrice) * 1.35
        : product.price
        ? Number(product.price) * 1.35
        : firstVariant?.price_usd
        ? Number(firstVariant.price_usd) * 1.35
        : 0);

    resolvedOld =
      variantCountryEntry?.oldPrice ??
      countryEntry?.oldPrice ??
      firstVariant?.old_price_cad ??
      product.old_price_cad ??
      (product.oldPrice ? Number(product.oldPrice) * 1.35 : 0);
  } else {
    // US or default
    resolvedUnit =
      variantCountryEntry?.price ??
      countryEntry?.price ??
      firstVariant?.price_usd ??
      product.basePrice ??
      product.price_usd ??
      product.priceUS ??
      product.price ??
      product.pricing?.US?.retailPrice ??
      (firstVariant?.price ? Number(firstVariant.price) : 0);

    resolvedOld =
      variantCountryEntry?.oldPrice ??
      countryEntry?.oldPrice ??
      firstVariant?.old_price_usd ??
      product.old_price_usd ??
      product.oldPrice ??
      product.pricing?.US?.mrp ??
      0;
  }

  const price = Number(resolvedUnit) || 0;
  const originalPrice =
    Number(resolvedOld) > price
      ? Number(resolvedOld)
      : price > 0 && product.discount
      ? Math.round(price / (1 - product.discount / 100))
      : 0;

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : product.discount || 0;

  return { price, originalPrice, discount };
}

/**
 * Shared hook for all product card variants.
 * Provides: live pricing, real ratings, stock status, cart, wishlist persistence, and stepper logic.
 */
export function useProductCard(product) {
  const { country } = useCountryStore();
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { addToast } = useUIStore();

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const productId = product?.id || product?._id;
  const wishlisted = useMemo(() => isInWishlist(productId), [isInWishlist, productId]);

  const { price, originalPrice, discount } = resolvePrice(product, country.code);
  const productImage = resolveProductImageUrl(product);
  const effectiveBadge = product?.badge || null;

  // Real inventory & stock resolution (no dummy quantities)
  const stockCount =
    product?.stockQuantity ??
    product?.stock ??
    product?.inventoryCount ??
    (product?.variants?.[0]?.stockQuantity ?? null);

  const isOutOfStock = stockCount !== null && stockCount <= 0;

  // Real rating without dummy fallback values
  const rating = product?.rating ?? product?.avgRating ?? null;
  const reviewCount = product?.reviewsCount ?? product?.reviews ?? 0;

  // Real subtitle/specs without fake text
  const subtitle =
    product?.specs ||
    product?.subtitle ||
    product?.shortDescription ||
    (product?.description && product.description.length < 90 ? product.description : null);

  const handleAddToCart = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isOutOfStock) return;

    setAddingToCart(true);

    addItem({
      id: productId,
      productId: productId,
      variantId: product?.variants?.[0]?.id || productId,
      name: product?.name,
      slug: product?.slug,
      price,
      mrp: originalPrice,
      quantity,
      image: productImage,
      sku: product?.sku || product?.variants?.[0]?.sku,
    });

    addToast({
      title: "Added to Cart",
      message: `${quantity}× ${product?.name} added to cart.`,
      type: "success",
    });

    setTimeout(() => {
      setAddingToCart(false);
      openCart();
    }, 600);
  };

  const handleStepQuantity = (e, delta) => {
    e?.preventDefault();
    e?.stopPropagation();
    setQuantity((q) => Math.max(1, q + delta));
  };

  const handleWishlist = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    toggleWishlist({
      id: productId,
      name: product?.name,
      slug: product?.slug,
      price,
      originalPrice,
      image: productImage,
    });
  };

  return {
    country,
    price,
    originalPrice,
    discount,
    productImage,
    effectiveBadge,
    quantity,
    addingToCart,
    wishlisted,
    isOutOfStock,
    rating,
    reviewCount,
    subtitle,
    handleAddToCart,
    handleStepQuantity,
    handleWishlist,
  };
}

export default useProductCard;
