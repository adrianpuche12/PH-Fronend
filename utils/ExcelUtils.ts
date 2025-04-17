import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';

interface Transaction {
  id?: number;
  type: string;
  amount: number;
  date: string;
  description?: string;
  supplier?: string;
  closingsCount?: number;
  periodStart?: string;
  periodEnd?: string;
  storeId?: number;
  store?: {
    id: number;
    name: string;
  };
}

export const IMPORT_TEMPLATE_HEADERS = [
  'Tipo', 'Monto', 'Fecha', 'Descripción', 'Local', 'Proveedor', 'CierresCantidad', 'PeriodoInicio', 'PeriodoFin'
];

// Función para exportar transacciones a Excel
export const exportToExcel = async (transactions: Transaction[], fileName?: string) => {
  try {
    const workbook = XLSX.utils.book_new();
    const formattedData = transactions.map(tx => {
      const storeName = tx.store?.name ||
        (tx.storeId === 1 ? 'Denly' :
          tx.storeId === 2 ? 'El Paraiso' : 'No asignado');

      return {
        'ID': tx.id || '',
        'Tipo': tx.type || '',
        'Monto': tx.amount,
        'Fecha': tx.date || '',
        'Descripción': tx.description || '',
        'Local': storeName,
        'Proveedor': tx.supplier || '',
        'Cantidad de Cierres': tx.closingsCount || '',
        'Periodo Desde': tx.periodStart || '',
        'Periodo Hasta': tx.periodEnd || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnWidths = [
      { wch: 5 },   // ID
      { wch: 15 },  // Tipo
      { wch: 12 },  // Monto
      { wch: 12 },  // Fecha
      { wch: 30 },  // Descripción
      { wch: 15 },  // Local
      { wch: 20 },  // Proveedor
      { wch: 10 },  // Cantidad de Cierres
      { wch: 12 },  // Periodo Desde
      { wch: 12 },  // Periodo Hasta
    ];
    worksheet['!cols'] = columnWidths;

    formattedData.forEach((_, idx) => {
      const cell = XLSX.utils.encode_cell({ r: idx + 1, c: 2 });
      if (!worksheet[cell]) return;

      worksheet[cell].z = '"L"#,##0.00';
    });
    const actualFileName = fileName || `Transacciones_${format(new Date(), 'yyyy-MM-dd')}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones');

    if (Platform.OS === 'web') {
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xFF;
      }
      const blob = new Blob([buf], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actualFileName}.xlsx`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      return { success: true, message: 'Archivo exportado con éxito' };
    } else {
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const filePath = `${FileSystem.documentDirectory}${actualFileName}.xlsx`;
      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Exportar Transacciones',
          UTI: 'com.microsoft.excel.xlsx'
        });
        return { success: true, message: 'Archivo exportado con éxito' };
      }
    }

    return { success: true, message: 'Exportación completada' };
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    return { success: false, message: 'Error al exportar: ' + error.message };
  }
};

// Función para crear y descargar una plantilla de importación
export const createImportTemplate = async () => {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([IMPORT_TEMPLATE_HEADERS]);
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['income', '1000.00', '2023-01-01', 'Ejemplo de ingreso', 'Denly', '', '', '', ''],
      ['expense', '500.00', '2023-01-02', 'Ejemplo de egreso', 'El Paraiso', '', '', '', ''],
      ['CLOSING', '2500.00', '2023-01-03', '', 'Denly', '', '5', '2023-01-01', '2023-01-15'],
      ['SUPPLIER', '1200.00', '2023-01-04', '', 'El Paraiso', 'Pollo Rey', '', '', ''],
      ['SALARY', '800.00', '2023-01-05', 'Pago de salario', 'Denly', '', '', '', '']
    ], { origin: 1 });

    // Ajustar el ancho de las columnas
    worksheet['!cols'] = [
      { wch: 15 },  // Tipo
      { wch: 12 },  // Monto
      { wch: 12 },  // Fecha
      { wch: 30 },  // Descripción
      { wch: 15 },  // Local
      { wch: 15 },  // Proveedor
      { wch: 15 },  // CierresCantidad
      { wch: 15 },  // PeriodoInicio
      { wch: 15 },  // PeriodoFin
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
    const fileName = `Plantilla_Importacion_${format(new Date(), 'yyyy-MM-dd')}`;

    if (Platform.OS === 'web') {
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xFF;
      }
      const blob = new Blob([buf], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.xlsx`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      return { success: true, message: 'Plantilla creada con éxito' };
    } else {
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const filePath = `${FileSystem.documentDirectory}${fileName}.xlsx`;
      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Plantilla de Importación',
          UTI: 'com.microsoft.excel.xlsx'
        });
        return { success: true, message: 'Plantilla creada con éxito' };
      }
    }

    return { success: true, message: 'Plantilla creada con éxito' };
  } catch (error) {
    console.error('Error al crear plantilla:', error);
    return { success: false, message: 'Error al crear plantilla: ' + error.message };
  }
};

// Función para importar datos desde Excel
export const importFromExcel = async (apiUrl: string) => {
  try {
    if (Platform.OS === 'web') {
      return new Promise<{ success: boolean, message: string, details?: any }>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls';
        input.addEventListener('change', async (e) => {
          const target = e.target as HTMLInputElement;
          if (!target.files || target.files.length === 0) {
            resolve({ success: false, message: 'No se seleccionó ningún archivo' });
            return;
          }

          const file = target.files[0];
          try {
            const reader = new FileReader();
            reader.onload = async (event) => {
              try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                if (!validateImportData(jsonData)) {
                  resolve({
                    success: false,
                    message: 'El formato del archivo no es válido. Por favor use la plantilla proporcionada.'
                  });
                  return;
                }
                const transactions = processTransactionsForImport(jsonData);
                const standardTransactions = transactions.filter(t =>
                  t.type === 'income' || t.type === 'expense');

                const closingTransactions = transactions.filter(t => t.type === 'CLOSING');
                const supplierTransactions = transactions.filter(t => t.type === 'SUPPLIER');
                const salaryTransactions = transactions.filter(t => t.type === 'SALARY');
                let totalImported = 0;
                let totalErrors = 0;
                const errors: string[] = [];

                const processSpecialTransactions = async (
                  transactions: any[],
                  apiUrl: string
                ): Promise<{ imported: number, errors: string[] }> => {
                  let imported = 0;
                  const errors: string[] = [];

                  for (const transaction of transactions) {
                    try {
                      let endpoint = '';

                      if (transaction.type === 'income' || transaction.type === 'expense') {
                        endpoint = `${apiUrl}/api/transactions`;
                      } else if (transaction.type === 'CLOSING') {
                        endpoint = `${apiUrl}/api/closing-deposits`;
                      } else if (transaction.type === 'SUPPLIER') {
                        endpoint = `${apiUrl}/api/supplier-payments`;
                      } else if (transaction.type === 'SALARY') {
                        endpoint = `${apiUrl}/api/salary-payments`;
                      } else {
                        errors.push(`Tipo desconocido: ${transaction.type}`);
                        continue;
                      }

                      console.log(`Enviando ${transaction.type} a ${endpoint}`, transaction);

                      const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(transaction),
                      });

                      if (response.ok) {
                        imported++;
                      } else {
                        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                        errors.push(`Error en ${transaction.type}: ${errorData.message || response.statusText}`);
                      }
                    } catch (error) {
                      errors.push(`Error al procesar ${transaction.type}: ${error.message}`);
                    }
                  }

                  return { imported, errors };
                };

                const result = await processSpecialTransactions(transactions, apiUrl);

                if (result.imported === transactions.length) {
                  return {
                    success: true,
                    message: `Importación exitosa: ${result.imported} transacciones importadas`
                  };
                } else if (result.imported > 0) {
                  return {
                    success: true,
                    message: `Importación parcial: ${result.imported} de ${transactions.length} transacciones importadas`,
                    details: { errors: result.errors }
                  };
                } else {
                  return {
                    success: false,
                    message: 'No se pudo importar ninguna transacción',
                    details: { errors: result.errors }
                  };
                }
              } catch (error) {
                resolve({
                  success: false,
                  message: 'Error al procesar el archivo: ' + error.message
                });
              }
            };
            reader.readAsBinaryString(file);
          } catch (error) {
            resolve({
              success: false,
              message: 'Error al leer el archivo: ' + error.message
            });
          }
        });

        input.click();
      });
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return { success: false, message: 'Importación cancelada por el usuario' };
      }
      const filePath = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64
      });
      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      if (!validateImportData(jsonData)) {
        return {
          success: false,
          message: 'El formato del archivo no es válido. Por favor use la plantilla proporcionada.'
        };
      }

      const transactions = processTransactionsForImport(jsonData);
      const standardTransactions = transactions.filter(t =>
        t.type === 'income' || t.type === 'expense');

      const closingTransactions = transactions.filter(t => t.type === 'CLOSING');
      const supplierTransactions = transactions.filter(t => t.type === 'SUPPLIER');
      const salaryTransactions = transactions.filter(t => t.type === 'SALARY');
      let totalImported = 0;
      let totalErrors = 0;
      const errors: string[] = [];

      // Preparar el mensaje de resultado
      if (totalImported > 0 && totalErrors === 0) {
        return {
          success: true,
          message: `Importación exitosa: ${totalImported} transacciones importadas`
        };
      } else if (totalImported > 0 && totalErrors > 0) {
        return {
          success: true,
          message: `Importación parcial: ${totalImported} transacciones importadas, ${totalErrors} con errores`,
          details: { errors }
        };
      } else {
        return {
          success: false,
          message: `Error en la importación: ${errors.join('; ')}`,
          details: { errors }
        };
      }
    }
  } catch (error) {
    console.error('Error en importación:', error);
    return { success: false, message: 'Error en la importación: ' + error.message };
  }
};

// Función para procesar los datos de transacciones para importación
const processTransactionsForImport = (jsonData: any[]): any[] => {
  return jsonData.map((row: any) => {
    let storeId;
    if (row['Local'] === 'Denly') {
      storeId = 1;
    } else if (row['Local'] === 'El Paraiso') {
      storeId = 2;
    }

    const baseTransaction = {
      type: row['Tipo'],
      amount: parseFloat(row['Monto'].toString()),
      date: row['Fecha'],
      description: row['Descripción'] || '',
      store: { id: storeId }
    };

    switch (row['Tipo']) {
      case 'CLOSING':
        return {
          ...baseTransaction,
          username: "default_user",
          closingsCount: row['CierresCantidad'] ? parseInt(row['CierresCantidad'].toString()) : undefined,
          periodStart: row['PeriodoInicio'] || undefined,
          periodEnd: row['PeriodoFin'] || undefined,
          depositDate: row['Fecha']
        };

      case 'SUPPLIER':
        return {
          ...baseTransaction,
          username: "default_user",
          supplier: row['Proveedor'] || undefined,
          paymentDate: row['Fecha']
        };

      case 'SALARY':
        return {
          ...baseTransaction,
          username: "default_user",
          depositDate: row['Fecha']
        };

      default: // income o expense
        return baseTransaction;
    }
  });
};

// Función para validar la estructura de los datos importados
const validateImportData = (data: any[]): boolean => {
  if (!data || data.length === 0) {
    return false;
  }

  const requiredColumns = ['Tipo', 'Monto', 'Fecha', 'Local'];
  const firstRow = data[0];

  for (const column of requiredColumns) {
    if (!(column in firstRow)) {
      return false;
    }
  }

  for (const row of data) {
    // Validar tipos de transacción
    const validTypes = ['income', 'expense', 'CLOSING', 'SALARY', 'SUPPLIER'];
    if (!validTypes.includes(row['Tipo'])) {
      return false;
    }

    // Validar el monto
    if (isNaN(parseFloat(row['Monto'].toString()))) {
      return false;
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(row['Fecha'])) {
      return false;
    }

    // Validar el local
    if (!['Denly', 'El Paraiso'].includes(row['Local'])) {
      return false;
    }

    // Validaciones específicas por tipo
    switch (row['Tipo']) {
      case 'CLOSING':
        // Si se proporciona PeriodoInicio o PeriodoFin, verificar formato
        if (row['PeriodoInicio'] && !dateRegex.test(row['PeriodoInicio'])) {
          return false;
        }
        if (row['PeriodoFin'] && !dateRegex.test(row['PeriodoFin'])) {
          return false;
        }
        break;

      case 'SUPPLIER':
        break;

      default:
        break;
    }
  }

  return true;
};  