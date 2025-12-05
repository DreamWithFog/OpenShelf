import { useState, useCallback, useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useFocusEffect, RouteProp, NavigationHelpers } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackNavigationState } from '@react-navigation/routers';
import * as Haptics from 'expo-haptics';

import { useAppContext } from '../../../context/AppContext';
import { useBooks } from '../../../hooks';
import { bulkUpdateBooks, bulkDeleteBooks } from '../../../../database';
import { logger } from '../../../../logger';
import { Book } from '../../../types/books';
import { RootStackParamList, ActiveSession } from '../../../types';
import { Theme } from '../../../context/AppContext';
import { SQLiteDatabase } from 'expo-sqlite';

type BookshelfScreenProps = NativeStackScreenProps<RootStackParamList, 'My Bookshelf'>;

export const useBookshelf = (navigation: BookshelfScreenProps['navigation'], route: BookshelfScreenProps['route']): {
  theme: Theme;
  gridView: string;
  activeSession: ActiveSession | null;
  db: SQLiteDatabase | null;
  prepareUndo: <T>(type: string, data: T, message: string, onUndo: () => void) => void;
  seriesFilter: string | null;
  isSelectionMode: boolean;
  setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedBooks: Book[];
  setSelectedBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  showBulkActions: boolean;
  setShowBulkActions: React.Dispatch<React.SetStateAction<boolean>>;
  previewBook: Book | null;
  setPreviewBook: React.Dispatch<React.SetStateAction<Book | null>>;
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  spotlightBook: Book | null;
  setSpotlightBook: React.Dispatch<React.SetStateAction<Book | null>>;
  showSpotlight: boolean;
  setShowSpotlight: React.Dispatch<React.SetStateAction<boolean>>;
  spotlightBooks: Book[];
  setSpotlightBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  showMultiSpotlight: boolean;
  setShowMultiSpotlight: React.Dispatch<React.SetStateAction<boolean>>;
  allBooks: Book[];
  isLoading: boolean;
  isRefreshing: boolean;
  fetchBooks: (refresh?: boolean) => Promise<void>;
  toggleSelectionMode: () => void;
  toggleBookSelection: (book: Book) => void;
  handleBulkAction: (action: string, value: string | number | null) => Promise<void>;
  handleSpotlightComplete: () => void;
  handleRefresh: () => void;
  handleBookPress: (book: Book & { isSeries?: boolean }) => void;
  handleBookLongPress: (book: Book & { isSeries?: boolean }) => void;
  handleBackFromSeries: () => void;
  handleMultiBookSpotlightComplete: () => void;
} => {
  const { theme, gridView, activeSession, db, prepareUndo } = useAppContext();
  const seriesFilter = route?.params?.seriesName || null;
  const newBookId = route?.params?.newBookId || null;
  const newBookIds = route?.params?.newBookIds || null;

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [spotlightBook, setSpotlightBook] = useState<Book | null>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightBooks, setSpotlightBooks] = useState<Book[]>([]);
  const [showMultiSpotlight, setShowMultiSpotlight] = useState(false);

  const { allBooks, isLoading, isRefreshing, fetchBooks } = useBooks('all');

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedBooks([]);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isSelectionMode]);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [fetchBooks])
  );

  const toggleSelectionMode = useCallback(() => {
    if (isSelectionMode) {
      setSelectedBooks([]);
      setIsSelectionMode(false);
    } else {
      setIsSelectionMode(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [isSelectionMode]);

  const toggleBookSelection = useCallback((book: Book) => {
    if (book.isSeries) return;

    setSelectedBooks(prev => {
      const isSelected = prev.some(b => b.id === book.id);
      if (isSelected) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev.filter(b => b.id !== book.id);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return [...prev, book];
      }
    });
  }, []);

  const handleBulkAction = useCallback(async (action: string, value: string | number | null) => {
    if (!db || selectedBooks.length === 0) return;

    const bookIds = selectedBooks.map(b => b.id);
    const bookCount = selectedBooks.length;
    const bookText = bookCount === 1 ? '1 book' : `${bookCount} books`;

    try {
      switch (action) {
        case 'delete': {
          const booksToDelete = [...selectedBooks];

          await bulkDeleteBooks(db, bookIds as number[]);

          prepareUndo(
            'books_deleted',
            booksToDelete,
            `Deleted ${bookText}`,
            async () => {
              for (const book of booksToDelete) {
                await db.runAsync(`
                  INSERT INTO books (
                    title, author, coverUrl, coverPath, status, rating,
                    totalPages, currentPage, bookUrl, isbn, tags,
                    format, publisher, publicationYear, language, originalLanguage,
                    seriesName, seriesOrder, volumeNumber, totalVolumes,
                    totalChapters, currentChapter, trackingType,
                    collectionType, seriesCoverUrl, totalInSeries
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                  book.title, book.author, book.coverUrl, book.coverPath,
                  book.status, book.rating, book.totalPages, book.currentPage,
                  book.bookUrl, book.isbn, JSON.stringify(book.tags || []),
                  book.format, book.publisher, book.publicationYear,
                  book.language, book.originalLanguage, book.seriesName,
                  book.seriesOrder, book.volumeNumber, book.totalVolumes,
                  book.totalChapters, book.currentChapter, book.trackingType,
                  book.collectionType, book.seriesCoverUrl, book.totalInSeries
                ]);
              }
              fetchBooks();
            }
          );
          break;
        }

        case 'status': {
          const previousStatuses = selectedBooks.map(book => ({ id: book.id, status: book.status }));
          await bulkUpdateBooks(db, bookIds as number[], { status: value as any });
          prepareUndo(
            'status_changed',
            previousStatuses,
            `Changed status of ${bookText} to "${value}"`,
            async () => {
              for (const { id, status } of previousStatuses) {
                await db.runAsync(
                  'UPDATE books SET status = ? WHERE id = ?',
                  [status, id]
                );
              }
              fetchBooks();
            }
          );
          break;
        }

        case 'addTags': {
          const previousTags: { id: number, tags: string[] }[] = [];
          for (const bookId of bookIds) {
            const book = selectedBooks.find(b => b.id === bookId);
            const currentTags = book?.tags || [];
            previousTags.push({ id: Number(bookId), tags: currentTags as string[] });
            if (!currentTags.includes(value as string)) {
              const newTags = [...currentTags, value as string];
              await db.runAsync(
                'UPDATE books SET tags = ? WHERE id = ?',
                [JSON.stringify(newTags), Number(bookId)]
              );
            }
          }
          prepareUndo(
            'tags_added',
            previousTags,
            `Added tag "${value}" to ${bookText}`,
            async () => {
              for (const { id, tags } of previousTags) {
                await db.runAsync(
                  'UPDATE books SET tags = ? WHERE id = ?',
                  [JSON.stringify(tags), Number(id)]
                );
              }
              fetchBooks();
            }
          );
          break;
        }

        case 'removeTags': {
          const previousTags: { id: number, tags: string[] }[] = [];
          for (const bookId of bookIds) {
            const book = selectedBooks.find(b => b.id === bookId);
            const currentTags = book?.tags || [];
            previousTags.push({ id: Number(bookId), tags: currentTags as string[] });
            const newTags = (currentTags as string[]).filter(t => t !== value);
            await db.runAsync(
              'UPDATE books SET tags = ? WHERE id = ?',
              [JSON.stringify(newTags), Number(bookId)]
            );
          }
          prepareUndo(
            'tags_removed',
            previousTags,
            `Removed tag "${value}" from ${bookText}`,
            async () => {
              for (const { id, tags } of previousTags) {
                await db.runAsync(
                  'UPDATE books SET tags = ? WHERE id = ?',
                  [JSON.stringify(tags), Number(id)]
                );
              }
              fetchBooks();
            }
          );
          break;
        }

        case 'series': {
          await bulkUpdateBooks(db, bookIds as number[], { seriesName: value as string, collectionType: 'series' });
          break;
        }

        case 'format': {
          await bulkUpdateBooks(db, bookIds as number[], { format: value as string });
          break;
        }

        case 'language': {
          await bulkUpdateBooks(db, bookIds as number[], { language: value as string });
          break;
        }

        case 'rating': {
          await bulkUpdateBooks(db, bookIds as number[], { rating: parseInt(value as string) });
          break;
        }

        case 'trackingType': {
          await bulkUpdateBooks(db, bookIds as number[], { trackingType: value as 'pages' | 'chapters' });
          break;
        }
      }

      await fetchBooks();
      setSelectedBooks([]);
      setIsSelectionMode(false);

    } catch (error) {
      logger.error('Bulk action failed:', error);
      Alert.alert('Error', 'Failed to perform bulk action');
    }
  }, [db, selectedBooks, fetchBooks, prepareUndo]);

  useEffect(() => {
    if (newBookId && allBooks.length > 0 && !isLoading && !showSpotlight) {
      const newBook = allBooks.find(book => book.id === newBookId);

      if (newBook) {
        setSpotlightBook(newBook);
        setShowSpotlight(true);
        navigation.setParams({ newBookId: undefined });
      }
    }
  }, [newBookId, allBooks, isLoading, showSpotlight, navigation]);

  useEffect(() => {
    if (newBookIds && Array.isArray(newBookIds) && newBookIds.length > 0 && allBooks.length > 0 && !isLoading && !showMultiSpotlight) {
      const newBooks = allBooks.filter(book => newBookIds.includes(Number(book.id)));

      if (newBooks.length > 0) {
        setSpotlightBooks(newBooks);
        setShowMultiSpotlight(true);
        navigation.setParams({ newBookIds: undefined });
      }
    }
  }, [newBookIds, allBooks, isLoading, showMultiSpotlight, navigation]);

  const handleSpotlightComplete = useCallback(() => {
    setShowSpotlight(false);
    setTimeout(() => setSpotlightBook(null), 300);
  }, []);

  const handleMultiBookSpotlightComplete = useCallback(() => {
    setShowMultiSpotlight(false);
    setTimeout(() => setSpotlightBooks([]), 300);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchBooks(true);
  }, [fetchBooks]);

  const handleBookPress = useCallback((book: Book & { isSeries?: boolean }) => {
    if (book.isSeries) {
      if (!isSelectionMode) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.push('My Bookshelf', { seriesName: book.seriesName });
      }
      return;
    }

    if (isSelectionMode) {
      toggleBookSelection(book);
    } else {
      navigation.navigate('BookDetail', { bookId: Number(book.id) });
    }
  }, [isSelectionMode, toggleBookSelection, navigation]);

  const handleBookLongPress = useCallback((book: Book & { isSeries?: boolean }) => {
    if (book.isSeries) return;

    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedBooks([book]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isSelectionMode]);

  const handleBackFromSeries = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    theme,
    gridView,
    activeSession,
    db,
    prepareUndo,
    seriesFilter,
    isSelectionMode,
    setIsSelectionMode,
    selectedBooks,
    setSelectedBooks,
    showBulkActions,
    setShowBulkActions,
    previewBook,
    setPreviewBook,
    showPreview,
    setShowPreview,
    spotlightBook,
    setSpotlightBook,
    showSpotlight,
    setShowSpotlight,
    spotlightBooks,
    setSpotlightBooks,
    showMultiSpotlight,
    setShowMultiSpotlight,
    allBooks,
    isLoading,
    isRefreshing,
    fetchBooks,
    toggleSelectionMode,
    toggleBookSelection,
    handleBulkAction,
    handleSpotlightComplete,
    handleRefresh,
    handleBookPress,
    handleBookLongPress,
    handleBackFromSeries,
    handleMultiBookSpotlightComplete
  };
};
