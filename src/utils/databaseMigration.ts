import { SQLiteDatabase } from 'expo-sqlite';

// Add this migration to your database.js or run it as a migration
export const addChapterTrackingToSessions = async (db: SQLiteDatabase): Promise<void> => {
  try {
    // Add chapter tracking columns to sessions table
    await db.execAsync(`
      ALTER TABLE sessions ADD COLUMN startChapter INTEGER;
      ALTER TABLE sessions ADD COLUMN endChapter INTEGER;
    `);
    console.log('✅ Added chapter tracking to sessions table');
  } catch (error: unknown) {
    // Columns might already exist
    console.log('Chapter columns may already exist:', error instanceof Error ? error.message : String(error));
  }
};