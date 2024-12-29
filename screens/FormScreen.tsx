import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Title } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

const FormScreen = () => {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(); 
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);

  const BACKEND_URL = 'http://192.168.56.1:8080/transactions';

  const handleSubmit = async () => {
    const transactionData = {
      type,
      amount: parseFloat(amount),
      date: date ? date.toISOString().split('T')[0] : null, // Validar que no sea undefined
      description,
    };

    console.log('Datos enviados:', transactionData);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Éxito', 'Transacción registrada correctamente');
        console.log('Respuesta del servidor:', data);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Error al registrar la transacción');
        console.error('Error del servidor:', error);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
      console.error('Error de conexión:', error);
    }
  };

  const onConfirm = (params: { date: Date | undefined }) => {
    setOpen(false);
    setDate(params.date);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Registrar Transacción</Title>
          <TextInput
            label="Tipo (income/expense)"
            value={type}
            onChangeText={setType}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Monto (ej. 100.50)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Fecha"
            value={date ? date.toISOString().split('T')[0] : ''}
            mode="outlined"
            style={styles.input}
            onFocus={() => setOpen(true)}
            showSoftInputOnFocus={false}
          />
          <DatePickerModal
            mode="single"
            visible={open}
            onDismiss={() => setOpen(false)}
            date={date || new Date()}
            onConfirm={onConfirm} // Llamada con el tipo esperado
            locale="es"
          />
          <TextInput
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
          >
            Enviar
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default FormScreen;
