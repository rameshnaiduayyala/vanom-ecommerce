import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, spacing, typography } from "@/theme";
import { useProducts } from "@/features/products/hooks";
import { ProductCard } from "@/components/product/ProductCard";

const categories = [
  { name: "Digital", emoji: "📱" },
  { name: "Glow Up", emoji: "✨" },
  { name: "Desk", emoji: "🖊️" },
  { name: "Health", emoji: "⌚" },
  { name: "Home & Kitchen", emoji: "🏠" },
  { name: "Groceries", emoji: "🛒" },
  { name: "Household", emoji: "🧹" },
];

export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useProducts();
  const products = useMemo(() => data?.items ?? [], [data]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Vanom</Text>
          <Text style={styles.tagline}>Everything you need, in one place.</Text>
        </View>

        <Pressable style={styles.cartButton}>
          <Text style={styles.cartText}>Cart</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>VANOM PICKS</Text>
          <Text style={styles.heroTitle}>Smart products. Better everyday.</Text>
          <Text style={styles.heroText}>
            Discover electronics, beauty, home, groceries and more.
          </Text>
          <Pressable style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Shop now</Text>
          </Pressable>
        </View>
        <View style={styles.heroGlow} />
      </View>

      <Text style={styles.sectionTitle}>Shop by category</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable style={styles.category}>
            <Text style={styles.categoryEmoji}>{item.emoji}</Text>
            <Text style={styles.categoryText}>{item.name}</Text>
          </Pressable>
        )}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured products</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.brand.primary} />
      ) : isError ? (
        <Pressable onPress={() => refetch()} style={styles.retry}>
          <Text style={styles.retryText}>Unable to load products. Tap to retry.</Text>
        </Pressable>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => <ProductCard product={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: 58,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    color: colors.brand.deep,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },
  tagline: {
    color: colors.neutral.secondary,
    marginTop: 2,
    fontSize: 12,
  },
  cartButton: {
    borderRadius: 14,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cartText: { color: colors.brand.deep, fontWeight: "700" },
  hero: {
    minHeight: 190,
    borderRadius: 24,
    backgroundColor: colors.brand.deep,
    overflow: "hidden",
    padding: spacing.xl,
    marginBottom: spacing.xl,
    position: "relative",
  },
  heroCopy: { width: "72%", zIndex: 2 },
  heroEyebrow: {
    color: colors.premium.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  heroTitle: {
    color: colors.neutral.white,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    marginTop: 8,
  },
  heroText: {
    color: "#D4E8DF",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.premium.gold,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 14,
  },
  heroButtonText: { color: colors.brand.deep, fontWeight: "800" },
  heroGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    right: -60,
    bottom: -60,
    borderRadius: 100,
    backgroundColor: colors.brand.fresh,
    opacity: 0.45,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.neutral.text,
    marginBottom: spacing.sm,
  },
  viewAll: { color: colors.brand.primary, fontWeight: "700" },
  categoryList: { paddingBottom: spacing.sm },
  category: {
    width: 92,
    minHeight: 86,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    padding: spacing.sm,
  },
  categoryEmoji: { fontSize: 25, marginBottom: 6 },
  categoryText: {
    textAlign: "center",
    color: colors.neutral.text,
    fontSize: 11,
    fontWeight: "600",
  },
  productList: { paddingBottom: 40 },
  retry: {
    padding: spacing.xl,
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
  },
  retryText: { color: colors.status.error, fontWeight: "600" },
});
