import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAppContext } from '../../../context/AppContext';
import { useSessionsData } from './hooks/useSessionsData';
import { useSessionEditor } from './hooks/useSessionEditor';
import { SessionsHeader, SessionItem, SessionsPagination, SessionEditorModal } from './components';
import { RereadModal } from '../../../components'; // Import RereadModal
import { Book } from '../../../types';

interface BookDetailSessionsProps {
  book: Book;
  onRefreshSessions?: () => void;
  fullHeight?: boolean;
}

const SESSIONS_PER_PAGE = 10;

export const BookDetailSessions: React.FC<BookDetailSessionsProps> = ({
  book,
  onRefreshSessions = null,
  fullHeight = false,
}) => {
  const { theme, db } = useAppContext();
  const bookId = typeof book.id === 'number' ? book.id : parseInt(book.id as string, 10);
  
  // NEW: Reread Modal State
  const [showRereadModal, setShowRereadModal] = useState(false);

  const {
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
  } = useSessionsData(db, bookId, SESSIONS_PER_PAGE, book);

  const {
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
  } = useSessionEditor(
    db!,
    bookId,
    book,
    fetchSessions,
    syncBookCurrentProgress,
    onRefreshSessions,
    sessions,
    currentPage,
    setCurrentPage,
    isChapterTracking
  );

  // NEW: Intercept the Add button press
  const handlePressAdd = () => {
    const isChapters = book.trackingType === 'chapters';
    const total = isChapters ? (book.totalChapters || 0) : (book.totalPages || 0);
    const current = isChapters ? (book.currentChapter || 0) : (book.currentPage || 0);

    // If book is finished, show reread modal first
    if (total > 0 && current >= total) {
      setShowRereadModal(true);
    } else {
      // Otherwise proceed normally
      handleAddSession();
    }
  };

  // NEW: Handle the reread confirmation
  const handleConfirmReread = async () => {
    if (!db) return;

    const isChapters = book.trackingType === 'chapters';

    // 1. Reset progress in DB
    if (isChapters) {
      await db.runAsync('UPDATE books SET currentChapter = 0, status = "Reading", readCount = COALESCE(readCount, 0) + 1 WHERE id = ?', [bookId]);
    } else {
      await db.runAsync('UPDATE books SET currentPage = 0, status = "Reading", readCount = COALESCE(readCount, 0) + 1 WHERE id = ?', [bookId]);
    }

    // 2. Trigger parent refresh to update UI
    if (onRefreshSessions) onRefreshSessions();

    setShowRereadModal(false);
    
    // 3. Open the session editor
    handleAddSession();

    // 4. FORCE override the start page to '0'
    // FIX: Use 'startValue' (string) not 'startPage' (number) because that's what sessionData uses
    setSessionData(prev => ({ ...prev, startValue: '0' }));
  };

  return (
    <View style={[styles.container, fullHeight && styles.fullHeight]}>
      <SessionsHeader
        theme={theme}
        totalSessions={totalSessions}
        onAddSession={handlePressAdd} // Use intercepted handler
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {isLoadingSessions ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No reading sessions yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to add your first session
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sessionsList}>
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  theme={theme}
                  isChapterTracking={isChapterTracking}
                  onEdit={() => handleEditSession(session)}
                  onDelete={() => handleDeleteSession(session)}
                />
              ))}
            </View>

            {totalPages > 1 && (
              <SessionsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                theme={theme}
              />
            )}
          </>
        )}
      </ScrollView>

      <SessionEditorModal
        visible={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        editingSession={editingSession}
        sessionData={sessionData}
        setSessionData={setSessionData}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        onSave={handleSaveSession}
        isChapterTracking={isChapterTracking}
        theme={theme}
      />

      {/* NEW: Reread Modal */}
      <RereadModal 
        visible={showRereadModal} 
        onClose={() => setShowRereadModal(false)} 
        onConfirm={handleConfirmReread} 
        theme={theme}
        bookTitle={book.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    marginTop: 25,
  },
  fullHeight: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  sessionsList: {
    paddingHorizontal: 16,
  },
});
