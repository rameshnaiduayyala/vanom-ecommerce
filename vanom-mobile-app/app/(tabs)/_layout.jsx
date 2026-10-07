import React from "react";
import { Tabs } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";
import { useCartStore } from "../../src/store/cart.store";

export default function TabLayout() {
  const totalCartCount = useCartStore((s) => s.getTotalCount());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.neutral.muted,
        tabBarStyle: {
          backgroundColor: colors.neutral.white,
          borderTopColor: colors.neutral.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600"
        }
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
          <Text style={{ color, fontSize: 20 }}>??</Text>

        }} />
      
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color }) =>
          <Text style={{ color, fontSize: 20 }}>??</Text>

        }} />
      
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) =>
          <View style={styles.cartIconWrapper}>
              <Text style={{ color, fontSize: 20 }}>??</Text>
              {totalCartCount > 0 &&
            <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalCartCount > 99 ? "99+" : totalCartCount}
                  </Text>
                </View>
            }
            </View>

        }} />
      
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) =>
          <Text style={{ color, fontSize: 20 }}>??</Text>

        }} />
      
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) =>
          <Text style={{ color, fontSize: 20 }}>??</Text>

        }} />
      
    </Tabs>);

}

const styles = StyleSheet.create({
  cartIconWrapper: {
    position: "relative",
    width: 28,
    alignItems: "center"
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: colors.brand.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 9,
    fontWeight: "700"
  }
});