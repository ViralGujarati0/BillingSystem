import { useState, useEffect, useCallback } from "react";
import { useAtomValue } from "jotai";

import { currentOwnerAtom } from "../atoms/owner";
import { productCacheAtom } from "../atoms/productCache";

import { listInventory } from "../services/inventoryService";

const useStockViewModel = () => {

const owner = useAtomValue(currentOwnerAtom);
const products = useAtomValue(productCacheAtom);

const shopId = owner?.shopId;

const [inventory, setInventory] = useState([]);
const [filteredInventory, setFilteredInventory] = useState([]);
const [refreshing, setRefreshing] = useState(false);

const loadInventory = useCallback(async () => {


if (!shopId) return;

const data = await listInventory(shopId);

const merged = data.map((item) => {

  const product = products[item.barcode];

  return {
    ...item,
    name: product?.name || "Unknown Product",
    mrp: product?.mrp || 0,
  };

});

setInventory(merged);
setFilteredInventory(merged);


}, [shopId, products]);

useEffect(() => {
loadInventory();
}, [loadInventory]);

const refreshInventory = async () => {

setRefreshing(true);

await loadInventory();

setRefreshing(false);

};

const searchInventory = (query) => {


if (!query) {
  setFilteredInventory(inventory);
  return;
}

const q = query.toLowerCase();

const result = inventory.filter(
  (item) =>
    item.name?.toLowerCase().includes(q) ||
    item.barcode?.includes(query)
);

setFilteredInventory(result);


};

return {


inventory,
filteredInventory,
refreshing,

refreshInventory,
searchInventory,


};

};

export default useStockViewModel;
