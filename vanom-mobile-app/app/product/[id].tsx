import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { shadows } from "../../src/theme/shadows";
import { Button } from "../../src/components/ui/Button";
import { Badge } from "../../src/components/ui/Badge";
import { LoadingState, ErrorState } from "../../src/components/ui/States";
import { productsApi } from "../../src/services/api/products.api";
import { useCartStore } from "../../src/store/cart.store";
import { useWishlistStore } from "../../src/store/wishlist.store";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProductByIdOrSlug(id as string),
    enabled: Boolean(id),
  });

  const product = data?.data;

  if (isLoading) return <LoadingState message="Loading product specs..." />;
  if (error || !product) {
    return <ErrorState error="Product details unavailable" onRetry={() => router.back()} />;
  }

  const wishlisted = isWishlisted(product.id);
  const price = product.resolvedPrice?.unitPrice ?? product.price ?? 499;
  const originalPrice = product.resolvedPrice?.originalPrice ?? Math.round(price * 1.35);
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  const imageUrl =
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Gallery Carousel */}
          <View style={styles.gallery}>
            <Image source={{ uri: imageUrl }} style={styles.mainImage} resizeMode="cover" />
            <TouchableOpacity
              onPress={() => toggleWishlist(product.id)}
              style={styles.floatingWishlist}
            >
              <Text style={{ fontSize: 18 }}>{wishlisted ? "??" : "??"}</Text>
            </TouchableOpacity>
          </View>

          {/* Core Info */}
          <View style={styles.content}>
            {product.brand?.name && (
              <Text style={styles.brand}>{product.brand.name.toUpperCase()}</Text>
            )}
            <Text style={styles.title}>{product.name}</Text>

            <View style={styles.ratingRow}>
              <View style={styles.ratingPill}>
                <Text style={styles.star}>?</Text>
                <Text style={styles.ratingNum}>4.8</Text>
              </View>
              <Text style={styles.ratingCount}>284 Verified Ratings</Text>
              <Badge label="In Stock" variant="success" />
            </View>

            {/* Price Box */}
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>?{price.toLocaleString("en-IN")}</Text>
                {originalPrice > price && (
                  <Text style={styles.originalPrice}>?{originalPrice.toLocaleString("en-IN")}</Text>
                )}
                {discount > 0 && <Badge label={`${discount}% OFF`} variant="primary" />}
              </View>
              <Text style={styles.taxNotice}>Inclusive of all taxes &amp; GST invoices</Text>
            </View>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <View style={styles.variantSection}>
                <Text style={styles.sectionHeading}>Select Variant / Packaging</Text>
                <View style={styles.variantsRow}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant === v.id;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        onPress={() => setSelectedVariant(v.id)}
                        style={[styles.variantChip, isSelected && styles.variantChipActive]}
                      >
                        <Text
                          style={[
                            styles.variantText,
                            isSelected && styles.variantTextActive,
                          ]}
                        >
                          {v.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Quantity Selector */}
            <View style={styles.qtyRow}>
              <Text style={styles.sectionHeading}>Quantity</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => q + 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descSection}>
              <Text style={styles.sectionHeading}>Product Overview</Text>
              <Text style={styles.description}>
                {product.description ||
                  "Engineered with premium commercial standards. Built to deliver long-lasting durability, high aesthetic appeal, and dependable performance across all settings."}
              </Text>
            </View>

            {/* Trust Assurances */}
            <View style={styles.assuranceBox}>
              <View style={styles.assuranceRow}>
                <Text style={styles.assuranceIcon}>??</Text>
                <View>
                  <Text style={styles.assuranceTitle}>Express Doorstep Delivery</Text>
                  <Text style={styles.assuranceSub}>Dispatched in 24 hours</Text>
                </View>
              </View>
              <View style={styles.assuranceRow}>
                <Text style={styles.assuranceIcon}>???</Text>
                <View>
                  <Text style={styles.assuranceTitle}>100% Genuine Vanom Product</Text>
                  <Text style={styles.assuranceSub}>Direct from verified manufacturers</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Bottom Actions */}
        <View style={styles.stickyBar}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => {
              addItem(product, quantity);
              router.push("/(tabs)/cart");
            }}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Button
              title="Buy Now"
              variant="primary"
              onPress={() => {
                addItem(product, quantity);
                router.push("/checkout");
              }}
            />
          </View>
        </View>
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
  gallery: {
    width: "100%",
    height: 320,
    backgroundColor: "#F4F5F7",
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  floatingWishlist: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  content: {
    padding: 18,
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -16,
    ...shadows.sm,
  },
  brand: {
    fontSize: 12,
    color: colors.brand.primary,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutral.text,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.deep,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    gap: 4,
  },
  star: {
    color: colors.premium.gold,
    fontSize: 12,
  },
  ratingNum: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: "700",
  },
  ratingCount: {
    fontSize: 12,
    color: colors.neutral.muted,
  },
  priceContainer: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral.border,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.brand.deep,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.neutral.muted,
    textDecorationLine: "line-through",
  },
  taxNotice: {
    fontSize: 11,
    color: colors.neutral.muted,
    marginTop: 4,
  },
  variantSection: {
    marginTop: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.text,
    marginBottom: 10,
  },
  variantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.background,
  },
  variantChipActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.light,
  },
  variantText: {
    fontSize: 12,
    color: colors.neutral.secondary,
    fontWeight: "600",
  },
  variantTextActive: {
    color: colors.brand.primary,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    backgroundColor: colors.neutral.white,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.text,
  },
  qtyText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.text,
  },
  descSection: {
    marginTop: 24,
  },
  description: {
    fontSize: 14,
    color: colors.neutral.secondary,
    lineHeight: 22,
  },
  assuranceBox: {
    marginTop: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: radius.lg,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  assuranceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assuranceIcon: {
    fontSize: 22,
  },
  assuranceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral.text,
  },
  assuranceSub: {
    fontSize: 11,
    color: colors.neutral.muted,
  },
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    gap: 12,
    ...shadows.md,
  },
  addToCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  addToCartText: {
    color: colors.brand.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
