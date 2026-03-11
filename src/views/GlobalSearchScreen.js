import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { useAtomValue } from 'jotai';

import { productCacheAtom } from '../atoms/productCache';
import { colors }           from '../theme/colors';
import { COLLECTIONS }      from '../constants/collections';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',       label: 'All',       icon: 'apps-outline'      },
  { key: 'bills',     label: 'Bills',     icon: 'receipt-outline'   },
  { key: 'products',  label: 'Products',  icon: 'cube-outline'      },
  { key: 'suppliers', label: 'Suppliers', icon: 'business-outline'  },
  { key: 'purchases', label: 'Purchases', icon: 'cart-outline'      },
];

// ─── Result type config ───────────────────────────────────────────────────────
const TYPE_CONFIG = {
  bill:     { icon: 'receipt-outline',  color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', label: 'Bill'     },
  product:  { icon: 'cube-outline',     color: '#2D4A52', bg: 'rgba(45,74,82,0.10)',   label: 'Product'  },
  supplier: { icon: 'business-outline', color: '#16a34a', bg: 'rgba(22,163,74,0.10)',  label: 'Supplier' },
  purchase: { icon: 'cart-outline',     color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', label: 'Purchase' },
};

// ─── Highlight matched text ───────────────────────────────────────────────────
const HighlightText = ({ text = '', query = '', style, highlightStyle }) => {
  if (!query.trim()) return <Text style={style}>{text}</Text>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={[style, highlightStyle]}>{text.slice(idx, idx + query.length)}</Text>
      {text.slice(idx + query.length)}
    </Text>
  );
};

// ─── Single result row ────────────────────────────────────────────────────────
const ResultRow = ({ item, query, onPress, fadeAnim }) => {
  const cfg = TYPE_CONFIG[item.type];
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={styles.resultRow} onPress={onPress} activeOpacity={0.75}>

        {/* Icon */}
        <View style={[styles.resultIcon, { backgroundColor: cfg.bg }]}>
          <Icon name={cfg.icon} size={rfs(18)} color={cfg.color} />
        </View>

        {/* Text block */}
        <View style={styles.resultText}>
          <HighlightText
            text={item.title}
            query={query}
            style={styles.resultTitle}
            highlightStyle={styles.highlight}
          />
          <Text style={styles.resultSub} numberOfLines={1}>{item.subtitle}</Text>
        </View>

        {/* Right badge */}
        <View style={styles.resultRight}>
          {item.amount != null && (
            <Text style={styles.resultAmount}>₹{item.amount}</Text>
          )}
          <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <Icon name="chevron-forward" size={rfs(13)} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconWrap}>
      <Icon name="search-outline" size={rfs(32)} color={colors.textSecondary} />
    </View>
    <Text style={styles.emptyTitle}>No results found</Text>
    <Text style={styles.emptySub}>No matches for "{query}"</Text>
  </View>
);

// ─── Idle state ───────────────────────────────────────────────────────────────
const IdleState = () => (
  <View style={styles.idleWrap}>
    <View style={styles.idleGrid}>
      {[
        { icon: 'receipt-outline',  label: 'Search Bills',     color: '#7c3aed' },
        { icon: 'cube-outline',     label: 'Search Products',  color: '#2D4A52' },
        { icon: 'business-outline', label: 'Search Suppliers', color: '#16a34a' },
        { icon: 'cart-outline',     label: 'Search Purchases', color: '#f59e0b' },
      ].map((it) => (
        <View key={it.label} style={styles.idleCard}>
          <Icon name={it.icon} size={rfs(22)} color={it.color} />
          <Text style={styles.idleCardText}>{it.label}</Text>
        </View>
      ))}
    </View>
    <Text style={styles.idleHint}>Type anything to search across your entire shop</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GlobalSearchScreen({ navigation, route }) {
  const shopId  = route?.params?.shopId;
  const userDoc = route?.params?.userDoc;

  // ── Same product cache atom used by useStockViewModel ────────────────────
  const productCache = useAtomValue(productCacheAtom);

  const [query,        setQuery]        = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results,      setResults]      = useState([]);
  const [loading,      setLoading]      = useState(false);

  const inputRef  = useRef(null);
  const fadeAnims = useRef({}).current;
  const debounce  = useRef(null);

  // Auto-focus on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // ── Search logic ────────────────────────────────────────────────────────────
  const search = useCallback(async (text, filter) => {
    const q = text.trim().toLowerCase();
    if (!q || !shopId) { setResults([]); setLoading(false); return; }

    setLoading(true);
    try {
      const shopRef = firestore().collection(COLLECTIONS.SHOPS).doc(shopId);
      const all = [];

      const shouldSearch = (type) => filter === 'all' || filter === type;

      await Promise.all([

        // ── Bills ──────────────────────────────────────────────────────────
        shouldSearch('bills') && (async () => {
          const snap = await shopRef
            .collection(COLLECTIONS.BILLS)
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

          snap.docs.forEach((d) => {
            const data = d.data();

            // All possible ways a user might search for a bill:
            // "bill #1", "#1", "1", or the formatted "04-03-2026-1"
            const billNoFormatted = (data.billNoFormatted || '').toLowerCase();
            const billNoFull      = `bill #${data.billNo ?? ''}`.toLowerCase();  // "bill #1"
            const billNoHash      = `#${data.billNo ?? ''}`.toLowerCase();       // "#1"
            const billNoPlain     = `${data.billNo ?? ''}`.toLowerCase();        // "1"
            const customer        = (data.customerName || '').toLowerCase();

            if (
              billNoFormatted.includes(q) ||
              billNoFull.includes(q)      ||
              billNoHash.includes(q)      ||
              billNoPlain === q           ||  // exact match for plain number
              customer.includes(q)
            ) {
              all.push({
                id:       d.id,
                type:     'bill',
                // Title matches exactly what BillListItem shows
                title:    `Bill #${data.billNo}`,
                subtitle: `${data.customerName || 'Walk-in'} · ${data.paymentType || ''} · ₹${Number(data.grandTotal || 0).toFixed(2)}`,
                amount:   Number(data.grandTotal || 0).toFixed(0),
                raw:      data,
              });
            }
          });
        })(),

        // ── Products — inventory docs merged with productCache for name ─────
        shouldSearch('products') && (async () => {
          const snap = await shopRef
            .collection(COLLECTIONS.INVENTORY)
            .limit(300)
            .get();

          snap.docs.forEach((d) => {
            const inv     = d.data();
            const barcode = inv.barcode || d.id;

            // Pull name from productCache (same as useStockViewModel)
            const cached = productCache[barcode] || productCache[d.id];
            const name   = cached?.name || inv.name || 'Unknown Product';
            const mrp    = cached?.mrp  || inv.mrp  || 0;

            if (
              name.toLowerCase().includes(q) ||
              barcode.toLowerCase().includes(q)
            ) {
              all.push({
                id:       d.id,
                type:     'product',
                title:    name,
                subtitle: `Barcode: ${barcode} · Stock: ${inv.stock ?? 0} · MRP: ₹${mrp}`,
                amount:   inv.sellingPrice != null
                  ? Number(inv.sellingPrice).toFixed(0)
                  : null,
                raw: { ...inv, name, mrp },
              });
            }
          });
        })(),

        // ── Suppliers ──────────────────────────────────────────────────────
        shouldSearch('suppliers') && (async () => {
          const snap = await shopRef
            .collection(COLLECTIONS.SUPPLIERS)
            .where('isActive', '==', true)
            .get();

          snap.docs.forEach((d) => {
            const data  = d.data();
            const name  = (data.name  || '').toLowerCase();
            const phone = (data.phone || '').toLowerCase();

            if (name.includes(q) || phone.includes(q)) {
              all.push({
                id:       d.id,
                type:     'supplier',
                title:    data.name || '—',
                subtitle: `📞 ${data.phone || '—'}  ${data.address || ''}`,
                amount:   null,
                raw:      data,
              });
            }
          });
        })(),

        // ── Purchases ──────────────────────────────────────────────────────
        shouldSearch('purchases') && (async () => {
          const snap = await shopRef
            .collection(COLLECTIONS.PURCHASES)
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

          snap.docs.forEach((d) => {
            const data    = d.data();
            const purNo   = (data.purchaseNoFormatted || '').toLowerCase();
            const supName = (data.supplierName        || '').toLowerCase();

            if (purNo.includes(q) || supName.includes(q)) {
              all.push({
                id:       d.id,
                type:     'purchase',
                title:    data.purchaseNoFormatted || d.id,
                subtitle: `${data.supplierName || '—'} · ${data.date || ''}`,
                amount:   Number(data.subtotal || 0).toFixed(0),
                raw:      data,
              });
            }
          });
        })(),

      ]);

      setResults(all);
    } catch (e) {
      console.error('GlobalSearch error:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, productCache]);

  // ── Debounced query handler ─────────────────────────────────────────────────
  const onChangeText = (text) => {
    setQuery(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (!text.trim()) { setResults([]); return; }
    setLoading(true);
    debounce.current = setTimeout(() => search(text, activeFilter), 350);
  };

  // Re-search when filter tab changes
  useEffect(() => {
    if (query.trim()) search(query, activeFilter);
  }, [activeFilter]);

  // ── Navigate on result tap ──────────────────────────────────────────────────
  const onResultPress = (item) => {
    Keyboard.dismiss();
    switch (item.type) {
      case 'bill':
        navigation.navigate('BillDetail', { bill: item.raw, userDoc });
        break;
      case 'product':
        navigation.navigate('UpdateInventory', { barcode: item.id });
        break;
      case 'supplier':
        navigation.navigate('SupplierManagement', { userDoc, highlightId: item.id });
        break;
      case 'purchase':
        navigation.navigate('PurchaseDetail', { purchase: item.raw, userDoc });
        break;
    }
  };

  // ── Camera → barcode scan ───────────────────────────────────────────────────
  const onCameraPress = () => {
    navigation.navigate('BarcodeScanner', { mode: 'searchInventory' });
  };

  const showIdle   = !query.trim();
  const showEmpty  = !loading && query.trim() && results.length === 0;
  const showResult = !loading && results.length > 0;

  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.header}>

        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Icon name="chevron-back" size={rfs(20)} color="#fff" />
        </TouchableOpacity>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={rfs(17)} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search bills, products, suppliers…"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={onChangeText}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setResults([]); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close-circle" size={rfs(17)} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {/* Camera */}
          <TouchableOpacity style={styles.cameraBtn} onPress={onCameraPress} activeOpacity={0.75}>
            <Icon name="camera-outline" size={rfs(17)} color={colors.primary} />
          </TouchableOpacity>
        </View>

      </View>

      {/* ── Filter chips ── */}
      <View style={styles.filtersRow}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f.key}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item: f }) => {
            const active = activeFilter === f.key;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.75}
              >
                <Icon
                  name={f.icon}
                  size={rfs(13)}
                  color={active ? '#fff' : 'rgba(255,255,255,0.55)'}
                />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching…</Text>
          </View>
        )}

        {/* Idle */}
        {!loading && showIdle && <IdleState />}

        {/* Empty */}
        {showEmpty && <EmptyState query={query} />}

        {/* Results */}
        {showResult && (
          <FlatList
            data={results}
            keyExtractor={(it) => `${it.type}-${it.id}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </Text>
            }
            renderItem={({ item, index }) => {
              const key = `${item.type}-${item.id}`;
              if (!fadeAnims[key]) {
                fadeAnims[key] = new Animated.Value(0);
                Animated.timing(fadeAnims[key], {
                  toValue: 1,
                  duration: 220,
                  delay: index * 35,
                  useNativeDriver: true,
                }).start();
              }
              return (
                <ResultRow
                  item={item}
                  query={query}
                  onPress={() => onResultPress(item)}
                  fadeAnim={fadeAnims[key]}
                />
              );
            }}
          />
        )}

      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const HEADER_PT = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? rvs(24)) + rvs(12)
  : rvs(52);

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    backgroundColor: colors.primaryDark,
    paddingTop: HEADER_PT,
    paddingBottom: rvs(14),
    paddingHorizontal: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },

  backBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    backgroundColor: '#fff',
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(10),
  },

  searchInput: {
    flex: 1,
    fontSize: rfs(14),
    fontWeight: '500',
    color: colors.textPrimary,
    padding: 0,
  },

  cameraBtn: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(8),
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Filter chips ──────────────────────────────────────────
  filtersRow: {
    backgroundColor: colors.primaryDark,
    paddingBottom: rvs(14),
  },

  filtersContent: {
    paddingHorizontal: rs(16),
    gap: rs(8),
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(7),
    borderRadius: rs(20),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  filterChipText: {
    fontSize: rfs(12),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },

  filterChipTextActive: {
    color: '#fff',
  },

  // ── Body ──────────────────────────────────────────────────
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Loading ───────────────────────────────────────────────
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: rvs(12),
  },

  loadingText: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // ── Results list ──────────────────────────────────────────
  listContent: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(32),
    gap: rvs(8),
  },

  resultCount: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: rvs(6),
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    backgroundColor: '#fff',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: rs(12),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(6),
    elevation: 1,
  },

  resultIcon: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(11),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  resultText: {
    flex: 1,
    gap: rvs(3),
  },

  resultTitle: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  resultSub: {
    fontSize: rfs(11),
    fontWeight: '500',
    color: colors.textSecondary,
  },

  highlight: {
    color: colors.accent,
    fontWeight: '800',
  },

  resultRight: {
    alignItems: 'flex-end',
    gap: rvs(4),
  },

  resultAmount: {
    fontSize: rfs(13),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  typeBadge: {
    borderRadius: rs(6),
    paddingHorizontal: rs(7),
    paddingVertical: rvs(2),
  },

  typeBadgeText: {
    fontSize: rfs(9),
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // ── Empty state ───────────────────────────────────────────
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(32),
    gap: rvs(10),
  },

  emptyIconWrap: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(20),
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(4),
  },

  emptyTitle: {
    fontSize: rfs(16),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  emptySub: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── Idle state ────────────────────────────────────────────
  idleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(24),
    gap: rvs(20),
  },

  idleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(12),
    justifyContent: 'center',
  },

  idleCard: {
    width: (SCREEN_W - rs(24) * 2 - rs(12)) / 2,
    backgroundColor: '#fff',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    paddingVertical: rvs(18),
    alignItems: 'center',
    gap: rvs(8),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(6),
    elevation: 1,
  },

  idleCardText: {
    fontSize: rfs(12),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  idleHint: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(18),
  },
});