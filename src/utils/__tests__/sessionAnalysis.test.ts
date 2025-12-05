import { analyzeSession } from '../sessionAnalysis';
import { Book } from '../../types';

// Mock Book
const mockBook = (type: 'pages' | 'chapters', total: number): Book => ({
  id: 1,
  title: 'Test Book',
  trackingType: type,
  totalPages: type === 'pages' ? total : undefined,
  totalChapters: type === 'chapters' ? total : undefined,
} as Book);

describe('Session Analysis Logic', () => {

  test('Speed: Pages per Minute', () => {
    const book = mockBook('pages', 300);
    // Read 20 pages in 10 minutes (600 seconds)
    // Speed = 2 pg/min
    const result = analyzeSession(book, 0, 20, 600, 1.0);
    
    expect(result.pagesRead).toBe(20);
    expect(result.durationMinutes).toBe(10);
    expect(result.speed).toBe(2.0);
    expect(result.speedLabel).toBe('pg/min');
  });

  test('Speed: Chapters per Minute', () => {
    const book = mockBook('chapters', 50);
    // Read 2 chapters in 20 minutes (1200 seconds)
    // Speed = 0.1 ch/min
    const result = analyzeSession(book, 0, 2, 1200, 0);

    expect(result.pagesRead).toBe(2); // "pagesRead" implies units read
    expect(result.speed).toBe(0.1);
    expect(result.speedLabel).toBe('ch/min');
  });

  test('Tags: Power Read', () => {
    const book = mockBook('pages', 300);
    // Avg speed is 1.0. Current speed is 2.0 (Double!). Duration 20 mins.
    const result = analyzeSession(book, 0, 40, 1200, 1.0);
    
    expect(result.tags).toContain('⚡ Power Read');
  });

  test('Tags: Slow Burn', () => {
    const book = mockBook('pages', 300);
    // Avg speed 2.0. Current speed 0.5. Duration 30 mins.
    const result = analyzeSession(book, 0, 15, 1800, 2.0);
    
    expect(result.tags).toContain('🐢 Slow Burn');
  });

  test('Tags: Deep Focus', () => {
    const book = mockBook('pages', 300);
    // Duration 61 minutes
    const result = analyzeSession(book, 0, 60, 3660, 1.0);
    
    expect(result.tags).toContain('🧠 Deep Focus');
  });

  test('Finish Time Estimation', () => {
    const book = mockBook('pages', 100);
    // Read 10 pages in 10 minutes (1 pg/min).
    // Remaining: 90 pages.
    // Expected time left: 90 minutes.
    const result = analyzeSession(book, 0, 10, 600, 1.0);
    
    expect(result.estimatedFinishTime).not.toBeNull();
    // Logic check: date should be in future
    // Since we can't easily mock Date.now() without setup, we check existence.
  });

});
