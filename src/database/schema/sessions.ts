// Sessions table schema with readingNumber support

export const createSessionsTable = `
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookId INTEGER NOT NULL,
    bookTitle TEXT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    startPage INTEGER DEFAULT 0,
    endPage INTEGER,
    startChapter INTEGER DEFAULT 0,
    endChapter INTEGER,
    duration INTEGER,
    readingNumber INTEGER DEFAULT 1,
    FOREIGN KEY (bookId) REFERENCES books (id) ON DELETE CASCADE
  );
`;

export interface Session {
  id: number;
  bookId: number;
  bookTitle: string;
  startTime: string;
  endTime: string | null;
  startPage: number | null;
  endPage: number | null;
  startChapter: number | null;
  endChapter: number | null;
  duration: number | null;
  readingNumber: number;
}

export type NewSession = Omit<Session, 'id'>;
