import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { colors } from '../theme/colors';

const ScannerFrame = ({ device, codeScanner }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.frame}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
        <View style={styles.overlayBorder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  frame: {
    width: '90%',
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  overlayBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: 20,
  },
});

export default ScannerFrame;