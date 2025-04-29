import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper'; // Importa el proveedor de React Native Paper
import FormScreen from './screens/FormScreen';
import StackNavigator from './navigation/StackNavigator';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <StackNavigator/>
      </NavigationContainer>
    </PaperProvider>
  );
}

