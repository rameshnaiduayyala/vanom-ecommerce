import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { shadows } from "../../theme/shadows";
import { Product } from "../../services/api/products.api";
import { useWishlistStore } from "../../store/wishlist.store";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
}) => {
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const price = product.resolvedPrice?.unitPrice ?? product.price ?? 499;
  const originalPrice = product.resolvedPrice?.originalPrice ?? Math.round(price * 1.35);
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  const imageUrl =
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => toggleWishlist(product.id)}
          style={styles.wishlistButton}
          activeOpacity={0.7}
        >
          <Text style={styles.wishlistIcon}>{wishlisted ? "??" : "??"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        {product.brand?.name ? (
          <Text style={styles.brand}>{product.brand.name.toUpperCase()}</Text>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={styles.star}>?</Text>
          <Text style={styles.ratingText}>4.8</Text>
          <Text style={styles.reviewCount}>(124)</Text>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>?{price.toLocaleString("en-IN")}</Text>
            {originalPrice > price && (
              <Text style={styles.originalPrice}>?{originalPrice.toLocaleString("en-IN")}</Text>
            )}
          </View>
          {onAddToCart && (
            <TouchableOpacity
              onPress={onAddToCart}
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <Text style={styles.addText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
    flex: 1,
    margin: 6,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#F4F5F7",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  discountText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: "700",
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.full,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistIcon: {
    fontSize: 13,
  },
  info: {
    padding: 12,
  },
  brand: {
    fontSize: 10,
    color: colors.neutral.muted,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral.text,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  star: {
    color: colors.premium.gold,
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral.text,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.neutral.muted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  priceCol: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand.deep,
  },
  originalPrice: {
    fontSize: 11,
    color: colors.neutral.muted,
    textDecorationLine: "line-through",
  },
  addButton: {
    backgroundColor: colors.brand.light,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  addText: {
    color: colors.brand.primary,
    fontSize: 11,
    fontWeight: "700",
  },
});
