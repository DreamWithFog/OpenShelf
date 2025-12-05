import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { CustomTag } from '../common';
import TagInput from './TagInput';
import { Book, BookAction } from '../../types';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface BookDetailTagsProps {
  book?: Book | null;
  bookState?: { tempTags: string[] | null };
  dispatch?: React.Dispatch<BookAction>;
  isEditing?: boolean;
  theme: { text: string; selectedTag: string; tagBg: string; border: string; tagText: string; inputBackground: string; primary: string; textSecondary: string; cardBackground: string };
  existingTags?: string[];
  navigation?: NavigationProp<ParamListBase>;
}

const BookDetailTags: React.FC<BookDetailTagsProps> = ({
  book,
  bookState,
  dispatch,
  isEditing,
  theme,
  existingTags = []
}) => {
  if (isEditing) {
    if (!bookState || !dispatch) {
      return null;
    }
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
          Tags
        </Text>
        <TagInput
          tags={bookState.tempTags || []}
          onAddTag={(tag) => dispatch({ type: 'ADD_TAG', tag })}
          onRemoveTag={(tag) => dispatch({ type: 'REMOVE_TAG', tag })}
          theme={theme}
          existingTags={existingTags}
        />
      </View>
    );
  }

  // Parse tags from string to array
  const tagsArray = book?.tags 
    ? (typeof book.tags === 'string' 
        ? book.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : book.tags)
    : [];

  if (tagsArray.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
        Tags
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tagsArray.map((tag, index) => (
          <CustomTag
            key={index}
            tag={tag}
            theme={{
              selectedTag: theme.selectedTag,
              tagBg: theme.tagBg,
              border: theme.border,
              tagText: theme.tagText,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default BookDetailTags;
