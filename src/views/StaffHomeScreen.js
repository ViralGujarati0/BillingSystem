// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import useAuthViewModel from '../viewmodels/AuthViewModel';

// const StaffHomeScreen = ({ navigation, route }) => {
//   const { userDoc } = route.params;
//   const { signOut } = useAuthViewModel();

//   const handleSignOut = async () => {
//     await signOut();
//     navigation.replace('Login');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Welcome {userDoc.name}</Text>

//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => navigation.navigate('BillingScanner', { userDoc })}
//       >
//         <Text style={styles.buttonText}>Create Bill</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.button} onPress={handleSignOut}>
//         <Text style={styles.buttonText}>Sign Out</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   text: {
//     fontSize: 20,
//     marginBottom: 20,
//   },

//   button: {
//     backgroundColor: '#1a73e8',
//     padding: 14,
//     borderRadius: 6,
//   },

//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });

// export default StaffHomeScreen;



import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAtomValue } from 'jotai';
import AppHeaderLayout from '../components/AppHeaderLayout';
import { currentStaffAtom } from '../atoms/staff';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ── Quick action config ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    permKey:     'billing',
    permFlat:    true,
    label:       'New Bill',
    description: 'Scan or add items to create a bill',
    icon:        'receipt-outline',
    color:       '#f59e0b',
    navigate:    (nav) => nav.getParent()?.navigate('BillingScanner'),
  },
  {
    permKey:     'sales',
    permSubKey:  'recentBills',
    label:       'View Sales',
    description: 'Check bills and sales summary',
    icon:        'bar-chart-outline',
    color:       '#3b82f6',
    navigate:    (nav) => nav.navigate('StaffSalesTab'),
  },
  {
    permKey:     'stock',
    permSubKey:  'inventoryList',
    label:       'View Stock',
    description: 'Browse and search inventory',
    icon:        'cube-outline',
    color:       '#8b5cf6',
    navigate:    (nav) => nav.navigate('StaffStockTab'),
  },
];

// ── Permission checker ────────────────────────────────────────────────────────
function hasPermission(permissions, key, subKey) {
  if (!permissions) return false;
  if (subKey) return !!permissions[key]?.[subKey];
  return !!permissions[key];
}

// ── Quick action card ─────────────────────────────────────────────────────────
const ActionCard = ({ action, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.actionIconBox, { backgroundColor: action.color + '18' }]}>
      <Icon name={action.icon} size={rfs(24)} color={action.color} />
    </View>
    <View style={styles.actionText}>
      <Text style={styles.actionLabel}>{action.label}</Text>
      <Text style={styles.actionDesc}>{action.description}</Text>
    </View>
    <Icon name="chevron-forward" size={rfs(16)} color={colors.textSecondary} />
  </TouchableOpacity>
);

// ── Locked card ───────────────────────────────────────────────────────────────
const LockedCard = ({ action }) => (
  <View style={[styles.actionCard, styles.actionCardLocked]}>
    <View style={[styles.actionIconBox, { backgroundColor: '#f3f4f6' }]}>
      <Icon name="lock-closed-outline" size={rfs(20)} color="#9ca3af" />
    </View>
    <View style={styles.actionText}>
      <Text style={[styles.actionLabel, { color: '#9ca3af' }]}>{action.label}</Text>
      <Text style={[styles.actionDesc, { color: '#c4c9d4' }]}>Not available — contact owner</Text>
    </View>
  </View>
);

// ── Screen ────────────────────────────────────────────────────────────────────
const StaffHomeScreen = ({ navigation, route }) => {
  const staffFromRoute = route.params?.userDoc;
  const staffFromAtom  = useAtomValue(currentStaffAtom);
  const staff          = staffFromAtom || staffFromRoute;
  const permissions    = staff?.permissions || {};

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const allowedCount = QUICK_ACTIONS.filter((a) =>
    hasPermission(permissions, a.permKey, a.permSubKey)
  ).length;

  return (
    <AppHeaderLayout title="Home">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Welcome card ── */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(staff?.name || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.greetingText}>{greeting()},</Text>
              <Text style={styles.nameText} numberOfLines={1}>{staff?.name || 'Staff'}</Text>
            </View>
          </View>
          <View style={styles.accessPill}>
            <Icon name="shield-checkmark-outline" size={rfs(12)} color={colors.primary} />
            <Text style={styles.accessPillText}>
              {allowedCount} of {QUICK_ACTIONS.length} features enabled
            </Text>
          </View>
        </View>

        {/* ── Quick actions heading ── */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>

        {/* ── Action cards — allowed shown active, others locked ── */}
        <View style={styles.actionsGroup}>
          {QUICK_ACTIONS.map((action) => {
            const allowed = hasPermission(permissions, action.permKey, action.permSubKey);
            return allowed
              ? <ActionCard key={action.permKey} action={action} onPress={() => action.navigate(navigation)} />
              : <LockedCard key={action.permKey} action={action} />;
          })}
        </View>

      </ScrollView>
    </AppHeaderLayout>
  );
};

export default StaffHomeScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(16), paddingTop: rvs(16), paddingBottom: rvs(40), gap: rvs(12) },

  // ── Welcome card ──────────────────────────────────────
  welcomeCard: {
    backgroundColor: '#FFFFFF', borderRadius: rs(16),
    borderWidth: 1, borderColor: colors.borderCard,
    padding: rs(16), gap: rvs(14),
    shadowColor: colors.shadowCard, shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1, shadowRadius: rs(8), elevation: 2,
  },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: rs(12) },
  avatarCircle: {
    width: rs(48), height: rs(48), borderRadius: rs(24),
    backgroundColor: colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: rfs(20), fontWeight: '800', color: colors.primary },
  welcomeText: { flex: 1 },
  greetingText: { fontSize: rfs(12), color: colors.textSecondary, fontWeight: '500' },
  nameText: { fontSize: rfs(17), fontWeight: '800', color: colors.textPrimary, marginTop: rvs(2) },
  accessPill: {
    flexDirection: 'row', alignItems: 'center', gap: rs(5), alignSelf: 'flex-start',
    backgroundColor: colors.primary + '10', borderWidth: 1,
    borderColor: colors.primary + '25', borderRadius: rs(20),
    paddingHorizontal: rs(10), paddingVertical: rvs(5),
  },
  accessPillText: { fontSize: rfs(11), fontWeight: '600', color: colors.primary },

  // ── Section label ─────────────────────────────────────
  sectionLabel: {
    fontSize: rfs(13), fontWeight: '700', color: colors.textPrimary,
    letterSpacing: 0.3, paddingHorizontal: rs(4),
  },

  // ── Action cards ──────────────────────────────────────
  actionsGroup: {
    backgroundColor: '#FFFFFF', borderRadius: rs(16),
    borderWidth: 1, borderColor: colors.borderCard,
    overflow: 'hidden',
    shadowColor: colors.shadowCard, shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1, shadowRadius: rs(8), elevation: 2,
  },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: rs(12),
    paddingHorizontal: rs(16), paddingVertical: rvs(14),
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderCard,
  },
  actionCardLocked: { opacity: 0.55 },
  actionIconBox: { width: rs(44), height: rs(44), borderRadius: rs(12), alignItems: 'center', justifyContent: 'center' },
  actionText: { flex: 1 },
  actionLabel: { fontSize: rfs(14), fontWeight: '700', color: colors.textPrimary },
  actionDesc: { fontSize: rfs(11), color: colors.textSecondary, marginTop: rvs(2) },
});