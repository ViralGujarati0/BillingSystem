import { atom } from 'jotai';

/** Billing cart items. Each: { type: 'BARCODE'|'MANUAL', barcode?, name, qty, rate, mrp?, amount } */
export const billingCartItemsAtom = atom([]);

/** Customer name for the bill (default Walk-in). */
export const billingCustomerNameAtom = atom('Walk-in');

/** Payment type: CASH | UPI | CARD */
export const billingPaymentTypeAtom = atom('CASH');

/** After bill is generated: data for BillSuccessScreen and PDF. */
export const billSuccessDataAtom = atom(null);

/** Loading state when generating bill. */
export const billingGenerateLoadingAtom = atom(false);

/** Manual item form (name, qty, rate). */
export const manualItemFormAtom = atom({ name: '', qty: '1', rate: '' });
