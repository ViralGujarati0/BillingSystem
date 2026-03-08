import React,{useEffect,useState} from 'react';
import { View,TouchableOpacity,Text } from 'react-native';
import { useAtom } from 'jotai';

import ShopForm from '../components/ShopForm';
import { currentOwnerAtom } from '../atoms/owner';

import {
getShop,
getShopSettings,
updateShop,
updateShopSettings
} from '../services/shopService';

export default function EditShopInfoScreen({navigation}){

const [owner] = useAtom(currentOwnerAtom);

const [form,setForm] = useState({
businessName:"",
phone:"",
address:"",
gstNumber:"",
billMessage:"",
billTerms:""
});

useEffect(()=>{

async function load(){

const shop = await getShop(owner.shopId);
const settings = await getShopSettings(owner.shopId);

setForm({
businessName:shop.businessName,
phone:shop.phone,
address:shop.address,
gstNumber:shop.gstNumber,
billMessage:settings?.billMessage || "",
billTerms:settings?.billTerms || ""
});

}

load();

},[]);

const save = async()=>{

await updateShop(owner.shopId,{
businessName:form.businessName,
phone:form.phone,
address:form.address,
gstNumber:form.gstNumber
});

await updateShopSettings(owner.shopId,{
billMessage:form.billMessage,
billTerms:form.billTerms
});

navigation.goBack();

};

return(

<View style={{padding:20}}>

<ShopForm form={form} setForm={setForm}/>

<TouchableOpacity onPress={save}>
<Text>Save</Text>
</TouchableOpacity>

</View>

);
}