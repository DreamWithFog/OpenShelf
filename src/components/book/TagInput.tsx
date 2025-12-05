import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomTag from '../common/CustomTag';

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  theme: {
    inputBackground: string;
    border: string;
    text: string;
    textSecondary: string;
    primary: string;
    cardBackground: string;
    selectedTag: string;
    tagBg: string;
    tagText: string;
  };
  existingTags?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ tags, onAddTag, onRemoveTag, theme, existingTags = [] }) => {
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Filter suggestions based on input
  useEffect(() => {
    if (newTag.trim()) {
      const input = newTag.toLowerCase();
      const filtered = existingTags.filter(tag => 
        tag.toLowerCase().includes(input) && 
        !tags.includes(tag) // Don't show already selected tags
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      // Show all available tags when input is empty
      const available = existingTags.filter(tag => !tags.includes(tag));
      setFilteredSuggestions(available);
      setShowSuggestions(false);
    }
  }, [newTag, existingTags, tags]);

  const handleAddTag = (tag: string | null = null) => {
    const tagToAdd = tag || newTag.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      onAddTag(tagToAdd);
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (tag: string) => {
    // Immediately add the tag
    if (tag && !tags.includes(tag)) {
      onAddTag(tag);
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (existingTags.length > 0) {
      const available = existingTags.filter(tag => !tags.includes(tag));
      setFilteredSuggestions(available);
      if (available.length > 0 && !newTag.trim()) {
        setShowSuggestions(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.inputBackground, 
            borderColor: theme.border, 
            color: theme.text 
          }]}
          value={newTag}
          onChangeText={setNewTag}
          placeholder="Type to search or add new tag..."
          placeholderTextColor={theme.textSecondary}
          onSubmitEditing={() => handleAddTag()}
          onFocus={handleFocus}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => handleAddTag()}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { 
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        }]}>
          <View style={styles.suggestionsHeader}>
            <Text style={[styles.suggestionsTitle, { color: theme.textSecondary }]}>
              {newTag.trim() ? 'Matching tags' : 'Available tags'}
            </Text>
            <TouchableOpacity onPress={() => setShowSuggestions(false)}>
              <MaterialIcons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.suggestionsList}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="always"
          >
            {filteredSuggestions.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionItem, { 
                  borderBottomColor: theme.border,
                  borderBottomWidth: index < filteredSuggestions.length - 1 ? 1 : 0
                }]}
                onPress={() => handleSelectSuggestion(tag)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="local-offer" size={16} color={theme.primary} />
                <Text style={[styles.suggestionText, { color: theme.text }]}>
                  {tag}
                </Text>
                <MaterialIcons name="add-circle-outline" size={18} color={theme.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Selected Tags */}
      {tags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <Text style={[styles.selectedTagsLabel, { color: theme.textSecondary }]}>
            Selected tags:
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {tags.map((tag, index) => (
              <CustomTag
                key={index}
                tag={tag}
                theme={{
                  selectedTag: theme.selectedTag,
                  tagBg: theme.tagBg,
                  border: theme.border,
                  tagText: theme.tagText,
                }}
                removable
                onRemove={onRemoveTag}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Helper Text */}
      {existingTags.length === 0 && (
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
          Add your first tag to start building your collection
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
  },
  selectedTagsContainer: {
    marginTop: 8,
  },
  selectedTagsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  tagsContainer: {
    maxHeight: 100,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default TagInput;