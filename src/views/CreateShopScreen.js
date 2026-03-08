import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAtom } from 'jotai';

import ShopForm from '../components/ShopForm';
import { createShopFormAtom } from '../atoms/forms';
import { currentOwnerAtom } from '../atoms/owner';

import { createShopAndAssignToOwner } from '../services/shopService';

export default function CreateShopScreen({ navigation }) {

  const [form,setForm] = useAtom(createShopFormAtom);
  const [owner] = useAtom(currentOwnerAtom);

  const handleCreate = async () => {

    if(!form.businessName.trim()){
      Alert.alert("Error","Business name required");
      return;
    }

    await createShopAndAssignToOwner(owner.id,form);

    navigation.replace("OwnerTabs");
  };

  return(
    <View style={styles.container}>

      <Text style={styles.title}>Create Shop</Text>

      <ShopForm form={form} setForm={setForm}/>

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Shop</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles=StyleSheet.create({
container:{flex:1,padding:20,backgroundColor:"#fff"},
title:{fontSize:22,fontWeight:"600",marginBottom:20},
button:{backgroundColor:"#1a73e8",padding:14,borderRadius:6,alignItems:"center"},
buttonText:{color:"#fff",fontWeight:"600"}
});