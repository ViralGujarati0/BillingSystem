import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useAtom } from "jotai";
import { manualItemFormAtom } from "../atoms/billing";

import useBillingViewModel from "../viewmodels/BillingViewModel";

import ManualItemForm from "../components/ManualItemForm";

const ManualItemScreen = ({ navigation }) => {

  const vm = useBillingViewModel();

  const [form, setForm] = useAtom(manualItemFormAtom);

  const { name, category, unit, qty, mrp, rate } = form;

  /* LIVE AMOUNT */

  const quantity = parseInt(qty, 10) || 0;
  const price = parseFloat(rate) || 0;

  const amount = quantity * price;

  const handleAdd = () => {

    const n = name.trim();
    const c = category;
    const u = unit;

    const q = parseInt(qty, 10);
    const r = parseFloat(rate);
    const m = parseFloat(mrp);

    if (!n) {
      Alert.alert("Error", "Item name required.");
      return;
    }

    if (!c) {
      Alert.alert("Error", "Category required.");
      return;
    }

    if (isNaN(q) || q < 1) {
      Alert.alert("Error", "Valid quantity required.");
      return;
    }

    if (isNaN(r) || r < 0) {
      Alert.alert("Error", "Valid rate required.");
      return;
    }

    try {

      vm.addManualItem({
        name: n,
        category: c,
        unit: u,
        qty: q,
        rate: r,
        mrp: isNaN(m) ? r : m,
      });

      setForm({
        name: "",
        category: "",
        unit: "pcs",
        qty: "1",
        mrp: "",
        rate: "",
      });

      navigation.goBack();

    } catch (e) {

      Alert.alert("Error", e?.message || "Failed to add item.");

    }
  };

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add manual item</Text>

      <ManualItemForm
        name={name}
        category={category}
        unit={unit}
        qty={qty}
        mrp={mrp}
        rate={rate}
        amount={amount}

        onChangeName={(v) => setForm(p => ({ ...p, name: v }))}
        onChangeCategory={(v) => setForm(p => ({ ...p, category: v }))}
        onChangeUnit={(v) => setForm(p => ({ ...p, unit: v }))}
        onChangeQty={(v) => setForm(p => ({ ...p, qty: v }))}
        onChangeMrp={(v) => setForm(p => ({ ...p, mrp: v }))}
        onChangeRate={(v) => setForm(p => ({ ...p, rate: v }))}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAdd}
      >
        <Text style={styles.buttonText}>Add to bill</Text>
      </TouchableOpacity>

    </ScrollView>

  );
};

export default ManualItemScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },

  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },

  backText: {
    color: "#1a73e8",
    fontSize: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#1a73e8",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

});