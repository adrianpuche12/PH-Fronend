import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';  
import { Button, IconButton } from 'react-native-paper';  
import { router } from 'expo-router';
import TransactionsScreen from './TransactionsScreen';
import AdminScreen from './AdminScreen';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [activeScreen, setActiveScreen] = useState<'transactions' | 'admin' | null>(null);
  const { userName } = useAuth();

  return (
    <View style={styles.container}>
      {/* Botón de Home */}
      <IconButton
        icon="home"  
        size={24}  
        onPress={() => setActiveScreen(null)}
        style={styles.homeButton}
      />

      {/* Botón de Logout */}
      <LogoutButton />

      {/* Botones fijos arriba */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => setActiveScreen('transactions')}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Transacciones
        </Button>

        <Button
          mode="contained"
          onPress={() => setActiveScreen('admin')}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Operaciones
        </Button>
      </View>

      {/* Contenido dinámico abajo */}
      <View style={styles.contentContainer}>
        {activeScreen === 'transactions' && <TransactionsScreen />}
        {activeScreen === 'admin' && <AdminScreen />}
        {activeScreen === null && (
          <View style={styles.dashboardContainer}>
            <Text style={styles.welcomeText}>Bienvenido, {userName}</Text>
            <Text style={styles.dashboardText}>Panel de Administrador</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E1F3',  
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
  homeButton: {
    position: 'absolute', 
    top: 3,
    left: 10,
    zIndex: 10, 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 0,
    elevation: 3,
    shadowColor: '',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  button: {
    flex: 1,
    borderRadius: 0,
    marginHorizontal: 0,
    backgroundColor: '#E8E1F2', 
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
    justifyContent: 'flex-start',
  },
  dashboardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  dashboardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AdminDashboard;