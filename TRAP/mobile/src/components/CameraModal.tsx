import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import DrinkTypeSelector from './DrinkTypeSelector';
import { drinkService } from '../services/drinkService';
import { uploadImage } from '../services/uploadService';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onDrinkPosted: () => void;
}

export default function CameraModal({ visible, onClose, onDrinkPosted }: CameraModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [posting, setPosting] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        setPhotoUri(photo.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleDrinkSelected = async (
    drinkType: string,
    alcoholContent: number,
    caption: string
  ) => {
    try {
      setPosting(true);

      let uploadedPhotoUrl: string | undefined;

      // Upload photo to Cloudinary if we have one
      if (photoUri) {
        try {
          console.log('Uploading photo to Cloudinary...');
          uploadedPhotoUrl = await uploadImage(photoUri, 'drinks');
          console.log('Photo uploaded successfully:', uploadedPhotoUrl);
        } catch (uploadError: any) {
          console.error('Photo upload failed:', uploadError);

          // Ask user if they want to continue without photo
          const shouldContinue = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Upload Failed',
              'Photo upload failed. Post without a photo?',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Post Anyway', onPress: () => resolve(true) },
              ]
            );
          });

          if (!shouldContinue) {
            setPosting(false);
            return;
          }
        }
      }

      // Create the drink
      await drinkService.createDrink({
        drinkType,
        alcoholContent,
        caption: caption || undefined,
        photoUrl: uploadedPhotoUrl,
      });

      Alert.alert('Success', 'Drink posted! 🍺');

      // Reset state
      setPhotoUri(null);
      setPosting(false);

      // Notify parent
      onDrinkPosted();
    } catch (error: any) {
      console.error('Error posting drink:', error);
      Alert.alert('Error', error.message || 'Failed to post drink');
      setPosting(false);
    }
  };

  const handleClose = () => {
    setPhotoUri(null);
    setPosting(false);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#999" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            TRAP needs access to your camera to take drink photos
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {posting ? (
          // Posting state
          <View style={styles.postingContainer}>
            <ActivityIndicator size="large" color="#0095f6" />
            <Text style={styles.postingText}>Posting your drink...</Text>
          </View>
        ) : photoUri ? (
          // Drink type selector with photo preview
          <DrinkTypeSelector
            photoUri={photoUri}
            onSubmit={handleDrinkSelected}
            onCancel={handleRetake}
          />
        ) : (
          // Camera View
          <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraFooter}>
              <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  postingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  postingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
