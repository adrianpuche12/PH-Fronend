import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import FormScreen from '../screens/FormScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import DynamicFormScreen from '../screens/DynamicFormScreen';
import AdminScreen from '../screens/AdminScreen';
import AdminDashboard from '../screens/AdminDashboard';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Form">
      <Stack.Screen name="Form" component={FormScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="DynamicFormScreen" component={DynamicFormScreen} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    </Stack.Navigator>
  );
}
