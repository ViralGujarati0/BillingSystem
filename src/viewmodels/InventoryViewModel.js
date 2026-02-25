import { useAtom, useAtomValue } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';
import { inventoryFormAtom, defaultInventoryForm } from '../atoms/forms';
import { getProductByBarcode, getInventoryItem, setInventoryItem, deleteInventoryItem } from '../services/firestore';
import { inventoryItemFromObject } from '../models/InventoryItemModel';

const useInventoryViewModel = () => {
  const owner = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;
  const [form, setForm] = useAtom(inventoryFormAtom);

  const initAddForm = ({ mrp }) => {
    setForm({
      ...defaultInventoryForm,
      sellingPrice: mrp ? String(mrp) : '',
    });
  };

  const saveNewInventory = async ({ barcode }) => {
    if (!shopId || !barcode) {
      throw new Error('Missing shop or barcode.');
    }
    const sell = parseFloat(form.sellingPrice);
    const purchase = parseFloat(form.purchasePrice);
    const stockNum = parseInt(form.stock, 10);
    if (Number.isNaN(sell) || sell < 0) {
      throw new Error('Enter a valid selling price.');
    }
    if (Number.isNaN(purchase) || purchase < 0) {
      throw new Error('Enter a valid purchase price.');
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      throw new Error('Enter a valid opening stock.');
    }
    setForm((prev) => ({ ...prev, saving: true }));
    try {
      await setInventoryItem(shopId, {
        barcode,
        sellingPrice: sell,
        purchasePrice: purchase,
        stock: stockNum,
        expiry: (form.expiry || '').trim(),
      });
    } finally {
      setForm((prev) => ({ ...prev, saving: false }));
    }
  };

  const loadInventoryForBarcode = async ({ barcode }) => {
    if (!shopId || !barcode) throw new Error('Missing shop or barcode.');
    const [product, inventory] = await Promise.all([
      getProductByBarcode(barcode),
      getInventoryItem(shopId, barcode),
    ]);
    return { product, inventory: inventoryItemFromObject(inventory) };
  };

  const saveInventoryUpdate = async ({ inventory, sellingPrice, purchasePrice, stock, expiry }) => {
    if (!shopId || !inventory?.barcode) {
      throw new Error('Missing shop or inventory item.');
    }
    const sell = Number.parseFloat(String(sellingPrice));
    const purchase = Number.parseFloat(String(purchasePrice));
    const stockNum = Number.parseInt(String(stock), 10);
    if (!Number.isFinite(sell) || sell < 0) {
      throw new Error('Enter a valid selling price (0 or more).');
    }
    if (!Number.isFinite(purchase) || purchase < 0) {
      throw new Error('Enter a valid purchase price (0 or more).');
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      throw new Error('Enter a valid stock quantity (0 or more).');
    }
    await setInventoryItem(shopId, {
      barcode: inventory.barcode,
      sellingPrice: sell,
      purchasePrice: purchase,
      stock: stockNum,
      expiry: (expiry || '').trim(),
    });
  };

  const deleteInventory = async ({ barcode }) => {
    if (!shopId || !barcode) throw new Error('Missing shop or barcode.');
    await deleteInventoryItem(shopId, barcode);
  };

  return {
    owner,
    shopId,
    form,
    setForm,
    initAddForm,
    saveNewInventory,
    loadInventoryForBarcode,
    saveInventoryUpdate,
    deleteInventory,
  };
};

export default useInventoryViewModel;

