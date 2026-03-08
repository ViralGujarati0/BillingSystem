import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

const ProfileHeader = ({ photoURL, email }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      
      <Image
        source={{ uri: photoURL }}
        style={styles.avatar}
      />

      <Text style={[styles.email, { color: colors.text }]}>
        {email}
      </Text>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    elevation: 3, // android shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
  },

  email: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileHeader;