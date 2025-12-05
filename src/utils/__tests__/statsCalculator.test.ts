import { calculateReadingStats } from '../statsCalculator';
import { Book, Session } from '../../types';

describe('Stats Calculator - Adaptive Speed', () => {
  const mockBook: Book = {
    id: 1,
    title: 'Test',
    author: 'Test',
    status: 'Reading',
    currentPage: 0,
    currentChapter: 0,
    totalPages: 100,
    totalChapters: 10,
    trackingType: 'pages',
    createdAt: '',
    updatedAt: '',
    tags: []
  };

  it('Scenario 0: No reading data yet', () => {
    const stats = calculateReadingStats([mockBook], []);

    // Should return 0 numbers, not strings
    expect(stats.readingSpeed.value).toBe(0);
    expect(stats.primaryUnit).toBe('pages'); 
  });

  it('Scenario 1: User reads ONLY pages', () => {
    const books = [{ ...mockBook, currentPage: 50 }];
    const sessions: Session[] = [{
      id: 1, bookId: 1, 
      startTime: '2023-01-01T10:00:00', duration: 60, 
      startPage: 0, endPage: 50
    }];

    const stats = calculateReadingStats(books, sessions);

    // 50 pages / 1 hour = 50
    expect(stats.readingSpeed.value).toBe(50);
    expect(stats.readingSpeed.unit).toBe('pg/hr');
    expect(stats.primaryUnit).toBe('pages');
  });

  it('Scenario 2: User reads ONLY chapters', () => {
    const books = [{ ...mockBook, trackingType: 'chapters', currentChapter: 5 }];
    const sessions: Session[] = [{
      id: 1, bookId: 1, 
      startTime: '2023-01-01T10:00:00', duration: 60, 
      startChapter: 0, endChapter: 5
    }];

    const stats = calculateReadingStats(books, sessions);

    // 5 chapters / 1 hour = 5.0
    expect(stats.readingSpeed.value).toBe(5);
    expect(stats.readingSpeed.unit).toBe('ch/hr');
    expect(stats.primaryUnit).toBe('chapters');
  });

  it('Scenario 3: Mixed but Chapter Dominant', () => {
    const books = [
      { ...mockBook, trackingType: 'chapters', currentChapter: 50 }, // 50 chapters read
      { ...mockBook, trackingType: 'pages', currentPage: 10 } // 10 pages read
    ];
    // 50 chapters vs 10 pages -> Chapters win
    const stats = calculateReadingStats(books, []);

    expect(stats.primaryUnit).toBe('chapters');
  });
});
