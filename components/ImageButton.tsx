// components/ImageButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageViewer from './ImageViewer';

interface ImageButtonProps {
  imageUri?: string;
  onPress?: () => void;
}

const ImageButton: React.FC<ImageButtonProps> = ({ imageUri, onPress }) => {
  if (!imageUri) {
    return (
      <TouchableOpacity style={styles.noImageButton} disabled>
        <MaterialCommunityIcons name="image-off" size={16} color="#ccc" />
        <Text style={styles.noImageText}>Sin comprobante</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.imageButton} onPress={onPress}>
      <MaterialCommunityIcons name="image" size={16} color="#2196F3" />
      <Text style={styles.imageButtonText}>Ver comprobante</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    marginTop: 5,
  },
  imageButtonText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
  },
  noImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginTop: 5,
  },
  noImageText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});

export default ImageButton;