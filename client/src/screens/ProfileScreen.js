import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';

const ProfileScreen = () => {
  const { user, logout } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>
        {user?.profile?.displayName ? (
          <>
            <Text style={styles.label}>Display Name:</Text>
            <Text style={styles.value}>{user.profile.displayName}</Text>
          </>
        ) : null}
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f4e3', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#5D4037', marginBottom: 32 },
  infoBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 32, width: '100%', maxWidth: 340 },
  label: { color: '#967259', fontWeight: 'bold', fontSize: 16, marginTop: 8 },
  value: { color: '#5D4037', fontSize: 16, marginBottom: 4 },
  logoutButton: { backgroundColor: '#967259', borderRadius: 8, padding: 14, alignItems: 'center', width: '100%', maxWidth: 340 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
