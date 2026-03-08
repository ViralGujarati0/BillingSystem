import React from 'react';
import { TouchableOpacity,Text,StyleSheet } from 'react-native';

export default function ShopInfoCard({ navigation }){

return(

<TouchableOpacity
style={styles.card}
onPress={()=>navigation.navigate("ShopInfo")}
>

<Text style={styles.title}>Shop Information</Text>
<Text>Tap to view and edit</Text>

</TouchableOpacity>

);
}

const styles=StyleSheet.create({
card:{margin:16,padding:20,backgroundColor:"#fff",borderRadius:10,elevation:2},
title:{fontSize:16,fontWeight:"600"}
});