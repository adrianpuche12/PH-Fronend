import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated, Image, Text, useWindowDimensions} from 'react-native';
import { TextInput, Button, RadioButton, Card, Title, Snackbar } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { format } from 'date-fns';
import ResponsiveButton from '@/components/ui/responsiveButton';
import { REACT_APP_API_URL } from '../config';

// Versión básica corregida (sin validación)
const BACKEND_URL = `${REACT_APP_API_URL}/api/forms`;
const TRANSACTIONS_URL = `${REACT_APP_API_URL}/transactions`;

const DynamicFormScreen = () => {

  const { width} = useWindowDimensions();
  const isMobile = width <= 425;

  const [formType, setFormType] = useState<'transaction' | 'closing-deposits' | 'supplier-payments' | 'salary-payments' | ''>('');
  const [formData, setFormData] = useState<any>({
    // Campos para transacciones
    type: 'income',
    amount: '',
    date: '',
    description: '',
    // Campos adicionales
    closingsCount: '',
    periodStart: '',
    periodEnd: '',
    username: '',
    supplier: '',
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<'date' | 'periodStart' | 'periodEnd' | ''>('');
  const [showMessageCard, setShowMessageCard] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const slideAnim = useState(new Animated.Value(-100))[0];
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const showMessage = (type: 'success' | 'error', message: string) => {
    setMessage(message);
    setMessageType(type);
    setShowMessageCard(true);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => hideMessage(), 3000);
  };

  const hideMessage = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowMessageCard(false));
  };

  const clearData = () => {
    handleInputChange('amount', '');
    handleInputChange('date', '');
    handleInputChange('description', '');
    handleInputChange('type', 'income');
    handleInputChange('closingsCount', '');
    handleInputChange('periodStart', '');
    handleInputChange('periodEnd', '');
    handleInputChange('username', '');
    handleInputChange('supplier', '');
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'amount') {
      const amountRegex = /^[0-9]*[.,]?[0-9]{0,2}$/;
      if (!amountRegex.test(value)) {
        showMessage('error', 'El monto debe ser un número válido (ej. 100.50).');
        return;
      }
    }
    setFormData((prevData: any) => ({
      ...prevData,
      [field]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
  };

  const handleDateConfirm = (params: { date: Date | undefined }) => {
    if (params.date) {
      const formattedDate = format(params.date, 'yyyy-MM-dd');
      setFormData((prevData: any) => ({
        ...prevData,
        [selectedDateField]: formattedDate,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, [selectedDateField]: false }));
    }
    setDatePickerVisible(false);
    setSelectedDateField('');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    
    if (formType === 'transaction') {
      if (!formData.amount) newErrors.amount = true;
      if (!formData.date) newErrors.date = true;
      if (!formData.description) newErrors.description = true;
    } else if (formType === 'closing-deposits') {
      if (!formData.amount) newErrors.amount = true;
      if (!formData.username) newErrors.username = true;
      if (!formData.periodStart) newErrors.periodStart = true;
      if (!formData.periodEnd) newErrors.periodEnd = true;
    } else if (formType === 'supplier-payments') {
      if (!formData.amount) newErrors.amount = true;
      if (!formData.username) newErrors.username = true;
      if (!formData.supplier) newErrors.supplier = true;
    } else if (formType === 'salary-payments') {
      if (!formData.amount) newErrors.amount = true;
      if (!formData.username) newErrors.username = true;
      if (!formData.description) newErrors.description = true;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!formType) {
      showMessage('error', 'Por favor, seleccione un tipo de operación.');
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      showMessage('error', 'Todos los campos son obligatorios.');
      return;
    }

    try {
      const url = formType === 'transaction' ? TRANSACTIONS_URL : `${BACKEND_URL}/${formType}`;
      const formToSend = {
        ...formData,
        amount: parseFloat(formData.amount.replace(',', '.')),
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formToSend),
      });

      if (response.ok) {
        showMessage('success', 'Datos enviados correctamente');
        setFormData({
          type: 'income',
          amount: '',
          date: '',
          description: '',
          closingsCount: '',
          periodStart: '',
          periodEnd: '',
          username: '',
          supplier: '',
        });
        setFormType('');
        setErrors({});
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Error al enviar el formulario');
      }
    } catch (error) {
      showMessage('error', 'No se pudo conectar con el servidor');
    }
  };

  const renderSupplierList = () => {
    const suppliers = ['Pollo Rey', 'Pollo Cortijo', 'Pollo Bravo'];
    return (
      <View>
        {suppliers.map((supplier) => (
          <RadioButton.Item
            key={supplier}
            label={supplier}
            value={supplier}
            status={formData.supplier === supplier ? 'checked' : 'unchecked'}
            onPress={() => handleInputChange('supplier', supplier)}
          />
        ))}
      </View>
    );
  };

  const renderTransactionForm = () => (
    <>
      <Title style={styles.title}>Selecciona el tipo de transaccion</Title>
      <RadioButton.Group
        onValueChange={(value) => handleInputChange('type', value)}
        value={formData.type}
      >
        <RadioButton.Item label="Ingreso" value="income" />
        <RadioButton.Item label="Egreso" value="expense" />
      </RadioButton.Group>

      <TextInput
        label="Monto"
        value={formData.amount}
        onChangeText={(value) => handleInputChange('amount', value)}
        keyboardType="decimal-pad"
        mode="outlined"
        style={styles.input}
        error={errors.amount}
      />

      <TextInput
        label="Fecha"
        value={formData.date}
        mode="outlined"
        onFocus={() => {
          setSelectedDateField('date');
          setDatePickerVisible(true);
        }}
        style={styles.input}
        error={errors.date}
      />

      <TextInput
        label="Descripción"
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        mode="outlined"
        style={styles.input}
        error={errors.description}
      />
    </>
  );

  const renderFormFields = () => {
    switch (formType) {
      case 'transaction':
        return renderTransactionForm();
      case 'closing-deposits':
        return (
          <>
            <TextInput
              label="Cantidad de cierres (opcional)"
              value={formData.closingsCount}
              onChangeText={(value) => handleInputChange('closingsCount', value)}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Monto"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              error={errors.amount}
            />
            <TextInput
              label="Fecha Desde"
              value={formData.periodStart}
              mode="outlined"
              onFocus={() => {
                setSelectedDateField('periodStart');
                setDatePickerVisible(true);
              }}
              style={styles.input}
              error={errors.periodStart}
            />
            <TextInput
              label="Fecha Hasta"
              value={formData.periodEnd}
              mode="outlined"
              onFocus={() => {
                setSelectedDateField('periodEnd');
                setDatePickerVisible(true);
              }}
              style={styles.input}
              error={errors.periodEnd}
            />
            <TextInput
              label="Usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              mode="outlined"
              style={styles.input}
              error={errors.username}
            />
          </>
        );
      case 'supplier-payments':
        return (
          <>
            <Title style={styles.title}>Selecciona un proveedor</Title>
            {renderSupplierList()}
            <TextInput
              label="Monto"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              error={errors.amount}
            />
            <TextInput
              label="Usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              mode="outlined"
              style={styles.input}
              error={errors.username}
            />
          </>
        );
      case 'salary-payments':
        return (
          <>
            <TextInput
              label="Descripción"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              mode="outlined"
              style={styles.input}
              error={errors.description}
            />
            <TextInput
              label="Monto"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              error={errors.amount}
            />
            <TextInput
              label="Usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              mode="outlined"
              style={styles.input}
              error={errors.username}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <Image
              source={require('@/assets/images/logo_proyecto_Humberto.jpg')}//
              style={[styles.logo, isMobile && styles.logoMobile]}
              resizeMode="contain"
              />
            </View>
              <Text style={[styles.title, { fontWeight: 'bold' }]}>
                Formulario de Operaciones
              </Text>
            <Title style={styles.title}>Seleccione tipo de operación</Title>
            <RadioButton.Group
              onValueChange={(value: any) => setFormType(value)}
              value={formType}
            >
              <RadioButton.Item label="Transacción" value="transaction" />
              <RadioButton.Item label="Depósito de Cierres" value="closing-deposits" />
              <RadioButton.Item label="Pago a Proveedores" value="supplier-payments" />
              <RadioButton.Item label="Salarios" value="salary-payments" />
            </RadioButton.Group>

            {renderFormFields()}
            <ResponsiveButton
              title="Enviar"
              onPress={handleSubmit}
              mode="contained"
            />

            <ResponsiveButton 
            title="↻ Limpiar Formulario"
            onPress={clearData} 
            mode="contained"
            backgroundColor='#f5742f'
            />
          </Card.Content>
        </Card>
      </ScrollView>

      <DatePickerModal
        mode="single"
        visible={datePickerVisible}
        onDismiss={() => setDatePickerVisible(false)}
        onConfirm={handleDateConfirm}
        locale="es"
      />

      {showMessageCard && (
        <Animated.View
          style={[
            styles.messageCard,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card style={messageType === 'success' ? styles.successCard : styles.errorCard}>
            <Card.Content>
              <Title style={styles.messageText}>{message}</Title>
            </Card.Content>
          </Card>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 16,
  },
  messageCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 2,
  },
  successCard: {
    backgroundColor: '#4CAF50',
  },
  errorCard: {
    backgroundColor: '#F44336',
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 50,
    position: 'absolute',
    left: 0,
  },
  logoMobile: {
    marginTop: 0,
    position: 'relative',
    right: 'auto',
  },
});

export default DynamicFormScreen;