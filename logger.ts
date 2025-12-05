// logger.ts - Production-ready logging
declare const __DEV__: boolean; // Declare __DEV__ global variable

export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error(...args);
    }
    // In production, you could send to crash reporting service
    // crashlytics().recordError(new Error(args.join(' ')));
  },
  
  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (__DEV__) {
      console.info(...args);
    }
  }
};

export default logger;
