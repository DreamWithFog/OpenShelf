import { useState, Dispatch, SetStateAction } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { insertNote, updateNote, deleteNote, restoreNote } from '../../../../database';
import { logger } from '../../../../logger';
import { SQLiteDatabase } from 'expo-sqlite';
import { Note } from '../../../types';

export const useNoteEditor = (
  db: SQLiteDatabase,
  bookId: string,
  fetchNotes: () => Promise<void>,
  prepareUndo: <T>(type: string, data: T, message: string, onUndo: () => void) => void,
  notes: Note[],
  currentPage: number,
  setCurrentPage: Dispatch<SetStateAction<number>>
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

    try {
      if (editingNote) {
        // Update existing note
        await updateNote(db, editingNote.id, {
          note: noteText.trim(),
          pageNumber: parseInt(notePage) || null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Add new note
        await insertNote(db, {
          bookId: parseInt(bookId),
          note: noteText.trim(),
          pageNumber: parseInt(notePage) || null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setShowNoteModal(false);
      setNoteText('');
      setNotePage('');
      setEditingNote(null);

      // Refresh current page
      fetchNotes();
    } catch (error: unknown) {
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
              // ✅ Store note data for undo
              const noteData = { ...note };

              // Delete the note
              await deleteNote(db, note.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              // Update the list
              if (notes.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
              } else {
                fetchNotes();
              }

              // ✅ Prepare undo
              prepareUndo(
                'note',
                noteData,
                'Note deleted',
                async () => {
                  // Undo: Restore the note
                  await restoreNote(db, noteData);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  fetchNotes(); // Refresh the list
                  logger.log('Note restored successfully');
                }
              );
            } catch (error: unknown) {
              logger.error("Error deleting note:", error);
              Alert.alert("Error", "Failed to delete note");
            }
          }
        }
      ]
    );
  };

  return {
    showNoteModal,
    setShowNoteModal,
    noteText,
    setNoteText,
    notePage,
    setNotePage,
    editingNote,
    handleAddNote,
    handleEditNote,
    handleSaveNote,
    handleDeleteNote,
  } as {
    showNoteModal: boolean;
    setShowNoteModal: Dispatch<SetStateAction<boolean>>;
    noteText: string;
    setNoteText: Dispatch<SetStateAction<string>>;
    notePage: string;
    setNotePage: Dispatch<SetStateAction<string>>;
    editingNote: Note | null;
    handleAddNote: () => void;
    handleEditNote: (note: Note) => void;
    handleSaveNote: () => Promise<void>;
    handleDeleteNote: (note: Note) => void;
  };
};
