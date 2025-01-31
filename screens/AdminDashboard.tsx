import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import TransactionsScreen from './TransactionsScreen';
import DynamicFormScreen from './DynamicFormScreen';
import FormScreen from './FormScreen';
import AdminScreen from './AdminScreen';

const AdminDashboard = () => {
  const [activeScreen, setActiveScreen] = useState<'transactions' | 'dynamic' | 'form' | 'admin' | null>(null);

  return (
    <View style={styles.container}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10, // Reducir espacio con la parte superior
    paddingBottom: 0, // Para mantener una separación entre los botones y el contenido
    elevation: 3,
    shadowColor: '',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  button: {
    flex: 1, // Los botones ocupan el mismo ancho
    borderRadius: 0, // Botones rectangulares
    marginHorizontal: 0, // Un pequeño espacio entre los botones
    backgroundColor: '#E8E1F2', // Gris muy, muy pálido con un toque de violeta
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000', // Color del texto en negro
  },
  contentContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
    justifyContent: 'center',
  },
  formScreenAdjustment: {
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
});

export default AdminDashboard;
