/* ───────── TODAY KEY ───────── */

export function getTodayKey() {

  const d = new Date();

  return (
    "daily_" +
    d.getFullYear() +
    "_" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "_" +
    String(d.getDate()).padStart(2, "0")
  );

}

/* ───────── SUM FIELD ───────── */

export function sumStats(list, field) {

  return (list || []).reduce((sum, item) => {
    return sum + Number(item?.[field] || 0);
  }, 0);

}

/* ───────── WEEK FILTER ───────── */

export function filterWeekStats(stats) {

  const now = new Date();

  return (stats || []).filter((s) => {

    const d = s.date?.toDate
      ? s.date.toDate()
      : new Date(s.date);

    const diff = now - d;

    return diff <= 6 * 86400000;

  });

}

/* ───────── FORMAT CURRENCY ───────── */

export function formatCurrency(n) {

  if (n >= 100000)
    return "₹" + (n / 100000).toFixed(1) + "L";

  if (n >= 1000)
    return "₹" + (n / 1000).toFixed(1) + "K";

  return "₹" + Number(n).toFixed(0);

}