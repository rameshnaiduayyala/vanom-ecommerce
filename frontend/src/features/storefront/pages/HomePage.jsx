import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ProductCard } from "../components/ProductCard.jsx";
import {
  Building2,
  Sparkles,
  Truck,
  ShieldCheck,
  Zap,
  ArrowRight,
  Boxes,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Skeleton } from "../../../components/ui/Alert.jsx";

export function HomePage() {
  const { country } = useCountryStore();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["home-products", country.code],
    queryFn: () => Api.catalog.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  const products = productsData?.items || [];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl space-y-5">
            <Badge variant="gold" size="md" className="font-bold tracking-wide uppercase">
              ✨ All-In-One Enterprise Commerce Platform
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              One Marketplace for Retail Essentials & Wholesale Pallets
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
              Electronics, bulk groceries, industrial packaging, appliances, and apparel delivered seamlessly across India, the United States, and the United Kingdom.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to={ROUTES.PRODUCTS}>
                <Button variant="gold" size="lg" icon={ArrowRight} iconPosition="right" className="font-bold text-slate-900">
                  Shop Retail Marketplace
                </Button>
              </Link>
              <Link to={ROUTES.B2B.ROOT}>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" icon={Building2}>
                  B2B Wholesale Portal
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Wholesale Promo Card */}
          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-300">B2B Commercial Desk</span>
              <span className="text-xs bg-gold-400 text-slate-900 font-bold px-2 py-0.5 rounded">Volume Discounts</span>
            </div>
            <h4 className="text-base font-bold">Buying by the Pallet, Carton, or Sacks?</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Unlock tiered wholesale pricing, NET 30 invoice credit lines, and pallet freight logistics.
            </p>
            <Link to={ROUTES.B2B.ROOT} className="block">
              <Button variant="gold" size="sm" className="w-full text-slate-900 font-bold">
                Access B2B Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-xl border border-border shadow-xs">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-text-primary">Instant Retail Checkout</h4>
              <p className="text-[11px] text-text-muted">Fast & secure direct ordering</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-text-primary">Global & Local Freight</h4>
              <p className="text-[11px] text-text-muted">Parcel express & pallet freight</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Boxes className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-text-primary">Wholesale Tiers</h4>
              <p className="text-[11px] text-text-muted">Automatic bulk price brackets</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-text-primary">Authoritative Invoicing</h4>
              <p className="text-[11px] text-text-muted">GST, VAT & Sales Tax verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Explore All Categories</h2>
            <p className="text-xs text-text-muted">From consumer technology and bulk food essentials to industrial packaging</p>
          </div>
          <Link to={ROUTES.PRODUCTS} className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
              className="bg-white p-4 rounded-xl border border-border hover:border-brand-400 hover:shadow-xs transition-all text-center group flex flex-col items-center justify-center min-h-[100px]"
            >
              <span className="text-xs font-bold text-text-primary group-hover:text-brand-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-text-muted mt-1">{cat.count} Items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary">Trending Products & Wholesale Deals</h2>
              <Badge variant="brand" size="sm">
                Market: {country.name} ({country.currency})
              </Badge>
            </div>
            <p className="text-xs text-text-muted">High-velocity items with immediate multi-warehouse availability</p>
          </div>
          <Link to={ROUTES.PRODUCTS} className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Explore All Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
