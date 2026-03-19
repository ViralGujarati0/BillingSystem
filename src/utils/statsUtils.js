// /* ───────── TODAY KEY ───────── */

// export function getTodayKey() {

//   const d = new Date();

//   return (
//     "daily_" +
//     d.getFullYear() +
//     "_" +
//     String(d.getMonth() + 1).padStart(2, "0") +
//     "_" +
//     String(d.getDate()).padStart(2, "0")
//   );

// }

// /* ───────── SUM FIELD ───────── */

// export function sumStats(list, field) {

//   return (list || []).reduce((sum, item) => {
//     return sum + Number(item?.[field] || 0);
//   }, 0);

// }

// /* ───────── WEEK FILTER ───────── */

// export function filterWeekStats(stats) {

//   const now = new Date();

//   return (stats || []).filter((s) => {

//     const d = s.date?.toDate
//       ? s.date.toDate()
//       : new Date(s.date);

//     const diff = now - d;

//     return diff <= 6 * 86400000;

//   });

// }

// /* ───────── FORMAT CURRENCY ───────── */

// export function formatCurrency(n) {

//   if (n >= 100000)
//     return "₹" + (n / 100000).toFixed(1) + "L";

//   if (n >= 1000)
//     return "₹" + (n / 1000).toFixed(1) + "K";

//   return "₹" + Number(n).toFixed(0);

// }

import { COLLECTIONS } from '../constants/collections';

/* ─── IST-aware today key ────────────────────────────────────────────────────
   Matches cloud function statsKey format: daily_YYYY_MM_DD
   offsetDays=0 → today, 1 → yesterday, etc.
────────────────────────────────────────────────────────────────────────────── */
export function getISTStatsKey(offsetDays = 0) {
  const istOffset = 5.5 * 60 * 60000;
  const d  = new Date(Date.now() + istOffset - offsetDays * 86400000);
  const dd   = String(d.getUTCDate()).padStart(2, '0');
  const mm   = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `daily_${yyyy}_${mm}_${dd}`;
}

/* ─── Get array of last N stat doc keys ──────────────────────────────────── */
export function getLastNStatKeys(n) {
  return Array.from({ length: n }, (_, i) => getISTStatsKey(i));
}

/* ─── Period string → days ───────────────────────────────────────────────── */
export function getPeriodDays(period) {
  if (period === '7d')  return 7;
  if (period === '30d') return 30;
  return 1;
}

/* ─── Fetch + sum multiple daily stat docs ───────────────────────────────────
   Returns { totals, daily }
   totals → summed object for stat cards
   daily  → per-day array oldest→newest for bar chart
────────────────────────────────────────────────────────────────────────────── */
export async function fetchStatsByKeys(db, shopId, keys) {
  const snaps = await Promise.all(
    keys.map((k) =>
      db
        .collection(COLLECTIONS.SHOPS)
        .doc(shopId)
        .collection('stats')
        .doc(k)
        .get()
    )
  );

  // oldest → newest for chart
  const daily = [...snaps].reverse().map((s) => {
    const d = (s && s.exists) ? s.data() : {};
    return {
      key:       (s && s.id) ? s.id : '',
      sales:     Number(d.totalSales          || 0),
      profit:    Number(d.totalProfit         || 0),
      purchases: Number(d.totalPurchaseAmount || 0),
    };
  });

  // sum all existing docs into totals
  const totals = snaps
    .filter((s) => s && s.exists)
    .reduce((acc, s) => {
      const d = s.data();
      if (!d) return acc;
      acc.totalSales          = (acc.totalSales          || 0) + Number(d.totalSales          || 0);
      acc.totalProfit         = (acc.totalProfit         || 0) + Number(d.totalProfit         || 0);
      acc.totalBills          = (acc.totalBills          || 0) + Number(d.totalBills          || 0);
      acc.totalItemsSold      = (acc.totalItemsSold      || 0) + Number(d.totalItemsSold      || 0);
      acc.totalPurchaseAmount = (acc.totalPurchaseAmount || 0) + Number(d.totalPurchaseAmount || 0);
      acc.totalDueAmount      = (acc.totalDueAmount      || 0) + Number(d.totalDueAmount      || 0);
      acc.totalPurchases      = (acc.totalPurchases      || 0) + Number(d.totalPurchases      || 0);
      acc.cashSales           = (acc.cashSales           || 0) + Number(d.cashSales           || 0);
      acc.upiSales            = (acc.upiSales            || 0) + Number(d.upiSales            || 0);
      acc.cardSales           = (acc.cardSales           || 0) + Number(d.cardSales           || 0);
      acc.cashBills           = (acc.cashBills           || 0) + Number(d.cashBills           || 0);
      acc.upiBills            = (acc.upiBills            || 0) + Number(d.upiBills            || 0);
      acc.cardBills           = (acc.cardBills           || 0) + Number(d.cardBills           || 0);
      return acc;
    }, {});

  return { totals, daily };
}

/* ─── Keep existing helpers used elsewhere in the app ───────────────────── */
export function getTodayKey() {
  const d = new Date();
  return (
    'daily_' +
    d.getFullYear() + '_' +
    String(d.getMonth() + 1).padStart(2, '0') + '_' +
    String(d.getDate()).padStart(2, '0')
  );
}

export function sumStats(list, field) {
  return (list || []).reduce((sum, item) => sum + Number(item?.[field] || 0), 0);
}

export function filterWeekStats(stats) {
  const now = new Date();
  return (stats || []).filter((s) => {
    const d = s.date?.toDate ? s.date.toDate() : new Date(s.date);
    return (now - d) <= 6 * 86400000;
  });
}

export function formatCurrency(n) {
  const num = Number(n || 0);
  if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
  if (num >= 1000)   return '₹' + (num / 1000).toFixed(1)   + 'K';
  return '₹' + num.toFixed(0);
}