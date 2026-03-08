import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import useInventoryViewModel from '../viewmodels/InventoryViewModel';
import InventoryDeleteModal from './ConfirmActionModal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Stock status config ──────────────────────────────────────────────────────
const getStockStatus = (stock) => {
  const s = Number(stock) || 0;
  if (s === 0)  return { label: 'Out',     bg: 'rgba(224,82,82,0.10)',   border: 'rgba(224,82,82,0.25)',   dot: '#E05252', text: '#E05252' };
  if (s <= 10)  return { label: 'Low',     bg: 'rgba(245,166,35,0.10)',  border: 'rgba(245,166,35,0.25)',  dot: colors.accent, text: '#c47c0a' };
  return              { label: 'In Stock', bg: 'rgba(91,158,109,0.10)',  border: 'rgba(91,158,109,0.25)',  dot: '#5B9E6D', text: '#5B9E6D' };
};

// ─── Component ────────────────────────────────────────────────────────────────
const InventoryItemCard = ({ item, onPress, expanded, onExpand }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const scaleAnim                       = useRef(new Animated.Value(1)).current;

  const vm     = useInventoryViewModel();
  const status = getStockStatus(item.stock);

  const pressIn  = () => Animated.spring(scaleAnim, { toValue: 0.985, useNativeDriver: true, friction: 8, tension: 200 }).start();
  const pressOut = () => Animated.spring(scaleAnim, { toValue: 1,     useNativeDriver: true, friction: 8, tension: 200 }).start();

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await vm.deleteInventory({ barcode: item.barcode });
      setModalVisible(false);
    } catch (e) {
      setModalVisible(false);
      // re-open with error? or just close — vm should handle error toast
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>

      {/* ── Delete confirmation modal ── */}
      <InventoryDeleteModal
        visible={modalVisible}
        item={item}
        deleting={deleting}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
      <TouchableOpacity
        style={styles.card}
        onPress={onExpand}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >

        {/* Left green stripe */}
        <View style={[styles.stripe, { backgroundColor: status.dot }]} />

        <View style={styles.inner}>

          {/* ── Collapsed row ── */}
          <View style={styles.row}>

            {/* Left: icon + info */}
            <View style={styles.iconWrap}>
              <Icon name="cube-outline" size={rfs(18)} color={colors.primary} />
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.barcode}>{item.barcode}</Text>
              {!!item.category && (
                <Text style={styles.category}>{item.category}</Text>
              )}
            </View>

            {/* Right: stock pill + chevron */}
            <View style={styles.rightBlock}>
              <View style={[styles.stockPill, { backgroundColor: status.bg, borderColor: status.border }]}>
                <View style={[styles.stockDot, { backgroundColor: status.dot }]} />
                <Text style={[styles.stockNum, { color: status.text }]}>
                  {item.stock ?? 0}
                </Text>
              </View>
              <Text style={styles.stockLabel}>{status.label}</Text>
              <Icon
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={rfs(13)}
                color={colors.textSecondary}
                style={styles.chevron}
              />
            </View>

          </View>

          {/* ── Expanded details ── */}
          {expanded && (
            <View style={styles.details}>

              {/* Detail row */}
              <View style={styles.detailGrid}>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>MRP</Text>
                  <Text style={styles.detailValue}>₹{item.mrp ?? 0}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Selling Price</Text>
                  <Text style={styles.detailValue}>₹{item.sellingPrice ?? 0}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Stock</Text>
                  <Text style={[styles.detailValue, { color: status.text }]}>
                    {item.stock ?? 0}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.btnRow}>

                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={() => onPress?.(item)}
                  activeOpacity={0.8}
                >
                  <Icon name="create-outline" size={rfs(14)} color="#FFFFFF" />
                  <Text style={styles.updateText}>Update Inventory</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteBtn, deleting && styles.btnDisabled]}
                  onPress={() => setModalVisible(true)}
                  disabled={deleting}
                  activeOpacity={0.8}
                >
                  <Icon name="trash-outline" size={rfs(16)} color="#FFFFFF" />
                </TouchableOpacity>

              </View>

            </View>
          )}

        </View>

      </TouchableOpacity>
    </Animated.View>
  );
};

export default InventoryItemCard;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },

  // ── Left stripe ───────────────────────────────────────
  stripe: {
    width: rs(3),
    flexShrink: 0,
  },

  inner: {
    flex: 1,
    padding: rs(13),
  },

  // ── Collapsed row ─────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },

  iconWrap: {
    width: rs(38),
    height: rs(38),
    borderRadius: rs(11),
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  infoBlock: {
    flex: 1,
    gap: rvs(2),
  },

  name: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  barcode: {
    fontSize: rfs(10),
    fontWeight: '500',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.4,
  },

  category: {
    fontSize: rfs(10),
    fontWeight: '600',
    color: colors.primary,
    opacity: 0.65,
  },

  rightBlock: {
    alignItems: 'flex-end',
    gap: rvs(3),
    flexShrink: 0,
  },

  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    borderRadius: rs(9),
    borderWidth: 1,
    paddingHorizontal: rs(9),
    paddingVertical: rvs(3),
  },

  stockDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
  },

  stockNum: {
    fontSize: rfs(13),
    fontWeight: '800',
  },

  stockLabel: {
    fontSize: rfs(9),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  chevron: {
    marginTop: rvs(2),
  },

  // ── Expanded details ──────────────────────────────────
  details: {
    marginTop: rvs(12),
    borderTopWidth: 1,
    borderTopColor: colors.borderCard,
    paddingTop: rvs(12),
    gap: rvs(12),
  },

  detailGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45,74,82,0.03)',
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
  },

  detailCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: rvs(10),
    gap: rvs(3),
  },

  detailDivider: {
    width: StyleSheet.hairlineWidth,
    height: '60%',
    backgroundColor: colors.borderCard,
  },

  detailLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  detailValue: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  // ── Action buttons ────────────────────────────────────
  btnRow: {
    flexDirection: 'row',
    gap: rs(10),
  },

  updateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    backgroundColor: colors.primary,
    paddingVertical: rvs(10),
    borderRadius: rs(10),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    elevation: 3,
  },

  updateText: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  deleteBtn: {
    width: rs(44),
    backgroundColor: '#E05252',
    borderRadius: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E05252',
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    elevation: 3,
  },

  btnDisabled: {
    opacity: 0.5,
  },

});