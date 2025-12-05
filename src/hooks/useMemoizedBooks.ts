// Custom hook for memoized book filtering and sorting
import { useMemo } from 'react';
import { Book } from '../types';

export const useMemoizedBooks = (books: Book[], activeFilter: string): Book[] => {
  return useMemo(() => {
    if (!books || books.length === 0) return [];
    
    let processedBooks = [...books];

    // Apply filters
    switch (activeFilter) {
      case 'unfinished': 
        processedBooks = processedBooks.filter(b => b && b.status === 'Unfinished'); 
        break;
      case 'byTitle': 
        processedBooks = processedBooks
          .filter(b => b && b.title)
          .sort((a, b) => (a.title || '').localeCompare(b.title || '')); 
        break;
      case 'byAuthor': 
        processedBooks = processedBooks
          .filter(b => b && b.author)
          .sort((a, b) => (a.author || '').localeCompare(b.author || '')); 
        break;
      case 'recent': 
        processedBooks = processedBooks
          .filter(b => b && b.updatedAt)
          .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()); 
        break;
      case 'byRating': 
        processedBooks = processedBooks
          .filter(b => b && (b.status === 'Finished' || b.status === 'Abandoned'))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // No filter, keep as is
        break;
    }
    
    return processedBooks;
  }, [books, activeFilter]);
};

interface BookStats {
  total: number;
  finished: number;
  unfinished: number;
  abandoned: number;
  totalPages: number;
  pagesRead: number;
  avgRating: number | string;
}

export const useMemoizedBookStats = (books: Book[]): BookStats => {
  return useMemo(() => {
    if (!books || books.length === 0) {
      return {
        total: 0,
        finished: 0,
        unfinished: 0,
        abandoned: 0,
        totalPages: 0,
        pagesRead: 0,
        avgRating: 0,
      };
    }

    const stats = books.reduce((acc, book) => {
      acc.total++;
      if (book.status === 'Finished') acc.finished++;
      if (book.status === 'Unfinished') acc.unfinished++;
      if (book.status === 'Abandoned') acc.abandoned++;
      
      acc.totalPages += book.totalPages || 0;
      acc.pagesRead += book.currentPage || 0;
      
      if (book.rating && book.rating > 0) {
        acc.totalRating += book.rating;
        acc.ratedBooks++;
      }
      
      return acc;
    }, {
      total: 0,
      finished: 0,
      unfinished: 0,
      abandoned: 0,
      totalPages: 0,
      pagesRead: 0,
      totalRating: 0,
      ratedBooks: 0,
      avgRating: 0,
    });

    stats.avgRating = stats.ratedBooks > 0 
      ? parseFloat((stats.totalRating / stats.ratedBooks).toFixed(1))
      : 0;

    return stats;
  }, [books]);
};