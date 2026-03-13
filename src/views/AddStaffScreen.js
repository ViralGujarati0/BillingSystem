// import React from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import { useAtom } from 'jotai';
// import { addStaffFormAtom } from '../atoms/forms';
// import { createStaff } from '../services/staffService';

// const AddStaffScreen = ({ navigation }) => {
//   const [form, setForm] = useAtom(addStaffFormAtom);

//   const handleCreate = async () => {
//     try {
//       await createStaff({
//         name: form.name,
//         email: form.email,
//         password: form.password,
//       });
//       Alert.alert('Success', 'Staff created successfully');
//       setForm({ name: '', email: '', password: '' });
//       navigation.goBack();
//     } catch (err) {
//       Alert.alert('Error', err.message);
//     }
//   };

//   return (
//     <View style={styles.container}>

//       <Text style={styles.title}>Create Staff</Text>

//       <TextInput
//         placeholder="Name"
//         style={styles.input}
//         value={form.name}
//         onChangeText={(v) => setForm((prev) => ({ ...prev, name: v }))}
//       />

//       <TextInput
//         placeholder="Email"
//         style={styles.input}
//         value={form.email}
//         onChangeText={(v) => setForm((prev) => ({ ...prev, email: v }))}
//         autoCapitalize="none"
//       />

//       <TextInput
//         placeholder="Password"
//         style={styles.input}
//         value={form.password}
//         onChangeText={(v) => setForm((prev) => ({ ...prev, password: v }))}
//         secureTextEntry
//       />

//       <TouchableOpacity style={styles.button} onPress={handleCreate}>
//         <Text style={styles.buttonText}>Set Staff</Text>
//       </TouchableOpacity>

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 24,
//     justifyContent: 'center',
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: '600',
//     marginBottom: 20,
//     textAlign: 'center',
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 12,
//     borderRadius: 6,
//     marginBottom: 12,
//   },

//   button: {
//     backgroundColor: '#1a73e8',
//     padding: 14,
//     borderRadius: 6,
//     alignItems: 'center',
//   },

//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });

// export default AddStaffScreen;


import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Switch, StyleSheet, Alert, Dimensions, Platform, StatusBar,
} from 'react-native';
import { useAtom } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import { addStaffFormAtom }          from '../atoms/forms';
import { DEFAULT_STAFF_PERMISSIONS } from '../atoms/staff';
import { createStaff }               from '../services/staffService';
import { colors }                    from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));
const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? rvs(24)) : rvs(44);

const PERMISSION_SECTIONS = [
  {
    key: 'billing', label: 'Billing', icon: 'receipt-outline', color: '#f59e0b',
    flat: true, description: 'Allow staff to create new bills using scanner or manual entry',
  },
  {
    key: 'sales', label: 'Sales', icon: 'bar-chart-outline', color: '#3b82f6', flat: false,
    items: [
      { key: 'summaryStrip', label: 'Summary Cards',  description: 'Total sales, profit and bills count' },
      { key: 'calendar',     label: 'Sales Calendar', description: 'Day-wise sales calendar view' },
      { key: 'recentBills',  label: 'Bills List',     description: 'View list of bills for selected date' },
    ],
  },
  {
    key: 'stock', label: 'Stock / Inventory', icon: 'cube-outline', color: '#8b5cf6', flat: false,
    items: [
      { key: 'searchBar',      label: 'Search Bar',       description: 'Search products by name or barcode' },
      { key: 'statsCards',     label: 'Stats Cards',      description: 'Total products, low stock count' },
      { key: 'stockHealth',    label: 'Stock Health Bar', description: 'Visual stock health indicator' },
      { key: 'categoryFilter', label: 'Category Filter',  description: 'Filter inventory by category' },
      { key: 'quickActions',   label: 'Quick Actions',    description: 'Scan, add and create product buttons' },
      { key: 'inventoryList',  label: 'Inventory List',   description: 'View all inventory items' },
    ],
  },
];

const ToggleRow = ({ label, description, value, onToggle, accent }) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleInfo}>
      <Text style={styles.toggleLabel}>{label}</Text>
      {!!description && <Text style={styles.toggleDesc}>{description}</Text>}
    </View>
    <Switch
      value={!!value}
      onValueChange={onToggle}
      trackColor={{ false: colors.borderCard, true: accent + '66' }}
      thumbColor={value ? accent : '#d1d5db'}
      ios_backgroundColor={colors.borderCard}
    />
  </View>
);

const PermissionSection = ({ section, permissions, onToggle }) => {
  if (section.flat) {
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBox, { backgroundColor: section.color + '18' }]}>
            <Icon name={section.icon} size={rfs(16)} color={section.color} />
          </View>
          <Text style={styles.sectionTitle}>{section.label}</Text>
        </View>
        <ToggleRow
          label={`Enable ${section.label}`}
          description={section.description}
          value={!!permissions[section.key]}
          onToggle={(v) => onToggle(section.key, null, v)}
          accent={section.color}
        />
      </View>
    );
  }
  const allEnabled = section.items.every((it) => !!permissions[section.key]?.[it.key]);
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBox, { backgroundColor: section.color + '18' }]}>
          <Icon name={section.icon} size={rfs(16)} color={section.color} />
        </View>
        <Text style={styles.sectionTitle}>{section.label}</Text>
        <TouchableOpacity
          style={[styles.selectAllPill, allEnabled && { backgroundColor: section.color + '18', borderColor: section.color + '40' }]}
          onPress={() => section.items.forEach((it) => onToggle(section.key, it.key, !allEnabled))}
          activeOpacity={0.75}
        >
          <Text style={[styles.selectAllText, allEnabled && { color: section.color }]}>
            {allEnabled ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>
      {section.items.map((item, idx) => (
        <View key={item.key}>
          <ToggleRow
            label={item.label}
            description={item.description}
            value={!!permissions[section.key]?.[item.key]}
            onToggle={(v) => onToggle(section.key, item.key, v)}
            accent={section.color}
          />
          {idx < section.items.length - 1 && <View style={styles.rowDivider} />}
        </View>
      ))}
    </View>
  );
};

const CREDENTIAL_FIELDS = [
  { key: 'name',     label: 'Full Name',     icon: 'person-outline',      placeholder: 'e.g. Ravi Kumar',    secure: false, keyboard: 'default' },
  { key: 'email',    label: 'Email Address', icon: 'mail-outline',         placeholder: 'staff@yourshop.com', secure: false, keyboard: 'email-address' },
  { key: 'password', label: 'Password',      icon: 'lock-closed-outline',  placeholder: 'Min. 6 characters',  secure: true,  keyboard: 'default' },
];

const AddStaffScreen = ({ navigation }) => {
  const [form, setForm] = useAtom(addStaffFormAtom);

  const handleToggle = (sectionKey, itemKey, value) => {
    setForm((prev) => {
      const perms = { ...prev.permissions };
      if (itemKey === null) {
        perms[sectionKey] = value;
      } else {
        perms[sectionKey] = { ...perms[sectionKey], [itemKey]: value };
      }
      return { ...prev, permissions: perms };
    });
  };

  const handleCreate = async () => {
    if (!form.name.trim())        return Alert.alert('Error', 'Name is required');
    if (!form.email.trim())       return Alert.alert('Error', 'Email is required');
    if (!form.password.trim())    return Alert.alert('Error', 'Password is required');
    if (form.password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    try {
      await createStaff({ name: form.name.trim(), email: form.email.trim(), password: form.password, permissions: form.permissions });
      Alert.alert('Success', `${form.name} has been added as staff`);
      setForm({ name: '', email: '', password: '', permissions: DEFAULT_STAFF_PERMISSIONS });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backPill} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Icon name="chevron-back" size={rfs(16)} color="#FFFFFF" />
          <Text style={styles.backPillText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Staff</Text>
        <Text style={styles.headerSub}>Set credentials and access permissions</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: colors.primary + '18' }]}>
              <Icon name="person-outline" size={rfs(16)} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Staff Credentials</Text>
          </View>
          {CREDENTIAL_FIELDS.map((field, idx, arr) => (
            <View key={field.key} style={[styles.fieldGroup, idx === arr.length - 1 && styles.fieldGroupLast]}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={styles.inputBox}>
                <Icon name={field.icon} size={rfs(15)} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textSecondary + '88'}
                  value={form[field.key]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [field.key]: v }))}
                  secureTextEntry={field.secure}
                  autoCapitalize="none"
                  keyboardType={field.keyboard}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <Icon name="shield-checkmark-outline" size={rfs(15)} color={colors.primary} />
          <Text style={styles.sectionHeadingText}>Access Permissions</Text>
        </View>

        {PERMISSION_SECTIONS.map((section) => (
          <PermissionSection key={section.key} section={section} permissions={form.permissions} onToggle={handleToggle} />
        ))}

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.85}>
          <Icon name="person-add-outline" size={rfs(18)} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Create Staff Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddStaffScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: rvs(16), paddingBottom: rvs(48), gap: rvs(12) },
  header: { backgroundColor: colors.primary, paddingTop: STATUS_H + rvs(12), paddingBottom: rvs(24), paddingHorizontal: rs(20) },
  backPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: rs(4), backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: rs(20), paddingHorizontal: rs(12), paddingVertical: rvs(6), marginBottom: rvs(16) },
  backPillText: { fontSize: rfs(13), fontWeight: '600', color: '#FFFFFF' },
  headerTitle: { fontSize: rfs(22), fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: rfs(12), color: 'rgba(255,255,255,0.55)', fontWeight: '500', marginTop: rvs(4) },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: rs(16), borderWidth: 1, borderColor: colors.borderCard, marginHorizontal: rs(16), overflow: 'hidden', shadowColor: colors.shadowCard, shadowOffset: { width: 0, height: rvs(2) }, shadowOpacity: 1, shadowRadius: rs(8), elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(10), paddingHorizontal: rs(16), paddingVertical: rvs(14), borderBottomWidth: 1, borderBottomColor: colors.borderCard },
  sectionIconBox: { width: rs(32), height: rs(32), borderRadius: rs(8), alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: rfs(14), fontWeight: '700', color: colors.textPrimary },
  selectAllPill: { borderWidth: 1, borderColor: colors.borderCard, borderRadius: rs(20), paddingHorizontal: rs(10), paddingVertical: rvs(4) },
  selectAllText: { fontSize: rfs(11), fontWeight: '600', color: colors.textSecondary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16), paddingVertical: rvs(12) },
  toggleInfo: { flex: 1, paddingRight: rs(12) },
  toggleLabel: { fontSize: rfs(13), fontWeight: '600', color: colors.textPrimary },
  toggleDesc: { fontSize: rfs(11), color: colors.textSecondary, marginTop: rvs(2), lineHeight: rfs(16) },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderCard, marginLeft: rs(16) },
  fieldGroup: { paddingHorizontal: rs(16), paddingTop: rvs(14) },
  fieldGroupLast: { paddingBottom: rvs(14) },
  fieldLabel: { fontSize: rfs(11), fontWeight: '700', color: colors.textSecondary, marginBottom: rvs(7), textTransform: 'uppercase', letterSpacing: 0.5 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.borderCard, borderRadius: rs(10), paddingHorizontal: rs(12), height: rvs(46) },
  inputIcon: { marginRight: rs(8) },
  input: { flex: 1, fontSize: rfs(14), color: colors.textPrimary, fontWeight: '500' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: rs(6), paddingHorizontal: rs(20) },
  sectionHeadingText: { fontSize: rfs(13), fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.3 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), backgroundColor: colors.primary, marginHorizontal: rs(16), paddingVertical: rvs(15), borderRadius: rs(14), shadowColor: colors.primary, shadowOffset: { width: 0, height: rvs(4) }, shadowOpacity: 0.30, shadowRadius: rs(10), elevation: 4 },
  createBtnText: { fontSize: rfs(15), fontWeight: '700', color: '#FFFFFF' },
});