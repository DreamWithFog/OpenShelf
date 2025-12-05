import { Book } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Levenshtein distance algorithm for fuzzy string matching
export const levenshteinDistance = (str1: string, str2: string): number => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return track[str2.length][str1.length];
};

interface Suggestion {
  value: string;
  score: number;
  type: 'exact' | 'fuzzy';
}

// Find similar strings based on Levenshtein distance
export const findSimilarStrings = (query: string, strings: string[], threshold: number = 3): Suggestion[] => {
  if (!query || query.length < 2) return [];
  
  const queryLower = query.toLowerCase();
  const suggestions: Suggestion[] = [];
  
  for (const str of strings) {
    if (!str) continue;
    
    const strLower = str.toLowerCase();
    
    // Exact substring match has priority
    if (strLower.includes(queryLower)) {
      suggestions.push({
        value: str,
        score: 0,
        type: 'exact'
      });
      continue;
    }
    
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(queryLower, strLower);
    
    // Only include if within threshold and reasonable relative to string length
    if (distance <= threshold && distance <= strLower.length * 0.4) {
      suggestions.push({
        value: str,
        score: distance,
        type: 'fuzzy'
      });
    }
  }
  
  // Sort by score (lower is better)
  return suggestions.sort((a, b) => a.score - b.score);
};

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'title' | 'title-correction' | 'author' | 'author-correction';
  icon: 'clock' | 'book' | 'user';
  original?: string;
}

// Get search suggestions from books
export const getSearchSuggestions = (query: string, books: Book[], recentSearches: string[] = []): SearchSuggestion[] => {
  if (!query) {
    // Return recent searches if no query
    return recentSearches.map(search => ({
      text: search,
      type: 'recent',
      icon: 'clock'
    }));
  }
  
  const allTitles = [...new Set(books.map(b => b.title).filter(Boolean))];
  const allAuthors = [...new Set(books.map(b => b.author).filter(Boolean))];
  
  const titleSuggestions = findSimilarStrings(query, allTitles as string[], 3);
  const authorSuggestions = findSimilarStrings(query, allAuthors as string[], 3);
  
  const suggestions: SearchSuggestion[] = [];
  
  // Add title suggestions
  titleSuggestions.slice(0, 3).forEach(item => {
    suggestions.push({
      text: item.value,
      type: item.type === 'exact' ? 'title' : 'title-correction',
      icon: 'book',
      original: query
    });
  });
  
  // Add author suggestions
  authorSuggestions.slice(0, 2).forEach(item => {
    suggestions.push({
      text: item.value,
      type: item.type === 'exact' ? 'author' : 'author-correction',
      icon: 'user',
      original: query
    });
  });
  
  // Add recent searches that match
  const matchingRecent = recentSearches.filter(search => 
    search.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);
  
  matchingRecent.forEach(search => {
    if (!suggestions.some(s => s.text === search)) {
      suggestions.push({
        text: search,
        type: 'recent',
        icon: 'clock'
      });
    }
  });
  
  return suggestions;
};

// Save recent search
export const saveRecentSearch = async (search: string): Promise<string[]> => {
  if (!search || search.length < 2) return [];
  
  try {
    const recentSearchesRaw = await AsyncStorage.getItem('recentSearches');
    let recentSearches = recentSearchesRaw ? JSON.parse(recentSearchesRaw) : [];
    
    // Remove if already exists
    recentSearches = recentSearches.filter((s: string) => s !== search);
    
    // Add to beginning
    recentSearches.unshift(search);
    
    // Keep only last 10
    recentSearches = recentSearches.slice(0, 10);
    
    await AsyncStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    
    return recentSearches;
  } catch (error) {
    console.error('Error saving recent search:', error);
    return [];
  }
};

// Get recent searches
export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const recentSearchesRaw = await AsyncStorage.getItem('recentSearches');
    return recentSearchesRaw ? JSON.parse(recentSearchesRaw) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

// Clear recent searches
export const clearRecentSearches = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem('recentSearches');
    return true;
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    return false;
  }
};