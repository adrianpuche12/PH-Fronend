import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  TouchableOpacity,
  Text,
  Image
} from 'react-native';
import {
  TextInput,
  Button,
  RadioButton,
  Card,
  Title,
  Avatar,
  HelperText
} from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { format } from 'date-fns';
import ResponsiveButton from '../components/ui/responsiveButton';
import { REACT_APP_API_URL } from '../config';
import StoreSelector from '../components/StoreSelector';
import { formatAmountInput, parseFormattedNumber } from '../utils/numberFormat';
import { ImageService } from '../utils/ImageService';
import ImagePicker from '../components/ImagePicker';

const BACKEND_URL = `${REACT_APP_API_URL}/api/forms`;
const TRANSACTIONS_URL = `${REACT_APP_API_URL}/transactions`;

const DynamicFormScreen = () => {
  const getCurrentFormattedDate = () => format(new Date(), 'yyyy-MM-dd');
  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  interface FormDataType {
    type: string;
    amount: string;
    date: string;
    description: string;
    closingsCount: string;
    periodStart: string;
    periodEnd: string;
    storeId: number;
    supplier: string;
    porcentajeDanli: number;
    porcentajeParaiso: number;
    imageUri: string;
    [key: string]: any;
  }

  interface SelectedImage {
    uri: string;
    name: string;
    type: string;
  }

  const [formData, setFormData] = useState<FormDataType>({
    type: '',
    amount: '',
    date: getCurrentFormattedDate(),
    description: '',
    closingsCount: '',
    periodStart: '',
    periodEnd: '',
    storeId: 0,
    supplier: '',
    porcentajeDanli: 50,
    porcentajeParaiso: 50,
    imageUri: '',
  });

  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dateRangePickerVisible, setDateRangePickerVisible] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<'date' | ''>('');
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined,
    endDate: Date | undefined,
  }>({
    startDate: undefined,
    endDate: undefined,
  });

  const [formType, setFormType] = useState<'transaction' | 'closing-deposits' | 'supplier-payments' | 'salary-payments' | 'gasto-admin' | ''>('');
  const [showMessageCard, setShowMessageCard] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const slideAnim = useState(new Animated.Value(-100))[0];
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const today = new Date();
    setFormData(prevData => ({
      ...prevData,
      date: getCurrentFormattedDate()
    }));
  }, []);

  // Establecer tipo automáticamente para gasto-admin
  useEffect(() => {
    if (formType === 'gasto-admin') {
      handleInputChange('type', 'expense');
    }
  }, [formType]);

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
    const currentDate = getCurrentFormattedDate();

    handleInputChange('amount', '');
    handleInputChange('date', currentDate);
    handleInputChange('description', '');
    handleInputChange('type', '');
    handleInputChange('closingsCount', '');
    handleInputChange('periodStart', '');
    handleInputChange('periodEnd', '');
    handleInputChange('storeId', 0);
    handleInputChange('supplier', '');
    handleInputChange('porcentajeDanli', 50);
    handleInputChange('porcentajeParaiso', 50);
    setSelectedImage(null);
    setDateRange({
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === 'amount') {
      if (value) {
        const formattedValue = formatAmountInput(value);
        setFormData((prevData: FormDataType) => ({
          ...prevData,
          [field]: formattedValue,
        }));
      } else {
        setFormData((prevData: FormDataType) => ({
          ...prevData,
          [field]: '',
        }));
      }
    } else {
      setFormData((prevData: FormDataType) => ({
        ...prevData,
        [field]: value,
      }));
    }
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
  };

  const handleDateConfirm = (params: { date: Date | undefined }) => {
    if (params.date) {
      const formattedDate = format(params.date, 'yyyy-MM-dd');
      setFormData((prevData: FormDataType) => ({
        ...prevData,
        [selectedDateField]: formattedDate,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, [selectedDateField]: false }));
    }
    setDatePickerVisible(false);
    setSelectedDateField('');
  };

  const handleDateRangeConfirm = ({
    startDate,
    endDate
  }: {
    startDate: Date | undefined,
    endDate: Date | undefined
  }) => {
    setDateRange({ startDate, endDate });

    if (startDate) {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      setFormData((prevData: FormDataType) => ({
        ...prevData,
        periodStart: formattedStartDate,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, periodStart: false }));
    }

    if (endDate) {
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      setFormData((prevData: FormDataType) => ({
        ...prevData,
        periodEnd: formattedEndDate,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, periodEnd: false }));
    }

    setDateRangePickerVisible(false);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};

    // Validación para transacciones
    if (formType === 'transaction' && !formData.type) {
      newErrors.type = true;
    }

    // Validación para gastos administrativos
    if (formType === 'gasto-admin') {
      if (!formData.amount || parseFloat(formData.amount.replace(/,/g, '')) <= 0) newErrors.amount = true;
      if (!formData.description.trim()) newErrors.description = true;
      if (!formData.date) newErrors.date = true;
      
      if ((formData.porcentajeDanli + formData.porcentajeParaiso) !== 100) {
        newErrors.porcentajes = true;
      }
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
      showMessage('error', 'Por favor complete todos los campos requeridos');
      return;
    }

    try {
      let imageUri = null;

      if (selectedImage) {
        const uploadResult = await ImageService.uploadImage(
          selectedImage.uri,
          selectedImage.name = ImageService.generateFileName('IMG'),
          'comprobantes'
        );
        
        if (uploadResult.success) {
          imageUri = uploadResult.imageUri;
        } else {
          showMessage('error', 'Error al subir imagen: ' + uploadResult.error);
          return;
        }
      }

      const url =
        formType === 'transaction'
          ? TRANSACTIONS_URL
          : formType === 'gasto-admin'
          ? `${BACKEND_URL}/gasto-admin`
          : `${BACKEND_URL}/${formType}`;

      const amountValue = formData.amount ? formData.amount.replace(/,/g, '') : '0';
      const amount = parseFloat(amountValue);

      const basePayload: any =
        formType === 'gasto-admin'
          ? {
              fecha: formData.date,
              monto: amount,
              descripcion: formData.description.trim(),
              tipo: 'expense',
              porcentajeDanli: formData.porcentajeDanli,
              porcentajeParaiso: formData.porcentajeParaiso,
              imageUri: imageUri,
            }
          : {
              ...formData,
              amount,
              store: { id: formData.storeId },
              username: 'default_user',
              date: formData.date,
              salaryDate: formData.date,
              paymentDate: formData.date,
              depositDate: formData.date,
              imageUri: imageUri,
            };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basePayload),
      });

      if (response.ok) {
        if (formType === 'gasto-admin') {
          const result = await response.json();
          showMessage('success', `${result.mensaje} (ID: ${result.gastoAdminId})`);
        } else {
          showMessage('success', 'Datos enviados correctamente');
        }
        clearData();
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

  const renderImagePicker = () => (
    <ImagePicker
      onImageSelected={(image) => setSelectedImage(image)}
      initialImage={selectedImage}
      disabled={false}
    />
  );

  const renderSupplierList = () => {
    const suppliers = ['Pollo Rey', 'Pollo Cortijo', 'Pago a Proveedor de Frescos'];
    return (
      <View style={styles.supplierListContainer}>
        {suppliers.map((supplier) => (
          <RadioButton.Item
            key={supplier}
            label={supplier}
            value={supplier}
            status={formData.supplier === supplier ? 'checked' : 'unchecked'}
            onPress={() => handleInputChange('supplier', supplier)}
            style={styles.radioItem}
            labelStyle={styles.radioLabel}
            color="#D4A72B"
          />
        ))}
      </View>
    );
  };

  const renderTransactionForm = () => (
    <>
      <Title style={styles.formSectionTitle}>Selecciona el tipo de transacción</Title>
      <RadioButton.Group
        onValueChange={(value) => handleInputChange('type', value)}
        value={formData.type || ''}
      >
        <View style={styles.radioGroupContainer}>
          <RadioButton.Item
            label="Ingreso"
            value="income"
            style={styles.radioItem}
            labelStyle={styles.radioLabel}
            color="#D4A72B"
          />
          <RadioButton.Item
            label="Egreso"
            value="expense"
            style={styles.radioItem}
            labelStyle={styles.radioLabel}
            color="#D4A72B"
          />
        </View>
      </RadioButton.Group>
      {errors.type && (
        <HelperText type="error" visible>
          Debe seleccionar Ingreso o Egreso
        </HelperText>
      )}

      <StoreSelector
        selectedStore={formData.storeId}
        onStoreChange={(storeId) => handleInputChange('storeId', storeId)}
        style={styles.storeSelector}
      />

      <View style={styles.inputContainer}>
        <TextInput
          label="Monto"
          value={formData.amount}
          onChangeText={(value) => handleInputChange('amount', value)}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
          error={errors.amount}
          left={<TextInput.Icon icon="cash-multiple" color="#D4A72B" />}
          outlineColor="#DDDDDD"
          activeOutlineColor="#D4A72B"
          theme={{ colors: { primary: '#D4A72B' } }}
        />
      </View>

      <View style={styles.inputContainer}>
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
          left={<TextInput.Icon icon="calendar" color="#D4A72B" />}
          outlineColor="#DDDDDD"
          activeOutlineColor="#D4A72B"
          theme={{ colors: { primary: '#D4A72B' } }}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Descripción"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          mode="outlined"
          style={styles.input}
          error={errors.description}
          left={<TextInput.Icon icon="text" color="#D4A72B" />}
          outlineColor="#DDDDDD"
          activeOutlineColor="#D4A72B"
          theme={{ colors: { primary: '#D4A72B' } }}
        />
      </View>
      {renderImagePicker()}
    </>
  );

  const renderGastoAdminForm = () => (
    <>     
      

      <View style={styles.inputContainer}>
        <TextInput
          label="Monto Total"
          value={formData.amount}
          onChangeText={(value) => handleInputChange('amount', value)}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
          error={errors.amount}
          left={<TextInput.Icon icon="cash-multiple" color="#D4A72B" />}
          outlineColor="#DDDDDD"
          activeOutlineColor="#D4A72B"
          theme={{ colors: { primary: '#D4A72B' } }}
          placeholder="Monto a dividir entre locales"
        />
        {errors.amount && (
          <HelperText type="error" visible={true}>
            El monto debe ser mayor a 0
          </HelperText>
        )}
      </View>

      <View style={styles.inputContainer}>
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
          left={<TextInput.Icon icon="calendar" color="#D4A72B" />}
          outlineColor="#DDDDDD"
          activeOutlineColor="#D4A72B"
          theme={{ colors: { primary: '#D4A72B' } }}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Descripción"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          mode="outlined"
          style={styles.input}
          error={errors.description}
          left={<TextInput.Icon icon="text" color="#D4A72B" />}
          outlineColor="#DDDDDD"
          activeOutlineColor="#D4A72B"
          theme={{ colors: { primary: '#D4A72B' } }}
          placeholder="Descripción del gasto administrativo"
        />
        {errors.description && (
          <HelperText type="error" visible={true}>
            La descripción es obligatoria
          </HelperText>
        )}
      </View>

      <View style={styles.divisionContainer}>
        <Title style={styles.divisionTitle}>División entre Locales</Title>

        {formData.amount && parseFloat(formData.amount.replace(/,/g, '')) > 0 && (
          <Text style={styles.totalAmount}>
            Monto a dividir: ${parseFloat(formData.amount.replace(/,/g, '')).toFixed(2)}
          </Text>
        )}

        <View style={styles.quickButtonsContainer}>
          <Text style={styles.quickButtonsLabel}>Divisiones rápidas:</Text>
          <View style={styles.quickButtons}>
            {[
              { danli: 100, paraiso: 0, label: '100/0' },
              { danli: 70, paraiso: 30, label: '70/30' },
              { danli: 60, paraiso: 40, label: '60/40' },
              { danli: 50, paraiso: 50, label: '50/50' },
              { danli: 40, paraiso: 60, label: '40/60' },
              { danli: 30, paraiso: 70, label: '30/70' },
              { danli: 0, paraiso: 100, label: '0/100' }
            ].map(preset => (
              <TouchableOpacity
                key={preset.label}
                onPress={() => {
                  handleInputChange('porcentajeDanli', preset.danli);
                  handleInputChange('porcentajeParaiso', preset.paraiso);
                }}
                style={styles.quickButton}
              >
                <Text style={styles.quickButtonText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.localesContainer}>
          <View style={styles.localCard}>
            <Text style={styles.localName}>Danli</Text>
            <View style={styles.percentageContainer}>
              <TextInput
                mode="outlined"
                value={formData.porcentajeDanli.toString()}
                onChangeText={(value) => {
                  const numValue = parseInt(value) || 0;
                  const validValue = Math.max(0, Math.min(100, numValue));
                  handleInputChange('porcentajeDanli', validValue);
                  handleInputChange('porcentajeParaiso', Math.max(0, 100 - validValue));
                }}
                keyboardType="numeric"
                style={styles.percentageInput}
                maxLength={3}
                theme={{ colors: { primary: '#D4A72B' } }}
              />
              <Text style={styles.percentageSymbol}>%</Text>
            </View>
            {formData.amount && (
              <Text style={styles.localAmount}>
                ${((parseFloat(formData.amount.replace(/,/g, '')) || 0) * formData.porcentajeDanli / 100).toFixed(2)}
              </Text>
            )}
          </View>

          <View style={styles.localCard}>
            <Text style={styles.localName}>El Paraíso</Text>
            <View style={styles.percentageContainer}>
              <TextInput
                mode="outlined"
                value={formData.porcentajeParaiso.toString()}
                onChangeText={(value) => {
                  const numValue = parseInt(value) || 0;
                  const validValue = Math.max(0, Math.min(100, numValue));
                  handleInputChange('porcentajeParaiso', validValue);
                  handleInputChange('porcentajeDanli', Math.max(0, 100 - validValue));
                }}
                keyboardType="numeric"
                style={styles.percentageInput}
                maxLength={3}
                theme={{ colors: { primary: '#D4A72B' } }}
              />
              <Text style={styles.percentageSymbol}>%</Text>
            </View>
            {formData.amount && (
              <Text style={styles.localAmount}>
                ${((parseFloat(formData.amount.replace(/,/g, '')) || 0) * formData.porcentajeParaiso / 100).toFixed(2)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.validationContainer}>
          {(formData.porcentajeDanli + formData.porcentajeParaiso) === 100 ? (
            <Text style={styles.validationSuccess}>
              ✅ Porcentajes válidos: {(formData.porcentajeDanli + formData.porcentajeParaiso)}%
            </Text>
          ) : (
            <Text style={styles.validationError}>
              ❌ Los porcentajes deben sumar 100% (actual: {(formData.porcentajeDanli + formData.porcentajeParaiso)}%)
            </Text>
          )}
        </View>
      </View>

      {formData.amount && formData.description && (formData.porcentajeDanli + formData.porcentajeParaiso) === 100 && (
        <View style={styles.summaryContainer}>
          <Title style={styles.summaryTitle}>Vista Previa</Title>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryBold}>Se crearán 2 transacciones:</Text>
          </Text>
          <Text style={styles.summaryText}>
            • Danli ({formData.porcentajeDanli}%): ${((parseFloat(formData.amount.replace(/,/g, '')) || 0) * formData.porcentajeDanli / 100).toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>
            • El Paraíso ({formData.porcentajeParaiso}%): ${((parseFloat(formData.amount.replace(/,/g, '')) || 0) * formData.porcentajeParaiso / 100).toFixed(2)}
          </Text>
        </View>
      )}
      {renderImagePicker()}
    </>
  );

  const renderFormFields = () => {
    switch (formType) {
      case 'transaction':
        return renderTransactionForm();
      case 'gasto-admin':
        return renderGastoAdminForm();
      case 'closing-deposits':
        return (
          <>
            <StoreSelector
              selectedStore={formData.storeId}
              onStoreChange={(storeId) => handleInputChange('storeId', storeId)}
              style={styles.storeSelector}
            />

            <View style={styles.inputContainer}>
              <TextInput
                label="Cantidad de cierres (opcional)"
                value={formData.closingsCount}
                onChangeText={(value) => handleInputChange('closingsCount', value)}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="counter" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                label="Monto"
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                error={errors.amount}
                left={<TextInput.Icon icon="cash-multiple" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Fecha de Depósito"
                value={formData.date ? format(parseDate(formData.date), 'yyyy-MM-dd') : ''}
                mode="outlined"
                onFocus={() => {
                  setSelectedDateField('date');
                  setDatePickerVisible(true);
                }}
                style={styles.input}
                error={errors.date}
                left={<TextInput.Icon icon="calendar" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
                showSoftInputOnFocus={false}
              />
              {errors.date && (
                <HelperText type="error" visible={true}>
                  La fecha de depósito es obligatoria
                </HelperText>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Periodo (Desde - Hasta)"
                value={formData.periodStart && formData.periodEnd ?
                  `${formData.periodStart} - ${formData.periodEnd}` :
                  ''}
                mode="outlined"
                onFocus={() => {
                  setDateRangePickerVisible(true);
                }}
                style={styles.input}
                error={errors.periodStart || errors.periodEnd}
                left={<TextInput.Icon icon="calendar-range" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
              {(errors.periodStart || errors.periodEnd) && (
                <HelperText type="error" visible={true}>
                  Debe seleccionar el periodo completo
                </HelperText>
              )}
            </View>
            {renderImagePicker()}
          </>
        );
      case 'supplier-payments':
        return (
          <>
            <Title style={styles.formSectionTitle}>Selecciona un proveedor</Title>
            {renderSupplierList()}

            <StoreSelector
              selectedStore={formData.storeId}
              onStoreChange={(storeId) => handleInputChange('storeId', storeId)}
              style={styles.storeSelector}
            />

            <View style={styles.inputContainer}>
              <TextInput
                label="Monto"
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                error={errors.amount}
                left={<TextInput.Icon icon="cash-multiple" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
            </View>
            <View style={styles.inputContainer}>
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
                left={<TextInput.Icon icon="calendar" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                label="Descripción"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                mode="outlined"
                style={styles.input}
                error={errors.description}
                left={<TextInput.Icon icon="text" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
            </View>
            {renderImagePicker()}
          </>
        );
      case 'salary-payments':
        return (
          <>
            <StoreSelector
              selectedStore={formData.storeId}
              onStoreChange={(storeId) => handleInputChange('storeId', storeId)}
              style={styles.storeSelector}
            />

            <View style={styles.inputContainer}>
              <TextInput
                label="Descripción"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                mode="outlined"
                style={styles.input}
                error={errors.description}
                left={<TextInput.Icon icon="text" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                label="Monto"
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                error={errors.amount}
                left={<TextInput.Icon icon="cash-multiple" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
            </View>
            <View style={styles.inputContainer}>
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
                left={<TextInput.Icon icon="calendar" color="#D4A72B" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#D4A72B"
                theme={{ colors: { primary: '#D4A72B' } }}
              />
            </View>
            {renderImagePicker()}
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0A8" />

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Avatar.Image
            size={100}
            source={require('../assets/images/logo_proyecto_Humberto.jpg')}
            style={styles.logo}
          />
        </View>
        <Title style={styles.welcomeText}>Administración de Operaciones</Title>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Formulario de Operaciones</Title>

            <Title style={styles.formSectionTitle}>Seleccione tipo de operación</Title>
            
            <RadioButton.Group
              onValueChange={(value: any) => setFormType(value)}
              value={formType}
            >
              <View style={styles.operationTypeContainer}>
                <RadioButton.Item
                  label="Transacción"
                  value="transaction"
                  style={styles.radioItem}
                  labelStyle={styles.radioLabel}
                  color="#D4A72B"
                />
                <RadioButton.Item
                  label="Gasto Administrativo"
                  value="gasto-admin"
                  style={styles.radioItem}
                  labelStyle={styles.radioLabel}
                  color="#D4A72B"
                />
                <RadioButton.Item
                  label="Depósito de Cierres"
                  value="closing-deposits"
                  style={styles.radioItem}
                  labelStyle={styles.radioLabel}
                  color="#D4A72B"
                />
                <RadioButton.Item
                  label="Pago a Proveedores"
                  value="supplier-payments"
                  style={styles.radioItem}
                  labelStyle={styles.radioLabel}
                  color="#D4A72B"
                />
                <RadioButton.Item
                  label="Salarios"
                  value="salary-payments"
                  style={styles.radioItem}
                  labelStyle={styles.radioLabel}
                  color="#D4A72B"
                />
              </View>
            </RadioButton.Group>

            {renderFormFields()}
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonText}
                buttonColor="#2196F3"
              >
                ENVIAR
              </Button>

              <Button
                mode="contained"
                onPress={clearData}
                style={styles.clearButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonText}
                buttonColor="#f5742f"
              >
                ↻ LIMPIAR FORMULARIO
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <DatePickerModal
        mode="single"
        visible={datePickerVisible}
        onDismiss={() => setDatePickerVisible(false)}
        onConfirm={handleDateConfirm}
        locale="es"
        date={formData.date ? parseDate(formData.date) : undefined}
        validRange={{ startDate: undefined, endDate: new Date() }}
      />

      <DatePickerModal
        mode="range"
        visible={dateRangePickerVisible}
        onDismiss={() => setDateRangePickerVisible(false)}
        onConfirm={handleDateRangeConfirm}
        locale="es"
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
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
    backgroundColor: '#F5F5F5',
  },
  topSection: {
    backgroundColor: '#FFF0A8',
    paddingVertical: 30,
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
    color: '#8B7214',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
    marginTop: -25,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 6,
    paddingVertical: 5,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  formSectionTitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  operationTypeContainer: {
    marginBottom: 15,
  },
  radioGroupContainer: {
    marginBottom: 15,
  },
  radioItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#444',
  },
  fixedTypeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D4A72B',
  },
  fixedTypeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  supplierListContainer: {
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: 15,
  },
  submitButton: {
    marginBottom: 15,
    borderRadius: 30,
    elevation: 2,
    paddingVertical: 5,
  },
  clearButton: {
    borderRadius: 30,
    elevation: 2,
    paddingVertical: 5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  storeSelector: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  divisionContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#D4A72B',
  },
  divisionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4A72B',
    marginBottom: 15,
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  quickButtonsContainer: {
    marginBottom: 15,
  },
  quickButtonsLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4A72B',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  localesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  localCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  localName: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
    fontSize: 14,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  percentageInput: {
    width: 60,
    height: 40,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  percentageSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginLeft: 4,
  },
  localAmount: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  validationContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  validationSuccess: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 14,
  },
  validationError: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontSize: 14,
  },
  summaryContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#1565c0',
    marginBottom: 5,
  },
  summaryBold: {
    fontWeight: 'bold',
  },
});

export default DynamicFormScreen;