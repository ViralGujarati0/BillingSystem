import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

export default function SupplierDropdown({ suppliers, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);

  const selected = suppliers.find((s) => s.id === selectedId);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.triggerLeft}>
          <Icon name="business-outline" size={rfs(16)} color="#16a34a" />
          <Text style={[styles.triggerText, !selected && styles.placeholder]}>
            {selected ? selected.name : 'Select supplier'}
          </Text>
        </View>
        <Icon name="chevron-down" size={rfs(16)} color="#aaa" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Supplier</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Icon name="close" size={rfs(20)} color="#aaa" />
              </TouchableOpacity>
            </View>

            {suppliers.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon name="business-outline" size={rfs(36)} color="#ddd" />
                <Text style={styles.emptyText}>No suppliers found</Text>
              </View>
            ) : (
              <FlatList
                data={suppliers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <TouchableOpacity
                      style={[styles.option, isSelected && styles.optionSelected]}
                      onPress={() => {
                        onSelect(item.id);
                        setOpen(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View style={[styles.optionAvatar, isSelected && styles.optionAvatarSelected]}>
                          <Text style={[styles.optionAvatarText, isSelected && styles.optionAvatarTextSelected]}>
                            {item.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                            {item.name}
                          </Text>
                          {!!item.phone && (
                            <Text style={styles.optionMeta}>{item.phone}</Text>
                          )}
                        </View>
                      </View>
                      {isSelected && (
                        <Icon name="checkmark-circle" size={rfs(18)} color="#16a34a" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            )}

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: rs(10),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(13),
    backgroundColor: '#fafafa',
    marginBottom: rvs(16),
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  triggerText: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: '#111',
  },
  placeholder: {
    color: '#bbb',
    fontWeight: '400',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    paddingTop: rvs(16),
    paddingBottom: rvs(32),
    maxHeight: SCREEN_H * 0.6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(20),
    paddingBottom: rvs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: rvs(8),
  },
  sheetTitle: {
    fontSize: rfs(16),
    fontWeight: '700',
    color: '#111',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: rvs(32),
    gap: rvs(10),
  },
  emptyText: {
    fontSize: rfs(14),
    color: '#aaa',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(20),
    paddingVertical: rvs(12),
  },
  optionSelected: {
    backgroundColor: '#f0fdf4',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  optionAvatar: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionAvatarSelected: {
    backgroundColor: '#dcfce7',
  },
  optionAvatarText: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: '#16a34a',
  },
  optionAvatarTextSelected: {
    color: '#15803d',
  },
  optionName: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: '#111',
  },
  optionNameSelected: {
    color: '#15803d',
  },
  optionMeta: {
    fontSize: rfs(11),
    color: '#888',
    marginTop: rvs(1),
  },
});