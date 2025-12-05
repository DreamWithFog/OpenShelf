import { useState, useEffect, useCallback } from 'react';
import { getBookNotesPaginated } from '../../../database'; // FIX: Use correct function name
import { logger } from '../../../../logger';
import { Note } from '../../../types';
import { SQLiteDatabase } from 'expo-sqlite';

export const useNotesData = (db: SQLiteDatabase, bookId: number, pageSize: number) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = useCallback(async (page = 1) => {
    if (!db) return;
    if (page === 1 && !refreshing) {
      setIsLoading(true);
    }

    try {
      // FIX: Call the paginated function and handle its response object
      const paginatedResult = await getBookNotesPaginated(db, bookId, page, pageSize);
      
      setNotes(paginatedResult.notes);
      setTotalNotes(paginatedResult.total);
      setTotalPages(paginatedResult.totalPages);
      setCurrentPage(paginatedResult.currentPage);

    } catch (error) {
      logger.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [db, bookId, pageSize, refreshing]);

  useEffect(() => {
    fetchNotes(1); // Always fetch the first page on initial load
  }, [fetchNotes]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotes(1);
  }, [fetchNotes]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchNotes(newPage);
    }
  };

  return {
    notes,
    currentPage,
    setCurrentPage: handlePageChange, // Use the new handler
    totalPages,
    totalNotes,
    isLoading,
    refreshing,
    fetchNotes,
    handleRefresh,
  };
};