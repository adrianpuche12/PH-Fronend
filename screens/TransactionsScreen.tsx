import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  SafeAreaView,
  useWindowDimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FormScreen from './FormScreen';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [showFormScreen, setShowFormScreen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showNoChangesModal, setShowNoChangesModal] = useState(false);
  const [modifiedField, setModifiedField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga

  const itemsPerPage = 5; // Número de tarjetas por página

  const BACKEND_URL = 'http://192.168.56.1:8080/transactions';

  // Obtener el ancho de la pantalla dinámicamente
  const { width: screenWidth } = useWindowDimensions();

  // Determinar si es un dispositivo móvil o tablet
  const isMobile = screenWidth < 768;

  // Mapeo de nombres de campos en inglés a español
  const fieldNamesInSpanish: { [key: string]: string } = {
    type: 'Tipo',
    amount: 'Monto',
    date: 'Fecha',
    description: 'Descripción',
  };

  useEffect(() => {
    // Función para obtener las transacciones
    const fetchTransactions = async () => {
      setIsLoading(true); // Activar el estado de carga
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
      } finally {
        setIsLoading(false); // Desactivar el estado de carga
      }
    };

    fetchTransactions();
  }, []);

  // Calcular las transacciones de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Cambiar a la página siguiente
  const goToNextPage = () => {
    if (currentPage < Math.ceil(transactions.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Cambiar a una página específica
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Calcular el rango de páginas para mostrar en el selector
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const maxPagesToShow = screenWidth < 768 ? 5 : screenWidth < 1024 ? 10 : 20; // Máximo de páginas a mostrar en el selector

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

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
    setModifiedField(field); // Actualizar el campo modificado
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
    } finally {
      setShowConfirmation(false); // Ocultar la tarjeta de confirmación después de guardar
      setModifiedField(null); // Reiniciar el campo modificado
    }
  };

  // Función para mostrar la tarjeta de confirmación
  const handleSaveClick = () => {
    if (!modifiedField) {
      // Si no se ha modificado ningún campo, mostrar la tarjeta de "No se han realizado cambios"
      setShowNoChangesModal(true);
      return;
    }
    setShowConfirmation(true);
  };

  // Función para cancelar la confirmación
  const handleCancel = () => {
    setShowConfirmation(false);
    setModifiedField(null); // Reiniciar el campo modificado
  };

  // Función para cerrar la tarjeta de "No se han realizado cambios"
  const handleCloseNoChangesModal = () => {
    setShowNoChangesModal(false);
  };

  if (showFormScreen) {
    return <FormScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>        
        <Text style={styles.title}>Transacciones</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando datos desde la base de datos...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={currentTransactions}
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
                    <TouchableOpacity
                      onPress={handleSaveClick}
                      style={{
                        backgroundColor: '#28a745',
                        padding: 10,
                        borderRadius: 5,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: 'white' }}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.transactionText}>
                      <Text style={styles.boldText}>Tipo:</Text> {item.type}
                    </Text>
                    <Text style={styles.transactionText}>
                      <Text style={styles.boldText}>Monto:</Text> ${item.amount}
                    </Text>
                    <Text style={styles.transactionText}>
                      <Text style={styles.boldText}>Fecha:</Text> {item.date}
                    </Text>
                    <Text style={styles.transactionText}>
                      <Text style={styles.boldText}>Descripción:</Text> {item.description}
                    </Text>
                    <TouchableOpacity
                      onPress={() => startEditing(item)}
                      style={{
                        backgroundColor: '#ffc107',
                        padding: 10,
                        borderRadius: 5,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: 'white' }}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />

          {/* Controles de paginación */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              onPress={goToPreviousPage}
              disabled={currentPage === 1}
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.disabledButton,
              ]}
            >
              <Text style={styles.paginationText}>&lt;</Text>
            </TouchableOpacity>
            {pageNumbers.map((page) => (
              <TouchableOpacity
                key={page}
                onPress={() => goToPage(page)}
                style={[
                  styles.paginationButton,
                  currentPage === page && styles.activeButton,
                ]}
              >
                <Text
                  style={[
                    styles.paginationText,
                    currentPage === page && styles.activeText,
                  ]}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={goToNextPage}
              disabled={currentPage === totalPages}
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.disabledButton,
              ]}
            >
              <Text style={styles.paginationText}>&gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Tarjeta de confirmación */}
          <Modal
            visible={showConfirmation}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowConfirmation(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.confirmationCard}>
                <Text style={styles.confirmationText}>
                  ¿Estás seguro de que quieres modificar el campo "{fieldNamesInSpanish[modifiedField!]}"?
                </Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={{ backgroundColor: '#ff4444', padding: 10, borderRadius: 5, width: '45%' }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={saveTransaction}
                    style={{ backgroundColor: '#28a745', padding: 10, borderRadius: 5, width: '45%' }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Modificar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Tarjeta de "No se han realizado cambios" */}
          <Modal
            visible={showNoChangesModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowNoChangesModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.confirmationCard}>
                <Text style={styles.confirmationText}>
                  No has modificado ningún campo. Por favor, realiza tu modificación.
                </Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    onPress={handleCloseNoChangesModal}
                    style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 5, width: '50%' }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
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
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    flex: 1,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
  },
  confirmationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  confirmationText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
    width: '100%', // Asegura que el contenedor ocupe todo el ancho
  },
  paginationButton: {
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  paginationText: {
    fontSize: 16,
    color: '#555',
  },
  activeButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
});

export default TransactionsScreen;