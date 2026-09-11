import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { getLiveProducts } from "../../../services/api/mock-data.js";
import { SEO } from "../../../components/common/SEO.jsx";
import { Api } from "../../../services/api/api-client.js";
import {
  CartItemCard,
  CartSummary,
  SavedForLaterList,
  CartRecommendations,
  EmptyCartView,
} from "../components/index.js";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, setCart, updateItemQuantity, removeItem, fetchCart, clearLocalCart, isLoading } = useCartStore();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    // Only fetch if cart is empty (not yet loaded by AuthProvider on refresh)
    // This prevents double-fetching which briefly resets isLoading and flashes empty cart
    if (!cart.items || cart.items.length === 0) {
      fetchCart();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Destination Address & Dynamic Tax State
  const [destination, setDestination] = useState({
    countryCode: country?.code || "US",
    regionCode: country?.code === "CA" ? "ON" : "CA",
    postalCode: country?.code === "CA" ? "M5V 2T6" : "90210",
  });
  const [taxData, setTaxData] = useState(null);
  const [isCalculatingTax, setIsCalculatingTax] = useState(false);

  // Keep destination country in sync if global country selector switches
  useEffect(() => {
    if (country?.code && country.code !== destination.countryCode) {
      const defaultRegion = country.code === "CA" ? "ON" : country.code === "US" ? "CA" : "";
      const defaultPostal = country.code === "CA" ? "M5V 2T6" : country.code === "US" ? "90210" : "";
      setDestination({
        countryCode: country.code,
        regionCode: defaultRegion,
        postalCode: defaultPostal,
      });
    }
  }, [country?.code]);

  // Sync selectedIds if cart items change and new items were added
  useEffect(() => {
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

  // Real-time Dynamic Tax Calculation Engine
  useEffect(() => {
    if (selectedCartItems.length === 0 || selectedSubtotal <= 0) {
      setTaxData(null);
      return;
    }

    let isMounted = true;
    const calculateLiveTax = async () => {
      setIsCalculatingTax(true);
      try {
        const payload = {
          countryCode: destination.countryCode || "US",
          regionCode: destination.regionCode || undefined,
          postalCode: destination.postalCode || undefined,
          items: selectedCartItems.map((item) => {
            const unitPrice = Number(item.price || item.unitPrice || 499);
            return {
              productId: item.productId || item.id,
              variantId: item.variantId || null,
              unitPrice: unitPrice,
              quantity: item.quantity,
              subtotal: unitPrice * item.quantity,
            };
          }),
        };

        const res = await Api.tax.calculateTax(payload);
        const data = res?.data || res;
        if (isMounted && data && (data.totalTax !== undefined || data.effectiveRate !== undefined)) {
          setTaxData(data);
        }
      } catch (err) {
        console.warn("Tax calculation fallback calculation:", err);
        if (isMounted) {
          const isUS = destination.countryCode === "US";
          const isCA = destination.countryCode === "CA";
          const rate = isUS ? 0.0882 : isCA ? 0.13 : 0.18;
          const totalTax = Number((selectedSubtotal * rate).toFixed(2));
          setTaxData({
            provider: "FALLBACK_ENGINE",
            jurisdiction: isUS ? (destination.regionCode || "US Standard") : isCA ? (destination.regionCode || "ON") : destination.countryCode,
            taxType: isUS ? "SALES_TAX" : isCA ? "HST/GST" : "GST",
            effectiveRate: rate,
            totalTax: totalTax,
          });
        }
      } finally {
        if (isMounted) setIsCalculatingTax(false);
      }
    };

    const timer = setTimeout(calculateLiveTax, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [destination.countryCode, destination.regionCode, destination.postalCode, selectedCartItems, selectedSubtotal]);

  // Tax and Shipping Calculation
  const estimatedTax = useMemo(() => {
    if (!taxData?.totalTax) return 0;
    return Number(taxData.totalTax) || 0;
  }, [taxData]);

  const estimatedShipping = useMemo(() => {
    if (selectedSubtotal >= 500 || selectedCount === 0) return 0;
    return destination.countryCode === "US" ? 4.99 : destination.countryCode === "CA" ? 6.99 : 40;
  }, [selectedSubtotal, selectedCount, destination.countryCode]);

  const finalTotal = Math.max(0, selectedSubtotal - couponDiscount + estimatedTax + estimatedShipping);

  // Recommended products
  const recommendedProducts = useMemo(() => {
    const live = getLiveProducts() || [];
    const cartIds = new Set((cart.items || []).map((i) => i.id));
    return live.filter((p) => !cartIds.has(p.id)).slice(0, 4);
  }, [cart.items]);

  // Selection handlers
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
    const targetItem = cart.items.find((item) => item.id === id);
    if (targetItem && targetItem.maxStock && newQty > targetItem.maxStock) {
      addToast({
        title: "Stock Limit Reached",
        message: `Only ${targetItem.maxStock} units available for ${targetItem.name || "this item"}.`,
        type: "warning",
      });
      return;
    }

    updateItemQuantity(id, newQty);
  };

  // Remove item
  const handleRemove = (id) => {
    const itemToRemove = cart.items.find((i) => i.id === id);
    removeItem(id);
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

  const hasSelectedOutOfStock = useMemo(() => {
    return selectedCartItems.some((item) => item.maxStock !== undefined && item.maxStock <= 0);
  }, [selectedCartItems]);

  const handleProceedToCheckout = () => {
    if (selectedCount === 0) {
      addToast({
        title: "No Items Selected",
        description: "Please select at least 1 item to proceed to checkout.",
        type: "warning",
      });
      return;
    }

    if (hasSelectedOutOfStock) {
      addToast({
        title: "Item Out of Stock",
        description: "One or more selected items are currently out of stock. Please remove or save them for later before checkout.",
        type: "error",
      });
      return;
    }

    navigate(ROUTES.CHECKOUT);
  };

  // Loading skeleton while fetching cart from backend
  if (isLoading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs animate-pulse">
              <div className="h-7 bg-gray-200 rounded w-48 mb-6" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 py-5 border-b border-border last:border-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="w-24">
                    <div className="h-6 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-36" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              ))}
              <div className="h-12 bg-gray-300 rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart State (only after loading is complete)
  if ((!cart.items || cart.items.length === 0) && savedItems.length === 0) {
    return (
      <EmptyCartView
        recommendedProducts={recommendedProducts}
        country={country}
        onAddToCart={handleAddRecommended}
      />
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
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    isSelected={selectedIds.includes(item.id)}
                    isGift={Boolean(giftOptions[item.id])}
                    country={country}
                    onToggleSelect={toggleSelectItem}
                    onToggleGift={toggleGift}
                    onQuantityChange={handleQuantity}
                    onRemove={handleRemove}
                    onSaveForLater={handleSaveForLater}
                    onShare={handleShare}
                  />
                ))}
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

          {/* Saved For Later Section */}
          <SavedForLaterList
            savedItems={savedItems}
            country={country}
            onMoveToCart={handleMoveToCart}
            onRemoveSaved={handleRemoveSaved}
          />

          {/* Recommended Carousel */}
          <CartRecommendations
            products={recommendedProducts}
            country={country}
            onAddToCart={handleAddRecommended}
          />
        </div>

        {/* Right Column: Order Summary Buy Box (4 cols) */}
        <CartSummary
          selectedCount={selectedCount}
          selectedSubtotal={selectedSubtotal}
          totalSavings={totalSavings}
          appliedCoupon={appliedCoupon}
          couponDiscount={couponDiscount}
          couponCode={couponCode}
          couponError={couponError}
          setCouponCode={setCouponCode}
          onApplyCoupon={handleApplyCoupon}
          estimatedShipping={estimatedShipping}
          estimatedTax={estimatedTax}
          taxData={taxData}
          isCalculatingTax={isCalculatingTax}
          finalTotal={finalTotal}
          hasSelectedOutOfStock={hasSelectedOutOfStock}
          country={country}
          destination={destination}
          setDestination={setDestination}
          onProceedToCheckout={handleProceedToCheckout}
          onClearCart={clearLocalCart}
        />
      </div>
    </div>
  );
}
