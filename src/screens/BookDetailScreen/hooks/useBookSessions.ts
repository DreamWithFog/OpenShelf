import { useState, useEffect, useMemo } from 'react';
import { Book, Session } from '../../../types';
import { SQLiteDatabase } from 'expo-sqlite';
import { logger } from '../../../../logger';

export const useBookSessions = (
  db: SQLiteDatabase,
  bookId: number,
  book: Book | null,
  navigation: any
) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  // Fetch sessions to calculate statistics
  useEffect(() => {
    if (!db) return;
    const fetchSessions = async () => {
      try {
        // Fetch all sessions for this book to calculate speed
        const result = await db.getAllAsync<Session>(
          'SELECT * FROM sessions WHERE bookId = ?',
          [bookId]
        );
        setSessions(result);
      } catch (error) {
        logger.error('Error fetching sessions for speed calc:', error);
      }
    };
    fetchSessions();
  }, [db, bookId]);

  const readingSpeed = useMemo(() => {
    // Default / Empty State
    const defaultState = {
      unitsPerHour: 0,
      unitType: book?.trackingType === 'chapters' ? 'Chapters' : 'Pages',
      formattedEstimatedTime: 'Calculating...',
      hasData: false
    };

    if (!sessions.length || !book) {
      return defaultState;
    }

    const isChapters = book.trackingType === 'chapters';
    let totalDurationMinutes = 0;
    let totalAmountRead = 0;

    sessions.forEach(session => {
        if (session.duration) totalDurationMinutes += session.duration;
        
        const start = isChapters ? (session.startChapter || 0) : (session.startPage || 0);
        const end = isChapters ? (session.endChapter || 0) : (session.endPage || 0);
        
        // Only count positive progress
        const amount = Math.max(0, end - start);
        totalAmountRead += amount;
    });

    // Avoid division by zero
    if (totalDurationMinutes < 10) { // Require at least 10 mins of data for accuracy
        return defaultState;
    }

    // 1. Calculate Speed (Units per Hour)
    // (Amount / Minutes) * 60
    const speed = (totalAmountRead / totalDurationMinutes) * 60;
    
    // 2. Estimate Time Remaining
    const total = isChapters ? (book.totalChapters || 0) : (book.totalPages || 0);
    const current = isChapters ? (book.currentChapter || 0) : (book.currentPage || 0);
    const remaining = Math.max(0, total - current);
    
    let formattedEstimatedTime = 'N/A';
    
    if (remaining === 0) {
        formattedEstimatedTime = 'Finished';
    } else if (speed > 0) {
        const hoursLeft = remaining / speed;
        if (hoursLeft < 1) {
            formattedEstimatedTime = `${Math.round(hoursLeft * 60)} min left`;
        } else {
            formattedEstimatedTime = `${hoursLeft.toFixed(1)} hrs left`;
        }
    }

    return {
        unitsPerHour: Math.round(speed),
        unitType: isChapters ? 'Chapters' : 'Pages',
        formattedEstimatedTime,
        hasData: true
    };

  }, [sessions, book]);

  return {
    readingSpeed
  };
};
