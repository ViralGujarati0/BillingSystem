import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Camera, useCodeScanner, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useSetAtom } from 'jotai';
import { scannedBarcodeAtom } from '../atoms/owner';

const BarcodeScannerScreen = ({ navigation }) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const setScannedBarcode = useSetAtom(scannedBarcodeAtom);
  const hasScanned = useRef(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  useEffect(() => {
    hasScanned.current = false;
  }, []);

  const onCodeScanned = useCallback(
    (codes) => {
      if (hasScanned.current || !codes.length) return;
      const value = codes[0]?.value;
      if (value) {
        hasScanned.current = true;
        setScannedBarcode(value);
        navigation.goBack();
      }
    },
    [navigation, setScannedBarcode]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a'],
    onCodeScanned: onCodeScanned,
    scanInterval: 500,
  });

  const handleRequestPermission = async () => {
    setRequestingPermission(true);
    try {
      const result = await requestPermission();
      if (!result) {
        Alert.alert(
          'Camera permission denied',
          'To scan barcodes, please enable camera access in your device settings.',
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

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is needed to scan barcodes.</Text>
        <TouchableOpacity
          style={[styles.button, requestingPermission && styles.buttonDisabled]}
          onPress={handleRequestPermission}
          disabled={requestingPermission}
        >
          {requestingPermission ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Grant permission</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={requestingPermission}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No camera device found.</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Point at a barcode to scan</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  hint: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default BarcodeScannerScreen;
