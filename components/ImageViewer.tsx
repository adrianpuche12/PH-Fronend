import React, { useState } from 'react';
import { View, Image, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ImageViewerProps {
  imageUri: string;
  size?: 'small' | 'medium' | 'large';
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUri, size = 'small' }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const getImageSize = () => {
    switch (size) {
      case 'small': return { width: 50, height: 50 };
      case 'medium': return { width: 100, height: 100 };
      case 'large': return { width: 150, height: 150 };
      default: return { width: 50, height: 50 };
    }
  };

  if (!imageUri || imageError) {
    return (
      <TouchableOpacity style={[styles.noImageContainer, getImageSize()]}>
        <MaterialCommunityIcons name="image-off" size={24} color="#ccc" />
        <Text style={styles.noImageText}>Sin imagen</Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.thumbnail, getImageSize()]}
          onError={() => setImageError(true)}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconButton
              icon="close"
              size={30}
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            />
            <Image
              source={{ uri: imageUri }}
              style={{
                width: screenWidth * 0.9,
                height: screenHeight * 0.7,
                resizeMode: 'contain',
              }}
              onError={() => setImageError(true)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  thumbnail: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noImageContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noImageText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ImageViewer;