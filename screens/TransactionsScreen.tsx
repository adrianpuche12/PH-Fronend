import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Importa el Picker
import FormScreen from './FormScreen';


const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [showFormScreen, setShowFormScreen] = useState(false)

  const BACKEND_URL = 'http://192.168.56.1:8080/transactions';  // URL para obtener las transacciones

  useEffect(() => {
    // Función para obtener las transacciones
    const fetchTransactions = async () => {
      try {
        const response = await fetch(BACKEND_URL); 
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          console.error('Error al obtener las transacciones', response.statusText);
        }
      } catch (error) {
        console.error('Error al obtener las transacciones', error);
      }
    };

    fetchTransactions();
  }, []);

  // Función para manejar el inicio de la edición
  const startEditing = (transaction: any) => {
    setEditingTransaction(transaction);
  };

  // Función para manejar la actualización de los campos
  const handleChange = (field: string, value: string) => {
    setEditingTransaction((prevState: any) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Función para guardar los cambios y enviar los datos al backend
  const saveTransaction = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/${editingTransaction.id}`, {
        method: 'PUT', // Usando 'PUT' para actualizar la transacción
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTransaction),
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        // Actualizar la lista de transacciones con la transacción actualizada
        setTransactions((prevState: any) =>
          prevState.map((transaction: any) =>
            transaction.id === editingTransaction.id ? updatedTransaction : transaction
          )
        );
        setEditingTransaction(null); // Cerrar el formulario de edición
      } else {
        console.error('Error al actualizar la transacción', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar la transacción', error);
    }
  };

  if (showFormScreen) {
    return <FormScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Go back" 
          color="#007AFF"
          onPress={() => setShowFormScreen(true)} 
        />
        <Text style={styles.title}>Transacciones</Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            {editingTransaction && editingTransaction.id === item.id ? (
              <View>
                <Picker
                  selectedValue={editingTransaction.type}
                  onValueChange={(itemValue) => handleChange('type', itemValue)}
                  style={styles.input}
                >
                  <Picker.Item label="Income" value="income" />
                  <Picker.Item label="Expense" value="expense" />
                </Picker>

                <TextInput
                  style={styles.input}
                  value={editingTransaction.amount.toString()}
                  onChangeText={(text) => handleChange('amount', text)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  value={editingTransaction.date}
                  onChangeText={(text) => handleChange('date', text)}
                />
                <TextInput
                  style={styles.input}
                  value={editingTransaction.description}
                  onChangeText={(text) => handleChange('description', text)}
                />
                <Button title="Guardar" onPress={saveTransaction} />
              </View>
            ) : (
              <View>
                <Text style={styles.transactionText}><Text style={styles.boldText}>Tipo:</Text> {item.type}</Text>
                <Text style={styles.transactionText}><Text style={styles.boldText}>Monto:</Text> ${item.amount}</Text>
                <Text style={styles.transactionText}><Text style={styles.boldText}>Fecha:</Text> {item.date}</Text>
                <Text style={styles.transactionText}><Text style={styles.boldText}>Descripción:</Text> {item.description}</Text>
                <Button title="Editar" onPress={() => startEditing(item)} />
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Asegura que el contenido del header esté centrado
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center', // Asegura que el texto esté centrado
    flex: 1,  // Asegura que el título ocupe el espacio disponible
  },
  transactionCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    width: '100%',
  },
  transactionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

export default TransactionsScreen;
