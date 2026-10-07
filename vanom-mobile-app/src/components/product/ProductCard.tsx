import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";
import type { Product } from "@/features/products/types";
import { useCartStore } from "@/store/cart.store";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <View style={styles.card}>
      <Pressable>
        <View style={styles.imageWrap}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price.toLocaleString("en-IN")}</Text>
          {!!product.compareAtPrice && (
            <Text style={styles.compare}>
              ₹{product.compareAtPrice.toLocaleString("en-IN")}
            </Text>
          )}
        </View>
      </Pressable>

      <Pressable
        onPress={() =>
          addItem({
            id: product.id,
            name: product.name,
            price: product.price,
          })
        }
        style={styles.add}
      >
        <Text style={styles.addText}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.neutral.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.sm,
    margin: spacing.xs,
  },
  imageWrap: {
    height: 150,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.brand.light,
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { flex: 1, backgroundColor: colors.brand.light },
  name: {
    color: colors.neutral.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: spacing.md,
    minHeight: 38,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: { color: colors.brand.deep, fontSize: 16, fontWeight: "800" },
  compare: {
    color: colors.neutral.muted,
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  add: {
    marginTop: spacing.md,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: colors.brand.primary, fontWeight: "700" },
});
