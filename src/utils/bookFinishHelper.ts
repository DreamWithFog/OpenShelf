import { updateBookWithXP } from '../database/operations/bookOperationsWithXP';
import { logger } from '../../logger';

export const finishBookWithXP = async (
  db: any,
  bookId: number,
  totalPages?: number,
  totalChapters?: number
) => {
  try {
    // Get the book first
    const book = await db.getFirstAsync(
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );
    
    if (!book) {
      logger.error('Book not found for finishing:', bookId);
      return false;
    }
    
    // Only finish if not already finished
    if (book.status !== 'Finished') {
      await updateBookWithXP(db, bookId, {
        status: 'Finished',
        currentPage: totalPages || book.totalPages,
        currentChapter: totalChapters || book.totalChapters,
        endDate: new Date().toISOString(),
      });
      
      logger.log(`Book "${book.title}" marked as finished with XP!`);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error finishing book with XP:', error);
    return false;
  }
};
