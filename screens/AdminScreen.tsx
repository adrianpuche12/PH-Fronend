import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button, TextInput, IconButton } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

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
  const [currentPage, setCurrentPage] = useState(0);

  const fetchData = async (start?: Date, end?: Date) => {
    try {
      let url = 'http://192.168.0.2:8080/api/operations/all';
      if (start && end) {
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        url += `?startDate=${startStr}&endDate=${endStr}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setTransactions(data);
      setCurrentPage(0); // Reset a la primera página cuando se cargan nuevos datos
    } catch (err) {
      console.error('Error al cargar las transacciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

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
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const renderTransaction = (item: Transaction, index: number) => (
    <View key={`transaction-${item.id}-${index}`} style={styles.card}>
      <ThemedText style={styles.cardText}>ID: {item.id}</ThemedText>
      <ThemedText style={styles.cardText}>Tipo: {item.type}</ThemedText>
      <ThemedText style={styles.cardText}>Fecha: {formatDate(item.date)}</ThemedText>
      <ThemedText style={styles.cardText}>Monto: ${item.amount}</ThemedText>
      
      {item.username && (
        <ThemedText style={styles.cardText}>Usuario: {item.username}</ThemedText>
      )}
      
      {item.description && (
        <ThemedText style={styles.cardText}>Descripción: {item.description}</ThemedText>
      )}

      {item.type === 'CLOSING' && (
        <>
          {item.closingsCount !== undefined && (
            <ThemedText style={styles.cardText}>Cantidad de cierres: {item.closingsCount}</ThemedText>
          )}
          {item.periodStart && (
            <ThemedText style={styles.cardText}>Periodo desde: {formatDate(item.periodStart)}</ThemedText>
          )}
          {item.periodEnd && (
            <ThemedText style={styles.cardText}>Periodo hasta: {formatDate(item.periodEnd)}</ThemedText>
          )}
        </>
      )}

      {item.type === 'SUPPLIER' && item.supplier && (
        <ThemedText style={styles.cardText}>Proveedor: {item.supplier}</ThemedText>
      )}
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <IconButton
        icon="chevron-left"
        mode="contained"
        onPress={() => setCurrentPage(p => Math.max(0, p - 1))}
        disabled={currentPage === 0}
      />
      <ThemedText style={styles.paginationText}>
        {`${currentPage + 1} de ${totalPages}`}
      </ThemedText>
      <IconButton
        icon="chevron-right"
        mode="contained"
        onPress={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
        disabled={currentPage === totalPages - 1}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Panel de Administración</ThemedText>

      <View style={styles.filterContainer}>
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
            Limpiar Filtros
          </Button>
        )}
      </View>
      
      <ScrollView style={styles.scrollView}>
        {!loading && paginatedTransactions.length === 0 ? (
          <ThemedText style={styles.noDataText}>No hay transacciones para mostrar</ThemedText>
        ) : (
          <>
            {paginatedTransactions.map((item, index) => renderTransaction(item, index))}
            {renderPagination()}
          </>
        )}
      </ScrollView>

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
  dateInput: {
    backgroundColor: '#fff',
  },
  clearButton: {
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
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
    paddingVertical: 16,
  },
  paginationText: {
    marginHorizontal: 16,
    fontSize: 16,
  }
});

export default AdminScreen;