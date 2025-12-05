import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { logger } from '../../../../../logger';
import { Book, Session } from '../../../../types';
import { SQLiteDatabase } from 'expo-sqlite';

export const useSessionsData = (db: SQLiteDatabase | null, bookId: number, pageSize: number, book: Book | null) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isChapterTracking = book?.trackingType === 'chapters';

  const fetchSessions = useCallback(async () => {
    if (!db) return;
    
    setIsLoadingSessions(true);
    try {
      const offset = (currentPage - 1) * pageSize;

      // FIX: Get ALL sessions for the book, not filtered by readingNumber
      const totalResult = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM sessions WHERE bookId = ?',
        [bookId]
      );
      const total = totalResult?.count || 0;

      const sessionResults = await db.getAllAsync<Session>(
        `SELECT * FROM sessions 
         WHERE bookId = ? 
         ORDER BY readingNumber DESC, 
                  COALESCE(endPage, 0) DESC, 
                  COALESCE(endChapter, 0) DESC, 
                  id DESC 
         LIMIT ? OFFSET ?`,
        [bookId, pageSize, offset]
      );

      // 🔍 DEBUG: Log fetched sessions
      console.log('🔍 FETCHED SESSIONS (BookDetailSessions):', sessionResults.map(s => ({
        id: s.id,
        pages: `${s.startPage}→${s.endPage}`,
        readingNumber: s.readingNumber,
        startTime: s.startTime,
      })));

      setSessions(sessionResults);
      setTotalPages(Math.ceil(total / pageSize));
      setTotalSessions(total);
    } catch (error) {
      logger.error("Error fetching sessions:", error);
    } finally {
      setIsLoadingSessions(false);
      setRefreshing(false);
    }
  }, [db, bookId, currentPage, pageSize]);

  const syncBookCurrentProgress = useCallback(async () => {
    if (!db || !book) return;
    try {
      // FIX: Get the latest session from the CURRENT reading number
      const currentReadingNumber = (book.readCount || 0) + 1;
      
      if (isChapterTracking) {
        const result = await db.getFirstAsync<{ endChapter: number }>(
          `SELECT endChapter FROM sessions 
           WHERE bookId = ? AND endChapter IS NOT NULL AND readingNumber = ? 
           ORDER BY startTime DESC, id DESC LIMIT 1`,
          [bookId, currentReadingNumber]
        );
        const latestChapter = result?.endChapter || 0;
        
        if (latestChapter > 0 && latestChapter !== book.currentChapter) {
          await db.runAsync('UPDATE books SET currentChapter = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [latestChapter, bookId]);
        }
      } else {
        const result = await db.getFirstAsync<{ endPage: number }>(
          `SELECT endPage FROM sessions 
           WHERE bookId = ? AND endPage IS NOT NULL AND readingNumber = ? 
           ORDER BY startTime DESC, id DESC LIMIT 1`,
          [bookId, currentReadingNumber]
        );
        const latestPage = result?.endPage || 0;
        
        if (latestPage > 0 && latestPage !== book.currentPage) {
          await db.runAsync('UPDATE books SET currentPage = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [latestPage, bookId]);
        }
      }
    } catch (error) {
      logger.error('Error syncing book progress:', error);
    }
  }, [db, book, bookId, isChapterTracking]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    currentPage,
    setCurrentPage,
    totalPages,
    totalSessions,
    isLoadingSessions,
    refreshing,
    fetchSessions,
    handleRefresh,
    syncBookCurrentProgress,
    isChapterTracking,
  };
};
