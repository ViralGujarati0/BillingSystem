import { atom } from 'jotai';

/** Current owner user doc (id, shopId, name, ...). Set from HomeScreen when owner is loaded. */
export const currentOwnerAtom = atom(null);

/** Staff list for current owner's shop (from billing_shops/{shopId}/staff). */
export const staffListAtom = atom([]);

/** Loading state for staff list fetch. */
export const loadingStaffAtom = atom(false);

/** Name field when editing a staff (used in EditStaffScreen). */
export const editingStaffNameAtom = atom('');

/** Saving state when updating a staff (used in EditStaffScreen). */
export const savingStaffAtom = atom(false);
