import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useAppContext } from '../../../context/AppContext';
import { useTimerLogic } from './hooks/useTimerLogic';
import EndSessionModal from './components/EndSessionModal';
import FocusTimerMode from './components/FocusTimerMode';
import SessionWrapped from './components/SessionWrapped';
import { Book } from '../../../types';

interface SessionTimerProps {
  book: Book | null;
  onSessionComplete?: () => void;
  showFocusMode: boolean;
  onCloseFocusMode: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ 
  book, 
  onSessionComplete,
  showFocusMode,
  onCloseFocusMode
}) => {
  const { theme, activeSession, setActiveSession, db } = useAppContext();
  
  const {
    seconds,
    isPaused,
    showEndPageModal,
    handlePauseResume,
    handleStopPress,
    handleCancelModal,
    handleSaveSession,
    showWrapped,
    sessionAnalysis,
    handleCloseWrapped
  } = useTimerLogic(activeSession, setActiveSession, db, onSessionComplete, book);

  if (!activeSession) return null;

  return (
    <>
      {/* Full Screen Focus Mode */}
      <FocusTimerMode 
        visible={showFocusMode}
        book={book}
        seconds={seconds}
        isPaused={isPaused}
        activeSession={activeSession}
        onPauseResume={handlePauseResume}
        onStop={handleStopPress}
        onClose={onCloseFocusMode}
        theme={theme}
      />

      {/* End Session Input Modal */}
      <EndSessionModal
        visible={showEndPageModal}
        onClose={handleCancelModal}
        onConfirm={handleSaveSession}
        startValue={book?.trackingType === 'chapters' ? (activeSession.startChapter || 0) : (activeSession.startPage || 0)}
        book={book}
        theme={theme}
      />

      {/* Session Wrapped (Reward) */}
      <SessionWrapped 
        visible={showWrapped}
        analysis={sessionAnalysis}
        onClose={handleCloseWrapped}
        onAddNote={() => {
           handleCloseWrapped();
        }}
        theme={theme}
      />
    </>
  );
};

export default SessionTimer;
