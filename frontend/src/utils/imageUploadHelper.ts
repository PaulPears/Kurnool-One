import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface PickImageOptions {
  source?: 'camera' | 'gallery' | 'prompt';
  title?: string;
  message?: string;
  maxWidth?: number;
  quality?: number;
  freeStyleCrop?: boolean;
}

export interface PickedImageResult {
  uri: string;
  width: number;
  height: number;
}

/**
 * Prompts user to choose Camera or Gallery, allows Free-Style Cropping on Android,
 * and compresses image to ~120KB for high performance and low storage cost.
 */
export async function pickImageWithFreeStyleCrop(
  options: PickImageOptions = {}
): Promise<PickedImageResult | null> {
  const {
    source = 'prompt',
    title = 'Select Photo',
    message = 'Choose photo source to crop and upload:',
    maxWidth = 1280,
    quality = 0.75,
  } = options;

  if (source === 'prompt') {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: '📷 Take Photo',
            onPress: async () => {
              const res = await launchPicker('camera', maxWidth, quality);
              resolve(res);
            },
          },
          {
            text: '🖼️ Choose from Gallery',
            onPress: async () => {
              const res = await launchPicker('gallery', maxWidth, quality);
              resolve(res);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  }

  return launchPicker(source, maxWidth, quality);
}

async function launchPicker(
  mode: 'camera' | 'gallery',
  maxWidth: number,
  quality: number
): Promise<PickedImageResult | null> {
  try {
    let pickerResult: ImagePicker.ImagePickerResult;

    if (mode === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
        return null;
      }
      pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true, // Native Android cropper (free-style dragging)
        quality: 0.9,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
        return null;
      }
      pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, // Native Android cropper (free-style dragging)
        quality: 0.9,
      });
    }

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      return null;
    }

    const picked = pickerResult.assets[0];

    // Compress & resize cropped image
    const actions: ImageManipulator.Action[] = [];
    if (picked.width > maxWidth) {
      actions.push({ resize: { width: maxWidth } });
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      picked.uri,
      actions,
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    return {
      uri: manipulated.uri,
      width: manipulated.width,
      height: manipulated.height,
    };
  } catch (error) {
    console.warn('pickImageWithFreeStyleCrop error:', error);
    Alert.alert('Error', 'Unable to pick or crop image. Please try again.');
    return null;
  }
}

