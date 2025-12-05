import { Book, NewBook } from '../../types';
import { logger } from '../../../logger';

interface BookStatistics {
  totalBooks: number;
  readBooks: number;
  currentlyReading: number;
  totalPages: number;
  averageRating: number;
}

export interface DuplicateMatch {
  id: number;
  title: string;
  author: string;
  matchType: 'exact' | 'similar';
  similarity?: number;
}

// Batch insert books
export const batchInsertBooks = async (db: any, books: NewBook[]): Promise<void> => {
  if (!db || books.length === 0) return;

  const sql = `
    INSERT INTO books (
      title, author, isbn, totalPages, coverUrl, coverPath, status,
      currentPage, rating, format, language, publisher,
      publicationYear, tags, seriesName, seriesOrder,
      collectionType, trackingType
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    for (const book of books) {
      await db.runAsync(sql, [
        book.title,
        book.author || null,
        book.isbn || null,
        book.totalPages || 0,
        book.coverUrl || null,
        book.coverPath || null,
        book.status || 'Want to Read',
        book.currentPage || 0,
        book.rating || 0,
        book.format || 'Physical',
        book.language || 'English',
        book.publisher || null,
        book.publicationYear || null,
        book.tags || null,
        book.seriesName || null,
        book.seriesOrder || null,
        book.collectionType || 'book',
        book.trackingType || 'pages'
      ]);
    }
    logger.log(`Successfully batch inserted ${books.length} books`);
  } catch (error) {
    logger.error('Batch insert error:', error);
    throw error;
  }
};

// Get book statistics
export const getBookStatistics = async (db: any): Promise<BookStatistics | Record<string, never>> => {
  if (!db) return {};
  
  try {
    const stats = await db.getFirstAsync<BookStatistics>(`
      SELECT 
        COUNT(*) as totalBooks,
        COUNT(CASE WHEN status = 'Finished' THEN 1 END) as readBooks,
        COUNT(CASE WHEN status = 'Reading' THEN 1 END) as currentlyReading,
        SUM(totalPages) as totalPages,
        AVG(CASE WHEN rating > 0 THEN rating ELSE NULL END) as averageRating
      FROM books
    `);
    
    return stats || {};
  } catch (error) {
    logger.error('Error fetching book statistics:', error);
    return {};
  }
};

// Get all unique tags
export const getAllUniqueTags = async (db: any): Promise<string[]> => {
  if (!db) return [];
  
  try {
    const books = await db.getAllAsync<{ tags: string | null }>('SELECT tags FROM books WHERE tags IS NOT NULL');
    
    const allTags = new Set<string>();
    books.forEach((book: { tags: string | null }) => {
      if (book.tags) {
        const tags = book.tags.split(',').map(t => t.trim());
        tags.forEach(tag => allTags.add(tag));
      }
    });
    
    return Array.from(allTags).sort();
  } catch (error) {
    logger.error('Error fetching unique tags:', error);
    return [];
  }
};

// Insert a new book
export const insertBook = async (db: any, book: NewBook): Promise<number> => {
  const sql = `
    INSERT INTO books (
      title, author, isbn, totalPages, coverUrl, coverPath, status,
      currentPage, rating, format, language, publisher,
      publicationYear, tags, seriesName, seriesOrder,
      collectionType, trackingType
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await db.runAsync(sql, [
    book.title,
    book.author || null,
    book.isbn || null,
    book.totalPages || 0,
    book.coverUrl || null,
    book.coverPath || null,
    book.status || 'Want to Read',
    book.currentPage || 0,
    book.rating || 0,
    book.format || 'Physical',
    book.language || 'English',
    book.publisher || null,
    book.publicationYear || null,
    book.tags || null,
    book.seriesName || null,
    book.seriesOrder || null,
    book.collectionType || 'book',
    book.trackingType || 'pages'
  ]);

  return result.lastInsertRowId;
};

// Get a book by ID
export const getBookById = async (db: any, id: number): Promise<Book | null> => {
  if (!id) return null; // Guard against undefined ID
  const result = await db.getFirstAsync<Book>('SELECT * FROM books WHERE id = ?', [id]);
  return result || null;
};

// Get all books
export const getAllBooks = async (db: any): Promise<Book[]> => {
  const result = await db.getAllAsync<Book>('SELECT * FROM books ORDER BY title');
  return result || [];
};

// Find potential duplicates
export const findPotentialDuplicates = async (db: any, title: string, author: string, isbn: string): Promise<DuplicateMatch[]> => {
  const duplicates: DuplicateMatch[] = [];
  
  if (isbn) {
    const isbnMatches = await db.getAllAsync<Book>(
      'SELECT id, title, author FROM books WHERE isbn = ? AND isbn IS NOT NULL',
      [isbn]
    );
    
    isbnMatches.forEach((book: Book) => {
      duplicates.push({
        id: book.id,
        title: book.title,
        author: book.author || '',
        matchType: 'exact'
      });
    });
  }
  
  const exactMatches = await db.getAllAsync<Book>(
    'SELECT id, title, author FROM books WHERE LOWER(title) = LOWER(?) AND LOWER(author) = LOWER(?)',
    [title, author]
  );
  
  exactMatches.forEach((book: Book) => {
    if (!duplicates.find(d => d.id === book.id)) {
      duplicates.push({
        id: book.id,
        title: book.title,
        author: book.author || '',
        matchType: 'exact'
      });
    }
  });
  
  const similarMatches = await db.getAllAsync<Book>(
    'SELECT id, title, author FROM books WHERE author LIKE ?',
    [`%${author}%`]
  );
  
  similarMatches.forEach((book: Book) => {
    if (!duplicates.find(d => d.id === book.id)) {
      const titleLower = title.toLowerCase();
      const bookTitleLower = book.title.toLowerCase();
      
      if (titleLower.includes(bookTitleLower) || bookTitleLower.includes(titleLower)) {
        duplicates.push({
          id: book.id,
          title: book.title,
          author: book.author || '',
          matchType: 'similar',
          similarity: 80
        });
      }
    }
  });
  
  return duplicates;
};

// Update a book - FIXED: Handles undefined values correctly
export const updateBook = async (db: any, id: number, book: Partial<Book>): Promise<void> => {
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(book).forEach(([key, value]) => {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      // SAFETY CHECK: Convert undefined to null
      values.push(value === undefined ? null : value);
    }
  });
  
  if (fields.length === 0) return;
  
  values.push(id);
  const sql = `UPDATE books SET ${fields.join(', ')} WHERE id = ?`;
  
  await db.runAsync(sql, values);
};

// Delete a book
export const deleteBook = async (db: any, id: number): Promise<void> => {
  await db.runAsync('DELETE FROM sessions WHERE bookId = ?', [id]);
  await db.runAsync('DELETE FROM reading_notes WHERE bookId = ?', [id]);
  await db.runAsync('DELETE FROM books WHERE id = ?', [id]);
};

// Delete all books
export const deleteAllBooks = async (db: any): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM reading_notes');
    await db.runAsync('DELETE FROM sessions');
    await db.runAsync('DELETE FROM books');
    logger.log('All books deleted successfully');
  } catch (error) {
    logger.error('Error deleting all books:', error);
    throw error;
  }
};
