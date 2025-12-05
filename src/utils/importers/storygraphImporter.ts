import { parseCSV, cleanField, parseRating, detectDelimiter } from '../csvParser';
import { logger } from '../../../logger';
import { Book } from '../../types';

/**
 * StoryGraph CSV Importer
 *
 * Expected StoryGraph columns:
 * - Title
 * - Authors
 * - ISBN/UID
 * - Read Status
 * - Star Rating
 * - Dates Read
 * - Tags
 * - Review
 * - Page Count (if available)
 */

interface StoryGraphBook {
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
  source: 'StoryGraph';
}

/**
 * Map StoryGraph read status to app status
 */
const mapReadStatusToStatus = (readStatus: string): Book['status'] => {
  const statusLower = (readStatus || '').toLowerCase().trim();

  switch (statusLower) {
    case 'read':
    case 'finished':
      return 'Finished';
    case 'currently reading':
    case 'reading':
      return 'Reading';
    case 'to-read':
    case 'to read':
    case 'want to read':
      return 'Unfinished';
    case 'did not finish':
    case 'dnf':
      return 'Dropped';
    default:
      return 'Unfinished';
  }
};

/**
 * Parse StoryGraph CSV file
 * @param {string} csvText - Raw CSV text
 * @returns {Object} - { books: Array, stats: Object }
 */
export const parseStoryGraphCSV = (csvText: string) => {
  try {
    logger.log('Parsing StoryGraph CSV...');

    const delimiter = detectDelimiter(csvText);
    const rows = parseCSV(csvText, delimiter);

    if (rows.length === 0) {
      throw new Error('No books found in CSV file');
    }

    const books: StoryGraphBook[] = [];
    const stats = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    rows.forEach((row: Record<string, string>, index: number) => {
      try {
        const title = cleanField(row['Title'] || '');

        if (!title) {
          stats.skipped++;
          logger.warn(`Row ${index + 2}: No title, skipping`);
          return;
        }

        const author = cleanField(row['Authors'] || row['Author'] || '');

        const isbn = cleanField(row['ISBN/UID'] || row['ISBN'] || '').replace(/[="]/g, '');

        // StoryGraph uses 0-5 star rating
        const rating = parseRating(row['Star Rating'] || row['Rating'] || '0');

        // Get read status
        const readStatus = cleanField(row['Read Status'] || '');
        const status = mapReadStatusToStatus(readStatus);

        // Get tags
        const tagsStr = cleanField(row['Tags'] || row['Moods'] || '');
        const tags = tagsStr
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
          .slice(0, 10);

        // Get pages
        const pages = parseInt(cleanField(row['Page Count'] || row['Pages'] || '0'), 10) || 0;

        // Get publication year (if available)
        const year = cleanField(row['Publication Year'] || row['Year'] || '');

        // Get cover URL (if available)
        const coverUrl = cleanField(row['Cover Image URL'] || '');

        const book: StoryGraphBook = {
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
          source: 'StoryGraph'
        };

        books.push(book);
        stats.imported++;

      } catch (error: unknown) {
        stats.skipped++;
        stats.errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        logger.error(`Error parsing row ${index + 2}:`, error);
      }
    });

    logger.log(`StoryGraph import: ${stats.imported} books parsed, ${stats.skipped} skipped`);

    return { books, stats };
  } catch (error: unknown) {
    logger.error('StoryGraph CSV parsing failed:', error);
    throw new Error(`Failed to parse StoryGraph CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate if CSV is from StoryGraph
 * @param {string} csvText - Raw CSV text
 * @returns {boolean}
 */
export const isStoryGraphCSV = (csvText: string) => {
  const firstLine = csvText.split('\n')[0].toLowerCase();

  return (
    firstLine.includes('title') &&
    firstLine.includes('authors') &&
    (firstLine.includes('read status') || firstLine.includes('star rating'))
  );
};
