import { SafeAreaView } from 'react-native-safe-area-context';
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { Button } from "../../src/components/ui/Button";

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId, amount } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Text style={styles.checkIcon}>?</Text>
        </View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Thank you for shopping with Vanom. Your items are being packed with care.
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.val}>{orderId || "VNM-92841"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount Paid</Text>
            <Text style={styles.val}>?{Number(amount || 0).toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Delivery</Text>
            <Text style={styles.val}>Within 2-3 Business Days</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={[styles.val, { color: colors.status.success }]}>Verified &amp; Secured</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="View My Orders"
            variant="primary"
            onPress={() => router.replace("/(tabs)/orders")} />
          
          <View style={{ height: 10 }} />
          <Button
            title="Continue Shopping"
            variant="outline"
            onPress={() => router.replace("/(tabs)")} />
          
        </View>
      </View>
    </SafeAreaView>);

}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.light,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  checkIcon: {
    fontSize: 40,
    color: colors.brand.primary,
    fontWeight: "800"
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.brand.deep,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28
  },
  detailsCard: {
    width: "100%",
    backgroundColor: colors.neutral.background,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 28,
    gap: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  label: {
    fontSize: 13,
    color: colors.neutral.muted
  },
  val: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral.text
  },
  actions: {
    width: "100%"
  }
});