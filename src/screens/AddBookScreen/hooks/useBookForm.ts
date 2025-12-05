import { useState, useReducer, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SQLiteDatabase } from 'expo-sqlite';

import { bookReducer } from '../../../utils/reducers';
import { isValidUrl, isValidImageUrl, isValidLocalUri, sanitizeInput, sanitizeUrl, sanitizeNumber } from '../../../utils/helpers';
import { optimizeBookCover } from '../../../utils/imageOptimizer';
import { insertBook, getAllUniqueTags, findPotentialDuplicates } from '../../../../database';
import { logger } from '../../../../logger';
import { Book, FormState, BookAction, NewBook } from '../../../types';

interface BookFoundData extends Partial<FormState> {
  title: string;
  author: string;
  isbn: string;
  pages?: string;
  year?: string;
  tags?: string;
  coverUrl?: string;
}

interface DuplicateBook extends Book {
  matchType: string;
  confidence: number;
}

type RootStackParamList = {
  'My Bookshelf': { newBookId?: number; newBookIds?: number[] };
  BookDetail: { bookId: number };
};

type AddBookScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'My Bookshelf'>;

export const INITIAL_FORM_STATE: FormState = {
  title: '',
  author: '',
  coverUrl: '',
  coverPath: '',
  status: 'Unfinished',
  rating: 0,
  totalPages: '',
  currentPage: '',
  bookUrl: '',
  tempTags: [],
  isbn: '',
  format: 'Physical',
  publisher: '',
  publicationYear: '',
  language: 'English',
  originalLanguage: '',
  seriesName: '',
  seriesOrder: '',
  volumeNumber: '',
  totalVolumes: '',
  totalChapters: '',
  currentChapter: '',
  trackingType: 'pages',
  collectionType: 'standalone',
  seriesCoverUrl: '',
  totalInSeries: ''
};

const useBookForm = (
  db: SQLiteDatabase | null,
  navigation: AddBookScreenNavigationProp,
  continueAdding: boolean,
  copyDetails: boolean,
  addedBooksInSession: number[],
  setAddedBooksInSession: React.Dispatch<React.SetStateAction<number[]>>
) => {
  const [formState, dispatch] = useReducer(bookReducer, INITIAL_FORM_STATE);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [savedFormState, setSavedFormState] = useState<FormState | null>(null);

  // Fetch existing tags when screen loads
  useEffect(() => {
    const fetchTags = async () => {
      if (db) {
        const tags = await getAllUniqueTags(db);
        setExistingTags(tags as string[]);
      }
    };
    fetchTags();
  }, [db]);

  // Auto-detect collection type from series fields
  useEffect(() => {
    if (formState.collectionType === 'standalone') {
      const hasSeriesName = formState.seriesName && formState.seriesName.trim();
      const hasVolumeNumber = formState.volumeNumber && parseInt(formState.volumeNumber, 10) > 0;
      const hasSeriesOrder = formState.seriesOrder && parseFloat(formState.seriesOrder) > 0;
      
      if (hasVolumeNumber) {
        dispatch({ type: 'SET_FIELD', field: 'collectionType', value: 'volume' });
      } else if (hasSeriesName || hasSeriesOrder) {
        dispatch({ type: 'SET_FIELD', field: 'collectionType', value: 'series' });
      }
    }
  }, [formState.seriesName, formState.volumeNumber, formState.seriesOrder, formState.collectionType]);
  
  // Auto-clear collection fields when switching to standalone
  useEffect(() => {
    if (formState.collectionType === 'standalone') {
      if (formState.seriesName || formState.seriesOrder || formState.volumeNumber || 
          formState.totalVolumes || formState.totalInSeries) {
        dispatch({ type: 'SET_FIELD', field: 'seriesName', value: '' });
        dispatch({ type: 'SET_FIELD', field: 'seriesOrder', value: '' });
        dispatch({ type: 'SET_FIELD', field: 'volumeNumber', value: '' });
        dispatch({ type: 'SET_FIELD', field: 'totalVolumes', value: '' });
        dispatch({ type: 'SET_FIELD', field: 'totalInSeries', value: '' });
        dispatch({ type: 'SET_FIELD', field: 'seriesCoverUrl', value: '' });
      }
    }
  }, [formState.collectionType]);

  const handleBookFound = useCallback(async (bookData: BookFoundData) => {
    logger.log('Book found from scanner:', bookData);
    
    dispatch({ type: 'SET_FIELD', field: 'title', value: bookData.title });
    dispatch({ type: 'SET_FIELD', field: 'author', value: bookData.author });
    dispatch({ type: 'SET_FIELD', field: 'isbn', value: bookData.isbn });
    
    if (bookData.pages) {
      dispatch({ type: 'SET_FIELD', field: 'totalPages', value: bookData.pages });
    }
    
    if (bookData.year) {
      dispatch({ type: 'SET_FIELD', field: 'publicationYear', value: bookData.year });
    }
    
    if (bookData.tags) {
      // Clean up tags: remove brackets [ ] and quotes " ' that might come from stringified arrays
      const cleanedTags = bookData.tags.replace(/[\[\]]/g, '');
      const tags = cleanedTags
        .split(',')
        .map(tag => tag.trim().replace(/^['"]|['"]$/g, '')) // Remove surrounding quotes
        .filter(tag => tag.length > 0);

      tags.forEach(tag => {
        dispatch({ type: 'ADD_TAG', tag });
      });
    }
    
    if (bookData.coverUrl) {
      setImagePreview(bookData.coverUrl);
      dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: bookData.coverUrl });
      
      try {
        setIsOptimizing(true);
        const optimizedUri = await optimizeBookCover(bookData.coverUrl);
        dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: optimizedUri });
        setImagePreview(optimizedUri);
        setIsOptimizing(false);
      } catch (error) {
        logger.error('Error optimizing cover from ISBN lookup:', error);
        setIsOptimizing(false);
      }
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      'Book Details Retrieved',
      `Successfully filled in details for "${bookData.title}". You can edit any field before saving.`, 
      [{ text: 'OK' }]
    );
  }, []);

  const validateForm = (): boolean => {
    if (!formState.title.trim()) {
      Alert.alert("Error", "Please enter a book title.");
      return false;
    }

    if (formState.trackingType === 'pages' && formState.totalPages) {
      const pages = parseInt(formState.totalPages, 10);
      if (isNaN(pages) || pages <= 0) {
        Alert.alert("Error", "Total pages must be a positive number.");
        return false;
      }
      if (pages > 100000) {
        Alert.alert("Error", "Total pages seems too high. Please check the number.");
        return false;
      }
    }

    if (formState.trackingType === 'chapters' && formState.totalChapters) {
      const chapters = parseInt(formState.totalChapters, 10);
      if (isNaN(chapters) || chapters <= 0) {
        Alert.alert("Error", "Total chapters must be a positive number.");
        return false;
      }
    }

    if (formState.seriesOrder) {
      const order = parseFloat(formState.seriesOrder);
      if (isNaN(order) || order <= 0) {
        Alert.alert("Error", "Series order must be a positive number (can be decimal like 1.5).");
        return false;
      }
    }

    if (formState.publicationYear) {
      const year = parseInt(formState.publicationYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear + 5) {
        Alert.alert("Error", `Publication year must be between 1000 and ${currentYear + 5}.`);
        return false;
      }
    }

    if (formState.bookUrl && formState.bookUrl.trim()) {
      const trimmedUrl = formState.bookUrl.trim();
      if (!isValidUrl(trimmedUrl)) {
        Alert.alert("Error", "Please enter a valid URL (e.g., https://example.com)");
        return false;
      }
    }

    if (formState.coverUrl && formState.coverUrl.trim()) {
      const trimmedUrl = formState.coverUrl.trim();
      
      if (isValidLocalUri(trimmedUrl)) {
        return true;
      }
      
      if (!isValidImageUrl(trimmedUrl)) {
        Alert.alert(
          "Invalid Image URL", 
          "The cover image URL appears to be invalid or unsafe. Please use a valid image URL (http:// or https://)."
        );
        return false;
      }
    }

    return true;
  };

  const resetFormForNext = useCallback((currentState: FormState) => {
    if (copyDetails) {
      logger.log('📋 Copying details for next book');
      
      // Auto-increment volume number if it's a volume
      const newVolumeNumber = currentState.volumeNumber 
        ? (parseInt(currentState.volumeNumber, 10) + 1).toString() 
        : currentState.volumeNumber;

      // Keep these fields (metadata that's likely the same)
      const fieldsToKeep = {
        // Format & Language
        format: currentState.format,
        language: currentState.language,
        originalLanguage: currentState.originalLanguage,
        
        // Tracking
        trackingType: currentState.trackingType,
        
        // Tags
        tempTags: [...currentState.tempTags],
        
        // Collection/Series (if adding multiple in a series)
        collectionType: currentState.collectionType,
        seriesName: currentState.seriesName,
        totalVolumes: currentState.totalVolumes,
        totalInSeries: currentState.totalInSeries,
        seriesCoverUrl: currentState.seriesCoverUrl,
        
        // Auto-incremented volume
        volumeNumber: newVolumeNumber,
        
        // Publisher (likely the same for series)
        publisher: currentState.publisher,
        
        // Cover (keep if it's a series cover)
        coverUrl: currentState.collectionType === 'volume' || currentState.collectionType === 'series' 
          ? currentState.coverUrl 
          : '',
        coverPath: currentState.collectionType === 'volume' || currentState.collectionType === 'series'
          ? currentState.coverPath
          : '',
      };

      // Reset to initial state, then apply kept fields
      dispatch({ type: 'RESET', initialState: INITIAL_FORM_STATE });
      Object.entries(fieldsToKeep).forEach(([field, value]) => {
        dispatch({ type: 'SET_FIELD', field: field as any, value });
      });

      // Keep image preview for series
      if (currentState.collectionType === 'volume' || currentState.collectionType === 'series') {
        setImagePreview(currentState.coverUrl || null);
      } else {
        setImagePreview(null);
      }
      
      logger.log('✅ Details copied. Tags:', fieldsToKeep.tempTags);
    } else {
      // Full reset
      logger.log('🔄 Full form reset');
      dispatch({ type: 'RESET', initialState: INITIAL_FORM_STATE });
      setImagePreview(null);
    }
  }, [copyDetails]);

  const proceedWithBookCreation = async () => {
    try {
      const pages = sanitizeNumber(formState.totalPages, 0);
      const currentPageNum = sanitizeNumber(formState.currentPage, 0);
      const chapters = sanitizeNumber(formState.totalChapters, 0);
      const currentChapter = sanitizeNumber(formState.currentChapter, 0);
      const volumeNumber = sanitizeNumber(formState.volumeNumber, undefined);
      const totalVolumes = sanitizeNumber(formState.totalVolumes, undefined);
      const seriesOrder = formState.seriesOrder ? parseFloat(formState.seriesOrder) : undefined;
      
      // FIX: Join tags array into a comma-separated string
      const tagsString = (formState.tempTags && formState.tempTags.length > 0) 
        ? formState.tempTags.join(',') 
        : null;

      const bookToInsert: NewBook = {
        title: sanitizeInput(formState.title.trim()),
        author: sanitizeInput(formState.author?.trim() || ''),
        coverUrl: formState.coverUrl || '',
        coverPath: formState.coverPath || '',
        status: formState.status as NewBook['status'] || 'Unfinished',
        rating: formState.rating || 0,
        totalPages: pages,
        currentPage: currentPageNum,
        bookUrl: sanitizeUrl(formState.bookUrl?.trim() || ''),
        tags: tagsString, // Use the stringified tags
        isbn: formState.isbn || '',
        format: formState.format || 'Physical',
        publisher: sanitizeInput(formState.publisher?.trim() || ''),
        publicationYear: formState.publicationYear ? parseInt(formState.publicationYear, 10) : undefined,
        language: formState.language || 'English',
        originalLanguage: formState.originalLanguage || '',
        seriesName: sanitizeInput(formState.seriesName?.trim() || ''),
        seriesOrder: seriesOrder ? String(seriesOrder) : undefined,
        volumeNumber: volumeNumber || undefined,
        totalVolumes: totalVolumes || undefined,
        totalChapters: chapters,
        currentChapter: currentChapter,
        trackingType: formState.trackingType as NewBook['trackingType'] || 'pages',
        collectionType: formState.collectionType as NewBook['collectionType'] || 'standalone',
        seriesCoverUrl: formState.seriesCoverUrl || '',
        totalInSeries: formState.totalInSeries ? parseInt(formState.totalInSeries, 10) : undefined
      };

      logger.log('Attempting to insert book:', bookToInsert.title);

      const bookId = await insertBook(db!, bookToInsert);
      
      logger.log('Book added successfully with ID:', bookId);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Add to session array
      setAddedBooksInSession(prev => [...prev, bookId]);

      if (continueAdding) {
        // Stay on screen, reset form
        logger.log('📚 Continue adding mode - resetting form');
        resetFormForNext(formState);
      } else {
        // Navigate back with all book IDs
        const allBookIds = [...addedBooksInSession, bookId];
        if (allBookIds.length > 1) {
          navigation.navigate('My Bookshelf', { newBookIds: allBookIds });
        } else {
          navigation.navigate('My Bookshelf', { newBookId: bookId });
        }
      }
    } catch (error) {
      logger.error("Error in proceedWithBookCreation:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (!db) {
      Alert.alert("Error", "Database not ready. Please try again.");
      logger.error("DB is null when trying to add book");
      return;
    }

    try {
      const duplicates = await findPotentialDuplicates(
        db, 
        formState.title, 
        formState.author, 
        formState.isbn
      ) as unknown as DuplicateBook[];
      
      if (duplicates.length > 0) {
        const topMatch = duplicates[0];
        const matchInfo = `Match: ${topMatch.matchType}\nConfidence: ${topMatch.confidence}%\n\nExisting book:\nTitle: ${topMatch.title}\nAuthor: ${topMatch.author || 'Unknown'}\n${topMatch.isbn ? `ISBN: ${topMatch.isbn}` : ''}\nStatus: ${topMatch.status}`;
        
        Alert.alert(
          'Possible Duplicate Found',
          matchInfo,
          [
            {
              text: 'View Existing Book',
              onPress: () => {
                navigation.navigate('BookDetail', { bookId: Number(topMatch.id) });
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Add Anyway',
              style: 'destructive',
              onPress: () => proceedWithBookCreation(),
            },
          ]
        );
        return;
      }
      
      await proceedWithBookCreation();
      
    } catch (error) {
      logger.error("Error adding book:", error);
      Alert.alert("Error", "Failed to add book. Please try again.");
    }
  };

  const handleCoverUrlChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'coverUrl', value });
    if (isValidImageUrl(value)) {
      setImagePreview(value);
    } else {
      setImagePreview(null);
    }
  };

  return {
    formState,
    dispatch,
    imagePreview,
    setImagePreview,
    isOptimizing,
    setIsOptimizing,
    existingTags,
    handleBookFound,
    handleSubmit,
    handleCoverUrlChange,
  };
};

export default useBookForm;
