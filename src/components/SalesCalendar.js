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

function MonthYearPicker({ visible, currentDay, currentMonth, currentYear, onSelect, onClose }) {
  const { t } = useTranslation();
  const now   = new Date();
  const years = Array.from(
    { length: now.getFullYear() - START_YEAR + 1 },
    (_, i) => START_YEAR + i
  );

  const [pickerYear,        setPickerYear]        = useState(currentYear);
  const [pickerMonth,       setPickerMonth]       = useState(currentMonth);
  const [pickerDay,         setPickerDay]         = useState(currentDay);
  const [yearDropdownOpen,  setYearDropdownOpen]  = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  // Sync every time modal opens
  React.useEffect(() => {
    if (visible) {
      setPickerYear(currentYear);
      setPickerMonth(currentMonth);
      setPickerDay(currentDay);
      setYearDropdownOpen(false);
      setMonthDropdownOpen(false);
    }
  }, [visible, currentYear, currentMonth, currentDay]);

  const handleConfirm = () => {
    onSelect(pickerDay, pickerMonth, pickerYear);
    onClose();
  };

  const daysInPickerMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();

  const onSelectYear = (yr) => {
    setPickerYear(yr);
    const maxDay = new Date(yr, pickerMonth + 1, 0).getDate();
    if (pickerDay > maxDay) setPickerDay(maxDay);
    setYearDropdownOpen(false);
  };

  const onSelectMonth = (monthIdx) => {
    setPickerMonth(monthIdx);
    const maxDay = new Date(pickerYear, monthIdx + 1, 0).getDate();
    if (pickerDay > maxDay) setPickerDay(maxDay);
    setMonthDropdownOpen(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdropCenter}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>{t("sales.selectMonthYear")}</Text>
          <Text style={styles.pickerSubtitle}>
            {MONTH_NAMES[pickerMonth]} {pickerYear}
          </Text>

          <Text style={styles.sectionLabel}>{t("sales.yearLabel")}</Text>
          <TouchableOpacity
            style={styles.yearSelectBtn}
            onPress={() => {
              setYearDropdownOpen((v) => !v);
              setMonthDropdownOpen(false);
            }}
            activeOpacity={0.82}
          >
            <Text style={styles.yearSelectText}>{pickerYear}</Text>
            <Text style={styles.yearSelectChevron}>{yearDropdownOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {yearDropdownOpen && (
            <ScrollView
              style={styles.yearDropdown}
              contentContainerStyle={styles.yearDropdownContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {years
                .slice()
                .reverse()
                .map((yr) => {
                  const isActive = yr === pickerYear;
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={[styles.yearOption, isActive && styles.yearOptionActive]}
                      onPress={() => onSelectYear(yr)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.yearOptionText, isActive && styles.yearOptionTextActive]}>
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          )}

          {!yearDropdownOpen && (
            <>
              <Text style={styles.sectionLabel}>{t("sales.monthLabel")}</Text>
              <TouchableOpacity
                style={styles.yearSelectBtn}
                onPress={() => {
                  setMonthDropdownOpen((v) => !v);
                  setYearDropdownOpen(false);
                }}
                activeOpacity={0.82}
              >
                <Text style={styles.yearSelectText}>{MONTH_NAMES[pickerMonth]}</Text>
                <Text style={styles.yearSelectChevron}>{monthDropdownOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {monthDropdownOpen ? (
                <ScrollView
                  style={styles.yearDropdown}
                  contentContainerStyle={styles.yearDropdownContent}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {MONTH_SHORT.map((name, idx) => {
                    const isActive = idx === pickerMonth;
                    const isFuture =
                      pickerYear > now.getFullYear() ||
                      (pickerYear === now.getFullYear() && idx > now.getMonth());
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.yearOption,
                          isActive && styles.yearOptionActive,
                          isFuture && styles.chipDisabled,
                        ]}
                        disabled={isFuture}
                        onPress={() => onSelectMonth(idx)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.yearOptionText,
                            isActive && styles.yearOptionTextActive,
                            isFuture && styles.chipTextDisabled,
                          ]}
                        >
                          {name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <>
                  <Text style={styles.sectionLabel}>{t("sales.dayLabel", "Day")}</Text>
                  <ScrollView
                    style={styles.dayWrap}
                    contentContainerStyle={styles.dayGrid}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: daysInPickerMonth }, (_, i) => i + 1).map((day) => {
                      const isActive = day === pickerDay;
                      const isFuture =
                        pickerYear > now.getFullYear() ||
                        (pickerYear === now.getFullYear() && pickerMonth > now.getMonth()) ||
                        (pickerYear === now.getFullYear() &&
                          pickerMonth === now.getMonth() &&
                          day > now.getDate());

                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dayChip,
                            isActive && styles.chipActive,
                            isFuture && styles.chipDisabled,
                          ]}
                          disabled={isFuture}
                          onPress={() => setPickerDay(day)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                              isFuture && styles.chipTextDisabled,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}
            </>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.82}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={handleConfirm} activeOpacity={0.82}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ───────── TIER COLORS (teal theme shades) ───────── */
// tier 4 = highest sales, tier 1 = lowest with sales, 0 = no sales
const TIER_BG = {
  4: 'rgba(45,74,82,0.90)',
  3: 'rgba(45,74,82,0.55)',
  2: 'rgba(45,74,82,0.28)',
  1: 'rgba(45,74,82,0.10)',
  0: 'transparent',
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
  const tierBg   = TIER_BG[saleTier]  ?? 'transparent';
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

  const dayStripRef      = useRef(null);
  // ── Only auto-scroll when user picks from modal, not on every date tap ──
  const shouldAutoScroll = useRef(false);

  const [calMonth,      setCalMonth]      = useState(now.getMonth());
  const [calYear,       setCalYear]       = useState(now.getFullYear());
  const [pickerVisible, setPickerVisible] = useState(false);

  const isFiltered  = calMonth !== now.getMonth() || calYear !== now.getFullYear();
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
    const values = Array.from(salesMap.values()).filter(v => v > 0).sort((a, b) => a - b);
    if (values.length === 0) return new Map();
    const p75     = values[Math.floor(values.length * 0.75)];
    const p50     = values[Math.floor(values.length * 0.50)];
    const p25     = values[Math.floor(values.length * 0.25)];
    const tierMap = new Map();
    salesMap.forEach((sales, day) => {
      if (sales <= 0)        tierMap.set(day, 0);
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

  function resetToNow() {
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    onSelectDate(new Date());
  }

  // ── On mount: scroll to show today (current week visible) ────────────────
  React.useEffect(() => {
    const todayIndex       = now.getDate() - 1;
    const itemWidthWithGap = rs(52) + rs(6);
    // Center today by offsetting half the screen width
    const targetX = Math.max(0, todayIndex * itemWidthWithGap - (SCREEN_W / 2) + rs(26));
    const timer = setTimeout(() => {
      dayStripRef.current?.scrollTo({ x: targetX, animated: false });
    }, 150);
    return () => clearTimeout(timer);
  }, []); // runs once on mount only

  // ── Auto-scroll ONLY when user picks a date from the modal ───────────────
  React.useEffect(() => {
    if (!shouldAutoScroll.current) return; // not a modal pick — skip

    if (
      selectedDate.getFullYear() !== calYear ||
      selectedDate.getMonth()    !== calMonth
    ) return;

    shouldAutoScroll.current = false; // reset after use

    const selectedDayIndex = selectedDate.getDate() - 1;
    const itemWidthWithGap = rs(52) + rs(6);
    const targetX = Math.max(
      0,
      selectedDayIndex * itemWidthWithGap - (SCREEN_W / 2) + rs(26)
    );

    const timer = setTimeout(() => {
      dayStripRef.current?.scrollTo({ x: targetX, animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [selectedDate, calMonth, calYear]);

  return (
    <View style={styles.section}>

      {/* ── Month header ── */}
      <View style={styles.monthRow}>

        <TouchableOpacity style={styles.navBtn} onPress={prevMonth} activeOpacity={0.7}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.monthLabelBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.75}
        >
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

          <View style={styles.chevronWrap}>
            <View style={styles.chevronV} />
          </View>
        </TouchableOpacity>

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

        <TouchableOpacity style={styles.navBtn} onPress={nextMonth} activeOpacity={0.7}>
          <Text style={styles.navIcon}>›</Text>
        </TouchableOpacity>

      </View>

      {/* ── Day strip ── */}
      <ScrollView
        ref={dayStripRef}
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
        currentDay={selectedDate.getDate()}
        currentMonth={calMonth}
        currentYear={calYear}
        onSelect={(day, month, year) => {
          shouldAutoScroll.current = true; // ← flag: this came from modal
          setCalMonth(month);
          setCalYear(year);
          onSelectDate(new Date(year, month, day));
        }}
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

  dayStrip: {
    gap: rs(6),
  },

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

  dotPlaceholder: {
    marginTop: rvs(4),
    width: rs(5),
    height: rs(5),
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,43,48,0.50)',
  },

  backdropCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(20),
  },

  pickerCard: {
    width: '100%',
    maxWidth: rs(360),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
    paddingBottom: rvs(16),
    shadowColor: 'rgba(26,46,51,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
    elevation: 14,
  },

  pickerTitle: {
    fontSize: rfs(17),
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: rvs(2),
    letterSpacing: 0.2,
  },

  pickerSubtitle: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: rvs(12),
  },

  sectionLabel: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: rvs(8),
    marginTop: rvs(2),
  },

  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
    marginBottom: rvs(12),
  },

  dayWrap: {
    maxHeight: rvs(150),
    marginBottom: rvs(4),
  },

  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
    paddingBottom: rvs(6),
  },

  dayChip: {
    minWidth: rs(44),
    minHeight: rvs(36),
    paddingHorizontal: rs(8),
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthChip: {
    width: `${(100 / 4) - 1}%`,
    minHeight: rvs(40),
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  yearSelectBtn: {
    minHeight: rvs(44),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: rs(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rvs(8),
  },

  yearSelectText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  yearSelectChevron: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    fontWeight: '700',
  },

  yearDropdown: {
    maxHeight: rvs(170),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
    marginBottom: rvs(12),
  },

  yearDropdownContent: {
    paddingVertical: rvs(6),
  },

  yearOption: {
    minHeight: rvs(38),
    paddingHorizontal: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  yearOptionActive: {
    backgroundColor: 'rgba(45,74,82,0.08)',
  },

  yearOptionText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  yearOptionTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },

  chipActive: {
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderColor: colors.primary,
  },

  chipDisabled: {
    backgroundColor: 'rgba(45,74,82,0.03)',
    borderColor: colors.borderCard,
  },

  chipText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  chipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },

  chipTextDisabled: {
    color: colors.textSecondary,
    opacity: 0.4,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: rs(10),
    marginTop: rvs(14),
  },

  cancelBtn: {
    flex: 1,
    height: rvs(46),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,74,82,0.04)',
  },

  cancelText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textSecondary,
  },

  applyBtn: {
    flex: 1,
    height: rvs(46),
    borderRadius: rs(12),
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