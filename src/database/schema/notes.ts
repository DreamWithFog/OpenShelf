export const createNotesTable = `
  CREATE TABLE IF NOT EXISTS reading_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookId INTEGER NOT NULL,
    note TEXT NOT NULL,
    page INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookId) REFERENCES books (id) ON DELETE CASCADE
  );
`;

// Note: DB column is 'page', but we alias to 'pageNumber' in queries for TypeScript consistency
export interface Note {
  id: number;
  bookId: number;
  note: string;
  pageNumber: number | null;
  createdAt: string;
}

export type NewNote = Omit<Note, 'id' | 'createdAt'>;
