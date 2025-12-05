import {
  getBookSessions,
  getBookSessionsPreview,
  getBookSessionsCount,
  getBookSessionsPaginated,
  deleteSession,
  getAllSessions,
  insertSession,     // CHANGED: Using clean insert
  updateSession,     // CHANGED: Using clean update
  updateSessionFull  // ADDED: For full updates if needed
} from '../../database/operations/sessionOperations';

// DELETED: import { insertSessionWithXP, updateSessionWithXP } ...

import { logger } from '../../../logger';
import { Session, NewSession, Book } from '../../types';
import { analyzeSession, SessionAnalysis } from '../../utils/sessionAnalysis';

export class SessionService {
  db: any;
  constructor(db: any) {
    if (!db) {
      throw new Error('SessionService requires a database instance');
    }
    this.db = db;
  }

  async getByBookId(bookId: number): Promise<Session[]> {
    return await getBookSessions(this.db, bookId);
  }

  async getPreview(bookId: number, limit = 3): Promise<Session[]> {
    return await getBookSessionsPreview(this.db, bookId, limit);
  }

  async getPaginated(bookId: number, page = 1, pageSize = 10): Promise<any> {
    return await getBookSessionsPaginated(this.db, bookId, page, pageSize);
  }

  async getCount(bookId: number): Promise<number> {
    return await getBookSessionsCount(this.db, bookId);
  }

  async getAll(): Promise<Session[]> {
    return await getAllSessions(this.db);
  }

  async saveManualSession(
    bookId: number,
    sessionPayload: NewSession,
    editingSessionId?: number
  ): Promise<void> {
    return await this.db.withTransactionAsync(async () => {
      const book = await this.db.getFirstAsync(
        `SELECT id, title, totalPages, totalChapters, currentPage, currentChapter, 
                status, readCount FROM books WHERE id = ?`,
        [bookId]
      );

      if (!book) throw new Error('Book not found');

      const sessionToSave = { ...sessionPayload };

      if (!editingSessionId) {
         const currentReadingNumber = (book.readCount || 0) + 1;
         sessionToSave.readingNumber = currentReadingNumber;
      }

      if (editingSessionId) {
        // CHANGED: Now using clean updateSession
        await updateSession(this.db, editingSessionId, sessionToSave);
      } else {
        // CHANGED: Now using clean insertSession
        await insertSession(this.db, sessionToSave);
      }

      // Logic to update Book Progress (Pages/Chapters) remains untouched
      if (!editingSessionId) {
        const hasPageProgress = sessionPayload.endPage && sessionPayload.endPage > (book.currentPage || 0);
        const hasChapterProgress = sessionPayload.endChapter && sessionPayload.endChapter > (book.currentChapter || 0);
        
        if (hasPageProgress || hasChapterProgress) {
          const newCurrentPage = sessionPayload.endPage || book.currentPage;
          const newCurrentChapter = sessionPayload.endChapter || book.currentChapter;

          const isFinished = 
            (book.totalPages && newCurrentPage >= book.totalPages) ||
            (book.totalChapters && newCurrentChapter >= book.totalChapters);

          if (isFinished && book.status !== 'Finished') {
            await this.db.runAsync(
              `UPDATE books 
               SET currentPage = ?, currentChapter = ?, status = 'Finished', 
                   readCount = readCount + 1, updatedAt = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [newCurrentPage, newCurrentChapter, bookId]
            );
          } else {
             await this.db.runAsync(
               `UPDATE books 
                SET currentPage = ?, currentChapter = ?, status = 'Reading', updatedAt = CURRENT_TIMESTAMP
                WHERE id = ?`,
               [newCurrentPage, newCurrentChapter, bookId]
             );
          }
        }
      }
    });
  }

  async completeSession(
    book: Book,
    activeSession: any,
    endValue: number,
    secondsDuration: number
  ): Promise<SessionAnalysis> {
    try {
      const isChapterTracking = book.trackingType === 'chapters';
      const durationMinutes = Math.max(0, Math.floor(secondsDuration / 60));
      
      const startValue = isChapterTracking 
        ? (activeSession.startChapter || 0) 
        : (activeSession.startPage || 0);

      const sessionPayload: NewSession = {
        bookId: book.id,
        bookTitle: book.title,
        startTime: activeSession.startTime,
        endTime: new Date().toISOString(),
        startPage: isChapterTracking ? null : startValue,
        endPage: isChapterTracking ? null : endValue,
        startChapter: isChapterTracking ? startValue : null,
        endChapter: isChapterTracking ? endValue : null,
        duration: durationMinutes,
      };

      await this.saveManualSession(book.id, sessionPayload);

      const safeEndValue = Math.max(endValue, startValue);
      // Ensure analyzeSession is imported correctly at the top
      const analysis = analyzeSession(book, startValue, safeEndValue, secondsDuration, 0);

      logger.log(`SessionService: Completed session for book ${book.id}. Duration: ${durationMinutes}m`);
      return analysis;

    } catch (error) {
      logger.error('SessionService.completeSession failed:', error);
      throw error;
    }
  }

  async create(sessionData: NewSession): Promise<number> {
    this._validateSessionData(sessionData);
    // CHANGED: Clean insert
    return await insertSession(this.db, sessionData);
  }

  async update(id: number, updateData: Partial<Session>): Promise<void> {
    // CHANGED: Clean update
    await updateSession(this.db, id, updateData);
  }

  async delete(id: number): Promise<void> {
    await deleteSession(this.db, id);
  }

  _validateSessionData(data: Partial<Session | NewSession>, requireComplete = false): void {
    if (!data.bookId) throw new Error('Session bookId is required');
    if (!data.bookTitle) throw new Error('Session bookTitle is required');
    if (!data.startTime) throw new Error('Session startTime is required');
    
    if (data.endTime && new Date(data.endTime).getTime() < new Date(data.startTime).getTime()) {
        throw new Error('Session endTime cannot be before startTime');
    }
  }
}

export const createSessionService = (db: any): SessionService => new SessionService(db);
