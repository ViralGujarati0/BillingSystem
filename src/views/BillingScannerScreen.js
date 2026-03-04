import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  useCodeScanner,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useSetAtom } from 'jotai';
import { useIsFocused } from '@react-navigation/native';

import { purchaseScannedBarcodeAtom } from '../atoms/purchase';
import { barcodeScannerRequestingPermissionAtom } from '../atoms/forms';
import useBillingViewModel from '../viewmodels/BillingViewModel';
import { colors } from '../theme/colors';

import ScannerHeaderCart     from '../components/ScannerHeaderCart';
import ScannerFrame          from '../components/ScannerFrame';
import ScannerBottomActions  from '../components/ScannerBottomActions';
import AppHeaderLayout       from '../components/AppHeaderLayout';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Screen ───────────────────────────────────────────────────────────────────
const BillingScannerScreen = ({ navigation, route }) => {
  const mode   = route?.params?.mode || 'default';
  const userDoc = route?.params?.userDoc;
  const shopId  = userDoc?.shopId;

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const setPurchaseScannedBarcode = useSetAtom(purchaseScannedBarcodeAtom);
  const setRequestingPermission   = useSetAtom(barcodeScannerRequestingPermissionAtom);

  const vm       = useBillingViewModel();
  const isFocused = useIsFocused();

  /* ── Stable VM ref ── */
  const vmRef = useRef(vm);
  useEffect(() => { vmRef.current = vm; }, [vm]);

  /* ── Focus ref + reset on blur ── */
  const isFocusedRef = useRef(isFocused);
  useEffect(() => {
    isFocusedRef.current = isFocused;
    if (!isFocused) {
      lastScanTime.current       = 0;
      lastScannedBarcode.current = null;
      isProcessing.current       = false;
    }
  }, [isFocused]);

  /* ── Scan throttle refs ── */
  const lastScanTime       = useRef(0);
  const lastScannedBarcode = useRef(null);
  const isProcessing       = useRef(false);

  /* ── Continuous throttled scanning — logic unchanged ── */
  const onCodeScanned = useCallback(
    async (codes) => {
      if (!isFocusedRef.current) return;
      if (!codes.length || !shopId) return;

      const value = codes[0]?.value;
      if (!value) return;

      const cleanValue = String(value).trim();
      const now = Date.now();

      if (cleanValue !== lastScannedBarcode.current) {
        lastScanTime.current       = 0;
        lastScannedBarcode.current = cleanValue;
        isProcessing.current       = false;
      }

      if (now - lastScanTime.current < 300) return;
      if (isProcessing.current) return;

      lastScanTime.current = now;
      console.log('📸 CAMERA DETECTED', cleanValue);

      if (mode === 'updateInventory') {
        navigation.replace('UpdateInventory', { barcode: cleanValue });
        return;
      }

      if (mode === 'purchaseItem') {
        setPurchaseScannedBarcode(cleanValue);
        navigation.goBack();
        return;
      }

      isProcessing.current = true;
      try {
        await vmRef.current.addScannedBarcode({ shopId, barcode: cleanValue });
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        isProcessing.current = false;
      }
    },
    [navigation, setPurchaseScannedBarcode, mode, shopId]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a'],
    onCodeScanned,
    scanInterval: 300,
  });

  /* ── Permission handler — logic unchanged ── */
  const handleRequestPermission = async () => {
    setRequestingPermission(true);
    try {
      const result = await requestPermission();
      if (!result) {
        Alert.alert(
          'Camera permission denied',
          'Enable camera access in settings to scan barcodes.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (e) {
      Alert.alert('Error', e?.message ?? 'Permission request failed.');
    } finally {
      setRequestingPermission(false);
    }
  };

  /* ── Permission screen ── */
  if (!hasPermission) {
    return (
      <AppHeaderLayout title="Add Items">
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconWrap}>
            <Text style={styles.permissionIcon}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            Camera permission is required to scan barcodes and add items to your bill.
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            activeOpacity={0.82}
            onPress={handleRequestPermission}
          >
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelTouchable}
            activeOpacity={0.6}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </AppHeaderLayout>
    );
  }

  /* ── No device screen ── */
  if (!device) {
    return (
      <AppHeaderLayout title="Add Items">
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconWrap}>
            <Text style={styles.permissionIcon}>🚫</Text>
          </View>
          <Text style={styles.permissionTitle}>No Camera Found</Text>
          <Text style={styles.permissionText}>
            Could not detect a camera on this device.
          </Text>
          <TouchableOpacity
            style={styles.cancelTouchable}
            activeOpacity={0.6}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AppHeaderLayout>
    );
  }

  /* ── Main UI ── */
  return (
    <AppHeaderLayout title="Add Items">
      <View style={styles.container}>

        {/* Live cart preview */}
        <ScannerHeaderCart />

        {/* Camera scanner */}
        <ScannerFrame
          device={device}
          codeScanner={codeScanner}
          isActive={isFocused}
        />

        {/* Bottom actions */}
        <ScannerBottomActions
          navigation={navigation}
          userDoc={userDoc}
        />

      </View>
    </AppHeaderLayout>
  );
};

export default BillingScannerScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Main container ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: rvs(10),
    paddingHorizontal: rs(18),
    paddingBottom: rvs(8),
  },

  // ── Permission / No-device screens ───────────────────
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(32),
    gap: rvs(16),
  },

  permissionIconWrap: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(24),
    backgroundColor: 'rgba(45,74,82,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(4),
  },

  permissionIcon: {
    fontSize: rfs(36),
  },

  permissionTitle: {
    fontSize: rfs(18),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  permissionText: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(20),
    fontWeight: '400',
  },

  permissionBtn: {
    height: rvs(50),
    width: '100%',
    borderRadius: rs(14),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rvs(8),
    shadowColor: colors.shadowPrimary,
    shadowOffset: { width: 0, height: rvs(6) },
    shadowOpacity: 0.30,
    shadowRadius: rs(12),
    elevation: 6,
  },

  permissionBtnText: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 0.3,
  },

  cancelTouchable: {
    paddingVertical: rvs(8),
    paddingHorizontal: rs(24),
  },

  cancelText: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
  },

  backBtnText: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.primary,
  },
});