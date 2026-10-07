import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet } from


"react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { typography } from "../../theme/typography";













export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case "gold":
        return { backgroundColor: colors.premium.gold };
      case "secondary":
        return { backgroundColor: colors.brand.light };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: colors.brand.primary
        };
      case "primary":
      default:
        return { backgroundColor: colors.brand.primary };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "secondary":
        return colors.brand.deep;
      case "outline":
        return colors.brand.primary;
      case "gold":
        return colors.neutral.white;
      case "primary":
      default:
        return colors.neutral.white;
    }
  };

  const paddingVertical = size === "sm" ? 8 : size === "lg" ? 16 : 12;
  const paddingHorizontal = size === "sm" ? 14 : size === "lg" ? 24 : 18;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
      styles.base,
      getContainerStyle(),
      { paddingVertical, paddingHorizontal },
      (disabled || loading) && styles.disabled,
      style]
      }>
      
      {loading ?
      <ActivityIndicator color={getTextColor()} size="small" /> :

      <>
          {icon}
          <Text
          style={[
          styles.text,
          { color: getTextColor(), marginLeft: icon ? 8 : 0 },
          textStyle]
          }>
          
            {title}
          </Text>
        </>
      }
    </TouchableOpacity>);

};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  text: {
    fontSize: typography.body.fontSize,
    fontWeight: "600"
  },
  disabled: {
    opacity: 0.5
  }
});