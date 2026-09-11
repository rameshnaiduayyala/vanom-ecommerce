import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { getLiveProducts } from "../../../services/api/mock-data.js";
import { ROUTES } from "../../../constants/routes.js";

export function useCartPage() {
  const navigate = useNavigate();
  const { cart, setCart, updateItemQuantity, removeItem, fetchCart, clearLocalCart, isLoading } = useCartStore();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  // Fetch on mount only if cart is empty (AuthProvider may have already populated it)
  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      fetchCart();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Destination for tax estimation (synced with global country)
  const [destination, setDestination] = useState({
    countryCode: country?.code || "US",
    regionCode:  country?.code === "CA" ? "ON" : "CA",
    postalCode:  country?.code === "CA" ? "M5V 2T6" : "90210",
  });

  // Sync destination when global country selector changes
  useEffect(() => {
    if (country?.code && country.code !== destination.countryCode) {
      setDestination({
        countryCode: country.code,
        regionCode:  country.code === "CA" ? "ON" : "CA",
        postalCode:  country.code === "CA" ? "M5V 2T6" : "90210",
      });
    }
  }, [country?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  // Selected item IDs (all selected by default)
  const [selectedIds, setSelectedIds] = useState(() =>
    (cart.items || []).map((i) => i.id)
  );

  // Sync selectedIds when cart items change (e.g. after fetchCart)
  useEffect(() => {
    if (!cart.items) return;
    setSelectedIds((prev) => {
      const validSet = new Set(cart.items.map((i) => i.id));
      const kept     = prev.filter((id) => validSet.has(id));
      cart.items.forEach((item) => {
        if (!kept.includes(item.id)) kept.push(item.id);
      });
      return kept;
    });
  }, [cart.items]);

  // Saved for later
  const [savedItems, setSavedItems] = useState([]);

  // Gift options per item
  const [giftOptions, setGiftOptions] = useState({});

  // ─── Derived values ────────────────────────────────────────────────────────
  const selectedCartItems = useMemo(
    () => (cart.items || []).filter((i) => selectedIds.includes(i.id)),
    [cart.items, selectedIds]
  );

  const selectedSubtotal = useMemo(
    () => selectedCartItems.reduce((sum, i) => sum + (i.price || i.unitPrice || 0) * i.quantity, 0),
    [selectedCartItems]
  );

  const selectedCount = useMemo(
    () => selectedCartItems.reduce((sum, i) => sum + i.quantity, 0),
    [selectedCartItems]
  );

  const totalSavings = useMemo(
    () => selectedCartItems.reduce((sum, item) => {
      const price = item.price || item.unitPrice || 0;
      const mrp   = item.mrp || Math.round(price * 1.35);
      return sum + (mrp - price) * item.quantity;
    }, 0),
    [selectedCartItems]
  );

  const recommendedProducts = useMemo(() => {
    const live    = getLiveProducts() || [];
    const cartIds = new Set((cart.items || []).map((i) => i.id));
    return live.filter((p) => !cartIds.has(p.id)).slice(0, 4);
  }, [cart.items]);

  const allSelected =
    cart.items && cart.items.length > 0 && selectedIds.length === cart.items.length;

  const hasSelectedOutOfStock = useMemo(
    () => selectedCartItems.some((i) => i.maxStock !== undefined && i.maxStock <= 0),
    [selectedCartItems]
  );

  const isEmpty = !cart.items || cart.items.length === 0;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? [] : cart.items.map((i) => i.id));

  const toggleSelectItem = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleQuantity = (id, newQty) => {
    if (newQty <= 0) { handleRemove(id); return; }
    const target = cart.items.find((i) => i.id === id);
    if (target?.maxStock && newQty > target.maxStock) {
      addToast({ title: "Stock Limit Reached", message: `Only ${target.maxStock} units available.`, type: "warning" });
      return;
    }
    updateItemQuantity(id, newQty);
  };

  const handleRemove = (id) => {
    const item = cart.items.find((i) => i.id === id);
    removeItem(id);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    if (item) addToast({ title: "Item Removed", description: `${item.name || "Item"} removed.`, type: "info" });
  };

  const handleSaveForLater = (id) => {
    const item = cart.items.find((i) => i.id === id);
    if (!item) return;
    setSavedItems((prev) => [...prev, item]);
    handleRemove(id);
    addToast({ title: "Saved for Later", description: `${item.name} moved.`, type: "success" });
  };

  const handleMoveToCart = (item) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
    const newItems  = [...(cart.items || []), item];
    const subtotal  = newItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    setSelectedIds((prev) => [...prev, item.id]);
    addToast({ title: "Moved to Cart", description: `${item.name} added back.`, type: "success" });
  };

  const handleRemoveSaved = (id) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    addToast({ title: "Item Deleted", description: "Removed from saved list.", type: "info" });
  };

  const handleAddRecommended = (product) => {
    const pricing = product.pricing?.[country.code] || product.pricing?.US || {};
    const price   = Number(product.price || pricing.retailPrice || 399);
    const image   = product.image || product.images?.[0]?.url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80";
    const newItems = [...(cart.items || []), { id: product.id, name: product.name, price, mrp: product.mrp || Math.round(price * 1.35), quantity: 1, image }];
    setCart({ items: newItems, itemCount: newItems.length, subtotal: newItems.reduce((s, i) => s + i.price * i.quantity, 0) });
    setSelectedIds((prev) => [...prev, product.id]);
    addToast({ title: "Added to Cart", description: `${product.name} added.`, type: "success" });
  };

  const toggleGift = (id) =>
    setGiftOptions((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleShare = (item) => {
    const url = `${window.location.origin}/products/${item.slug || item.id}`;
    navigator.clipboard?.writeText(url);
    addToast({ title: "Link Copied!", description: "Product link copied to clipboard.", type: "success" });
  };

  const handleProceedToCheckout = () => {
    if (selectedCount === 0) {
      addToast({ title: "No Items Selected", description: "Select at least 1 item.", type: "warning" });
      return;
    }
    if (hasSelectedOutOfStock) {
      addToast({ title: "Item Out of Stock", description: "Remove out-of-stock items before checkout.", type: "error" });
      return;
    }
    navigate(ROUTES.CHECKOUT);
  };

  return {
    // store state
    cart,
    isLoading,
    country,
    isEmpty,
    clearLocalCart,
    // selection
    selectedIds,
    selectedCartItems,
    selectedSubtotal,
    selectedCount,
    totalSavings,
    allSelected,
    hasSelectedOutOfStock,
    // destination & tax inputs
    destination,
    setDestination,
    // other state
    savedItems,
    giftOptions,
    recommendedProducts,
    // handlers
    toggleSelectAll,
    toggleSelectItem,
    handleQuantity,
    handleRemove,
    handleSaveForLater,
    handleMoveToCart,
    handleRemoveSaved,
    handleAddRecommended,
    toggleGift,
    handleShare,
    handleProceedToCheckout,
  };
}
