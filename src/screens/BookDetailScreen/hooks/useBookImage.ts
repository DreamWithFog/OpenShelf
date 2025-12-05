import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { optimizeBookCover } from '../../../utils/imageOptimizer';
import { isValidImageUrl } from '../../../utils/helpers';
import { logger } from '../../../../logger';
import { Book, FormState, BookAction } from '../../../types';

export const useBookImage = (
  dispatch: Dispatch<BookAction>,
  isEditing: boolean,
  bookState: Partial<FormState>,
  book: Book | null
): {
  isUploadingImage: boolean;
  isOptimizingImage: boolean;
  imagePreview: string | null;
  setImagePreview: Dispatch<SetStateAction<string | null>>;
  setIsUploadingImage: Dispatch<SetStateAction<boolean>>;
  setIsOptimizingImage: Dispatch<SetStateAction<boolean>>;
  handlePickImage: () => Promise<void>;
  handleCoverUrlChange: (value: string) => void;
} => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      setImagePreview(bookState.tempCoverUrl || book?.coverUrl || null);
    } else {
      setImagePreview(null);
    }
  }, [isEditing, bookState.tempCoverUrl]);

  const handlePickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to pick images.'
        );
        return;
      }

      let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsUploadingImage(true);
        setIsOptimizingImage(true);

        const originalUri = result.assets[0].uri;

        logger.log('Original image selected for book cover update');

        setImagePreview(originalUri);

        try {
          const optimizedUri = await optimizeBookCover(originalUri);

          dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: optimizedUri });
          setImagePreview(optimizedUri);

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          Alert.alert(
            "Success",
            "Image optimized and ready to save!",
            [{ text: "OK" }]
          );
        } catch (error: unknown) {
          logger.error("Error optimizing image:", error);
          dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: originalUri });
        }

        setIsOptimizingImage(false);
        setIsUploadingImage(false);
      }
    } catch (error: unknown) {
      logger.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsUploadingImage(false);
      setIsOptimizingImage(false);
    }
  }, [dispatch]);

  const handleCoverUrlChange = useCallback((value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'coverUrl', value });
    if (isValidImageUrl(value)) {
      setImagePreview(value);
    } else if (!value) {
      setImagePreview(null);
    }
  }, [dispatch]);

  return {
    isUploadingImage,
    isOptimizingImage,
    imagePreview,
    setImagePreview,
    setIsUploadingImage,
    setIsOptimizingImage,
    handlePickImage,
    handleCoverUrlChange
  };
};
