import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function ShopForm({ form, setForm }) {

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View>

      <TextInput
        placeholder="Business Name"
        style={styles.input}
        value={form.businessName}
        onChangeText={(v)=>update('businessName',v)}
      />

      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={form.phone}
        onChangeText={(v)=>update('phone',v)}
      />

      <TextInput
        placeholder="Address"
        style={styles.input}
        value={form.address}
        onChangeText={(v)=>update('address',v)}
      />

      <TextInput
        placeholder="GST Number"
        style={styles.input}
        value={form.gstNumber}
        onChangeText={(v)=>update('gstNumber',v)}
      />

      <TextInput
        placeholder="Bill Message"
        style={styles.input}
        value={form.billMessage}
        onChangeText={(v)=>update('billMessage',v)}
      />

      <TextInput
        placeholder="Bill Terms"
        style={styles.input}
        value={form.billTerms}
        onChangeText={(v)=>update('billTerms',v)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  input:{
    borderWidth:1,
    borderColor:'#ccc',
    padding:12,
    borderRadius:6,
    marginBottom:12
  }
});