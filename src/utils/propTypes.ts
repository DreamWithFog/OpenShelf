import { Book } from '../types';
import { Session } from '@/types';
import { Theme } from '../context/AppContext';

// Note: The original PropType objects are removed as TypeScript interfaces serve this purpose.

/**
 * Validation functions for runtime type checking
 */
export const validateBook = (book: Book): boolean => {
  if (!book) throw new Error('Book is required');
  if (typeof book.id !== 'number') throw new Error('Book.id must be a number');
  if (typeof book.title !== 'string') throw new Error('Book.title must be a string');
  return true;
};

export const validateSession = (session: Session): boolean => {
  if (!session) throw new Error('Session is required');
  if (typeof session.id !== 'number') throw new Error('Session.id must be a number');
  if (typeof session.bookId !== 'number') throw new Error('Session.bookId must be a number');
  return true;
};

export const validateTheme = (theme: Theme): boolean => {
  if (!theme) throw new Error('Theme is required');
  const requiredKeys: (keyof Theme)[] = ['primary', 'background', 'cardBackground', 'text']; // Removed 'name' as it's not in the Theme interface
  for (const key of requiredKeys) {
    if (!(key in theme)) throw new Error(`Theme.${key} is required`);
  }
  return true;
};

/**
 * Safe prop access with default values
 */
export const safeGet = <T>(obj: Record<string, unknown>, path: string, defaultValue: T | null = null): T | null => {
  try {
    const keys = path.split('.');
    let result: unknown = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = (result as Record<string, unknown>)[key];
    }

    return result !== undefined ? result as T : defaultValue;
  } catch {
    return defaultValue;
  }
};

export default {
  validateBook,
  validateSession,
  validateTheme,
  safeGet,
};