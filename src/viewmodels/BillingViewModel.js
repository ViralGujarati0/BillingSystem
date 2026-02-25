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

    const [product, inventory] = await Promise.all([
      getProductByBarcode(cleanBarcode),
      getInventoryItem(shopId, cleanBarcode),
    ]);

    if (!product) {
      throw new Error('Product not in catalog.');
    }

    if (!inventory) {
      throw new Error('Add this product to your shop inventory first.');
    }

    const stock = Number(inventory.stock) || 0;
    const rate = Number(inventory.sellingPrice ?? product.mrp ?? 0);

    const existingQty =
      cartItems.find(
        (i) => i.type === 'BARCODE' && i.barcode === cleanBarcode
      )?.qty ?? 0;

    if (existingQty + 1 > stock) {
      throw new Error(`Only ${stock} available.`);
    }

    const item = {
      type: 'BARCODE',
      barcode: cleanBarcode,
      name: product.name || 'Item',
      qty: 1,
      rate,
      mrp: product.mrp ?? rate,
      amount: rate,
    };

    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.type === 'BARCODE' && i.barcode === cleanBarcode
      );

      if (existing) {
        const newQty = existing.qty + 1;
        return prev.map((i) =>
          i.barcode === cleanBarcode
            ? { ...i, qty: newQty, amount: newQty * i.rate }
            : i
        );
      }

      return [...prev, item];
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

  const addManualItem = ({ name, qty, rate }) => {
    const n = String(name || '').trim();
    const q = parseInt(String(qty), 10);
    const r = parseFloat(String(rate));

    if (!n) throw new Error('Item name required.');
    if (!q || q < 1) throw new Error('Valid quantity required.');
    if (Number.isNaN(r) || r < 0) throw new Error('Valid rate required.');

    setCartItems((prev) => [
      ...prev,
      {
        type: 'MANUAL',
        name: n,
        qty: q,
        rate: r,
        amount: q * r,
      },
    ]);
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
    loadShopAndSettings,
    generateBill,
    addManualItem,
  };
};

export default useBillingViewModel;