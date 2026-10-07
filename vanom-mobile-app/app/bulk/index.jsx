import { SafeAreaView } from 'react-native-safe-area-context';
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet } from


"react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { shadows } from "../../src/theme/shadows";
import { Button } from "../../src/components/ui/Button";
import { LoadingState } from "../../src/components/ui/States";
import { bulkApi } from "../../src/services/api/bulk.api";

export default function BulkDashboardScreen() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["bulk", "products"],
    queryFn: () => bulkApi.getBulkProducts({ limit: 10 })
  });

  const products = data?.data?.items ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* B2B Header Banner */}
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>B2B COMMERCIAL WHOLESALE</Text>
          </View>
          <Text style={styles.heroTitle}>Vanom Enterprise &amp; Bulk Procurement</Text>
          <Text style={styles.heroSub}>
            Volume tiered discounts, dedicated GST invoicing, pallet freight rates, and net-30 terms for registered institutions.
          </Text>

          <View style={styles.ctaRow}>
            <Button
              title="Register Your Business"
              variant="gold"
              onPress={() => router.push("/bulk/register")} />
            
          </View>
        </View>

        {/* Value Pillars */}
        <View style={styles.pillarsGrid}>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>??</Text>
            <Text style={styles.pillarTitle}>Pallet &amp; Case Lots</Text>
            <Text style={styles.pillarDesc}>Direct from verified factories</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>??</Text>
            <Text style={styles.pillarTitle}>Instant GST Credit</Text>
            <Text style={styles.pillarDesc}>Full e-invoicing compliance</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>??</Text>
            <Text style={styles.pillarTitle}>Account Manager</Text>
            <Text style={styles.pillarDesc}>Dedicated rep for bulk orders</Text>
          </View>
        </View>

        {/* Dedicated Bulk Catalog Listing */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Commercial Bulk Catalog</Text>
        </View>

        {isLoading ?
        <LoadingState message="Fetching commercial catalog..." /> :

        <View style={styles.catalogList}>
            {products.map((item) =>
          <View key={item.id} style={styles.bulkCard}>
                <View style={styles.bulkHeader}>
                  <Text style={styles.bulkSku}>SKU: {item.sku}</Text>
                  <Text style={styles.bulkMoq}>MOQ: {item.minOrderQuantity || 20} units</Text>
                </View>

                <Text style={styles.bulkName}>{item.name}</Text>
                <Text style={styles.bulkDesc} numberOfLines={2}>
                  {item.description || "Commercial-grade supplies for enterprises and hospitality businesses."}
                </Text>

                <View style={styles.bulkPricingRow}>
                  <View>
                    <Text style={styles.priceLabel}>Wholesale Unit Rate</Text>
                    <Text style={styles.priceVal}>?{(item.bulkUnitPrice || 350).toLocaleString("en-IN")}</Text>
                  </View>
                  <Button
                title="Request Quote"
                size="sm"
                variant="outline"
                onPress={() => alert(`Quote requested for MOQ ${item.minOrderQuantity || 20} units`)} />
              
                </View>
              </View>
          )}
          </View>
        }
      </ScrollView>
    </SafeAreaView>);

}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white
  },
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.neutral.background
  },
  heroCard: {
    backgroundColor: colors.brand.deep,
    borderRadius: radius.xl,
    padding: 22,
    ...shadows.md
  },
  badge: {
    backgroundColor: colors.premium.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    alignSelf: "flex-start",
    marginBottom: 10
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: "800"
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.neutral.white,
    lineHeight: 28,
    marginBottom: 8
  },
  heroSub: {
    fontSize: 13,
    color: "#EAF7F0",
    lineHeight: 18,
    marginBottom: 18
  },
  ctaRow: {
    flexDirection: "row"
  },
  pillarsGrid: {
    flexDirection: "row",
    gap: 10
  },
  pillar: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: "center"
  },
  pillarIcon: {
    fontSize: 24,
    marginBottom: 6
  },
  pillarTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral.text,
    textAlign: "center",
    marginBottom: 2
  },
  pillarDesc: {
    fontSize: 9,
    color: colors.neutral.muted,
    textAlign: "center"
  },
  sectionHeader: {
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral.text
  },
  catalogList: {
    gap: 12
  },
  bulkCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card
  },
  bulkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  bulkSku: {
    fontSize: 10,
    color: colors.neutral.muted,
    fontFamily: "monospace"
  },
  bulkMoq: {
    fontSize: 11,
    color: colors.premium.gold,
    fontWeight: "700"
  },
  bulkName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral.text,
    marginBottom: 4
  },
  bulkDesc: {
    fontSize: 12,
    color: colors.neutral.secondary,
    lineHeight: 16,
    marginBottom: 14
  },
  bulkPricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
    paddingTop: 10
  },
  priceLabel: {
    fontSize: 10,
    color: colors.neutral.muted
  },
  priceVal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.brand.deep
  }
});