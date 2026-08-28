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
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Breadcrumb } from "../../../components/ui/Table.jsx";
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
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-text-primary">Product Not Found</h2>
        <p className="text-xs text-text-muted mt-2">The requested product could not be located in our catalog.</p>
        <Link to={ROUTES.PRODUCTS} className="mt-4 inline-block">
          <Button variant="primary" size="sm">Back to Store</Button>
        </Link>
      </div>
    );
  }

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const retailPrice = pricing.retailPrice || 499;

  const handleAddToCart = () => {
    const existing = cart.items.find((i) => i.id === product.id);
    let newItems = [];
    if (existing) {
      newItems = cart.items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      newItems = [...cart.items, { id: product.id, name: product.name, price: retailPrice, quantity, image: product.image }];
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Products", href: ROUTES.PRODUCTS },
          { label: product.category, href: `${ROUTES.PRODUCTS}?category=${product.categoryId}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-2xl bg-surface-muted border border-border overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Details */}
        <div className="space-y-6">
          <div>
            <Badge variant="brand" size="sm" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
              <span className="font-mono">SKU: {product.sku}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-4 h-4 fill-amber-400" />
                {product.rating} ({product.reviewsCount} verified reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-surface-muted border border-border">
            <span className="text-xs text-text-muted block">Direct Retail Price ({country.name})</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-brand-700">
                {formatPrice(retailPrice, country.currency, country.symbol)}
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Inclusive of standard taxes
              </span>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-text-secondary">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-text-secondary hover:bg-surface-muted"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-text-secondary hover:bg-surface-muted"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-text-muted font-medium flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock ({product.stock} units available)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                icon={ShoppingCart}
                className="flex-1 font-semibold"
              >
                Add to Cart
              </Button>
              <Link to={ROUTES.CHECKOUT} className="flex-1">
                <Button variant="secondary" size="lg" className="w-full font-semibold">
                  Buy Now
                </Button>
              </Link>
            </div>
          </div>

          {/* B2B Wholesale Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                  Wholesale Pallets Available
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Order by pallet or sack in bulk quantities starting from MOQ of {pricing.moq || 20} {product.packaging?.unitName}s.
              </p>
            </div>
            <Link to={`/b2b/catalog/${product.slug}`} className="shrink-0">
              <Button variant="gold" size="sm" className="font-bold text-slate-900 text-xs">
                View Wholesale Tiers
              </Button>
            </Link>
          </div>

          {/* Product Description */}
          <div className="border-t border-border pt-6 space-y-3">
            <h3 className="text-sm font-bold text-text-primary">Product Description</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
