import React from 'react';
import { View, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

import AppHeaderLayout from '../components/AppHeaderLayout';
import ProfileHeader from '../components/ProfileHeader';
import ShopInfoCard from '../components/ShopInfoCard';
import StaffManagementCard from '../components/StaffManagementCard';
import SupplierManagementCard from '../components/SupplierManagementCard';
export default function ProfileScreen({ navigation }) {
  const user = auth().currentUser;

  return (
    <AppHeaderLayout title="Profile">

      <View style={styles.container}>

        <ProfileHeader
          photoURL={user?.photoURL}
          email={user?.email}
        />

        <ShopInfoCard navigation={navigation} />
        <StaffManagementCard navigation={navigation} />
        <SupplierManagementCard navigation={navigation} />

      </View>

    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
});