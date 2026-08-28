import React from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

export function ProductCard({ product }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const price = pricing.retailPrice || 499;

  const handleAddToCart = (e) => {
    e.preventDefault();
    const existing = cart.items.find((i) => i.id === product.id);
    let newItems = [];
    if (existing) {
      newItems = cart.items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      newItems = [...cart.items, { id: product.id, name: product.name, price, quantity: 1, image: product.image }];
    }

    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({
      title: "Added to Cart",
      message: `${product.name} has been added.`,
      type: "success",
    });
  };

  return (
    <div className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-brand-300 transition-all duration-200 flex flex-col">
      {/* Image & Badges */}
      <Link to={`/products/${product.slug}`} className="relative aspect-4/3 bg-surface-muted overflow-hidden block">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="default" size="sm" className="bg-white/90 backdrop-blur-xs font-semibold">
            {product.category}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{product.rating}</span>
            <span className="text-text-muted font-normal">({product.reviewsCount})</span>
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-text-primary hover:text-brand-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-text-muted mt-1 font-mono">{product.sku}</p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted block">Retail Price</span>
            <span className="text-base font-bold text-brand-700">
              {formatPrice(price, country.currency, country.symbol)}
            </span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={handleAddToCart}
            icon={ShoppingCart}
            className="rounded-lg shadow-xs"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
