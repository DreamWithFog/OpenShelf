import { Book } from '../types';

export interface SessionAnalysis {
  pagesRead: number;
  durationMinutes: number;
  speed: number;
  speedLabel: string;
  estimatedFinishTime: string | null;
  tags: string[];
  comparison: string;
  quote: string;
  isBookFinished: boolean; 
}

export const getTimeIcon = (dateString: string): string => {
  const date = new Date(dateString);
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 12) return 'weather-sunset-up';
  if (hour >= 12 && hour < 17) return 'weather-sunny';
  if (hour >= 17 && hour < 22) return 'weather-sunset-down';
  return 'weather-night';
};

export const isBookFinished = (current: number, total: number): boolean => {
  if (total <= 0) return false;
  return current >= total;
};

export const analyzeSession = (
  book: Book,
  startVal: number,
  endVal: number,
  durationSeconds: number,
  historicalSpeed: number
): SessionAnalysis => {
  const isChapters = book.trackingType === 'chapters';
  
  const amountRead = Math.max(0, endVal - startVal);
  const durationMinutes = Math.max(1, Math.floor(durationSeconds / 60));
  
  const rawSpeed = amountRead / durationMinutes;
  const speed = parseFloat(rawSpeed.toFixed(1));
  const speedLabel = isChapters ? 'ch/min' : 'pg/min';

  // FIX: Explicitly parse to int to ensure number comparison
  const totalChapters = typeof book.totalChapters === 'string' ? parseInt(book.totalChapters, 10) : book.totalChapters;
  const totalPages = typeof book.totalPages === 'string' ? parseInt(book.totalPages, 10) : book.totalPages;

  const totalUnits = isChapters ? (totalChapters || 0) : (totalPages || 0);
  
  // Determine completion status
  const bookFinished = isBookFinished(endVal, totalUnits);

  let estimatedFinishTime = null;
  const remaining = totalUnits - endVal;
  
  if (remaining > 0 && speed > 0) {
    const minutesLeft = remaining / speed;
    const finishDate = new Date(Date.now() + minutesLeft * 60000);
    
    if (minutesLeft < 24 * 60) {
      estimatedFinishTime = finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      estimatedFinishTime = finishDate.toLocaleDateString();
    }
  }

  const tags: string[] = [];
  if (speed > (historicalSpeed * 1.2) && durationMinutes > 15) tags.push('⚡ Power Read');
  if (durationMinutes > 60) tags.push('🧠 Deep Focus');
  const hour = new Date().getHours();
  if (hour > 22 || hour < 5) tags.push('🌙 Night Owl');
  if (speed < (historicalSpeed * 0.7) && durationMinutes > 20) tags.push('🐢 Slow Burn');

  let comparison = "Consistent pace";
  if (historicalSpeed > 0) {
    const diff = ((speed - historicalSpeed) / historicalSpeed) * 100;
    if (diff > 10) comparison = `+${Math.round(diff)}% vs avg speed`;
    else if (diff < -10) comparison = `${Math.round(diff)}% vs avg speed`;
  }

  const quotes = [
    "A reader lives a thousand lives.",
    "Just one more chapter...",
    "Knowledge is power.",
    "Great progress today!",
    "Building the habit, page by page."
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    pagesRead: amountRead,
    durationMinutes,
    speed,
    speedLabel,
    estimatedFinishTime,
    tags,
    comparison,
    quote,
    isBookFinished: bookFinished
  };
};
