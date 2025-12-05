import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getBookSessionsGrouped, deleteSession } from '../../../database/operations/sessionOperations';
import type { GroupedSessions } from '../../../database/operations/sessionOperations';
import { logger } from '../../../../logger';
import { SQLiteDatabase } from 'expo-sqlite';

export const useSessionsData = (db: SQLiteDatabase, bookId: number, isChapterTracking: boolean) => {
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!db) return;

    setRefreshing(true);
    try {
      const groups = await getBookSessionsGrouped(db, bookId, isChapterTracking);
      setGroupedSessions(groups);
    } catch (error) {
      logger.error("Error fetching grouped sessions:", error);
      Alert.alert("Error", "Failed to load sessions");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [db, bookId, isChapterTracking]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRefresh = () => {
    fetchSessions();
  };

  const handleDeleteSession = async (sessionId: number) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this reading session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(db, sessionId);
              fetchSessions();
            } catch (error) {
              logger.error("Error deleting session:", error);
              Alert.alert("Error", "Failed to delete session");
            }
          },
        },
      ]
    );
  };

  return {
    groupedSessions,
    isLoading,
    refreshing,
    fetchSessions,
    handleRefresh,
    handleDeleteSession
  };
};
