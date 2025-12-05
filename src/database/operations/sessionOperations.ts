import type { Session, NewSession } from '../schema/sessions';
import { logger } from '../../../logger';

interface SessionUpdate {
  startTime?: string;
  endTime?: string | null;
  startPage?: number | null;
  endPage?: number | null;
  startChapter?: number | null;
  endChapter?: number | null;
  duration?: number | null;
  readingNumber?: number;
}

export interface PaginatedSessions {
  sessions: Session[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface GroupedSessions {
  [key: string]: Session[];
}

export const insertSession = async (db: any, session: NewSession): Promise<number> => {
  const sql = `
    INSERT INTO sessions (
      bookId, bookTitle, startTime, endTime, 
      startPage, endPage, startChapter, endChapter, 
      duration, readingNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await db.runAsync(sql, [
    session.bookId,
    session.bookTitle,
    session.startTime,
    session.endTime || null,
    session.startPage ?? null,
    session.endPage ?? null,
    session.startChapter ?? null,
    session.endChapter ?? null,
    session.duration ?? null,
    session.readingNumber || 1
  ]);

  return result.lastInsertRowId;
};

export const updateSession = async (db: any, id: number, session: SessionUpdate): Promise<void> => {
  const fields = [];
  const values = [];
  
  if (session.startTime !== undefined) {
    fields.push('startTime = ?');
    values.push(session.startTime);
  }
  if (session.endTime !== undefined) {
    fields.push('endTime = ?');
    values.push(session.endTime);
  }
  if (session.startPage !== undefined) {
    fields.push('startPage = ?');
    values.push(session.startPage);
  }
  if (session.endPage !== undefined) {
    fields.push('endPage = ?');
    values.push(session.endPage);
  }
  if (session.startChapter !== undefined) {
    fields.push('startChapter = ?');
    values.push(session.startChapter);
  }
  if (session.endChapter !== undefined) {
    fields.push('endChapter = ?');
    values.push(session.endChapter);
  }
  if (session.duration !== undefined) {
    fields.push('duration = ?');
    values.push(session.duration);
  }
  if (session.readingNumber !== undefined) {
    fields.push('readingNumber = ?');
    values.push(session.readingNumber);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  const sql = `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`;
  
  await db.runAsync(sql, values);
};

export const updateSessionFull = async (db: any, id: number, session: SessionUpdate): Promise<void> => {
  await updateSession(db, id, session);
};

export const getBookSessions = async (db: any, bookId: number): Promise<Session[]> => {
  const results = await db.getAllAsync(
    'SELECT * FROM sessions WHERE bookId = ? ORDER BY startTime DESC',
    [bookId]
  );
  return results as Session[];
};

export const getSessionsByBookId = async (db: any, bookId: number): Promise<Session[]> => {
  return getBookSessions(db, bookId);
};

export const getBookSessionsPaginated = async (db: any, bookId: number, page = 1, pageSize = 10): Promise<PaginatedSessions> => {
  const offset = (page - 1) * pageSize;

  const countResult = await db.getFirstAsync(
    'SELECT COUNT(*) as total FROM sessions WHERE bookId = ?',
    [bookId]
  );

  const results = await db.getAllAsync(
    'SELECT * FROM sessions WHERE bookId = ? ORDER BY startTime DESC LIMIT ? OFFSET ?',
    [bookId, pageSize, offset]
  );

  return {
    sessions: results as Session[],
    total: countResult?.total || 0,
    currentPage: page,
    totalPages: Math.ceil((countResult?.total || 0) / pageSize),
    pageSize
  };
};

export const getBookSessionsGrouped = async (db: any, bookId: number, isChapterTracking: boolean): Promise<GroupedSessions> => {
  const sessions = await getBookSessions(db, bookId);
  const grouped: GroupedSessions = {};

  sessions.forEach((session: Session) => {
    const key = isChapterTracking 
      ? `Chapter ${session.startChapter || 0} - ${session.endChapter || 0}`
      : `Pages ${session.startPage || 0} - ${session.endPage || 0}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(session);
  });

  return grouped;
};

export const getBookSessionsPreview = async (db: any, bookId: number, limit = 3): Promise<Session[]> => {
  const results = await db.getAllAsync(
    'SELECT * FROM sessions WHERE bookId = ? ORDER BY startTime DESC LIMIT ?',
    [bookId, limit]
  );
  return results as Session[];
};

export const getAllBookSessions = async (db: any, bookId: number): Promise<Session[]> => {
  return getBookSessions(db, bookId);
};

export const getBookSessionsCount = async (db: any, bookId: number): Promise<number> => {
  const result = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM sessions WHERE bookId = ?',
    [bookId]
  );
  return result?.count || 0;
};

export const deleteSession = async (db: any, id: number): Promise<void> => {
  await db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
};

export const getAllSessions = async (db: any): Promise<Session[]> => {
  const results = await db.getAllAsync(
    'SELECT * FROM sessions ORDER BY startTime DESC'
  );
  return results as Session[];
};
