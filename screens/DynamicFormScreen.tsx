import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, RadioButton, Card, Title, Snackbar } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { format } from 'date-fns';
import FormScreen from './FormScreen';
import ResponsiveButton from '@/components/ui/responsiveButton';



const BACKEND_URL = 'http://192.168.56.1:8080/api/forms';

const DynamicFormScreen = () => {
  const [formType, setFormType] = useState<'closing-deposits' | 'supplier-payments' | 'salary-payments' | ''>('');
  const [formData, setFormData] = useState<any>({
    closingsCount: '',
    amount: '',
    periodStart: '',
    periodEnd: '',
    username: '',
    supplier: '',
    description: '',
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<'periodStart' | 'periodEnd' | ''>('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [showFormScreen, setShowFormScreen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // Función para mostrar mensajes
  const showMessage = (type: 'success' | 'error', text: string) => {
    setSnackbarMessage(text);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  // Efecto para ocultar el mensaje después de 3 segundos
  useEffect(() => {
    if (snackbarVisible) {
      const timer = setTimeout(() => {
        setSnackbarVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbarVisible]);

  // Función para manejar cambios en los campos de entrada
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

  // Función para manejar la confirmación de fecha
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

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (formType === 'closing-deposits') {
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

  // Función para enviar el formulario
  const handleSubmit = async () => {
    if (!formType) {
      showMessage('error', 'Por favor, seleccione un formulario.');
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      showMessage('error', 'Todos los campos son obligatorios.');
      return;
    }

    const amountRegex = /^[0-9]+([.,][0-9]{1,2})?$/;
    if (!amountRegex.test(formData.amount)) {
      showMessage('error', 'El monto debe ser un número válido (ej. 100.50).');
      return;
    }

    try {
      let url = `${BACKEND_URL}/${formType}`;
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
          closingsCount: '',
          amount: '',
          periodStart: '',
          periodEnd: '',
          username: '',
          supplier: '',
          description: '',
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

  if (showFormScreen) {
    return <FormScreen />;
  }

  // Renderizar la lista de proveedores
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

  // Renderizar los campos del formulario según el tipo
  const renderFormFields = () => {
    switch (formType) {
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
            />
            <TextInput
              label="Usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              mode="outlined"
              style={styles.input}
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
            />
            <TextInput
              label="Usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              mode="outlined"
              style={styles.input}
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
            />
            <TextInput
              label="Monto"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              mode="outlined"
              style={styles.input}
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

            <Title style={[styles.title, { fontWeight: 'bold' }]}>
              Formularios Dinámicos
            </Title>
            <Title style={styles.title}>Seleccione un formulario</Title>
            <RadioButton.Group
              onValueChange={(value) =>
                setFormType(value as 'closing-deposits' | 'supplier-payments' | 'salary-payments' | '')
              }
              value={formType}
            >
              <RadioButton.Item label="Depósito de Cierres" value="closing-deposits" />
              <RadioButton.Item label="Pago a Proveedores" value="supplier-payments" />
              <RadioButton.Item label="Salarios" value="salary-payments" />
            </RadioButton.Group>

            {renderFormFields()}
            <ResponsiveButton
              title="Enviar"
              onPress={handleSubmit}
              mode="contained" />
          </Card.Content>
        </Card>
        <DatePickerModal
          mode="single"
          visible={datePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          onConfirm={handleDateConfirm}
          locale="es"
        />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarType === 'success' ? '#4caf50' : '#f44336' }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  goBackButton: {
    position: 'absolute',
    top: 10,
    color: "#007AFF",
    left: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    flex: 1,
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
  button: {
    marginTop: 16,
  },
});

export default DynamicFormScreen;