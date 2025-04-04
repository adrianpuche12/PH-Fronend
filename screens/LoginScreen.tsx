/*
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Card, Title, HelperText, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al intentar iniciar sesión');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Card.Content>

          <View style={styles.logoContainer}>
            <Avatar.Image
              size={120}
              source={require('../assets/images/logo_proyecto_Humberto.jpg')}
              style={styles.logo}
            />
          </View>
          <Title style={styles.title}>Iniciar Sesión</Title>

          <TextInput
            label="Usuario"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
    borderRadius: 8,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default LoginScreen;

*/

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  HelperText, 
  Avatar
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        // Login successful
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al intentar iniciar sesión');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0A8" />
      
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Avatar.Image
            size={120}
            source={require('../assets/images/logo_proyecto_Humberto.jpg')}
            style={styles.logo}
          />
        </View>
        <Title style={styles.welcomeText}>Bienvenido</Title>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Iniciar Sesión</Title>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="Usuario"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="account" color="#D4A72B" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#D4A72B"
              theme={{ colors: { primary: '#D4A72B' } }}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock" color="#D4A72B" />}
              right={
                <TextInput.Icon 
                  icon={secureTextEntry ? "eye" : "eye-off"} 
                  onPress={toggleSecureEntry}
                  color="#D4A72B"
                />
              }
              outlineColor="#DDDDDD"
              activeOutlineColor="#D4A72B"
              theme={{ colors: { primary: '#D4A72B' } }}
            />
          </View>

          {error ? (
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
            loading={isLoading}
            disabled={isLoading}
            labelStyle={styles.buttonText}
            color="#2196F3" // Standard blue button color
          >
            {isLoading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topSection: {
    backgroundColor: '#FFF0A8', // Soft yellow background
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'white',
  },
  welcomeText: {
    color: '#8B7214', // Darker yellow/gold for contrast on light yellow
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  card: {
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 15,
    elevation: 6,
    paddingVertical: 10,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 30,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default LoginScreen;