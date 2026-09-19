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
    addItem({
      id: cartItemId,
      productId: product?.id || slug,
      variantId: selectedVariantObj?.id || null,
      name: `${title}${selectedVariantObj ? ` - ${selectedVariantObj.variant_name || selectedVariantObj.name}` : ""}`,
      price: price,
      image: gallery[0] || product?.image,
      quantity: 1,
    });

    addToast({
      title: "Added to Cart",
      message: `${title} was added to your cart.`,
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

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#FBFDFB]">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-gray-600 animate-pulse">Loading authentic product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#FBFDFB]">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-600 max-w-md">
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
    <div className="min-h-screen bg-[#FBFDFB] text-gray-800 pb-20">
      <SEO
        title={`${title} - Buy Online | Vanom`}
        description={subtitle || `Buy ${title} online with best cross-border prices and free shipping.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 sm:space-y-8">

        {/* ─── 1. Breadcrumbs ─── */}
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
          <ProductGallery
            gallery={gallery}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            title={title}
          />

          {/* ── RIGHT: Product Info, Pricing & Actions ── */}
          <div className="lg:col-span-6 space-y-4">

            {/* Brand badge & Wishlist button */}
            <div className="flex items-center justify-between">
              <span className="bg-[#E50914] text-white text-xs font-extrabold uppercase px-2.5 py-0.5 rounded">
                {brand}
              </span>
              <button
                type="button"
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

            {/* Dynamic Variant Selector */}
            <VariantSelector
              variants={product?.variants}
              selectedVariantId={selectedVariantObj?.id}
              onSelectVariant={setSelectedVariantId}
              country={country}
              baseFallbackPrice={product.basePrice}
            />

            {/* 3 Inline Trust / Delivery Pillars */}
            <DeliveryTrustPillars
              deliveryInfo={deliveryInfoText}
              returnPolicy={returnPolicyText}
              warrantyInfo={warrantyInfoText}
            />

            {/* Action Buttons: Add to Cart + Buy Now */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
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
                type="button"
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

        {/* ─── 3. Key Highlights (8 Card Pill Grid) ─── */}
        <ProductHighlightsGrid highlights={highlights} />

        {/* ─── 4. About This Item & Specifications Table ─── */}
        <ProductSpecifications features={features} specifications={specifications} />

        {/* ─── 5. "You may also like" Product Carousel ─── */}
        <RelatedProductsSection relatedProducts={relatedList} />

        {/* ─── 6. Bottom Trust Feature Strip (5-items) ─── */}
        <StoreTrustBadges />

      </div>
    </div>
  );
}

export default ProductDetailsPage;
