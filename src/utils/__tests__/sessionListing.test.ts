import { getTimeIcon, isBookFinished } from '../sessionAnalysis';

describe('Session Listing Logic', () => {
  
  // 1. Visual Icons based on Time of Day
  test('Time Icon: Morning (8 AM)', () => {
    const date = new Date('2024-01-01T08:30:00').toISOString();
    expect(getTimeIcon(date)).toBe('weather-sunset-up');
  });

  test('Time Icon: Lunch (1 PM)', () => {
    const date = new Date('2024-01-01T13:00:00').toISOString();
    expect(getTimeIcon(date)).toBe('weather-sunny');
  });

  test('Time Icon: Evening (7 PM)', () => {
    const date = new Date('2024-01-01T19:00:00').toISOString();
    expect(getTimeIcon(date)).toBe('weather-sunset-down');
  });

  test('Time Icon: Late Night (3 AM)', () => {
    const date = new Date('2024-01-01T03:00:00').toISOString();
    expect(getTimeIcon(date)).toBe('weather-night');
  });

  // 2. "Book Finished" Logic
  test('Completion: Not finished yet', () => {
    // Current: 50, Total: 100
    expect(isBookFinished(50, 100)).toBe(false);
  });

  test('Completion: Exact Finish', () => {
    // Current: 159, Total: 159 (Your specific bug case)
    expect(isBookFinished(159, 159)).toBe(true);
  });

  test('Completion: Over Finish (Correction)', () => {
    // Current: 160, Total: 159
    expect(isBookFinished(160, 159)).toBe(true);
  });

  test('Completion: Invalid Total', () => {
    // Total is 0 (unknown length), shouldn't auto-finish
    expect(isBookFinished(10, 0)).toBe(false);
  });

});
