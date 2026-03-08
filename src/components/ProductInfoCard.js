import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProductInfoCard({ product, barcode, inventory }) {
  return (
    <View style={styles.card}>

      <InfoRow label="Barcode"  value={product?.barcode || barcode} />
      <InfoRow label="Name"     value={product?.name} />
      <InfoRow label="Category" value={product?.category} />
      <InfoRow label="Brand"    value={product?.brand} />
      <InfoRow label="Unit"     value={product?.unit} />
      <InfoRow label="MRP"      value={product?.mrp != null ? `₹${product.mrp}` : null} />
      <InfoRow label="GST"      value={product?.gstPercent != null ? `${product.gstPercent}%` : null} />

      {inventory && (
        <>
          <View style={styles.divider} />
          <InfoRow label="Selling Price" value={`₹${inventory.sellingPrice}`} highlight />
          <InfoRow label="Stock"         value={String(inventory.stock ?? 0)} highlight />
          {!!inventory.expiry && (
            <InfoRow label="Expiry" value={inventory.expiry} />
          )}
        </>
      )}

    </View>
  );
}

function InfoRow({ label, value, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: '#888',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    flex: 1,
    textAlign: 'right',
  },
  valueHighlight: {
    color: '#1a73e8',
    fontWeight: '700',
  },
});