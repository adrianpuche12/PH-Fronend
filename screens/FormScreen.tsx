import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { TextInput, Button, Card, Title } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { Picker } from '@react-native-picker/picker';
import TransactionsScreen from './TransactionsScreen';
import DynamicFormScreen from './DynamicFormScreen';

const FormScreen = () => {
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [showDynamic, setShowDynamic] = useState(false);
  const [showMessageCard, setShowMessageCard] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const slideAnim = useState(new Animated.Value(-100))[0]; // Inicia fuera de la pantalla

  const BACKEND_URL = 'http://192.168.56.1:8080/transactions';

  const showMessage = (message: string, type: 'success' | 'error') => {
    setMessage(message);
    setMessageType(type);
    setShowMessageCard(true);

    // Animación de entrada
    Animated.timing(slideAnim, {
      toValue: 0, // Desliza hacia la posición 0
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Ocultar después de 3 segundos
    setTimeout(() => hideMessage(), 3000);
  };

  const hideMessage = () => {
    // Animación de salida
    Animated.timing(slideAnim, {
      toValue: -100, // Desliza fuera de la pantalla
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowMessageCard(false));
  };

  const handleSubmit = async () => {
    // Validación de campos vacíos
    if (!type || !amount || !date || !description) {
      showMessage('Todos los campos son obligatorios.', 'error');
      return;
    }

    // Validación del campo amount (solo números, puntos y comas)
    const amountRegex = /^[0-9]+([.,][0-9]{1,2})?$/;
    if (!amountRegex.test(amount)) {
      showMessage('El monto debe ser un número válido (ej. 100.50).', 'error');
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount.replace(',', '.')), // Convertir coma a punto para el backend
      date: date.toISOString().split('T')[0],
      description,
    };

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        showMessage('Transacción registrada correctamente.', 'success');

        // Limpiar todos los campos después de un envío exitoso
        setType('income');
        setAmount('');
        setDate(undefined);
        setDescription('');
      } else {
        const error = await response.json();
        showMessage(error.message || 'Error al registrar la transacción.', 'error');
      }
    } catch (error) {
      showMessage('No se pudo conectar con el servidor.', 'error');
    }
  };

  const onConfirm = (params: { date: Date | undefined }) => {
    setOpen(false);
    setDate(params.date);
  };

  if (showTransaction) {
    return <TransactionsScreen />;
  }

  if (showDynamic) {
    return <DynamicFormScreen />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      

      {/* Contenido desplazable */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Registrar Transacción</Title>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={type}
                onValueChange={(itemValue) => setType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Income" value="income" />
                <Picker.Item label="Expense" value="expense" />
              </Picker>
            </View>
            <TextInput
              label="Monto (ej. 100.50)"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.,]/g, ''))} // Solo permite números, puntos y comas
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
              onConfirm={onConfirm}
              locale="es"
            />
            <TextInput
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
              Enviar
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowTransaction(true)}
              style={styles.button}
            >
              Ver Transaction
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowDynamic(true)}
              style={styles.button}
            >
              Dynamic Form
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Tarjeta de mensajes con animación de slide */}
      {showMessageCard && (
        <Animated.View
          style={[
            styles.messageCard,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card style={messageType === 'success' ? styles.successCard : styles.errorCard}>
            <Card.Content>
              <Title style={styles.messageText}>{message}</Title>
            </Card.Content>
          </Card>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dashboardContainer: {
    position: 'absolute', // Fija el AdminDashboard en la parte superior
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Asegura que esté por encima del contenido
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    marginTop: 80, // Ajusta este valor según la altura de tu AdminDashboard
  },
  card: {
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
    height: 56,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    justifyContent: 'center',
    height: 56,
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  button: {
    marginTop: 16,
  },
  messageCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 2, // Asegura que esté por encima del AdminDashboard
  },
  successCard: {
    backgroundColor: '#4CAF50',
  },
  errorCard: {
    backgroundColor: '#F44336',
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default FormScreen;