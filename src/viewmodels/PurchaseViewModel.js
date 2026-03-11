import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';
import { productCacheAtom } from '../atoms/productCache';

import {
  purchaseSupplierIdAtom,
  purchasePaymentTypeAtom,
  purchasePaidAmountAtom,
  purchaseItemsAtom,
  purchaseSavingAtom,
  purchaseSuccessDataAtom,
} from '../atoms/purchase';

import { getShop }       from '../services/shopService';
import { getSupplier, listSuppliers } from '../services/supplierService';

// ✅ correct import — was createPurchaseCF which didn't exist
import { createPurchaseInvoice } from '../services/purchaseService';

const usePurchaseViewModel = () => {

  const owner    = useAtomValue(currentOwnerAtom);
  const products = useAtomValue(productCacheAtom);
  const shopId   = owner?.shopId;

  const [supplierId,  setSupplierId]  = useAtom(purchaseSupplierIdAtom);
  const [paymentType, setPaymentType] = useAtom(purchasePaymentTypeAtom);
  const [paidAmount,  setPaidAmount]  = useAtom(purchasePaidAmountAtom);
  const [items,       setItems]       = useAtom(purchaseItemsAtom);

  const saving        = useAtomValue(purchaseSavingAtom);
  const setSaving     = useSetAtom(purchaseSavingAtom);
  const setSuccessData = useSetAtom(purchaseSuccessDataAtom);

  // ── Load shop + suppliers ─────────────────────────────────────────────────
  const loadShopAndSuppliers = async () => {
    if (!shopId || !owner) return { shop: null, suppliers: [] };

    const [shop, suppliers] = await Promise.all([
      getShop(shopId),
      listSuppliers(shopId),
    ]);

    return { shop, suppliers };
  };

  // ── Add item by barcode ───────────────────────────────────────────────────
  const addItemByBarcode = async ({ barcode, qty, rate }) => {
    const prod         = products[barcode];
    const name         = prod?.name || '';
    const finalBarcode = barcode;
    const amount       = qty * rate;

    setItems((prev) => {
      const idx = prev.findIndex((x) => x.barcode === finalBarcode);

      if (idx >= 0) {
        const existing = prev[idx];
        const newQty   = (Number(existing.qty) || 0) + qty;
        const next     = [...prev];
        next[idx] = {
          ...existing,
          barcode: finalBarcode,
          name: existing.name || name,
          qty: newQty,
          purchasePrice: rate,
          amount: newQty * rate,
        };
        return next;
      }

      return [...prev, { barcode: finalBarcode, name, qty, purchasePrice: rate, amount }];
    });
  };

  // ── Save purchase ─────────────────────────────────────────────────────────
  const savePurchase = async ({ navigation }) => {
    if (!owner || owner.role !== 'OWNER' || !shopId) {
      throw new Error('Only owners can create purchases.');
    }

    if (!supplierId)    throw new Error('Select a supplier');
    if (!items.length)  throw new Error('Add at least one item');

    setSaving(true);

    try {
      const paid = parseFloat(String(paidAmount)) || 0;

      // fetch shop + supplier in parallel
      const [shop, supplier] = await Promise.all([
        getShop(shopId),
        getSupplier(shopId, supplierId),
      ]);
      
      console.log('createPurchaseInvoice type:', typeof createPurchaseInvoice);
console.log('createPurchaseInvoice value:', createPurchaseInvoice);

      // call cloud function
      const result = await createPurchaseInvoice({
        supplierId,
        items,
        paidAmount: paid,
      });

      const subtotal  = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
      const dueAmount = Math.max(0, subtotal - paid);

      setSuccessData({
        shopName:     shop?.businessName || 'Shop',
        supplierName: supplier?.name     || 'Supplier',
        invoiceNo:    result?.purchaseNo || '—',
        date:         new Date().toLocaleDateString('en-IN'),
        items: items.map((it) => ({
          name:          it.name,
          qty:           it.qty,
          purchasePrice: it.purchasePrice,
          amount:        it.amount,
        })),
        subtotal,
        paidAmount: paid,
        dueAmount,
      });

      // reset atoms
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
    supplierId,  setSupplierId,
    paymentType, setPaymentType,
    paidAmount,  setPaidAmount,
    items,       setItems,
    saving,
    loadShopAndSuppliers,
    addItemByBarcode,
    savePurchase,
  };
};

export default usePurchaseViewModel;