import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAtomValue } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';
import { colors } from '../theme/colors';
import CreateBillButton from '../components/CreateBillButton';
import RecentBillsList from '../components/RecentBillsList';

const SalesScreen = ({ navigation }) => {
  const owner = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;

    const unsubscribe = firestore()
      .collection('billing_shops')
      .doc(shopId)
      .collection('bills')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setBills(list);
        setLoading(false);
      });

    return unsubscribe;
  }, [shopId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales</Text>

      <CreateBillButton
        onPress={() =>
          navigation.navigate('BillingScanner', { userDoc: owner })
        }
      />

      <Text style={styles.sectionTitle}>Recent Bills</Text>

      <RecentBillsList
        bills={bills}
        loading={loading}
        onPressBill={(bill) => {
          // Later: navigate to Bill Details screen
          console.log('Open bill:', bill.billNo);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
});

export default SalesScreen;