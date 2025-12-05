import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '../../../../logger';
import { createSessionService } from '../../../services/database/sessionService'; // FIX: Corrected path (3 levels up)
import { Session, NewSession } from '../../../types';
import { SQLiteDatabase } from 'expo-sqlite';

interface SessionData {
  startDate: Date;
  endDate: Date;
  hours: number;
  minutes: number;
  startPage: string;
  endPage: string;
}

export const useSessionModal = (
  db: SQLiteDatabase,
  bookId: number,
  bookTitle: string,
  fetchSessions: () => void,
  isChapterTracking: boolean,
  sessions: Session[]
) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionData, setSessionData] = useState<SessionData>({
    startDate: new Date(),
    endDate: new Date(),
    hours: 0,
    minutes: 30,
    startPage: '',
    endPage: '',
  });

  const handleAddSession = useCallback(() => {
    setEditingSession(null);
    setSessionData({
      startDate: new Date(),
      endDate: new Date(),
      hours: 0,
      minutes: 30,
      startPage: '',
      endPage: '',
    });
    setShowModal(true);
  }, []);

  const handleEditSession = useCallback((session: Session) => {
    setEditingSession(session);
    
    const startDate = new Date(session.startTime);
    const endDate = session.endTime ? new Date(session.endTime) : new Date(session.startTime);
    const duration = session.duration || 0;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    setSessionData({
      startDate,
      endDate,
      hours,
      minutes,
      startPage: isChapterTracking ? 
        (session.startChapter?.toString() || '') : 
        (session.startPage?.toString() || ''),
      endPage: isChapterTracking ? 
        (session.endChapter?.toString() || '') : 
        (session.endPage?.toString() || ''),
    });
    setShowModal(true);
  }, [isChapterTracking]);

  const handleSaveSession = useCallback(async (data: SessionData) => {
    try {
      if (!data.startDate || !data.endDate) {
        Alert.alert('Error', 'Please select both start and end dates');
        return;
      }

      const duration = data.hours * 60 + data.minutes;
      if (duration <= 0) {
        Alert.alert('Error', 'Session duration must be greater than 0');
        return;
      }

      const sessionPayload: NewSession = {
        bookId,
        bookTitle,
        startTime: data.startDate.toISOString(),
        endTime: data.endDate.toISOString(),
        duration,
        ...(isChapterTracking ? {
          startChapter: parseInt(data.startPage) || 0,
          endChapter: parseInt(data.endPage) || 0,
          startPage: null,
          endPage: null,
        } : {
          startPage: parseInt(data.startPage) || 0,
          endPage: parseInt(data.endPage) || 0,
          startChapter: null,
          endChapter: null,
        }),
        // readingNumber is intentionally omitted here; the Service layer handles it atomically.
      };

      const sessionService = createSessionService(db);

      // Use the atomic service method instead of calling operations directly
      await sessionService.saveManualSession(
        bookId,
        sessionPayload,
        editingSession?.id
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowModal(false);
      setEditingSession(null);
      fetchSessions();
      
      Alert.alert(
        'Success', 
        editingSession ? 'Session updated!' : 'Session added!'
      );
    } catch (error) {
      logger.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save session');
    }
  }, [bookId, bookTitle, isChapterTracking, editingSession, db, fetchSessions]);

  const handleDeleteSession = useCallback(async (sessionId: number) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // We could also move this to the service layer for consistency, 
              // but deleting is simpler than inserting/updating state.
              const sessionService = createSessionService(db);
              await sessionService.delete(sessionId);
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              fetchSessions();
            } catch (error) {
              logger.error('Error deleting session:', error);
              Alert.alert('Error', 'Failed to delete session');
            }
          }
        }
      ]
    );
  }, [db, fetchSessions]);

  return {
    showModal,
    setShowModal,
    editingSession,
    sessionData,
    setSessionData,
    handleAddSession,
    handleEditSession,
    handleSaveSession,
    handleDeleteSession,
  };
};
