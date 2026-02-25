import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Share from 'react-native-share';
import { useAtomValue } from 'jotai';
import { purchaseSuccessDataAtom } from '../atoms/purchase';

const PurchaseSuccessScreen = ({ navigation }) => {
  const data = useAtomValue(purchaseSuccessDataAtom);
  const [pdfLoading, setPdfLoading] = useState(false);

  const getHtml = () => {
    const rows = (data?.items || [])
      .map(
        (it) =>
          `<tr><td>${it.name}</td><td>${it.qty}</td><td>${it.purchasePrice}</td><td>${it.amount}</td></tr>`
      )
      .join('');
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: sans-serif; padding: 16px; font-size: 12px; }
h1 { font-size: 18px; margin-bottom: 2px; }
h2 { font-size: 14px; margin: 0 0 12px; color: #333; }
.meta { margin: 2px 0; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
th { background: #f5f5f5; }
.tot { font-weight: bold; margin-top: 6px; }
</style></head>
<body>
<h1>${data?.shopName || 'Shop'}</h1>
<h2>Purchase Invoice</h2>
<p class="meta"><b>Supplier:</b> ${data?.supplierName || '—'}</p>
<p class="meta"><b>Invoice No:</b> ${data?.invoiceNo || '—'}</p>
<p class="meta"><b>Date:</b> ${data?.date || ''}</p>
<table>
<thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>Amt</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p class="tot">Subtotal: ₹${data?.subtotal ?? 0}</p>
<p class="tot">Paid: ₹${data?.paidAmount ?? 0}</p>
<p class="tot">Due: ₹${data?.dueAmount ?? 0}</p>
</body>
</html>`;
  };

  const handleSharePdf = async () => {
    if (!data?.items?.length) {
      Alert.alert('Error', 'No purchase data.');
      return;
    }
    setPdfLoading(true);
    try {
      const { generatePDF } = require('react-native-html-to-pdf');
      const result = await generatePDF({
        html: getHtml(),
        fileName: `purchase_${data.invoiceNo || Date.now()}_${Date.now()}`,
        width: 320,
        height: 650,
        padding: 24,
      });
      if (!result?.filePath) throw new Error('PDF not created');
      const fileUrl = result.filePath.startsWith('file://')
        ? result.filePath
        : `file://${result.filePath}`;
      await Share.open({
        url: fileUrl,
        type: 'application/pdf',
        title: `Purchase_${data.invoiceNo || 'invoice'}`,
        filename: `Purchase_${data.invoiceNo || Date.now()}.pdf`,
      });
    } catch (e) {
      const msg = String(e?.message || '');
      if (!msg.toLowerCase().includes('cancel')) {
        Alert.alert('Error', msg || 'Could not share PDF');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>No purchase found.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.shopName}>{data.shopName}</Text>
        <Text style={styles.title}>Purchase Invoice</Text>
        <Text style={styles.meta}>Supplier: {data.supplierName}</Text>
        <Text style={styles.meta}>Invoice No: {data.invoiceNo}</Text>
        <Text style={styles.meta}>Date: {data.date}</Text>

        <View style={styles.tableHeaderRow}>
          <Text style={[styles.th, { flex: 2 }]}>Product</Text>
          <Text style={[styles.th, { width: 40 }]}>Qty</Text>
          <Text style={[styles.th, { width: 60 }]}>Rate</Text>
          <Text style={[styles.th, { width: 70, textAlign: 'right' }]}>Amt</Text>
        </View>
        {(data.items || []).map((it, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{it.name}</Text>
            <Text style={[styles.td, { width: 40 }]}>{it.qty}</Text>
            <Text style={[styles.td, { width: 60 }]}>{it.purchasePrice}</Text>
            <Text style={[styles.td, { width: 70, textAlign: 'right', fontWeight: '700' }]}>₹{it.amount}</Text>
          </View>
        ))}

        <Text style={styles.total}>Subtotal: ₹{data.subtotal}</Text>
        <Text style={styles.total}>Paid: ₹{data.paidAmount}</Text>
        <Text style={styles.total}>Due: ₹{data.dueAmount}</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, pdfLoading && styles.disabled]}
        onPress={handleSharePdf}
        disabled={pdfLoading}
      >
        <Text style={styles.primaryText}>{pdfLoading ? 'Creating PDF…' : 'Share Purchase PDF'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 24 },
  shopName: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  meta: { fontSize: 13, marginBottom: 2 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 6, marginTop: 12 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 6 },
  th: { fontSize: 11, fontWeight: '700', color: '#333' },
  td: { fontSize: 12, color: '#111' },
  total: { marginTop: 8, fontSize: 14, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { padding: 14, alignItems: 'center' },
  secondaryText: { color: '#1a73e8', fontWeight: '600' },
  disabled: { opacity: 0.6 },
});

export default PurchaseSuccessScreen;

