import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const MONTH_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const START_YEAR = 2000;

/* ───────── HELPERS ───────── */

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function parseDayFromId(id) {
  if (!id) return null;
  const parts = id.split("_");
  if (parts.length !== 4) return null;
  return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
}

/* ───────── MONTH/YEAR PICKER MODAL ───────── */

// ─── Drum-roll item height ────────────────────────────────────────────────────
const ITEM_H     = rvs(52);
const VISIBLE    = 5;                    // visible rows at once
const DRUM_H     = ITEM_H * VISIBLE;     // total column height
const PAD        = ITEM_H * 2;           // top+bottom padding so center = selected
const LABEL_H    = rvs(24);             // drumColLabel paddingVertical * 2

function MonthYearPicker({ visible, currentMonth, currentYear, onSelect, onClose }) {
  const { t } = useTranslation();
  const now   = new Date();
  const years = Array.from(
    { length: now.getFullYear() - START_YEAR + 1 },
    (_, i) => START_YEAR + i
  );

  // Use refs so handleConfirm always reads latest value
  const pickerYearRef  = useRef(currentYear);
  const pickerMonthRef = useRef(currentMonth);

  const [pickerYear,  setPickerYear]  = useState(currentYear);
  const [pickerMonth, setPickerMonth] = useState(currentMonth);

  const yearScrollRef  = useRef(null);
  const monthScrollRef = useRef(null);

  const setYear  = (v) => { pickerYearRef.current  = v; setPickerYear(v);  };
  const setMonth = (v) => { pickerMonthRef.current = v; setPickerMonth(v); };

  // Sync + scroll every time modal opens
  React.useEffect(() => {
    if (visible) {
      setYear(currentYear);
      setMonth(currentMonth);
      setTimeout(() => {
        const yIdx = years.indexOf(currentYear);
        yearScrollRef.current?.scrollTo({ y: yIdx * ITEM_H, animated: false });
        monthScrollRef.current?.scrollTo({ y: currentMonth * ITEM_H, animated: false });
      }, 100);
    }
  }, [visible]);

  const handleConfirm = () => {
    onSelect(pickerMonthRef.current, pickerYearRef.current);
    onClose();
  };

  const snapYear = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const yr  = years[Math.max(0, Math.min(idx, years.length - 1))];
    setYear(yr);
  };

  const snapMonth = (e) => {
    const idx = Math.max(0, Math.min(
      Math.round(e.nativeEvent.contentOffset.y / ITEM_H), 11
    ));
    setMonth(idx);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleConfirm} />

      <View style={styles.pickerCard}>

        {/* Handle */}
        <View style={styles.pickerHeader}>
          <View style={styles.pickerHandleBar} />
        </View>

        <Text style={styles.pickerTitle}>{t("sales.selectMonthYear")}</Text>

        {/* Drum columns */}
        <View style={styles.drumWrap}>

          {/* Selection band */}
          <View pointerEvents="none" style={styles.selectionBand} />
          <View pointerEvents="none" style={styles.fadeTop} />
          <View pointerEvents="none" style={styles.fadeBottom} />

          {/* YEAR */}
          <View style={styles.drumCol}>
            <Text style={styles.drumColLabel}>{t("sales.yearLabel")}</Text>
            <ScrollView
              ref={yearScrollRef}
              style={{ height: DRUM_H }}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_H}
              decelerationRate={0.92}
              contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
              onMomentumScrollEnd={snapYear}
              onScrollEndDrag={snapYear}
            >
              {years.map((yr) => {
                const isActive = yr === pickerYear;
                return (
                  <TouchableOpacity
                    key={yr}
                    style={[styles.drumItem, { height: ITEM_H }]}
                    onPress={() => {
                      setYear(yr);
                      yearScrollRef.current?.scrollTo({
                        y: years.indexOf(yr) * ITEM_H,
                        animated: true,
                      });
                    }}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.drumText, isActive && styles.drumTextActive]}>
                      {yr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.drumDivider} />

          {/* MONTH */}
          <View style={styles.drumCol}>
            <Text style={styles.drumColLabel}>{t("sales.monthLabel")}</Text>
            <ScrollView
              ref={monthScrollRef}
              style={{ height: DRUM_H }}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_H}
              decelerationRate={0.92}
              contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
              onMomentumScrollEnd={snapMonth}
              onScrollEndDrag={snapMonth}
            >
              {MONTH_SHORT.map((name, idx) => {
                const isActive = idx === pickerMonth;
                const isFuture =
                  pickerYearRef.current > now.getFullYear() ||
                  (pickerYearRef.current === now.getFullYear() && idx > now.getMonth());
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.drumItem, { height: ITEM_H }, isFuture && styles.drumItemDisabled]}
                    disabled={isFuture}
                    onPress={() => {
                      setMonth(idx);
                      monthScrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
                    }}
                    activeOpacity={0.6}
                  >
                    <Text style={[
                      styles.drumText,
                      isActive  && styles.drumTextActive,
                      isFuture  && styles.drumTextMuted,
                    ]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

        </View>

        <TouchableOpacity style={styles.applyBtn} onPress={handleConfirm} activeOpacity={0.82}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>

      </View>
    </Modal>
  );
}

/* ───────── TIER COLORS (teal theme shades) ───────── */
// tier 4 = highest sales, tier 1 = lowest with sales, 0 = no sales
const TIER_BG = {
  4: 'rgba(45,74,82,0.90)',   // darkest — top sales day
  3: 'rgba(45,74,82,0.55)',   // dark-medium
  2: 'rgba(45,74,82,0.28)',   // medium-light
  1: 'rgba(45,74,82,0.10)',   // lightest — has sales but low
  0: 'transparent',           // no sales
};

const TIER_TEXT = {
  4: '#FFFFFF',
  3: '#FFFFFF',
  2: colors.textPrimary,
  1: colors.textPrimary,
  0: colors.textPrimary,
};

/* ───────── DAY COMPONENT ───────── */

function CalDay({ date, isActive, isToday, saleTier, onPress }) {
  const tierBg  = TIER_BG[saleTier]  ?? 'transparent';
  const tierText = TIER_TEXT[saleTier] ?? colors.textPrimary;

  const hasSales = saleTier > 0;

  const nameColor = hasSales && saleTier >= 3
    ? 'rgba(255,255,255,0.80)'
    : colors.textSecondary;

  const numColor = isToday && !isActive
    ? colors.accent
    : hasSales
      ? tierText
      : colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={() => onPress(date)}
      activeOpacity={0.75}
      style={styles.dayWrapper}
    >
      <View style={[
        styles.day,
        hasSales && { backgroundColor: tierBg },
        isActive  && styles.daySelected,
      ]}>
        <Text style={[styles.dayName, { color: nameColor }]}>
          {DAY_NAMES[date.getDay()]}
        </Text>
        <Text style={[styles.dayNum, { color: numColor }]}>
          {date.getDate()}
        </Text>
        <View style={styles.dotPlaceholder} />
      </View>
    </TouchableOpacity>
  );
}

/* ───────── MAIN COMPONENT ───────── */

const SalesCalendar = ({ stats = [], selectedDate, onSelectDate }) => {

  const now = new Date();

  const [calMonth,      setCalMonth]      = useState(now.getMonth());
  const [calYear,       setCalYear]       = useState(now.getFullYear());
  const [pickerVisible, setPickerVisible] = useState(false);

  // Track if user has changed from current month/year
  const isFiltered = calMonth !== now.getMonth() || calYear !== now.getFullYear();

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // ── Sales map: day → totalSales ──────────────────────
  const salesMap = useMemo(() => {
    const map = new Map();
    stats.forEach((s) => {
      const d = parseDayFromId(s.id);
      if (d && d.getMonth() === calMonth && d.getFullYear() === calYear) {
        map.set(d.getDate(), Number(s.totalSales || 0));
      }
    });
    return map;
  }, [stats, calMonth, calYear]);

  // ── Sales tier per day (0–4) ──────────────────────────
  const saleTierMap = useMemo(() => {
    if (salesMap.size === 0) return new Map();
    const values  = Array.from(salesMap.values()).filter(v => v > 0).sort((a, b) => a - b);
    if (values.length === 0) return new Map();
    const max     = values[values.length - 1];
    const p75     = values[Math.floor(values.length * 0.75)];
    const p50     = values[Math.floor(values.length * 0.50)];
    const p25     = values[Math.floor(values.length * 0.25)];
    const tierMap = new Map();
    salesMap.forEach((sales, day) => {
      if (sales <= 0)      tierMap.set(day, 0);
      else if (sales >= p75) tierMap.set(day, 4);
      else if (sales >= p50) tierMap.set(day, 3);
      else if (sales >= p25) tierMap.set(day, 2);
      else                   tierMap.set(day, 1);
    });
    return tierMap;
  }, [salesMap]);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  // Reset to current month/year + today's date
  function resetToNow() {
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    onSelectDate(new Date());
  }

  return (
    <View style={styles.section}>

      {/* ── Month header ── */}
      <View style={styles.monthRow}>

        {/* Prev arrow */}
        <TouchableOpacity style={styles.navBtn} onPress={prevMonth} activeOpacity={0.7}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>

        {/* Center pill */}
        <TouchableOpacity
          style={styles.monthLabelBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.75}
        >
          {/* Dynamic calendar icon */}
          <View style={styles.calIconWrap}>
            <View style={styles.calIconHeader} />
            <Text style={styles.calIconDay}>{selectedDate.getDate()}</Text>
          </View>

          <View style={styles.monthTextBlock}>
            <Text style={styles.monthLabel}>
              {MONTH_NAMES[calMonth]} {calYear}
            </Text>
            <Text style={styles.monthHint}>tap to change</Text>
          </View>

          {/* Chevron down */}
          <View style={styles.chevronWrap}>
            <View style={styles.chevronV} />
          </View>
        </TouchableOpacity>

        {/* Cross reset — only shown when filtered */}
        {isFiltered && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={resetToNow}
            activeOpacity={0.75}
          >
            <View style={styles.crossLine1} />
            <View style={styles.crossLine2} />
          </TouchableOpacity>
        )}

        {/* Next arrow */}
        <TouchableOpacity style={styles.navBtn} onPress={nextMonth} activeOpacity={0.7}>
          <Text style={styles.navIcon}>›</Text>
        </TouchableOpacity>

      </View>

      {/* ── Day strip ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStrip}
      >
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(calYear, calMonth, i + 1);
          return (
            <CalDay
              key={i}
              date={date}
              isActive={isSameDay(date, selectedDate)}
              isToday={isSameDay(date, now)}
              saleTier={saleTierMap.get(i + 1) ?? 0}
              onPress={onSelectDate}
            />
          );
        })}
      </ScrollView>

      {/* ── Picker modal ── */}
      <MonthYearPicker
        visible={pickerVisible}
        currentMonth={calMonth}
        currentYear={calYear}
        onSelect={(month, year) => { setCalMonth(month); setCalYear(year); }}
        onClose={() => setPickerVisible(false)}
      />

    </View>
  );
};

export default SalesCalendar;

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({

  section: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(4),
    paddingBottom: rvs(14),
  },

  // ── Month header row ──────────────────────────────────
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rvs(12),
    gap: rs(8),
  },

  monthLabelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    paddingHorizontal: rs(12),
    paddingVertical: rvs(8),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(6),
    elevation: 2,
  },

  calIconWrap: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(8),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },

  calIconHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: rs(9),
    backgroundColor: colors.accent,
    borderTopLeftRadius: rs(8),
    borderTopRightRadius: rs(8),
  },

  calIconDay: {
    fontSize: rfs(13),
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: rs(5),
    lineHeight: rfs(14),
  },

  monthTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  monthLabel: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  monthHint: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: rvs(1),
  },

  chevronWrap: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  chevronV: {
    width: rs(8),
    height: rs(8),
    borderRightWidth: rs(2),
    borderBottomWidth: rs(2),
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    marginTop: -rs(3),
  },

  // ── Cross reset button ────────────────────────────────
  resetBtn: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(10),
    backgroundColor: 'rgba(220,60,60,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(220,60,60,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  crossLine1: {
    position: 'absolute',
    width: rs(12),
    height: rs(2),
    borderRadius: rs(1),
    backgroundColor: '#DC3C3C',
    transform: [{ rotate: '45deg' }],
  },

  crossLine2: {
    position: 'absolute',
    width: rs(12),
    height: rs(2),
    borderRadius: rs(1),
    backgroundColor: '#DC3C3C',
    transform: [{ rotate: '-45deg' }],
  },

  // ── Nav buttons ───────────────────────────────────────
  navBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    flexShrink: 0,
  },

  navIcon: {
    fontSize: rfs(20),
    color: colors.primary,
    fontWeight: '700',
    lineHeight: rfs(24),
  },

  // ── Day strip ─────────────────────────────────────────
  dayStrip: {
    gap: rs(6),
  },

  // ── Day card ──────────────────────────────────────────
  dayWrapper: {
    width: rs(52),
  },

  day: {
    width: rs(52),
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: rvs(8),
    paddingBottom: rvs(8),
  },

  // Selected: only border changes — bg stays as-is (white or tier tint)
  daySelected: {
    borderWidth: rs(3),
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.30,
    shadowRadius: rs(6),
    elevation: 5,
  },

  dayName: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: rvs(4),
  },

  dayNum: {
    fontSize: rfs(16),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  dayToday: { color: colors.accent },

  dotPlaceholder: {
    marginTop: rvs(4),
    width: rs(5),
    height: rs(5),
  },

  // ── Modal backdrop ────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },

  // ── Picker card — bottom sheet ────────────────────────
  pickerCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    paddingBottom: rvs(28),
    shadowColor: 'rgba(0,0,0,0.20)',
    shadowOffset: { width: 0, height: -rvs(4) },
    shadowOpacity: 1,
    shadowRadius: rs(20),
    elevation: 20,
  },

  pickerHeader: {
    alignItems: 'center',
    paddingTop: rvs(12),
    paddingBottom: rvs(4),
  },

  pickerHandleBar: {
    width: rs(40),
    height: rvs(4),
    borderRadius: rs(2),
    backgroundColor: colors.borderCard,
  },

  pickerTitle: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: rvs(6),
    marginBottom: rvs(12),
    letterSpacing: 0.2,
  },

  // ── Drum roll wrapper ─────────────────────────────────
  drumWrap: {
    flexDirection: 'row',
    marginHorizontal: rs(20),
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: 'rgba(45,74,82,0.02)',
    overflow: 'hidden',
    position: 'relative',
  },

  // Center highlight band
  selectionBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_H * 2 + LABEL_H,          // 2 padded rows + label height
    height: ITEM_H,
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
    zIndex: 10,
  },

  // Top gradient fade mask
  fadeTop: {
    position: 'absolute',
    left: 0, right: 0, top: LABEL_H,
    height: ITEM_H * 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 10,
  },

  // Bottom gradient fade mask
  fadeBottom: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: 0,
    height: ITEM_H * 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 10,
  },

  drumCol: {
    flex: 1,
    alignItems: 'center',
  },

  drumColLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    paddingVertical: rvs(6),
    textAlign: 'center',
  },

  drumDivider: {
    width: 1,
    backgroundColor: colors.borderCard,
    alignSelf: 'stretch',
  },

  drumItem: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  drumText: {
    fontSize: rfs(15),
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  drumTextActive: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.primary,
  },

  drumTextMuted: {
    opacity: 0.25,
  },

  drumItemDisabled: {
    opacity: 0.25,
  },

  // ── Apply button ──────────────────────────────────────
  applyBtn: {
    marginHorizontal: rs(20),
    marginTop: rvs(14),
    height: rvs(48),
    borderRadius: rs(14),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.30,
    shadowRadius: rs(10),
    elevation: 6,
  },

  applyText: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});