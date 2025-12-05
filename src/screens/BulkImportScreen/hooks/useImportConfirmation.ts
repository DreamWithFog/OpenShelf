import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { findPotentialDuplicates, insertBook } from '../../../../database';
import { logger } from '../../../../logger';
import { SQLiteDatabase } from 'expo-sqlite';
import { Book, NewBook, RootStackParamList } from '../../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type BulkImportNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BulkImport'>;

export const useImportConfirmation = (
  db: SQLiteDatabase,
  parsedBooks: Partial<Book>[] | null,
  detectedSource: string | null,
  setIsProcessing: (isProcessing: boolean) => void,
  navigation: BulkImportNavigationProp
) => {
  const handleConfirmImport = async () => {
    if (!parsedBooks || parsedBooks.length === 0 || !db) {
      return;
    }

    Alert.alert(
      'Confirm Import',
      `Import ${parsedBooks.length} books from ${detectedSource}?\n\nDuplicate checking will be performed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'default',
          onPress: async () => {
            setIsProcessing(true);

            try {
              let importedCount = 0;
              let skippedCount = 0;
              let duplicateCount = 0;
              const duplicatesFound: { title: string; existing: string; confidence: number }[] = [];

              for (const book of parsedBooks) {
                // Check for duplicates
                const duplicates = await findPotentialDuplicates(
                  db,
                  book.title || '',
                  book.author || '',
                  book.isbn || ''
                );

                if (duplicates.length > 0 && typeof duplicates[0].confidence === 'number' && duplicates[0].confidence >= 0.85) {
                  // High confidence duplicate - skip it
                  duplicateCount++;
                  duplicatesFound.push({
                    title: book.title || '',
                    existing: duplicates[0].book.title,
                    confidence: duplicates[0].confidence,
                  });
                  continue;
                }

                // No duplicate or low confidence - import it
                // FIX: Convert Partial<Book> to NewBook
                try {
                  const newBook: NewBook = {
                    title: book.title || '',
                    author: book.author,
                    coverUrl: book.coverUrl,
                    coverPath: book.coverPath,
                    status: book.status,
                    rating: book.rating,
                    totalPages: book.totalPages,
                    currentPage: book.currentPage,
                    bookUrl: book.bookUrl,
                    tags: book.tags,
                    isbn: book.isbn,
                    format: book.format,
                    publisher: book.publisher,
                    publicationYear: book.publicationYear,
                    language: book.language,
                    originalLanguage: book.originalLanguage,
                    seriesName: book.seriesName,
                    seriesOrder: book.seriesOrder,
                    volumeNumber: book.volumeNumber,
                    totalVolumes: book.totalVolumes,
                    totalChapters: book.totalChapters,
                    currentChapter: book.currentChapter,
                    trackingType: book.trackingType,
                    collectionType: book.collectionType,
                    seriesCoverUrl: book.seriesCoverUrl,
                    totalInSeries: book.totalInSeries,
                  };
                  await insertBook(db, newBook);
                  importedCount++;
                } catch (error) {
                  logger.error('Error importing book:', book.title, error);
                  skippedCount++;
                }
              }

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              // Show detailed results
              let resultMessage = `Imported: ${importedCount}\n`;
              if (duplicateCount > 0) {
                resultMessage += `Duplicates skipped: ${duplicateCount}\n`;
              }
              if (skippedCount > 0) {
                resultMessage += `Failed: ${skippedCount}\n`;
              }

              if (duplicatesFound.length > 0 && duplicatesFound.length <= 5) {
                resultMessage += '\nSkipped duplicates:\n';
                duplicatesFound.forEach(dup => {
                  resultMessage += `• ${dup.title}\n`;
                });
              } else if (duplicatesFound.length > 5) {
                resultMessage += `\n${duplicatesFound.length} duplicates were skipped.`;
              }

              Alert.alert(
                'Import Complete!',
                resultMessage,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.goBack();
                    },
                  },
                ]
              );
            } catch (error) {
              logger.error('Batch import error:', error);
              Alert.alert('Import Failed', 'An error occurred while importing books. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return { handleConfirmImport };
};
