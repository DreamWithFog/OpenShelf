export { Book, NewBook, DisplayItem } from './books';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface FormState {
  title: string;
  author: string;
  isbn: string;
  pages: string;
  currentPage: string;
  coverImage: string | null;
  status: string;
  rating: number;
  notes: string;
  format: string;
  language: string;
  publisher: string;
  publicationDate: string;
  startDate: string | null;
  endDate: string | null;
  tags: string;
  seriesName: string;
  seriesNumber: string;
  collectionType: string;
  trackingType: string;
}

export type BookAction = 
  | { type: 'SET_FIELD'; field: keyof FormState; value: string | number | null }
  | { type: 'RESET_FORM'; initialState?: Partial<FormState> }
  | { type: 'SET_BOOK_DATA'; data: Partial<FormState> };

export interface ActiveSession {
  bookId: number;
  bookTitle: string;
  startTime: Date;
  startPage?: number;
  startChapter?: number;
}

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

export interface NewSession {
  bookId: number;
  bookTitle: string;
  startTime: string;
  endTime: string | null;
  startPage?: number | null;
  endPage?: number | null;
  startChapter?: number | null;
  endChapter?: number | null;
  duration?: number | null;
  readingNumber?: number;
}

export interface Note {
  id: number;
  bookId: number;
  note: string;
  pageNumber?: number | null;
  createdAt: string;
}

export type NewNote = {
  bookId: number;
  note: string;
  pageNumber?: number | null;
};

export type RootStackParamList = {
  'My Bookshelf': { seriesFilter?: string; filters?: any } | undefined;
  'BookDetail': { bookId: number };
  'AddBook': { bookData?: any; isDuplicate?: boolean } | undefined;
  'Settings': undefined;
  'Stats': undefined;
  'BackupScreen': undefined;
  'BookNotes': { bookId: number; bookTitle: string };
  'BookSessions': { bookId: number; bookTitle: string; isChapterTracking: boolean };
  'BulkImport': undefined;
};

export interface ImportStats {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: number;
}

export interface DuplicateBook {
  id: number;
  title: string;
  author: string;
  matchType: 'exact' | 'similar';
}

export interface DuplicateMatch {
  id: number;
  title: string;
  author: string;
  matchType: 'exact' | 'similar';
  similarity?: number;
}
