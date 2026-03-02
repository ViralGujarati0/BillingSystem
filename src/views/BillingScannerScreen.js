import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
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

import ScannerHeaderCart from '../components/ScannerHeaderCart';
import ScannerFrame from '../components/ScannerFrame';
import ScannerBottomActions from '../components/ScannerBottomActions';

const BillingScannerScreen = ({ navigation, route }) => {
  const mode = route?.params?.mode || 'default';
  const userDoc = route?.params?.userDoc;
  const shopId = userDoc?.shopId;

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const setPurchaseScannedBarcode = useSetAtom(purchaseScannedBarcodeAtom);
  const setRequestingPermission = useSetAtom(
    barcodeScannerRequestingPermissionAtom
  );

  const vm = useBillingViewModel();
  const isFocused = useIsFocused();

  /* ───────── STABLE VM REF ───────── */

  const vmRef = useRef(vm);
  useEffect(() => {
    vmRef.current = vm;
  }, [vm]);

  /* ───────── STABLE FOCUS REF + RESET ON BLUR ───────── */

  const isFocusedRef = useRef(isFocused);
  useEffect(() => {
    isFocusedRef.current = isFocused;
    if (!isFocused) {
      lastScanTime.current = 0;
      lastScannedBarcode.current = null;
      isProcessing.current = false;
    }
  }, [isFocused]);

  /* ───────── SCAN THROTTLE REFS ───────── */

  const lastScanTime = useRef(0);
  const lastScannedBarcode = useRef(null);
  const isProcessing = useRef(false);

  /* ───────── CONTINUOUS THROTTLED SCANNING ───────── */

  const onCodeScanned = useCallback(
    async (codes) => {
      // ✅ HARD GATE: immediately reject if screen not focused
      if (!isFocusedRef.current) return;
      if (!codes.length || !shopId) return;

      const value = codes[0]?.value;
      if (!value) return;

      const cleanValue = String(value).trim();
      const now = Date.now();

      // ✅ Reset throttle instantly when barcode changes
      if (cleanValue !== lastScannedBarcode.current) {
        lastScanTime.current = 0;
        lastScannedBarcode.current = cleanValue;
        isProcessing.current = false;
      }

      // ✅ Throttle same barcode to every 300ms
      if (now - lastScanTime.current < 300) return;

      // ✅ Prevent overlapping async calls
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

      // ✅ Billing mode — use stable vmRef, not vm
      isProcessing.current = true;
      try {
        await vmRef.current.addScannedBarcode({ shopId, barcode: cleanValue });
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        isProcessing.current = false;
      }
    },
    [navigation, setPurchaseScannedBarcode, mode, shopId] // ✅ vm NOT in deps
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a'],
    onCodeScanned,
    scanInterval: 300,
  });

  /* ───────── PERMISSION HANDLING ───────── */

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

  /* ───────── PERMISSION UI ───────── */

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan.
        </Text>

        <Text style={styles.permissionButton} onPress={handleRequestPermission}>
          Grant Permission
        </Text>

        <Text
          style={styles.cancelText}
          onPress={() => navigation.goBack()}
        >
          Cancel
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          No camera device found.
        </Text>

        <Text
          style={styles.cancelText}
          onPress={() => navigation.goBack()}
        >
          Back
        </Text>
      </View>
    );
  }

  /* ───────── MAIN UI ───────── */

  return (
    <View style={styles.container}>

      {/* 🔹 Live Cart Preview */}
      <ScannerHeaderCart />

      {/* 🔹 Limited Scanner Area */}
      <ScannerFrame device={device} codeScanner={codeScanner} isActive={isFocused} />

      {/* 🔹 Bottom Actions */}
      <ScannerBottomActions
        navigation={navigation}
        userDoc={userDoc}
      />
    </View>
  );
};

export default BillingScannerScreen;

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
    paddingHorizontal: 16,
  },

  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  permissionText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },

  permissionButton: {
    backgroundColor: colors.primary,
    color: colors.textLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },

  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});