// Bulk database operations
import { logger } from '../../../logger';
import { Book } from '../../types';

export const bulkUpdateBooks = async (db: any, bookIds: number[], updates: Partial<Book>): Promise<void> => {
  try {
    await db.execAsync('BEGIN TRANSACTION;');

    const updateFields = Object.keys(updates);
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(updates);

    for (const bookId of bookIds) {
      await db.runAsync(
        `UPDATE books SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, bookId]
      );
    }

    await db.execAsync('COMMIT;');
    logger.log(`Successfully updated ${bookIds.length} books`);
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    logger.error('Bulk update failed:', error);
    throw error;
  }
};

export const bulkDeleteBooks = async (db: any, bookIds: number[]): Promise<void> => {
  try {
    await db.execAsync('BEGIN TRANSACTION;');

    for (const bookId of bookIds) {
      await db.runAsync('DELETE FROM books WHERE id = ?', [bookId]);
    }

    await db.execAsync('COMMIT;');
    logger.log(`Successfully deleted ${bookIds.length} books`);
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    logger.error('Bulk delete failed:', error);
    throw error;
  }
};
