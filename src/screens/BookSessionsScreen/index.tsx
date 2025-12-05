import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { SessionModal } from './components/SessionModal';
import { SessionGroup } from './components/SessionGroup';
import { useSessionsData } from './hooks/useSessionsData';
import { useSessionModal } from './hooks/useSessionModal';
import { RootStackParamList } from '../../types';

type BookSessionsRouteProp = RouteProp<RootStackParamList, 'BookSessions'>;
type BookSessionsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookSessions'>;

export const BookSessionsScreen = () => {
  const route = useRoute<BookSessionsRouteProp>();
  const navigation = useNavigation<BookSessionsNavigationProp>();
  const { theme, db } = useAppContext();
  
  const { bookId, bookTitle, book } = route.params;
  const isChapterTracking = book?.trackingType === 'chapters';

  const {
    groupedSessions,
    isLoading,
    refreshing,
    fetchSessions,
    handleRefresh,
    handleDeleteSession,
  } = useSessionsData(db!, bookId, isChapterTracking);

  const {
    showModal,
    setShowModal,
    editingSession,
    sessionData,
    setSessionData,
    handleAddSession,
    handleEditSession,
    handleSaveSession,
  } = useSessionModal(db!, bookId, bookTitle, fetchSessions, isChapterTracking, []);

  if (!db) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  console.log('🎨 GROUPS TO RENDER:', groupedSessions.map(g => ({
      readingNumber: g.readingNumber,
      sessionCount: g.sessions.length,
      firstSessionPages: g.sessions[0] ? `${g.sessions[0].startPage}→${g.sessions[0].endPage}` : 'none'
    })));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {bookTitle}
        </Text>
        <TouchableOpacity onPress={handleAddSession} style={styles.addButton}>
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groupedSessions}
        keyExtractor={(item) => `group-${item.readingNumber}`}
        renderItem={({ item }) => (
          <SessionGroup
            group={item}
            theme={theme}
            isChapterTracking={isChapterTracking}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="reader-outline" size={64} color={theme.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No reading sessions yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to add your first session
            </Text>
          </View>
        }
      />

      <SessionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => handleSaveSession(sessionData)}
        editingSession={editingSession}
        sessionData={sessionData}
        setSessionData={setSessionData}
        showDatePicker={false}
        setShowDatePicker={() => {}}
        book={book}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
