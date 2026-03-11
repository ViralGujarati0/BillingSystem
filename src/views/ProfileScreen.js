import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

import AppHeaderLayout        from '../components/AppHeaderLayout';
import ProfileHeader          from '../components/ProfileHeader';
import ShopInfoCard           from '../components/ShopInfoCard';
import StaffManagementCard    from '../components/StaffManagementCard';
import SupplierManagementCard from '../components/SupplierManagementCard';
import PurchaseManagementCard from '../components/PurchaseManagementCard';
import useAuthViewModel       from '../viewmodels/AuthViewModel';
import { colors }             from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

export default function ProfileScreen({ navigation }) {
  const user            = auth().currentUser;
  const { signOut }     = useAuthViewModel();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await signOut();
              navigation.getParent()?.replace('Login');
            } catch (e) {
              console.error('Sign out error:', e);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <AppHeaderLayout title="Profile">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <ProfileHeader
          photoURL={user?.photoURL}
          email={user?.email}
        />

        <ShopInfoCard           navigation={navigation} />
        <StaffManagementCard    navigation={navigation} />
        <SupplierManagementCard navigation={navigation} />
        <PurchaseManagementCard navigation={navigation} />

        {/* ── Sign Out ── */}
        <View style={styles.logoutWrap}>
          <TouchableOpacity
            style={[styles.logoutBtn, loggingOut && styles.logoutBtnDisabled]}
            onPress={handleSignOut}
            disabled={loggingOut}
            activeOpacity={0.85}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#E05252" />
            ) : (
              <>
                <Icon name="log-out-outline" size={rfs(18)} color="#E05252" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({

  scroll: {
    flex: 1,
  },

  content: {
    paddingTop: rvs(16),
    paddingBottom: rvs(48),
  },

  // ── Logout ────────────────────────────────────────────
  logoutWrap: {
    paddingHorizontal: rs(16),
    marginTop: rvs(24),
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    paddingVertical: rvs(14),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.30)',
    backgroundColor: 'rgba(224,82,82,0.06)',
  },

  logoutBtnDisabled: {
    opacity: 0.6,
  },

  logoutText: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: '#E05252',
  },

});