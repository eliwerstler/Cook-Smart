import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DrinkType {
  name: string;
  icon: string;
  alcoholContent: number;
}

const DRINK_TYPES: DrinkType[] = [
  { name: 'Beer', icon: '🍺', alcoholContent: 1.0 },
  { name: 'Wine', icon: '🍷', alcoholContent: 1.5 },
  { name: 'Cocktail', icon: '🍸', alcoholContent: 1.5 },
  { name: 'Shot', icon: '🥃', alcoholContent: 1.0 },
  { name: 'Mixed Drink', icon: '🍹', alcoholContent: 1.5 },
  { name: 'Champagne', icon: '🍾', alcoholContent: 1.5 },
];

interface DrinkTypeSelectorProps {
  visible: boolean;
  photoUri: string;
  onClose: () => void;
  onSubmit: (drinkType: string, alcoholContent: number, caption: string) => void;
}

export default function DrinkTypeSelector({
  visible,
  photoUri,
  onClose,
  onSubmit,
}: DrinkTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<DrinkType | null>(null);
  const [caption, setCaption] = useState('');
  const [customAlcoholContent, setCustomAlcoholContent] = useState('');

  const handleSubmit = () => {
    if (!selectedType) return;

    const alcoholContent = customAlcoholContent
      ? parseFloat(customAlcoholContent)
      : selectedType.alcoholContent;

    onSubmit(selectedType.name, alcoholContent, caption);

    // Reset
    setSelectedType(null);
    setCaption('');
    setCustomAlcoholContent('');
  };

  const handleClose = () => {
    setSelectedType(null);
    setCaption('');
    setCustomAlcoholContent('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Drink</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selectedType}
            style={!selectedType && styles.disabled}
          >
            <Text style={[styles.postButton, !selectedType && styles.disabledText]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Photo Preview */}
          <Image source={{ uri: photoUri }} style={styles.photo} />

          {/* Caption Input */}
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption..."
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={200}
          />

          {/* Drink Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What are you drinking?</Text>
            <View style={styles.drinkTypesGrid}>
              {DRINK_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.name}
                  style={[
                    styles.drinkTypeCard,
                    selectedType?.name === type.name && styles.drinkTypeCardSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={styles.drinkTypeIcon}>{type.icon}</Text>
                  <Text style={styles.drinkTypeName}>{type.name}</Text>
                  <Text style={styles.drinkTypeStandards}>{type.alcoholContent} std</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Alcohol Content */}
          {selectedType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Standard Drinks (Default: {selectedType.alcoholContent})
              </Text>
              <TextInput
                style={styles.standardsInput}
                placeholder={`${selectedType.alcoholContent}`}
                placeholderTextColor="#999"
                value={customAlcoholContent}
                onChangeText={setCustomAlcoholContent}
                keyboardType="decimal-pad"
              />
              <Text style={styles.helperText}>
                Adjust if this drink has more or less alcohol than usual
              </Text>
            </View>
          )}

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#666" />
            <Text style={styles.infoText}>
              Standard drinks help us calculate your BPH accurately
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    color: '#0095f6',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  captionInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  drinkTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  drinkTypeCard: {
    width: '31%',
    margin: '1%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  drinkTypeCardSelected: {
    borderColor: '#0095f6',
    backgroundColor: '#e3f2fd',
  },
  drinkTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  drinkTypeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  drinkTypeStandards: {
    fontSize: 12,
    color: '#666',
  },
  standardsInput: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    margin: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
