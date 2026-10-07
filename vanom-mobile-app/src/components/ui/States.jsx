import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const LoadingState = ({
  message = "Loading products..."
}) => {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.brand.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>);

};

export const EmptyState =




({ title, description, icon = "??", action }) => {
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.actionWrap}>{action}</View>}
    </View>);

};

export const ErrorState =


({ error = "Something went wrong", onRetry }) => {
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>??</Text>
      <Text style={styles.title}>Unable to Load</Text>
      <Text style={styles.description}>{error}</Text>
      {onRetry &&
      <View style={styles.actionWrap}>
          <Text onPress={onRetry} style={styles.retryText}>
            Tap to retry
          </Text>
        </View>
      }
    </View>);

};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32
  },
  text: {
    marginTop: 12,
    color: colors.neutral.secondary,
    fontSize: 14
  },
  icon: {
    fontSize: 44,
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.text,
    textAlign: "center",
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    color: colors.neutral.muted,
    textAlign: "center",
    lineHeight: 20
  },
  actionWrap: {
    marginTop: 20
  },
  retryText: {
    color: colors.brand.primary,
    fontWeight: "600",
    fontSize: 14
  }
});