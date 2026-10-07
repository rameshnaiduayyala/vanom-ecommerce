import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { ProductCard } from "../../src/components/product/ProductCard";
import { SearchBar } from "../../src/components/ui/SearchBar";
import { LoadingState, EmptyState } from "../../src/components/ui/States";
import { productsApi, Product } from "../../src/services/api/products.api";
import { categoriesApi, Category } from "../../src/services/api/categories.api";
import { useCartStore } from "../../src/store/cart.store";

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedCatId, setSelectedCatId] = useState<string>(
    (params.categoryId as string) || ""
  );
  const [search, setSearch] = useState<string>((params.query as string) || "");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc">("featured");

  const addItem = useCartStore((s) => s.addItem);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getCategories(),
  });

  const categories: Category[] = catData?.data ?? [];

  const { data: prodData, isLoading } = useQuery({
    queryKey: ["products", "catalog", selectedCatId, search],
    queryFn: () =>
      productsApi.getProducts({
        categoryId: selectedCatId || undefined,
        search: search || undefined,
        limit: 20,
      }),
  });

  let items: Product[] = prodData?.data?.items ?? [];

  if (sortBy === "price_asc") {
    items = [...items].sort(
      (a, b) =>
        (a.resolvedPrice?.unitPrice ?? 0) - (b.resolvedPrice?.unitPrice ?? 0)
    );
  } else if (sortBy === "price_desc") {
    items = [...items].sort(
      (a, b) =>
        (b.resolvedPrice?.unitPrice ?? 0) - (a.resolvedPrice?.unitPrice ?? 0)
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search header */}
        <View style={styles.header}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search category products..."
          />
        </View>

        {/* Subcategory / Filter chips */}
        <View style={styles.filterRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: "", name: "All Products" }, ...categories]}
            keyExtractor={(i) => i.id || "all"}
            contentContainerStyle={styles.chipList}
            renderItem={({ item }) => {
              const active = selectedCatId === item.id;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedCatId(item.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Sorting header */}
        <View style={styles.sortBar}>
          <Text style={styles.countText}>{items.length} Products Found</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              onPress={() => setSortBy("featured")}
              style={[styles.sortBtn, sortBy === "featured" && styles.sortBtnActive]}
            >
              <Text style={styles.sortBtnText}>Popular</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setSortBy(sortBy === "price_asc" ? "price_desc" : "price_asc")
              }
              style={[
                styles.sortBtn,
                sortBy !== "featured" && styles.sortBtnActive,
              ]}
            >
              <Text style={styles.sortBtnText}>
                Price {sortBy === "price_asc" ? "?" : "?"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Grid */}
        {isLoading ? (
          <LoadingState message="Loading catalog..." />
        ) : items.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="Try selecting another category or clear your search query."
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(p) => p.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <ProductCard
                  product={item}
                  onPress={() => router.push(`/product/${item.id}`)}
                  onAddToCart={() => addItem(item)}
                />
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  filterRow: {
    backgroundColor: colors.neutral.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  chipList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: "#F2F4F7",
  },
  chipActive: {
    backgroundColor: colors.brand.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral.secondary,
  },
  chipTextActive: {
    color: colors.neutral.white,
  },
  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 12,
    color: colors.neutral.muted,
    fontWeight: "600",
  },
  sortButtons: {
    flexDirection: "row",
    gap: 6,
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  sortBtnActive: {
    borderColor: colors.brand.primary,
  },
  sortBtnText: {
    fontSize: 11,
    color: colors.neutral.text,
    fontWeight: "600",
  },
  listContainer: {
    padding: 10,
  },
  cardWrapper: {
    flex: 0.5,
  },
});
