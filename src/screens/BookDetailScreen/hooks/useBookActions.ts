import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
// CLEANED: Gamification import removed
import { updateBook, deleteBook } from '../../../database';
import { Book } from '../../../types';
import { logger } from '../../../../logger';

export const useBookActions = (
  db: any,
  book: Book | null,
  bookState: any,
  setBookThemeColor: (color: string | null) => void,
  setIsEditing: (editing: boolean) => void,
  setImagePreview: (preview: string | null) => void,
  fetchBookDetails: () => void,
  activeSession: any,
  setActiveSession: (session: any) => void,
  navigation: any,
  bookId: number,
  prepareUndo: (data: any) => void,
  onFinishBook?: () => void
) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFinishBook = useCallback(async () => {
    if (!book || !db) return;

    try {
      // 1. Update DB (Standard update, no XP magic)
      await updateBook(db, bookId, {
        status: 'Finished',
        currentPage: book.totalPages,
        currentChapter: book.totalChapters,
        // @ts-ignore - Assuming endDate exists in schema but maybe not in type def yet
        endDate: new Date().toISOString(),
      });

      // 2. Refresh UI
      fetchBookDetails();
      setShowFinishConfirm(false);
      
      if (onFinishBook) {
        onFinishBook();
      }

    } catch (error) {
      logger.error('Error finishing book:', error);
      Alert.alert('Error', 'Failed to update book status');
    }
  }, [book, db, bookId, fetchBookDetails, onFinishBook]);

  const handleSave = useCallback(async () => {
    if (!book || !db) return false;

    try {
      const tagsString = (bookState.tempTags || []).join(', ');
      
      const updates: Partial<Book> = {
        title: bookState.title,
        author: bookState.author,
        status: bookState.status,
        rating: bookState.rating,
        isbn: bookState.isbn,
        totalPages: bookState.totalPages,
        totalChapters: bookState.totalChapters,
        currentPage: bookState.currentPage,
        currentChapter: bookState.currentChapter,
        coverUrl: bookState.coverUrl,
        coverPath: bookState.coverPath,
        format: bookState.format,
        language: bookState.language,
        originalLanguage: bookState.originalLanguage,
        publisher: bookState.publisher,
        publicationYear: bookState.publicationYear,
        seriesName: bookState.seriesName,
        seriesOrder: bookState.seriesOrder,
        collectionType: bookState.collectionType,
        trackingType: bookState.trackingType,
        tags: tagsString,
      };

      // Standard Update for all cases
      const fields: string[] = [];
      const values: any[] = [];
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id') {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      if (fields.length > 0) {
        values.push(bookId);
        await db.runAsync(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`, values);
      }

      fetchBookDetails();
      setIsEditing(false);
      setImagePreview(null);
      return true;
    } catch (error) {
      logger.error('Error saving book:', error);
      Alert.alert('Error', 'Failed to save changes');
      return false;
    }
  }, [book, db, bookState, bookId, fetchBookDetails, setIsEditing, setImagePreview]);

  const handleDelete = useCallback(async () => {
    if (!db) return;
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book?.title || 'this book'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteBook(db, bookId);
              navigation.goBack();
            } catch (error) {
              logger.error('Error deleting book:', error);
              Alert.alert('Error', 'Failed to delete book');
            } finally {
              setIsDeleting(false);
              setShowDeleteConfirm(false);
            }
          }
        }
      ]
    );
  }, [db, book, bookId, navigation]);

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    showFinishConfirm,
    setShowFinishConfirm,
    isDeleting,
    handleFinishBook,
    handleSave,
    handleDelete
  };
};
