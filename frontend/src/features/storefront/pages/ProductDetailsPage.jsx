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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Package,
  ArrowRight,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";

const COLOR_OPTIONS = [
  { name: "GREEN", colorClass: "bg-[#5ECFB5]" },
  { name: "AMBER", colorClass: "bg-[#F59E0B]" },
  { name: "CHARCOAL", colorClass: "bg-[#1E293B]" },
  { name: "SLATE", colorClass: "bg-[#64748B]" },
];

export function ProductDetailsPage() {
  const { slug } = useParams();
  const { country } = useCountryStore();
  const { cart, setCart, openCart } = useCartStore();
  const { addToast } = useUIStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [quantityDropdownOpen, setQuantityDropdownOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState("DETAILS");
  const [addingToCart, setAddingToCart] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product-detail", slug, country.code],
    queryFn: () => Api.catalog.getProductBySlug(slug),
  });

  // Related products
  const relatedProducts = React.useMemo(() => {
    const all = getLiveProducts();
    if (!product) return all.slice(0, 4);
    const sameCat = all.filter((p) => p.id !== product.id && p.categoryId === product.categoryId);
    return (sameCat.length > 0 ? sameCat : all.filter((p) => p.id !== product.id)).slice(0, 4);
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-white">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Loading product view...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-white">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          The requested product could not be located or may have been updated.
        </p>
        <Link to={ROUTES.PRODUCTS} className="mt-6 inline-block">
          <Button variant="primary" size="md" className="bg-[#5ECFB5] hover:bg-[#4EBFB0] text-slate-900 font-bold">
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const retailPrice = pricing.retailPrice || 399;
  const originalPrice = pricing.mrp || retailPrice * 1.18;

  const handleAddToCart = () => {
    setAddingToCart(true);
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
      message: `${quantity}x ${product.name} (${selectedColor.name}) added to cart.`,
      type: "success",
    });
    setTimeout(() => setAddingToCart(false), 800);
    openCart();
  };

  return (
    <div className="w-full bg-white min-h-screen py-8 sm:py-12 select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12 sm:space-y-16">
        
        {/* ─── FULL-WIDTH MAIN PRODUCT SHOWCASE CONTAINER ─── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* ── LEFT SHOWCASE PANEL ── */}
          <div className="lg:col-span-7 bg-[#EEF5F8] rounded-[2.5rem] p-6 sm:p-10 lg:p-12 relative flex flex-col items-center justify-between min-h-[500px] sm:min-h-[580px] lg:min-h-[620px] overflow-hidden">
            
            {/* Top Designer & Rating Badge with Color Swatches */}
            <div className="w-full flex flex-col items-center z-10">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Designed by <strong className="text-slate-800 font-bold">{product.brand || "Thomas Jonas"}</strong>
                </p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.5}</span>
                  <span className="text-slate-400">({product.reviewsCount || 89} reviews)</span>
                </div>
              </div>

              {/* Vertical subtle indicator line */}
              <div className="w-px h-5 bg-slate-300 my-2" />

              {/* Horizontal Color Swatches matching reference */}
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map((c) => {
                  const isActive = selectedColor.name === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      className={`transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "w-8 h-2 rounded-full ring-2 ring-slate-400 ring-offset-2 scale-110 " + c.colorClass
                          : "w-6 h-1.5 rounded-full hover:scale-105 " + c.colorClass
                      }`}
                      aria-label={`Select ${c.name}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Central Floating Hero Product Image with Drop Shadow */}
            <div className="relative my-6 sm:my-8 w-full flex items-center justify-center z-0">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-[320px] sm:max-h-[420px] lg:max-h-[460px] w-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Left & Right Circular Navigation Arrows */}
            <button
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Empty placeholder spacer for vertical balance */}
            <div className="h-2" />
          </div>

          {/* ── RIGHT PRODUCT INFO & ACTION PANEL ── */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 sm:space-y-7">
            
            {/* Product Title & Item Code */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-slate-800 tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide mt-1.5 uppercase">
                Item code: {product.sku ? product.sku.replace(/\D/g, "") || "597830" : "597830"}
              </p>
            </div>

            {/* Description Section */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                DESCRIPTION
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {product.description ||
                  "Accent Chair Living Room Armchair Tub Side Chair Sofa Lounge Soft Velvet Upholstered Back for Dining Room/Cafe Home Furniture."}
              </p>
            </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-slate-100" />

            {/* Price Row */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                PRICE
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight">
                  {formatPrice(retailPrice, country.currency, country.symbol)}
                </span>
                {originalPrice > retailPrice && (
                  <span className="text-lg sm:text-xl text-slate-300 line-through font-medium">
                    {formatPrice(originalPrice, country.currency, country.symbol)}
                  </span>
                )}
              </div>
            </div>

            {/* Color Dropdown Selector */}
            <div className="space-y-1.5 relative">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                COLOR
              </span>
              <button
                type="button"
                onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                className="w-full bg-[#EDF5F7] px-4 sm:px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 flex items-center justify-between cursor-pointer hover:bg-[#E3EFF1] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3.5 h-3.5 rounded-full ${selectedColor.colorClass}`} />
                  <span>{selectedColor.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${colorDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {colorDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedColor(c);
                        setColorDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 hover:bg-[#EDF5F7] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.colorClass}`} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart Row */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                QUANTITY
              </span>
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Quantity Selector Dropdown */}
                <div className="relative w-28 sm:w-32 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantityDropdownOpen(!quantityDropdownOpen)}
                    className="w-full bg-[#EDF5F7] px-4 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 flex items-center justify-between cursor-pointer hover:bg-[#E3EFF1] transition-colors"
                  >
                    <span>{String(quantity).padStart(2, "0")}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${quantityDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {quantityDropdownOpen && (
                    <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-1 max-h-48 overflow-y-auto">
                      {[1, 2, 3, 4, 5, 10, 20].map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            setQuantity(num);
                            setQuantityDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-semibold text-slate-700 hover:bg-[#EDF5F7] cursor-pointer"
                        >
                          {String(num).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mint/Teal "ADD TO CART" Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl bg-[#5ECFB5] hover:bg-[#4EBFB0] active:scale-[0.98] text-slate-900 font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-[#5ECFB5]/25 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  {addingToCart ? (
                    <>
                      <Check className="w-4 h-4 text-slate-900" />
                      <span>ADDED</span>
                    </>
                  ) : (
                    <span>ADD TO CART</span>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Tabs: DETAILS | DELIVERY | RETURN */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold tracking-wider text-slate-400">
                {["DETAILS", "DELIVERY", "RETURN"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBottomTab(tab)}
                    className={`hover:text-slate-800 transition-colors cursor-pointer py-1 uppercase ${
                      activeBottomTab === tab ? "text-slate-800 border-b-2 border-slate-800" : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Info Box */}
              <div className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal bg-[#F8FAFC] p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                {activeBottomTab === "DETAILS" && (
                  <p>
                    Premium construction with ergonomic lumbar curvature, solid natural wood frame, and reinforced stitching.
                  </p>
                )}
                {activeBottomTab === "DELIVERY" && (
                  <p>
                    Direct insured doorstep shipping in 2–4 business days with live tracking across US, UK & international hubs.
                  </p>
                )}
                {activeBottomTab === "RETURN" && (
                  <p>
                    30-day risk-free return guarantee with complimentary return pickup for verified enterprise & retail orders.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ─── RELATED PRODUCTS FULL-WIDTH GRID ─── */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  You Might Also Like
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Curated selections based on your browsing preferences
                </p>
              </div>
              <Link
                to={ROUTES.PRODUCTS}
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
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
