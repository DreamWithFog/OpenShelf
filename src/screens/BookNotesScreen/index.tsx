import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppContext } from '../../context/AppContext';
import { useNotesData } from './hooks/useNotesData';
import { useNoteEditor } from '../../components/book/BookDetailNotes/hooks/useNoteEditor'; // FIX: Point to the single source of truth
import { Note, RootStackParamList } from '../../types';
import {
  NotesHeader,
  NoteItem,
  NotesPagination,
  NotesEmptyState,
  NoteEditorModal,
} from './components';

type BookNotesScreenRouteProp = RouteProp<RootStackParamList, 'BookNotes'>;
type BookNotesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookNotes'>;

interface BookNotesScreenProps {
  route: BookNotesScreenRouteProp;
  navigation: BookNotesScreenNavigationProp;
}

const BookNotesScreen: React.FC<BookNotesScreenProps> = ({ route, navigation }) => {
  const { bookId, bookTitle, book } = route.params; // FIX: Use the 'book' object from navigation
  const { theme, db, prepareUndo } = useAppContext();
  
  const pageSize: number = 10;
  
  if (!db) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading database...</Text>
      </View>
    );
  }
  
  const {
    notes,
    currentPage,
    setCurrentPage,
    totalPages,
    totalNotes,
    isLoading,
    refreshing,
    fetchNotes,
    handleRefresh,
  } = useNotesData(db, bookId, pageSize);

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
  } = useNoteEditor(db, bookId, book, fetchNotes, handleRefresh, prepareUndo, notes, currentPage, setCurrentPage);

  const renderNote = ({ item, index }: { item: Note; index: number }) => {
    const noteNumber: number = ((currentPage - 1) * pageSize) + index + 1;
    
    return (
      <NoteItem
        theme={theme}
        item={item}
        noteNumber={noteNumber}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <NotesHeader
        theme={theme}
        navigation={navigation}
        bookTitle={bookTitle}
        totalNotes={totalNotes}
        onAddNote={handleAddNote}
      />

      {isLoading && currentPage === 1 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : notes.length === 0 ? (
        <NotesEmptyState theme={theme} onAddNote={handleAddNote} />
      ) : (
        <>
          <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: totalPages > 1 ? 0 : 16,
            }}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
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
        editingNote={editingNote}
        onSave={handleSaveNote}
      />
    </SafeAreaView>
  );
};

export default BookNotesScreen;