import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useAtomValue } from "jotai";

import { billSuccessDataAtom } from "../atoms/billing";

import { generateBillPdf } from "../services/pdfService";

import ReceiptHeader from "../components/ReceiptHeader";
import ReceiptInfo from "../components/ReceiptInfo";
import ReceiptTable from "../components/ReceiptTable";
import ReceiptTotals from "../components/ReceiptTotals";
import ReceiptActions from "../components/ReceiptActions";

const BillSuccessScreen = ({ navigation, route }) => {

  const data = useAtomValue(billSuccessDataAtom);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { backScreen = "OwnerTabs", backParams = {} } =
    route.params || {};

  /* ───────── BACK TO HOME ───────── */

  const handleBackToHome = () => {
    navigation.replace(backScreen, backParams);
  };

  /* ───────── CREATE PDF ───────── */

  const handleConvertToPdf = async () => {
    if (!data) return;

    try {

      setPdfLoading(true);

      await generateBillPdf(data);

    } catch (e) {

      Alert.alert("Error", e?.message || "Could not create PDF");

    } finally {

      setPdfLoading(false);

    }
  };

  /* ───────── NO BILL DATA ───────── */

  if (!data) {
    return (
      <View style={styles.center}>

        <Text>No bill data.</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleBackToHome}
        >
          <Text style={styles.btnText}>Back to home</Text>
        </TouchableOpacity>

      </View>
    );
  }

  /* ───────── MAIN UI ───────── */

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.receipt}>

        <ReceiptHeader
          shopName={data.shopName}
          shopAddress={data.shopAddress}
        />

        <ReceiptInfo data={data} />

        <ReceiptTable items={data.items} />

        <ReceiptTotals data={data} />

        <Text style={styles.thanks}>
          {data.thankYouMessage || "Thank you for visiting!"}
        </Text>

      </View>

      <ReceiptActions
        loading={pdfLoading}
        onPdf={handleConvertToPdf}
        onBack={handleBackToHome}
      />

    </ScrollView>

  );
};

export default BillSuccessScreen;

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },

  receipt: {
    backgroundColor: "#fafafa",
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },

  thanks: {
    marginTop: 16,
    textAlign: "center",
    color: "#555",
    fontSize: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  primaryBtn: {
    backgroundColor: "#1a73e8",
    padding: 14,
    borderRadius: 6,
    marginTop: 16,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

});