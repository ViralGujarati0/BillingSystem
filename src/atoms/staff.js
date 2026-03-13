import { atom } from 'jotai';

/** Logged-in staff user document. Set by AppNavigator after staff login. */
export const currentStaffAtom = atom(null);

/** Default permissions shape — all false. Used in AddStaffScreen form. */
export const DEFAULT_STAFF_PERMISSIONS = {
  billing: false,
  sales: {
    summaryStrip: false,
    calendar:     false,
    recentBills:  false,
  },
  stock: {
    searchBar:      false,
    statsCards:     false,
    stockHealth:    false,
    categoryFilter: false,
    quickActions:   false,
    inventoryList:  false,
  },
};