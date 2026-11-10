import React, { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import {
  Search,
  ChevronDown,
  X,
  Check,
  Package,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";

/**
 * Reusable Searchable Product Dropdown Component
 *
 * @param {Object} props
 * @param {string} [props.value] - Selected product or item ID / key
 * @param {Function} props.onChange - (selectedValue, selectedItem) => void
 * @param {Array} [props.products] - Optional list of products. If omitted, queries getProductsDropdown automatically.
 * @param {Array} [props.items] - Optional pre-formatted list of selectable items (e.g. inventory variants)
 * @param {boolean} [props.includeVariants=false] - If true, flattens product variants as selectable rows
 * @param {boolean} [props.showImage=true] - Whether to show the product thumbnail (alias: showimage)
 * @param {boolean} [props.showStock=true] - Whether to show available stock count (alias: showstock)
 * @param {boolean} [props.showPrice=true] - Whether to show price (aliases: showprice, showPrise)
 * @param {boolean} [props.showSku=true] - Whether to show product/variant SKU (alias: showsku)
 * @param {boolean} [props.showCategory=true] - Whether to show category name (alias: showcategory)
 * @param {string} [props.placeholder="Search and select a product..."]
 * @param {string} [props.searchPlaceholder="Type product name, SKU, or category..."]
 * @param {string} [props.label] - Optional field label
 * @param {string} [props.error] - Optional validation error string
 * @param {string} [props.helperText] - Optional helper note
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.clearable=true]
 * @param {string} [props.className] - Extra wrapper classes
 * @param {string} [props.size="md"] - 'sm' | 'md' | 'lg'
 */
export function ProductSearchableDropdown({
  value,
  onChange,
  products,
  items,
  includeVariants = false,
  showImage = true,
  showimage,
  showStock = false,
  showstock,
  showPrice = true,
  showprice,
  showPrise,
  showSku = true,
  showsku,
  showCategory = true,
  showcategory,
  placeholder = "Search and select a product...",
  searchPlaceholder = "Type product name, SKU, or category...",
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  clearable = true,
  className = "",
  size = "md",
}) {
  // Normalize flexible prop aliases for developer convenience
  const displayImage = showImage ?? showimage ?? true;
  const displayStock = showStock ?? showstock ?? true;
  const displayPrice = showPrice ?? showprice ?? showPrise ?? true;
  const displaySku = showSku ?? showsku ?? true;
  const displayCategory = showCategory ?? showcategory ?? true;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-fetch products via the ultra-fast dropdown endpoint if products/items not provided
  const shouldFetch = !products && !items;
  const { data: fetchedProducts = [], isLoading: isFetchingProducts } = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: () => Api.catalog.getProductsDropdown({ limit: 500 }),
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
  });

  // Normalize list of selectable items
  const normalizedItems = useMemo(() => {
    // 1. If explicit custom items were provided (e.g. inventory variants)
    if (Array.isArray(items) && items.length > 0) {
      return items.map((it) => {
        const prod = it.product || it;
        const variant = it.variant;
        const key = it.id || `${it.productId || prod.id}_${it.variantId || variant?.id || "simple"}`;
        const img =
          it.image ||
          variant?.image ||
          prod.image ||
          (Array.isArray(prod.images) ? prod.images[0]?.url || prod.images[0] : null);

        return {
          id: key,
          value: key,
          productId: it.productId || prod.id,
          variantId: it.variantId || variant?.id || null,
          name: it.name || prod.name || "Product",
          sku: it.sku || variant?.sku || prod.sku || "",
          stock: it.currentStock !== undefined ? it.currentStock : it.stock,
          price: it.price || prod.basePrice,
          image: img,
          categoryName: it.categoryName || prod.categoryName || prod.category?.name || null,
          type: variant ? "VARIANT" : (it.type || "SIMPLE"),
          raw: it,
        };
      });
    }

    // 2. Otherwise normalize products list
    const sourceProducts = products || fetchedProducts;
    const rawList = Array.isArray(sourceProducts)
      ? sourceProducts
      : Array.isArray(sourceProducts?.data)
      ? sourceProducts.data
      : Array.isArray(sourceProducts?.items)
      ? sourceProducts.items
      : [];

    const result = [];

    rawList.forEach((prod) => {
      const prodImg =
        prod.image ||
        (Array.isArray(prod.images) && prod.images.length > 0
          ? typeof prod.images[0] === "string"
            ? prod.images[0]
            : prod.images[0]?.url
          : null);

      if (includeVariants && Array.isArray(prod.variants) && prod.variants.length > 0) {
        prod.variants.forEach((v) => {
          result.push({
            id: v.id || `${prod.id}_${v.sku}`,
            value: v.id || `${prod.id}_${v.sku}`,
            productId: prod.id,
            variantId: v.id,
            name: `${prod.name} - ${v.name || v.sku || "Variant"}`,
            sku: v.sku || prod.sku || "",
            stock: v.stock !== undefined ? v.stock : prod.stock,
            price: v.price || prod.basePrice,
            image: v.image || prodImg,
            categoryName: prod.categoryName || prod.category?.name || null,
            type: "VARIANT",
            raw: v,
            parentProduct: prod,
          });
        });
      } else {
        result.push({
          id: prod.id,
          value: prod.id,
          productId: prod.id,
          variantId: null,
          name: prod.name,
          sku: prod.sku || "",
          slug: prod.slug,
          stock: prod.stock,
          price: prod.basePrice,
          image: prodImg,
          categoryName: prod.categoryName || prod.category?.name || null,
          type: prod.type || "SIMPLE",
          raw: prod,
        });
      }
    });

    return result;
  }, [items, products, fetchedProducts, includeVariants]);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    if (!value) return null;
    return (
      normalizedItems.find(
        (it) =>
          it.value === value ||
          it.id === value ||
          it.productId === value ||
          (it.variantId && it.variantId === value)
      ) || null
    );
  }, [value, normalizedItems]);

  // Filter items matching user search query
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return normalizedItems;
    const q = searchTerm.toLowerCase().trim();

    return normalizedItems.filter((it) => {
      const name = (it.name || "").toLowerCase();
      const sku = (it.sku || "").toLowerCase();
      const category = (it.categoryName || "").toLowerCase();
      const slug = (it.slug || "").toLowerCase();

      return (
        name.includes(q) ||
        sku.includes(q) ||
        category.includes(q) ||
        slug.includes(q)
      );
    });
  }, [normalizedItems, searchTerm]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (item) => {
    onChange?.(item.value, item);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("", null);
  };

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {/* ── Optional Label ── */}
      {label && (
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
      )}

      {/* ── Dropdown Trigger Button ── */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 bg-white border rounded-xl text-left transition-all cursor-pointer select-none ${
          size === "sm" ? "px-2.5 py-1.5 text-xs min-h-[34px]" : "px-3 py-2 text-xs min-h-[42px]"
        } ${
          disabled
            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
            : isOpen
            ? "border-[#00875A] ring-2 ring-[#00875A]/15 shadow-sm"
            : error
            ? "border-rose-300 hover:border-rose-400 ring-1 ring-rose-300/40"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 shadow-2xs"
        }`}
      >
        {/* Selected Product Display / Placeholder */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedItem ? (
            <>
              {displayImage && (
                selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-7 h-7 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00875A] flex items-center justify-center shrink-0 border border-emerald-100">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                )
              )}

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 truncate leading-tight">
                  {selectedItem.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {displaySku && selectedItem.sku && (
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                      {selectedItem.sku}
                    </span>
                  )}
                  {displayStock && selectedItem.stock !== undefined && selectedItem.stock !== null && (
                    <span className="text-[10px] text-slate-400">
                      Stock: <strong className="text-slate-600">{selectedItem.stock}</strong>
                    </span>
                  )}
                  {displayPrice && selectedItem.price != null && (
                    <span className="text-[10px] font-bold text-emerald-800">
                      ${Number(selectedItem.price).toFixed(2)}
                    </span>
                  )}
                  {displayCategory && selectedItem.categoryName && (
                    <span className="text-[10px] text-slate-400 truncate">
                      • {selectedItem.categoryName}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <span className="text-slate-400 font-medium truncate">{placeholder}</span>
          )}
        </div>

        {/* Right Actions: Clear Button & Chevron */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {clearable && selectedItem && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
              className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#00875A]" : "text-slate-400"
            }`}
          />
        </div>
      </div>

      {/* ── Error & Helper text ── */}
      {error ? (
        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
      ) : null}

      {/* ── Floating Popover List ── */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200/95 shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Popover Header with Search Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick summary badge */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1.5 font-medium">
              <span>
                {filteredItems.length} product{filteredItems.length === 1 ? "" : "s"} found
              </span>
              {isFetchingProducts && (
                <span className="flex items-center gap-1 text-[#00875A]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating list...
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Items List */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-1 scrollbar-thin"
          >
            {isFetchingProducts && normalizedItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 text-[#00875A] animate-spin mx-auto" />
                <p className="font-semibold text-slate-600">Loading catalog products...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <Package className="w-7 h-7 text-slate-300 mx-auto mb-1 stroke-1" />
                <p className="font-semibold text-slate-700">No matching products</p>
                <p className="text-[11px] text-slate-400">
                  {searchTerm ? `No results found for "${searchTerm}"` : "Product catalog is empty"}
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = selectedItem?.value === item.value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-50/80 text-emerald-950 font-semibold"
                        : isHighlighted
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-800 hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Item Thumbnail & Information */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {displayImage && (
                        item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                            <Package className="w-4 h-4 text-slate-400" />
                          </div>
                        )
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate leading-tight">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {displaySku && item.sku && (
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                              {item.sku}
                            </span>
                          )}
                          {displayCategory && item.categoryName && (
                            <span className="text-[10px] text-slate-400 truncate">
                              {item.categoryName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock, Price and Selection Checkmark */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        {displayStock && item.stock !== undefined && item.stock !== null && (
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              item.stock > 10
                                ? "bg-emerald-50 text-emerald-700"
                                : item.stock > 0
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {item.stock} in stock
                          </span>
                        )}
                        {displayPrice && item.price != null && (
                          <p className="text-[11px] font-extrabold text-slate-900 mt-0.5">
                            ${Number(item.price).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#00875A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSearchableDropdown;
