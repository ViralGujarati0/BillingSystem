import React, { useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { useAtomValue, useAtom } from "jotai";

import { currentOwnerAtom } from "../atoms/owner";
import {
  createProductFormAtom,
  defaultCreateProductForm,
} from "../atoms/forms";

import { createProduct } from "../services/productService";
import { setInventoryItem } from "../services/inventoryService";

import CategoryDropdown from "../components/CategoryDropdown";
import UnitDropdown from "../components/UnitDropdown";
import FormInputField from "../components/FormInputField";

const CreateProductScreen = ({ navigation, route }) => {

  const { barcode } = route.params || {};

  const owner = useAtomValue(currentOwnerAtom);
  const [form, setForm] = useAtom(createProductFormAtom);

  useEffect(() => {
    setForm({ ...defaultCreateProductForm });
  }, [barcode]);

  const mrpNum = parseFloat(form.mrp) || 0;

  const handleMrpChange = (v) => {
    setForm((prev) => {

      const next = { ...prev, mrp: v };

      if (
        !prev.sellingPrice ||
        prev.sellingPrice === String(parseFloat(prev.mrp) || 0)
      ) {
        next.sellingPrice = v;
      }

      return next;

    });
  };

  const handleSubmit = async () => {

    if (!barcode || !owner?.shopId || !owner?.id) {
      Alert.alert("Error", "Missing barcode or shop.");
      return;
    }

    if (!form.name.trim()) {
      Alert.alert("Error", "Product name is required.");
      return;
    }

    if (!form.category) {
      Alert.alert("Error", "Select category.");
      return;
    }

    const mrpVal = parseFloat(form.mrp) || 0;
    const gstVal = parseFloat(form.gstPercent) || 0;
    const sellVal = parseFloat(form.sellingPrice) || mrpVal;
    const purchaseVal = parseFloat(form.purchasePrice) || 0;
    const stockVal = parseInt(form.stock, 10) || 0;

    setForm((prev) => ({ ...prev, saving: true }));

    try {

      await createProduct({
        barcode,
        name: form.name.trim(),
        category: form.category,
        brand: form.brand.trim(),
        unit: form.unit,
        mrp: mrpVal,
        gstPercent: gstVal,
        createdBy: owner.id,
      });

      await setInventoryItem(owner.shopId, {
        barcode,
        sellingPrice: sellVal,
        purchasePrice: purchaseVal,
        stock: stockVal,
        expiry: (form.expiry || "").trim(),
      });

      Alert.alert("Success", "Product created");

      navigation.goBack();

    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setForm((prev) => ({ ...prev, saving: false }));
    }

  };

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Product</Text>

      <Text style={styles.barcode}>
  Barcode: {barcode || "—"}
</Text>
      <Text style={styles.section}>Product (global)</Text>

      <FormInputField
        label="Name *"
        value={form.name}
        onChangeText={(v) =>
          setForm((prev) => ({ ...prev, name: v }))
        }
        placeholder="Balaji Cream & Onion Wafer"
      />

      <Text style={styles.label}>Category *</Text>

      <CategoryDropdown
        value={form.category}
        onChange={(cat) =>
          setForm((prev) => ({ ...prev, category: cat }))
        }
      />

      <FormInputField
        label="Brand"
        value={form.brand}
        onChangeText={(v) =>
          setForm((prev) => ({ ...prev, brand: v }))
        }
        placeholder="Balaji"
      />

      <Text style={styles.label}>Unit</Text>

      <UnitDropdown
        value={form.unit}
        onChange={(unit) =>
          setForm((prev) => ({ ...prev, unit }))
        }
      />

      <FormInputField
        label="MRP (₹) *"
        value={form.mrp}
        onChangeText={handleMrpChange}
        keyboardType="decimal-pad"
        placeholder="10"
      />

      <FormInputField
        label="GST % *"
        value={form.gstPercent}
        onChangeText={(v) =>
          setForm((prev) => ({ ...prev, gstPercent: v }))
        }
        keyboardType="decimal-pad"
        placeholder="5"
      />

      <Text style={styles.section}>Inventory (this shop)</Text>

      <FormInputField
        label="Selling price (₹)"
        value={form.sellingPrice}
        onChangeText={(v) =>
          setForm((prev) => ({ ...prev, sellingPrice: v }))
        }
        keyboardType="decimal-pad"
        placeholder={String(mrpNum)}
      />

      <FormInputField
        label="Purchase price (₹)"
        value={form.purchasePrice}
        onChangeText={(v) =>
          setForm((prev) => ({ ...prev, purchasePrice: v }))
        }
        keyboardType="decimal-pad"
        placeholder="8"
      />

      <FormInputField
        label="Opening stock"
        value={form.stock}
        onChangeText={(v) =>
          setForm((prev) => ({ ...prev, stock: v }))
        }
        keyboardType="number-pad"
        placeholder="50"
      />

      <FormInputField
        label="Expiry (optional)"
        value={form.expiry}
        onChangeText={(v) =>
          setForm((prev) => ({ ...prev, expiry: v }))
        }
        placeholder="2026-05-01"
      />

      <TouchableOpacity
        style={[
          styles.button,
          form.saving && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={form.saving}
      >
        <Text style={styles.buttonText}>
          {form.saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default CreateProductScreen;

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
    marginBottom: 16,
  },

  backText: {
    color: "#1a73e8",
    fontSize: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },

  barcode: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },

  section: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },

  button: {
    backgroundColor: "#1a73e8",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

});