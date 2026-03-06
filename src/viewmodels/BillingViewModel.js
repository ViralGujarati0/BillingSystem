import { useAtom, useAtomValue, useSetAtom } from "jotai";

import {
  billingCartItemsAtom,
  billingCustomerNameAtom,
  billingPaymentTypeAtom,
  billSuccessDataAtom,
  billingGenerateLoadingAtom
} from "../atoms/billing";

import { productCacheAtom } from "../atoms/productCache";

import {
  getInventoryItem
} from "../services/inventoryService";

import {
  getShop,
  getShopSettings
} from "../services/shopService";

import { createBill } from "../services/billingService";

import { createBillSuccessModel } from "../models/BillModel";

const useBillingViewModel = () => {

  const products = useAtomValue(productCacheAtom);

  const [cartItems, setCartItems] = useAtom(billingCartItemsAtom);
  const [customerName, setCustomerName] = useAtom(billingCustomerNameAtom);
  const [paymentType, setPaymentType] = useAtom(billingPaymentTypeAtom);

  const setBillSuccessData = useSetAtom(billSuccessDataAtom);

  const loading = useAtomValue(billingGenerateLoadingAtom);
  const setLoading = useSetAtom(billingGenerateLoadingAtom);

  /* ───────── ADD SCANNED BARCODE ───────── */

  const addScannedBarcode = async ({ shopId, barcode }) => {

    if (!shopId || !barcode) return;

    const cleanBarcode = String(barcode).trim();

    const product = products[cleanBarcode];

    const inventory = await getInventoryItem(shopId, cleanBarcode);

    if (!product) {
      console.log("Unknown barcode:", cleanBarcode);
      return;
    }

    if (!inventory) {
      console.log("Not in inventory:", cleanBarcode);
      return;
    }

    const rate = Number(inventory.sellingPrice ?? product.mrp ?? 0);

    setCartItems(prev => {

      const existing = prev.find(
        i => i.type === "BARCODE" && i.barcode === cleanBarcode
      );

      if (existing) {

        const newQty = existing.qty + 1;

        return prev.map(i =>
          i.barcode === cleanBarcode
            ? {
                ...i,
                qty: newQty,
                amount: newQty * i.rate
              }
            : i
        );

      }

      return [
        {
          type: "BARCODE",
          barcode: cleanBarcode,
          name: product.name || "Item",
          category: product.category || "",
          unit: product.unit || "pcs",
          qty: 1,
          rate,
          mrp: product.mrp ?? rate,
          amount: rate
        },
        ...prev
      ];

    });

  };

  /* ───────── UPDATE ITEM QTY ───────── */

  const updateItemQty = (index, newQty) => {

    setCartItems(prev => {

      const next = [...prev];

      const it = next[index];

      if (!it) return prev;

      const qty = Math.max(0, parseInt(String(newQty), 10) || 0);

      if (qty === 0) {
        next.splice(index, 1);
        return next;
      }

      next[index] = {
        ...it,
        qty,
        amount: qty * it.rate
      };

      return next;

    });

  };

  /* ───────── UPDATE MANUAL ITEM FIELD ───────── */

  const updateManualItemField = (index, field, value) => {

    setCartItems(prev => {

      const next = [...prev];

      const item = next[index];

      if (!item || item.type !== "MANUAL") return prev;

      const num = parseFloat(value);

      next[index] = {
        ...item,
        [field]: field === "name" || field === "category" || field === "unit"
          ? value
          : num
      };

      const qty = next[index].qty || 0;
      const rate = next[index].rate || 0;

      next[index].amount = qty * rate;

      return next;

    });

  };

  /* ───────── LOAD SHOP + SETTINGS ───────── */

  const loadShopAndSettings = async (shopId) => {

    if (!shopId) return { shop: null, settings: null };

    const [shop, settings] = await Promise.all([
      getShop(shopId),
      getShopSettings(shopId)
    ]);

    return { shop, settings };

  };

  /* ───────── GENERATE BILL ───────── */

  const generateBill = async ({ userDoc, shop, settings }) => {

    if (!cartItems.length) {
      throw new Error("Add at least one item.");
    }

    const payload = {

      items: cartItems.map(i =>

        i.type === "MANUAL"
          ? {
              type: "MANUAL",
              name: i.name,
              category: i.category || "",
              unit: i.unit || "pcs",
              qty: i.qty,
              rate: i.rate
            }
          : {
              type: "BARCODE",
              barcode: String(i.barcode).trim(),
              qty: i.qty
            }

      ),

      paymentType,
      customerName: customerName.trim() || "Walk-in"

    };
    console.log("CART ITEMS:", cartItems);
    console.log("PAYLOAD ITEMS:", payload.items);
    const result = await createBill(payload);

    const model = createBillSuccessModel({
      shop,
      settings,
      customerName,
      billNo: result?.billNo,
      paymentType,
      cartItems
    });

    setBillSuccessData(model);

    setCartItems([]);
    setCustomerName("Walk-in");
    setPaymentType("CASH");

    return { success: true };

  };

  /* ───────── ADD MANUAL ITEM ───────── */

  const addManualItem = ({ name, category, unit, qty, rate, mrp }) => {

    const n = String(name || "").trim();
    const c = String(category || "").trim();
    const u = String(unit || "pcs").trim();
  
    const q = parseInt(String(qty), 10);
    const r = parseFloat(String(rate));
    const m = parseFloat(String(mrp));
  
    if (!n) throw new Error("Item name required.");
    if (!c) throw new Error("Category required.");
    if (!q || q < 1) throw new Error("Valid quantity required.");
    if (Number.isNaN(r) || r < 0) throw new Error("Valid rate required.");
  
    const finalMrp = Number.isNaN(m) ? r : m;
  
    setCartItems((prev) => [
      ...prev,
      {
        type: "MANUAL",
        name: n,
        category: c,
        unit: u,
        qty: q,
        rate: r,
        mrp: finalMrp,   // ✅ ADD THIS
        amount: q * r,
      },
    ]);
  };

  /* ───────── REMOVE ITEM ───────── */

  const removeItem = (index) => {

    setCartItems(prev => {

      const next = [...prev];
      next.splice(index, 1);
      return next;

    });

  };

  return {

    cartItems,

    customerName,
    setCustomerName,

    paymentType,
    setPaymentType,

    loading,

    addScannedBarcode,
    updateItemQty,
    updateManualItemField,

    loadShopAndSettings,
    generateBill,

    addManualItem,
    removeItem

  };

};

export default useBillingViewModel;