// Global error handler for consistent error handling across the app
import { Alert } from 'react-native';
import { logger } from '../../logger';

/**
 * Error types for categorization
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  DATABASE: 'DATABASE',
  VALIDATION: 'VALIDATION',
  PERMISSION: 'PERMISSION',
  UNKNOWN: 'UNKNOWN',
} as const; // Use as const for literal types

export type ErrorType = keyof typeof ErrorTypes;

/**
 * Centralized error handler
 */
export class AppError extends Error {
  type: ErrorType;
  originalError: Error | null;
  timestamp: string;

  constructor(message: string, type: ErrorType = ErrorTypes.UNKNOWN, originalError: Error | null = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

interface HandleErrorOptions {
  showAlert?: boolean;
  alertTitle?: string;
  alertMessage?: string | null;
  logError?: boolean;
  context?: string;
}

/**
 * Handle errors with user feedback and logging
 */
export const handleError = (error: unknown, options: HandleErrorOptions = {}): unknown => {
  const {
    showAlert = true,
    alertTitle = 'Error',
    alertMessage = null,
    logError = true,
    context = '',
  } = options;

  // Log the error
  if (logError) {
    if (error instanceof AppError) {
      logger.error(`[${error.type}] ${context}:`, error.message);
      if (error.originalError) {
        logger.error('Original error:', error.originalError);
      }
    } else if (error instanceof Error) {
      logger.error(`${context}:`, error.message);
    } else {
      logger.error(`${context}:`, error);
    }
  }

  // Show user-friendly alert
  if (showAlert) {
    const userMessage = alertMessage || getUserFriendlyMessage(error);
    Alert.alert(alertTitle, userMessage);
  }

  // Return error for further handling if needed
  return error;
};

/**
 * Convert technical errors to user-friendly messages
 */
const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    switch (error.type) {
      case ErrorTypes.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorTypes.DATABASE:
        return 'Database error occurred. Your data may not be saved correctly.';
      case ErrorTypes.VALIDATION:
        return error.message; // Validation messages are already user-friendly
      case ErrorTypes.PERMISSION:
        return 'Permission denied. Please check app permissions in settings.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // Handle common error patterns
  if (error instanceof Error) {
    if (error.message?.includes('network')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    
    if (error.message?.includes('permission')) {
      return 'Permission required. Please grant the necessary permissions.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Async error wrapper for consistent error handling
 */
export const asyncErrorHandler = <T extends (...args: unknown[]) => Promise<unknown>>(fn: T, context: string = '') => {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | unknown> => {
    try {
      return await fn(...args);
    } catch (error: unknown) {
      return handleError(error, { context });
    }
  };
};

interface CreateError {
  network: (message: string, originalError?: Error | null) => AppError;
  database: (message: string, originalError?: Error | null) => AppError;
  validation: (message: string) => AppError;
  permission: (message: string, originalError?: Error | null) => AppError;
  unknown: (message: string, originalError?: Error | null) => AppError;
}

/**
 * Create error with specific type
 */
export const createError: CreateError = {
  network: (message, originalError) => 
    new AppError(message, ErrorTypes.NETWORK, originalError),
  
  database: (message, originalError) => 
    new AppError(message, ErrorTypes.DATABASE, originalError),
  
  validation: (message) => 
    new AppError(message, ErrorTypes.VALIDATION),
  
  permission: (message, originalError) => 
    new AppError(message, ErrorTypes.PERMISSION, originalError),
  
  unknown: (message, originalError) => 
    new AppError(message, ErrorTypes.UNKNOWN, originalError),
};

interface WithRetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: ((attempt: number, maxRetries: number, error: unknown) => void) | null;
}

/**
 * Safe async wrapper with retry logic
 */
export const withRetry = async <T>(fn: () => Promise<T>, options: WithRetryOptions = {}): Promise<T> => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    onRetry = null,
  } = options;

  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
        
        if (onRetry) {
          onRetry(attempt + 1, maxRetries, error);
        }
        
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

/**
 * Validate and throw error if validation fails
 */
export const validate = (condition: boolean, message: string): void => {
  if (!condition) {
    throw createError.validation(message);
  }
};

// Default export (if needed, otherwise remove)
// export default {
//   handleError,
//   asyncErrorHandler,
//   createError,
//   withRetry,
//   validate,
//   AppError,
//   ErrorTypes,
// };