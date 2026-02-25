import { atom } from 'jotai';

/** Purchase draft: supplier + invoice meta */
export const purchaseSupplierIdAtom = atom('');
export const purchasePaymentTypeAtom = atom('CASH'); // CASH | UPI | BANK
export const purchasePaidAmountAtom = atom('0');

/** Purchase items: [{ barcode, name, qty, purchasePrice, amount }] */
export const purchaseItemsAtom = atom([]);

/** Last scanned barcode for purchase item entry (scan -> fill add barcode). */
export const purchaseScannedBarcodeAtom = atom('');

/** Loading state for saving purchase */
export const purchaseSavingAtom = atom(false);

/** After purchase saved: data for PurchaseSuccessScreen + PDF */
export const purchaseSuccessDataAtom = atom(null);

