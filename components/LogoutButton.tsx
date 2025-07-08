import React from 'react';
import { IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { StyleSheet } from 'react-native';

const LogoutButton = () => {
  const { logout } = useAuth();


  
  return (
    <IconButton
      icon="logout"
      size={24}
      onPress={logout}
      style={styles.logoutButton}
    />
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    position: 'absolute',
    top: 3,
    right: 10,
    zIndex: 10,
  },
});

export default LogoutButton;