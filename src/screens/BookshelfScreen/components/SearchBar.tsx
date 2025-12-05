import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  ScrollView,
  Keyboard,
  Animated
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { 
  getSearchSuggestions, 
  saveRecentSearch, 
  getRecentSearches, 
  clearRecentSearches 
} from '../../../utils/searchHelpers';
import { Book } from '../../../types';

interface Theme {
  primary: string;
  text: string;
  textSecondary: string;
  inputBackground: string;
  border: string;
  cardBackground: string;
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  theme: Theme;
  books?: Book[];
}

interface Suggestion {
  text: string;
  type: string;
  icon: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onClearSearch, 
  theme, 
  books = [] 
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async (): Promise<void> => {
    const searches = await getRecentSearches();
    setRecentSearches(searches);
  };

  // Update suggestions when search query changes
  useEffect(() => {
    if (isFocused) {
      const newSuggestions = getSearchSuggestions(searchQuery, books, recentSearches);
      setSuggestions(newSuggestions);
      
      if (newSuggestions.length > 0 && (searchQuery || recentSearches.length > 0)) {
        setShowSuggestions(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        hideSuggestions();
      }
    }
  }, [searchQuery, books, recentSearches, isFocused]);

  const hideSuggestions = (): void => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSuggestions(false);
    });
  };

  const handleFocus = (): void => {
    setIsFocused(true);
    const newSuggestions = getSearchSuggestions(searchQuery, books, recentSearches);
    if (newSuggestions.length > 0) {
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleBlur = (): void => {
    setTimeout(() => {
      setIsFocused(false);
      hideSuggestions();
    }, 100);
  };

  const handleSelectSuggestion = async (suggestion: Suggestion): Promise<void> => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSearchChange(suggestion.text);
    
    // Save to recent searches
    await saveRecentSearch(suggestion.text);
    await loadRecentSearches();
    
    // Hide suggestions and keyboard
    hideSuggestions();
    Keyboard.dismiss();
  };

  const handleClearRecent = async (): Promise<void> => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearRecentSearches();
    setRecentSearches([]);
    setSuggestions([]);
  };

  const getSuggestionIcon = (icon: string): string => {
    switch(icon) {
      case 'book': return 'book-open';
      case 'user': return 'user';
      case 'clock': return 'clock';
      default: return 'search';
    }
  };

  const getSuggestionColor = (type: string): string => {
    if (type.includes('correction')) return theme.primary;
    if (type === 'recent') return theme.textSecondary;
    return theme.text;
  };

  return (
    <View style={{ position: 'relative' }}>
      {/* Search Input */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.inputBackground,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: showSuggestions ? 0 : 12,
        borderWidth: 1,
        borderColor: isFocused ? theme.primary : theme.border,
      }}>
        <Feather name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          ref={inputRef}
          placeholder="Search books..."
          placeholderTextColor={theme.textSecondary}
          style={{
            flex: 1,
            fontSize: 16,
            color: theme.text,
            padding: 0,
          }}
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          onSubmitEditing={async () => {
            if (searchQuery) {
              await saveRecentSearch(searchQuery);
              await loadRecentSearches();
            }
            Keyboard.dismiss();
            hideSuggestions();
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              onClearSearch();
              inputRef.current?.focus();
            }}
          >
            <Feather name="x" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Animated.View 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            marginTop: 4,
            marginBottom: 12,
            maxHeight: 250,
            opacity: fadeAnim,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
            zIndex: 1000,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* Recent Searches Header */}
            {!searchQuery && recentSearches.length > 0 && (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}>
                <Text style={{ 
                  color: theme.textSecondary, 
                  fontSize: 12, 
                  fontWeight: '600' 
                }}>
                  RECENT SEARCHES
                </Text>
                <TouchableOpacity onPress={handleClearRecent}>
                  <Text style={{ 
                    color: theme.primary, 
                    fontSize: 12, 
                    fontWeight: '600' 
                  }}>
                    CLEAR
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Suggestions List */}
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`${suggestion.text}-${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border,
                }}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: `${getSuggestionColor(suggestion.type)}15`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Feather 
                    name={getSuggestionIcon(suggestion.icon) as any} 
                    size={16} 
                    color={getSuggestionColor(suggestion.type)} 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: theme.text, 
                    fontSize: 14,
                    fontWeight: suggestion.type.includes('correction') ? '600' : '400'
                  }}>
                    {suggestion.text}
                  </Text>
                  
                  {suggestion.type.includes('correction') && (
                    <Text style={{ 
                      color: theme.textSecondary, 
                      fontSize: 11,
                      marginTop: 2,
                      fontStyle: 'italic'
                    }}>
                      Did you mean this?
                    </Text>
                  )}
                  
                  {suggestion.type === 'author' && (
                    <Text style={{ 
                      color: theme.textSecondary, 
                      fontSize: 11,
                      marginTop: 2,
                    }}>
                      Author
                    </Text>
                  )}
                </View>

                {suggestion.type.includes('correction') && (
                  <View style={{
                    backgroundColor: theme.primary,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginLeft: 8,
                  }}>
                    <Text style={{ 
                      color: '#fff', 
                      fontSize: 10, 
                      fontWeight: 'bold' 
                    }}>
                      SUGGESTION
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {suggestions.length === 0 && searchQuery && (
              <View style={{ 
                padding: 20, 
                alignItems: 'center' 
              }}>
                <Text style={{ 
                  color: theme.textSecondary, 
                  fontSize: 14 
                }}>
                  No suggestions found
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};
