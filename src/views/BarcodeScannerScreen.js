import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCodeScanner,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useSetAtom, useAtomValue } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';

import { scannedBarcodeAtom }                    from '../atoms/owner';
import { barcodeScannerRequestingPermissionAtom } from '../atoms/forms';
import { purchaseScannedBarcodeAtom }             from '../atoms/purchase';

import AppHeaderLayout from '../components/AppHeaderLayout';
import ScannerFrame    from '../components/ScannerFrame';
import { colors }      from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Mode config — drives header title + hint text ───────────────────────────
const MODE_CONFIG = {
  check:           { title: 'Check Product',    subtitle: 'Check mode',    hint: 'Scan barcode to check product details',      icon: 'search-outline'       },
  updateInventory: { title: 'Update Inventory', subtitle: 'Update mode',   hint: 'Scan barcode to update inventory',            icon: 'refresh-outline'      },
  purchaseItem:    { title: 'Scan Item',        subtitle: 'Purchase mode', hint: 'Scan barcode to add to purchase',             icon: 'cart-outline'         },
  searchInventory: { title: 'Search Inventory', subtitle: 'Search mode',   hint: 'Scan barcode to search inventory',            icon: 'search-outline'       },
  default:         { title: 'Scan Barcode',     subtitle: 'Add mode',      hint: 'Scan barcode to add product to bill',         icon: 'barcode-outline'      },
};

// ─── Back pill ────────────────────────────────────────────────────────────────
const BackPill = ({ onPress }) => (
  <TouchableOpacity style={styles.backPill} onPress={onPress} activeOpacity={0.75}>
    <Icon name="chevron-back" size={rfs(16)} color="#FFFFFF" />
    <Text style={styles.backPillText}>Back</Text>
  </TouchableOpacity>
);

// ─── Permission denied state ─────────────────────────────────────────────────
const PermissionState = ({ requesting, onRequest, onBack }) => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <Icon name="camera-off-outline" size={rfs(34)} color={colors.textSecondary} />
    </View>
    <Text style={styles.stateTitle}>Camera Access Needed</Text>
    <Text style={styles.stateSub}>
      Allow camera access to scan barcodes and manage your inventory.
    </Text>
    <TouchableOpacity
      style={[styles.stateBtn, requesting && styles.stateBtnDisabled]}
      onPress={onRequest}
      activeOpacity={0.8}
      disabled={requesting}
    >
      {requesting ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Icon name="camera-outline" size={rfs(15)} color="#FFFFFF" />
          <Text style={styles.stateBtnText}>Grant Permission</Text>
        </>
      )}
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.stateCancelBtn}
      onPress={onBack}
      activeOpacity={0.7}
      disabled={requesting}
    >
      <Text style={styles.stateCancelText}>Cancel</Text>
    </TouchableOpacity>
  </View>
);

// ─── No device state ─────────────────────────────────────────────────────────
const NoDeviceState = ({ onBack }) => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <Icon name="warning-outline" size={rfs(34)} color={colors.textSecondary} />
    </View>
    <Text style={styles.stateTitle}>No Camera Found</Text>
    <Text style={styles.stateSub}>
      Could not detect a camera device on this device.
    </Text>
    <TouchableOpacity style={styles.stateBtn} onPress={onBack} activeOpacity={0.8}>
      <Icon name="arrow-back-outline" size={rfs(15)} color="#FFFFFF" />
      <Text style={styles.stateBtnText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
/**
 * Supported modes:
 *  - (default)       → ProductScanResultScreen (Add path)
 *  - check           → ProductScanResultScreen (Check path)
 *  - updateInventory → UpdateInventoryScreen
 *  - purchaseItem    → sets atom + goBack
 *  - searchInventory → ProductScanResultScreen (Search path)
 */
const BarcodeScannerScreen = ({ navigation, route }) => {
  const mode   = route?.params?.mode || 'default';
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const hasScanned              = useRef(false);
  const setScannedBarcode       = useSetAtom(scannedBarcodeAtom);
  const setPurchaseBarcode      = useSetAtom(purchaseScannedBarcodeAtom);
  const requestingPermission    = useAtomValue(barcodeScannerRequestingPermissionAtom);
  const setRequestingPermission = useSetAtom(barcodeScannerRequestingPermissionAtom);

  const cfg = MODE_CONFIG[mode] ?? MODE_CONFIG.default;

  useEffect(() => {
    hasScanned.current = false;
  }, []);

  // ── Logic unchanged ──────────────────────────────────────────────────────────
  const onCodeScanned = useCallback(
    (codes) => {
      if (hasScanned.current || !codes.length) return;

      const value = codes[0]?.value;
      if (!value) return;

      hasScanned.current = true;
      setTimeout(() => { hasScanned.current = false; }, 1200);

      if (mode === 'updateInventory') {
        navigation.replace('UpdateInventory', { barcode: value });
        return;
      }

      if (mode === 'purchaseItem') {
        setPurchaseBarcode(value);
        navigation.goBack();
        return;
      }

      setScannedBarcode(value);
      navigation.replace('ProductScanResult', { barcode: value, mode });
    },
    [navigation, mode, setScannedBarcode, setPurchaseBarcode]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a'],
    onCodeScanned,
    scanInterval: 500,
  });

  const handleRequestPermission = async () => {
    setRequestingPermission(true);
    try {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera permission denied',
          'Enable camera access in your device settings to scan barcodes.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (e) {
      Alert.alert('Error', e?.message ?? 'Could not request camera permission.');
    } finally {
      setRequestingPermission(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  const backPill = <BackPill onPress={() => navigation.goBack()} />;

  // ── No permission ──
  if (!hasPermission) {
    return (
      <AppHeaderLayout
        title={cfg.title}
        subtitle={cfg.subtitle}
        leftComponent={backPill}
      >
        <PermissionState
          requesting={requestingPermission}
          onRequest={handleRequestPermission}
          onBack={() => navigation.goBack()}
        />
      </AppHeaderLayout>
    );
  }

  // ── No device ──
  if (device == null) {
    return (
      <AppHeaderLayout
        title={cfg.title}
        subtitle={cfg.subtitle}
        leftComponent={backPill}
      >
        <NoDeviceState onBack={() => navigation.goBack()} />
      </AppHeaderLayout>
    );
  }

  // ── Main scanner ──
  return (
    <AppHeaderLayout
      title={cfg.title}
      subtitle={cfg.subtitle}
      leftComponent={backPill}
    >
      <View style={styles.body}>

        {/* ── Scanner frame — fills remaining space ── */}
        <ScannerFrame
          device={device}
          codeScanner={codeScanner}
          isActive={true}
        />

        {/* ── Bottom area ── */}
        <View style={styles.bottom}>

          {/* Hint row */}
          <View style={styles.hintRow}>
            <View style={styles.hintIconWrap}>
              <Icon name="scan-outline" size={rfs(14)} color={colors.accent} />
            </View>
            <Text style={styles.hintText}>{cfg.hint}</Text>
          </View>

          {/* Supported formats */}
          <View style={styles.formatsRow}>
            {['QR', 'EAN-13', 'EAN-8', 'Code-128', 'UPC-A'].map((fmt) => (
              <View key={fmt} style={styles.formatChip}>
                <Text style={styles.formatChipText}>{fmt}</Text>
              </View>
            ))}
          </View>

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Icon name="close-outline" size={rfs(16)} color={colors.textSecondary} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </View>

      </View>
    </AppHeaderLayout>
  );
};

export default BarcodeScannerScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Back pill ────────────────────────────────────────────
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(7),
  },

  backPillText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ── Main body ────────────────────────────────────────────
  body: {
    flex: 1,
    backgroundColor: '#0D1F24',
    // Pull up to cover AppHeaderLayout's white paddingTop overlap area
    marginTop: -rvs(18),
    paddingTop: rvs(18),
    paddingHorizontal: rs(18),
    paddingBottom: rvs(16),
    gap: rvs(10),
  },

  // ── Bottom area ──────────────────────────────────────────
  bottom: {
    gap: rvs(8),
  },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: rs(8),
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.18)',
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(8),
  },

  hintIconWrap: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(7),
    backgroundColor: 'rgba(245,166,35,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hintText: {
    fontSize: rfs(12),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.70)',
    flexShrink: 1,
  },

  // Barcode format chips
  formatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: rs(6),
  },

  formatChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: rs(6),
    paddingHorizontal: rs(8),
    paddingVertical: rvs(3),
  },

  formatChipText: {
    fontSize: rfs(9),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.40)',
    letterSpacing: 0.3,
  },

  // Cancel
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    paddingVertical: rvs(11),
    borderRadius: rs(14),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  cancelText: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // ── Permission / no device states ────────────────────────
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(32),
    gap: rvs(10),
  },

  stateIconWrap: {
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

  stateTitle: {
    fontSize: rfs(17),
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  stateSub: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(19),
  },

  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    backgroundColor: colors.primary,
    borderRadius: rs(12),
    paddingHorizontal: rs(20),
    paddingVertical: rvs(12),
    marginTop: rvs(8),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    elevation: 4,
  },

  stateBtnDisabled: {
    opacity: 0.6,
  },

  stateBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  stateCancelBtn: {
    paddingVertical: rvs(10),
    paddingHorizontal: rs(20),
  },

  stateCancelText: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
  },

});