import { logger } from '../../../logger';
import { SQLiteDatabase } from 'expo-sqlite';
import { NewSession } from '../../types';

export const getSessionCountsForBooks = async (db: SQLiteDatabase, bookIds: number[]): Promise<Record<number, number>> => {
  if (bookIds.length === 0) return {};
  const placeholders = bookIds.map(() => '?').join(',');
  const query = `SELECT bookId, COUNT(*) as count FROM sessions WHERE bookId IN (${placeholders}) GROUP BY bookId`;
  const results = await db.getAllAsync<{ bookId: number, count: number }>(query, bookIds);
  const countMap: Record<number, number> = {};
  results.forEach(row => { countMap[row.bookId] = row.count; });
  return countMap;
};

export const getNoteCountsForBooks = async (db: SQLiteDatabase, bookIds: number[]): Promise<Record<number, number>> => {
  if (bookIds.length === 0) return {};
  const placeholders = bookIds.map(() => '?').join(',');
  const query = `SELECT bookId, COUNT(*) as count FROM reading_notes WHERE bookId IN (${placeholders}) GROUP BY bookId`;
  const results = await db.getAllAsync<{ bookId: number, count: number }>(query, bookIds);
  const countMap: Record<number, number> = {};
  results.forEach(row => { countMap[row.bookId] = row.count; });
  return countMap;
};

export const batchInsertSessions = async (db: SQLiteDatabase, sessions: NewSession[]) => {
  try {
    await db.execAsync('BEGIN TRANSACTION');
    for (const session of sessions) {
      await db.runAsync(
        `INSERT INTO sessions (bookId, bookTitle, startTime, endTime, startPage, endPage, duration, startChapter, endChapter)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.bookId,
          session.bookTitle,
          session.startTime,
          session.endTime,
          session.startPage,
          session.endPage,
          session.duration,
          session.startChapter,
          session.endChapter,
        ]
      );
    }
    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    logger.error('Error batch inserting sessions:', error);
    throw error;
  }
};
