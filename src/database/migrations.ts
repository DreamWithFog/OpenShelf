import { logger } from '../../logger';
import { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 12;

// Helper to check if a column exists
const columnExists = async (db: SQLiteDatabase, table: string, column: string): Promise<boolean> => {
  try {
    if (!table || !column) return false;
    // Use PRAGMA to get table info. PRAGMA returns an array of rows.
    const result = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${table})`
    );
    if (!result) return false;
    return result.some(row => row.name === column);
  } catch (e) {
    logger.error(`Error checking column ${table}.${column}:`, e);
    return false;
  }
};

// Helper to safely add a column
const safeAddColumn = async (
  db: SQLiteDatabase, 
  table: string, 
  column: string, 
  definition: string
): Promise<boolean> => {
  // Guard clauses to prevent undefined errors
  if (!db || !table || !column || !definition) {
    logger.error('safeAddColumn called with missing parameters', { table, column });
    return false;
  }

  const exists = await columnExists(db, table, column);
  if (exists) {
    return false;
  }
  
  logger.log(`Adding column: ${table}.${column}`);
  // Use execAsync for DDL (Data Definition Language)
  await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  return true;
};

export const migrateDatabase = async (db: SQLiteDatabase) => {
  try {
    logger.log('Starting migration check...');
    
    // Safety check for DB instance
    if (!db) throw new Error('Database instance is undefined');

    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = result?.user_version || 0;

    logger.log(`Current DB Version: ${currentVersion}, Target: ${DATABASE_VERSION}`);

    if (currentVersion < DATABASE_VERSION) {
      // Use execAsync for transaction control
      await db.execAsync('BEGIN TRANSACTION;');
      
      try {
        // v2: ISBN
        if (currentVersion < 2) {
          await safeAddColumn(db, 'books', 'isbn', 'TEXT');
          await db.execAsync('CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);');
        }

        // v3: Metadata
        if (currentVersion < 3) {
          await safeAddColumn(db, 'books', 'format', "TEXT DEFAULT 'Physical'");
          await safeAddColumn(db, 'books', 'publisher', 'TEXT');
          await safeAddColumn(db, 'books', 'publicationYear', 'TEXT');
          await safeAddColumn(db, 'books', 'language', "TEXT DEFAULT 'English'");
          await safeAddColumn(db, 'books', 'seriesName', 'TEXT');
          await safeAddColumn(db, 'books', 'seriesOrder', 'REAL');
          await safeAddColumn(db, 'books', 'volumeNumber', 'INTEGER');
          await safeAddColumn(db, 'books', 'totalVolumes', 'INTEGER');
          await safeAddColumn(db, 'books', 'totalChapters', 'INTEGER');
          await safeAddColumn(db, 'books', 'currentChapter', 'INTEGER DEFAULT 0');
          await safeAddColumn(db, 'books', 'trackingType', "TEXT DEFAULT 'pages'");
        }

        // v4: Original Language
        if (currentVersion < 4) {
          await safeAddColumn(db, 'books', 'originalLanguage', 'TEXT');
        }

        // v5: Collection Type
        if (currentVersion < 5) {
          await safeAddColumn(db, 'books', 'collectionType', 'TEXT');
          await safeAddColumn(db, 'books', 'seriesCoverUrl', 'TEXT');
        }

        // v6: Total In Series
        if (currentVersion < 6) {
          await safeAddColumn(db, 'books', 'totalInSeries', 'INTEGER');
        }

        // v8: Session Chapters
        if (currentVersion < 8) {
          await safeAddColumn(db, 'sessions', 'startChapter', 'INTEGER');
          await safeAddColumn(db, 'sessions', 'endChapter', 'INTEGER');
        }

        // v9: Read Count
        if (currentVersion < 9) {
          await safeAddColumn(db, 'books', 'readCount', 'INTEGER DEFAULT 0');
        }

        // v10: Reading Number
        if (currentVersion < 10) {
          await safeAddColumn(db, 'sessions', 'readingNumber', 'INTEGER DEFAULT 1');
        }

        // --- DESTRUCTIVE UPDATES (Kill Gamification) ---
        
        // v11 & v12: Drop tables
        if (currentVersion < 12) {
           logger.log('Dropping gamification tables...');
           // We use separate try/catch blocks for drops in case tables don't exist
           try { await db.execAsync('DROP TABLE IF EXISTS user_milestones;'); } catch (e) {}
           try { await db.execAsync('DROP TABLE IF EXISTS user_gamification;'); } catch (e) {}
        }

        // Set new version
        await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
        await db.execAsync('COMMIT;');
        
        logger.log('Migration successful.');
      } catch (error) {
        logger.error('Migration failed, rolling back.', error);
        await db.execAsync('ROLLBACK;');
        throw error;
      }
    } else {
      logger.log('Database is up to date.');
    }
  } catch (error) {
    logger.error('Database initialization/migration failed:', error);
    // Don't re-throw, just log, so the app doesn't crash on boot
    console.error(error); 
  }
};
