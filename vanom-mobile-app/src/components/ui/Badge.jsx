import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";






export const Badge = ({ label, variant = "primary" }) => {
  const getStyles = () => {
    switch (variant) {
      case "gold":
        return { bg: colors.premium.soft, text: colors.premium.gold };
      case "success":
        return { bg: "#ECFDF3", text: colors.status.success };
      case "error":
        return { bg: "#FEF3F2", text: colors.status.error };
      case "neutral":
        return { bg: "#F2F4F7", text: colors.neutral.secondary };
      case "primary":
      default:
        return { bg: colors.brand.light, text: colors.brand.primary };
    }
  };

  const { bg, text } = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>);

};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    alignSelf: "flex-start"
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5
  }
});