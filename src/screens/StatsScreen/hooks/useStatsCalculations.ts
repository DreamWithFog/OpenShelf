import { useMemo } from 'react';
import { calculateReadingStats, StatsResult } from '../../../utils/statsCalculator';
import { Book, Session } from '../../../types';

export const useStatsCalculations = (
  books: Book[], 
  sessions: Session[], 
  bonusXP: number
) => {
  return useMemo(() => {
    // Safely call calculator
    const stats: StatsResult = calculateReadingStats(books || [], sessions || [], bonusXP || 0);

    // 1. Transform Format Stats (Object -> Array)
    const formatStats = Object.entries(stats.formatDistribution || {}).map(([label, value]) => ({
      label,
      value
    })).sort((a, b) => b.value - a.value);

    // 2. Transform Status Counts (Object -> Array for Chart)
    // Note: BookStatusChart usually handles the object directly, but we'll prepare it if needed
    const statusCounts = {
      Unfinished: 0,
      Reading: 0,
      Finished: 0,
      'Want to Read': 0,
      DNF: 0,
      ...stats.statusCounts // If statsCalculator returns it, otherwise verify logic
    };
    
    // Manual recount if calculator doesn't return exactly what UI needs
    if (books) {
      books.forEach(b => {
        const s = b.status || 'Unfinished';
        if (typeof statusCounts[s] === 'number') statusCounts[s]++;
      });
    }

    // 3. Last 7 Days (Weekly Rhythm)
    const last7Days = (stats.dailyActivity || []).slice(-7);

    // 4. Rating Distribution
    // Calculator returns { "5": 2, "4": 1 }, UI expects this format.
    const ratingDistribution = stats.dailyActivity ? {} : {}; 
    // Re-verify rating logic from books directly if needed or use stats output
    const ratings: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    books?.forEach(b => {
      if (b.rating && b.rating >= 1 && b.rating <= 5) {
        ratings[b.rating.toString()] = (ratings[b.rating.toString()] || 0) + 1;
      }
    });

    return {
      stats,
      levelData: stats.levelData,
      formatStats,
      statusCounts, // Passing the object for the specific chart
      readingHeatmap: stats.dailyActivity || [], // Heatmap uses daily activity array
      last7Days,
      recentSessions: (sessions || []).slice(0, 5),
      ratingDistribution: ratings,
      dailyPulse: stats.persona?.description || "Keep reading!", // Fallback
    };
  }, [books, sessions, bonusXP]);
};
