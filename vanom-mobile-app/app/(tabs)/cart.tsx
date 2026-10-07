import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { shadows } from "../../src/theme/shadows";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/States";
import { useCartStore } from "../../src/store/cart.store";

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 1000 || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - appliedDiscount + deliveryFee);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="??"
          title="Your Cart is Empty"
          description="Explore our multi-category marketplace and discover top-tier tech, desk, and daily essentials."
          action={
            <Button
              title="Start Shopping"
              onPress={() => router.push("/(tabs)/categories")}
            />
          }
        />
      </SafeAreaView>
    );
  }

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "VANOM10") {
      setAppliedDiscount(Math.round(subtotal * 0.1));
    } else if (couponCode.trim().toUpperCase() === "VANOMFREE") {
      setAppliedDiscount(50);
    } else {
      alert("Invalid coupon code. Try VANOM10");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.headerTitle}>Shopping Bag ({items.length})</Text>

          {/* Cart Item Cards */}
          {items.map((item) => (
            <View key={item.productId} style={styles.itemCard}>
              <Image
                source={{
                  uri:
                    item.imageUrl ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
                }}
                style={styles.itemImg}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>
                  ?{(item.price * item.quantity).toLocaleString("en-IN")}
                </Text>

                <View style={styles.qtyRow}>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeItem(item.productId)}
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Coupon Box */}
          <View style={styles.couponCard}>
            <Text style={styles.cardTitle}>Offers &amp; Coupons</Text>
            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon (e.g. VANOM10)"
                placeholderTextColor={colors.neutral.muted}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity onPress={applyCoupon} style={styles.applyBtn}>
                <Text style={styles.applyBtnText}>APPLY</Text>
              </TouchableOpacity>
            </View>
            {appliedDiscount > 0 && (
              <Text style={styles.discountSuccess}>
                Coupon Applied! You saved ?{appliedDiscount}
              </Text>
            )}
          </View>

          {/* Price Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.cardTitle}>Bill Summary</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Item Subtotal</Text>
              <Text style={styles.breakdownVal}>?{subtotal.toLocaleString("en-IN")}</Text>
            </View>
            {appliedDiscount > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.status.success }]}>
                  Coupon Savings
                </Text>
                <Text style={[styles.breakdownVal, { color: colors.status.success }]}>
                  -?{appliedDiscount.toLocaleString("en-IN")}
                </Text>
              </View>
            )}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivery Fee</Text>
              <Text style={styles.breakdownVal}>
                {deliveryFee === 0 ? "FREE" : `?${deliveryFee}`}
              </Text>
            </View>
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalVal}>?{grandTotal.toLocaleString("en-IN")}</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Proceed to Checkout */}
        <View style={styles.stickyBar}>
          <View>
            <Text style={styles.footerLabel}>Total Amount</Text>
            <Text style={styles.footerPrice}>?{grandTotal.toLocaleString("en-IN")}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Button
              title="Proceed to Checkout ?"
              variant="primary"
              onPress={() => router.push("/checkout")}
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
  scroll: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutral.text,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
  },
  itemImg: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    backgroundColor: "#F4F5F7",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral.text,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.brand.deep,
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontSize: 16,
    color: colors.neutral.text,
  },
  qtyText: {
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: "700",
  },
  removeBtn: {
    padding: 4,
  },
  removeText: {
    fontSize: 11,
    color: colors.status.error,
    fontWeight: "600",
  },
  couponCard: {
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: radius.lg,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.text,
    marginBottom: 10,
  },
  couponInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  applyBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    color: colors.neutral.white,
    fontWeight: "700",
    fontSize: 12,
  },
  discountSuccess: {
    color: colors.status.success,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  breakdownCard: {
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: radius.lg,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.neutral.muted,
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral.text,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand.deep,
  },
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.md,
  },
  footerLabel: {
    fontSize: 11,
    color: colors.neutral.muted,
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand.deep,
  },
});
