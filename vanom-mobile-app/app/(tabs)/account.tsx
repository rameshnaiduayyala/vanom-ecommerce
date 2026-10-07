import { SafeAreaView } from 'react-native-safe-area-context';
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { shadows } from "../../src/theme/shadows";
import { useAuthStore } from "../../src/store/auth.store";
import { useWishlistStore } from "../../src/store/wishlist.store";

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.wishlistIds.length);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0] || user?.email?.[0] || "V"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Vanom Customer"}
            </Text>
            <Text style={styles.userEmail}>{user?.email || "customer@vanom.com"}</Text>
          </View>
          {!isAuthenticated && (
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              style={styles.signInBtn}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* B2B Switcher Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/bulk")}
          style={styles.b2bBanner}
        >
          <View style={styles.b2bIconWrap}>
            <Text style={{ fontSize: 20 }}>??</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.b2bTitle}>Vanom Business / Bulk Wholesale</Text>
            <Text style={styles.b2bSub}>Exclusive GST tier pricing, bulk pallets &amp; quotes</Text>
          </View>
          <Text style={styles.b2bArrow}>?</Text>
        </TouchableOpacity>

        {/* Action Group 1 */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <Text style={styles.menuIcon}>??</Text>
            <Text style={styles.menuTitle}>My Orders</Text>
            <Text style={styles.menuChevron}>�</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/categories")}
          >
            <Text style={styles.menuIcon}>??</Text>
            <Text style={styles.menuTitle}>Wishlist ({wishlistCount})</Text>
            <Text style={styles.menuChevron}>�</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>??</Text>
            <Text style={styles.menuTitle}>Saved Delivery Addresses</Text>
            <Text style={styles.menuChevron}>�</Text>
          </TouchableOpacity>
        </View>

        {/* Action Group 2: Support & Compliance */}
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>??</Text>
            <Text style={styles.menuTitle}>Customer Support &amp; Help Desk</Text>
            <Text style={styles.menuChevron}>�</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>??</Text>
            <Text style={styles.menuTitle}>Cancellation &amp; Refund Policy</Text>
            <Text style={styles.menuChevron}>�</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>??</Text>
            <Text style={styles.menuTitle}>Privacy &amp; Security</Text>
            <Text style={styles.menuChevron}>�</Text>
          </TouchableOpacity>
        </View>

        {/* Logout or Account Type */}
        {isAuthenticated ? (
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/auth/register")}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>Don&apos;t have an account? Sign up</Text>
          </TouchableOpacity>
        )}

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
    padding: 16,
    gap: 16,
    backgroundColor: colors.neutral.background,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.neutral.white,
    fontSize: 22,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.neutral.muted,
    marginTop: 2,
  },
  signInBtn: {
    backgroundColor: colors.brand.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  signInText: {
    color: colors.brand.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  b2bBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.deep,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
  },
  b2bIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  b2bTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.white,
  },
  b2bSub: {
    fontSize: 11,
    color: "#EAF7F0",
    marginTop: 2,
  },
  b2bArrow: {
    fontSize: 18,
    color: colors.neutral.white,
    fontWeight: "700",
  },
  menuGroup: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral.text,
    fontWeight: "500",
  },
  menuChevron: {
    fontSize: 18,
    color: colors.neutral.muted,
  },
  logoutBtn: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#FEF3F2",
    borderRadius: radius.md,
    marginTop: 8,
  },
  logoutText: {
    color: colors.status.error,
    fontWeight: "700",
    fontSize: 14,
  },
  registerLink: {
    alignItems: "center",
    padding: 12,
  },
  registerText: {
    color: colors.brand.primary,
    fontWeight: "600",
    fontSize: 13,
  },
});
