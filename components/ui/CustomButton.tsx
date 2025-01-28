import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

// Definir las props del componente
interface CustomButtonProps {
  title: string; // El título del botón 
  onPress: (event: GestureResponderEvent) => void; 
  isLoading?: boolean; 
  style?: ViewStyle; 
  textStyle?: TextStyle; 
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  isLoading = false, // Valor por defecto para isLoading
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]} // Combina estilos predeterminados y personalizados
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF', // Color de fondo del botón
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginVertical: 8, // Espaciado vertical entre botones
  },
  text: {
    color: '#fff', // Color del texto
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;