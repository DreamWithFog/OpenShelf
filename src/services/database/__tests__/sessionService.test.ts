import { SessionService } from '../sessionService';
import { Book, NewSession } from '../../../types';
import * as SessionOps from '../../../database/operations/sessionOperations';

// --- MOCKS ---

// 1. Mock the Database Operations
jest.mock('../../../database/operations/sessionOperations', () => ({
  insertSession: jest.fn(),
  updateSession: jest.fn(),
  getBookSessions: jest.fn(),
  getBookSessionsPreview: jest.fn(),
  getBookSessionsCount: jest.fn(),
  getBookSessionsPaginated: jest.fn(),
  deleteSession: jest.fn(),
  getAllSessions: jest.fn(),
}));

// 2. Mock Logger
jest.mock('../../../../logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
  }
}));

describe('SessionService', () => {
  let service: SessionService;
  let mockDb: any;

  // Standard Mock Book
  const mockBook: Book = {
    id: 1,
    title: 'The Hobbit',
    author: 'Tolkien',
    totalPages: 300,
    currentPage: 50,
    status: 'Reading',
    trackingType: 'pages',
    readCount: 0,
    createdAt: '',
    updatedAt: '',
    tags: []
  };

  beforeEach(() => {
    // 3. Create a Mock Database Object
    mockDb = {
      // Simulate transaction by just running the callback
      withTransactionAsync: jest.fn(async (callback) => await callback()),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
    };

    service = new SessionService(mockDb);
    jest.clearAllMocks();
  });

  test('completeSession: Should calculate duration and save session', async () => {
    // Setup: User read from page 50 to 60 over 10 minutes (600s)
    const startPage = 50;
    const endPage = 60;
    const seconds = 600; 

    // Mock DB finding the book
    mockDb.getFirstAsync.mockResolvedValue(mockBook);
    
    // Mock Insert returning an ID
    (SessionOps.insertSession as jest.Mock).mockResolvedValue(101);

    const activeSessionMock = {
      startTime: '2024-01-01T10:00:00.000Z',
      startPage: startPage,
      isPaused: false
    };

    await service.completeSession(mockBook, activeSessionMock, endPage, seconds);

    // Expectation 1: Insert was called with correct duration (10 mins)
    expect(SessionOps.insertSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        bookId: 1,
        duration: 10, // 600s / 60
        startPage: 50,
        endPage: 60
      })
    );

    // Expectation 2: Book Progress Updated via SQL
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE books'),
      expect.arrayContaining([60]) // The new page number
    );
  });

  test('saveManualSession: Should Mark Book as Finished if endPage >= totalPages', async () => {
    // Setup: User reads to page 300 (which is totalPages)
    const sessionPayload: NewSession = {
      bookId: 1,
      bookTitle: 'The Hobbit',
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T11:00:00Z',
      startPage: 290,
      endPage: 300, // FINISHED!
      duration: 60
    };

    // Mock DB finding the book
    mockDb.getFirstAsync.mockResolvedValue(mockBook);

    await service.saveManualSession(1, sessionPayload);

    // Expectation: The SQL query should set status = 'Finished'
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("status = 'Finished'"),
      expect.anything()
    );

    // Expectation: readCount should be incremented
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("readCount = readCount + 1"),
      expect.anything()
    );
  });

  test('saveManualSession: Should NOT finish book if pages remain', async () => {
    // Setup: User reads to page 299 (1 page left)
    const sessionPayload: NewSession = {
      bookId: 1,
      bookTitle: 'The Hobbit',
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T11:00:00Z',
      startPage: 290,
      endPage: 299, // ALMOST there
      duration: 60
    };

    mockDb.getFirstAsync.mockResolvedValue(mockBook);

    await service.saveManualSession(1, sessionPayload);

    // Expectation: Status remains 'Reading'
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("status = 'Reading'"),
      expect.anything()
    );
  });

  test('Chapter Tracking: Should handle chapter updates correctly', async () => {
    // Setup: Book tracks Chapters, not pages
    const chapterBook = { ...mockBook, trackingType: 'chapters', totalChapters: 20, currentChapter: 5 };
    
    mockDb.getFirstAsync.mockResolvedValue(chapterBook);

    const sessionPayload: NewSession = {
      bookId: 1,
      bookTitle: 'Manga Vol 1',
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T10:30:00Z',
      startChapter: 5,
      endChapter: 8,
      duration: 30
    };

    await service.saveManualSession(1, sessionPayload);

    // Expectation: Updates currentChapter, not currentPage
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('currentChapter = ?'),
      expect.arrayContaining([8]) // New chapter
    );
  });
});
