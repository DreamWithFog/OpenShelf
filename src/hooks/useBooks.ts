// src/hooks/useBooks.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { BookService } from '../services/database';
import { logger } from '../../logger';
import { Book } from '../types';

interface UseBooksReturn {
  allBooks: Book[];
  isLoading: boolean;
  isRefreshing: boolean;
  fetchBooks: (isRefresh?: boolean) => Promise<void>;
}

/**
 * Original useBooks hook - now powered by BookService
 * Maintains the same interface for backward compatibility
 */
export const useBooks = (activeFilter: string = 'all'): UseBooksReturn => {
  const { db } = useAppContext();
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const hasLoggedWarning = useRef(false);

  const fetchBooks = useCallback(async (isRefresh: boolean = false) => {
    if (!db) {
      // Only log warning once during initial mount (expected behavior)
      if (!hasLoggedWarning.current) {
        logger.log('useBooks: Waiting for database initialization...');
        hasLoggedWarning.current = true;
      }
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const bookService = new BookService(db);
      const books = await bookService.getAll();
      setAllBooks(books);
      logger.log(`useBooks: Loaded ${books.length} books (filter: ${activeFilter})`);
    } catch (error) {
      logger.error('useBooks: Error fetching books:', error);
      setAllBooks([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [db, activeFilter]);

  // Auto-fetch when database is ready
  useEffect(() => {
    if (db) {
      fetchBooks();
    }
  }, [db, fetchBooks]);

  return {
    allBooks,
    isLoading,
    isRefreshing,
    fetchBooks
  };
};
