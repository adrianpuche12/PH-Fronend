import React from 'react';
import { useWindowDimensions, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface ResponsiveButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined'; // Permite cambiar entre "contained" y "outlined"
  backgroundColor?: string; // Cambiar el color si lo requiere 
}

const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({ title, onPress, mode = 'contained', backgroundColor }) => {
  const { width } = useWindowDimensions(); // Obtiene el ancho de la pantalla

  const buttonBackgroundColor = backgroundColor || '#624aff'; // Color por defecto o el que se ingresa

  return (
    <Button
      mode={mode} // Se adapta según la prop recibida
      onPress={onPress}
      labelStyle={{ color: 'white' }}
      style={[
        styles.button,
        width > 768 ? styles.desktopButton : styles.mobileButton, // Aplica diferentes estilos según el ancho
        { backgroundColor: buttonBackgroundColor }, // Aplicar el color de fondo
      ]}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    marginTop: 16,
  },
  mobileButton: {
    width: '100%',
    backgroundColor: '#624aff',
  },
  desktopButton: {
    width: 300,
    alignSelf: 'center',
    backgroundColor: '#624aff',
  },
});

export default ResponsiveButton;
