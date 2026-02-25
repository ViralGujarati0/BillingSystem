/**
 * Inventory item domain model + helpers.
 */

export function inventoryItemFromObject(obj) {
  if (!obj) return null;
  return {
    id: obj.id || '',
    barcode: obj.barcode || '',
    sellingPrice: Number(obj.sellingPrice) || 0,
    purchasePrice: Number(obj.purchasePrice) || 0,
    stock: Number(obj.stock) || 0,
    expiry: obj.expiry || '',
    supplierId: obj.supplierId || '',
    lastPurchasePrice: Number(obj.lastPurchasePrice) || 0,
    lastPurchaseDate: obj.lastPurchaseDate || null,
    lastUpdated: obj.lastUpdated || null,
  };
}

export function inventoryFormFromItem(item, defaults) {
  if (!item) return defaults;
  return {
    ...defaults,
    sellingPrice: item.sellingPrice ? String(item.sellingPrice) : '',
    purchasePrice: item.purchasePrice ? String(item.purchasePrice) : '',
    stock: item.stock ? String(item.stock) : '',
    expiry: item.expiry || '',
    saving: false,
  };
}

