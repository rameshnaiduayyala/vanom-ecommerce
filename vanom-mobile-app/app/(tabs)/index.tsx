import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { shadows } from "../../src/theme/shadows";
import { SearchBar } from "../../src/components/ui/SearchBar";
import { ProductCard } from "../../src/components/product/ProductCard";
import { LoadingState } from "../../src/components/ui/States";
import { productsApi, Product } from "../../src/services/api/products.api";
import { categoriesApi } from "../../src/services/api/categories.api";
import { useCartStore } from "../../src/store/cart.store";

const VANOM_CATEGORIES = [
  { id: "digital", name: "Digital", icon: "??" },
  { id: "glow-up", name: "Glow Up", icon: "?" },
  { id: "desk", name: "Desk", icon: "??" },
  { id: "health", name: "Health", icon: "??" },
  { id: "home-kitchen", name: "Home & Kitchen", icon: "??" },
  { id: "groceries", name: "Groceries", icon: "??" },
  { id: "household", name: "Household", icon: "??" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  const {
    data: productsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => productsApi.getProducts({ limit: 12 }),
  });

  const { data: featuredData } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsApi.getFeatured(6),
  });

  const products: Product[] = productsData?.data?.items ?? [];
  const featured: Product[] = featuredData?.data ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.brand.primary}
          />
        }
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>VANOM</Text>
            <View style={styles.locationRow}>
              <Text style={styles.pinIcon}>??</Text>
              <Text style={styles.locationText}>Deliver to Hyderabad 500081</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push("/bulk")}
              style={styles.bulkPill}
            >
              <Text style={styles.bulkText}>Bulk B2B</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/cart")}
              style={styles.iconButton}
            >
              <Text style={styles.headerIcon}>??</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Search bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={() => {
              if (search.trim()) {
                router.push({
                  pathname: "/(tabs)/categories",
                  params: { query: search },
                });
              }
            }}
          />
        </View>

        {/* 3. Hero Promotional Banner Carousel */}
        <View style={styles.banner}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>PREMIUM STORE</Text>
          </View>
          <Text style={styles.bannerTitle}>
            Everything You Need.{"\n"}Engineered with Precision.
          </Text>
          <Text style={styles.bannerSubtitle}>
            Up to 40% off on Digital, Tech &amp; Daily Essentials
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/categories")}
            style={styles.bannerButton}
          >
            <Text style={styles.bannerBtnText}>Shop Now ?</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Shop by Category (Horizontal Scroll) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/categories")}>
            <Text style={styles.seeAll}>See All ?</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {VANOM_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/categories",
                  params: { categoryId: cat.id, name: cat.name },
                })
              }
              style={styles.categoryChip}
            >
              <View style={styles.categoryIconWrap}>
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 5. Featured Products */}
        {featured.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Picks</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProducts}
            >
              {featured.map((item) => (
                <View key={item.id} style={{ width: 170 }}>
                  <ProductCard
                    product={item}
                    onPress={() => router.push(`/product/${item.id}`)}
                    onAddToCart={() => addItem(item)}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* 6. Trending Products Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending &amp; New Arrivals</Text>
        </View>

        {isLoading ? (
          <LoadingState message="Fetching live catalog..." />
        ) : (
          <View style={styles.grid}>
            {products.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <ProductCard
                  product={item}
                  onPress={() => router.push(`/product/${item.id}`)}
                  onAddToCart={() => addItem(item)}
                />
              </View>
            ))}
          </View>
        )}

        {/* 7. Value Propositions / Service Benefits */}
        <View style={styles.benefitsRow}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>?</Text>
            <Text style={styles.benefitTitle}>Fast Delivery</Text>
            <Text style={styles.benefitDesc}>On eligible orders</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>???</Text>
            <Text style={styles.benefitTitle}>Secure Payments</Text>
            <Text style={styles.benefitDesc}>Encrypted checkout</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>??</Text>
            <Text style={styles.benefitTitle}>Easy Returns</Text>
            <Text style={styles.benefitDesc}>Hassle-free guarantee</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.white,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.brand.deep,
    letterSpacing: 1.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  pinIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  locationText: {
    fontSize: 11,
    color: colors.neutral.muted,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulkPill: {
    backgroundColor: colors.premium.soft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.premium.gold,
  },
  bulkText: {
    color: colors.brand.deep,
    fontSize: 11,
    fontWeight: "700",
  },
  iconButton: {
    padding: 6,
  },
  headerIcon: {
    fontSize: 20,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  banner: {
    margin: 16,
    backgroundColor: colors.brand.deep,
    borderRadius: radius.xl,
    padding: 22,
    ...shadows.md,
  },
  bannerBadge: {
    backgroundColor: colors.premium.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  bannerBadgeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutral.white,
    lineHeight: 26,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#EAF7F0",
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  bannerBtnText: {
    color: colors.brand.deep,
    fontWeight: "700",
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  categoryScroll: {
    paddingHorizontal: 12,
    gap: 12,
  },
  categoryChip: {
    alignItems: "center",
    width: 76,
  },
  categoryIconWrap: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    ...shadows.sm,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral.text,
    textAlign: "center",
  },
  horizontalProducts: {
    paddingHorizontal: 12,
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  gridItem: {
    width: "50%",
  },
  benefitsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.neutral.white,
    margin: 16,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  benefitItem: {
    alignItems: "center",
  },
  benefitIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.neutral.text,
  },
  benefitDesc: {
    fontSize: 10,
    color: colors.neutral.muted,
  },
});
