import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { SEO } from "../../../components/common/SEO.jsx";

import {
  Star,
  ChevronRight,
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Percent,
  RefreshCw,
  Cpu,
  HardDrive,
  Monitor,
  Battery,
  Weight,
  Layers,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Lock,
  Headphones,
  Check,
  ArrowRight,
} from "lucide-react";
import { Spinner } from "../../../components/ui/Alert.jsx";


function getHighlightIcon(label = "") {
  const l = label.toLowerCase();
  if (l.includes("processor") || l.includes("motor") || l.includes("driver") || l.includes("chip")) return Cpu;
  if (l.includes("ram") || l.includes("storage") || l.includes("memory") || l.includes("jar")) return HardDrive;
  if (l.includes("display") || l.includes("screen") || l.includes("monitor")) return Monitor;
  if (l.includes("battery") || l.includes("playtime") || l.includes("power") || l.includes("charge")) return Battery;
  if (l.includes("weight")) return Weight;
  if (l.includes("type") || l.includes("pot") || l.includes("material") || l.includes("body")) return Layers;
  if (l.includes("os") || l.includes("speed") || l.includes("calling") || l.includes("technology")) return Zap;
  return Sparkles;
}

export function ProductDetailsPage() {
  const { slug } = useParams();
  const { country } = useCountryStore();
  const { cart, setCart, addItem, openCart } = useCartStore();
  const { addToast } = useUIStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    setSelectedImage(0);
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", slug, country.code],
    queryFn: () => Api.catalog.getProductBySlug(slug),
  });

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
  const brand = typeof product?.brand === "object" ? product.brand?.name : product?.brand || "Vanom Choice";
  const brandName = brand;
  const categoryName = typeof product?.category === "object" ? product.category?.name : product?.category || "General";

  // Resolve country pricing entry from product.countries
  const countryPricing = useMemo(() => {
    if (!product?.countries || !Array.isArray(product.countries)) return null;
    return (
      product.countries.find(
        (c) =>
          c.country?.code === country.code ||
          c.currency === country.currency ||
          c.country?.name?.toLowerCase() === country.name?.toLowerCase() ||
          (country.code === "US" && c.country?.code === "US") ||
          (country.code === "CA" && c.country?.code === "CA")
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
          (country.code === "US" && c.country?.code === "US") ||
          (country.code === "CA" && c.country?.code === "CA")
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
  const emiAmount = Math.round(price / 24) || 29;

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

  const currentImage = gallery[selectedImage] || gallery[0] || product?.image;

  // Estimated Delivery String
  const deliveryDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return `By ${d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}`;
  }, []);

  // Dynamic Delivery & Policy Info from Database / Product API
  const deliveryInfoText = product?.deliveryInfo || product?.delivery_info || `By ${deliveryDateStr}`;
  const returnPolicyText = product?.returnPolicy || product?.return_policy || "7 Days Easy Returns";
  const warrantyInfoText = product?.warrantyInfo || product?.warranty_info || "1 Year Brand Warranty";

  // Highlights (8 Pills)
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
      { label: "Delivery", value: deliveryInfoText, icon: Truck },
      { label: "Returns", value: returnPolicyText, icon: RotateCcw },
      { label: "Warranty", value: warrantyInfoText, icon: ShieldCheck },
      { label: "Authenticity", value: "100% Genuine Organic", icon: CheckCircle2 },
      { label: "Category", value: categoryName, icon: Cpu },
      { label: "Brand", value: brandName, icon: Sparkles },
      { label: "SKU", value: product?.sku || "Standard", icon: Layers },
      { label: "Rating", value: `${rating} / 5 Stars`, icon: Star },
    ];
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
    return {
      "Product Title": title,
      "Brand": brandName,
      "Category": categoryName,
      "SKU / Code": product?.sku || product?.id || "N/A",
      "Ranking": product?.isBestSeller ? "#1 Best Seller in " + categoryName : (product?.isNew ? "New Launch" : "Premium Choice"),
      "Delivery": deliveryInfoText,
      "Return Policy": returnPolicyText,
      "Warranty": warrantyInfoText,
      "Stock Status": product?.isActive !== false && availableStock > 0 ? `${availableStock} Units In Stock` : "Out of Stock",
    };
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
    const cartItemId = selectedVariantObj?.id || product?.id || slug;
    const existing = cart.items.find((i) => i.id === cartItemId || i.variantId === selectedVariantObj?.id);

    if (existing && existing.quantity >= availableStock) {
      addToast({
        title: "Stock Limit Reached",
        message: `Only ${availableStock} units available in stock.`,
        type: "warning",
      });
      setAddingToCart(false);
      return;
    }

    addItem({
      id: cartItemId,
      productId: product?.id,
      variantId: selectedVariantObj?.id,
      name: selectedVariantObj?.variant_name ? `${title} (${selectedVariantObj.variant_name})` : title,
      price,
      quantity: 1,
      maxStock: availableStock,
      image: currentImage,
      sku: selectedVariantObj?.sku,
    });

    addToast({
      title: "Added to Cart",
      message: `${title} added to cart. (${availableStock} in stock)`,
      type: "success",
    });
    setTimeout(() => setAddingToCart(false), 500);
    openCart();
  };

  const handleWishlist = () => {
    setWishlisted(!wishlisted);
    addToast({
      title: wishlisted ? "Removed from Wishlist" : "Saved to Wishlist",
      message: title,
      type: wishlisted ? "info" : "success",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-white">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-gray-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-16 font-sans">
      <SEO
        title={`${title} - Buy Online at Best Price`}
        description={product?.description || subtitle}
        keywords={`${title}, ${brand}, ${categoryName}, buy online, best price`}
        ogType="product"
        ogImage={currentImage}
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": title,
          "image": gallery,
          "description": product?.description || subtitle,
          "sku": product?.sku || product?.id,
          "brand": {
            "@type": "Brand",
            "name": brand,
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": country.currency || "INR",
            "price": price,
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "url": typeof window !== "undefined" ? window.location.href : "",
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": reviewsCount,
          },
        }}
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">


        {/* ─── 1. Breadcrumbs matching reference ─── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/products" className="hover:text-gray-900 transition-colors">
            {categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500">{brand}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-gray-900 truncate max-w-xs">{title}</span>
        </nav>

        {/* ─── 2. Top Product Showcase Section ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── LEFT: Product Gallery (Thumbnails + Main Image) ── */}
          <div className="lg:col-span-6 flex gap-4">

            {/* Vertical Thumbnail Strip (Only show if multiple images exist) */}
            {gallery.length > 1 && (
              <div className="flex flex-col gap-2.5 shrink-0">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 rounded-xl border p-1 bg-gray-50/50 flex items-center justify-center overflow-hidden transition-all cursor-pointer ${selectedImage === idx
                      ? "border-[#003D2B] ring-2 ring-[#003D2B]/20"
                      : "border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Central Main Image Container */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[440px]">
              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt={title}
                    className="max-h-[340px] sm:max-h-[400px] w-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                  />
                  <button
                    className="absolute right-4 bottom-4 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors cursor-pointer"
                    title="Expand image"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full min-h-[320px] flex items-center justify-center text-center p-8 bg-emerald-50/70 rounded-xl border-2 border-dashed border-emerald-300">
                  <span className="font-extrabold text-2xl text-[#1a3c2e] leading-snug max-w-sm">
                    {title}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT: Product Info, Pricing & Actions ── */}
          <div className="lg:col-span-6 space-y-4">

            {/* Brand badge & Wishlist button */}
            <div className="flex items-center justify-between">
              <span className="bg-[#E50914] text-white text-xs font-extrabold uppercase px-2.5 py-0.5 rounded">
                {brand}
              </span>
              <button
                onClick={handleWishlist}
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            </div>

            {/* Ratings & Q&A */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-900">{rating}</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[#F9BC15] text-[#F9BC15]" />
                ))}
              </div>
              <span className="text-gray-500">({reviewsCount.toLocaleString()} ratings)</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">{answeredQuestions} answered questions</span>
            </div>

            {/* Best Seller / New / Featured Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {product?.isBestSeller && (
                <span className="bg-[#003D2B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                  #1 Best Seller
                </span>
              )}
              {product?.isNew && (
                <span className="bg-[#00875A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                  New Launch
                </span>
              )}
              {product?.isFeatured && (
                <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                  Featured
                </span>
              )}
              <span className="text-xs text-gray-500">in {categoryName}</span>
            </div>

            {/* Price Row */}
            <div className="pt-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-gray-900">
                  {formatPrice(price, country.currency, country.symbol)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(mrp, country.currency, country.symbol)}
                </span>
                <span className="text-xs font-bold text-[#059669] bg-[#EAF7F0] px-2 py-0.5 rounded">
                  {discount}% OFF
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Inclusive of all taxes</p>
            </div>


            {/* Dynamic Variant Selector (if product has variants) */}
            {product?.variants && product.variants.length > 0 && (
              <div className="pt-2 pb-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">
                    Select Option / Size:
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {selectedVariantObj ? selectedVariantObj.variant_name || selectedVariantObj.name : "Standard"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = (selectedVariantObj?.id || product.variants[0]?.id) === v.id;
                    const vPrice = v.price_usd || v.price_cad || price;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-start gap-0.5 ${isSelected
                          ? "bg-emerald-50/80 border-[#003D2B] text-[#003D2B] ring-2 ring-[#003D2B]/20"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                      >
                        <span>{v.variant_name || v.name}</span>
                        <span className="text-[10px] font-normal text-gray-500">
                          {formatPrice(vPrice, country.currency, country.symbol)} {v.stock_quantity !== undefined ? `• ${v.stock_quantity} left` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3 Inline Trust / Delivery Pillars */}
            <div className="grid grid-cols-3 gap-2.5 py-2">
              <div className="bg-[#F8FAF9] rounded-xl p-3 border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#003D2B] text-white flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-[#dff0d8]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-900">Free Delivery</h4>
                  <p className="text-[10px] text-gray-500">{deliveryInfoText}</p>
                </div>
              </div>

              <div className="bg-[#F8FAF9] rounded-xl p-3 border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#003D2B] text-white flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-[#dff0d8]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-900">Return Policy</h4>
                  <p className="text-[10px] text-gray-500">{returnPolicyText}</p>
                </div>
              </div>

              <div className="bg-[#F8FAF9] rounded-xl p-3 border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#003D2B] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#dff0d8]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-900">Warranty</h4>
                  <p className="text-[10px] text-gray-500">{warrantyInfoText}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart + Buy Now */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3 px-6 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${isOutOfStock
                  ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "border-[rgb(60,170,130)] text-[rgb(60,170,130)] hover:bg-[rgb(60,170,130)]/10 active:scale-95"
                  }`}
              >
                {isOutOfStock ? (
                  <span>Sold Out</span>
                ) : addingToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-[rgb(60,170,130)] hover:brightness-95 text-white active:scale-95 cursor-pointer"
                  }`}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{isOutOfStock ? "Out of Stock" : "Buy Now"}</span>
              </button>
            </div>

          </div>

        </div>

        {/* ─── 4. Key Highlights (8 Card Pill Grid) ─── */}
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-bold text-gray-900">Key Highlights</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {highlights.map((item, idx) => {
              const Icon = item.icon || Sparkles;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-3.5 border border-gray-200 text-center flex flex-col items-center justify-center shadow-2xs hover:border-[#006B3C]/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-[11px] font-bold text-gray-900">{item.label}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 5. About This Item & Specifications Table (2 Column Grid) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">

          {/* Left: About This Item */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-base font-bold text-gray-900">About this item</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 list-disc list-inside leading-relaxed">
              {features.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>
          </div>

          {/* Right: Brand Specifications Table */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-xs">
              {Object.entries(specifications).map(([k, val], idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-2 px-4 py-2.5 ${idx % 2 === 0 ? "bg-gray-50/70" : "bg-white"
                    } border-b border-gray-100 last:border-b-0`}
                >
                  <span className="font-bold text-gray-700">{k}</span>
                  <span className="text-gray-600">{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ─── 6. "You may also like" Product Carousel ─── */}
        {relatedList.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">You may also like</h3>
              <Link
                to="/products"
                className="text-xs font-bold text-[#006B3C] hover:text-[#003D2B] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedList.map((p, idx) => (
                <ProductCard key={p.id || idx} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ─── 7. Bottom Trust Feature Strip (5-items) ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6 border-t border-gray-200">
          {[
            { title: "100% Genuine", desc: "Products", icon: CheckCircle2 },
            { title: "Secure", desc: "Payments", icon: Lock },
            { title: "Easy", desc: "Returns", icon: RotateCcw },
            { title: "Fast & Reliable", desc: "Delivery", icon: Truck },
            { title: "Dedicated", desc: "Customer Support", icon: Headphones },
          ].map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{badge.title}</h4>
                  <p className="text-[11px] text-gray-500">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default ProductDetailsPage;
