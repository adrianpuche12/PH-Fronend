import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';  
import { Button, IconButton } from 'react-native-paper';  
import TransactionsScreen from './TransactionsScreen';
import DynamicFormScreen from './DynamicFormScreen';
import FormScreen from './FormScreen';
import AdminScreen from './AdminScreen';

const AdminDashboard = () => {
  const [activeScreen, setActiveScreen] = useState<'transactions' | 'dynamic' | 'form' | 'admin' | null>(null);

  return (
    <View style={styles.container}>
      {/* Botón de Home */}
      <IconButton
        icon="home"  
        size={24}  
        onPress={() => setActiveScreen(null)}  // Al hacer clic, regresa al dashboard (pantalla principal)
        style={styles.homeButton}
      />

      {/* Botones fijos arriba */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => setActiveScreen('form')}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Registrar Transacción
        </Button>

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

        <Button
          mode="contained"
          onPress={() => setActiveScreen('dynamic')}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Formulario Dinámico
        </Button>
      </View>

      {/* Contenido dinámico abajo */}
      <View style={[styles.contentContainer, activeScreen === 'form' && styles.formScreenAdjustment]}>
        {activeScreen === 'transactions' && <TransactionsScreen />}
        {activeScreen === 'dynamic' && <DynamicFormScreen />}
        {activeScreen === 'form' && <FormScreen />}
        {activeScreen === 'admin' && <AdminScreen />}
        {activeScreen === null && (  // Si no hay ninguna pantalla activa, muestra el dashboard
          <View style={styles.dashboardContainer}>
            <Text style={styles.dashboardText}>Bienvenido al Panel de Administrador</Text>  {/* Asegúrate de tener el texto visible */}
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
  formScreenAdjustment: {
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  dashboardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  dashboardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',  // Asegúrate de que el texto sea visible
  },
});

export default AdminDashboard;
