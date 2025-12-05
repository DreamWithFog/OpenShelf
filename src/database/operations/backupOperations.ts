import { logger } from '../../../logger';
import { getAllBooks, insertBook } from './bookOperations';
import { getAllSessions, insertSession } from './sessionOperations';
import { insertNote } from './noteOperations';
import { Book, NewBook, Session, NewSession, Note, NewNote } from '../../types';
import { SQLiteDatabase } from 'expo-sqlite';

interface ExportData {
  version: string;
  exportDate: string;
  books: Book[];
  sessions: Session[];
}

interface ImportResult {
  success: boolean;
  bookIdMap?: Map<number, number>;
  error?: string;
}

export const exportAllData = async (db: SQLiteDatabase): Promise<string> => {
  const books: Book[] = await getAllBooks(db);
  const sessions: Session[] = await getAllSessions(db);

  const exportData: ExportData = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    books: books,
    sessions,
  };

  return JSON.stringify(exportData, null, 2);
};

export const importData = async (db: SQLiteDatabase, data: string): Promise<ImportResult> => {
  try {
    const parsedData: ExportData = JSON.parse(data);
    const bookIdMap = new Map<number, number>();

    await db.execAsync('BEGIN TRANSACTION;');
    
    for (const book of parsedData.books) {
      const oldId = book.id as number;
      const { id, ...bookWithoutId } = book;
      const newId = await insertBook(db, bookWithoutId as NewBook);
      bookIdMap.set(oldId, newId);
    }

    if (parsedData.sessions) {
      for (const session of parsedData.sessions) {
        const oldBookId = session.bookId;
        const newBookId = bookIdMap.get(oldBookId);

        if (newBookId) {
          const { id, ...sessionWithoutId } = session;
          const sessionWithNewId: NewSession = {
            ...sessionWithoutId,
            bookId: newBookId,
          };
          await insertSession(db, sessionWithNewId);
        }
      }
    }
    
    await db.execAsync('COMMIT;');
    return { success: true, bookIdMap };
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    logger.error('Import error:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const restoreBook = async (db: SQLiteDatabase, book: Book): Promise<number> => {
  const { id, ...bookWithoutId } = book;
  return insertBook(db, bookWithoutId as NewBook);
};

export const restoreSession = async (db: SQLiteDatabase, session: Session): Promise<number> => {
  const { id, ...sessionWithoutId } = session;
  return insertSession(db, sessionWithoutId as NewSession);
};

export const restoreNote = async (db: SQLiteDatabase, note: Note): Promise<number> => {
  const { id, ...noteWithoutId } = note;
  return insertNote(db, noteWithoutId as NewNote);
};
