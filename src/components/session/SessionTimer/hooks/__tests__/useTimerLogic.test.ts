import { renderHook, act } from '@testing-library/react-native';
import { useTimerLogic } from '../useTimerLogic';
import { ActiveSession } from '../../../../../types';

// --- MOCKS ---
const mockSetActiveSession = jest.fn();
const mockDiscardSession = jest.fn();
const mockCompleteSession = jest.fn();
const mockImpactAsync = jest.fn();
const mockSetItem = jest.fn();

// 1. Mock Context
jest.mock('../../../../../context/AppContext', () => ({
  useAppContext: () => ({ discardSession: mockDiscardSession })
}));

// 2. Mock Database Service
jest.mock('../../../../../services/database/sessionService', () => ({
  createSessionService: () => ({ completeSession: mockCompleteSession })
}));

// 3. Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: (...args: any[]) => mockSetItem(...args),
  removeItem: jest.fn(),
}));

// 4. Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
  impactAsync: (...args: any[]) => mockImpactAsync(...args),
  notificationAsync: jest.fn(),
}));

// 5. Pure Mock of React Native
jest.mock('react-native', () => {
  return {
    Animated: {
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
    },
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    }
  };
});

// --- SETUP ---
const START_TIME = new Date('2024-01-01T10:00:00.000Z');

const baseSession: ActiveSession = {
  id: 'session-123',
  bookId: 1,
  bookTitle: 'Test Book',
  startTime: START_TIME.toISOString(),
  isPaused: false,
  pausedTime: 0,
  lastPauseStart: null
};

describe('useTimerLogic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(START_TIME);
    
    jest.clearAllMocks();
    mockSetActiveSession.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Timer should tick forward correctly', () => {
    const { result } = renderHook(() => 
      useTimerLogic(baseSession, mockSetActiveSession, {} as any, jest.fn(), {} as any)
    );

    // Initial state
    expect(result.current.seconds).toBe(0);

    // FIX: Just use advanceTimersByTime (it moves system time automatically)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.seconds).toBe(5);
  });

  test('Timer should stop counting when paused', async () => {
    const { result } = renderHook(() => 
      useTimerLogic(baseSession, mockSetActiveSession, {} as any, jest.fn(), {} as any)
    );

    // 1. Advance 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(result.current.seconds).toBe(10);

    // 2. Pause
    await act(async () => {
      await result.current.handlePauseResume();
    });

    expect(result.current.isPaused).toBe(true);

    // 3. Advance System Time by 1 Hour
    act(() => {
      jest.advanceTimersByTime(3600000); // 1 Hour
    });

    // 4. Time should NOT have increased
    expect(result.current.seconds).toBe(10);
  });

  test('Timer should resume correctly after a pause', async () => {
    // 1. Start Paused at 10s
    // To match the internal logic, we start the clock at 10s past start
    const PAUSE_START_MS = START_TIME.getTime() + 10000;
    
    const pausedSession: ActiveSession = {
      ...baseSession,
      isPaused: true,
      lastPauseStart: PAUSE_START_MS, 
      pausedTime: 0
    };
    
    // Set system time to 1 minute AFTER the pause started
    // Start: 10:00:00
    // Pause: 10:00:10
    // Now:   10:01:10 (60s elapsed since pause)
    jest.setSystemTime(new Date(PAUSE_START_MS + 60000));

    const { result, rerender } = renderHook(
      ({ session }) => useTimerLogic(session, mockSetActiveSession, {} as any, jest.fn(), {} as any),
      { initialProps: { session: pausedSession } }
    );

    // 2. Resume
    await act(async () => {
      await result.current.handlePauseResume();
    });

    // The hook should calculate that 60s passed and update pausedTime to 60
    expect(mockSetActiveSession).toHaveBeenCalledWith(expect.objectContaining({
      isPaused: false,
      pausedTime: 60,
      lastPauseStart: null
    }));

    // 3. Update the hook props to reflect the state change
    const resumedSession: ActiveSession = {
      ...baseSession,
      isPaused: false,
      pausedTime: 60,
      lastPauseStart: null
    };
    rerender({ session: resumedSession });

    // 4. Tick forward 5 more seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Total Elapsed Time (Real World): 10s (initial) + 60s (pause) + 5s (reading) = 75s
    // Hook Calculation: (75s - StartTime) - 60s Paused = 15s Reading Time
    expect(result.current.seconds).toBe(15);
  });
});
