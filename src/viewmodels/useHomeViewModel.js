import { useState, useEffect, useCallback } from 'react';
import { useAtomValue, useSetAtom }          from 'jotai';
import firestore                             from '@react-native-firebase/firestore';

import { currentOwnerAtom } from '../atoms/owner';
import { productCacheAtom } from '../atoms/productCache';
import { COLLECTIONS }      from '../constants/collections';
import {
  getISTStatsKey,
  getLastNStatKeys,
  fetchStatsByKeys,
  getPeriodDays,
} from '../utils/statsUtils';

const db = firestore();

const useHomeViewModel = ({ userDoc } = {}) => {

  const setCurrentOwner = useSetAtom(currentOwnerAtom);
  const owner           = useAtomValue(currentOwnerAtom);
  const products        = useAtomValue(productCacheAtom);
  const shopId          = userDoc?.shopId || owner?.shopId;

  // ── Per-card period state ─────────────────────────────────────────────────
  const [revenuePeriod,     setRevenuePeriod]     = useState('today');
  const [profitPeriod,      setProfitPeriod]      = useState('today');
  const [billsPeriod,       setBillsPeriod]       = useState('today');
  const [itemsPeriod,       setItemsPeriod]       = useState('today');
  const [avgBillPeriod,     setAvgBillPeriod]     = useState('today');
  const [purchasePeriod,    setPurchasePeriod]    = useState('today');
  const [chartPeriod,       setChartPeriod]       = useState('7d');
  const [paymentPeriod,     setPaymentPeriod]     = useState('today');
  const [topProductsPeriod, setTopProductsPeriod] = useState('today');
  const [comparisonPeriod,  setComparisonPeriod]  = useState('7d');

  // ── Per-card stats cache: key = `${cardId}_${period}` ─────────────────────
  const [statsMap,     setStatsMap]     = useState({});
  const [loadingMap,   setLoadingMap]   = useState({});
  const [prevStatsMap, setPrevStatsMap] = useState({});
  const [readyMap,     setReadyMap]     = useState({});
  const [statsRefreshTick, setStatsRefreshTick] = useState(0);

  // ── Chart ─────────────────────────────────────────────────────────────────
  const [dailyData,    setDailyData]    = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  // ── Lists ─────────────────────────────────────────────────────────────────
  const [recentBills,             setRecentBills]             = useState([]);
  const [loadingRecentBills,      setLoadingRecentBills]      = useState(true);
  const [topProducts,             setTopProducts]             = useState([]);
  const [loadingTopProducts,      setLoadingTopProducts]      = useState(true);
  const [lowStockItems,           setLowStockItems]           = useState([]);
  const [loadingLowStock,         setLoadingLowStock]         = useState(true);
  const [pendingPurchases,        setPendingPurchases]        = useState([]);
  const [loadingPendingPurchases, setLoadingPendingPurchases] = useState(true);

  useEffect(() => {
    setReadyMap({});
  }, [shopId]);

  // ── Realtime refresh for cards that depend on stats docs ───────────────────
  // This keeps Home stat cards fresh after actions like restock/purchase/billing.
  useEffect(() => {
    if (!shopId) return;
    const todayKey = getISTStatsKey(0);
    const unsub = db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection('stats')
      .doc(todayKey)
      .onSnapshot(
        () => {
          setStatsRefreshTick((v) => v + 1);
        },
        () => {}
      );
    return unsub;
  }, [shopId]);

  // ── Set owner atom ────────────────────────────────────────────────────────
  useEffect(() => {
    if (userDoc?.role === 'OWNER') setCurrentOwner(userDoc);
  }, [userDoc, setCurrentOwner]);

  // ── Generic: fetch stats for a card+period ────────────────────────────────
  const fetchCardStats = useCallback(async (cardId, period) => {
    if (!shopId) return;
    const cacheKey = `${cardId}_${period}`;
    const days     = getPeriodDays(period);

    setLoadingMap((prev) => ({ ...prev, [cacheKey]: true }));

    try {
      const currentKeys          = getLastNStatKeys(days);
      const { totals: current }  = await fetchStatsByKeys(db, shopId, currentKeys);
      setStatsMap((prev) => ({ ...prev, [cacheKey]: current }));

      // prev period — same length shifted back
      const prevKeys         = Array.from({ length: days }, (_, i) => getISTStatsKey(days + i));
      const { totals: prev } = await fetchStatsByKeys(db, shopId, prevKeys);
      setPrevStatsMap((pm) => ({ ...pm, [cacheKey]: prev }));
    } catch (e) {
      console.log(`[statsError] ${cardId} ${period}:`, e?.message);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [cacheKey]: false }));
      setReadyMap((prev) => ({ ...prev, [cardId]: true }));
    }
  }, [shopId]);

  // ── Trigger fetch per card when period changes ────────────────────────────
  useEffect(() => { fetchCardStats('revenue',  revenuePeriod);    }, [shopId, revenuePeriod,    fetchCardStats, statsRefreshTick]);
  useEffect(() => { fetchCardStats('profit',   profitPeriod);     }, [shopId, profitPeriod,     fetchCardStats, statsRefreshTick]);
  useEffect(() => { fetchCardStats('bills',    billsPeriod);      }, [shopId, billsPeriod,      fetchCardStats, statsRefreshTick]);
  useEffect(() => { fetchCardStats('items',    itemsPeriod);      }, [shopId, itemsPeriod,      fetchCardStats, statsRefreshTick]);
  useEffect(() => { fetchCardStats('avgbill',  avgBillPeriod);    }, [shopId, avgBillPeriod,    fetchCardStats, statsRefreshTick]);
  useEffect(() => { fetchCardStats('purchase', purchasePeriod);   }, [shopId, purchasePeriod,   fetchCardStats, statsRefreshTick]);
  useEffect(() => { fetchCardStats('payment',  paymentPeriod);    }, [shopId, paymentPeriod,    fetchCardStats, statsRefreshTick]);
  useEffect(() => { fetchCardStats('compare',  comparisonPeriod); }, [shopId, comparisonPeriod, fetchCardStats, statsRefreshTick]);

  // ── Chart data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shopId) return;
    setLoadingChart(true);
    const days = getPeriodDays(chartPeriod);
    const keys = getLastNStatKeys(days);
    fetchStatsByKeys(db, shopId, keys)
      .then(({ daily }) => {
        setDailyData(daily);
        setLoadingChart(false);
        setReadyMap((prev) => ({ ...prev, chart: true }));
      })
      .catch((e) => {
        console.log('[chartError]', e?.message);
        setLoadingChart(false);
        setReadyMap((prev) => ({ ...prev, chart: true }));
      });
  }, [shopId, chartPeriod, statsRefreshTick]);

  // ── Top products ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shopId) { setLoadingTopProducts(false); return; }
    const days  = getPeriodDays(topProductsPeriod);
    const since = new Date(Date.now() - days * 86400000);
    setLoadingTopProducts(true);

    const unsub = db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection(COLLECTIONS.BILLS)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot(
        (snap) => {
          const map = {};
          snap.docs.forEach((d) => {
            const bill = d.data();
            const date = bill.createdAt?.toDate?.();
            if (date && date < since) return;
            (bill.items || []).forEach((item) => {
              const key = item.barcode || item.name;
              if (!map[key]) map[key] = { name: item.name, qty: 0, revenue: 0 };
              map[key].qty     += Number(item.qty)    || 0;
              map[key].revenue += Number(item.amount) || 0;
            });
          });
          setTopProducts(Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5));
          setLoadingTopProducts(false);
          setReadyMap((prev) => ({ ...prev, topProducts: true }));
        },
        (err) => {
          const url = err?.message?.match(/https:\/\/console\.firebase\.google\.com\S+/);
          if (url) console.log('✅ CREATE INDEX (top products):', url[0]);
          else     console.log('[topProductsError]', err?.message);
          setLoadingTopProducts(false);
          setReadyMap((prev) => ({ ...prev, topProducts: true }));
        }
      );
    return unsub;
  }, [shopId, topProductsPeriod]);

  // ── Recent bills ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shopId) { setLoadingRecentBills(false); return; }
    const unsub = db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection(COLLECTIONS.BILLS)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .onSnapshot(
        (snap) => {
          setRecentBills(snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() || null,
          })));
          setLoadingRecentBills(false);
          setReadyMap((prev) => ({ ...prev, recentBills: true }));
        },
        (err) => {
          const url = err?.message?.match(/https:\/\/console\.firebase\.google\.com\S+/);
          if (url) console.log('✅ CREATE INDEX (recent bills):', url[0]);
          else     console.log('[recentBillsError]', err?.message);
          setLoadingRecentBills(false);
          setReadyMap((prev) => ({ ...prev, recentBills: true }));
        }
      );
    return unsub;
  }, [shopId]);

  // ── Low stock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shopId) { setLoadingLowStock(false); return; }
    const unsub = db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection(COLLECTIONS.INVENTORY)
      .where('stock', '<=', 5)
      .limit(10)
      .onSnapshot(
        (snap) => {
          setLowStockItems(
            snap.docs
              .map((d) => {
                const raw = { id: d.id, ...d.data() };
                const product = products?.[String(raw.barcode)] || null;
                return {
                  ...raw,
                  name: raw.name || product?.name || 'Unknown Product',
                };
              })
              .filter((i) => (i.stock || 0) >= 0)
          );
          setLoadingLowStock(false);
          setReadyMap((prev) => ({ ...prev, lowStock: true }));
        },
        (err) => {
          const url = err?.message?.match(/https:\/\/console\.firebase\.google\.com\S+/);
          if (url) console.log('✅ CREATE INDEX (low stock):', url[0]);
          else     console.log('[lowStockError]', err?.message);
          setLoadingLowStock(false);
          setReadyMap((prev) => ({ ...prev, lowStock: true }));
        }
      );
    return unsub;
  }, [shopId, products]);

  // ── Pending purchases ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!shopId) { setLoadingPendingPurchases(false); return; }
    const unsub = db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection(COLLECTIONS.PURCHASES)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(
        (snap) => {
          setPendingPurchases(
            snap.docs.map((d) => ({ id: d.id, ...d.data() }))
              .filter((p) => (p.dueAmount || 0) > 0)
              .slice(0, 5)
          );
          setLoadingPendingPurchases(false);
          setReadyMap((prev) => ({ ...prev, pendingPurchases: true }));
        },
        (err) => {
          const url = err?.message?.match(/https:\/\/console\.firebase\.google\.com\S+/);
          if (url) console.log('✅ CREATE INDEX (pending purchases):', url[0]);
          else     console.log('[pendingPurchasesError]', err?.message);
          setLoadingPendingPurchases(false);
          setReadyMap((prev) => ({ ...prev, pendingPurchases: true }));
        }
      );
    return unsub;
  }, [shopId]);

  // ── Greeting ──────────────────────────────────────────────────────────────
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getStats  = (id, p) => statsMap[`${id}_${p}`]     || {};
  const getPrev   = (id, p) => prevStatsMap[`${id}_${p}`] || {};
  const isLoading = (id, p) => !!loadingMap[`${id}_${p}`];
  const dashboardReady = !shopId || (
    readyMap.revenue &&
    readyMap.profit &&
    readyMap.bills &&
    readyMap.items &&
    readyMap.avgbill &&
    readyMap.purchase &&
    readyMap.payment &&
    readyMap.compare &&
    readyMap.chart &&
    readyMap.topProducts &&
    readyMap.recentBills &&
    readyMap.lowStock &&
    readyMap.pendingPurchases
  );

  return {
    greeting,
    hasShop: !!shopId,
    dashboardReady,

    // each card gets its own { period, setPeriod, stats, prev, loading }
    revenue:     { period: revenuePeriod,     setPeriod: setRevenuePeriod,     stats: getStats('revenue',  revenuePeriod),    loading: isLoading('revenue',  revenuePeriod)    },
    profit:      { period: profitPeriod,      setPeriod: setProfitPeriod,      stats: getStats('profit',   profitPeriod),     loading: isLoading('profit',   profitPeriod)     },
    bills:       { period: billsPeriod,       setPeriod: setBillsPeriod,       stats: getStats('bills',    billsPeriod),      loading: isLoading('bills',    billsPeriod)      },
    items:       { period: itemsPeriod,       setPeriod: setItemsPeriod,       stats: getStats('items',    itemsPeriod),      loading: isLoading('items',    itemsPeriod)      },
    avgBill:     { period: avgBillPeriod,     setPeriod: setAvgBillPeriod,     stats: getStats('avgbill',  avgBillPeriod),    loading: isLoading('avgbill',  avgBillPeriod)    },
    purchase:    { period: purchasePeriod,    setPeriod: setPurchasePeriod,    stats: getStats('purchase', purchasePeriod),   loading: isLoading('purchase', purchasePeriod)   },
    payment:     { period: paymentPeriod,     setPeriod: setPaymentPeriod,     stats: getStats('payment',  paymentPeriod),    loading: isLoading('payment',  paymentPeriod)    },
    comparison:  { period: comparisonPeriod,  setPeriod: setComparisonPeriod,  stats: getStats('compare',  comparisonPeriod), prev: getPrev('compare', comparisonPeriod), loading: isLoading('compare', comparisonPeriod) },
    chart:       { period: chartPeriod,       setPeriod: setChartPeriod,       dailyData, loading: loadingChart },
    topProducts: { period: topProductsPeriod, setPeriod: setTopProductsPeriod, data: topProducts, loading: loadingTopProducts },

    recentBills,             loadingRecentBills,
    lowStockItems,           loadingLowStock,
    pendingPurchases,        loadingPendingPurchases,
  };
};

export default useHomeViewModel;