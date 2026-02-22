import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCodeScanner, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useAtomValue, useSetAtom } from 'jotai';
import { billingCartItemsAtom } from '../atoms/billing';
import { getProductByBarcode, getInventoryItem } from '../services/firestore';

const BillingScannerScreen = ({ navigation, route }) => {
  const { userDoc } = route.params || {};
  const shopId = userDoc?.shopId;
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cartItems = useAtomValue(billingCartItemsAtom);
  const setCartItems = useSetAtom(billingCartItemsAtom);
  const hasScanned = useRef(false);
  const scanningRef = useRef(false);

  useEffect(() => {
    hasScanned.current = false;
  }, []);

  const addToCart = useCallback(
    (item) => {
      setCartItems((prev) => {
        const existing = prev.find(
          (i) => i.type === 'BARCODE' && i.barcode === item.barcode
        );
        if (existing) {
          const newQty = existing.qty + item.qty;
          const newAmount = newQty * item.rate;
          return prev.map((i) =>
            i.type === 'BARCODE' && i.barcode === item.barcode
              ? { ...i, qty: newQty, amount: newAmount }
              : i
          );
        }
        return [...prev, item];
      });
    },
    [setCartItems]
  );

  const onCodeScanned = useCallback(
    async (codes) => {
      if (scanningRef.current || !codes.length || !shopId) return;
      const barcode = codes[0]?.value;
      if (!barcode) return;
      scanningRef.current = true;
      hasScanned.current = true;
      try {
        const [product, inventory] = await Promise.all([
          getProductByBarcode(barcode),
          getInventoryItem(shopId, barcode),
        ]);
        if (!product) {
          Alert.alert('Not found', 'Product not in catalog.');
          return;
        }
        if (!inventory) {
          Alert.alert('Not in inventory', 'Add this product to your shop inventory first.');
          return;
        }
        const stock = inventory.stock ?? 0;
        const rate = inventory.sellingPrice ?? product.mrp ?? 0;
        const currentQty = cartItems.find(
          (i) => i.type === 'BARCODE' && i.barcode === barcode
        )?.qty ?? 0;
        if (currentQty + 1 > stock) {
          Alert.alert('Out of stock', `Only ${stock} available.`);
          return;
        }
        addToCart({
          type: 'BARCODE',
          barcode: product.id || barcode,
          name: product.name || 'Item',
          qty: 1,
          rate,
          mrp: product.mrp ?? rate,
          amount: rate,
        });
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        scanningRef.current = false;
        hasScanned.current = false;
      }
    },
    [shopId, cartItems, addToCart, setCartItems]
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
