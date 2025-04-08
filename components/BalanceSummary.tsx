import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number | string;
  date: string;
  description: string;
}

interface BalanceSummaryProps {
  transactions: Transaction[];
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ transactions }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const balance = transactions.reduce((acc, curr) => {
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

  return (
    <View style={styles.wrapper}>
      <Surface 
        style={[
          styles.container,
          isMobile ? styles.mobileContainer : styles.desktopContainer,
        ]} 
        elevation={4}
      >
        <View style={styles.content}>
          <Text style={[
            styles.title,
            isMobile && styles.mobileTitle
          ]}>
            Balance General
          </Text>

          <View style={styles.row}>
            <IconButton
              icon="trending-up"
              size={16}
              iconColor="#4CAF50"
              style={styles.icon}
            />
            <Text style={styles.label}>Ingresos</Text>
            <Text style={styles.incomeValue}>
              L{balance.incomes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.row}>
            <IconButton
              icon="trending-down"
              size={16}
              iconColor="#f44336"
              style={styles.icon}
            />
            <Text style={styles.label}>Egresos</Text>
            <Text style={styles.expenseValue}>
              L{balance.expenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.row, styles.totalRow]}>
            <IconButton
              icon="currency-usd"
              size={16}
              iconColor={balance.total >= 0 ? "#4CAF50" : "#f44336"}
              style={styles.icon}
            />
            <Text style={[styles.label, styles.totalLabel]}>Total</Text>
            <Text style={[
              styles.totalValue,
              { color: balance.total >= 0 ? "#4CAF50" : "#f44336" }
            ]}>
              L{balance.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      default: {
        elevation: 4,
      },
    }),
  },
  mobileContainer: {
    width: '90%',
    maxWidth: 400,
  },
  desktopContainer: {
    width: '50%',
    maxWidth: 500,
    minWidth: 400,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  mobileTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 4,
    paddingTop: 8,
  },
  icon: {
    margin: 0,
    padding: 0,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  totalLabel: {
    fontWeight: '500',
  },
  incomeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    minWidth: 120,
    textAlign: 'right',
  },
  expenseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
    minWidth: 120,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 120,
    textAlign: 'right',
  },
});

export default BalanceSummary;