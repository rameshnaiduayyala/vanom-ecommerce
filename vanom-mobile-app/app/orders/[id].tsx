import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { Badge } from "../../src/components/ui/Badge";
import { LoadingState } from "../../src/components/ui/States";
import { ordersApi } from "../../src/services/api/orders.api";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getOrderById(id as string),
    enabled: Boolean(id),
  });

  const order = data?.data;

  if (isLoading) return <LoadingState message="Fetching tracking timeline..." />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusTitle}>Order #{order?.orderNumber || (id as string).slice(0, 8)}</Text>
            <Badge label={order?.status || "CONFIRMED"} variant="success" />
          </View>
          <Text style={styles.statusDate}>
            Placed on {new Date(order?.createdAt || Date.now()).toLocaleDateString("en-IN")}
          </Text>

          {/* Timeline */}
          <View style={styles.timeline}>
            <View style={styles.timelineStep}>
              <View style={[styles.dot, styles.dotActive]} />
              <View>
                <Text style={styles.stepTitle}>Order Placed &amp; Payment Secured</Text>
                <Text style={styles.stepDesc}>Payment verified via Razorpay/Stripe</Text>
              </View>
            </View>
            <View style={styles.timelineStep}>
              <View style={[styles.dot, styles.dotActive]} />
              <View>
                <Text style={styles.stepTitle}>Dispatched from Warehouse</Text>
                <Text style={styles.stepDesc}>Package handed to express courier</Text>
              </View>
            </View>
            <View style={styles.timelineStep}>
              <View style={styles.dot} />
              <View>
                <Text style={styles.stepTitle}>Out for Delivery</Text>
                <Text style={styles.stepDesc}>Expected within 24 hours</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Delivery Address</Text>
          <Text style={styles.addressLine}>
            {order?.shippingAddress?.fullName || "Ramesh Ayyala"}
          </Text>
          <Text style={styles.addressLine}>
            {order?.shippingAddress?.addressLine1 || "Tech Enclave, Madhapur"}
          </Text>
          <Text style={styles.addressLine}>
            {order?.shippingAddress?.city || "Hyderabad"},{" "}
            {order?.shippingAddress?.postalCode || "500081"}
          </Text>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Payment Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount Paid</Text>
            <Text style={styles.val}>?{Number(order?.totalAmount || 1499).toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.val}>UPI / Cards (Prepaid)</Text>
          </View>
        </View>
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
    padding: 16,
    gap: 14,
    backgroundColor: colors.neutral.background,
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral.text,
  },
  statusDate: {
    fontSize: 12,
    color: colors.neutral.muted,
    marginTop: 4,
    marginBottom: 16,
  },
  timeline: {
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
    paddingTop: 16,
    gap: 16,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E4E7EC",
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: colors.brand.primary,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral.text,
  },
  stepDesc: {
    fontSize: 11,
    color: colors.neutral.muted,
    marginTop: 2,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.text,
    marginBottom: 10,
  },
  addressLine: {
    fontSize: 13,
    color: colors.neutral.secondary,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    color: colors.neutral.muted,
  },
  val: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral.text,
  },
});
