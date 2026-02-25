import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Camera, useCodeScanner, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useAtomValue } from 'jotai';
import { billingCartItemsAtom } from '../atoms/billing';
import useBillingViewModel from '../viewmodels/BillingViewModel';

const BillingScannerScreen = ({ navigation, route }) => {
  const { userDoc } = route.params || {};
  const shopId = userDoc?.shopId;
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cartItems = useAtomValue(billingCartItemsAtom);
  const vm = useBillingViewModel();
  const hasScanned = useRef(false);
  const scanningRef = useRef(false);

  useEffect(() => {
    hasScanned.current = false;
  }, []);

  const onCodeScanned = useCallback(
    async (codes) => {
      if (scanningRef.current || !codes.length || !shopId) return;
      const barcode = codes[0]?.value;
      if (!barcode) return;
      scanningRef.current = true;
      hasScanned.current = true;
      try {
        await vm.addScannedBarcode({ shopId, barcode });
      } catch (e) {
        Alert.alert('Error', e?.message || 'Failed to add item.');
      } finally {
        scanningRef.current = false;
        hasScanned.current = false;
      }
    },
    [shopId, vm]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a'],
    onCodeScanned: onCodeScanned,
    scanInterval: 800,
  });

  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

  if (!shopId) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No shop.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera permission needed.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No camera.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.cartPreview}>Current items: {itemCount}</Text>
      </View>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('ManualItem')}
        >
          <Text style={styles.btnText}>Add Manual Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.secondaryBtn]}
          onPress={() => navigation.navigate('BillingCart', { userDoc })}
          disabled={itemCount === 0}
        >
          <Text style={styles.btnText}>Go To Bill ({itemCount} items)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { color: '#fff', marginBottom: 16 },
  topBar: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backText: { color: '#fff', fontSize: 16 },
  cartPreview: { color: '#fff', fontSize: 14 },
  overlay: {
    position: 'absolute',
    bottom: 48,
    left: 16,
    right: 16,
  },
  btn: { padding: 12, alignItems: 'center' },
  primaryBtn: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  secondaryBtn: { backgroundColor: '#0d7377', opacity: 0.9, marginBottom: 0 },
  btnText: { color: '#fff', fontWeight: '600' },
});

export default BillingScannerScreen;
