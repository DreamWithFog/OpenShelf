import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getNotesByBookId } from '../../../database/operations/noteOperations';
import { Book, Note, RootStackParamList } from '../../../types';
import { SQLiteDatabase } from 'expo-sqlite';

type BookDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookDetail'>;

export const useBookNotes = (
  db: SQLiteDatabase,
  bookId: number,
  book: Book
) => {
  const navigation = useNavigation<BookDetailScreenNavigationProp>();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotesByBookId(db, bookId);
        setNotes(fetchedNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
    
    fetchNotes();
  }, [db, bookId]);

  const handleViewAllNotes = () => {
    navigation.navigate('BookNotes', {
      bookId,
      bookTitle: book.title || '',
      book,
    });
  };

  return { notes, setNotes, handleViewAllNotes };
};
