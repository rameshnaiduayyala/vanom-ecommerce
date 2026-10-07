import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";









export const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search products, brands and more",
  onFilterPress
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>??</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral.muted}
        returnKeyType="search" />
      
      {value.length > 0 &&
      <TouchableOpacity onPress={() => onChangeText("")} style={styles.clearBtn}>
          <Text style={styles.clearText}>?</Text>
        </TouchableOpacity>
      }
      {onFilterPress &&
      <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
          <Text style={styles.filterIcon}>??</Text>
        </TouchableOpacity>
      }
    </View>);

};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral.border
  },
  icon: {
    fontSize: 16,
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral.text,
    paddingVertical: 8
  },
  clearBtn: {
    padding: 4
  },
  clearText: {
    color: colors.neutral.muted,
    fontSize: 12
  },
  filterBtn: {
    marginLeft: 8,
    padding: 4
  },
  filterIcon: {
    fontSize: 16
  }
});