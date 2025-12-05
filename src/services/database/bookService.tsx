import { Book, NewBook } from '../../types';
import {
  insertBook as dbInsertBook,
  deleteBook as dbDeleteBook,
  getAllBooks as dbGetAllBooks,
  updateBook as dbUpdateBook,
  findPotentialDuplicates,
  DuplicateMatch,
} from '../../database/operations/bookOperations';
import { logger } from '../../../logger';
import { sanitizeInput, sanitizeUrl, sanitizeNumber } from '../../utils/helpers';

interface BookServiceOptions {
  status?: string;
  tags?: string[];
  rating?: number;
  sortBy?: keyof Book;
  sortOrder?: 'asc' | 'desc';
}

export class BookService {
  db: any;
  constructor(db: any) {
    if (!db) {
      throw new Error('BookService requires a database instance');
    }
    this.db = db;
  }

  async getAll(options: BookServiceOptions = {}): Promise<Book[]> {
    try {
      const books = await dbGetAllBooks(this.db);
      let filteredBooks = books;

      if (options.status) {
        filteredBooks = filteredBooks.filter((book: Book) => book.status === options.status);
      }

      if (options.tags && options.tags.length > 0) {
        filteredBooks = filteredBooks.filter((book: Book) =>
          book.tags?.some((tag: string) => options.tags?.includes(tag))
        );
      }

      if (options.rating) {
        filteredBooks = filteredBooks.filter((book: Book) => (book.rating ?? 0) >= options.rating!);
      }

      if (options.sortBy) {
        filteredBooks = this._sortBooks(filteredBooks, options.sortBy, options.sortOrder);
      }

      logger.log(`BookService: Retrieved ${filteredBooks.length} books`);
      return filteredBooks;
    } catch (error) {
      logger.error('BookService.getAll error:', error);
      throw new Error('Failed to fetch books');
    }
  }

  async getById(id: number): Promise<Book> {
    try {
      const book = await this.db.getFirstAsync(
        'SELECT * FROM books WHERE id = ?',
        [id]
      );

      if (!book) {
        throw new Error(`Book with ID ${id} not found`);
      }

      return {
        ...book,
        tags: book.tags ? JSON.parse(book.tags) : []
      };
    } catch (error) {
      logger.error(`BookService.getById(${id}) error:`, error);
      throw error;
    }
  }

  async create(bookData: NewBook): Promise<number> {
    try {
      if (!bookData.title || !bookData.title.trim()) {
        throw new Error('Book title is required');
      }

      const sanitizedData = this._sanitizeBookData(bookData);
      const bookId = await dbInsertBook(this.db, sanitizedData);
      logger.log(`BookService: Created book with ID ${bookId}`);

      return bookId;
    } catch (error) {
      logger.error('BookService.create error:', error);
      throw error;
    }
  }

  async update(id: number, bookData: Partial<Book>): Promise<void> {
    try {
      await this.getById(id); // Verify existence
      const sanitizedData = this._sanitizeBookData(bookData);
      
      // CHANGED: Switched from updateBookWithXP to standard dbUpdateBook
      await dbUpdateBook(this.db, id, sanitizedData);
      
      logger.log(`BookService: Updated book ${id}`);
    } catch (error) {
      logger.error(`BookService.update(${id}) error:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.getById(id);
      await dbDeleteBook(this.db, id);
      logger.log(`BookService: Deleted book ${id}`);
    } catch (error) {
      logger.error(`BookService.delete(${id}) error:`, error);
      throw error;
    }
  }

  async findDuplicates(title: string, author: string, isbn: string): Promise<DuplicateMatch[]> {
    try {
      return await findPotentialDuplicates(this.db, title, author, isbn);
    } catch (error) {
      logger.error('BookService.findDuplicates error:', error);
      return [];
    }
  }

  async search(query: string): Promise<Book[]> {
    try {
      if (!query || !query.trim()) {
        return await this.getAll();
      }

      const books = await this.getAll();
      const lowerQuery = query.toLowerCase().trim();

      return books.filter((book: Book) => {
        const titleMatch = book.title?.toLowerCase().includes(lowerQuery);
        const authorMatch = book.author?.toLowerCase().includes(lowerQuery);
        const isbnMatch = book.isbn?.toLowerCase().includes(lowerQuery);
        const tagMatch = book.tags?.some((tag: string) =>
          tag.toLowerCase().includes(lowerQuery)
        );

        return titleMatch || authorMatch || isbnMatch || tagMatch;
      });
    } catch (error) {
      logger.error('BookService.search error:', error);
      throw error;
    }
  }

  async getByStatus(status: string): Promise<Book[]> {
    return this.getAll({ status });
  }

  async getByTag(tag: string): Promise<Book[]> {
    return this.getAll({ tags: [tag] });
  }

  async getStatusCounts(): Promise<Record<string, number>> {
    try {
      const books = await this.getAll();
      return books.reduce((counts: Record<string, number>, book: Book) => {
        const status = book.status || 'None';
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {});
    } catch (error) {
      logger.error('BookService.getStatusCounts error:', error);
      return {};
    }
  }

  _sanitizeBookData(bookData: Partial<Book>): NewBook {
    return {
      title: sanitizeInput(bookData.title?.trim() || ''),
      author: sanitizeInput(bookData.author?.trim() || ''),
      coverUrl: bookData.coverUrl || '',
      coverPath: bookData.coverPath || '',
      status: bookData.status || 'Unfinished',
      rating: sanitizeNumber(bookData.rating, 0),
      totalPages: sanitizeNumber(bookData.totalPages, 0),
      currentPage: sanitizeNumber(bookData.currentPage, 0),
      bookUrl: sanitizeUrl(bookData.bookUrl?.trim() || ''),
      tags: bookData.tags || [],
      isbn: bookData.isbn || '',
      format: bookData.format || 'Physical',
      publisher: sanitizeInput(bookData.publisher?.trim() || ''),
      publicationYear: Number(String(bookData.publicationYear || '').trim() || '0'),
      language: bookData.language || 'English',
      originalLanguage: bookData.originalLanguage || '',
      seriesName: sanitizeInput(bookData.seriesName?.trim() || ''),
      seriesOrder: String(bookData.seriesOrder),
      volumeNumber: bookData.volumeNumber ? parseInt(String(bookData.volumeNumber)) : undefined,
      totalVolumes: bookData.totalVolumes ? parseInt(String(bookData.totalVolumes)) : undefined,
      totalChapters: bookData.totalChapters ? parseInt(String(bookData.totalChapters)) : undefined,
      currentChapter: sanitizeNumber(bookData.currentChapter, 0),
      trackingType: bookData.trackingType || 'pages',
      collectionType: bookData.collectionType || 'standalone',
      seriesCoverUrl: bookData.seriesCoverUrl || '',
      totalInSeries: bookData.totalInSeries ? parseInt(String(bookData.totalInSeries)) : undefined
    };
  }

  _sortBooks(books: Book[], sortBy: keyof Book, order = 'asc'): Book[] {
    return [...books].sort((a: Book, b: Book) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (aVal == null) return order === 'asc' ? 1 : -1;
      if (bVal == null) return order === 'asc' ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export const createBookService = (db: any): BookService => new BookService(db);
