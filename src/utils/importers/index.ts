import { parseGoodreadsCSV, isGoodreadsCSV } from './goodreadsImporter';
import { parseLibraryThingCSV, isLibraryThingCSV } from './librarythingImporter';
import { parseStoryGraphCSV, isStoryGraphCSV } from './storygraphImporter';
import { Book } from '../../types';

interface Stats {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

interface ParseResult {
  books: Partial<Book>[];
  stats: Stats;
  source: string;
}

/**
 * Auto-detect CSV source and parse
 * @param {string} csvText - Raw CSV text
 * @returns {Promise<ParseResult>} - { books: Array, stats: Object, source: string }
 */
export const autoDetectAndParse = async (csvText: string): Promise<ParseResult> => {

  if (isGoodreadsCSV(csvText)) {
    const result = parseGoodreadsCSV(csvText);
    return { ...result, source: 'Goodreads' };
  }

  if (isStoryGraphCSV(csvText)) {
    const result = parseStoryGraphCSV(csvText);
    return { ...result, source: 'StoryGraph' };
  }

  if (isLibraryThingCSV(csvText)) {
    const result = parseLibraryThingCSV(csvText);
    return { ...result, source: 'LibraryThing' };
  }

  throw new Error('Could not detect CSV format. Please ensure the file is from Goodreads, LibraryThing, or StoryGraph.');
};
