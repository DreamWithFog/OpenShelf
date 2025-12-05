import { useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { insertSession, updateSessionFull, deleteSession } from '../../../../database';
import { logger } from '../../../../../logger';
import { Book, Session, NewSession } from '../../../../types';
import { SQLiteDatabase } from 'expo-sqlite';

interface SessionData {
  date: Date;
  startValue: string;
  endValue: string;
  hours: string;
  minutes: string;
}

export const useSessionEditor = (
  db: SQLiteDatabase,
  bookId: number,
  book: Book | null,
  fetchSessions: () => void,
  syncBookCurrentProgress: () => Promise<void>,
  onRefreshSessions: (() => void) | null,
  sessions: Session[],
  currentPage: number,
  setCurrentPage: (page: number) => void,
  isChapterTracking: boolean
) => {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>({
    date: new Date(),
    startValue: '',
    endValue: '',
    hours: '0',
    minutes: '0',
  });

  const handleAddSession = () => {
    const startValue = isChapterTracking ? (book?.currentChapter || 0) : (book?.currentPage || 0);
    
    setEditingSession(null);
    setSessionData({
      date: new Date(),
      startValue: startValue.toString(),
      endValue: '',
      hours: '0',
      minutes: '30',
    });
    setShowSessionModal(true);
  };

  const handleEditSession = (session: Session) => {
    const startValue = isChapterTracking ? session.startChapter : session.startPage;
    const endValue = isChapterTracking ? session.endChapter : session.endPage;
    const durationMinutes = session.duration || 0;
    
    setEditingSession(session);
    setSessionData({
      date: new Date(session.endTime || Date.now()),
      startValue: startValue?.toString() || '',
      endValue: endValue?.toString() || '',
      hours: Math.floor(durationMinutes / 60).toString(),
      minutes: (durationMinutes % 60).toString(),
    });
    setShowSessionModal(true);
  };

  const handleSaveSession = async () => {
    const startValue = parseInt(sessionData.startValue) || 0;
    const endValue = parseInt(sessionData.endValue) || 0;
    const duration = (parseInt(sessionData.hours) || 0) * 60 + (parseInt(sessionData.minutes) || 0);
    
    // FIX: Revert to End of Day Strategy
    // We force all manual entries for "Today" to 23:59:59.
    // This ensures they tie with existing data, allowing 'id DESC' to sort them correctly by creation order.
    const endDateTime = new Date(sessionData.date);
    endDateTime.setHours(23, 59, 59);

    const startDateTime = new Date(endDateTime.getTime() - (duration * 60 * 1000));

    const sessionPayload: NewSession = {
      bookId: bookId,
      bookTitle: book?.title || 'Unknown',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration
    };

    if (isChapterTracking) {
      sessionPayload.startChapter = startValue;
      sessionPayload.endChapter = endValue;
      sessionPayload.startPage = null;
      sessionPayload.endPage = null;
    } else {
      sessionPayload.startPage = startValue;
      sessionPayload.endPage = endValue;
      sessionPayload.startChapter = null;
      sessionPayload.endChapter = null;
    }

    try {
      if (editingSession) {
        await updateSessionFull(db, editingSession.id, sessionPayload);
      } else {
        await insertSession(db, sessionPayload);
      }
      
      await syncBookCurrentProgress();
      
      setShowSessionModal(false);
      fetchSessions();
      
      if (onRefreshSessions) {
        onRefreshSessions();
      }
      
    } catch (error) {
      logger.error("Error saving session:", error);
      Alert.alert("Error", "Failed to save session");
    }
  };
  
  const handleDeleteSession = (session: Session) => {
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
              await deleteSession(db, session.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              if (sessions.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
              } else {
                fetchSessions();
              }
              
              if (onRefreshSessions) {
                onRefreshSessions();
              }
            } catch (error) {
              logger.error("Error deleting session:", error);
            }
          }
        }
      ]
    );
  };

  return {
    showSessionModal,
    setShowSessionModal,
    editingSession,
    showDatePicker,
    setShowDatePicker,
    sessionData,
    setSessionData,
    handleAddSession,
    handleEditSession,
    handleSaveSession,
    handleDeleteSession,
  };
};
