import React from "react";
import { View, Text } from "react-native";

import FormInputField from "./FormInputField";
import CategoryDropdown from "./CategoryDropdown";
import UnitDropdown from "./UnitDropdown";

const ManualItemForm = ({
  name,
  category,
  unit,
  qty,
  mrp,
  rate,
  amount,

  onChangeName,
  onChangeCategory,
  onChangeUnit,
  onChangeQty,
  onChangeMrp,
  onChangeRate,
}) => {

  return (

    <View>

      <FormInputField
        label="Item Name"
        value={name}
        onChangeText={onChangeName}
      />

      <Text>Category</Text>

      <CategoryDropdown
        value={category}
        onChange={onChangeCategory}
      />

      <Text>Unit</Text>

      <UnitDropdown
        value={unit}
        onChange={onChangeUnit}
      />

      <FormInputField
        label="Quantity"
        value={qty}
        keyboardType="number-pad"
        onChangeText={onChangeQty}
      />

      <FormInputField
        label="MRP"
        value={mrp}
        keyboardType="decimal-pad"
        onChangeText={onChangeMrp}
      />

      <FormInputField
        label="Rate"
        value={rate}
        keyboardType="decimal-pad"
        onChangeText={onChangeRate}
      />

      <FormInputField
        label="Amount"
        value={String(amount)}
        editable={false}
      />

    </View>

  );
};

export default ManualItemForm;