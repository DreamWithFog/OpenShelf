import logger from '../../logger';

/**
 * ISBN Lookup Utility
 * Fetches book details from multiple sources
 */

// Google Books API (no API key required for basic usage)
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes?q=isbn:';

// Open Library API (completely free, no limits)
const OPEN_LIBRARY_API = 'https://openlibrary.org/api/books?bibkeys=ISBN:';
const OPEN_LIBRARY_DETAILS = '&format=json&jscmd=data';

interface BookData {
  title: string;
  author: string;
  isbn: string;
  pageCount: number | null;
  publishedDate: string;
  publisher: string;
  description: string;
  categories: string[];
  coverUrl: string;
  language: string;
  source: 'Google Books' | 'Open Library' | '';
}

/**
 * Clean and validate ISBN
 * @param {string} isbn - Raw ISBN string
 * @returns {string|null} - Cleaned ISBN or null if invalid
 */
export const cleanISBN = (isbn: string): string | null => {
  // Remove any non-digit characters except 'X' (valid in ISBN-10)
  const cleaned = isbn.replace(/[^0-9X]/gi, '').toUpperCase();
  
  // Check if it's a valid ISBN-10 or ISBN-13
  if (cleaned.length === 10 || cleaned.length === 13) {
    return cleaned;
  }
  
  return null;
};

/**
 * Fetch book details from Google Books API
 * @param {string} isbn - ISBN number
 * @returns {Promise<BookData|null>} - Book details or null
 */
export const fetchFromGoogleBooks = async (isbn: string): Promise<BookData | null> => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}${isbn}`);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const book = data.items[0].volumeInfo;
      
      return {
        title: book.title || '',
        author: book.authors ? book.authors.join(', ') : '',
        isbn: isbn,
        pageCount: book.pageCount || null,
        publishedDate: book.publishedDate || '',
        publisher: book.publisher || '',
        description: book.description || '',
        categories: book.categories || [],
        coverUrl: book.imageLinks ? 
          (book.imageLinks.large || book.imageLinks.medium || book.imageLinks.thumbnail || '')
          .replace('http://', 'https://') : '',
        language: book.language || '',
        source: 'Google Books'
      };
    }
    
    return null;
  } catch (error) {
    logger.error('Google Books API error:', error);
    return null;
  }
};

interface NamedEntity { name: string; }

/**
 * Fetch book details from Open Library API
 * @param {string} isbn - ISBN number
 * @returns {Promise<BookData|null>} - Book details or null
 */
export const fetchFromOpenLibrary = async (isbn: string): Promise<BookData | null> => {
  try {
    const response = await fetch(`${OPEN_LIBRARY_API}${isbn}${OPEN_LIBRARY_DETAILS}`);
    const data = await response.json();
    
    const bookKey = `ISBN:${isbn}`;
    if (data[bookKey]) {
      const book = data[bookKey];
      
      return {
        title: book.title || '',
        author: book.authors ? book.authors.map((a: NamedEntity) => a.name).join(', ') : '',
        isbn: isbn,
        pageCount: book.number_of_pages || null,
        publishedDate: book.publish_date || '',
        publisher: book.publishers ? book.publishers.map((p: NamedEntity) => p.name).join(', ') : '',
        description: book.notes || book.subtitle || '',
        categories: book.subjects ? book.subjects.map((s: NamedEntity) => s.name) : [],
        coverUrl: book.cover ? book.cover.large || book.cover.medium || book.cover.small || '' : '',
        language: '',
        source: 'Open Library'
      };
    }
    
    return null;
  } catch (error) {
    logger.error('Open Library API error:', error);
    return null;
  }
};

/**
 * Lookup book details by ISBN
 * Tries multiple sources and returns the first successful result
 * @param {string} isbn - ISBN number
 * @returns {Promise<BookData|null>} - Book details or null
 */
export const lookupISBN = async (isbn: string): Promise<BookData | null> => {
  const cleanedISBN = cleanISBN(isbn);
  
  if (!cleanedISBN) {
    throw new Error('Invalid ISBN format');
  }
  
  logger.log('Looking up ISBN:', cleanedISBN);
  
  // Try Google Books first (usually has better data)
  const googleResult = await fetchFromGoogleBooks(cleanedISBN);
  if (googleResult) {
    logger.log('Book found on Google Books');
    return googleResult;
  }
  
  // Fall back to Open Library
  const openLibraryResult = await fetchFromOpenLibrary(cleanedISBN);
  if (openLibraryResult) {
    logger.log('Book found on Open Library');
    return openLibraryResult;
  }
  
  logger.warn('Book not found in any source');
  return null;
};

interface FormattedBookData {
  title: string;
  author: string;
  isbn: string;
  pages: string;
  year: number | string;
  publisher: string;
  description: string;
  tags: string[];
  coverUrl: string;
  source: 'Google Books' | 'Open Library' | '';
}

/**
 * Format book data for the app
 * @param {BookData} bookData - Raw book data from API
 * @returns {FormattedBookData|null} - Formatted book data for the app
 */
export const formatBookData = (bookData: BookData): FormattedBookData | null => {
  if (!bookData) return null;
  
  return {
    title: bookData.title || '',
    author: bookData.author || '',
    isbn: bookData.isbn || '',
    pages: bookData.pageCount ? String(bookData.pageCount) : '',
    year: bookData.publishedDate ? new Date(bookData.publishedDate).getFullYear() : '',
    publisher: bookData.publisher || '',
    description: bookData.description || '',
    tags: bookData.categories ? bookData.categories.slice(0, 5) : [],
    coverUrl: bookData.coverUrl || '',
    source: bookData.source || ''
  };
};