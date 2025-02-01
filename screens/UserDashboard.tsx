import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, IconButton } from 'react-native-paper';


const UserDarshbord = () => {
  const [activeScreen, setActiveScreen] = useState<null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          // onPress={() => setActiveScreen(' ... ')}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Apartado 1
        </Button>

        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Apartado 2
        </Button>

        <Button
          mode="contained"
          // onPress={() => setActiveScreen(' ... ')}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Apartado 3
        </Button>
      </View>

      {/* Contenido dinámico abajo */}
      <View style={[styles.contentContainer, activeScreen === 'form' && styles.formScreenAdjustment]}>
        <View style={styles.dashboardContainer}>
          <Text style={styles.dashboardText}>Bienvenido al Panel de Usuario</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E1F3',
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
  homeButton: {
    position: 'absolute',
    top: 3,
    left: 10,
    zIndex: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 0,
    elevation: 3,
    shadowColor: '',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  button: {
    flex: 1,
    borderRadius: 0,
    marginHorizontal: 0,
    backgroundColor: '#E8E1F2',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
    justifyContent: 'flex-start',
  },
  formScreenAdjustment: {
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  dashboardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  dashboardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default UserDarshbord;
