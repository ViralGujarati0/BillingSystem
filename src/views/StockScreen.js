import React from "react";
import { View, StyleSheet, RefreshControl } from "react-native";

import AppHeaderLayout from "../components/AppHeaderLayout";
import InventorySearchBar from "../components/InventorySearchBar";
import InventoryStatsCards from "../components/InventoryStatsCards";
import InventoryQuickActions from "../components/InventoryQuickActions";
import InventoryList from "../components/InventoryList";
import InventoryFAB from "../components/InventoryFAB";

import useStockViewModel from "../viewmodels/useStockViewModel";

import { colors } from "../theme/colors";

const StockScreen = ({ navigation }) => {

const {
inventory,
filteredInventory,
refreshing,
refreshInventory,
searchInventory,
} = useStockViewModel();

return (


<AppHeaderLayout title="Inventory">

  <View style={styles.container}>

    <InventorySearchBar
      navigation={navigation}
      onSearch={searchInventory}
    />

    <InventoryStatsCards inventory={inventory} />

    <InventoryQuickActions navigation={navigation} />

    <InventoryList
      inventory={filteredInventory}
      navigation={navigation}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshInventory}
        />
      }
    />

    <InventoryFAB navigation={navigation} />

  </View>

</AppHeaderLayout>


);

};

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:colors.background
}

});

export default StockScreen;
