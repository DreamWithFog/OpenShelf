export interface Book {
  id: number;
  title: string;
  author: string | null;
  coverUrl: string | null;
  coverPath: string | null;
  status: string;
  rating: number;
  totalPages: number;
  currentPage: number;
  bookUrl: string | null;
  tags: string | null;
  isbn: string | null;
  format: string;
  publisher: string | null;
  publicationYear: string | null;
  language: string;
  originalLanguage: string | null;
  seriesName: string | null;
  seriesOrder: number | null;
  volumeNumber: number | null;
  totalVolumes: number | null;
  totalChapters: number | null;
  currentChapter: number;
  trackingType: string;
  collectionType: string | null;
  seriesCoverUrl: string | null;
  totalInSeries: number | null;
  readCount: number;
  createdAt: string;
  updatedAt: string;
}

export type NewBook = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;

export interface DisplayItem extends Book {
  isSeriesHeader?: boolean;
  itemType?: 'book' | 'series';
  booksInSeries?: Book[];
}
