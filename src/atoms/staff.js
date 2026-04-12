import { atom } from 'jotai';

/** Logged-in staff user document. Set by AppNavigator after staff login. */
export const currentStaffAtom = atom(null);

/** Home dashboard widgets (owner HomeScreen) — staff sees each block when true. */
export const DEFAULT_HOME_PERMISSIONS = {
  overviewStats:    false,
  revenueChart:     false,
  paymentSplit:     false,
  topProducts:      false,
  comparison:       false,
  lowStock:         false,
  pendingPurchases: false,
  recentBillsCard:  false,
  dailyReportFab:   false,
};

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
  home: { ...DEFAULT_HOME_PERMISSIONS },
};