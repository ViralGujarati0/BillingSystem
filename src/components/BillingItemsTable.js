import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const BillingItemsTable = ({
  cartItems,
  updateItemQty,
  updateManualItemField,
  removeItem,
}) => {

  const renderRightActions = (index) => (
    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() => removeItem(index)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.colNo}>#</Text>
        <Text style={styles.colName}>Product</Text>
        <Text style={styles.colQty}>Qty</Text>
        <Text style={styles.colMrp}>MRP</Text>
        <Text style={styles.colRate}>Rate</Text>
        <Text style={styles.colAmt}>Amt</Text>
      </View>

      {/* ROWS */}
      {cartItems.map((item, index) => (

        <Swipeable
          key={index}
          renderRightActions={() => renderRightActions(index)}
        >

          <View style={styles.row}>

            <Text style={styles.colNo}>
              {index + 1}
            </Text>

            <Text
              style={styles.colName}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <TextInput
              style={styles.qtyInput}
              value={String(item.qty)}
              keyboardType="number-pad"
              onChangeText={(v) =>
                updateItemQty(index, v)
              }
            />

            {item.type === "MANUAL" ? (
              <TextInput
                style={styles.input}
                value={String(item.mrp)}
                keyboardType="decimal-pad"
                onChangeText={(v) =>
                  updateManualItemField(index, "mrp", v)
                }
              />
            ) : (
              <Text style={styles.colMrp}>
                ₹{item.mrp ?? item.rate}
              </Text>
            )}

            {item.type === "MANUAL" ? (
              <TextInput
                style={styles.input}
                value={String(item.rate)}
                keyboardType="decimal-pad"
                onChangeText={(v) =>
                  updateManualItemField(index, "rate", v)
                }
              />
            ) : (
              <Text style={styles.colRate}>
                ₹{item.rate}
              </Text>
            )}

            <Text style={styles.colAmt}>
              ₹{item.amount}
            </Text>

          </View>

        </Swipeable>

      ))}

    </View>
  );
};

export default BillingItemsTable;

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({

  container: {
    marginTop: 10,
  },

  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 6,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  colNo: {
    width: 25,
    fontSize: 12,
  },

  colName: {
    flex: 1,
    fontSize: 14,
  },

  qtyInput: {
    width: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
    borderRadius: 6,
    paddingVertical: 4,
  },

  input: {
    width: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
    borderRadius: 6,
    paddingVertical: 4,
  },

  colMrp: {
    width: 60,
    textAlign: "right",
    fontSize: 12,
  },

  colRate: {
    width: 60,
    textAlign: "right",
    fontSize: 12,
  },

  colAmt: {
    width: 70,
    textAlign: "right",
    fontWeight: "600",
  },

  deleteBtn: {
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    marginBottom: 10,
    borderRadius: 6,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "600",
  },

});