import { useCallback } from 'react';

export const useRetry = (maxRetries: number = 3, baseDelay: number = 1000) => {
  return useCallback(async <T>(operation: () => Promise<T>): Promise<T | undefined> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [maxRetries, baseDelay]);
};
