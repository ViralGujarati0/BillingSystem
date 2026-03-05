import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';

import {
  purchaseSupplierIdAtom,
  purchasePaymentTypeAtom,
  purchasePaidAmountAtom,
  purchaseItemsAtom,
  purchaseSavingAtom,
  purchaseSuccessDataAtom,
} from '../atoms/purchase';

import { getShop } from '../services/shopService';
import { getSupplier, listSuppliers } from '../services/supplierService';
import { getProductByBarcode } from '../services/productService';
import { createPurchaseInvoice } from '../services/purchaseService';

/* helpers */

const toFloat = (v) => Number.parseFloat(String(v)) || 0;
const toInt = (v) => parseInt(String(v), 10) || 0;
const cleanBarcode = (b) => String(b || '').trim();

/* view model */

const usePurchaseViewModel = () => {
  const owner = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  const [supplierId, setSupplierId] = useAtom(purchaseSupplierIdAtom);
  const [paymentType, setPaymentType] = useAtom(purchasePaymentTypeAtom);
  const [paidAmount, setPaidAmount] = useAtom(purchasePaidAmountAtom);
  const [items, setItems] = useAtom(purchaseItemsAtom);

  const saving = useAtomValue(purchaseSavingAtom);
  const setSaving = useSetAtom(purchaseSavingAtom);
  const setSuccessData = useSetAtom(purchaseSuccessDataAtom);

  /* ───────── LOAD SHOP + SUPPLIERS ───────── */

  const loadShopAndSuppliers = async () => {
    if (!shopId) return { shop: null, suppliers: [] };

    const [shop, suppliers] = await Promise.all([
      getShop(shopId),
      listSuppliers(shopId),
    ]);

    return { shop, suppliers };
  };

  /* ───────── ADD ITEM BY BARCODE ───────── */

  const addItemByBarcode = async ({ barcode, qty, rate }) => {
    const clean = cleanBarcode(barcode);
    const product = await getProductByBarcode(clean);

    const name = product?.name || '';
    const finalBarcode = product?.id || clean;

    const quantity = toInt(qty);
    const price = toFloat(rate);

    const amount = quantity * price;

    setItems((prev) => {
      const idx = prev.findIndex((x) => x.barcode === finalBarcode);

      if (idx >= 0) {
        const existing = prev[idx];
        const newQty = toInt(existing.qty) + quantity;

        const next = [...prev];

        next[idx] = {
          ...existing,
          barcode: finalBarcode,
          name: existing.name || name,
          qty: newQty,
          purchasePrice: price,
          amount: newQty * price,
        };

        return next;
      }

      return [
        ...prev,
        {
          barcode: finalBarcode,
          name,
          qty: quantity,
          purchasePrice: price,
          amount,
        },
      ];
    });
  };

  /* ───────── SAVE PURCHASE ───────── */

  const savePurchase = async ({ navigation }) => {
    if (!owner || owner.role !== 'OWNER' || !shopId) {
      throw new Error('Only owners can create purchases.');
    }

    if (!supplierId) throw new Error('Select supplier');
    if (!items.length) throw new Error('Add at least one item');

    setSaving(true);

    try {
      const paid = toFloat(paidAmount);

      const [supplier, shop] = await Promise.all([
        getSupplier(shopId, supplierId),
        getShop(shopId),
      ]);

      const result = await createPurchaseInvoice({
        supplierId,
        items,
        paidAmount: paid,
      });

      const subtotal = items.reduce(
        (s, it) => s + toFloat(it.amount),
        0
      );

      const dueAmount = Math.max(0, subtotal - paid);

      setSuccessData({
        shopName: shop?.businessName || 'Shop',
        supplierName: supplier?.name || 'Supplier',
        invoiceNo: result?.purchaseNo || '—',
        date: new Date().toLocaleDateString(),

        items: items.map((it) => ({
          name: it.name,
          qty: it.qty,
          purchasePrice: it.purchasePrice,
          amount: it.amount,
        })),

        subtotal,
        paidAmount: paid,
        dueAmount,
      });

      /* reset state */

      setSupplierId('');
      setPaymentType('CASH');
      setPaidAmount('0');
      setItems([]);

      navigation.replace('PurchaseSuccess');

    } finally {
      setSaving(false);
    }
  };

  return {
    owner,
    shopId,

    supplierId,
    setSupplierId,

    paymentType,
    setPaymentType,

    paidAmount,
    setPaidAmount,

    items,
    setItems,

    saving,

    loadShopAndSuppliers,
    addItemByBarcode,
    savePurchase,
  };
};

export default usePurchaseViewModel;