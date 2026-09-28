import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";

export function useAdminInventory() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL");

  // 1. Live Inventory Query
  const {
    data: rawInventory = [],
    isLoading: isInventoryLoading,
    refetch: refetchInventory,
  } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => Api.admin.getInventory(),
  });

  // 2. Warehouses Query
  const {
    data: rawWarehouses = [],
    isLoading: isWarehousesLoading,
    refetch: refetchWarehouses,
  } = useQuery({
    queryKey: ["admin-warehouses"],
    queryFn: () => Api.admin.getWarehouses(),
  });

  // 3. Summary / Reports Query
  const {
    data: rawSummary = null,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["admin-inventory-summary"],
    queryFn: () => Api.admin.getInventorySummary(),
  });

  // 4. Catalog Products Query
  const {
    data: rawProducts = [],
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["admin-products-catalog"],
    queryFn: () => Api.admin.getProducts(),
  });

  const inventoryItems = Array.isArray(rawInventory)
    ? rawInventory
    : Array.isArray(rawInventory?.items)
    ? rawInventory.items
    : [];

  const warehouses = Array.isArray(rawWarehouses)
    ? rawWarehouses
    : Array.isArray(rawWarehouses?.data)
    ? rawWarehouses.data
    : [];

  const refetch = () => {
    refetchInventory();
    refetchWarehouses();
    refetchSummary();
    refetchProducts();
  };

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        inventoryItems
          .map((item) => item.product?.category?.name || item.product?.category || item.category)
          .filter(Boolean)
      )
    );
  }, [inventoryItems]);

  // Extract flattened variants for adjustment and barcode scanning lookup
  const allVariants = useMemo(() => {
    return inventoryItems.map((item) => {
      const prod = item.product || item;
      const variant = item.variant;
      const stock = item.quantity !== undefined ? item.quantity : (item.stock || 0);
      const reserved = item.reservedQuantity !== undefined ? item.reservedQuantity : (item.reserved || 0);

      return {
        id: item.id,
        inventoryId: item.id,
        productId: prod.id,
        variantId: variant?.id || null,
        name: variant?.name ? `${prod.name} - ${variant.name}` : prod.name,
        sku: variant?.sku || prod.sku || "SKU-STD",
        productName: prod.name,
        category: prod.category?.name || prod.category || "General",
        brand: prod.brand?.name || prod.brand || "Vanom",
        stock,
        reserved,
        available: Math.max(0, stock - reserved),
        barcode: variant?.sku || prod.sku || `VN-${item.id.slice(0, 8).toUpperCase()}`,
        warehouse: item.warehouse,
      };
    });
  }, [inventoryItems]);

  // Extract catalog-wide selectable products & variants (always available even if inventory empty)
  const catalogSelectables = useMemo(() => {
    const list = [];
    const prods = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.items || []);

    prods.forEach((p) => {
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach((v) => {
          list.push({
            id: `var_${v.id}`,
            productId: p.id,
            variantId: v.id,
            name: `${p.name} - ${v.name || v.sku || "Variant"}`,
            sku: v.sku || p.sku || "SKU",
            productName: p.name,
            variantName: v.name,
            currentStock: v.stock || 0,
            type: "VARIANT",
          });
        });
      } else {
        list.push({
          id: `prod_${p.id}`,
          productId: p.id,
          variantId: null,
          name: p.name,
          sku: p.sku || "SKU",
          productName: p.name,
          variantName: null,
          currentStock: p.stock || 0,
          type: "SIMPLE",
        });
      }
    });

    // Also include any inventory items not already represented
    inventoryItems.forEach((inv) => {
      const prod = inv.product || inv;
      const variant = inv.variant;
      const key = variant ? `var_${variant.id}` : `prod_${prod.id}`;
      if (!list.some((item) => item.id === key)) {
        list.push({
          id: key,
          productId: prod.id,
          variantId: variant?.id || null,
          name: variant?.name ? `${prod.name} - ${variant.name}` : prod.name,
          sku: variant?.sku || prod.sku || "SKU",
          productName: prod.name,
          variantName: variant?.name || null,
          currentStock: inv.quantity !== undefined ? inv.quantity : (inv.stock || 0),
          warehouseId: inv.warehouseId,
          warehouseCode: inv.warehouse?.code,
          type: variant ? "VARIANT" : "SIMPLE",
        });
      }
    });

    return list;
  }, [rawProducts, inventoryItems]);

  // Mutations
  const adjustMutation = useMutation({
    mutationFn: (payload) => Api.admin.adjustInventory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });
      toast.success("Inventory Adjusted", "Stock quantity updated successfully.");
    },
    onError: (err) => {
      toast.error("Adjustment Failed", err.message || "Failed to adjust stock");
    },
  });

  const receiveMutation = useMutation({
    mutationFn: (payload) => Api.admin.receiveStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });
      toast.success("Stock Received", "Inward stock logged and added to warehouse.");
    },
    onError: (err) => {
      toast.error("Receive Failed", err.message || "Failed to inward stock");
    },
  });

  const transferMutation = useMutation({
    mutationFn: (payload) => Api.admin.transferStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });
      toast.success("Transfer Successful", "Atomic stock transfer completed.");
    },
    onError: (err) => {
      toast.error("Transfer Failed", err.message || "Failed to transfer stock");
    },
  });

  const createWarehouseMutation = useMutation({
    mutationFn: (payload) => Api.admin.createWarehouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-summary"] });
      toast.success("Warehouse Created", "New depot hub registered.");
    },
    onError: (err) => {
      toast.error("Failed to Create Warehouse", err.message);
    },
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] });
      toast.success("Warehouse Updated", "Depot details saved.");
    },
    onError: (err) => {
      toast.error("Update Failed", err.message);
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] });
      toast.success("Warehouse Deactivated", "Depot status updated.");
    },
    onError: (err) => {
      toast.error("Deactivation Failed", err.message);
    },
  });

  // Filtered rows
  const filteredInventory = useMemo(() => {
    return inventoryItems.filter((row) => {
      const q = searchTerm.toLowerCase().trim();
      const prodName = (row.product?.name || row.name || "").toLowerCase();
      const sku = (row.variant?.sku || row.product?.sku || row.sku || "").toLowerCase();
      const brand = (row.product?.brand?.name || row.product?.brand || row.brand || "").toLowerCase();
      const whCode = (row.warehouse?.code || "").toLowerCase();

      const matchesSearch = !q || prodName.includes(q) || sku.includes(q) || brand.includes(q) || whCode.includes(q);

      const category = row.product?.category?.name || row.product?.category || row.category;
      const matchesCategory = selectedCategory === "ALL" || category === selectedCategory;

      const matchesWarehouse = selectedWarehouse === "ALL" || row.warehouseId === selectedWarehouse;

      return matchesSearch && matchesCategory && matchesWarehouse;
    });
  }, [inventoryItems, searchTerm, selectedCategory, selectedWarehouse]);

  // Metrics Calculation
  const metrics = useMemo(() => {
    if (rawSummary) {
      return {
        totalProducts: rawSummary.totalProducts || 0,
        totalOnHand: rawSummary.totalStockUnits || 0,
        totalReserved: rawSummary.totalReservedUnits || 0,
        totalAvailable: rawSummary.totalAvailableUnits || 0,
        lowStockCount: rawSummary.lowStockCount || 0,
        outOfStockCount: rawSummary.outOfStockCount || 0,
        warehouseCount: rawSummary.warehouseCount || warehouses.length || 1,
      };
    }

    const totalOnHand = inventoryItems.reduce((sum, r) => sum + (r.quantity !== undefined ? r.quantity : (r.stock || 0)), 0);
    const totalReserved = inventoryItems.reduce((sum, r) => sum + (r.reservedQuantity !== undefined ? r.reservedQuantity : (r.reserved || 0)), 0);
    const totalAvailable = Math.max(0, totalOnHand - totalReserved);
    const lowStockCount = inventoryItems.filter((r) => {
      const avail = (r.quantity || 0) - (r.reservedQuantity || 0);
      return avail > 0 && avail <= (r.reorderLevel || 10);
    }).length;
    const outOfStockCount = inventoryItems.filter((r) => ((r.quantity || 0) - (r.reservedQuantity || 0)) <= 0).length;

    return {
      totalProducts: inventoryItems.length,
      totalOnHand,
      totalReserved,
      totalAvailable,
      lowStockCount,
      outOfStockCount,
      warehouseCount: warehouses.length || 1,
    };
  }, [inventoryItems, rawSummary, warehouses]);

  return {
    inventoryItems,
    filteredInventory,
    warehouses,
    categories,
    allVariants,
    catalogSelectables,
    isLoading: isInventoryLoading || isWarehousesLoading || isProductsLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedWarehouse,
    setSelectedWarehouse,
    adjustMutation,
    receiveMutation,
    transferMutation,
    createWarehouseMutation,
    updateWarehouseMutation,
    deleteWarehouseMutation,
    metrics,
  };
}
