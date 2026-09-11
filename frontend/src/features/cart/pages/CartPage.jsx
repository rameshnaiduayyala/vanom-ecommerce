import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { getLiveProducts } from "../../../services/api/mock-data.js";
import { SEO } from "../../../components/common/SEO.jsx";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Gift,
  Tag,
  Star,
  Sparkles,
  Share2,
  Lock,
} from "lucide-react";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, setCart, clearLocalCart } = useCartStore();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();


  // Selected item IDs for checkout (defaults to all cart items selected)
  const [selectedIds, setSelectedIds] = useState(() =>
    (cart.items || []).map((item) => item.id)
  );

  // Saved for Later list
  const [savedItems, setSavedItems] = useState([]);

  // Gift options mapped by item id
  const [giftOptions, setGiftOptions] = useState({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Sync selectedIds if cart items change and new items were added
  React.useEffect(() => {
    if (!cart.items) return;
    setSelectedIds((prev) => {
      const validCartIds = new Set(cart.items.map((i) => i.id));
      const filtered = prev.filter((id) => validCartIds.has(id));
      cart.items.forEach((item) => {
        if (!prev.includes(item.id)) {
          filtered.push(item.id);
        }
      });
      return filtered;
    });
  }, [cart.items]);

  // Selected items calculation
  const selectedCartItems = useMemo(() => {
    return (cart.items || []).filter((item) => selectedIds.includes(item.id));
  }, [cart.items, selectedIds]);

  const selectedSubtotal = useMemo(() => {
    return selectedCartItems.reduce(
      (sum, item) => sum + (item.price || item.unitPrice || 499) * item.quantity,
      0
    );
  }, [selectedCartItems]);

  const selectedCount = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedCartItems]);

  // Estimated Savings (MRP vs discounted price)
  const totalSavings = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => {
      const unitPrice = item.price || item.unitPrice || 499;
      const mrp = item.mrp || Math.round(unitPrice * 1.35);
      return sum + (mrp - unitPrice) * item.quantity;
    }, 0);
  }, [selectedCartItems]);

  // Discount calculation if coupon applied
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percent") {
      return Math.round((selectedSubtotal * appliedCoupon.value) / 100);
    }
    return appliedCoupon.value;
  }, [appliedCoupon, selectedSubtotal]);

  const finalTotal = Math.max(0, selectedSubtotal - couponDiscount);

  // Recommended products
  const recommendedProducts = useMemo(() => {
    const live = getLiveProducts() || [];
    const cartIds = new Set((cart.items || []).map((i) => i.id));
    return live.filter((p) => !cartIds.has(p.id)).slice(0, 4);
  }, [cart.items]);

  // Handle select all toggle
  const allSelected = cart.items && cart.items.length > 0 && selectedIds.length === cart.items.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.items.map((i) => i.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Quantity updates
  const handleQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemove(id);
      return;
    }
    const newItems = cart.items.map((item) =>
      item.id === id ? { ...item, quantity: newQty } : item
    );
    const subtotal = newItems.reduce(
      (sum, item) => sum + (item.price || item.unitPrice || 499) * item.quantity,
      0
    );
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
  };

  // Remove item
  const handleRemove = (id) => {
    const itemToRemove = cart.items.find((i) => i.id === id);
    const newItems = cart.items.filter((item) => item.id !== id);
    const subtotal = newItems.reduce(
      (sum, item) => sum + (item.price || item.unitPrice || 499) * item.quantity,
      0
    );
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    if (itemToRemove) {
      addToast({
        title: "Item Removed",
        description: `${itemToRemove.name || "Item"} was removed from your cart.`,
        type: "info",
      });
    }
  };

  // Save for later
  const handleSaveForLater = (id) => {
    const itemToSave = cart.items.find((i) => i.id === id);
    if (!itemToSave) return;
    setSavedItems((prev) => [...prev, itemToSave]);
    handleRemove(id);
    addToast({
      title: "Saved for Later",
      description: `${itemToSave.name} moved to Saved for Later.`,
      type: "success",
    });
  };

  // Move back to cart from Saved for Later
  const handleMoveToCart = (item) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
    const newItems = [...(cart.items || []), item];
    const subtotal = newItems.reduce(
      (sum, i) => sum + (i.price || i.unitPrice || 499) * i.quantity,
      0
    );
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    setSelectedIds((prev) => [...prev, item.id]);
    addToast({
      title: "Moved to Cart",
      description: `${item.name} added back to your cart.`,
      type: "success",
    });
  };

  // Remove from saved for later
  const handleRemoveSaved = (id) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    addToast({
      title: "Item Deleted",
      description: "Item removed from your saved list.",
      type: "info",
    });
  };

  // Quick Add from Recommended
  const handleAddRecommended = (product) => {
    const pricing = product.pricing?.[country.code] || product.pricing?.US || product.pricing?.IN || {};
    const price = Number(product.price || pricing.retailPrice || 399);
    const productImage =
      product.image ||
      product.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80";

    const newItems = [
      ...(cart.items || []),
      {
        id: product.id,
        name: product.name,
        price,
        mrp: product.mrp || pricing.mrp || Math.round(price * 1.35),
        quantity: 1,
        image: productImage,
      },
    ];
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    setSelectedIds((prev) => [...prev, product.id]);
    addToast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
      type: "success",
    });
  };

  // Toggle Gift Option
  const toggleGift = (id) => {
    setGiftOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Share item link
  const handleShare = (item) => {
    const url = window.location.origin + `/products/${item.slug || item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast({
        title: "Link Copied!",
        description: "Product link copied to clipboard.",
        type: "success",
      });
    }
  };

  // Coupon handling
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "VANOM10" || code === "SAVE10") {
      setAppliedCoupon({ code, type: "percent", value: 10, label: "10% OFF Storewide" });
      addToast({ title: "Coupon Applied!", description: "10% discount applied to your order.", type: "success" });
    } else if (code === "SUPER50" || code === "FLAT50") {
      setAppliedCoupon({ code, type: "flat", value: 50, label: "₹50 Instant Discount" });
      addToast({ title: "Coupon Applied!", description: "₹50 flat discount applied.", type: "success" });
    } else {
      setCouponError("Invalid coupon code. Try 'VANOM10' or 'SUPER50'.");
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedCount === 0) {
      addToast({
        title: "No Items Selected",
        description: "Please select at least 1 item to proceed to checkout.",
        type: "warning",
      });
      return;
    }
    navigate(ROUTES.CHECKOUT);
  };

  // If cart is totally empty and no saved items
  if ((!cart.items || cart.items.length === 0) && savedItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SEO
          title="Shopping Cart | Vanom Store"
          description="View your shopping cart items, manage quantities, and proceed to secure checkout on Vanom."
          noindex={true}
        />
        <div className="bg-white rounded-2xl border border-border p-8 md:p-12 shadow-sm text-center">

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#FAF3DF] flex items-center justify-center border border-[#e6d8b5]">
            <ShoppingBag className="w-12 h-12 text-[#185e3e]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-2">
            Your Cart is empty
          </h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            Shop today's epic deals, explore top organic picks, value combo packs, or continue where you left off.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to={ROUTES.PRODUCTS}>
              <button className="px-6 py-3 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold text-sm shadow-sm transition-all border border-[#FCD200] cursor-pointer">
                Explore All Products
              </button>
            </Link>
            <Link to={ROUTES.HOME}>
              <button className="px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-300 shadow-2xs transition-all cursor-pointer">
                Return to Store Home
              </button>
            </Link>
          </div>
        </div>

        {/* Recommended Products for Empty State */}
        {recommendedProducts.length > 0 && (
          <div className="mt-10 bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF9900]" />
              Customers usually buy these top-rated items
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-border hover:border-gray-400 bg-white transition-all flex flex-col justify-between group"
                >
                  <Link to={`/products/${p.slug || p.id}`} className="block">
                    <div className="w-full h-36 rounded-lg bg-surface-muted overflow-hidden mb-3 border border-border/50">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-text-primary line-clamp-2 hover:text-[#007185] leading-snug mb-1">
                      {p.name}
                    </h4>
                  </Link>
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="flex text-[#FFA41C]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#007185] font-medium">{p.rating || 4.9}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(p.price, country.currency, country.symbol)}
                      </span>
                      {p.mrp && (
                        <span className="text-xs text-text-muted line-through">
                          {formatPrice(p.mrp, country.currency, country.symbol)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddRecommended(p)}
                      className="w-full py-1.5 px-3 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 text-xs font-bold transition-all shadow-2xs border border-[#FCD200] cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <SEO
        title={`Shopping Cart (${cart.items.length} items) | Vanom`}
        description="Review items in your Vanom shopping cart and proceed to secure checkout."
        noindex={true}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Cart Items List + Saved For Later (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Shopping Cart Box */}
          <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-end justify-between pb-3 border-b border-border">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer"
                  >
                    {allSelected ? "Deselect all items" : "Select all items"}
                  </button>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-xs text-text-muted">
                    {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in cart
                  </span>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">Price</span>
              </div>
            </div>

            {/* Cart Items List */}
            {cart.items.length === 0 ? (
              <div className="py-10 text-center text-text-secondary text-sm">
                No active items in cart. Check your saved items below.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cart.items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isGift = Boolean(giftOptions[item.id]);
                  const unitPrice = Number(item.price || item.unitPrice || 499);
                  const mrp = Number(item.mrp || Math.round(unitPrice * 1.35));
                  const itemDiscount = mrp > unitPrice ? Math.round(((mrp - unitPrice) / mrp) * 100) : 15;

                  return (
                    <div
                      key={item.id}
                      className={`py-5 flex flex-col sm:flex-row gap-4 transition-colors ${!isSelected ? "opacity-60 bg-gray-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <div className="pt-1 flex items-start">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#007185] focus:ring-[#007185] cursor-pointer"
                          aria-label={`Select ${item.name}`}
                        />
                      </div>

                      {/* Product Thumbnail */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-surface-muted border border-border overflow-hidden shrink-0 relative group">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80"}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Details & Amazon Action Bar */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {/* Title & Price on Mobile */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900 hover:text-[#007185] leading-snug line-clamp-2">
                              <Link to={`/products/${item.slug || item.id}`}>
                                {item.name || item.productName}
                              </Link>
                            </h3>
                            <div className="text-right sm:hidden shrink-0">
                              <div className="text-base font-bold text-gray-900">
                                {formatPrice(unitPrice, country.currency, country.symbol)}
                              </div>
                            </div>
                          </div>

                          {/* In Stock & Badge */}
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-[#067d62] font-semibold">In stock</span>
                            <span className="text-gray-300">|</span>
                            <span className="inline-flex items-center gap-1 font-bold text-[#007185] bg-[#EBF7FD] px-2 py-0.5 rounded text-[11px]">
                              <Sparkles className="w-3 h-3 text-[#FF9900]" /> Express Shipping
                            </span>
                          </div>

                          {/* Specs / Brand note */}
                          {item.specs && (
                            <p className="text-xs text-text-secondary mt-1 line-clamp-1">{item.specs}</p>
                          )}

                          {/* Gift Option Checkbox */}
                          <div className="mt-2 flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer hover:text-gray-900">
                              <input
                                type="checkbox"
                                checked={isGift}
                                onChange={() => toggleGift(item.id)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-[#007185] focus:ring-[#007185] cursor-pointer"
                              />
                              <Gift className="w-3.5 h-3.5 text-[#C7511F]" />
                              <span>This is a gift <span className="text-[#007185] text-[11px] hover:underline">Learn more</span></span>
                            </label>
                          </div>
                        </div>

                        {/* Amazon Controls Row (Qty Dropdown / Stepper, Delete, Save for later, Share) */}
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs pt-2 border-t border-gray-100">
                          {/* Stepper / Dropdown */}
                          <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 shadow-2xs overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 px-2 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                              title="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900 select-none text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 px-2 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                              title="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-gray-300">|</span>

                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer"
                          >
                            Delete
                          </button>

                          <span className="text-gray-300">|</span>

                          <button
                            type="button"
                            onClick={() => handleSaveForLater(item.id)}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer"
                          >
                            Save for later
                          </button>

                          <span className="text-gray-300">|</span>

                          <button
                            type="button"
                            onClick={() => handleShare(item)}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer flex items-center gap-1"
                          >
                            <Share2 className="w-3 h-3" /> Share
                          </button>
                        </div>
                      </div>

                      {/* Desktop Price Column */}
                      <div className="hidden sm:block text-right shrink-0">
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(unitPrice, country.currency, country.symbol)}
                        </div>
                        {mrp > unitPrice && (
                          <div className="space-y-0.5">
                            <div className="text-xs text-text-muted line-through">
                              M.R.P.: {formatPrice(mrp, country.currency, country.symbol)}
                            </div>
                            <span className="inline-block text-[11px] font-bold text-[#B12704] bg-red-50 px-1.5 py-0.5 rounded">
                              {itemDiscount}% off
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Subtotal Footer inside cart box */}
            {cart.items.length > 0 && (
              <div className="pt-4 border-t border-border flex justify-end items-baseline gap-2 text-right">
                <span className="text-base font-normal text-gray-800">
                  Subtotal ({selectedCount} {selectedCount === 1 ? "item" : "items"}):
                </span>
                <span className="text-xl font-black text-gray-900">
                  {formatPrice(selectedSubtotal, country.currency, country.symbol)}
                </span>
              </div>
            )}
          </div>

          {/* Amazon Saved For Later Section */}
          <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Saved for later</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {savedItems.length} {savedItems.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            {savedItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                You have no items saved for later. Click "Save for later" on any cart item to park it here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-border bg-white flex flex-col justify-between shadow-2xs hover:border-gray-400 transition-all"
                  >
                    <div>
                      <div className="w-full h-36 rounded-lg bg-surface-muted overflow-hidden mb-3 border border-border/50">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 hover:text-[#007185] mb-1">
                        <Link to={`/products/${item.slug || item.id}`}>{item.name}</Link>
                      </h4>
                      <p className="text-xs text-[#067d62] font-semibold mb-1">In stock</p>
                      <div className="text-sm font-bold text-gray-900 mb-3">
                        {formatPrice(item.price || item.unitPrice || 499, country.currency, country.symbol)}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(item)}
                        className="w-full py-1.5 px-3 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 text-xs font-bold transition-all shadow-2xs border border-[#FCD200] cursor-pointer"
                      >
                        Move to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSaved(item.id)}
                        className="w-full py-1 px-3 text-xs text-[#007185] hover:text-[#C7511F] hover:underline text-center cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Carousel ("Customers Who Bought Items in Your Cart Also Bought") */}
          {recommendedProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-xs">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF9900]" />
                Customers who bought items in your cart also bought
              </h3>
              <p className="text-xs text-text-secondary mb-4">Frequently paired organic bestsellers and combo packs</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {recommendedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-border hover:border-gray-400 bg-white transition-all flex flex-col justify-between group"
                  >
                    <Link to={`/products/${p.slug || p.id}`} className="block">
                      <div className="w-full h-32 rounded-lg bg-surface-muted overflow-hidden mb-2.5 border border-border/50">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 hover:text-[#007185] leading-snug mb-1">
                        {p.name}
                      </h4>
                    </Link>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex text-[#FFA41C]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#007185] font-medium">{p.rating || 4.8}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-2.5">
                        <span className="text-xs font-bold text-gray-900">
                          {formatPrice(p.price, country.currency, country.symbol)}
                        </span>
                        {p.mrp && (
                          <span className="text-[10px] text-text-muted line-through">
                            {formatPrice(p.mrp, country.currency, country.symbol)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddRecommended(p)}
                        className="w-full py-1 px-2 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 text-[11px] font-bold transition-all shadow-2xs border border-[#FCD200] cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Amazon Buy Box / Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          {/* Main Checkout Card */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
            {/* Subtotal Display */}
            <div>
              <div className="flex items-baseline justify-between text-base font-normal text-gray-900">
                <span>Subtotal ({selectedCount} items):</span>
                <span className="text-2xl font-black text-gray-900">
                  {formatPrice(finalTotal, country.currency, country.symbol)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-xs text-[#067d62] font-bold mt-1">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>- {formatPrice(couponDiscount, country.currency, country.symbol)}</span>
                </div>
              )}
            </div>

            {/* Primary Amazon Proceed to Buy Button */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={selectedCount === 0}
              className={`w-full py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${selectedCount > 0
                ? "bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 border border-[#FCD200] active:scale-[0.99]"
                : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                }`}
            >
              <Lock className="w-4 h-4 text-gray-800" />
              <span>Proceed to Checkout ({selectedCount} items)</span>
            </button>

            {/* Price Details Breakdown */}
            <div className="border-t border-border pt-4 space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(selectedSubtotal, country.currency, country.symbol)}
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-[#067d62] font-bold pt-1 border-t border-dashed border-gray-200">
                  <span>Total Savings on MRP</span>
                  <span>{formatPrice(totalSavings + couponDiscount, country.currency, country.symbol)}</span>
                </div>
              )}
            </div>

            {/* Promo Code / Coupon Accordion */}
            <div className="border-t border-border pt-3">
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#007185]" /> Apply Promo Code or Voucher
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                    }}
                    placeholder="e.g. VANOM10"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#007185] uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs border border-gray-300 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-[11px] text-[#067d62] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {appliedCoupon.label} applied!
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Trust Guarantees Widget */}
          <div className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Vanom Buyer Assurance</h4>
            <div className="space-y-2.5 text-xs text-text-secondary">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#067d62] shrink-0" />
                <span>100% Genuine Organic Certified Products</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#007185] shrink-0" />
                <span>256-Bit Bank-Grade Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#FF9900] shrink-0" />
                <span>Express Dispatched with Live Tracking</span>
              </div>
            </div>
          </div>

          {/* Quick Clear Local Cart Link */}
          <div className="text-center">
            <button
              onClick={clearLocalCart}
              className="text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer font-medium"
            >
              Empty Entire Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
