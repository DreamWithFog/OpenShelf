import { useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { insertNote, updateNote, deleteNote, restoreNote } from '../../../../database';
import { logger } from '../../../../../logger';
import { Book, Note, NewNote } from '../../../../types';
import { SQLiteDatabase } from 'expo-sqlite';

// FIX: Correctly typed function signature with all 9 arguments
export const useNoteEditor = (
  db: SQLiteDatabase,
  bookId: number,
  book: Book | null,
  fetchNotes: () => void,
  onRefreshNotes: () => void,
  prepareUndo: (type: string, data: any, message: string, undoAction: () => Promise<void>) => void,
  notes: Note[],
  currentPage: number,
  setCurrentPage: (page: number) => void
) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notePage, setNotePage] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteText('');
    setNotePage('');
    setShowNoteModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteText(note.note);
    setNotePage(note.pageNumber ? note.pageNumber.toString() : '');
    setShowNoteModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      Alert.alert("Error", "Note text is required");
      return;
    }

    const pageNum = parseInt(notePage);
    if (notePage && isNaN(pageNum)) {
      Alert.alert("Invalid Page Number", "Page number must be a valid number");
      return;
    }

    const newNote: NewNote = {
      bookId,
      note: noteText.trim(),
      pageNumber: notePage ? pageNum : null,
    };

    try {
      if (editingNote) {
        await updateNote(db, editingNote.id, {
          note: newNote.note,
          pageNumber: newNote.pageNumber,
        });
      } else {
        await insertNote(db, newNote);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleModalClose();
      fetchNotes();
      if (onRefreshNotes) onRefreshNotes();

    } catch (error) {
      logger.error("Error saving note:", error);
      Alert.alert("Error", "Failed to save note");
    }
  };

  const handleDeleteNote = (note: Note) => {
    const notePreview = note.note.substring(0, 50) + (note.note.length > 50 ? '...' : '');
    
    Alert.alert(
      "Delete Note",
      `Are you sure you want to delete this note?\n\n"${notePreview}"`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const noteData = { ...note };
              await deleteNote(db, note.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              if (notes.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
              } else {
                fetchNotes();
              }
              
              if (onRefreshNotes) onRefreshNotes();
              
              prepareUndo(
                'note',
                noteData,
                'Note deleted',
                async () => {
                  await restoreNote(db, noteData);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  fetchNotes();
                  if (onRefreshNotes) onRefreshNotes();
                }
              );
            } catch (error) {
              logger.error("Error deleting note:", error);
              Alert.alert("Error", "Failed to delete note");
            }
          },
        },
      ]
    );
  };

  const handleModalClose = () => {
    setShowNoteModal(false);
    setNoteText('');
    setNotePage('');
    setEditingNote(null);
  };

  return {
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
    handleModalClose, // FIX: Exporting the closer function
    setShowNoteModal,
  };
};