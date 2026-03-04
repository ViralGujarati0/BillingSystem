import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";

import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const MONTH_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

// ─── Start year for picker ────────────────────────────────────────────────────
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
  const y = Number(parts[1]);
  const m = Number(parts[2]) - 1;
  const d = Number(parts[3]);
  return new Date(y, m, d);
}

/* ───────── MONTH/YEAR PICKER MODAL ───────── */

function MonthYearPicker({ visible, currentMonth, currentYear, onSelect, onClose }) {
  const now       = new Date();
  const years     = Array.from(
    { length: now.getFullYear() - START_YEAR + 1 },
    (_, i) => START_YEAR + i
  );

  const [pickerYear, setPickerYear] = useState(currentYear);

  // month width = (card width - horizontal padding - gaps) / 3
  const cardW    = SCREEN_W - rs(40);          // left:rs(20) + right:rs(20)
  const hPad     = rs(16) * 2;
  const gapTotal = rs(8) * 2;
  const monthBtnW = Math.floor((cardW - hPad - gapTotal) / 3);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Picker card */}
      <View style={styles.pickerCard}>

        {/* Title + close */}
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Select Month & Year</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Year strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.yearStrip}
        >
          {years.map(yr => (
            <TouchableOpacity
              key={yr}
              style={[styles.yearBtn, pickerYear === yr && styles.yearBtnActive]}
              onPress={() => setPickerYear(yr)}
              activeOpacity={0.75}
            >
              <Text style={[styles.yearText, pickerYear === yr && styles.yearTextActive]}>
                {yr}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Divider */}
        <View style={styles.pickerDivider} />

        {/* Month grid — 3 cols */}
        <View style={styles.monthGrid}>
          {MONTH_SHORT.map((name, idx) => {
            const isActive = idx === currentMonth && pickerYear === currentYear;
            const isFuture =
              pickerYear > now.getFullYear() ||
              (pickerYear === now.getFullYear() && idx > now.getMonth());
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.monthBtn,
                  { width: monthBtnW },
                  isActive  && styles.monthBtnActive,
                  isFuture  && styles.monthBtnDisabled,
                ]}
                disabled={isFuture}
                activeOpacity={0.75}
                onPress={() => { onSelect(idx, pickerYear); onClose(); }}
              >
                <Text style={[
                  styles.monthText,
                  isActive && styles.monthTextActive,
                  isFuture && styles.monthTextMuted,
                ]}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
    </Modal>
  );
}

/* ───────── DAY COMPONENT ───────── */

function CalDay({ date, isActive, isToday, hasBills, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.day, isActive && styles.dayActive]}
      onPress={() => onPress(date)}
      activeOpacity={0.75}
    >
      <Text style={[styles.dayName, isActive && styles.textActive]}>
        {DAY_NAMES[date.getDay()]}
      </Text>
      <Text style={[
        styles.dayNum,
        isToday && !isActive && styles.dayToday,
        isActive && styles.textActive,
      ]}>
        {date.getDate()}
      </Text>
      {hasBills
        ? <View style={[styles.dot, isActive && styles.dotActive]} />
        : <View style={styles.dotPlaceholder} />
      }
    </TouchableOpacity>
  );
}

/* ───────── MAIN COMPONENT ───────── */

const SalesCalendar = ({ stats = [], selectedDate, onSelectDate }) => {

  const now = new Date();

  const [calMonth,      setCalMonth]      = useState(now.getMonth());
  const [calYear,       setCalYear]       = useState(now.getFullYear());
  const [pickerVisible, setPickerVisible] = useState(false);

  /* ── Days in month — logic unchanged ── */
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  /* ── Bill days set — logic unchanged ── */
  const billDaySet = useMemo(() => {
    const set = new Set();
    stats.forEach((s) => {
      const d = parseDayFromId(s.id);
      if (d && d.getMonth() === calMonth && d.getFullYear() === calYear) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [stats, calMonth, calYear]);

  /* ── Month nav — logic unchanged ── */
  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  return (
    <View style={styles.section}>

      {/* ── Month header ── */}
      <View style={styles.monthRow}>

        {/* Prev arrow */}
        <TouchableOpacity style={styles.navBtn} onPress={prevMonth} activeOpacity={0.7}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>

        {/* Center: month+year pill — tappable */}
        <TouchableOpacity
          style={styles.monthLabelBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.75}
        >
          {/* Dynamic calendar icon showing current day */}
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

          {/* Down chevron using borders — precise V shape */}
          <View style={styles.chevronWrap}>
            <View style={styles.chevronV} />
          </View>
        </TouchableOpacity>

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
              hasBills={billDaySet.has(i + 1)}
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

  // ── Month header ──────────────────────────────────────
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rvs(12),
    gap: rs(8),
  },

  // Center pill — takes remaining space
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

  // Red top strip like a real calendar
  calIconHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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

  // Precise V-shaped chevron using border trick
  chevronV: {
    width: rs(8),
    height: rs(8),
    borderRightWidth: rs(2),
    borderBottomWidth: rs(2),
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    marginTop: -rs(3),
  },

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

  // ── removed: navRow, changePill, changePillText, dropArrow ──

  // ── Day strip ─────────────────────────────────────────
  dayStrip: {
    gap: rs(6),
  },

  day: {
    width: rs(52),
    backgroundColor: '#fff',
    borderRadius: rs(14),
    borderWidth: 1.5,
    borderColor: colors.borderCard,
    alignItems: 'center',
    paddingTop: rvs(8),
    paddingBottom: rvs(10),
  },

  dayActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  dayName: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: rvs(5),
  },

  dayNum: {
    fontSize: rfs(16),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  dayToday: {
    color: colors.accent,
  },

  textActive: {
    color: '#fff',
  },

  dot: {
    marginTop: rvs(5),
    width: rs(4),
    height: rs(4),
    borderRadius: rs(2),
    backgroundColor: colors.accent,
  },

  dotActive: {
    backgroundColor: 'rgba(245,166,35,0.85)',
  },

  dotPlaceholder: {
    marginTop: rvs(5),
    width: rs(4),
    height: rs(4),
  },

  // ── Modal backdrop ────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },

  // ── Picker card ───────────────────────────────────────
  pickerCard: {
    position: 'absolute',
    top: SCREEN_H * 0.22,
    left: rs(20),
    right: rs(20),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    paddingTop: rvs(18),
    paddingBottom: rvs(20),
    shadowColor: 'rgba(0,0,0,0.20)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
    elevation: 16,
  },

  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    marginBottom: rvs(14),
  },

  pickerTitle: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  closeBtn: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    backgroundColor: 'rgba(45,74,82,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    fontWeight: '700',
  },

  // ── Year strip ────────────────────────────────────────
  yearStrip: {
    gap: rs(8),
    paddingHorizontal: rs(16),
    paddingBottom: rvs(12),
  },

  yearBtn: {
    paddingHorizontal: rs(14),
    paddingVertical: rvs(6),
    borderRadius: rs(20),
    backgroundColor: 'rgba(45,74,82,0.06)',
  },

  yearBtnActive: {
    backgroundColor: colors.primary,
  },

  yearText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  yearTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  pickerDivider: {
    height: 1,
    backgroundColor: colors.borderCard,
    marginHorizontal: rs(16),
    marginBottom: rvs(12),
  },

  // ── Month grid ────────────────────────────────────────
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: rs(16),
    gap: rs(8),
  },

  monthBtn: {
    paddingVertical: rvs(10),
    borderRadius: rs(12),
    backgroundColor: 'rgba(45,74,82,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthBtnActive: {
    backgroundColor: colors.primary,
  },

  monthBtnDisabled: {
    opacity: 0.35,
  },

  monthText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  monthTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  monthTextMuted: {
    color: colors.textSecondary,
  },
});