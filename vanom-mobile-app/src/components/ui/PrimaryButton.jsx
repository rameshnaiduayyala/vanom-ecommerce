import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/theme";







export function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
      styles.button,
      pressed && styles.pressed,
      disabled && styles.disabled]
      }>
      
      <Text style={styles.text}>{title}</Text>
    </Pressable>);

}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl
  },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.5 },
  text: {
    color: colors.neutral.white,
    fontSize: 15,
    fontWeight: "700"
  }
});