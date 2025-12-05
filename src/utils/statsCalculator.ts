import { Book, Session } from '../types';

// CLEANED: Removed levelCalculator import

// --- Native Date Helpers ---
const parseDate = (dateStr: string) => new Date(dateStr);

const getDaysDiff = (date1: Date, date2: Date) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
};

const getDayName = (date: Date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// --- Interfaces ---
export interface ReaderPersona {
  title: string;
  description: string;
  icon: string;
}

export interface DailyActivity {
  date: string;
  minutes: number;
  pages: number;
  sessions: number;
}

export interface LevelData {
  currentLevel: number;
  totalXP: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progressToNextLevel: number;
  title: string;
  tierIcon: string;
  nextMilestone?: {
    level: number;
    title: string;
  };
}

export interface ReadingSpeedStats {
  value: number | string;
  unit: string;
  isMixed: boolean;
  pagesPerHour: number;
  chaptersPerHour: number;
}

export interface StatsResult {
  totalBooks: number;
  booksFinished: number;
  totalPagesRead: number;
  totalChaptersRead: number;
  totalSessions: number;
  totalDurationMinutes: number;
  averageRating: number;
  longestStreak: number;
  currentStreak: number;
  readingSpeed: ReadingSpeedStats;
  levelData: LevelData;
  persona: ReaderPersona;
  dailyActivity: DailyActivity[];
  genreDistribution: Record<string, number>;
  formatDistribution: Record<string, number>;
  todayMinutes: number;
  todayPages: number;
  todayChapters: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  totalReadingTime: number;
  bestReadingDay: string;
  abandonedBooks: number;
  completionRate: number;
  averageSessionTime: number;
  longestSessionDuration: number;
  mostActiveTimeOfDay: string;
  fastestRead?: { title: string; speed: number; unit: string };
  longestBook?: { title: string; value: number };
  topAuthor?: { name: string; count: number };
  topGenre?: { name: string; count: number };
  primaryUnit: string;
  statusCounts: Record<string, number>;
}

export const calculateReadingStats = (
  books: Book[], 
  sessions: Session[], 
  bonusXP: number = 0
): StatsResult => {
  
  // 1. Basic Counts
  const totalBooks = books.length;
  const finishedBooks = books.filter(b => b.status === 'Finished');
  const booksFinished = finishedBooks.length;
  const abandonedBooks = books.filter(b => b.status === 'DNF').length;
  const completionRate = totalBooks > 0 ? Math.round((booksFinished / totalBooks) * 100) : 0;
  const totalSessions = sessions.length;

  const statusCounts: Record<string, number> = {
    Unfinished: 0, Reading: 0, Finished: 0, 'Want to Read': 0, DNF: 0
  };
  books.forEach(b => {
    const s = b.status || 'Unfinished';
    if (typeof statusCounts[s] === 'number') statusCounts[s]++;
  });

  // 2. XP & Content Calculation (Simplified)
  let totalPagesRead = 0;
  let totalChaptersRead = 0;

  books.forEach(book => {
    const isChapters = book.trackingType === 'chapters';
    const progress = isChapters 
      ? (book.currentChapter || 0) 
      : (book.currentPage || 0);
      
    if (isChapters) {
      totalChaptersRead += progress;
    } else {
      totalPagesRead += progress;
    }
  });

  // CLEANED: Hardcoded Level Data
  const levelData: LevelData = {
    currentLevel: 1,
    totalXP: 0,
    currentLevelXP: 0,
    xpForNextLevel: 1000,
    progressToNextLevel: 0,
    title: 'Reader',
    tierIcon: 'trophy'
  };

  // 3. Process Sessions (Daily Activity & Time)
  const dailyMap = new Map<string, DailyActivity>();
  let totalDurationMinutes = 0;
  let maxSession = 0;
  const timeOfDayCounts: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };

  sessions.forEach(session => {
    if (!session.startTime) return;
    
    const duration = session.duration || 0;
    totalDurationMinutes += duration;
    if (duration > maxSession) maxSession = duration;

    const dateKey = session.startTime.split('T')[0];
    const existing = dailyMap.get(dateKey) || { date: dateKey, minutes: 0, pages: 0, sessions: 0 };
    
    existing.minutes += duration;
    existing.sessions += 1;
    
    if (session.endPage && session.startPage) {
      existing.pages += (session.endPage - session.startPage);
    }
    
    dailyMap.set(dateKey, existing);

    const hour = new Date(session.startTime).getHours();
    if (hour >= 5 && hour < 12) timeOfDayCounts.Morning++;
    else if (hour >= 12 && hour < 17) timeOfDayCounts.Afternoon++;
    else if (hour >= 17 && hour < 22) timeOfDayCounts.Evening++;
    else timeOfDayCounts.Night++;
  });

  const dailyActivity = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // 4. Calculate Reading Speed
  const totalHours = totalDurationMinutes / 60;
  const pagesPerHour = totalHours > 0 ? Math.round(totalPagesRead / totalHours) : 0;
  const chaptersPerHour = totalHours > 0 ? Number((totalChaptersRead / totalHours).toFixed(1)) : 0;
  
  const isMixed = totalPagesRead > 0 && totalChaptersRead > 0;
  const primaryUnit = totalChaptersRead > totalPagesRead ? 'chapters' : 'pages';
  
  const readingSpeed: ReadingSpeedStats = {
    isMixed,
    pagesPerHour,
    chaptersPerHour,
    unit: isMixed ? 'mixed' : (primaryUnit === 'chapters' ? 'ch/hr' : 'pg/hr'),
    value: isMixed ? 0 : (primaryUnit === 'chapters' ? chaptersPerHour : pagesPerHour)
  };

  // 5. Calculate Streaks
  let currentStreak = 0;
  let longestStreak = 0;
  
  if (dailyActivity.length > 0) {
    const sortedDays = [...dailyActivity].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date();
    const lastActiveDate = parseDate(sortedDays[0].date);
    const diffFromToday = getDaysDiff(today, lastActiveDate);

    if (diffFromToday <= 1) {
      currentStreak = 1;
      for (let i = 0; i < sortedDays.length - 1; i++) {
        const curr = parseDate(sortedDays[i].date);
        const prev = parseDate(sortedDays[i+1].date);
        if (getDaysDiff(curr, prev) === 1) currentStreak++;
        else break;
      }
    }

    let tempStreak = 1;
    const chronoDays = [...dailyActivity].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < chronoDays.length - 1; i++) {
      const curr = parseDate(chronoDays[i].date);
      const next = parseDate(chronoDays[i+1].date);
      if (getDaysDiff(next, curr) === 1) tempStreak++;
      else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  // 6. Distributions
  const genreDistribution: Record<string, number> = {};
  const formatDistribution: Record<string, number> = {};
  let ratingSum = 0;
  let ratedBooks = 0;

  books.forEach(book => {
    const fmt = book.format || 'Unknown';
    formatDistribution[fmt] = (formatDistribution[fmt] || 0) + 1;

    if (book.rating && book.rating > 0) {
      ratingSum += book.rating;
      ratedBooks++;
    }

    if (book.tags && typeof book.tags === 'string') {
        const tagList = book.tags.split(',').map((t: string) => t.trim());
        tagList.forEach((tag: string) => {
           genreDistribution[tag] = (genreDistribution[tag] || 0) + 1;
        });
    }
  });

  // 7. Time Periods
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = dailyMap.get(todayStr);
  
  const averageRating = ratedBooks > 0 ? Number((ratingSum / ratedBooks).toFixed(1)) : 0;
  const averageSessionTime = sessions.length > 0 ? Math.round(totalDurationMinutes / sessions.length) : 0;
  
  const bestDayEntry = dailyActivity.reduce((prev, current) => (prev.minutes > current.minutes) ? prev : current, { date: 'N/A', minutes: 0 });
  const bestReadingDay = bestDayEntry.minutes > 0 ? `${getDayName(parseDate(bestDayEntry.date))}, ${bestDayEntry.minutes}m` : 'N/A';

  const mostActiveTimeOfDay = Object.entries(timeOfDayCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const topGenreEntry = Object.entries(genreDistribution).sort((a,b) => b[1] - a[1])[0];
  const topGenre = topGenreEntry ? { name: topGenreEntry[0], count: topGenreEntry[1] } : undefined;

  const authorCounts: Record<string, number> = {};
  books.forEach(b => { if(b.author) authorCounts[b.author] = (authorCounts[b.author] || 0) + 1; });
  const topAuthorEntry = Object.entries(authorCounts).sort((a,b) => b[1] - a[1])[0];
  const topAuthor = topAuthorEntry ? { name: topAuthorEntry[0], count: topAuthorEntry[1] } : undefined;

  return {
    totalBooks,
    booksFinished,
    totalPagesRead,
    totalChaptersRead,
    totalSessions,
    totalDurationMinutes,
    averageRating,
    longestStreak,
    currentStreak,
    readingSpeed,
    levelData,
    persona: { title: 'Reader', description: 'Keep reading!', icon: 'book' },
    dailyActivity,
    genreDistribution,
    formatDistribution,
    todayMinutes: todayActivity?.minutes || 0,
    todayPages: todayActivity?.pages || 0,
    todayChapters: 0,
    weeklyMinutes: totalDurationMinutes,
    monthlyMinutes: totalDurationMinutes,
    totalReadingTime: totalDurationMinutes,
    bestReadingDay,
    abandonedBooks,
    completionRate,
    averageSessionTime,
    longestSessionDuration: maxSession,
    mostActiveTimeOfDay,
    fastestRead: undefined, 
    longestBook: undefined,
    topAuthor,
    topGenre,
    primaryUnit,
    statusCounts
  };
};
