import { parseCSV, cleanField, parseRating, detectDelimiter } from '../csvParser';
import { logger } from '../../../logger';
import { Book } from '../../types';

/**
 * LibraryThing CSV/TSV Importer
 *
 * Expected LibraryThing columns:
 * - TITLE
 * - AUTHOR (PRIMARY)
 * - ISBN
 * - DATE
 * - RATING
 * - TAGS
 * - COLLECTIONS
 * - REVIEW
 * - PAGES (if available)
 */

interface LibraryThingBook {
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
  source: 'LibraryThing';
}

/**
 * Map LibraryThing collection to app status
 */
const mapCollectionToStatus = (collection: string): Book['status'] => {
  const collectionLower = (collection || '').toLowerCase().trim();

  if (collectionLower.includes('reading') || collectionLower.includes('currently')) {
    return 'Reading';
  }
  if (collectionLower.includes('read') || collectionLower.includes('finished')) {
    return 'Finished';
  }
  if (collectionLower.includes('to read') || collectionLower.includes('want')) {
    return 'Unfinished';
  }

  return 'Unfinished';
};

/**
 * Parse LibraryThing CSV/TSV file
 * @param {string} csvText - Raw CSV/TSV text
 * @returns {Object} - { books: Array, stats: Object }
 */
export const parseLibraryThingCSV = (csvText: string) => {
  try {
    logger.log('Parsing LibraryThing CSV...');

    const delimiter = detectDelimiter(csvText);
    const rows = parseCSV(csvText, delimiter);

    if (rows.length === 0) {
      throw new Error('No books found in file');
    }

    const books: LibraryThingBook[] = [];
    const stats = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    rows.forEach((row: Record<string, string>, index: number) => {
      try {
        const title = cleanField(row['TITLE'] || row['Title'] || '');

        if (!title) {
          stats.skipped++;
          logger.warn(`Row ${index + 2}: No title, skipping`);
          return;
        }

        const author = cleanField(
          row['AUTHOR (PRIMARY)'] ||
          row['AUTHOR'] ||
          row['Author'] ||
          ''
        );

        const isbn = cleanField(row['ISBN'] || '').replace(/[="]/g, '');

        const rating = parseRating(row['RATING'] || row['Rating'] || '0');

        // LibraryThing ratings are often out of 5, but could be 0.5-5 stars
        const normalizedRating = rating > 5 ? Math.round(rating / 2) : rating;

        // Get tags
        const tagsStr = cleanField(row['TAGS'] || row['Tags'] || '');
        const tags = tagsStr
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
          .slice(0, 10);

        // Get collection/status
        const collection = cleanField(row['COLLECTIONS'] || row['Collections'] || '');
        const status = mapCollectionToStatus(collection);

        // Get pages (if available)
        const pages = parseInt(cleanField(row['PAGES'] || row['Pages'] || '0'), 10) || 0;

        // Get publication year (if available)
        const year = cleanField(row['DATE'] || row['Publication Date'] || '');

        const book: LibraryThingBook = {
          title,
          author,
          isbn,
          status,
          rating: normalizedRating,
          totalPages: pages,
          currentPage: status === 'Finished' ? pages : 0,
          tags,
          bookUrl: '',
          coverUrl: '',
          year,
          source: 'LibraryThing'
        };

        books.push(book);
        stats.imported++;

      } catch (error: unknown) {
        stats.skipped++;
        stats.errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        logger.error(`Error parsing row ${index + 2}:`, error);
      }
    });

    logger.log(`LibraryThing import: ${stats.imported} books parsed, ${stats.skipped} skipped`);

    return { books, stats };
  } catch (error: unknown) {
    logger.error('LibraryThing parsing failed:', error);
    throw new Error(`Failed to parse LibraryThing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate if file is from LibraryThing
 * @param {string} csvText - Raw CSV/TSV text
 * @returns {boolean}
 */
export const isLibraryThingCSV = (csvText: string) => {
  const firstLine = csvText.split('\n')[0].toUpperCase();

  return (
    firstLine.includes('TITLE') &&
    firstLine.includes('AUTHOR') &&
    (firstLine.includes('COLLECTIONS') || firstLine.includes('TAGS'))
  );
};
