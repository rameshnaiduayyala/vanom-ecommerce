import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Building2,
  Package,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";

export function ProductDetailsPage() {
  const { slug } = useParams();
  const { country } = useCountryStore();
  const { cart, setCart, openCart } = useCartStore();
  const { addToast } = useUIStore();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product-detail", slug, country.code],
    queryFn: () => Api.catalog.getProductBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">This product could not be located in our catalog.</p>
          <Link to={ROUTES.PRODUCTS} className="mt-4 inline-block">
            <Button variant="primary" size="sm">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const retailPrice = pricing.retailPrice || 499;

  const handleAddToCart = () => {
    const existing = cart.items.find((i) => i.id === product.id);
    let newItems = existing
      ? cart.items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i))
      : [...cart.items, { id: product.id, name: product.name, price: retailPrice, quantity, image: product.image }];

    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({ title: "Added to Cart", message: `${quantity}x ${product.name} added.`, type: "success" });
    openCart();
  };

  return (
    <div className="bg-[#ededed] min-h-screen">
      {/* Navy breadcrumb header */}
      <div className="bg-[#003876] border-b border-[#00275a]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={ROUTES.PRODUCTS} className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`${ROUTES.PRODUCTS}?category=${product.categoryId}`} className="hover:text-white transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80 truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      {/* White rounded card content */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-4 pb-12">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs py-8 px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left — Product Image */}
          <div className="space-y-3">
            <div className="aspect-4/3 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="space-y-5">
            {/* Title & Meta */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#003876] mb-1">
                {product.category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`} />
                  ))}
                  <span className="text-xs text-slate-500 font-semibold ml-1">
                    {product.rating} ({product.reviewsCount} reviews)
                  </span>
                </div>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block mb-1">
                Retail Price · {country.name}
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {formatPrice(retailPrice, country.currency, country.symbol)}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  Tax Inclusive
                </span>
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-600">Qty:</span>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {product.stock} in stock
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFE000] text-[#003876] text-sm font-black hover:bg-[#FFD100] transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <Link to={ROUTES.CHECKOUT} className="flex-1">
                  <button className="w-full py-3 rounded-xl border-2 border-[#003876] text-[#003876] text-sm font-bold hover:bg-[#003876] hover:text-white transition-colors cursor-pointer">
                    Buy Now
                  </button>
                </Link>
                <button className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3 py-3 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delivery assurances */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Free Freight", sub: "Orders $2,999+" },
                { icon: ShieldCheck, label: "ISO Certified", sub: "9001:2015" },
                { icon: Package, label: "24-Hr Dispatch", sub: "In-stock SKUs" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-white border border-slate-200">
                  <Icon className="w-4 h-4 text-[#003876] mx-auto mb-1 stroke-[1.75]" />
                  <div className="text-[11px] font-bold text-slate-900">{label}</div>
                  <div className="text-[10px] text-slate-400">{sub}</div>
                </div>
              ))}
            </div>

            {/* Wholesale Banner */}
            <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-[#FFE000]" />
                  <span className="text-xs font-bold text-[#FFE000] uppercase tracking-wider">
                    Wholesale Pallets Available
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Order by pallet starting from MOQ {pricing.moq || 20} {product.packaging?.unitName || "units"}.
                </p>
              </div>
              <Link to={`/b2b/catalog/${product.slug}`} className="shrink-0">
                <button className="px-3 py-1.5 rounded-lg bg-[#FFE000] text-[#003876] text-xs font-black hover:bg-[#FFD100] transition-colors cursor-pointer whitespace-nowrap">
                  View Tiers
                </button>
              </Link>
            </div>

            {/* Description */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Product Description</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{product.description}</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
