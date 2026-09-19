import { useState } from "react";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";


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
  const firstVariant = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants[0] : null;
  const variantCountryEntry = firstVariant && Array.isArray(firstVariant.countries)
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
      (product.basePrice ? Number(product.basePrice) * 1.35 : (product.price ? Number(product.price) * 1.35 : (firstVariant?.price_usd ? Number(firstVariant.price_usd) * 1.35 : 0)));

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
  const originalPrice = Number(resolvedOld) > price ? Number(resolvedOld) : (price > 0 ? Math.round(price * 1.25) : 0);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : (product.discount || 0);

  return { price, originalPrice, discount };
}

import { resolveProductImageUrl } from "../../../utils/image.js";

function resolveImage(product) {
  return resolveProductImageUrl(product);
}

/**
 * Shared hook for all product card variants.
 * Provides: pricing, image, cart, wishlist, quantity stepper logic.
 */
export function useProductCard(product) {
  const { country } = useCountryStore();
  const { addItem, openCart } = useCartStore();
  const { addToast } = useUIStore();

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { price, originalPrice, discount } = resolvePrice(product, country.code);
  const productImage = resolveImage(product);
  const effectiveBadge = product.badge || null;

  const handleAddToCart = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setAddingToCart(true);

    addItem({
      id: product.id,
      productId: product.id,
      variantId: product.variants?.[0]?.id || product.id,
      name: product.name,
      slug: product.slug,
      price,
      mrp: originalPrice,
      quantity,
      image: productImage,
      sku: product.sku || product.variants?.[0]?.sku,
    });

    addToast({
      title: "Added to Cart",
      message: `${quantity}× ${product.name} added.`,
      type: "success",
    });

    setTimeout(() => {
      setAddingToCart(false);
      openCart();
    }, 700);
  };

  const handleStepQuantity = (e, delta) => {
    e?.preventDefault();
    e?.stopPropagation();
    setQuantity((q) => Math.max(1, q + delta));
  };

  const handleWishlist = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setWishlisted((v) => !v);
    addToast({
      title: wishlisted ? "Removed from Wishlist" : "Saved to Wishlist",
      message: product.name,
      type: wishlisted ? "info" : "success",
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
    handleAddToCart,
    handleStepQuantity,
    handleWishlist,
  };
}
