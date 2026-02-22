import { atom } from 'jotai';

const defaultInventoryForm = {
  sellingPrice: '',
  purchasePrice: '',
  stock: '',
  expiry: '',
  saving: false,
};

const defaultCreateProductForm = {
  name: '',
  category: '',
  brand: '',
  unit: 'pcs',
  mrp: '',
  gstPercent: '',
  sellingPrice: '',
  purchasePrice: '',
  stock: '',
  expiry: '',
  saving: false,
};

const defaultCreateShopForm = {
  businessName: '',
  phone: '',
  address: '',
  gstNumber: '',
};

const defaultAddStaffForm = {
  name: '',
  email: '',
  password: '',
};

const defaultStaffLoginForm = {
  email: '',
  password: '',
};

/** Inventory form (Add to inventory screen). */
export const inventoryFormAtom = atom({ ...defaultInventoryForm });

/** Create product form. */
export const createProductFormAtom = atom({ ...defaultCreateProductForm });

/** Create shop form. */
export const createShopFormAtom = atom({ ...defaultCreateShopForm });

/** Add staff form. */
export const addStaffFormAtom = atom({ ...defaultAddStaffForm });

/** Staff login form. */
export const staffLoginFormAtom = atom({ ...defaultStaffLoginForm });

/** Barcode scanner: permission request in progress. */
export const barcodeScannerRequestingPermissionAtom = atom(false);

export {
  defaultInventoryForm,
  defaultCreateProductForm,
  defaultCreateShopForm,
  defaultAddStaffForm,
  defaultStaffLoginForm,
};
