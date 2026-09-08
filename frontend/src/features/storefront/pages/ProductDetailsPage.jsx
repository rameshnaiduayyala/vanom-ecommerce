import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ProductCard } from "../components/ProductCard.jsx";
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

const FALLBACK_THUMBNAILS = [
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
];

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
  const { cart, setCart, openCart } = useCartStore();
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

  const title = product?.name || "Product Name";
  const subtitle = product?.specs || product?.subtitle || product?.description || "High Performance Quality Product";
  const brand = product?.brand || "Vanom Choice";
  
  // Dynamic price resolving variant USD / CAD or country price
  const basePrice = country.code === "CA"
    ? (selectedVariantObj?.price_cad || product?.price_cad || product?.priceCA || (product?.price_usd ? product.price_usd * 1.35 : 45))
    : country.code === "US"
    ? (selectedVariantObj?.price_usd || product?.price_usd || product?.priceUS || 35)
    : (product?.price || product?.pricing?.[country.code]?.retailPrice || product?.pricing?.IN?.retailPrice || 1999);

  const price = Number(basePrice);
  const baseMrp = country.code === "CA"
    ? (selectedVariantObj?.old_price_cad || product?.old_price_cad || Math.round(price * 1.35))
    : country.code === "US"
    ? (selectedVariantObj?.old_price_usd || product?.old_price_usd || product?.oldPrice || Math.round(price * 1.35))
    : (product?.mrp || product?.pricing?.[country.code]?.mrp || (price > 0 ? Math.round(price * 1.35) : 2699));

  const mrp = Number(baseMrp);
  const discount = product?.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 25);
  const rating = product?.rating || 4.7;
  const reviewsCount = product?.reviewsCount || 1420;
  const answeredQuestions = Math.round(reviewsCount * 0.12) || 85;
  const emiAmount = Math.round(price / 24) || 299;

  // Gallery
  const gallery = useMemo(() => {
    if (product?.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery;
    }
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map((img) => (typeof img === "string" ? img : img.file?.url || img.url || img));
    }
    if (product?.image) {
      return [product.image];
    }
    return FALLBACK_THUMBNAILS;
  }, [product]);

  const currentImage = gallery[selectedImage] || gallery[0] || product?.image;

  // Highlights (8 Pills)
  const highlights = useMemo(() => {
    if (product?.highlights && Array.isArray(product.highlights) && product.highlights.length > 0) {
      return product.highlights.map((h) => ({
        label: h.label,
        value: h.value,
        icon: getHighlightIcon(h.label),
      }));
    }
    return [
      { label: "Category", value: product?.category || "General", icon: Cpu },
      { label: "Brand", value: brand, icon: Sparkles },
      { label: "Warranty", value: product?.specifications?.Warranty || "1 Year Standard", icon: ShieldCheck },
      { label: "Delivery", value: "Express 2-3 Days", icon: Truck },
      { label: "Condition", value: "100% Authentic Brand New", icon: CheckCircle2 },
      { label: "Stock", value: product?.stock ? `${product.stock} Units In Stock` : "In Stock & Ready", icon: Layers },
      { label: "Rating", value: `${rating} / 5 Stars`, icon: Star },
      { label: "Returns", value: "7-Day Easy Return", icon: RotateCcw },
    ];
  }, [product, brand, rating]);

  // Features list
  const features = useMemo(() => {
    if (product?.features && Array.isArray(product.features) && product.features.length > 0) {
      return product.features;
    }
    if (product?.description) {
      return [
        product.description,
        "Commercial-grade certified build for long-lasting performance and reliability",
        "Comprehensive warranty backed by authorized brand service centers",
        "Verified authentic packaging with original brand accessories included",
      ];
    }
    return [
      "Commercial-grade certified build for long-lasting performance",
      "Energy-efficient architecture with precision controls",
      "Comprehensive warranty backed by authorized brand service centers",
      "Verified authentic packaging with original accessories included",
    ];
  }, [product]);

  // Specifications
  const specifications = useMemo(() => {
    if (product?.specifications && Object.keys(product.specifications).length > 0) {
      return product.specifications;
    }
    return {
      Brand: brand,
      Model: product?.sku || "VN-" + (product?.id || "GENERIC"),
      Category: product?.category || "Standard",
      Availability: "In Stock",
      Warranty: "1 Year Comprehensive",
      "Country of Origin": "India",
    };
  }, [product, brand]);

  // Related items
  const relatedList = useMemo(() => {
    const raw = Array.isArray(allProducts?.items) ? allProducts.items : Array.isArray(allProducts) ? allProducts : [];
    const filtered = raw.filter((p) => p.slug !== slug && p.id !== product?.id && p.id !== slug);
    return filtered.slice(0, 5);
  }, [allProducts, slug, product]);

  const handleAddToCart = () => {
    setAddingToCart(true);
    const existing = cart.items.find((i) => i.id === (product?.id || slug));
    let newItems = [];
    if (existing) {
      newItems = cart.items.map((i) =>
        i.id === (product?.id || slug) ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [
        ...cart.items,
        {
          id: product?.id || slug,
          name: title,
          price,
          quantity: 1,
          image: currentImage,
        },
      ];
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({
      title: "Added to Cart",
      message: `${title} added to cart.`,
      type: "success",
    });
    setTimeout(() => setAddingToCart(false), 800);
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        
        {/* ─── 1. Breadcrumbs matching reference ─── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/products" className="hover:text-gray-900 transition-colors">
            {product?.category || "Catalog"}
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
                    className={`w-14 h-14 rounded-xl border p-1 bg-gray-50/50 flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                      selectedImage === idx
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

            {/* #1 Best Seller Tag */}
            <div className="flex items-center gap-2">
              <span className="bg-[#003D2B] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                #1 Best Seller
              </span>
              <span className="text-xs text-gray-500">in {product?.category || "Featured Catalog"}</span>
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

            {/* EMI Text */}
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <span>EMI from <strong>₹{emiAmount.toLocaleString()}/month</strong>.</span>
              <button className="text-[#006B3C] font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer">
                <span>View Plans</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
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
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-start gap-0.5 ${
                          isSelected
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
              <div className="bg-[#F8FAF9] rounded-xl p-3 border border-gray-200/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#003D2B] text-white flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-[#dff0d8]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-900">Free Delivery</h4>
                  <p className="text-[10px] text-gray-500">By Thu, 12 Sep</p>
                </div>
              </div>

              <div className="bg-[#F8FAF9] rounded-xl p-3 border border-gray-200/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#003D2B] text-white flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-[#dff0d8]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-900">7 Days</h4>
                  <p className="text-[10px] text-gray-500">Easy Returns</p>
                </div>
              </div>

              <div className="bg-[#F8FAF9] rounded-xl p-3 border border-gray-200/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#003D2B] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#dff0d8]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-900">1 Year</h4>
                  <p className="text-[10px] text-gray-500">Brand Warranty</p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart + Buy Now */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3 px-6 rounded-xl border-2 border-[rgb(60,170,130)] text-[rgb(60,170,130)] hover:bg-[rgb(60,170,130)]/10 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                {addingToCart ? (
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
                className="py-3 px-6 rounded-xl bg-[rgb(60,170,130)] hover:brightness-95 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>

          </div>

        </div>

        {/* ─── 3. Offers Available (4 Card Grid) ─── */}
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-bold text-gray-900">Offers Available</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">₹2,000 Instant Discount</h4>
                <p className="text-[11px] text-gray-500">on HDFC Bank Cards</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">10% Cashback</h4>
                <p className="text-[11px] text-gray-500">up to ₹2,000 on UPI</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">No Cost EMI</h4>
                <p className="text-[11px] text-gray-500">from ₹{emiAmount.toLocaleString()}/month</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Exchange Offer</h4>
                <p className="text-[11px] text-gray-500">Up to ₹5,000 off</p>
              </div>
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
                  className={`grid grid-cols-2 px-4 py-2.5 ${
                    idx % 2 === 0 ? "bg-gray-50/70" : "bg-white"
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
