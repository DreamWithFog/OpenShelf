import { logger } from '../../logger';
import { Book } from '../types';

interface Session {
  duration?: number;
  startChapter?: number | null;
  endChapter?: number | null;
  startPage?: number | null;
  endPage?: number | null;
  startTime: string | number | Date;
}

interface ReadingSpeedResult {
  unitsPerHour: number;
  unitType: 'pages' | 'chapters';
  estimatedHoursToFinish: number | null;
  estimatedMinutesToFinish: number | null;
  formattedEstimatedTime: string;
  hasData: boolean;
}

/**
 * Calculate reading speed and estimated completion time (supports both pages and chapters)
 */
export const calculateReadingSpeed = (sessions: Session[], book: Book): ReadingSpeedResult => {
  try {
    // Return default if no book or invalid data
    if (!book) {
      return {
        unitsPerHour: 0,
        unitType: 'pages',
        estimatedHoursToFinish: null,
        estimatedMinutesToFinish: null,
        formattedEstimatedTime: '?',
        hasData: false
      };
    }

    // Return default if no sessions
    if (!sessions || sessions.length === 0) {
      return {
        unitsPerHour: 0,
        unitType: (book?.trackingType === 'chapters' ? 'chapters' : 'pages') as 'pages' | 'chapters',
        estimatedHoursToFinish: null,
        estimatedMinutesToFinish: null,
        formattedEstimatedTime: '?',
        hasData: false
      };
    }

    // Determine if we're tracking pages or chapters
    const isChapterTracking = book.trackingType === 'chapters';
    const unitType = isChapterTracking ? 'chapters' : 'pages';
    
    // Calculate total units read and total time spent
    let totalUnitsRead = 0;
    let totalMinutesSpent = 0;

    sessions.forEach(session => {
      if (session.duration) {
        let unitsInSession = 0;
        
        if (isChapterTracking) {
          // Use chapter data if available
          unitsInSession = (session.endChapter ?? 0) - (session.startChapter ?? 0);
        } else {
          // Use page data
          unitsInSession = (session.endPage ?? 0) - (session.startPage ?? 0);
        }
        
        if (unitsInSession > 0) {
          totalUnitsRead += unitsInSession;
          totalMinutesSpent += session.duration;
        }
      }
    });

    // If no valid reading data, return default
    if (totalUnitsRead === 0 || totalMinutesSpent === 0) {
      return {
        unitsPerHour: 0,
        unitType,
        estimatedHoursToFinish: null,
        estimatedMinutesToFinish: null,
        formattedEstimatedTime: '?',
        hasData: false
      };
    }

    // Calculate units per hour
    const unitsPerHour = (totalUnitsRead / totalMinutesSpent) * 60;

    // Calculate remaining units
    const currentUnit = isChapterTracking ? (book.currentChapter || 0) : (book.currentPage || 0);
    const totalUnits = isChapterTracking ? (book.totalChapters || 0) : (book.totalPages || 0);
    
    // If book is finished or no total units, can't estimate
    if (currentUnit >= totalUnits || totalUnits === 0) {
      return {
        unitsPerHour: isChapterTracking ? Math.round(unitsPerHour * 10) / 10 : Math.round(unitsPerHour),
        unitType,
        estimatedHoursToFinish: 0,
        estimatedMinutesToFinish: 0,
        formattedEstimatedTime: 'Complete',
        hasData: true
      };
    }

    const remainingUnits = totalUnits - currentUnit;

    // Calculate time to finish in minutes
    const minutesToFinish = (remainingUnits / unitsPerHour) * 60;
    const hoursToFinish = Math.floor(minutesToFinish / 60);
    const remainingMinutes = Math.round(minutesToFinish % 60);

    // Format the estimated time with shortened labels
    let formattedEstimatedTime;
    if (hoursToFinish === 0) {
      formattedEstimatedTime = `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      formattedEstimatedTime = `${hoursToFinish}h`;
    } else {
      formattedEstimatedTime = `${hoursToFinish}h ${remainingMinutes} min`;
    }

    return {
      unitsPerHour: isChapterTracking ? Math.round(unitsPerHour * 10) / 10 : Math.round(unitsPerHour),
      unitType,
      estimatedHoursToFinish: hoursToFinish,
      estimatedMinutesToFinish: remainingMinutes,
      formattedEstimatedTime,
      hasData: true
    };
  } catch (error) {
    logger.error('Error calculating reading speed:', error);
    return {
      unitsPerHour: 0,
      unitType: 'pages',
      estimatedHoursToFinish: null,
      estimatedMinutesToFinish: null,
      formattedEstimatedTime: '?',
      hasData: false
    };
  }
};

/**
 * Calculate average session length
 */
export const calculateAverageSessionLength = (sessions: Session[]): number => {
  if (!sessions || sessions.length === 0) return 0;

  const validSessions = sessions.filter(s => s.duration && s.duration > 0);
  if (validSessions.length === 0) return 0;

  const totalMinutes = validSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  return Math.round(totalMinutes / validSessions.length);
};

/**
 * Calculate reading streak (consecutive days)
 */
export const calculateReadingStreak = (sessions: Session[]): number => {
  if (!sessions || sessions.length === 0) return 0;

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  let streak = 0;
  let lastDate: Date | null = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      // First session - check if it's today or yesterday
      const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak = 1;
        lastDate = sessionDate;
      } else {
        break; // Streak is broken
      }
    } else {
      // Check if this session is consecutive with the last
      const diffDays = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
        lastDate = sessionDate;
      } else if (diffDays > 1) {
        break; // Streak is broken
      }
      // If diffDays === 0, same day, continue without incrementing
    }
  }

  return streak;
};