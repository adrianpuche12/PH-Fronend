import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { DataTable, Card, Searchbar } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Transaction {
  id: number;
  type: 'CLOSING' | 'SUPPLIER' | 'SALARY';
  amount: number;
  date: string;
  description: string;
  username?: string;
  closingsCount?: number;
  periodStart?: string;
  periodEnd?: string;
  supplier?: string;
}

const itemsPerPage = 5;

export default function AdminScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/operations/all');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, []);

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (transaction.username?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredTransactions.length);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <ThemedView style={styles.container}>
      <Card style={[styles.card, { backgroundColor }]}>
        <Card.Content>
          <ThemedText type="title" style={styles.title}>
            Panel de Administración
          </ThemedText>
          
          <Searchbar
            placeholder="Buscar transacciones..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />

          <ScrollView 
            style={styles.tableContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Fecha</DataTable.Title>
                <DataTable.Title>Tipo</DataTable.Title>
                <DataTable.Title>Monto</DataTable.Title>
                <DataTable.Title>Descripción</DataTable.Title>
              </DataTable.Header>

              {filteredTransactions.slice(from, to).map((transaction) => (
                <DataTable.Row key={transaction.id}>
                  <DataTable.Cell>{formatDate(transaction.date)}</DataTable.Cell>
                  <DataTable.Cell>{transaction.type}</DataTable.Cell>
                  <DataTable.Cell>{formatAmount(transaction.amount)}</DataTable.Cell>
                  <DataTable.Cell>{transaction.description}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(filteredTransactions.length / itemsPerPage)}
            onPageChange={setPage}
            label={`${from + 1}-${to} de ${filteredTransactions.length}`}
          />
        </Card.Content>
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  searchbar: {
    marginBottom: 16,
  },
  tableContainer: {
    flex: 1,
  },
});