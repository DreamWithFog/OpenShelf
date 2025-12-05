import { SQLiteDatabase } from 'expo-sqlite';
import { insertBook } from '../database/operations/bookOperations';
import { insertSession } from '../database/operations/sessionOperations';
import { insertNote } from '../database/operations/noteOperations';
import { logger } from '../../logger';
import { NewBook, NewSession, NewNote } from '../types';

const bookTitles = [
  'The Shadow of the Wind', 'The Great Gatsby', '1984', 'To Kill a Mockingbird',
  'Pride and Prejudice', 'The Hobbit', 'The Sorcerers Stone',
  'The Catcher in the Rye', 'The Lord of the Rings', 'Jane Eyre',
  'Brave New World', 'The Chronicles of Narnia', 'Animal Farm', 'Fahrenheit 451',
  'The Book Thief', 'The Kite Runner', 'Life of Pi', 'The Alchemist',
  'The Hunger Games', 'The Da Vinci Code'
];

const authors = [
  'Carlos Ruiz Zafon', 'F. Scott Fitzgerald', 'George Orwell', 'Harper Lee',
  'Jane Austen', 'J.R.R. Tolkien', 'J.K. Rowling', 'J.D. Salinger',
  'J.R.R. Tolkien', 'Charlotte Bronte', 'Aldous Huxley', 'C.S. Lewis',
  'George Orwell', 'Ray Bradbury', 'Markus Zusak', 'Khaled Hosseini',
  'Yann Martel', 'Paulo Coelho', 'Suzanne Collins', 'Dan Brown'
];

const seriesNames = [
  'The Dark Tower',
  'Harry Potter',
  'The Wheel of Time',
  'A Song of Ice and Fire',
  'The Stormlight Archive'
];

const genres = ['Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Classic', 'Young Adult'];
const formats = ['Physical', 'Ebook', 'Audiobook'];
const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'];
const statuses = ['Finished', 'Reading', 'Want to Read', 'Unfinished'];

const sampleNotes = [
  'Really enjoyed this chapter!',
  'Important quote to remember.',
  'This part was so emotional.',
  'Great character development here.',
  'Plot twist I did not see coming!',
  'Beautiful prose in this section.',
  'Need to think more about this theme.',
  'Reminds me of another book I read.',
];

export const generateDummyData = async (db: SQLiteDatabase | null, count: number = 20) => {
  if (!db) {
    logger.error('Database is null, cannot generate dummy data');
    throw new Error('Database connection is not available');
  }

  logger.log('Starting Dummy Data Generation for ' + count + ' books...');
  
  try {
    const generatedBooks: number[] = [];
    
    // Track which series we're generating
    const seriesTracker: { [key: string]: number } = {};
    
    for (let i = 0; i < count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const totalPages = Math.floor(Math.random() * 400) + 150;
      const currentPage = status === 'Finished' ? totalPages : 
                          status === 'Reading' ? Math.floor(Math.random() * totalPages) :
                          status === 'Unfinished' ? Math.floor(Math.random() * totalPages * 0.7) : 0;
      
      // Decide if this book is part of a series (30% chance)
      const isPartOfSeries = Math.random() > 0.7;
      let seriesName: string | null = null;
      let seriesOrder: number | null = null;
      let collectionType: string = 'standalone';
      
      if (isPartOfSeries) {
        // Pick a random series
        seriesName = seriesNames[Math.floor(Math.random() * seriesNames.length)];
        
        // Track and increment the order for this series
        if (!seriesTracker[seriesName]) {
          seriesTracker[seriesName] = 0;
        }
        seriesTracker[seriesName]++;
        seriesOrder = seriesTracker[seriesName];
        collectionType = 'series';
      }
      
      const title = isPartOfSeries 
        ? seriesName + ' Book ' + seriesOrder
        : bookTitles[i % bookTitles.length];
      
      const author = isPartOfSeries
        ? authors[seriesNames.indexOf(seriesName!) % authors.length]
        : authors[i % authors.length];
      
      const bookData: NewBook = {
        title: title,
        author: author,
        isbn: Math.random() > 0.5 ? '978' + Math.floor(Math.random() * 1000000000) : null,
        totalPages: totalPages,
        currentPage: currentPage,
        status: status,
        rating: status === 'Finished' ? Math.floor(Math.random() * 5) + 1 : 0,
        format: formats[Math.floor(Math.random() * formats.length)],
        language: languages[Math.floor(Math.random() * languages.length)],
        tags: genres.slice(0, Math.floor(Math.random() * 3) + 1).join(', '),
        coverUrl: null,
        coverPath: null,
        bookUrl: null,
        publisher: null,
        publicationYear: null,
        originalLanguage: null,
        seriesName: seriesName,
        seriesOrder: seriesOrder,
        volumeNumber: null,
        totalVolumes: null,
        totalChapters: null,
        currentChapter: 0,
        collectionType: collectionType,
        trackingType: 'pages',
        seriesCoverUrl: null,
        totalInSeries: null,
        readCount: status === 'Finished' ? 1 : 0
      };
      
      const bookId = await insertBook(db, bookData);
      generatedBooks.push(bookId);
      
      const logMsg = isPartOfSeries 
        ? 'Created book ' + (i + 1) + '/' + count + ': "' + title + '" (Series: ' + seriesName + ' #' + seriesOrder + ')'
        : 'Created book ' + (i + 1) + '/' + count + ': "' + title + '" (Standalone)';
      logger.log(logMsg);
      
      // Add some sessions for books that are being read or finished
      if ((status === 'Reading' || status === 'Finished' || status === 'Unfinished') && Math.random() > 0.3) {
        const sessionCount = Math.floor(Math.random() * 5) + 1;
        
        for (let j = 0; j < sessionCount; j++) {
          const daysAgo = Math.floor(Math.random() * 30);
          const startTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
          const durationMinutes = Math.floor(Math.random() * 120) + 10;
          const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
          
          const pagesRead = Math.floor(Math.random() * 50) + 5;
          const startPage = Math.floor(Math.random() * Math.max(1, totalPages - pagesRead));
          
          const sessionData: NewSession = {
            bookId: bookId,
            bookTitle: title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: durationMinutes,
            startPage: startPage,
            endPage: startPage + pagesRead,
            startChapter: null,
            endChapter: null,
            readingNumber: 1
          };
          
          await insertSession(db, sessionData);
        }
        logger.log('  Added ' + sessionCount + ' reading sessions');
      }
      
      // Add some notes for finished or reading books
      if ((status === 'Finished' || status === 'Reading') && Math.random() > 0.5) {
        const noteCount = Math.floor(Math.random() * 3) + 1;
        
        for (let k = 0; k < noteCount; k++) {
          const noteData: NewNote = {
            bookId: bookId,
            note: sampleNotes[Math.floor(Math.random() * sampleNotes.length)],
            pageNumber: Math.floor(Math.random() * totalPages)
          };
          
          await insertNote(db, noteData);
        }
        logger.log('  Added ' + noteCount + ' notes');
      }
    }
    
    logger.log('Successfully generated ' + count + ' dummy books with sessions and notes');
    return generatedBooks;
    
  } catch (error) {
    logger.error('Dummy Data Failed:', error);
    throw error;
  }
};
