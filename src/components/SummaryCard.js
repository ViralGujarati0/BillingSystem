import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SummaryCard = ({ label, value, count, topColor }) => {

  return (
    <View style={[styles.card, { borderTopColor: topColor }]}>

      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.count}>
        {count} bills
      </Text>

    </View>
  );
};

export default SummaryCard;

const styles = StyleSheet.create({

  card:{
    flex:1,
    backgroundColor:"#fff",
    borderRadius:12,
    padding:10,
    borderWidth:1,
    borderColor:"#eee",
    borderTopWidth:3
  },

  label:{
    fontSize:10,
    fontWeight:"700",
    color:"#777",
    marginBottom:4
  },

  value:{
    fontSize:16,
    fontWeight:"700"
  },

  count:{
    fontSize:11,
    color:"#666"
  }

});