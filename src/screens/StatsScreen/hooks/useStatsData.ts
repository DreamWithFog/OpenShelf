import { useState, useEffect, useCallback } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { Book, Session } from '../../../types';
import { getAllBooks, getAllSessions } from '../../../database';
import { logger } from '../../../../logger';

export const useStatsData = (db: SQLiteDatabase | null) => {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCheckedMilestones, setHasCheckedMilestones] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (!db) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
        setHasCheckedMilestones(false); // Reset milestone check on manual refresh
      } else {
        setIsLoading(true);
      }

      const [books, sessions] = await Promise.all([
        getAllBooks(db),
        getAllSessions(db)
      ]);

      setAllBooks(books);
      setAllSessions(sessions);
    } catch (error) {
      logger.error('Error fetching stats data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [db]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    allBooks,
    allSessions,
    bonusXP: 0, // Hardcoded to 0 to prevent downstream errors
    isLoading,
    isRefreshing,
    fetchStats,
    hasCheckedMilestones,
    setHasCheckedMilestones
  };
};
