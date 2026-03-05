import React, { useCallback } from "react";
import { FlatList } from "react-native";
import InventoryItemCard from "./InventoryItemCard";

const InventoryList = ({ inventory, navigation, refreshControl }) => {

const handleUpdate = useCallback(
(item) => {
navigation.navigate("UpdateInventory", { barcode: item.barcode });
},
[navigation]
);

const renderItem = useCallback(
({ item }) => ( <InventoryItemCard
     item={item}
     onPress={handleUpdate}
   />
),
[handleUpdate]
);

return (
<FlatList
data={inventory}
keyExtractor={(item) => item.barcode}
renderItem={renderItem}
refreshControl={refreshControl}


  initialNumToRender={12}
  maxToRenderPerBatch={12}
  windowSize={7}
  removeClippedSubviews
  showsVerticalScrollIndicator={false}
/>


);
};

export default InventoryList;
