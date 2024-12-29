import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import FormScreen from '../screens/FormScreen';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Form">
  <Stack.Screen name="Form" component={FormScreen} />
</Stack.Navigator>

    </NavigationContainer>
  );
}
