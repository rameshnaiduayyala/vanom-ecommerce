import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";

export function useAdminInventory() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Queries
  const {
    data: rawInventory = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => Api.admin.getInventory(),
  });

  const inventoryItems = Array.isArray(rawInventory)
    ? rawInventory
    : Array.isArray(rawInventory?.items)
    ? rawInventory.items
    : [];

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(inventoryItems.map((item) => item.category).filter(Boolean))
    );
  }, [inventoryItems]);

  // Extract flattened variants for adjustment and barcode scanning lookup
  const allVariants = useMemo(() => {
    return inventoryItems.flatMap((p) => {
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        return p.variants.map((v) => ({
          id: v.id,
          productId: p.id,
          name: `${p.name} - ${v.name || v.sku || "Standard"}`,
          sku: v.sku || p.sku,
          productName: p.name,
          category: p.category,
          brand: p.brand,
          stock: v.stock || 50,
          reserved: v.reserved || 0,
          available: Math.max(0, (v.stock || 50) - (v.reserved || 0)),
          barcode: v.sku || p.sku || `VN-${v.id.slice(0, 8).toUpperCase()}`,
        }));
      }
      return [
        {
          id: p.id,
          productId: p.id,
          name: p.name,
          sku: p.sku || "SKU-STD",
          productName: p.name,
          category: p.category,
          brand: p.brand,
          stock: p.stock || 100,
          reserved: p.reserved || 0,
          available: p.available || 100,
          barcode: p.sku || `VN-${p.id.slice(0, 8).toUpperCase()}`,
        },
      ];
    });
  }, [inventoryItems]);

  // Stock Adjustment Mutation
  const adjustMutation = useMutation({
    mutationFn: (payload) => Api.admin.adjustInventory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      toast.success("Inventory Adjusted", "Stock quantity updated successfully.");
    },
    onError: (err) => {
      toast.error("Adjustment Failed", err.message || "Failed to adjust stock");
    },
  });

  // Filtered rows
  const filteredInventory = useMemo(() => {
    return inventoryItems.filter((row) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.sku && row.sku.toLowerCase().includes(q)) ||
        (row.brand && row.brand.toLowerCase().includes(q)) ||
        (row.variants &&
          row.variants.some((v) => v.sku && v.sku.toLowerCase().includes(q)));

      const matchesCategory =
        selectedCategory === "ALL" || row.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [inventoryItems, searchTerm, selectedCategory]);

  const metrics = useMemo(() => {
    const totalOnHand = inventoryItems.reduce((sum, r) => sum + (r.stock || 0), 0);
    const totalReserved = inventoryItems.reduce((sum, r) => sum + (r.reserved || 0), 0);
    const totalAvailable = Math.max(0, totalOnHand - totalReserved);
    return { totalOnHand, totalReserved, totalAvailable };
  }, [inventoryItems]);

  return {
    inventoryItems,
    filteredInventory,
    categories,
    allVariants,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    adjustMutation,
    metrics,
  };
}
