import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Share from 'react-native-share';
import { useAtomValue } from 'jotai';
import { billSuccessDataAtom } from '../atoms/billing';

const BillSuccessScreen = ({ navigation, route }) => {
  const data = useAtomValue(billSuccessDataAtom);
  const [pdfLoading, setPdfLoading] = useState(false);
  const { backScreen = 'OwnerTabs', backParams = {} } = route.params || {};

  const handleBackToHome = () => {
    navigation.replace(backScreen, backParams);
  };

  const getReceiptHtml = () => {
    if (!data) return '';
    const rows = (data.items || [])
      .map(
        (it, i) =>
          `<tr><td>${i + 1}</td><td>${it.name}</td><td>${it.qty}</td><td>₹${it.rate}</td><td>₹${it.amount}</td></tr>`
      )
      .join('');
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: sans-serif; padding: 16px; font-size: 12px; }
h1 { font-size: 18px; margin-bottom: 4px; }
.sub { color: #555; font-size: 11px; margin-bottom: 16px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
th { background: #f5f5f5; }
.total { font-weight: bold; margin-top: 12px; }
.thanks { margin-top: 20px; text-align: center; color: #555; }
</style></head>
<body>
<h1>${data.shopName || 'Shop'}</h1>
<p class="sub">${data.shopAddress || ''}</p>
<p><b>Customer:</b> ${data.customerName || 'Walk-in'}</p>
<p><b>Bill No:</b> ${data.billNo || '—'}</p>
<p><b>Date:</b> ${data.date || ''}</p>
<p><b>Payment:</b> ${data.paymentType || 'CASH'}</p>
<table>
<thead><tr><th>No</th><th>Product</th><th>Qty</th><th>Rate</th><th>Amt</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p class="total">Grand Total: ₹${data.grandTotal ?? 0}</p>
<p class="thanks">${data.thankYouMessage || 'Thank you!'}</p>
</body>
</html>`;
  };

  const handleConvertToPdf = async () => {
    if (!data) return;
    const html = getReceiptHtml();
    if (!html || !(data.items?.length)) {
      Alert.alert('Error', 'No bill content to convert.');
      return;
    }
    setPdfLoading(true);
    try {
      const { generatePDF } = require('react-native-html-to-pdf');
      const result = await generatePDF({
        html,
        fileName: `bill_${data.billNo || Date.now()}_${Date.now()}`,
        width: 320,
        height: 600,
        padding: 24,
      });
      if (result?.filePath) {
        const fileUrl = result.filePath.startsWith('file://') ? result.filePath : `file://${result.filePath}`;
        try {
          await Share.open({
            url: fileUrl,
            type: 'application/pdf',
            title: `Bill_${data.billNo || 'receipt'}`,
            filename: `Bill_${data.billNo || Date.now()}.pdf`,
          });
          Alert.alert('Done', 'PDF shared.');
        } catch (shareErr) {
          if (shareErr?.message?.toLowerCase().includes('user did not share') || shareErr?.message?.toLowerCase().includes('cancel')) {
            // User closed the share sheet
            return;
          }
          const msg = shareErr?.message || '';
          if (msg.toLowerCase().includes('empty') || msg.toLowerCase().includes('file')) {
            Alert.alert(
              'PDF saved',
              `PDF was created at:\n${result.filePath}\n\nOpen the Files app to find and share it.`
            );
          } else {
            Alert.alert('Share failed', msg || 'You can still find the PDF in your app storage.');
          }
        }
      } else {
        Alert.alert('Error', 'PDF could not be created.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not create PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>No bill data.</Text>
        <TouchableOpacity style={styles.btn} onPress={handleBackToHome}>
          <Text style={styles.btnText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.receipt}>
        <Text style={styles.shopName}>{data.shopName}</Text>
        <Text style={styles.shopAddress}>{data.shopAddress}</Text>
        <Text style={styles.line}>Customer: {data.customerName}</Text>
        <Text style={styles.line}>Bill No: {data.billNo}</Text>
        <Text style={styles.line}>Date: {data.date}</Text>
        <Text style={styles.line}>Payment: {data.paymentType}</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.th, styles.colNo]}>No</Text>
            <Text style={[styles.th, styles.colName]}>Product</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colAmt]}>Amt</Text>
          </View>
          {(data.items || []).map((it, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, styles.colNo]}>{i + 1}</Text>
              <Text style={[styles.td, styles.colName]} numberOfLines={1}>{it.name}</Text>
              <Text style={[styles.td, styles.colQty]}>{it.qty}</Text>
              <Text style={[styles.td, styles.colRate]}>₹{it.rate}</Text>
              <Text style={[styles.td, styles.colAmt]}>₹{it.amount}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.grandTotal}>Grand Total: ₹{data.grandTotal}</Text>
        <Text style={styles.thanks}>{data.thankYouMessage}</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, pdfLoading && styles.btnDisabled]}
        onPress={handleConvertToPdf}
        disabled={pdfLoading}
      >
        <Text style={styles.btnText}>{pdfLoading ? 'Creating PDF…' : 'Convert to PDF'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={handleBackToHome}>
        <Text style={styles.btnTextSecondary}>Back to home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  receipt: { backgroundColor: '#fafafa', padding: 20, borderRadius: 8, marginBottom: 24 },
  shopName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  shopAddress: { fontSize: 12, color: '#555', marginBottom: 12 },
  line: { fontSize: 13, marginBottom: 4 },
  table: { marginVertical: 12 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 6 },
  th: { fontWeight: '600', fontSize: 11 },
  td: { fontSize: 12 },
  colNo: { width: 24 },
  colName: { flex: 1 },
  colQty: { width: 32 },
  colRate: { width: 56 },
  colAmt: { width: 56 },
  grandTotal: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  thanks: { marginTop: 16, textAlign: 'center', color: '#555', fontSize: 12 },
  btn: { padding: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  btnTextSecondary: { color: '#1a73e8', fontWeight: '600' },
  primaryBtn: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  secondaryBtn: { padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
});

export default BillSuccessScreen;
