import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ReceiptInfo = ({ data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.line}>Customer: {data.customerName}</Text>
      <Text style={styles.line}>Bill No: {data.billNo}</Text>
      <Text style={styles.line}>Date: {data.date}</Text>
      <Text style={styles.line}>Payment: {data.paymentType}</Text>
    </View>
  );
};

export default ReceiptInfo;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },

  line: {
    fontSize: 13,
    marginBottom: 4,
  },
});