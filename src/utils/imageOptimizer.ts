import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { logger } from '../../logger';

// Permanent directory for book covers
const COVERS_DIR = `${FileSystem.documentDirectory}covers/`;

// Ensure covers directory exists
const ensureCoversDirectory = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(COVERS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(COVERS_DIR, { intermediates: true });
      logger.log('Created covers directory:', COVERS_DIR);
    }
  } catch (error) {
    logger.error('Error creating covers directory:', error);
    throw error;
  }
};

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  compress?: number;
  format?: ImageManipulator.SaveFormat;
}

/**
 * Optimizes an image by resizing and compressing it
 * @param {string} uri - The image URI to optimize
 * @param {OptimizeImageOptions} options - Optimization options
 * @returns {Promise<string>} - Optimized image URI (permanent location)
 */
export const optimizeImage = async (uri: string, options: OptimizeImageOptions = {}): Promise<string> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    compress = 0.7,
    format = ImageManipulator.SaveFormat.JPEG
  } = options;

  try {
    logger.log('Starting image optimization...');
    logger.log(`Original URI: ${uri.substring(0, 50)}...`);

    // Ensure permanent directory exists
    await ensureCoversDirectory();

    // Optimize the image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        { resize: { width: maxWidth, height: maxHeight } }
      ],
      {
        compress: compress,
        format: format
      }
    );

    // Generate a unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `cover_${timestamp}_${random}.jpg`;
    const permanentPath = COVERS_DIR + filename;

    // Copy to permanent location
    await FileSystem.copyAsync({
      from: result.uri,
      to: permanentPath
    });

    logger.log(`Image optimized and saved permanently`);
    logger.log(`Permanent path: ${permanentPath}`);

    return permanentPath;
  } catch (error) {
    logger.error('Image optimization failed:', error);
    // Return original URI if optimization fails
    return uri;
  }
};

/**
 * Optimizes a book cover image with book-specific settings
 * @param {string} uri - The image URI to optimize
 * @returns {Promise<string>} - Optimized image URI (permanent location)
 */
export const optimizeBookCover = async (uri: string): Promise<string> => {
  return optimizeImage(uri, {
    maxWidth: 600,
    maxHeight: 900,
    compress: 0.8,
    format: ImageManipulator.SaveFormat.JPEG
  });
};

/**
 * Creates a thumbnail from an image
 * @param {string} uri - The image URI
 * @returns {Promise<string>} - Thumbnail URI (permanent location)
 */
export const createThumbnail = async (uri: string): Promise<string> => {
  return optimizeImage(uri, {
    maxWidth: 200,
    maxHeight: 200,
    compress: 0.6,
    format: ImageManipulator.SaveFormat.JPEG
  });
};

/**
 * Validates if an image URI is valid and accessible
 * @param {string} uri - The image URI to validate
 * @returns {Promise<boolean>} - Whether the image is valid
 */
export const validateImage = async (uri: string): Promise<boolean> => {
  if (!uri) return false;
  
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists;
  } catch (error: unknown) {
    logger.error('Invalid image:', (error as Error).message);
    return false;
  }
};

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Gets image dimensions
 * @param {string} uri - The image URI
 * @returns {Promise<ImageDimensions>} - Image dimensions
 */
export const getImageDimensions = async (uri: string): Promise<ImageDimensions> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return {
      width: result.width,
      height: result.height
    };
  } catch (error) {
    logger.error('Could not get image dimensions:', error);
    return { width: 0, height: 0 };
  }
};

/**
 * Deletes a cover image from permanent storage
 * @param {string} uri - The image URI to delete
 */
export const deleteBookCover = async (uri: string): Promise<void> => {
  try {
    if (uri && uri.startsWith(COVERS_DIR)) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      logger.log('Deleted cover image:', uri);
    }
  } catch (error) {
    logger.error('Error deleting cover:', error);
  }
};