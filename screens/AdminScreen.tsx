import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  type ViewStyle,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { useFocusEffect } from '@react-navigation/native';
import LogoutButton from '@/components/LogoutButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { REACT_APP_API_URL } from '../config';
import { format, parseISO } from 'date-fns';

// Actualizamos la interfaz para incluir los nuevos tipos
interface Transaction {
  id: number;
  type: 'CLOSING' | 'SUPPLIER' | 'SALARY' | 'income' | 'expense';
  amount: number;
  date?: string;
  description?: string;
  username?: string;
  closingsCount?: number;
  periodStart?: string;
  periodEnd?: string;
  supplier?: string;
  depositDate?: string;
  paymentDate?: string;
}


const ITEMS_PER_PAGE = 5;




// y considera egresos de tipo SUPPLIER, SALARY y expense.
const BalanceCard = ({ transactions }: { transactions: Transaction[] }) => {
  const ingresos = transactions
    .filter(tx => tx.type === 'CLOSING' || tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const egresos = transactions
    .filter(tx => tx.type === 'SUPPLIER' || tx.type === 'SALARY' || tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const total = ingresos - egresos;

  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceTitle}>Balance General</Text>
      <View style={styles.balanceRow}>
        <MaterialCommunityIcons name="arrow-down-bold-circle-outline" size={20} color="#4CAF50" />
        <Text style={styles.balanceLabel}>Ingresos:</Text>
        <Text style={styles.balanceValue}>{'$' + ingresos.toFixed(2)}</Text>
      </View>
      <View style={styles.balanceRow}>
        <MaterialCommunityIcons name="arrow-up-bold-circle-outline" size={20} color="#F44336" />
        <Text style={styles.balanceLabel}>Egresos:</Text>
        <Text style={styles.balanceValue}>{'$' + egresos.toFixed(2)}</Text>
      </View>
      <View style={styles.balanceRow}>
        <MaterialCommunityIcons name="calculator-variant" size={20} color="#2196F3" />
        <Text style={styles.balanceLabel}>Total:</Text>
        <Text style={styles.balanceValue}>{'$' + total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const AdminScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDateInput, setSelectedDateInput] = useState<'start' | 'end'>('start');
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para el modal de edición
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [datePickerEditVisible, setDatePickerEditVisible] = useState(false);
  const [dateEditField, setDateEditField] = useState<'date' | 'periodStart' | 'periodEnd'>('date');

  // Campos para editar
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newClosingsCount, setNewClosingsCount] = useState('');
  const [newPeriodStart, setNewPeriodStart] = useState('');
  const [newPeriodEnd, setNewPeriodEnd] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

  // Snackbar
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Estados para la eliminación (modal)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const { width: screenWidth } = useWindowDimensions();
  const isLargeScreen = screenWidth >= 768;

  // Función para obtener datos de dos endpoints y unificarlos.
  // Se filtra también la parte de /transactions según el rango de fechas.
  const fetchData = async (start?: Date, end?: Date) => {
    setLoading(true);
    try {
      // Se obtienen las operaciones desde el endpoint de operaciones.
      let urlOperations = `${REACT_APP_API_URL}/api/operations/all`;
      if (start && end) {
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        urlOperations += `?startDate=${startStr}&endDate=${endStr}`;
      }
      const responseOps = await fetch(urlOperations);
      let operationsData: Transaction[] = [];
      
      if (responseOps.ok) {
        operationsData = await responseOps.json();
        operationsData = operationsData.map(op => {
          const newOp = { ...op };
          
          if (op.type === 'CLOSING' && op.depositDate) {
            newOp.date = op.depositDate;
          } else if (op.type === 'SUPPLIER' && op.paymentDate) {
            newOp.date = op.paymentDate;
          } else if (op.type === 'SALARY' && op.depositDate) {
            newOp.date = op.depositDate;
          }
          
          return newOp;
        });
      }
      
      const urlTransactions = `${REACT_APP_API_URL}/transactions`;
      const responseTrans = await fetch(urlTransactions);
      let transactionsData: Transaction[] = [];
      
      if (responseTrans.ok) {
        transactionsData = await responseTrans.json();
        
        if (start && end) {
          transactionsData = transactionsData.filter(tx => {
            if (!tx.date) return false;
            
            try {
              const txDate = new Date(tx.date);
              if (isNaN(txDate.getTime())) return false;
              
              return txDate >= start && txDate <= end;
            } catch (error) {
              console.warn('Error al procesar fecha:', tx.date, error);
              return false;
            }
          });
        }
      }
      // Se unen ambos arreglos
      const merged = [...operationsData, ...transactionsData];
      setTransactions(merged);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error al cargar las transacciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(startDate, endDate);
    }, [startDate, endDate])
  );

  const onDismissDatePicker = () => {
    setDatePickerOpen(false);
  };

  const onConfirmDate = ({ date }: { date: Date | undefined }) => {
    setDatePickerOpen(false);
    if (date) {
      if (selectedDateInput === 'start') {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };
  
  const onConfirmEditDate = ({ date }: { date: Date | undefined }) => {
    if (!date) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    if (dateEditField === 'date') {
      setNewDate(formattedDate);
    } else if (dateEditField === 'periodStart') {
      setNewPeriodStart(formattedDate);
    } else if (dateEditField === 'periodEnd') {
      setNewPeriodEnd(formattedDate);
    }
    
    setDatePickerEditVisible(false);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '';
    try {
      if (typeof date === 'string') {
        return format(parseISO(date), 'yyyy-MM-dd');
      }
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error al formatear la fecha:', error, date);
      return String(date);
    }
  };

  // Paginación
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const maxPagesToShow = screenWidth < 768 ? 5 : screenWidth < 1024 ? 10 : 20;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // ----------------------- PROCESO DE ELIMINACIÓN -----------------------
  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      let url = '';
      // Para income y expense se usa el endpoint de transactions; para los demás, el de operaciones.
      if (transactionToDelete.type === 'income' || transactionToDelete.type === 'expense') {
        url = `${REACT_APP_API_URL}/transactions/${transactionToDelete.id}`;
      } else {
        url = `${REACT_APP_API_URL}/api/operations/${transactionToDelete.type}/${transactionToDelete.id}`;
      }
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        setSnackbarMessage('La transacción ha sido eliminada correctamente.');
        setSnackbarVisible(true);
        fetchData(startDate, endDate);
      } else {
        Alert.alert('Error', 'No se pudo eliminar la transacción.');
      }
    } catch (error) {
      console.error('Error al eliminar la transacción:', error);
      Alert.alert('Error', 'Ocurrió un error al eliminar la transacción.');
    } finally {
      setShowDeleteConfirmation(false);
      setTransactionToDelete(null);
    }
  };
  // -----------------------------------------------------------------------

  // Función para editar: se llenan los campos del modal
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setNewAmount(transaction.amount.toString());
    
    let dateValue = '';
    if (transaction.type === 'CLOSING' || transaction.type === 'SALARY') {
      dateValue = transaction.date || '';
    } else if (transaction.type === 'SUPPLIER') {
      dateValue = transaction.date || '';
    } else {
      dateValue = transaction.date || '';
    }
    
    setNewDate(dateValue);
    setNewDescription(transaction.description ?? '');
    setNewUsername(transaction.username ?? '');
    setNewClosingsCount(
      transaction.closingsCount !== undefined ? transaction.closingsCount.toString() : ''
    );
    setNewPeriodStart(transaction.periodStart ?? '');
    setNewPeriodEnd(transaction.periodEnd ?? '');
    setNewSupplier(transaction.supplier ?? '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount)) {
      Alert.alert('Error', 'Por favor ingrese un monto válido.');
      return;
    }
    let updatedTransaction: any = {};
    switch (editingTransaction.type) {
      case 'CLOSING': {
        updatedTransaction = {
          amount: parsedAmount,
          depositDate: newDate,
          periodStart: newPeriodStart,
          periodEnd: newPeriodEnd,
          username: newUsername,
        };
        break;
      }
      case 'SUPPLIER': {
        if (newUsername.trim() === '') {
          Alert.alert('Error', 'El nombre de usuario es obligatorio.');
          return;
        }
        updatedTransaction = {
          amount: parsedAmount,
          paymentDate: newDate,
          supplier: newSupplier,
          username: newUsername,
        };
        break;
      }
      case 'SALARY': {
        updatedTransaction = {
          amount: parsedAmount,
          depositDate: newDate,
          description: newDescription,
          username: newUsername,
        };
        break;
      }
      case 'income':
      case 'expense': {
        updatedTransaction = {
          type: editingTransaction.type,
          amount: parsedAmount,
          date: newDate,
          description: newDescription,
        };
        break;
      }
      default: {
        updatedTransaction = {
          amount: parsedAmount,
          date: newDate,
          description: newDescription,
        };
      }
    }
    
    try {
      let url = '';
      if (editingTransaction.type === 'income' || editingTransaction.type === 'expense') {
        url = `${REACT_APP_API_URL}/transactions/${editingTransaction.id}`;
      } else {
        url = `${REACT_APP_API_URL}/api/operations/${editingTransaction.type}/${editingTransaction.id}`;
      }
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransaction),
      });
      if (response.ok) {
        setSnackbarMessage('La transacción ha sido actualizada correctamente.');
        setSnackbarVisible(true);
        setEditModalVisible(false);
        setEditingTransaction(null);
        fetchData(startDate, endDate);
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'No se pudo actualizar la transacción.';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error al actualizar la transacción:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar la transacción.');
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingTransaction(null);
  };

  // Render del modal de edición para cada tipo
  const renderEditFields = () => {
    if (!editingTransaction) return null;
    switch (editingTransaction.type) {
      case 'CLOSING':
        return (
          <>
            <TextInput
              label="Monto"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Fecha de Depósito"
              value={newDate}
              style={styles.modalInput}
              showSoftInputOnFocus={false}
              onFocus={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }}
              right={<TextInput.Icon icon="calendar" onPress={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }} />}
            />
            <TextInput
              label="Periodo Desde"
              value={newPeriodStart}
              style={styles.modalInput}
              showSoftInputOnFocus={false}
              onFocus={() => {
                setDateEditField('periodStart');
                setDatePickerEditVisible(true);
              }}
              right={<TextInput.Icon icon="calendar" onPress={() => {
                setDateEditField('periodStart');
                setDatePickerEditVisible(true);
              }} />}
            />
            <TextInput
              label="Periodo Hasta"
              value={newPeriodEnd}
              style={styles.modalInput}
              showSoftInputOnFocus={false}
              onFocus={() => {
                setDateEditField('periodEnd');
                setDatePickerEditVisible(true);
              }}
              right={<TextInput.Icon icon="calendar" onPress={() => {
                setDateEditField('periodEnd');
                setDatePickerEditVisible(true);
              }} />}
            />
            <TextInput
              label="Usuario"
              value={newUsername}
              onChangeText={setNewUsername}
              style={styles.modalInput}
            />
          </>
        );
      case 'SUPPLIER':
        return (
          <>
            <TextInput
              label="Monto"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Fecha de Pago"
              value={newDate}
              style={styles.modalInput}
              showSoftInputOnFocus={false}
              onFocus={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }}
              right={<TextInput.Icon icon="calendar" onPress={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }} />}
            />
            <TextInput
              label="Proveedor"
              value={newSupplier}
              onChangeText={setNewSupplier}
              style={styles.modalInput}
            />
            <TextInput
              label="Usuario"
              value={newUsername}
              onChangeText={setNewUsername}
              style={styles.modalInput}
            />
          </>
        );
      case 'SALARY':
        return (
          <>
            <TextInput
              label="Monto"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Fecha de Depósito"
              value={newDate}
              style={styles.modalInput}
              showSoftInputOnFocus={false}
              onFocus={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }}
              right={<TextInput.Icon icon="calendar" onPress={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }} />}
            />
            <TextInput
              label="Descripción"
              value={newDescription}
              onChangeText={setNewDescription}
              style={styles.modalInput}
            />
            <TextInput
              label="Usuario"
              value={newUsername}
              onChangeText={setNewUsername}
              style={styles.modalInput}
            />
          </>
        );
      case 'income':
      case 'expense':
        return (
          <>
            <TextInput
              label="Monto"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Fecha"
              value={newDate}
              style={styles.modalInput}
              showSoftInputOnFocus={false}
              onFocus={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }}
              right={<TextInput.Icon icon="calendar" onPress={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }} />}
            />
            <TextInput
              label="Descripción"
              value={newDescription}
              onChangeText={setNewDescription}
              style={styles.modalInput}
            />
          </>
        );
      default:
        return (
          <>
            <TextInput
              label="Monto"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Fecha"
              value={newDate}
              style={styles.modalInput}
              showSoftInputOnFocus={false}
              onFocus={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }}
              right={<TextInput.Icon icon="calendar" onPress={() => {
                setDateEditField('date');
                setDatePickerEditVisible(true);
              }} />}
            />
            <TextInput
              label="Descripción"
              value={newDescription}
              onChangeText={setNewDescription}
              style={styles.modalInput}
            />
          </>
        );
    }
  };

  // Render de cada tarjeta de operación (se omite el ID)
  const renderTransaction = (item: Transaction, index: number) => {
    let dateToShow = item.date;
    
    if (item.type === 'CLOSING' && item.depositDate) {
      dateToShow = item.depositDate;
    } else if (item.type === 'SUPPLIER' && item.paymentDate) {
      dateToShow = item.paymentDate;
    } else if (item.type === 'SALARY' && item.depositDate) {
      dateToShow = item.depositDate;
    }
    
    return (
      <View key={`transaction-${item.id}-${index}`} style={styles.card}>
        <ThemedText style={styles.cardText}>{'Tipo: ' + item.type}</ThemedText>
        {dateToShow && (
          <ThemedText style={styles.cardText}>{'Fecha: ' + formatDate(dateToShow)}</ThemedText>
        )}
        <ThemedText style={styles.cardText}>{'Monto: $' + item.amount}</ThemedText>
        {item.description && (
          <ThemedText style={styles.cardText}>{'Descripción: ' + item.description}</ThemedText>
        )}
        {item.username && (
          <ThemedText style={styles.cardText}>{'Usuario: ' + item.username}</ThemedText>
        )}
        {item.type === 'CLOSING' && (
          <>
            {item.closingsCount !== undefined && (
              <ThemedText style={styles.cardText}>
                {'Cantidad de cierres: ' + item.closingsCount}
              </ThemedText>
            )}
            {item.periodStart && (
              <ThemedText style={styles.cardText}>
                {'Periodo desde: ' + formatDate(item.periodStart)}
              </ThemedText>
            )}
            {item.periodEnd && (
              <ThemedText style={styles.cardText}>
                {'Periodo hasta: ' + formatDate(item.periodEnd)}
              </ThemedText>
            )}
          </>
        )}
        {item.type === 'SUPPLIER' && item.supplier && (
          <ThemedText style={styles.cardText}>{'Proveedor: ' + item.supplier}</ThemedText>
        )}
        {item.type === 'SALARY' && item.username && (
          <ThemedText style={styles.cardText}>{'Empleado: ' + item.username}</ThemedText>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
      >
        <ThemedText style={styles.paginationText}>&lt;</ThemedText>
      </TouchableOpacity>
      {pageNumbers.map((page) => (
        <TouchableOpacity
          key={page}
          onPress={() => setCurrentPage(page)}
          style={[styles.paginationButton, currentPage === page && styles.activeButton]}
        >
          <ThemedText style={[styles.paginationText, currentPage === page && styles.activeText]}>
            {page}
          </ThemedText>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
      >
        <ThemedText style={styles.paginationText}>&gt;</ThemedText>
      </TouchableOpacity>
    </View>
  );

  // Estilos locales para el header (inputs de fecha y balance)
  const headerContainerStyle = [
    styles.headerContainer,
    isLargeScreen
      ? ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as ViewStyle)
      : ({ flexDirection: 'column' } as ViewStyle),
  ];
  const dateInputsContainerStyle = [
    styles.dateInputsContainer,
    isLargeScreen
      ? ({ flexDirection: 'row', width: '50%', justifyContent: 'space-between' } as ViewStyle)
      : {},
  ];
  const dateInputStyle: ViewStyle[] = [
    styles.dateInput, 
    isLargeScreen ? { flex: 0.48 } : {}
  ];
  

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Todas las Operaciones</ThemedText>

      {/* Botón de Logout */}
      <LogoutButton />

      {/* Header con filtros de fecha y balance */}
      <View style={headerContainerStyle}>
        <View style={dateInputsContainerStyle}>
          <TextInput
            label="Fecha Inicio"
            value={formatDate(startDate)}
            style={styles.dateInput} 
            onFocus={() => {
              setSelectedDateInput('start');
              setDatePickerOpen(true);
            }}
            right={<TextInput.Icon icon="calendar" />}
          />
          <TextInput
            label="Fecha Fin"
            value={formatDate(endDate)}
            style={styles.dateInput}
            onFocus={() => {
              setSelectedDateInput('end');
              setDatePickerOpen(true);
            }}
            right={<TextInput.Icon icon="calendar" />}
          />
          {(startDate || endDate) && (
            <Button
              mode="outlined"
              onPress={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              style={styles.clearButton}
            >
              Limpiar
            </Button>
          )}
        </View>
        {isLargeScreen && <BalanceCard transactions={transactions} />}
      </View>

      {!isLargeScreen && <BalanceCard transactions={transactions} />}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>
            Cargando datos desde la base de datos...
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {paginatedTransactions.length === 0 ? (
            <ThemedText style={styles.noDataText}>No hay transacciones para mostrar</ThemedText>
          ) : (
            <>
              {paginatedTransactions.map((item, index) => renderTransaction(item, index))}
            </>
          )}
        </ScrollView>
      )}

      <View style={styles.fixedPaginationContainer}>{renderPagination()}</View>

      <DatePickerModal
        locale="es"
        mode="single"
        visible={datePickerOpen}
        onDismiss={onDismissDatePicker}
        date={selectedDateInput === 'start' ? startDate : endDate}
        onConfirm={onConfirmDate}
      />

      {/* Modal para editar la transacción */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalTitle}>Editar Transacción</ThemedText>
            <TextInput
              label="Tipo"
              value={editingTransaction ? editingTransaction.type : ''}
              disabled
              style={styles.modalInput}
            />
            {renderEditFields()}
            <View style={styles.modalButtonContainer}>
              <Button onPress={handleCancelEdit} mode="outlined" style={styles.modalButton}>
                Cancelar
              </Button>
              <Button onPress={handleSaveEdit} mode="contained" style={styles.modalButton}>
                Guardar
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para eliminación */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalTitle}>Confirmar Eliminación</ThemedText>
            <Text style={styles.confirmationText}>
              ¿Estás seguro de que deseas eliminar esta transacción?
            </Text>
            <View style={styles.modalButtonContainer}>
              <Button onPress={() => setShowDeleteConfirmation(false)} mode="outlined" style={styles.modalButton}>
                Cancelar
              </Button>
              <Button onPress={confirmDelete} mode="contained" style={styles.modalButton}>
                Eliminar
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
      <DatePickerModal
        locale="es"
        mode="single"
        visible={datePickerEditVisible}
        onDismiss={() => setDatePickerEditVisible(false)}
        date={(() => {
          try {
            if (dateEditField === 'date' && newDate) {
              return parseISO(newDate);
            } else if (dateEditField === 'periodStart' && newPeriodStart) {
              return parseISO(newPeriodStart);
            } else if (dateEditField === 'periodEnd' && newPeriodEnd) {
              return parseISO(newPeriodEnd);
            }
            return new Date();
          } catch (error) {
            console.error('Error parsing date:', error);
            return new Date();
          }
        })()}
        onConfirm={onConfirmEditDate}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  headerContainer: {
    marginBottom: 16,
  },
  dateInputsContainer: {
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    elevation: 2,
    width: 180,
    alignSelf: 'flex-end',
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    flex: 1,
  },
  balanceValue: {
    fontSize: 14,
    color: '#007bff',
  },
  scrollView: {
    flex: 1,
    marginBottom: 60,
  },
  fixedPaginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 1,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centrar horizontalmente
    alignItems: 'center',     // Centrar verticalmente
    marginTop: 10,
    gap: 15,
  },
  editButton: {
    backgroundColor: '#107aff',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 170,
    height: 40,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 170,
    height: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  modalInput: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  snackbar: {
    position: 'absolute',
    top: 0,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  confirmationText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
});

export default AdminScreen;
