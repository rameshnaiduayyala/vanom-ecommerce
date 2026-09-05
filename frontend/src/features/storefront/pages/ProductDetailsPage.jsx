import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { getLiveProducts } from "../../../services/api/mock-data.js";
import { ProductCard } from "../components/ProductCard.jsx";
import {
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Package,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Home,
  RefreshCw,
  Globe2,
  BadgeCheck,
  Building2,
  Heart,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";

export function ProductDetailsPage() {
  const { slug } = useParams();
  const { country } = useCountryStore();
  const { cart, setCart, openCart } = useCartStore();
  const { addToast } = useUIStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product-detail", slug, country.code],
    queryFn: () => Api.catalog.getProductBySlug(slug),
  });

  // Get related products
  const relatedProducts = React.useMemo(() => {
    const all = getLiveProducts();
    if (!product) return all.slice(0, 4);
    return all.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 4).length > 0
      ? all.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 4)
      : all.filter((p) => p.id !== product.id).slice(0, 4);
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#F8FAF9]">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-[#3D5648]">Loading product specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#0F2B1C]">Product Not Found</h2>
        <p className="text-sm text-[#5E7D67] mt-2 max-w-md mx-auto">
          The requested product could not be located or may have been updated in our catalog.
        </p>
        <Link to={ROUTES.PRODUCTS} className="mt-6 inline-block">
          <Button variant="primary" size="md" className="bg-[#00875A] hover:bg-[#00744D] text-white">
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const retailPrice = pricing.retailPrice || 499;
  const originalPrice = pricing.mrp || retailPrice * 1.25;
  const discount = Math.round(((originalPrice - retailPrice) / originalPrice) * 100);

  const handleAddToCart = () => {
    const existing = cart.items.find((i) => i.id === product.id);
    let newItems = [];
    if (existing) {
      newItems = cart.items.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      newItems = [
        ...cart.items,
        {
          id: product.id,
          name: product.name,
          price: retailPrice,
          quantity,
          image: product.image,
        },
      ];
    }

    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({
      title: "Added to Cart",
      message: `${quantity}x ${product.name} added to your cart.`,
      type: "success",
    });
    openCart();
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    addToast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      message: product.name,
      type: "info",
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      title: "Link Copied",
      message: "Product link copied to clipboard.",
      type: "success",
    });
  };

  return (
    <div className="bg-[#F8FAF9] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ─── Breadcrumb Navigation ─── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5E7D67]">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-1 hover:text-[#00875A] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link
            to={ROUTES.PRODUCTS}
            className="hover:text-[#00875A] transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link
            to={`${ROUTES.PRODUCTS}?category=${product.categoryId}`}
            className="hover:text-[#00875A] transition-colors"
          >
            {product.category || "Catalog"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-[#0F2B1C] truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* ─── Main Product Presentation (2 Columns) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Product Visuals & Trust Matrix */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-[2rem] bg-white p-3 border border-[#DCE8DF] shadow-xl shadow-emerald-950/[0.04] overflow-hidden group">
              <div className="relative h-[380px] sm:h-[480px] rounded-[1.5rem] overflow-hidden bg-[#F2F6F3]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Floating Top Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#064027] text-[#4ADE80] text-[11px] font-bold shadow-md">
                    <Sparkles className="w-3 h-3" />
                    <span>VANOM CERTIFIED</span>
                  </span>
                  {discount > 0 && (
                    <span className="inline-block px-3 py-1 rounded-full bg-[#00875A] text-white text-[11px] font-bold shadow-sm">
                      SAVE {discount}%
                    </span>
                  )}
                </div>

                {/* Top-Right Quick Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <button
                    onClick={toggleWishlist}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                      isWishlisted
                        ? "bg-red-500 text-white"
                        : "bg-white/90 backdrop-blur-md text-[#3D5648] hover:text-red-500 hover:bg-white"
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#3D5648] hover:text-[#00875A] hover:bg-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                    title="Share Product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Image Sub-bar */}
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-xl border border-white/60 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0F2B1C]">
                    <CheckCircle2 className="w-4 h-4 text-[#00875A]" />
                    <span>In Stock & Ready for Dispatch</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#5E7D67]">
                    SKU: {product.sku || "VNM-1092"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Card Trust Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] text-center flex flex-col items-center justify-center gap-1.5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0F2B1C]">Fast Transit</span>
                <span className="text-[10px] text-[#5E7D67]">2-4 Days Express</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] text-center flex flex-col items-center justify-center gap-1.5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0F2B1C]">Guaranteed</span>
                <span className="text-[10px] text-[#5E7D67]">100% Quality Inspected</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] text-center flex flex-col items-center justify-center gap-1.5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center">
                  <Globe2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0F2B1C]">Multi-Market</span>
                <span className="text-[10px] text-[#5E7D67]">{country.name} Local Billing</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] text-center flex flex-col items-center justify-center gap-1.5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0F2B1C]">Easy Returns</span>
                <span className="text-[10px] text-[#5E7D67]">30-Day Policy</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Buy Box & Specifications */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header / Titles */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#E6F4EA] text-[#00875A] text-xs font-bold tracking-wide uppercase">
                  {product.category || "General Catalog"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#F0F4F1] text-[#4B6354] text-xs font-medium">
                  Brand: <strong className="text-[#0F2B1C]">{product.brand || "Vanom"}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2B1C] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Review & Ratings Bar */}
              <div className="flex items-center gap-3 text-xs text-[#5E7D67]">
                <div className="flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] px-2.5 py-1 rounded-lg font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.9}</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-[#3D5648]">
                  {product.reviewsCount || 128} verified customer reviews
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4 text-[#00875A]" />
                  Verified Merchant
                </span>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#EAF5EE] via-[#F6FAF7] to-white border border-[#D4E8DC] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5E7D67] uppercase tracking-wider">
                  Direct Retail Price
                </span>
                <span className="text-xs font-semibold text-[#00875A] flex items-center gap-1">
                  <span>{country.flag}</span>
                  <span>{country.name} ({country.currency})</span>
                </span>
              </div>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-[#064027] tracking-tight">
                  {formatPrice(retailPrice, country.currency, country.symbol)}
                </span>
                {originalPrice > retailPrice && (
                  <span className="text-base text-slate-400 line-through font-medium">
                    {formatPrice(originalPrice, country.currency, country.symbol)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-bold bg-[#00875A] text-white px-2 py-0.5 rounded-md">
                    {discount}% OFF
                  </span>
                )}
              </div>

              <p className="text-xs text-[#5E7D67] pt-1 border-t border-emerald-900/10">
                Inclusive of standard localized taxes, handling & custom export packaging.
              </p>
            </div>

            {/* Quantity Selector & Purchase Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F2B1C] uppercase tracking-wider">
                  Select Quantity:
                </span>
                <span className="text-xs font-semibold text-[#00875A] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {product.stock || 350} units available
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="inline-flex items-center border border-[#D4DED6] rounded-xl bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-[#0F2B1C]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-[#5E7D67]">
                  Unit Type: <strong className="text-[#0F2B1C]">{product.packaging?.unitName || "Unit"}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00875A]/20 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <Link
                  to={ROUTES.CHECKOUT}
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#064027] hover:bg-[#0B4F32] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all text-center cursor-pointer"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Commercial Procurement Banner */}
            <div className="p-4 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#064027] text-[#4ADE80] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F2B1C]">Commercial & Enterprise Inquiries</h4>
                  <p className="text-[11px] text-[#5E7D67]">Need custom project volumes or pallet dispatch?</p>
                </div>
              </div>

              <Link
                to={ROUTES.B2B.QUOTES}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#E6F4EA] hover:bg-[#D4EEDC] text-[#00875A] text-xs font-bold transition-colors cursor-pointer"
              >
                Request Quote
              </Link>
            </div>

            {/* ─── Product Tabs & Specifications ─── */}
            <div className="bg-white rounded-2xl border border-[#DCE8DF] overflow-hidden shadow-xs">
              {/* Tab Navigation */}
              <div className="flex border-b border-[#E8EDE9] bg-[#FAFCFA]">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`flex-1 py-3 px-4 text-xs font-bold transition-colors cursor-pointer text-center ${
                    activeTab === "description"
                      ? "text-[#00875A] border-b-2 border-[#00875A] bg-white"
                      : "text-[#5E7D67] hover:text-[#0F2B1C]"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`flex-1 py-3 px-4 text-xs font-bold transition-colors cursor-pointer text-center ${
                    activeTab === "specs"
                      ? "text-[#00875A] border-b-2 border-[#00875A] bg-white"
                      : "text-[#5E7D67] hover:text-[#0F2B1C]"
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`flex-1 py-3 px-4 text-xs font-bold transition-colors cursor-pointer text-center ${
                    activeTab === "shipping"
                      ? "text-[#00875A] border-b-2 border-[#00875A] bg-white"
                      : "text-[#5E7D67] hover:text-[#0F2B1C]"
                  }`}
                >
                  Shipping & Quality
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5 text-xs text-[#3D5648] leading-relaxed">
                {activeTab === "description" && (
                  <div className="space-y-3">
                    <p>{product.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-[11px] text-[#5E7D67]">
                      <span>✓ High-grade materials</span>
                      <span>✓ Verified manufacturer warranty</span>
                      <span>✓ Standard packaging included</span>
                    </div>
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E8EDE9]">
                      <span className="text-[10px] text-[#5E7D67] block uppercase">Product SKU</span>
                      <span className="font-mono font-bold text-[#0F2B1C]">{product.sku}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E8EDE9]">
                      <span className="text-[10px] text-[#5E7D67] block uppercase">Brand</span>
                      <span className="font-bold text-[#0F2B1C]">{product.brand || "Vanom Global"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E8EDE9]">
                      <span className="text-[10px] text-[#5E7D67] block uppercase">Category</span>
                      <span className="font-bold text-[#0F2B1C]">{product.category}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E8EDE9]">
                      <span className="text-[10px] text-[#5E7D67] block uppercase">Packaging Format</span>
                      <span className="font-bold text-[#0F2B1C]">{product.packaging?.unitName || "Unit Box"}</span>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-2">
                    <p>
                      Dispatches within 24 hours from regional fulfillment centers. Covered by Vanom Global Comprehensive Delivery Guarantee.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[#5E7D67]">
                      <li>Tracked air & surface courier partners</li>
                      <li>Tamper-evident, climate-controlled packaging</li>
                      <li>Zero transit damage replacement guarantee</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ─── Related Recommended Products ─── */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-[#DCE8DF] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#00875A] uppercase tracking-wider">
                  You Might Also Need
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0F2B1C] tracking-tight">
                  Related Products
                </h2>
              </div>
              <Link
                to={ROUTES.PRODUCTS}
                className="text-xs font-bold text-[#00875A] hover:underline flex items-center gap-1"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProductDetailsPage;
