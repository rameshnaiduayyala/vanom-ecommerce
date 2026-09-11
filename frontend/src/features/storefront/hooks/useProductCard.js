import { useState } from "react";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80";

/** Resolves price from multiple possible API shapes */
function resolvePrice(product, countryCode) {
  const pricing =
    product.pricing?.[countryCode] ||
    product.pricing?.US ||
    product.pricing?.IN ||
    {};

  const raw =
    product.resolvedPrice?.unitPrice ||
    product.prices?.[0]?.amount ||
    product.variants?.[0]?.prices?.[0]?.amount ||
    pricing.retailPrice ||
    product.price ||
    339;

  const price = Number(raw);
  const originalPrice =
    product.mrp || pricing.mrp || (price > 0 ? Math.round(price * 1.32) : 400);
  const discount =
    product.discount ||
    (originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);

  return { price, originalPrice, discount };
}

/** Resolves the best available product image */
function resolveImage(product) {
  return (
    product.image ||
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    FALLBACK_IMAGE
  );
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
