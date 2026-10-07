import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { SEO } from "../../../components/common/SEO.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";

// Modular Storefront Product Components
import { ProductGallery } from "../components/products/ProductGallery.jsx";
import { VariantSelector } from "../components/products/VariantSelector.jsx";
import { DeliveryTrustPillars } from "../components/products/DeliveryTrustPillars.jsx";
import { ProductHighlightsGrid, getHighlightIcon } from "../components/products/ProductHighlightsGrid.jsx";
import { ProductSpecifications } from "../components/products/ProductSpecifications.jsx";
import { RelatedProductsSection } from "../components/products/RelatedProductsSection.jsx";
import { StoreTrustBadges } from "../components/products/StoreTrustBadges.jsx";

import {
  Star,
  ChevronRight,
  Heart,
  Share2,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Check,
} from "lucide-react";

export function ProductDetailsPage() {
  const { slug } = useParams();
  const { country } = useCountryStore();
  const { cart, setCart, addItem, openCart } = useCartStore();
  const { addToast } = useUIStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariantId(null);
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", slug, country.code],
    queryFn: () => Api.catalog.getProductBySlug(slug),
  });

  useEffect(() => {
    if (product?.variants?.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  const { data: allProducts = [] } = useQuery({
    queryKey: ["all-products-for-rel"],
    queryFn: () => Api.catalog.getProducts(),
  });

  const selectedVariantObj = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  }, [product, selectedVariantId]);

  const title = product?.name || "";
  const subtitle = product?.description || "";
  const brandName = useMemo(() => {
    if (product?.brand) {
      if (typeof product.brand === "object" && product.brand.name) return product.brand.name;
      if (typeof product.brand === "string" && product.brand.trim()) return product.brand.trim();
    }
    if (product?.brandName && typeof product.brandName === "string" && product.brandName.trim()) {
      return product.brandName.trim();
    }
    return null;
  }, [product]);
  const brand = brandName;
  const categoryName = typeof product?.category === "object" ? product.category?.name : product?.category || "General";

  // Resolve country pricing entry from product.countries
  const countryPricing = useMemo(() => {
    if (!product?.countries || !Array.isArray(product.countries)) return null;
    return (
      product.countries.find(
        (c) =>
          c.country?.code === country.code ||
          c.currency === country.currency ||
          (typeof c.country === "string" && c.country.toLowerCase() === country.name?.toLowerCase()) ||
          (country.code === "US" && (c.currency === "USD" || c.country === "United States" || c.country?.code === "US")) ||
          (country.code === "CA" && (c.currency === "CAD" || c.country === "Canada" || c.country?.code === "CA"))
      ) || product.countries[0]
    );
  }, [product, country]);

  // Resolve variant country pricing if variant selected
  const variantCountryPricing = useMemo(() => {
    if (!selectedVariantObj?.countries || !Array.isArray(selectedVariantObj.countries)) return null;
    return (
      selectedVariantObj.countries.find(
        (c) =>
          c.country?.code === country.code ||
          c.currency === country.currency ||
          (typeof c.country === "string" && c.country.toLowerCase() === country.name?.toLowerCase()) ||
          (country.code === "US" && (c.currency === "USD" || c.country === "United States" || c.country?.code === "US")) ||
          (country.code === "CA" && (c.currency === "CAD" || c.country === "Canada" || c.country?.code === "CA"))
      ) || selectedVariantObj.countries[0]
    );
  }, [selectedVariantObj, country]);

  // Dynamic price resolving variant / country price / basePrice
  const basePrice = country.code === "CA"
    ? (variantCountryPricing?.price ?? selectedVariantObj?.price_cad ?? countryPricing?.price ?? product?.price_cad ?? product?.priceCA ?? (product?.basePrice ? Number(product.basePrice) * 1.35 : 45))
    : country.code === "US"
      ? (variantCountryPricing?.price ?? selectedVariantObj?.price_usd ?? countryPricing?.price ?? product?.price_usd ?? product?.priceUS ?? product?.basePrice ?? 35)
      : (countryPricing?.price ?? product?.basePrice ?? product?.price ?? product?.pricing?.[country.code]?.retailPrice ?? 1999);

  const price = Number(basePrice) || 0;

  const baseMrp = country.code === "CA"
    ? (variantCountryPricing?.oldPrice ?? selectedVariantObj?.old_price_cad ?? countryPricing?.oldPrice ?? product?.old_price_cad ?? (price > 0 ? Math.round(price * 1.25) : 55))
    : country.code === "US"
      ? (variantCountryPricing?.oldPrice ?? selectedVariantObj?.old_price_usd ?? countryPricing?.oldPrice ?? product?.old_price_usd ?? product?.oldPrice ?? (price > 0 ? Math.round(price * 1.25) : 45))
      : (countryPricing?.oldPrice ?? product?.mrp ?? product?.pricing?.[country.code]?.mrp ?? (price > 0 ? Math.round(price * 1.25) : 2499));

  const mrp = Number(baseMrp) || price;
  const discount = product?.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const rating = product?.rating || 4.8;
  const reviewsCount = product?.reviewsCount || (product?.reviews?.length ?? 12);
  const answeredQuestions = Math.round(reviewsCount * 0.12) || 4;

  // Gallery
  const gallery = useMemo(() => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map((img) => (typeof img === "string" ? img : img.file?.url || img.url || img));
    }
    if (product?.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery;
    }
    if (product?.image) {
      return [product.image];
    }
    return [];
  }, [product]);

  // Estimated Delivery String
  const deliveryDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return `By ${d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}`;
  }, []);

  // Dynamic Delivery & Policy Info from Database / Product API (optional per product)
  const deliveryInfoText = product?.deliveryInfo || product?.delivery_info || null;
  const returnPolicyText = product?.returnPolicy || product?.return_policy || null;
  const warrantyInfoText = product?.warrantyInfo || product?.warranty_info || null;

  // Highlights (Pills)
  const highlights = useMemo(() => {
    if (product?.keyHighlights && Array.isArray(product.keyHighlights) && product.keyHighlights.length > 0) {
      return product.keyHighlights.map((h) => ({
        label: h.label || "Highlight",
        value: h.value || "",
        icon: getHighlightIcon(h.label),
      }));
    }
    if (product?.highlights && Array.isArray(product.highlights) && product.highlights.length > 0) {
      return product.highlights.map((h) => ({
        label: h.label,
        value: h.value,
        icon: getHighlightIcon(h.label),
      }));
    }
    return [
      deliveryInfoText ? { label: "Delivery", value: deliveryInfoText, icon: Truck } : null,
      returnPolicyText ? { label: "Returns", value: returnPolicyText, icon: RotateCcw } : null,
      warrantyInfoText ? { label: "Warranty", value: warrantyInfoText, icon: ShieldCheck } : null,
      { label: "Authenticity", value: "100% Genuine Organic", icon: CheckCircle2 },
      { label: "Category", value: categoryName, icon: Cpu },
      { label: "Brand", value: brandName, icon: Sparkles },
      { label: "SKU", value: product?.sku || "Standard", icon: Layers },
      { label: "Rating", value: `${rating} / 5 Stars`, icon: Star },
    ].filter(Boolean);
  }, [product, deliveryInfoText, returnPolicyText, warrantyInfoText, brandName, categoryName, rating]);

  // Features list
  const features = useMemo(() => {
    if (product?.features && Array.isArray(product.features) && product.features.length > 0) {
      return product.features;
    }
    if (product?.description) {
      return [
        product.description,
        "Certified pure organic formulation with zero artificial additives",
        "Directly sourced and batch-tested for superior quality & potency",
        "Secure eco-friendly food-grade packaging",
      ];
    }
    return [
      "Certified pure organic formulation with zero artificial additives",
      "Directly sourced and batch-tested for superior quality & potency",
      "Secure eco-friendly food-grade packaging",
    ];
  }, [product]);

  // Available Stock
  const availableStock = selectedVariantObj
    ? (variantCountryPricing?.stock ?? selectedVariantObj.stock_quantity ?? selectedVariantObj.stock ?? 100)
    : (countryPricing?.stock ?? product?.stock ?? product?.totalStock ?? 100);

  const isOutOfStock = (product?.isActive === false) || availableStock <= 0;

  // Specifications
  const specifications = useMemo(() => {
    if (product?.specifications && Object.keys(product.specifications).length > 0) {
      return product.specifications;
    }
    const specs = {
      "Product Title": title,
      "Brand": brandName,
      "Category": categoryName,
      "SKU / Code": product?.sku || product?.id || "N/A",
      "Ranking": product?.isBestSeller ? "#1 Best Seller in " + categoryName : (product?.isNew ? "New Launch" : "Premium Choice"),
    };
    if (deliveryInfoText) specs["Delivery"] = deliveryInfoText;
    if (returnPolicyText) specs["Return Policy"] = returnPolicyText;
    if (warrantyInfoText) specs["Warranty"] = warrantyInfoText;
    specs["Stock Status"] = product?.isActive !== false && availableStock > 0 ? `${availableStock} Units In Stock` : "Out of Stock";
    return specs;
  }, [product, title, brandName, categoryName, deliveryInfoText, returnPolicyText, warrantyInfoText, availableStock]);

  // Related items
  const relatedList = useMemo(() => {
    const raw = Array.isArray(allProducts?.items) ? allProducts.items : Array.isArray(allProducts) ? allProducts : [];
    const filtered = raw.filter((p) => p.slug !== slug && p.id !== product?.id && p.id !== slug);
    return filtered.slice(0, 5);
  }, [allProducts, slug, product]);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast({
        title: "Out of Stock",
        message: `${title} is currently sold out.`,
        type: "warning",
      });
      return;
    }

    setAddingToCart(true);

    const activeVariant = selectedVariantObj || (product?.variants?.length > 0 ? product.variants[0] : null);
    const variantId = activeVariant?.id || null;
    const variantLabel =
      activeVariant?.name ||
      activeVariant?.variant_name ||
      (activeVariant?.attributes && typeof activeVariant.attributes === "object"
        ? Object.values(activeVariant.attributes).filter(Boolean).join(" / ")
        : null);

    const itemName = variantLabel ? `${title} - ${variantLabel}` : title;
    const resolvedProductId = product?.id || slug;
    const cartItemId = variantId ? `${resolvedProductId}_${variantId}` : resolvedProductId;

    addItem({
      id: cartItemId,
      productId: resolvedProductId,
      variantId: variantId,
      name: itemName,
      slug: product?.slug || slug,
      price: price,
      image: gallery[0] || product?.image,
      quantity: 1,
      sku: activeVariant?.sku || product?.sku,
    });

    addToast({
      title: "Added to Cart",
      message: `${itemName} was added to your cart.`,
      type: "success",
    });

    setTimeout(() => {
      setAddingToCart(false);
      openCart();
    }, 400);
  };

  const handleWishlist = () => {
    setWishlisted(!wishlisted);
    addToast({
      title: wishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      message: `${title} ${wishlisted ? "removed from" : "saved to"} your wishlist.`,
      type: "info",
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle || `Check out ${title} on Vanom Organics`,
          url: shareUrl,
        });
        return;
      } catch {
        // User canceled share dialogue
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedShare(true);
        addToast({
          title: "Link Copied!",
          message: "Product link copied to your clipboard.",
          type: "success",
        });
        setTimeout(() => setCopiedShare(false), 2000);
      } catch {
        addToast({
          title: "Unable to Copy",
          message: "Please copy the URL from your browser address bar.",
          type: "warning",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#FBFDFB]">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#FBFDFB]">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-md">
          The requested product could not be found or has been removed from the catalog.
        </p>
        <Link
          to="/products"
          className="mt-2 px-6 py-2.5 bg-[#006B3C] hover:bg-[#003D2B] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFDFB] text-gray-800 pb-24">
      <SEO
        title={`${title} - Buy Online | Vanom`}
        description={subtitle || `Buy ${title} online with best cross-border prices and free shipping.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">

        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <Link to="/products" className="hover:text-gray-700 transition-colors">{categoryName}</Link>
          {brand && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-gray-400">{brand}</span>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="font-semibold text-gray-700 truncate max-w-[180px] sm:max-w-xs">{title}</span>
        </nav>

        {/* ─── Main Product Section ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-start">

          {/* ── LEFT: Gallery ── */}
          <ProductGallery
            gallery={gallery}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            title={title}
          />

          {/* ── RIGHT: Product Info Panel ── */}
          <div className="lg:col-span-6 lg:sticky lg:top-6 space-y-5">

            {/* Brand + Wishlist + Share row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {brandName && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black tracking-widest uppercase bg-[#003D2B] text-white shadow-sm">
                    {brandName}
                  </span>
                )}
                {product?.isBestSeller && (
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    #1 Best Seller
                  </span>
                )}
                {product?.isNew && (
                  <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    New Launch
                  </span>
                )}
                {product?.isFeatured && !product?.isBestSeller && (
                  <span className="inline-flex items-center gap-1 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    copiedShare
                      ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                      : "bg-white border-gray-200 hover:border-emerald-300 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/40"
                  }`}
                  title="Share product"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleWishlist}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    wishlisted
                      ? "bg-rose-50 border-rose-300 text-rose-500"
                      : "bg-white border-gray-200 hover:border-rose-300 text-gray-400 hover:text-rose-500 hover:bg-rose-50/40"
                  }`}
                  title="Save to wishlist"
                  aria-label="Save to wishlist"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight">
              {title}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[#F9BC15] text-[#F9BC15]" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-800">{rating}</span>
              <span className="text-xs text-gray-400">({reviewsCount.toLocaleString()} ratings)</span>
              <span className="w-px h-3 bg-gray-200 mx-0.5" />
              <span className="text-xs text-gray-500">{answeredQuestions} answered questions</span>
              <span className="text-xs text-gray-400">in <span className="font-semibold text-gray-600">{categoryName}</span></span>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Price block */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none">
                  {formatPrice(price, country.currency, country.symbol)}
                </span>
                <span className="text-sm text-gray-400 line-through font-medium">
                  {formatPrice(mrp, country.currency, country.symbol)}
                </span>
                {discount > 0 && (
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">Inclusive of all taxes.{deliveryInfoText ? ` ${deliveryInfoText}.` : ""}</p>
            </div>

            {/* Variant Selector */}
            <VariantSelector
              variants={product?.variants}
              selectedVariantId={selectedVariantObj?.id}
              onSelectVariant={setSelectedVariantId}
              country={country}
              baseFallbackPrice={product.basePrice}
            />

            {/* Delivery / Return / Warranty pillars */}
            <DeliveryTrustPillars
              deliveryInfo={deliveryInfoText}
              returnPolicy={returnPolicyText}
              warrantyInfo={warrantyInfoText}
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
                  isOutOfStock
                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "border-[#006B3C] text-[#006B3C] hover:bg-[#006B3C]/8 hover:shadow-sm"
                }`}
              >
                {isOutOfStock ? (
                  <span>Sold Out</span>
                ) : addingToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-[#006B3C] hover:bg-[#005230] text-white cursor-pointer hover:shadow-md hover:shadow-emerald-900/20"
                }`}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{isOutOfStock ? "Out of Stock" : "Buy Now"}</span>
              </button>
            </div>

          </div>
        </div>

        {/* ─── Below-fold Sections ─── */}
        <div className="mt-12 space-y-8">

          {/* Key Highlights */}
          <ProductHighlightsGrid highlights={highlights} />

          {/* Description + Specs */}
          <ProductSpecifications
            description={product?.description || ""}
            features={features}
            specifications={specifications}
          />

          {/* Related Products */}
          <RelatedProductsSection relatedProducts={relatedList} />

          {/* Store Trust Strip */}
          <StoreTrustBadges />

        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;

