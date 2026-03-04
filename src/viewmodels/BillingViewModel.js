import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  billingCartItemsAtom,
  billingCustomerNameAtom,
  billingPaymentTypeAtom,
  billSuccessDataAtom,
  billingGenerateLoadingAtom,
} from '../atoms/billing';

import {
  getProductByBarcode,
  getInventoryItem,
  getShop,
  getShopSettings,
} from '../services/firestore';

import { createBill } from '../services/createBill';
import { createBillSuccessModel } from '../models/BillModel';

const useBillingViewModel = () => {
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
  
    console.log('🔵 SCAN START', {
      inputBarcode: barcode,
      cleanBarcode,
      shopId,
    });
  
    const [product, inventory] = await Promise.all([
      getProductByBarcode(cleanBarcode),
      getInventoryItem(shopId, cleanBarcode),
    ]);
  
    console.log('🟡 FIRESTORE RESULT', {
      productFound: !!product,
      inventoryFound: !!inventory,
      product,
      inventory,
    });
  
    // if (!product) {
    //   console.log('🔴 ERROR: Product not in catalog');
    //   throw new Error('Product not in catalog.');
    // }

    if (!product) {
      console.log('⚠️ Ignored unknown barcode:', cleanBarcode);
      return; // silently ignore
    }
  
    // if (!inventory) {
    //   console.log('🔴 ERROR: Not in inventory');
    //   throw new Error('Add this product to your shop inventory first.');
    // }

    if (!inventory) {
      console.log('⚠️ Not in inventory:', cleanBarcode);
      return;
    }
  
    const stock = Number(inventory.stock) || 0;
    const rate = Number(inventory.sellingPrice ?? product.mrp ?? 0);
  
    console.log('🟢 STOCK CHECK', {
      stock,
      rate,
    });
  
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.type === 'BARCODE' && i.barcode === cleanBarcode
      );
  
      if (existing) {
        const newQty = existing.qty + 1;
  
        console.log('🟢 INCREMENTING', {
          barcode: cleanBarcode,
          newQty,
        });
  
        return prev.map((i) =>
          i.barcode === cleanBarcode
            ? { ...i, qty: newQty, amount: newQty * i.rate }
            : i
        );
      }
  
      console.log('🟢 ADDING NEW ITEM', cleanBarcode);
  
      return [
        {
          type: 'BARCODE',
          barcode: cleanBarcode,
          name: product.name || 'Item',
          qty: 1,
          rate,
          mrp: product.mrp ?? rate,
          amount: rate,
        },
        ...prev,
      ];
    });
  };

  /* ───────── UPDATE ITEM QTY ───────── */

  const updateItemQty = (index, newQty) => {
    setCartItems((prev) => {
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
        amount: qty * it.rate,
      };

      return next;
    });
  };

  /* ───────── UPDATE MANUAL ITEM FIELD ───────── */

const updateManualItemField = (index, field, value) => {

  setCartItems((prev) => {

    const next = [...prev];
    const item = next[index];

    if (!item || item.type !== "MANUAL") return prev;

    const num = parseFloat(value);

    if (Number.isNaN(num)) return prev;

    next[index] = {
      ...item,
      [field]: num,
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
      getShopSettings(shopId),
    ]);

    return { shop, settings };
  };

  /* ───────── GENERATE BILL ───────── */

  const generateBill = async ({ userDoc, shop, settings }) => {
    if (!cartItems.length) {
      throw new Error('Add at least one item.');
    }

    const payload = {
      items: cartItems.map((i) =>
        i.type === 'MANUAL'
          ? {
              type: 'MANUAL',
              name: i.name,
              qty: i.qty,
              rate: i.rate,
            }
          : {
              type: 'BARCODE',
              barcode: String(i.barcode).trim(),
              qty: i.qty,
            }
      ),
      paymentType,
      customerName: customerName.trim() || 'Walk-in',
    };

    const result = await createBill(payload);

    const model = createBillSuccessModel({
      shop,
      settings,
      customerName,
      billNo: result?.billNo,
      paymentType,
      cartItems,
    });

    setBillSuccessData(model);
    setCartItems([]);
    setCustomerName('Walk-in');
    setPaymentType('CASH');

    return { success: true };
  };

  /* ───────── ADD MANUAL ITEM ───────── */

  const addManualItem = ({ name, qty, rate, mrp }) => {
    const n = String(name || '').trim();
    const q = parseInt(String(qty), 10);
    const r = parseFloat(String(rate));
    const m = parseFloat(String(mrp));
  
    if (!n) throw new Error('Item name required.');
    if (!q || q < 1) throw new Error('Valid quantity required.');
    if (Number.isNaN(r) || r < 0) throw new Error('Valid rate required.');
  
    const finalMrp = Number.isNaN(m) ? r : m;
  
    setCartItems((prev) => [
      ...prev,
      {
        type: 'MANUAL',
        name: n,
        qty: q,
        mrp: finalMrp,   // ✅ store mrp
        rate: r,
        amount: q * r,
      },
    ]);
  };


  const removeItem = (index) => {
    setCartItems((prev) => {
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
    removeItem,
  };
};

export default useBillingViewModel;