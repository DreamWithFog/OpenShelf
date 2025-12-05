import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Alert, Appearance, LayoutAnimation, AppState, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { getDatabase } from '../../database';
import { logger } from '../../logger';
import { GRID_VIEWS } from '../constants';
import { performAutoBackup } from '../utils/backupManager';
import { lightThemes, darkThemes } from '../theme'; 
import { SQLiteDatabase } from 'expo-sqlite';
import { ActiveSession, Book } from '../types';

export interface Theme {
  primary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  inputBackground: string;
  placeholderBg: string;
  starColor: string;
  starEmpty: string;
  success: string;
  warning: string;
  danger: string;
  tagBg: string;
  tagText: string;
  secondary: string;
  fabBackground: string;
  fabIcon: string;
  selectedTag: string;
  skeletonBase: string;
  skeletonHighlight: string;
}

interface UndoData<T> {
  type: string;
  data: T;
  message: string;
  onUndo: () => void;
}

export interface BookshelfFilters {
  activeFilter: string;
  searchQuery: string;
  selectedTagFilters: string[];
}

interface AppContextType {
  theme: Theme;
  themeMode: string;
  setThemeMode: (mode: string) => Promise<void>;
  selectedLightTheme: string;
  setSelectedLightTheme: (themeName: string) => Promise<void>;
  selectedDarkTheme: string;
  setSelectedDarkTheme: (themeName: string) => Promise<void>;
  gridView: string;
  setGridView: (view: string) => Promise<void>;
  
  // Session Management
  activeSession: ActiveSession | null;
  startSession: (book: Book) => Promise<boolean>;
  discardSession: () => Promise<void>;
  setActiveSession: React.Dispatch<React.SetStateAction<ActiveSession | null>>;
  
  db: SQLiteDatabase | null;
  dbInitialized: boolean;
  undoData: UndoData<unknown> | null;
  showUndoToast: boolean;
  prepareUndo: <T>(type: string, data: T, message: string, onUndo: () => void) => void;
  dismissUndo: () => void;
  executeUndo: () => void;
  lastBookshelfFilters: BookshelfFilters | null;
  setLastBookshelfFilters: React.Dispatch<React.SetStateAction<BookshelfFilters | null>>;
  yearlyGoal: number;
  setYearlyGoal: (goal: number) => Promise<void>;
}

const defaultAppContext: AppContextType = {
  theme: lightThemes.standard,
  themeMode: 'system',
  setThemeMode: async () => { throw new Error('setThemeMode not implemented'); },
  selectedLightTheme: 'standard',
  setSelectedLightTheme: async () => { throw new Error('setSelectedLightTheme not implemented'); },
  selectedDarkTheme: 'darkStandard',
  setSelectedDarkTheme: async () => { throw new Error('setSelectedDarkTheme not implemented'); },
  gridView: GRID_VIEWS.COMFORTABLE,
  setGridView: async () => { throw new Error('setGridView not implemented'); },
  
  activeSession: null,
  startSession: async () => { throw new Error('startSession not implemented'); },
  discardSession: async () => { throw new Error('discardSession not implemented'); },
  setActiveSession: () => { throw new Error('setActiveSession not implemented'); },
  
  db: null,
  dbInitialized: false,
  undoData: null,
  showUndoToast: false,
  prepareUndo: () => { throw new Error('prepareUndo not implemented'); },
  dismissUndo: () => { throw new Error('dismissUndo not implemented'); },
  executeUndo: () => { throw new Error('executeUndo not implemented'); },
  lastBookshelfFilters: null,
  setLastBookshelfFilters: () => { throw new Error('setLastBookshelfFilters not implemented'); },
  yearlyGoal: 0,
  setYearlyGoal: async () => { throw new Error('setYearlyGoal not implemented'); },
};

const AppContext = createContext<AppContextType>(defaultAppContext);

const THEME_MAP: { [key: string]: Theme } = {
  ...lightThemes,
  ...darkThemes,
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<string>('system');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [selectedLightTheme, setSelectedLightTheme] = useState<string>('standard');
  const [selectedDarkTheme, setSelectedDarkTheme] = useState<string>('darkStandard');
  const [gridView, setGridView] = useState<string>(GRID_VIEWS.COMFORTABLE);
  
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [dbInitialized, setDbInitialized] = useState<boolean>(false);
  const [undoData, setUndoData] = useState<UndoData<unknown> | null>(null);
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);
  const [lastBookshelfFilters, setLastBookshelfFilters] = useState<BookshelfFilters | null>(null);
  const [yearlyGoal, setYearlyGoalState] = useState<number>(0);

  const getThemeByKey = (key: string): Theme => {
    return THEME_MAP[key] || lightThemes.standard;
  };

  const getActiveTheme = (): Theme => {
    switch (themeMode) {
      case 'system':
        if (systemTheme === 'dark') {
          return getThemeByKey(selectedDarkTheme);
        } else {
          return getThemeByKey(selectedLightTheme);
        }
      case 'dark':
        return getThemeByKey(selectedDarkTheme);
      case 'light':
      default:
        return getThemeByKey(selectedLightTheme);
    }
  };

  const theme = useMemo<Theme>(() => getActiveTheme(), [themeMode, systemTheme, selectedLightTheme, selectedDarkTheme]);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const database = await getDatabase();
        setDb(database);
        setDbInitialized(true);
      } catch (error) {
        logger.error('Failed to initialize database:', error);
      }
    };
    initializeDatabase();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        const savedLightTheme = await AsyncStorage.getItem('selectedLightTheme');
        const savedDarkTheme = await AsyncStorage.getItem('selectedDarkTheme');
        const savedGridView = await AsyncStorage.getItem('gridView');
        const savedActiveSession = await AsyncStorage.getItem('activeSession');
        const savedLastBookshelfFilters = await AsyncStorage.getItem('lastBookshelfFilters');
        const savedYearlyGoal = await AsyncStorage.getItem('yearlyGoal');

        if (savedThemeMode) setThemeMode(savedThemeMode);
        if (savedLightTheme) setSelectedLightTheme(savedLightTheme);
        if (savedDarkTheme) setSelectedDarkTheme(savedDarkTheme);
        if (savedGridView) setGridView(savedGridView);
        if (savedActiveSession) setActiveSession(JSON.parse(savedActiveSession));
        if (savedLastBookshelfFilters) setLastBookshelfFilters(JSON.parse(savedLastBookshelfFilters));
        if (savedYearlyGoal) setYearlyGoalState(parseInt(savedYearlyGoal, 10));
      } catch (error) { logger.error('Error loading preferences:', error); }
    };
    loadPreferences();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background') {
        if (db) performAutoBackup(db).catch(e => logger.error('Auto-backup failed:', e));
        if (activeSession) {
          await AsyncStorage.setItem('activeSession', JSON.stringify(activeSession));
        }
      }
    });
    return () => subscription.remove();
  }, [db, activeSession]);

  // --- SESSION MANAGEMENT ---

  const startSession = useCallback(async (book: Book): Promise<boolean> => {
    if (activeSession) {
      Alert.alert("Session Active", "You already have a reading session in progress. Please finish it before starting a new one.");
      return false;
    }

    const isChapterTracking = book.trackingType === 'chapters';
    
    const newSession: ActiveSession = {
      id: Date.now().toString(),
      bookId: book.id,
      bookTitle: book.title,
      startTime: new Date().toISOString(),
      startPage: isChapterTracking ? undefined : book.currentPage,
      startChapter: isChapterTracking ? book.currentChapter : undefined,
      isPaused: false,
      pausedTime: 0,
      lastPauseStart: null
    };

    setActiveSession(newSession);
    await AsyncStorage.setItem('activeSession', JSON.stringify(newSession));
    return true;
  }, [activeSession]);

  const discardSession = useCallback(async () => {
    setActiveSession(null);
    await AsyncStorage.removeItem('activeSession');
  }, []);

  const saveThemeMode = async (mode: string) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setThemeMode(mode);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) { logger.error('Error saving theme mode:', error); }
  };

  const saveSelectedLightTheme = async (themeName: string) => {
    try {
      await AsyncStorage.setItem('selectedLightTheme', themeName);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedLightTheme(themeName);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) { logger.error('Error saving light theme:', error); }
  };

  const saveSelectedDarkTheme = async (themeName: string) => {
    try {
      await AsyncStorage.setItem('selectedDarkTheme', themeName);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedDarkTheme(themeName);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) { logger.error('Error saving dark theme:', error); }
  };

  const saveGridView = async (view: string) => {
    try {
      await AsyncStorage.setItem('gridView', view);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setGridView(view);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) { logger.error('Error saving grid view:', error); }
  };

  const setYearlyGoal = async (goal: number) => {
    try {
      await AsyncStorage.setItem('yearlyGoal', goal.toString());
      setYearlyGoalState(goal);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) { logger.error('Error saving yearly goal:', error); }
  };

  // --- UNDO LOGIC ---

  const prepareUndo = useCallback(<T,>(type: string, data: T, message: string, onUndo: () => void) => {
    setUndoData({ type, data, message, onUndo });
    setShowUndoToast(true);
  }, []);

  const dismissUndo = useCallback(() => {
    setShowUndoToast(false);
    setTimeout(() => setUndoData(null), 300);
  }, []);

  const executeUndo = useCallback(() => {
    if (undoData && undoData.onUndo) {
      undoData.onUndo();
      dismissUndo();
    }
  }, [undoData, dismissUndo]);

  const value = useMemo(() => ({
    theme, themeMode, setThemeMode: saveThemeMode,
    selectedLightTheme, setSelectedLightTheme: saveSelectedLightTheme,
    selectedDarkTheme, setSelectedDarkTheme: saveSelectedDarkTheme,
    gridView, setGridView: saveGridView,
    
    activeSession,
    setActiveSession,
    startSession,
    discardSession,
    
    db, dbInitialized,
    undoData, showUndoToast, prepareUndo, dismissUndo, executeUndo,
    lastBookshelfFilters, setLastBookshelfFilters,
    yearlyGoal, setYearlyGoal,
  }), [
    theme, themeMode, selectedLightTheme, selectedDarkTheme, gridView, 
    activeSession, db, dbInitialized, undoData, showUndoToast, 
    lastBookshelfFilters, yearlyGoal,
    startSession, discardSession, prepareUndo, dismissUndo, executeUndo
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
