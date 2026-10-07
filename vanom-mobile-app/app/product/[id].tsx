import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.placeholderText}>Product image</Text>
      </View>

      <Text style={styles.title}>Product Details</Text>
      <Text style={styles.id}>Product ID: {id}</Text>
      <Text style={styles.description}>
        Connect this screen to your existing product-by-id API endpoint and
        render variants, pricing, stock, reviews and add-to-cart actions here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
    padding: spacing.lg,
  },
  imagePlaceholder: {
    height: 320,
    borderRadius: 24,
    backgroundColor: colors.brand.light,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  title: {
    marginTop: spacing.xl,
    fontSize: 25,
    fontWeight: "800",
    color: colors.neutral.text,
  },
  id: {
    marginTop: spacing.sm,
    color: colors.neutral.muted,
  },
  description: {
    marginTop: spacing.lg,
    color: colors.neutral.secondary,
    lineHeight: 21,
  },
});
