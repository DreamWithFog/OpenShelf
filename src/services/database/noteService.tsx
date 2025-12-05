// src/services/database/noteService.ts
import {
  insertNote,
  updateNote,
  getBookNotes,
  getBookNotesPreview,
  getBookNotesPaginated,
  getBookNotesCount,
  deleteNote
} from '../../database/operations/noteOperations';
import { logger } from '../../../logger';
import { Note } from '../../types';

type NewNote = Omit<Note, 'id'>;

/**
 * NoteService - Centralized note data operations
 */
export class NoteService {
  db: any;
  constructor(db: any) {
    if (!db) {
      throw new Error('NoteService requires a database instance');
    }
    this.db = db;
  }

  /**
   * Get all notes for a book
   * @param {number} bookId - Book ID
   * @returns {Promise<Note[]>} Array of notes
   */
  async getByBookId(bookId: number): Promise<Note[]> {
    try {
      const notes = await getBookNotes(this.db, bookId);
      logger.log(`NoteService: Retrieved ${notes.length} notes for book ${bookId}`);
      return notes;
    } catch (error) {
      logger.error(`NoteService.getByBookId(${bookId}) error:`, error);
      throw error;
    }
  }

  /**
   * Get preview of notes for a book (limited)
   * @param {number} bookId - Book ID
   * @param {number} limit - Maximum number of notes
   * @returns {Promise<Note[]>} Array of notes
   */
  async getPreview(bookId: number, limit = 3): Promise<Note[]> {
    try {
      const notes = await getBookNotesPreview(this.db, bookId, limit);
      return notes;
    } catch (error) {
      logger.error(`NoteService.getPreview(${bookId}) error:`, error);
      throw error;
    }
  }

  /**
   * Get paginated notes
   * @param {number} bookId - Book ID
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<any>} Paginated result
   */
  async getPaginated(bookId: number, page = 1, pageSize = 10): Promise<any> {
    try {
      const result = await getBookNotesPaginated(this.db, bookId, page, pageSize);
      return result;
    } catch (error) {
      logger.error(`NoteService.getPaginated(${bookId}) error:`, error);
      throw error;
    }
  }

  /**
   * Get note count for a book
   * @param {number} bookId - Book ID
   * @returns {Promise<number>} Note count
   */
  async getCount(bookId: number): Promise<number> {
    try {
      const count = await getBookNotesCount(this.db, bookId);
      return count;
    } catch (error) {
      logger.error(`NoteService.getCount(${bookId}) error:`, error);
      return 0;
    }
  }

  /**
   * Create a new note
   * @param {NewNote} noteData - Note data
   * @returns {Promise<number>} New note ID
   */
  async create(noteData: NewNote): Promise<number> {
    try {
      this._validateNoteData(noteData);

      const noteId = await insertNote(this.db, noteData);
      logger.log(`NoteService: Created note ${noteId}`);
      return noteId;
    } catch (error) {
      logger.error('NoteService.create error:', error);
      throw error;
    }
  }

  /**
   * Update a note
   * @param {number} id - Note ID
   * @param {Partial<Note>} noteData - Updated note data
   * @returns {Promise<void>}
   */
  async update(id: number, noteData: Partial<Note>): Promise<void> {
    try {
      this._validateNoteData(noteData);

      await updateNote(this.db, id, noteData);
      logger.log(`NoteService: Updated note ${id}`);
    } catch (error) {
      logger.error(`NoteService.update(${id}) error:`, error);
      throw error;
    }
  }

  /**
   * Delete a note
   * @param {number} id - Note ID
   * @returns {Promise<void>}
   */
  async delete(id: number): Promise<void> {
    try {
      await deleteNote(this.db, id);
      logger.log(`NoteService: Deleted note ${id}`);
    } catch (error) {
      logger.error(`NoteService.delete(${id}) error:`, error);
      throw error;
    }
  }

  /**
   * Search notes by text
   * @param {number} bookId - Book ID
   * @param {string} query - Search query
   * @returns {Promise<Note[]>} Matching notes
   */
  async search(bookId: number, query: string): Promise<Note[]> {
    try {
      const allNotes = await this.getByBookId(bookId);

      if (!query || !query.trim()) {
        return allNotes;
      }

      return allNotes.filter((note: Note) => {
        const textMatch = note.note?.toLowerCase().includes(query.toLowerCase());
        const pageMatch = note.pageNumber?.toString().includes(query.trim());
        return textMatch || pageMatch;
      });
    } catch (error) {
      logger.error('NoteService.search error:', error);
      throw error;
    }
  }

  /**
   * Get notes by page range
   * @param {number} bookId - Book ID
   * @param {number} startPage - Start page
   * @param {number} endPage - End page
   * @returns {Promise<Note[]>} Notes in page range
   */
  async getByPageRange(bookId: number, startPage: number, endPage: number): Promise<Note[]> {
    try {
      const allNotes = await this.getByBookId(bookId);

      return allNotes.filter((note: Note) => {
        if (note.pageNumber === null || note.pageNumber === undefined) {
          return false;
        }
        return note.pageNumber >= startPage && note.pageNumber <= endPage;
      });
    } catch (error) {
      logger.error('NoteService.getByPageRange error:', error);
      throw error;
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Validate note data
   * @private
   */
  _validateNoteData(data: Partial<Note>): void {
    if (!data.note || !data.note.trim()) {
      throw new Error('Note text is required');
    }

    if (data.pageNumber !== null && data.pageNumber !== undefined) {
      const page = Number(data.pageNumber);
      if (isNaN(page) || page < 0) {
        throw new Error('Page number must be a positive number');
      }
    }
  }
}

export const createNoteService = (db: any): NoteService => new NoteService(db);
