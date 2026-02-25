/**
 * Supplier domain model & helpers.
 * This keeps viewmodels/screens decoupled from raw Firestore data shape.
 */

export function supplierFromObject(obj) {
  if (!obj) return null;
  return {
    id: obj.id || '',
    name: obj.name || '',
    phone: obj.phone || '',
    address: obj.address || '',
    gstNumber: obj.gstNumber || '',
    openingBalance: Number(obj.openingBalance) || 0,
    isActive: obj.isActive !== false,
    createdAt: obj.createdAt || null,
  };
}

export function mapSuppliers(list) {
  return (list || []).map((s) => supplierFromObject(s));
}

