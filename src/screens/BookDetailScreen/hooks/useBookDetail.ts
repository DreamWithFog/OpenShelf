import { useState, useEffect, useReducer, useCallback } from 'react';
import { Alert } from 'react-native';
import { SQLiteDatabase } from 'expo-sqlite';
import { getBookById, getAllUniqueTags } from '../../../database';
import { logger } from '../../../../logger';
import { bookReducer, initialBookState } from '../../../utils/reducers';
import { Book } from '../../../types';

export const useBookDetail = (db: SQLiteDatabase, bookId: number, navigation: any) => {
  const [book, setBook] = useState<Book | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bookThemeColor, setBookThemeColor] = useState<string>('#ccc');
  const [bookState, dispatch] = useReducer(bookReducer, initialBookState);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  const fetchBookDetails = useCallback(async () => {
    if (!db) return;
    try {
      const fetchedBook = await getBookById(db, bookId);
      if (fetchedBook) {
        setBook(fetchedBook);
        
        // Load all existing tags for suggestions
        const allTags = await getAllUniqueTags(db);
        setExistingTags(allTags);
      } else {
        Alert.alert('Error', 'Book not found');
        navigation.goBack();
      }
    } catch (error) {
      logger.error('Error fetching book details:', error);
      Alert.alert('Error', 'Failed to load book details');
    }
  }, [db, bookId, navigation]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleEdit = useCallback(() => {
    if (book) {
      // Parse tags from comma-separated string to array
      const tagsArray = book.tags 
        ? book.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];
      
      dispatch({ type: 'SET_BOOK', book });
      dispatch({ type: 'SET_FIELD', field: 'tempTags', value: tagsArray });
      setIsEditing(true);
    }
  }, [book]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (book) {
      dispatch({ type: 'SET_BOOK', book });
    }
  }, [book]);

  return {
    book,
    bookState,
    dispatch,
    isEditing,
    setIsEditing,
    bookThemeColor,
    setBookThemeColor,
    existingTags,
    fetchBookDetails,
    handleEdit,
    handleCancel
  };
};
