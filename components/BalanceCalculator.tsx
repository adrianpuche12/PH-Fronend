import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Card, Title, Text, TextInput, IconButton } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { format } from 'date-fns';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  description: string;
}

interface BalanceCalculatorProps {
  visible: boolean;
  onDismiss: () => void;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

interface BalanceState {
  total: number;
  incomes: number;
  expenses: number;
}

const BalanceCalculator: React.FC<BalanceCalculatorProps> = ({ 
  visible, 
  onDismiss, 
  transactions,
  onEdit,
  onDelete
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<'start' | 'end'>('start');
  const [balance, setBalance] = useState<BalanceState>({ 
    total: 0, 
    incomes: 0, 
    expenses: 0 
  });
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (startDate && endDate && transactions) {
      calculateBalanceAndFilter();
    }
  }, [startDate, endDate, transactions]);

  const calculateBalanceAndFilter = () => {
    if (!startDate || !endDate) return;

    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    setFilteredTransactions(filtered);

    const result = filtered.reduce((acc: BalanceState, curr) => {
      const amount = parseFloat(curr.amount.toString());
      if (curr.type === 'income') {
        acc.incomes += amount;
        acc.total += amount;
      } else if (curr.type === 'expense') {
        acc.expenses += amount;
        acc.total -= amount;
      }
      return acc;
    }, { total: 0, incomes: 0, expenses: 0 });

    setBalance(result);
  };

  const handleDateSelect = (field: 'start' | 'end') => {
    setSelectedDateField(field);
    setDatePickerVisible(true);
  };

  const onDismissDatePicker = () => {
    setDatePickerVisible(false);
  };

  const onConfirmDate = ({ date }: { date: Date | undefined }) => {
    if (date) {
      if (selectedDateField === 'start') {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
    setDatePickerVisible(false);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    return typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  };

  const clearDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setBalance({ total: 0, incomes: 0, expenses: 0 });
    setFilteredTransactions([]);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Title style={styles.title}>Cálculo de Balance</Title>
            <Button 
              mode="contained" 
              onPress={onDismiss}
              style={styles.closeButton}
            >
              Cerrar
            </Button>
          </View>
          
          <ScrollView style={styles.scrollContent}>
            <Card.Content>
              <View style={styles.dateInputContainer}>
                <TextInput
                  label="Fecha Inicio"
                  value={formatDate(startDate)}
                  mode="outlined"
                  style={styles.input}
                  showSoftInputOnFocus={false}
                  right={<TextInput.Icon icon="calendar" onPress={() => handleDateSelect('start')} />}
                />

                <TextInput
                  label="Fecha Fin"
                  value={formatDate(endDate)}
                  mode="outlined"
                  style={styles.input}
                  showSoftInputOnFocus={false}
                  right={<TextInput.Icon icon="calendar" onPress={() => handleDateSelect('end')} />}
                />
              </View>

              {(startDate || endDate) && (
                <Button 
                  mode="outlined" 
                  onPress={clearDates}
                  style={styles.clearButton}
                >
                  Limpiar fechas
                </Button>
              )}

              {startDate && endDate && (
                <>
                  <View style={styles.balanceContainer}>
                    <Text style={styles.balanceText}>Ingresos: L{balance.incomes.toFixed(2)}</Text>
                    <Text style={styles.balanceText}>Egresos: L{balance.expenses.toFixed(2)}</Text>
                    <Text style={[
                      styles.balanceTotal, 
                      { color: balance.total >= 0 ? '#4CAF50' : '#F44336' }
                    ]}>
                      Balance Total: L{balance.total.toFixed(2)}
                    </Text>
                  </View>

                  <Title style={styles.subtitle}>Transacciones en el período</Title>
                  {filteredTransactions.length > 0 ? (
                    <View style={styles.transactionsList}>
                      {filteredTransactions.map((transaction) => (
                        <Card key={transaction.id} style={styles.transactionCard}>
                          <Card.Content>
                            <View style={styles.transactionHeader}>
                              <Text style={[
                                styles.transactionType,
                                { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
                              ]}>
                                {transaction.type === 'income' ? '↑' : '↓'} {transaction.type}
                              </Text>
                              <Text style={styles.transactionAmount}>
                                L{parseFloat(transaction.amount.toString()).toFixed(2)}
                              </Text>
                            </View>
                            <Text style={styles.transactionDate}>
                              Fecha: {formatDate(transaction.date)}
                            </Text>
                            <Text style={styles.transactionDescription}>
                              {transaction.description}
                            </Text>
                            <View style={styles.actionButtons}>
                              <IconButton
                                icon="pencil"
                                mode="contained"
                                size={20}
                                onPress={() => {
                                  onEdit(transaction);
                                  onDismiss();
                                }}
                              />
                              <IconButton
                                icon="delete"
                                mode="contained"
                                size={20}
                                iconColor="#dc3545"
                                onPress={() => {
                                  onDelete(transaction);
                                  onDismiss();
                                }}
                              />
                            </View>
                          </Card.Content>
                        </Card>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noTransactions}>
                      No hay transacciones en el período seleccionado
                    </Text>
                  )}
                </>
              )}
            </Card.Content>
          </ScrollView>
        </Card>

        <DatePickerModal
          locale="es"
          mode="single"
          visible={datePickerVisible}
          onDismiss={onDismissDatePicker}
          date={selectedDateField === 'start' ? startDate : endDate}
          onConfirm={onConfirmDate}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    flex: 1,
  },
  closeButton: {
    marginLeft: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  dateInputContainer: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 16,
  },
  clearButton: {
    marginBottom: 16,
  },
  balanceContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 16,
    marginBottom: 8,
  },
  balanceTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  transactionsList: {
    marginTop: 10,
  },
  transactionCard: {
    marginBottom: 10,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  transactionDescription: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  noTransactions: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default BalanceCalculator;