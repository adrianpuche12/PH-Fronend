import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import DynamicFormScreen from '@/screens/DynamicFormScreen';
import LogoutButton from '@/components/LogoutButton';
import { useAuth } from '@/context/AuthContext';

const UserDashboard = () => {
  const { roles, userName } = useAuth();
  return (
    <View style={styles.container}>
      {/* Botón de Logout */}
      <LogoutButton />

      {/* Header con bienvenida */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenido, {userName}</Text>
      </View>

      {/* Contenido principal */}
      <DynamicFormScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E1F3',
    width: '100%',
    height: '100%',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
});

export default UserDashboard;