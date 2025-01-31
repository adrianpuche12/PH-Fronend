import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, useWindowDimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button, TextInput, IconButton } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { useFocusEffect } from '@react-navigation/native';

interface Transaction {
  id: number;
  type: 'CLOSING' | 'SUPPLIER' | 'SALARY';
  amount: number;
  date: string;
  description?: string;
  username?: string;
  closingsCount?: number;
  periodStart?: string;
  periodEnd?: string;
  supplier?: string;
}

const ITEMS_PER_PAGE = 5;

const AdminScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDateInput, setSelectedDateInput] = useState<'start' | 'end'>('start');
  const [currentPage, setCurrentPage] = useState(1);

  const { width: screenWidth } = useWindowDimensions();

  const fetchData = async (start?: Date, end?: Date) => {
    setLoading(true);
    try {
      let url = 'http://192.168.56.1:8080/api/operations/all';
      if (start && end) {
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        url += `?startDate=${startStr}&endDate=${endStr}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setTransactions(data);
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

  const formatDate = (date?: Date | string) => {
    if (!date) return '';
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

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

  const handleEdit = (transaction: Transaction) => {
    console.log('Editar transacción:', transaction);
  };

  const renderTransaction = (item: Transaction, index: number) => (
    <View key={`transaction-${item.id}-${index}`} style={styles.card}>
      <ThemedText style={styles.cardText}>ID: {item.id}</ThemedText>
      <ThemedText style={styles.cardText}>Tipo: {item.type}</ThemedText>
      <ThemedText style={styles.cardText}>Fecha: {formatDate(item.date)}</ThemedText>
      <ThemedText style={styles.cardText}>Monto: ${item.amount}</ThemedText>
      {item.username && <ThemedText style={styles.cardText}>Usuario: {item.username}</ThemedText>}
      {item.description && <ThemedText style={styles.cardText}>Descripción: {item.description}</ThemedText>}
      {item.type === 'CLOSING' && (
        <>
          {item.closingsCount !== undefined && <ThemedText style={styles.cardText}>Cantidad de cierres: {item.closingsCount}</ThemedText>}
          {item.periodStart && <ThemedText style={styles.cardText}>Periodo desde: {formatDate(item.periodStart)}</ThemedText>}
          {item.periodEnd && <ThemedText style={styles.cardText}>Periodo hasta: {formatDate(item.periodEnd)}</ThemedText>}
        </>
      )}
      {item.type === 'SUPPLIER' && item.supplier && <ThemedText style={styles.cardText}>Proveedor: {item.supplier}</ThemedText>}
      {item.type === 'SALARY' && item.username && <ThemedText style={styles.cardText}>Empleado: {item.username}</ThemedText>}
    </View>
  );

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

  // Estilos dinámicos usando un array de estilos
  const filterContainerStyle = [
    styles.filterContainer,
    screenWidth < 768 ? { flexDirection: 'column' as const } : { flexDirection: 'row' as const },
  ];

  const dateInputContainerStyle = [
    styles.dateInputContainer,
    screenWidth < 768 ? { width: '100%' } : { flex: 1, marginRight: 8 },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Todas las Operaciones</ThemedText>

      <View style={filterContainerStyle}>
        <View style={dateInputContainerStyle}>
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
        </View>
        <View style={dateInputContainerStyle}>
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
        </View>
        {(startDate || endDate) && (
          <Button
            mode="outlined"
            onPress={() => {
              setStartDate(undefined);
              setEndDate(undefined);
            }}
            style={styles.clearButton}
          >
            Limpiar Filtros
          </Button>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Cargando datos desde la base de datos...</ThemedText>
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

      <View style={styles.fixedPaginationContainer}>
        {renderPagination()}
      </View>

      <DatePickerModal
        locale="es"
        mode="single"
        visible={datePickerOpen}
        onDismiss={onDismissDatePicker}
        date={selectedDateInput === 'start' ? startDate : endDate}
        onConfirm={onConfirmDate}
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
  filterContainer: {
    marginBottom: 16,
    gap: 8,
  },
  dateInputContainer: {
    // Estilos del contenedor del TextInput
  },
  dateInput: {
    backgroundColor: '#fff',
  },
  clearButton: {
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    marginBottom: 60,
  },
  card: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
    width: Dimensions.get('window').width - 32,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 1,
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
  editButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
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

export default AdminScreen;