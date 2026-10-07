import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/auth.store";
import { colors } from "../src/theme/colors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 mins
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.neutral.white },
          headerTintColor: colors.brand.deep,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.neutral.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{
            title: "Product Details",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="checkout/index"
          options={{
            title: "Checkout",
            headerBackTitle: "Cart",
          }}
        />
        <Stack.Screen
          name="checkout/success"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="orders/[id]"
          options={{
            title: "Order Details",
            headerBackTitle: "Orders",
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            title: "Sign In",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            title: "Create Account",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="bulk/index"
          options={{
            title: "Vanom Bulk Business",
            headerStyle: { backgroundColor: colors.brand.deep },
            headerTintColor: colors.neutral.white,
          }}
        />
        <Stack.Screen
          name="bulk/register"
          options={{
            title: "Business Registration",
            headerStyle: { backgroundColor: colors.brand.deep },
            headerTintColor: colors.neutral.white,
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
