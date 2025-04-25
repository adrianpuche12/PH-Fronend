import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';

interface StoreSelectorProps {
  selectedStore: number;
  onStoreChange: (storeId: number) => void;
  style?: any;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ selectedStore, onStoreChange, style }) => {
  const stores = [
    { id: 1, name: 'Danli' },
    { id: 2, name: 'El Paraiso' },
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Seleccione Local:</Text>
      <RadioButton.Group
        onValueChange={(value) => onStoreChange(Number(value))}
        value={selectedStore.toString()}
      >
        {stores.map((store) => (
          <RadioButton.Item
            key={store.id}
            label={store.name}
            value={store.id.toString()}
            style={styles.radioItem}
            labelStyle={styles.radioLabel}
            color="#D4A72B"
          />
        ))}
      </RadioButton.Group>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
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
});

export default StoreSelector;