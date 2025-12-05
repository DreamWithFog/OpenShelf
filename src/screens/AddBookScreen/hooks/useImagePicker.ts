import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { optimizeBookCover } from '../../../utils/imageOptimizer';
import { logger } from '../../../../logger';

interface ImagePickerDispatch {
  type: 'SET_FIELD';
  field: string;
  value: string | null;
}

const useImagePicker = (
  dispatch: React.Dispatch<ImagePickerDispatch>,
  setImagePreview: (uri: string | null) => void,
  setIsOptimizing: (isOptimizing: boolean) => void
) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission Required", "We need access to your photos to upload a book cover.");
        return;
      }

      setIsUploading(true);
      setIsOptimizing(true);
      
      let result = await ImagePicker.launchImageLibraryAsync({ 
        allowsEditing: true,
        aspect: [2, 3],
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const originalUri = result.assets[0].uri;
        dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: originalUri });
        setImagePreview(originalUri);
        
        try {
          const optimizedUri = await optimizeBookCover(originalUri);
          
          dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: optimizedUri });
          setImagePreview(optimizedUri);
          
          // Success haptic feedback (no alert - visual feedback in UI instead)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          logger.error("Error optimizing image:", error);
          dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: originalUri });
        }
        
        setIsOptimizing(false);
        setIsUploading(false);
      } else {
        // User cancelled - reset states
        logger.log('Image picker cancelled by user');
        setIsOptimizing(false);
        setIsUploading(false);
      }
    } catch (error) {
      logger.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsUploading(false);
      setIsOptimizing(false);
    }
  }, [dispatch, setImagePreview, setIsOptimizing]);

  return {
    isUploading,
    pickImage,
  };
};

export default useImagePicker;
