// Database indexes - created after migrations to ensure columns exist
import { logger } from '../../logger';
import { SQLiteDatabase } from 'expo-sqlite';

// Helper to safely create an index (won't fail if column doesn't exist)
const safeCreateIndex = async (db: SQLiteDatabase, indexSQL: string, indexName: string): Promise<boolean> => {
  try {
    await db.execAsync(indexSQL);
    return true;
  } catch (error) {
    logger.warn(`Skipping index ${indexName}: column may not exist`);
    return false;
  }
};

export const createIndexes = async (db: SQLiteDatabase) => {
  try {
    // Books table indexes
    await safeCreateIndex(db, 
      `CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);`, 
      'idx_books_status');
    await safeCreateIndex(db, 
      `CREATE INDEX IF NOT EXISTS idx_books_updated ON books(updatedAt);`, 
      'idx_books_updated');
    await safeCreateIndex(db, 
      `CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);`, 
      'idx_books_title');
    
    // Sessions table indexes
    await safeCreateIndex(db, 
      `CREATE INDEX IF NOT EXISTS idx_sessions_book ON sessions(bookId);`, 
      'idx_sessions_book');
    await safeCreateIndex(db, 
      `CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(startTime);`, 
      'idx_sessions_start');
    
    // Notes table indexes
    await safeCreateIndex(db, 
      `CREATE INDEX IF NOT EXISTS idx_notes_book ON reading_notes(bookId);`, 
      'idx_notes_book');
    
    // Column is 'page' in schema, not 'pageNumber' (TypeScript interface differs)
    await safeCreateIndex(db, 
      `CREATE INDEX IF NOT EXISTS idx_notes_page ON reading_notes(page);`, 
      'idx_notes_page');
    
    logger.log('Database indexes created successfully');
  } catch (error) {
    logger.error('Error creating indexes:', error);
  }
};
