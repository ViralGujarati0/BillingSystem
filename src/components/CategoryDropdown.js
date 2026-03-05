import React from "react";
import { View, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { PRODUCT_CATEGORIES } from "../constants/productCategories";

const CategoryDropdown = ({ value, onChange }) => {

  const data = PRODUCT_CATEGORIES.map((c) => ({
    label: c,
    value: c
  }));

  return (
    <View>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Select Category"
        value={value}
        onChange={(item) => onChange(item.value)}
      />
    </View>
  );
};

export default CategoryDropdown;

const styles = StyleSheet.create({

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16
  },

  placeholder: {
    color: "#999"
  },

  selectedText: {
    fontSize: 14
  }

});