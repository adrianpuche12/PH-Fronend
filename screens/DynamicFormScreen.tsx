import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, ScrollView } from 'react-native';
import { TextInput, Button, RadioButton, Card, Title } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { format } from 'date-fns';
import FormScreen from './FormScreen';
import { blue } from 'react-native-reanimated/lib/typescript/Colors';


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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isFormValid, setIsFormValid] = useState(false); // Nuevo estado para validar el formulario
  const [showFormScreen, setShowFormScreen] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData: any) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleDateConfirm = (params: { date: Date | undefined }) => {
    if (params.date) {
      const formattedDate = format(params.date, 'yyyy-MM-dd');
      setFormData((prevData: any) => ({
        ...prevData,
        [selectedDateField]: formattedDate,
      }));
    }
    setDatePickerVisible(false);
    setSelectedDateField(''); // Reset selected date field after choosing
  };

  const handleSubmit = async () => {
    if (!formType) {
      setMessage({ type: 'error', text: 'Por favor, seleccione un formulario.' });
      return;
    }

    try {
      let url = `${BACKEND_URL}/${formType}`;

      let formToSend = { ...formData };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formToSend),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Datos enviados correctamente' });
        setFormData({
          closingsCount: '',
          amount: '',
          periodStart: '',
          periodEnd: '',
          username: '',
          supplier: '',
          description: '',
        });
        setFormType(''); // Reseteamos el tipo de formulario
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Error al enviar el formulario' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudo conectar con el servidor' });
    }
  };

  const validateForm = () => {
    // Validar los campos obligatorios según el tipo de formulario
    let isValid = true;
    if (formType === 'closing-deposits') {
      isValid = formData.amount && formData.username && formData.periodStart && formData.periodEnd;
    } else if (formType === 'supplier-payments') {
      isValid = formData.amount && formData.username && formData.supplier;
    } else if (formType === 'salary-payments') {
      isValid = formData.amount && formData.username && formData.description;
    }
    setIsFormValid(isValid); // Actualizar el estado de validez
  };

  // Use effect to validate form when formType or formData changes
  useEffect(() => {
    validateForm();
  }, [formType, formData]);

  if (showFormScreen) {
    return <FormScreen />;
  }
  

  const renderSupplierList = () => {
    const suppliers = ['Pollo Rey', 'Pollo Cortijo', 'Pollo Bravo']; // Lista de proveedores
    return (
      <View>
        {suppliers.map((supplier) => (
          <RadioButton.Item
            key={supplier}
            label={supplier}
            value={supplier}
            status={formData.supplier === supplier ? 'checked' : 'unchecked'}
            onPress={() => handleInputChange('supplier', supplier)} // Guardamos el proveedor seleccionado
          />
        ))}
      </View>
    );
  };

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
              keyboardType="numeric"
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
              keyboardType="numeric"
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
              keyboardType="numeric"
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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
        <Button
            mode="text"            
            onPress={() => setShowFormScreen(true)}
            style={styles.goBackButton}  // Aplicando el estilo personalizado
            >
            Go back
        </Button>

            <Title style={[styles.title, { fontWeight: 'bold' }]} >
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
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            disabled={!isFormValid} // Deshabilitar el botón si el formulario no es válido
          >
            Enviar
          </Button>

          {/* Mostrar mensaje en una Card */}
          {message && (
            <Card style={[styles.messageCard, message.type === 'success' ? styles.successCard : styles.errorCard]}>
              <Card.Content>
                <Text style={styles.messageText}>{message.text}</Text>
              </Card.Content>
            </Card>
          )}
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
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    marginBottom: 20,
  },
  goBackButton: {
    position: 'absolute',  // Fijar el botón en una posición absoluta
    top: 10,  // Distancia desde la parte superior
    color: "#007AFF", // Color azul
    left: 10,  // Distancia desde la parte izquierda
    zIndex: 1,  // Asegurar que el botón esté encima de otros elementos si es necesario
  },
  title: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center', // Asegura que el texto esté centrado
    flex: 1,  // Asegura que el título ocupe el espacio disponible
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
  messageCard: {
    marginTop: 16,
    borderRadius: 8,
    padding: 10,
  },
  successCard: {
    backgroundColor: '#e1f5e1', // Verde claro
  },
  errorCard: {
    backgroundColor: '#ffcccc', // Rojo claro
  },
  messageText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DynamicFormScreen;
