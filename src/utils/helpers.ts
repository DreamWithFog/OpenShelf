// ==================== HELPER FUNCTIONS ====================
import { logger } from '../../logger';
import { Image } from 'react-native'; // Import Image for cacheImages

export const formatDate = (timestamp: string | number | Date): string => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

export const formatDuration = (startTime: string | number | Date, endTime: string | number | Date): string => {
  if (!startTime || !endTime) return 'Unknown';

  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  }
};

export const formatTotalTime = (totalMinutes: number): string => {
  if (!totalMinutes || totalMinutes === 0) return '0 mins';

  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  if (hours === 0) return `${mins} min${mins !== 1 ? 's' : ''}`;
  if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return `${hours}h ${mins}m`;
};

export const formatTimer = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

// ==================== VALIDATION FUNCTIONS ====================

export const isValidUrl = (string: string | null | undefined): boolean => {
  if (!string || typeof string !== 'string') return false;

  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Validate image URLs (stricter than regular URLs)
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!isValidUrl(url)) return false;

  try {
    const parsed = new URL(url as string);

    // Block potentially dangerous protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Optional: Check for image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext =>
      parsed.pathname.toLowerCase().endsWith(ext)
    );

    // Allow URLs without extensions (e.g., CDN URLs, APIs)
    // but block obviously non-image URLs
    const suspiciousExtensions = ['.exe', '.js', '.php', '.html'];
    const hasSuspiciousExtension = suspiciousExtensions.some(ext =>
      parsed.pathname.toLowerCase().endsWith(ext)
    );

    return !hasSuspiciousExtension;
  } catch {
    return false;
  }
};

// Validate local file URIs (for picked images)
export const isValidLocalUri = (uri: string | null | undefined): boolean => {
  if (!uri || typeof uri !== 'string') return false;

  // Allow file://, content://, and asset:// schemes (used by React Native)
  return uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('asset://');
};

// ==================== SANITIZATION FUNCTIONS ====================

// Improved sanitization - removes dangerous characters while keeping normal text safe
export const sanitizeInput = (input: string | null | undefined): string => {
  if (typeof input !== 'string') return '';
  if (input.length === 0) return '';

  let sanitized = input;

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove other potentially dangerous HTML tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove dangerous protocols from any remaining attributes
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove SQL injection attempts (extra safety even though we use prepared statements)
  sanitized = sanitized.replace(/(['";]|--|\*|\/\*|\*\/)/g, '');

  // Remove HTML tags (< and >)
  sanitized = sanitized.replace(/[<>]/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Limit length to prevent DoS
  const MAX_LENGTH = 1000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  return sanitized;
};

// Sanitize URLs specifically (more permissive for valid URLs)
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (typeof url !== 'string') return '';

  // Trim and remove whitespace
  let sanitized = url.trim();

  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (sanitized.toLowerCase().startsWith(protocol)) {
      return '';
    }
  }

  // Only allow http, https, and local file schemes
  if (!sanitized.startsWith('http://') &&
    !sanitized.startsWith('https://') &&
    !sanitized.startsWith('file://') &&
    !sanitized.startsWith('content://')) {
    return '';
  }

  return sanitized;
};

// Sanitize numbers (ensure they're valid integers)
export const sanitizeNumber = (value: string | number | null | undefined, defaultValue: number = 0): number => {
  const num = parseInt(value as string, 10);

  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  // Prevent absurdly large numbers
  const MAX_SAFE_NUMBER = 1000000;
  if (num > MAX_SAFE_NUMBER || num < 0) {
    return defaultValue;
  }

  return num;
};

// Sanitize rating (ensure it's 0-5)
export const sanitizeRating = (rating: string | number | null | undefined): number => {
  const num = parseInt(rating as string, 10);

  if (isNaN(num)) return 0;
  if (num < 0) return 0;
  if (num > 5) return 5;

  return num;
};

// ==================== PERFORMANCE FUNCTIONS ====================

// Image caching for performance
export const cacheImages = async (images: string[]): Promise<void> => {

  // Filter out invalid URLs
  const validImages = images.filter(img =>
    img && (isValidImageUrl(img) || isValidLocalUri(img))
  );

  const promises = validImages.map(image => {
    try {
      return Image.prefetch(image);
    } catch (error) {
      logger.warn('Failed to prefetch image:', image);
      return Promise.resolve();
    }
  });

  await Promise.allSettled(promises); // Use allSettled to handle failures gracefully
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): ((this: ThisParameterType<T>, ...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | undefined;
  let context: ThisParameterType<T>;
  let args: Parameters<T>;

  const later = () => {
    timeout = undefined;
    func.apply(context, args);
  };

  return function (this: ThisParameterType<T>, ...a: Parameters<T>) {
    context = this;
    args = a;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => void>(func: T, limit: number): ((this: ThisParameterType<T>, ...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  let lastContext: ThisParameterType<T> | undefined;
  let lastArgs: Parameters<T> | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    lastContext = this;
    lastArgs = args;
    if (!inThrottle) {
      inThrottle = true;
      func.apply(lastContext, lastArgs);
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) { // If there was a call during the throttle period
          func.apply(lastContext, lastArgs);
          lastArgs = undefined;
          lastContext = undefined;
        }
      }, limit);
    }
  };
};