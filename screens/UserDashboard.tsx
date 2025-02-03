import React from 'react';
import { View, StyleSheet } from 'react-native';
import DynamicFormScreen from '@/screens/DynamicFormScreen';

const UserDashboard = () => {
  return (
    <View style={styles.container}>
      <DynamicFormScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E1F3',
    width: '100%',
    height: '100%',
  },
});

export default UserDashboard;