import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Variant config ───────────────────────────────────────────────────────────
//  danger  → red  (delete actions)
//  warning → amber (irreversible but not destructive)
//  success → teal  (confirm save / update)
const VARIANTS = {
  danger: {
    iconRingBg:     'rgba(224,82,82,0.08)',
    iconRingBorder: 'rgba(224,82,82,0.20)',
    iconColor:      '#E05252',
    confirmBg:      '#E05252',
    confirmShadow:  '#E05252',
  },
  warning: {
    iconRingBg:     'rgba(245,166,35,0.08)',
    iconRingBorder: 'rgba(245,166,35,0.25)',
    iconColor:      colors.accent,
    confirmBg:      colors.accent,
    confirmShadow:  colors.accent,
  },
  success: {
    iconRingBg:     'rgba(45,74,82,0.07)',
    iconRingBorder: 'rgba(45,74,82,0.15)',
    iconColor:      colors.primary,
    confirmBg:      colors.primary,
    confirmShadow:  colors.primary,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * ConfirmActionModal  — generic, replaces InventoryDeleteModal
 *
 * Required props:
 *   visible       boolean   — controls modal visibility
 *   onCancel      fn        — backdrop / Cancel tap
 *   onConfirm     fn        — confirm button tap
 *   loading       boolean   — shows ActivityIndicator on confirm btn
 *
 * Content props (all optional — sensible defaults provided):
 *   variant       'danger' | 'warning' | 'success'   default: 'danger'
 *   icon          Ionicons name                       default: 'trash-outline'
 *   title         string                              default: 'Are you sure?'
 *   message       string
 *   confirmLabel  string                              default: 'Confirm'
 *   confirmIcon   Ionicons name                       default: 'checkmark-outline'
 *   cancelLabel   string                              default: 'Cancel'
 *
 * Extra slots (optional):
 *   itemPill      { icon, label }  — shows a product/item name pill
 *   warningNote   { text, boldText } — shows the amber stock-warning row
 *   extraContent  ReactNode        — rendered between message and divider
 *
 * Backward-compat shim — if you pass the old `item` prop (from InventoryDeleteModal)
 * the modal auto-populates itemPill and warningNote so existing callers keep working.
 */
const ConfirmActionModal = ({
  // core
  visible,
  onCancel,
  onConfirm,
  loading = false,

  // content
  variant       = 'danger',
  icon          = 'trash-outline',
  title         = 'Are you sure?',
  message,
  confirmLabel  = 'Confirm',
  confirmIcon   = 'checkmark-outline',
  cancelLabel   = 'Cancel',

  // optional slots
  itemPill      = null,   // { icon, label }
  warningNote   = null,   // { text, boldText }
  extraContent  = null,

  // ── backward-compat: old InventoryDeleteModal props ──
  item     = null,   // { name, stock, barcode }
  deleting = false,  // alias for `loading`
}) => {

  // ── Backward-compat shim ──────────────────────────────────────────────────
  const isLoading = loading || deleting;

  let resolvedPill = itemPill;
  let resolvedWarn = warningNote;

  if (item && !itemPill) {
    resolvedPill = { icon: 'cube-outline', label: item.name };
  }
  if (item && !warningNote) {
    const stock = Number(item.stock) || 0;
    if (stock > 0) {
      resolvedWarn = {
        text:     `You still have `,
        boldText: `${stock} items`,
        suffix:   ` in stock.`,
      };
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const v = VARIANTS[variant] || VARIANTS.danger;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onCancel}
      >
        {/* Card — stops backdrop press propagating */}
        <TouchableOpacity activeOpacity={1} style={styles.card}>

          {/* ── Icon header ── */}
          <View style={styles.iconHeader}>
            <View style={[
              styles.iconRing,
              { backgroundColor: v.iconRingBg, borderColor: v.iconRingBorder },
            ]}>
              <Icon name={icon} size={rfs(28)} color={v.iconColor} />
            </View>
          </View>

          {/* ── Title ── */}
          <Text style={styles.title}>{title}</Text>

          {/* ── Item pill (optional) ── */}
          {resolvedPill && (
            <View style={styles.itemPill}>
              <Icon name={resolvedPill.icon} size={rfs(13)} color={colors.primary} />
              <Text style={styles.itemPillText} numberOfLines={1}>
                {resolvedPill.label}
              </Text>
            </View>
          )}

          {/* ── Warning note (optional) ── */}
          {resolvedWarn && (
            <View style={styles.warningBox}>
              <Icon name="warning-outline" size={rfs(14)} color={colors.accent} />
              <Text style={styles.warningText}>
                {resolvedWarn.text}
                {resolvedWarn.boldText && (
                  <Text style={styles.warningBold}>{resolvedWarn.boldText}</Text>
                )}
                {resolvedWarn.suffix || ''}
              </Text>
            </View>
          )}

          {/* ── Message ── */}
          {!!message && (
            <Text style={styles.message}>{message}</Text>
          )}

          {/* ── Extra content slot ── */}
          {extraContent}

          {/* ── Divider ── */}
          <View style={styles.divider} />

          {/* ── Buttons ── */}
          <View style={styles.btnRow}>

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.75}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>

            {/* Confirm */}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: v.confirmBg, shadowColor: v.confirmShadow },
                isLoading && styles.btnDisabled,
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name={confirmIcon} size={rfs(14)} color="#FFFFFF" />
                  <Text style={styles.confirmText}>{confirmLabel}</Text>
                </>
              )}
            </TouchableOpacity>

          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ConfirmActionModal;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,46,51,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(24),
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    paddingHorizontal: rs(20),
    paddingTop: rvs(28),
    paddingBottom: rvs(20),
    shadowColor: 'rgba(26,46,51,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
    elevation: 12,
  },

  // ── Icon header ──────────────────────────────────────────
  iconHeader: {
    alignItems: 'center',
    marginBottom: rvs(14),
  },

  iconRing: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(32),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Title ────────────────────────────────────────────────
  title: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: rvs(12),
    letterSpacing: 0.2,
  },

  // ── Item pill ────────────────────────────────────────────
  itemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: rs(6),
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(6),
    marginBottom: rvs(12),
    maxWidth: '85%',
  },

  itemPillText: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.primary,
    flexShrink: 1,
  },

  // ── Warning note ─────────────────────────────────────────
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.25)',
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(10),
    marginBottom: rvs(12),
  },

  warningText: {
    flex: 1,
    fontSize: rfs(12),
    fontWeight: '500',
    color: '#c47c0a',
    lineHeight: rfs(17),
  },

  warningBold: {
    fontWeight: '800',
    color: colors.accent,
  },

  // ── Message ──────────────────────────────────────────────
  message: {
    fontSize: rfs(13),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(19),
    marginBottom: rvs(18),
  },

  // ── Divider ──────────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginBottom: rvs(16),
  },

  // ── Buttons ──────────────────────────────────────────────
  btnRow: {
    flexDirection: 'row',
    gap: rs(10),
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: rvs(12),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
  },

  cancelText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    paddingVertical: rvs(12),
    borderRadius: rs(12),
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.30,
    shadowRadius: rs(8),
    elevation: 4,
  },

  confirmText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  btnDisabled: {
    opacity: 0.6,
  },

});