import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SQLiteDatabase } from 'expo-sqlite';
// FIX: Removed generic EmptyState import
import { useNotesData } from './hooks/useNotesData';
import { useNoteEditor } from './hooks/useNoteEditor';
import {
  NotesHeader,
  NoteCard,
  NotesPagination,
  NoteEditorModal,
} from './components';
// FIX: Import the new local component
import NotesEmptyState from './components/NotesEmptyState';
import { Book, Note } from '../../../types';
import { Theme } from '../../../context/AppContext';

interface BookDetailNotesProps {
  bookId: number;
  bookTitle: string;
  theme: Theme;
  db: SQLiteDatabase | null;
  fullHeight?: boolean;
  prepareUndo: (type: string, data: any, message: string, undoAction: () => Promise<void>) => void;
  onRefreshNotes?: () => void;
  book: Book | null;
}

const BookDetailNotes: React.FC<BookDetailNotesProps> = ({
  bookId,
  bookTitle,
  theme,
  db,
  fullHeight = false,
  prepareUndo,
  onRefreshNotes,
  book
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = fullHeight ? 20 : 3;

  if (!db) {
    return <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 10 }} />;
  }

  const {
    notes,
    totalPages,
    totalNotes,
    isLoadingNotes,
    refreshing,
    fetchNotes,
  } = useNotesData(db, bookId, currentPage, pageSize);

  const {
    showNoteModal,
    noteText,
    setNoteText,
    notePage,
    setNotePage,
    editingNote,
    handleAddNote,
    handleEditNote,
    handleSaveNote,
    handleDeleteNote,
    handleModalClose,
  } = useNoteEditor(
    db,
    bookId,
    book,
    fetchNotes,
    onRefreshNotes || (() => {}),
    prepareUndo,
    notes,
    currentPage,
    setCurrentPage
  );

  const renderNote = ({ item }: { item: Note }) => (
    <NoteCard
      theme={theme}
      note={item}
      onEdit={handleEditNote}
      onDelete={handleDeleteNote}
    />
  );

  return (
    <View style={[styles.container, fullHeight && styles.fullHeight]}>
      <NotesHeader
        theme={theme}
        totalNotes={totalNotes}
        onAddNote={handleAddNote}
      />

      {isLoadingNotes ? (
        <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 10 }} />
      ) : notes.length === 0 ? (
        // FIX: Use the specific component instead of generic one
        <NotesEmptyState theme={theme} />
      ) : (
        <>
          <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id.toString()}
            onRefresh={fetchNotes}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
            scrollEnabled={fullHeight}
          />
          {totalPages > 1 && (
            <NotesPagination
              theme={theme}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      <NoteEditorModal
        theme={theme}
        visible={showNoteModal}
        onClose={handleModalClose}
        noteText={noteText}
        setNoteText={setNoteText}
        notePage={notePage}
        setNotePage={setNotePage}
        editingNote={!!editingNote} 
        onSave={handleSaveNote}
        trackingType={book?.trackingType || 'pages'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 16, 
  },
  fullHeight: {
    flex: 1,
  },
});

export default BookDetailNotes;
