// Main database initialization and exports
import * as SQLite from 'expo-sqlite';
import { logger } from '../../logger';
import { 
  createBooksTable, 
  createSessionsTable, 
  createNotesTable
} from './schema';
import { createIndexes } from './indexes';
import { migrateDatabase } from './migrations';
import { DATABASE_NAME } from './config';

// Extend SQLiteDatabase to include runAsync and getFirstAsync
declare module 'expo-sqlite' {
  interface SQLiteDatabase {
    runAsync(sql: string, args?: unknown[]): Promise<SQLite.SQLiteRunResult>;
    getFirstAsync<T>(sql: string, args?: unknown[]): Promise<T | null>;
  }
}

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    logger.log(`OPEN database: ${DATABASE_NAME}`);
    
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    if (!db) {
      throw new Error('Failed to open database - db is null');
    }

    // Create Core tables
    await db.execAsync(createBooksTable);
    await db.execAsync(createSessionsTable);
    await db.execAsync(createNotesTable);
    
    // CLEANED: Removed Gamification table creation logic
    // They are now handled by migrations (which deletes them)

    // Run migrations AFTER tables exist
    await migrateDatabase(db);

    // Create indexes AFTER migrations
    await createIndexes(db);

    logger.log('Database initialized successfully with core tables');
    return db;
  } catch (error: unknown) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// Re-export all operations
export * from './operations/bookOperations';
export * from './operations/sessionOperations';  
export * from './operations/noteOperations';
export * from './operations/backupOperations';
export * from './operations/bulkOperations';
export { createIndexes } from './indexes';
export { migrateDatabase } from './migrations';
