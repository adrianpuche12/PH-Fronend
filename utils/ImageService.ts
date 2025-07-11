import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { IMAGE_SERVER_URL } from '../config';

export interface ImageUploadResult {
  success: boolean;
  imageUri?: string;
  error?: string;
}

export class ImageService {
    /**
   * Permite al usuario seleccionar una imagen (solo selecciona, no sube)
   */
  static async selectImage(): Promise<DocumentPicker.DocumentPickerResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      
      return result;
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      throw error;
    }
  }

  /**
   * Sube una imagen al servidor Python
   */
  static async uploadImage(
    imageUri: string, 
    fileName: string,
    folder: string = 'comprobantes'
  ): Promise<ImageUploadResult> {
    try {
      let formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        formData.append('file', file);
      } else {
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: fileName,
        } as any);
      }

      const uploadResponse = await fetch(`${IMAGE_SERVER_URL}/${folder}/${fileName}`, {
        method: 'PUT',
        body: formData,
      });

      if (uploadResponse.ok) {
        const imageUrl = `${IMAGE_SERVER_URL}/${folder}/${fileName}`;
        return {
          success: true,
          imageUri: imageUrl,
        };
      } else {
        return {
          success: false,
          error: `Error del servidor: ${uploadResponse.status}`,
        };
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Genera un nombre único para la imagen
   */
  static generateFileName(prefix: string = 'IMG'): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}.jpg`;
  }
}