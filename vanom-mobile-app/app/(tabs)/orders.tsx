import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { shadows } from "../../src/theme/shadows";
import { Badge } from "../../src/components/ui/Badge";
import { LoadingState, EmptyState } from "../../src/components/ui/States";
import { Button } from "../../src/components/ui/Button";
import { ordersApi, Order } from "../../src/services/api/orders.api";

const STATUS_FILTERS = ["ALL", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["orders", selectedStatus],
    queryFn: () =>
      ordersApi.getOrders({
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
      }),
  });

  const orders: Order[] = data?.data?.items ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>

        {/* Status Filter Chips */}
        <View style={styles.filterBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATUS_FILTERS}
            keyExtractor={(i) => i}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => {
              const active = selectedStatus === item;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedStatus(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {isLoading ? (
          <LoadingState message="Fetching your orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="??"
            title="No Orders Yet"
            description="You have not placed any orders matching this filter."
            action={
              <Button
                title="Browse Marketplace"
                onPress={() => router.push("/(tabs)/categories")}
              />
            }
          />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(o) => o.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.brand.primary}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/orders/${item.id}`)}
                style={styles.orderCard}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>Order #{item.orderNumber || item.id.slice(0, 8)}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(item.createdAt || Date.now()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Badge
                    label={item.status || "PROCESSING"}
                    variant={item.status === "DELIVERED" ? "success" : "primary"}
                  />
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.itemSummary}>
                    {item.items?.length || 1} Item(s)
                  </Text>
                  <Text style={styles.amount}>
                    Total: ?{Number(item.totalAmount || 0).toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.trackLink}>View Details &amp; Track ?</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
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
  header: {
    padding: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutral.text,
  },
  filterBar: {
    backgroundColor: colors.neutral.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: "#F2F4F7",
  },
  chipActive: {
    backgroundColor: colors.brand.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral.secondary,
  },
  chipTextActive: {
    color: colors.neutral.white,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
    paddingBottom: 10,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.text,
  },
  orderDate: {
    fontSize: 11,
    color: colors.neutral.muted,
    marginTop: 2,
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemSummary: {
    fontSize: 13,
    color: colors.neutral.secondary,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.brand.deep,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
    paddingTop: 10,
    alignItems: "flex-end",
  },
  trackLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand.primary,
  },
});
