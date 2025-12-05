import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { logger } from '../../../../../logger';
import { Book, ActiveSession } from '../../../../types';
import { SQLiteDatabase } from 'expo-sqlite';
import { SessionAnalysis } from '../../../../utils/sessionAnalysis';
import { createSessionService } from '../../../../services/database/sessionService';
import { useAppContext } from '../../../../context/AppContext';

// XP Constants - DELETED
// Context Imports - DELETED

export const useTimerLogic = (
  activeSession: ActiveSession | null,
  setActiveSession: React.Dispatch<React.SetStateAction<ActiveSession | null>>, 
  db: SQLiteDatabase | null,
  onSessionComplete: (() => void) | undefined,
  book: Book | null
) => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showEndPageModal, setShowEndPageModal] = useState<boolean>(false);
  const [showWrapped, setShowWrapped] = useState<boolean>(false);
  const [sessionAnalysis, setSessionAnalysis] = useState<SessionAnalysis | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  
  const { discardSession } = useAppContext();
  // const { showXPGain } = useXPNotification(); // DELETED
  
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef<boolean>(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // HELPER TO AWARD XP - DELETED

  // 1. Sync with Active Session from Context
  useEffect(() => {
    if (activeSession) {
      setIsRunning(true);
      const wasPaused = activeSession.isPaused || false;
      setIsPaused(wasPaused);
      pausedTimeRef.current = activeSession.pausedTime || 0;
      if (wasPaused && activeSession.lastPauseStart) {
        pauseStartRef.current = activeSession.lastPauseStart;
      }
    } else {
      setSeconds(0);
      setIsRunning(false);
      setIsPaused(false);
      setShowWrapped(false);
      pausedTimeRef.current = 0;
    }
  }, [activeSession?.id]);

  // 2. Timer Tick Logic
  useEffect(() => {
    if (isRunning && !isPaused && activeSession) {
      const updateElapsed = () => {
        const startTime = new Date(activeSession.startTime);
        const now = new Date();
        const elapsed = Math.max(0, Math.floor((now.getTime() - startTime.getTime()) / 1000) - pausedTimeRef.current);
        setSeconds(elapsed);
      };
      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isPaused, activeSession?.startTime]);

  // 3. Pause/Resume Handlers
  const handlePauseResume = useCallback(async () => {
    if (!activeSession || isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      if (!isPaused) {
        const now = Date.now();
        pauseStartRef.current = now;
        setIsPaused(true);
        const updated = { ...activeSession, isPaused: true, lastPauseStart: now, pausedTime: pausedTimeRef.current };
        setActiveSession(updated);
        await AsyncStorage.setItem('activeSession', JSON.stringify(updated));
      } else {
        if (pauseStartRef.current) {
          const now = Date.now();
          const pauseDuration = Math.floor((now - pauseStartRef.current) / 1000);
          pausedTimeRef.current += pauseDuration;
          pauseStartRef.current = null;
          setIsPaused(false);
          const updated = { ...activeSession, isPaused: false, pausedTime: pausedTimeRef.current, lastPauseStart: null };
          setActiveSession(updated);
          await AsyncStorage.setItem('activeSession', JSON.stringify(updated));
        }
      }
    } catch (e) { logger.error('Pause error', e); } 
    finally { setTimeout(() => { isUpdatingRef.current = false; }, 300); }
  }, [activeSession, isPaused, seconds]);

  const handleStopPress = () => {
    if (!activeSession) return;
    setIsPaused(true);
    setShowEndPageModal(true);
  };

  const handleCancelModal = () => {
    setShowEndPageModal(false);
    setIsPaused(false);
  };

  // 4. Save Session (CLEANED)
  const handleSaveSession = async (endValue: number) => {
    if (!activeSession || !db || !book) return;

    if (isNaN(endValue)) {
      setHasError(true);
      return;
    }

    try {
      const sessionService = createSessionService(db);
      
      // We still calculate logic, but we don't calculate XP
      const analysis = await sessionService.completeSession(
        book,
        activeSession,
        endValue,
        seconds
      );

      // --- XP LOGIC DELETED HERE ---

      setSessionAnalysis(analysis);
      await discardSession();
      
      setShowEndPageModal(false);
      setShowWrapped(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      onSessionComplete?.();

    } catch (error) {
      logger.error("Error saving session:", error);
      Alert.alert("Error", "Failed to save session. Please try again.");
    }
  };

  const handleCloseWrapped = () => {
    setShowWrapped(false);
  };

  return {
    seconds, isRunning, isPaused, showEndPageModal, hasError, setHasError, shakeAnim,
    handlePauseResume, handleStopPress, handleCancelModal, handleSaveSession,
    showWrapped, sessionAnalysis, handleCloseWrapped
  };
};
