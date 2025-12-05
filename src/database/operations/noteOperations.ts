// Note database operations
// Note: DB column is 'page', TypeScript uses 'pageNumber'. We alias in SELECTs.
import { logger } from '../../../logger';
import type { Note, NewNote } from '@/types';

export interface NoteUpdate {
  note?: string;
  pageNumber?: number | null;
}

export interface PaginatedNotes {
  notes: Note[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Helper to select notes with proper column aliasing
const NOTE_SELECT = `
  id,
  bookId,
  note,
  page AS pageNumber,
  createdAt
`;

// Using 'any' for db parameter as SQLite library types are complex
export const insertNote = async (db: any, note: NewNote): Promise<number> => {
  const result = await db.runAsync(`
    INSERT INTO reading_notes (bookId, note, page)
    VALUES (?, ?, ?)
  `, [note.bookId, note.note, note.pageNumber ?? null]);

  return result.lastInsertRowId;
};

export const updateNote = async (db: any, id: number, note: NoteUpdate): Promise<void> => {
  await db.runAsync(`
    UPDATE reading_notes
    SET note = ?, page = ?
    WHERE id = ?
  `, [note.note, note.pageNumber ?? null, id]);

  logger.log('Note updated successfully:', { id });
};

export const getBookNotesPreview = async (db: any, bookId: number, limit = 3): Promise<Note[]> => {
  const results = await db.getAllAsync(
    `SELECT ${NOTE_SELECT} FROM reading_notes
     WHERE bookId = ?
     ORDER BY
       CASE WHEN page IS NULL THEN 1 ELSE 0 END,
       page ASC,
       createdAt ASC
     LIMIT ?`,
    [bookId, limit]
  );
  return results as Note[];
};

export const getBookNotesPaginated = async (db: any, bookId: number, page = 1, pageSize = 10): Promise<PaginatedNotes> => {
  const offset = (page - 1) * pageSize;

  const countResult = await db.getFirstAsync(
    'SELECT COUNT(*) as total FROM reading_notes WHERE bookId = ?',
    [bookId]
  );

  const results = await db.getAllAsync(
    `SELECT ${NOTE_SELECT} FROM reading_notes
     WHERE bookId = ?
     ORDER BY
       CASE WHEN page IS NULL THEN 1 ELSE 0 END,
       page ASC,
       createdAt ASC
     LIMIT ? OFFSET ?`,
    [bookId, pageSize, offset]
  );

  return {
    notes: results as Note[],
    total: countResult?.total || 0,
    currentPage: page,
    totalPages: Math.ceil((countResult?.total || 0) / pageSize),
    pageSize
  };
};

export const getBookNotes = async (db: any, bookId: number): Promise<Note[]> => {
  const results = await db.getAllAsync(
    `SELECT ${NOTE_SELECT} FROM reading_notes
     WHERE bookId = ?
     ORDER BY
       CASE WHEN page IS NULL THEN 1 ELSE 0 END,
       page ASC,
       createdAt ASC`,
    [bookId]
  );
  return results as Note[];
};

export const getNotesByBookId = async (db: any, bookId: number): Promise<Note[]> => {
  return getBookNotes(db, bookId);
};

export const getBookNotesCount = async (db: any, bookId: number): Promise<number> => {
  const result = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM reading_notes WHERE bookId = ?',
    [bookId]
  );
  return result?.count || 0;
};

export const deleteNote = async (db: any, id: number): Promise<void> => {
  await db.runAsync('DELETE FROM reading_notes WHERE id = ?', [id]);
};
