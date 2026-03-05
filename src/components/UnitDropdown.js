import React from "react";
import { View, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { PRODUCT_UNITS } from "../constants/productUnits";

const UnitDropdown = ({ value, onChange }) => {

  const data = PRODUCT_UNITS.map((u) => ({
    label: u,
    value: u
  }));

  return (
    <View>
      <Dropdown
        style={styles.dropdown}
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Select Unit"
        value={value}
        onChange={(item) => onChange(item.value)}
      />
    </View>
  );
};

export default UnitDropdown;

const styles = StyleSheet.create({

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16
  }

});