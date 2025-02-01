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
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button, Snackbar, Checkbox } from 'react-native-paper';
import FormScreen from './FormScreen';
import ResponsiveButton from '@/components/ui/responsiveButton';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [showFormScreen, setShowFormScreen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showNoChangesModal, setShowNoChangesModal] = useState(false);
  const [modifiedField, setModifiedField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const itemsPerPage = 5;
  const BACKEND_URL = 'http://192.168.56.1:8080/transactions'; // Cambia esto si es necesario
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  const fieldNamesInSpanish: { [key: string]: string } = {
    type: 'Tipo',
    amount: 'Monto',
    date: 'Fecha',
    description: 'Descripción',
  };

  // Función para crear nueva transacción
  const handleCreateNew = () => {
    setShowFormScreen(true);
  };

  // Función para eliminar transacción
  const handleDelete = async (transaction: any) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
  
    try {
      const response = await fetch(`${BACKEND_URL}/${transactionToDelete.id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        await fetchTransactions(); // Actualizar la lista después de eliminar
        Alert.alert('Éxito', 'Transacción eliminada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo eliminar la transacción');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión al intentar eliminar');
    } finally {
      setShowDeleteConfirmation(false);
      setTransactionToDelete(null);
    }
  };

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
  
  useEffect(() => {
    fetchTransactions();
  }, []); // Array vacío para ejecutar solo al montar

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < Math.ceil(filteredTransactions.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const maxPagesToShow = screenWidth < 768 ? 5 : screenWidth < 1024 ? 10 : 20;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handleFilterChange = (newFilter: 'all' | 'income' | 'expense') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const startEditing = (transaction: any) => {
    setEditingTransaction(transaction);
  };

  const handleChange = (field: string, value: string) => {
    setEditingTransaction((prevState: any) => ({
      ...prevState,
      [field]: value,
    }));
    setModifiedField(field);
  };

  const saveTransaction = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTransaction),
      });
  
      if (response.ok) {
        const updatedTransaction = await response.json();
        setTransactions((prevState: any) =>
          prevState.map((transaction: any) =>
            transaction.id === editingTransaction.id ? updatedTransaction : transaction
          )
        );
        setEditingTransaction(null);
      } else {
        console.error('Error al actualizar la transacción', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar la transacción', error);
    } finally {
      setShowConfirmation(false);
      setModifiedField(null);
    }
  };

  const handleSaveClick = () => {
    if (!modifiedField) {
      setShowNoChangesModal(true);
      return;
    }
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setModifiedField(null);
  };

  const handleCloseNoChangesModal = () => {
    setShowNoChangesModal(false);
  };

  const handleDeleteRequest = (transaction: any) => {
    console.log('Solicitud de borrado:', transaction); // Depuración

    Alert.alert(
      'Confirmar Borrado',
      `¿Estás seguro de que quieres borrar esta transacción?\n\nTipo: ${transaction.type}\nMonto: $${transaction.amount}\nFecha: ${transaction.date}\nDescripción: ${transaction.description}`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => console.log('Borrado cancelado') },
        { 
          text: 'Borrar', 
          style: 'destructive', 
          onPress: () => {
            console.log('Confirmado borrado de la transacción:', transaction.id); // Depuración
            deleteTransaction(transaction.id);
          } 
        },
      ],
      { cancelable: true }
    );
  };

  const deleteTransaction = async (id: number) => {
    console.log('Iniciando borrado de la transacción con ID:', id); // Depuración

    try {
      const response = await fetch(`${BACKEND_URL}/${id}`, { 
        method: 'DELETE',
      });

      console.log('Respuesta del servidor:', response); // Depuración

      if (!response.ok) {
        const errorMessage = await response.text(); // Obtener mensaje del backend si lo hay
        console.error('Error al borrar la transacción:', errorMessage);
        Alert.alert('Error', `No se pudo borrar la transacción. \nDetalles: ${errorMessage}`);
        return;
      }

      // Si la respuesta es exitosa, actualiza el estado de las transacciones
      setTransactions((prevState: any) => prevState.filter((transaction: any) => transaction.id !== id));
      Alert.alert('Éxito', 'La transacción ha sido borrada correctamente.');
    } catch (error) {
      console.error('Error al borrar la transacción:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar borrar la transacción.');
    } finally {
      setTransactionToDelete(null);
    }
  };

  if (showFormScreen) {
  return <FormScreen onClose={() => {
    setShowFormScreen(false);
    fetchTransactions();
    setShowSuccessMessage(true);
  }} />;
}

return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transacciones</Text>
        <ResponsiveButton title="Crear Nueva Transacción" onPress={() => setShowFormScreen(true)} mode='contained' />
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando datos desde la base de datos...</Text>
        </View>
      ) : (
        <>
          <View style={styles.filterContainer}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={filter === 'all' ? 'checked' : 'unchecked'}
                onPress={() => handleFilterChange('all')}
                color="#007bff"
              />
              <Text style={styles.filterText}>Todos</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={filter === 'income' ? 'checked' : 'unchecked'}
                onPress={() => handleFilterChange('income')}
                color="#007bff"
              />
              <Text style={styles.filterText}>Ingresos</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={filter === 'expense' ? 'checked' : 'unchecked'}
                onPress={() => handleFilterChange('expense')}
                color="#007bff"
              />
              <Text style={styles.filterText}>Egresos</Text>
            </View>
          </View>
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
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        onPress={() => startEditing(item)}
                         style={{
                          backgroundColor: '#107aff',
                          padding: 10,
                          borderRadius: 5,
                          alignItems: 'center',
                          flex: 1,
                          marginRight: 5,
                        }}
                      >
                        <Text style={{ color: 'white' }}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.buttonText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />

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

          {/* Modal de confirmación de eliminación */}
          <Modal
            visible={showDeleteConfirmation}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDeleteConfirmation(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.confirmationCard}>
                <Text style={styles.confirmationText}>
                  ¿Estás seguro de que quieres eliminar esta transacción?
                </Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    onPress={() => setShowDeleteConfirmation(false)}
                    style={{ backgroundColor: '#6c757d', padding: 10, borderRadius: 5, width: '45%' }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmDelete}
                    style={{ backgroundColor: '#dc3545', padding: 10, borderRadius: 5, width: '45%' }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
      <Snackbar
        visible={showSuccessMessage}
        onDismiss={() => setShowSuccessMessage(false)}
        duration={3000}
        style={{ backgroundColor: '#4CAF50' }}
      >
        Transacción registrada correctamente
      </Snackbar>
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
    flexDirection: 'column',
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
  createButton: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#28a745',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeFilter: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterText: {
    fontSize: 16,
    color: '#555',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    width: '100%',
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default TransactionsScreen;