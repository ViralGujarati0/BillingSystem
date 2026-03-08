import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { PRODUCT_CATEGORIES } from '../constants/productCategories';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/**
 * CategoryDropdown
 * Props: value, onChange, error (optional)
 */
const CategoryDropdown = ({ value, onChange, error }) => {
  const [focused, setFocused] = useState(false);

  const data = PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c }));

  const borderColor = error
    ? '#E05252'
    : focused
    ? colors.primary
    : colors.borderCard;

  const iconColor = value ? colors.primary : colors.textSecondary;

  return (
    <View style={styles.wrap}>

      {/* Left icon stripe */}
      <View style={[styles.iconBox, { borderColor }]}>
        <Icon name="grid-outline" size={rfs(15)} color={iconColor} />
      </View>

      <Dropdown
        style={[styles.dropdown, { borderColor }]}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        itemTextStyle={styles.itemText}
        itemContainerStyle={styles.itemContainer}
        activeColor="rgba(45,74,82,0.06)"
        containerStyle={styles.dropdownContainer}
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Select category"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(item) => {
          onChange(item.value);
          setFocused(false);
        }}
        renderRightIcon={() => (
          <Icon
            name={focused ? 'chevron-up' : 'chevron-down'}
            size={rfs(14)}
            color={colors.textSecondary}
          />
        )}
      />

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

export default CategoryDropdown;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },

  iconBox: {
    width: rs(44),
    height: rvs(48),
    backgroundColor: 'rgba(45,74,82,0.05)',
    borderWidth: 1,
    borderRightWidth: 0,
    borderTopLeftRadius: rs(12),
    borderBottomLeftRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  dropdown: {
    flex: 1,
    height: rvs(48),
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopRightRadius: rs(12),
    borderBottomRightRadius: rs(12),
    paddingHorizontal: rs(12),
    backgroundColor: '#FFFFFF',
  },

  placeholder: {
    fontSize: rfs(14),
    color: colors.textSecondary,
    fontWeight: '400',
  },

  selectedText: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  itemText: {
    fontSize: rfs(13),
    color: colors.textPrimary,
    fontWeight: '500',
  },

  itemContainer: {
    borderRadius: rs(8),
    marginHorizontal: rs(6),
  },

  dropdownContainer: {
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: 'rgba(26,46,51,0.12)',
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 1,
    shadowRadius: rs(16),
    elevation: 8,
    overflow: 'hidden',
  },

  errorText: {
    position: 'absolute',
    bottom: -rvs(16),
    left: rs(4),
    fontSize: rfs(10),
    color: '#E05252',
    fontWeight: '500',
  },
});