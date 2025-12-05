import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { autoDetectAndParse } from '../../../utils/importers';
import { logger } from '../../../../logger';
import { Book, ImportStats } from '../../../types';  // FIX: Import ImportStats

export const useFileImport = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedBooks, setParsedBooks] = useState<Partial<Book>[] | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [detectedSource, setDetectedSource] = useState<string | null>(null);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/plain', 'text/tab-separated-values'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      const file = result.assets[0];
      
      // Check file extension
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.tsv') && !fileName.endsWith('.txt')) {
        Alert.alert(
          'Invalid File',
          'Please select a CSV or TSV file exported from Goodreads, LibraryThing, or StoryGraph.'
        );
        return;
      }

      setIsProcessing(true);
      
      // Read file content using legacy FileSystem API
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error('File is empty');
      }

      // Parse the CSV
      const { books, stats, source } = await autoDetectAndParse(fileContent);

      if (books.length === 0) {
        Alert.alert('No Books Found', 'The file does not contain any valid book entries.');
        setIsProcessing(false);
        return;
      }

      // Show preview and confirmation - FIX: Convert stats to ImportStats
      setParsedBooks(books);
      setImportStats({
        totalBooks: books.length,
        imported: stats.imported,
        skipped: stats.skipped,
        failed: 0
      });
      setDetectedSource(source);
      setIsProcessing(false);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      logger.error('File picker error:', error);
      Alert.alert('Error', (error as any).message || 'Failed to read file. Please try again.');
      setIsProcessing(false);
      setParsedBooks(null);
      setImportStats(null);
      setDetectedSource(null);
    }
  };

  const handleCancel = () => {
    setParsedBooks(null);
    setImportStats(null);
    setDetectedSource(null);
  };

  return {
    isProcessing,
    parsedBooks,
    importStats,
    detectedSource,
    handlePickFile,
    handleCancel,
    setIsProcessing,
  };
};
