import { parseCSV, cleanField, parseRating, detectDelimiter } from '../csvParser';
import { logger } from '../../../logger';
import { Book } from '../../types';

/**
 * Goodreads CSV Importer
 *
 * Expected Goodreads CSV columns:
 * - Title
 * - Author / Author l-f
 * - ISBN / ISBN13
 * - My Rating
 * - Number of Pages
 * - Year Published / Original Publication Year
 * - Exclusive Shelf (to-read, currently-reading, read)
 * - Bookshelves (tags)
 * - Date Read
 */

interface GoodreadsBook {
  title: string;
  author: string;
  isbn: string;
  status: Book['status'];
  rating: number;
  totalPages: number;
  currentPage: number;
  tags: string[];
  bookUrl: string;
  coverUrl: string;
  year: string;
  source: 'Goodreads';
}

/**
 * Map Goodreads shelf to app status
 */
const mapShelfToStatus = (shelf: string): Book['status'] => {
  const shelfLower = (shelf || '').toLowerCase().trim();

  switch (shelfLower) {
    case 'read':
      return 'Finished';
    case 'currently-reading':
      return 'Reading';
    case 'to-read':
      return 'Unfinished';
    default:
      return 'Unfinished';
  }
};

/**
 * Parse Goodreads CSV file
 * @param {string} csvText - Raw CSV text
 * @returns {Object} - { books: Array, stats: Object }
 */
export const parseGoodreadsCSV = (csvText: string) => {
  try {
    logger.log('Parsing Goodreads CSV...');

    const delimiter = detectDelimiter(csvText);
    const rows = parseCSV(csvText, delimiter);

    if (rows.length === 0) {
      throw new Error('No books found in CSV file');
    }

    const books: GoodreadsBook[] = [];
    const stats = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    rows.forEach((row: Record<string, string>, index: number) => {
      try {
        const title = cleanField(row['Title']);

        // Skip if no title
        if (!title) {
          stats.skipped++;
          logger.warn(`Row ${index + 2}: No title, skipping`);
          return;
        }

        // Get author (try multiple column names)
        const author = cleanField(
          row['Author'] ||
          row['Author l-f'] ||
          row['Additional Authors'] ||
          ''
        );

        // Get ISBN (prefer ISBN13, fallback to ISBN)
        const isbn = cleanField(
          row['ISBN13'] ||
          row['ISBN'] ||
          ''
        ).replace(/[="]/g, ''); // Remove ="..." wrapper that Goodreads sometimes adds

        // Get rating
        const rating = parseRating(row['My Rating'] || row['Rating'] || '0');

        // Get pages
        const pages = parseInt(cleanField(row['Number of Pages'] || '0'), 10) || 0;

        // Get status from shelf
        const shelf = cleanField(row['Exclusive Shelf'] || row['Shelf'] || '');
        const status = mapShelfToStatus(shelf);

        // Get tags from bookshelves
        const bookshelvesStr = cleanField(row['Bookshelves'] || row['Bookshelves with positions'] || '');
        const tags = bookshelvesStr
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag && tag !== 'to-read' && tag !== 'currently-reading' && tag !== 'read')
          .slice(0, 10); // Limit to 10 tags

        // Get year
        const year = cleanField(
          row['Year Published'] ||
          row['Original Publication Year'] ||
          ''
        );

        // Get cover URL (if available)
        const coverUrl = cleanField(row['Cover'] || row['Image URL'] || '');

        const book: GoodreadsBook = {
          title,
          author,
          isbn,
          status,
          rating,
          totalPages: pages,
          currentPage: status === 'Finished' ? pages : 0,
          tags,
          bookUrl: '',
          coverUrl,
          year,
          source: 'Goodreads'
        };

        books.push(book);
        stats.imported++;

      } catch (error: unknown) {
        stats.skipped++;
        stats.errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        logger.error(`Error parsing row ${index + 2}:`, error);
      }
    });

    logger.log(`Goodreads import: ${stats.imported} books parsed, ${stats.skipped} skipped`);

    return { books, stats };
  } catch (error: unknown) {
    logger.error('Goodreads CSV parsing failed:', error);
    throw new Error(`Failed to parse Goodreads CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate if CSV is from Goodreads
 * @param {string} csvText - Raw CSV text
 * @returns {boolean}
 */
export const isGoodreadsCSV = (csvText: string) => {
  const firstLine = csvText.split('\n')[0].toLowerCase();

  // Check for common Goodreads column names
  return (
    firstLine.includes('title') &&
    (firstLine.includes('author') || firstLine.includes('author l-f')) &&
    (firstLine.includes('exclusive shelf') || firstLine.includes('bookshelves'))
  );
};
