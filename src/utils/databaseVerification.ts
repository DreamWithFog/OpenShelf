// Database verification utility
import { SQLiteDatabase } from 'expo-sqlite';
import { logger } from '../../logger';

export interface TableInfo {
  name: string;
  exists: boolean;
  rowCount: number;
}

export const verifyDatabaseTables = async (db: SQLiteDatabase): Promise<TableInfo[]> => {
  const requiredTables = [
    'books',
    'sessions', 
    'notes',
    'user_gamification',
    'user_milestones'
  ];

  const tableInfo: TableInfo[] = [];

  for (const tableName of requiredTables) {
    try {
      // Check if table exists
      const tableCheck = await db.getFirstAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [tableName]
      );

      if (tableCheck) {
        // Get row count
        const countResult = await db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );

        tableInfo.push({
          name: tableName,
          exists: true,
          rowCount: countResult?.count || 0
        });

        logger.log(`✅ Table ${tableName}: ${countResult?.count || 0} rows`);
      } else {
        tableInfo.push({
          name: tableName,
          exists: false,
          rowCount: 0
        });
        
        logger.warn(`❌ Table ${tableName} does not exist!`);
      }
    } catch (error) {
      logger.error(`Error checking table ${tableName}:`, error);
      tableInfo.push({
        name: tableName,
        exists: false,
        rowCount: 0
      });
    }
  }

  return tableInfo;
};

export const repairMissingTables = async (db: SQLiteDatabase): Promise<void> => {
  logger.log('Checking for missing tables...');
  
  const tables = await verifyDatabaseTables(db);
  const missingTables = tables.filter(t => !t.exists);
  
  if (missingTables.length === 0) {
    logger.log('All required tables exist');
    return;
  }

  logger.warn(`Found ${missingTables.length} missing tables:`, missingTables.map(t => t.name));
  
  // Import schemas dynamically
  const { 
    createBooksTable,
    createSessionsTable, 
    createNotesTable,
    createUserGamificationTable,
    initializeGamificationData,
    createUserMilestonesTable
  } = await import('../database/schema');

  for (const table of missingTables) {
    try {
      switch (table.name) {
        case 'books':
          await db.execAsync(createBooksTable);
          break;
        case 'sessions':
          await db.execAsync(createSessionsTable);
          break;
        case 'notes':
          await db.execAsync(createNotesTable);
          break;
        case 'user_gamification':
          await db.execAsync(createUserGamificationTable);
          await db.execAsync(initializeGamificationData);
          break;
        case 'user_milestones':
          await db.execAsync(createUserMilestonesTable);
          break;
      }
      logger.log(`✅ Created missing table: ${table.name}`);
    } catch (error) {
      logger.error(`Failed to create table ${table.name}:`, error);
    }
  }
};
