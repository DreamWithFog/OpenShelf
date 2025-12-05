import { useState, useReducer, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { bookReducer } from '../../../utils/reducers';
import { getAllUniqueTags, findPotentialDuplicates, insertBook } from '../../../../database';
import { logger } from '../../../../logger';
import { sanitizeInput, sanitizeUrl, sanitizeNumber } from '../../../utils/helpers';
import { Book, FormState, BookAction, NewBook } from '../../../types';
import { SQLiteDatabase } from 'expo-sqlite';

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
  'My Bookshelf': undefined;
  BookDetail: { bookId: number };
};

type AddBookScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'My Bookshelf'>;

const initialFormState: FormState = {
  title: '',
  author: '',
  coverUrl: '',
  coverPath: '',
  status: 'Unfinished',
  totalPages: '',
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
  currentChapter: '0',
  trackingType: 'pages',
  collectionType: 'standalone',
  seriesCoverUrl: '',
  totalInSeries: ''
};

const useAddBookForm = (db: SQLiteDatabase | null, navigation: AddBookScreenNavigationProp) => {
  const [formState, dispatch] = useReducer(bookReducer, initialFormState);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      if (db) {
        const tags = await getAllUniqueTags(db);
        setExistingTags(tags as string[]);
      }
    };
    fetchTags();
  }, [db]);

  const handleAddTag = useCallback((tag: string) => {
    dispatch({ type: 'ADD_TAG', tag });
  }, []);

  const handleRemoveTag = useCallback((tag: string) => {
    dispatch({ type: 'REMOVE_TAG', tag });
  }, []);

  const handleBookFound = useCallback(async (bookData: BookFoundData, setImagePreview: (uri: string | null) => void, setIsOptimizing: (isOptimizing: boolean) => void, optimizeBookCover: (uri: string) => Promise<string>) => {
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

  const proceedWithBookCreation = async () => {
    try {
      const pages = sanitizeNumber(formState.totalPages, 0);
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
        title: sanitizeInput(formState.title?.trim() || ''),
        author: sanitizeInput(formState.author?.trim() || ''),
        coverUrl: formState.coverUrl || '',
        coverPath: formState.coverPath || '',
        status: (formState.status || 'Unfinished') as NewBook['status'],
        rating: 0,
        totalPages: pages,
        currentPage: 0,
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
        trackingType: (formState.trackingType || 'pages') as NewBook['trackingType'],
        collectionType: (formState.collectionType || 'standalone') as NewBook['collectionType'],
        seriesCoverUrl: formState.seriesCoverUrl || '',
        totalInSeries: formState.totalInSeries ? parseInt(formState.totalInSeries, 10) : undefined
      };

      logger.log('Attempting to insert book:', bookToInsert.title);

      const bookId = await insertBook(db!, bookToInsert);
      
      logger.log('Book added successfully with ID:', bookId);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('My Bookshelf');
      }
    } catch (error) {
      logger.error("Error in proceedWithBookCreation:", error);
      throw error;
    }
  };

  const addBook = async (validateForm: () => boolean) => {
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

  return {
    formState,
    dispatch,
    existingTags,
    handleAddTag,
    handleRemoveTag,
    handleBookFound,
    addBook
  };
};

export default useAddBookForm;
