import { useState, useEffect, useCallback } from 'react';
import { getBookNotesPaginated } from '../../../../database';
import { logger } from '../../../../../logger';
import { SQLiteDatabase } from 'expo-sqlite';
import { Note } from '../../../../types';

interface NotesDataResult {
  notes: Note[];
  totalPages: number;
  totalNotes: number;
  isLoadingNotes: boolean;
  refreshing: boolean;
  fetchNotes: () => Promise<void>;
}

export const useNotesData = (db: SQLiteDatabase | null, bookId: number, currentPage: number, pageSize: number): NotesDataResult => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!db) {
      setIsLoadingNotes(false);
      return;
    }
    
    if (!refreshing) setIsLoadingNotes(true);

    try {
      const result = await getBookNotesPaginated(db, bookId, currentPage, pageSize);
      setNotes(result.notes as Note[]);
      setTotalPages(result.totalPages);
      setTotalNotes(result.total);
    } catch (error) {
      logger.error("Error fetching notes:", error);
    } finally {
      setIsLoadingNotes(false);
      setRefreshing(false);
    }
  }, [db, bookId, currentPage, pageSize, refreshing]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // FIX: This function now correctly matches the async type in the interface
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
  };

  return {
    notes,
    totalPages,
    totalNotes,
    isLoadingNotes,
    refreshing,
    fetchNotes: handleRefresh,
  };
};