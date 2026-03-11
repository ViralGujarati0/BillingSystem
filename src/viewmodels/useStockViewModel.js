import { useState, useEffect, useCallback, useRef } from "react";
import { useAtomValue } from "jotai";

import { currentOwnerAtom } from "../atoms/owner";
import { productCacheAtom }  from "../atoms/productCache";

import firestore from "@react-native-firebase/firestore";
import { COLLECTIONS } from "../constants/collections";

const useStockViewModel = () => {

  const owner    = useAtomValue(currentOwnerAtom);
  const products = useAtomValue(productCacheAtom);
  const shopId   = owner?.shopId;

  const [inventory,         setInventory]         = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [refreshing,        setRefreshing]         = useState(false);

  // Keep latest search query so the realtime update respects active filter
  const searchQueryRef = useRef('');

  const mergeWithProducts = useCallback((docs) => {
    return docs.map((item) => {
      const product = products[item.barcode];
      return {
        ...item,
        name: product?.name || 'Unknown Product',
        mrp:  product?.mrp  || 0,
      };
    });
  }, [products]);

  // ── Realtime listener ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!shopId) return;

    const unsubscribe = firestore()
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection(COLLECTIONS.INVENTORY)
      .onSnapshot((snap) => {

        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const merged = mergeWithProducts(docs);

        setInventory(merged);

        // Respect active search filter
        const q = searchQueryRef.current.toLowerCase();
        if (q) {
          setFilteredInventory(
            merged.filter(
              (item) =>
                item.name?.toLowerCase().includes(q) ||
                item.barcode?.includes(searchQueryRef.current)
            )
          );
        } else {
          setFilteredInventory(merged);
        }

      });

    return unsubscribe;

  }, [shopId, mergeWithProducts]);

  // ── Pull-to-refresh (just a visual delay — listener already has latest) ──
  const refreshInventory = async () => {
    setRefreshing(true);
    await new Promise((res) => setTimeout(res, 600));
    setRefreshing(false);
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const searchInventory = useCallback((query) => {
    searchQueryRef.current = query || '';

    if (!query) {
      setFilteredInventory(inventory);
      return;
    }

    const q = query.toLowerCase();
    setFilteredInventory(
      inventory.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.barcode?.includes(query)
      )
    );
  }, [inventory]);

  return {
    inventory,
    filteredInventory,
    refreshing,
    refreshInventory,
    searchInventory,
  };
};

export default useStockViewModel;