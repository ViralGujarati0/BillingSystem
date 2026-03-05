import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

const InventoryItemCard = ({ item, onPress }) => {

const [expanded, setExpanded] = useState(false);

const toggle = () => {
setExpanded(!expanded);
};

return ( <TouchableOpacity style={styles.card} onPress={toggle}>


  <View style={styles.row}>

    <View style={{ flex:1 }}>

      <Text style={styles.name}>
        {item.name}
      </Text>

      <Text style={styles.barcode}>
        {item.barcode}
      </Text>

    </View>

    <Text style={styles.stock}>
      Stock: {item.stock ?? 0}
    </Text>

  </View>

  {expanded && (

    <View style={styles.details}>

      <Text style={styles.detailText}>
        MRP: ₹{item.mrp ?? 0}
      </Text>

      <Text style={styles.detailText}>
        Selling Price: ₹{item.sellingPrice ?? 0}
      </Text>

      <TouchableOpacity
        style={styles.updateBtn}
        onPress={() => onPress?.(item)}
      >
        <Text style={styles.updateText}>
          Update Inventory
        </Text>
      </TouchableOpacity>

    </View>

  )}

</TouchableOpacity>

);

};

const styles = StyleSheet.create({

card:{
backgroundColor:colors.card,
borderRadius:12,
padding:16,
marginBottom:12,
borderWidth:1,
borderColor:colors.borderCard
},

row:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

name:{
fontSize:16,
fontWeight:"600",
color:colors.textPrimary
},

barcode:{
fontSize:12,
color:colors.textSecondary,
marginTop:2
},

stock:{
fontSize:14,
color:colors.primary
},

details:{
marginTop:12,
borderTopWidth:1,
borderTopColor:colors.divider,
paddingTop:10
},

detailText:{
fontSize:14,
marginBottom:6,
color:colors.textPrimary
},

updateBtn:{
marginTop:10,
backgroundColor:colors.primary,
paddingVertical:10,
borderRadius:6,
alignItems:"center"
},

updateText:{
color:colors.textLight,
fontWeight:"600"
}

});

export default InventoryItemCard;
