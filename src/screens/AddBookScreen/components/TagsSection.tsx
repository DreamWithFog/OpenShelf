import React from 'react';
import { View, Text } from 'react-native';
import { TagInput } from '../../../components'; // Assuming TagInput is already typed or will be
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';

interface FormState {
  tempTags: string[];
}

interface TagsSectionProps {
  formState: FormState;
  dispatch: React.Dispatch<any>; // TODO: Refine dispatch type
  existingTags: string[];
  theme: Theme;
}

const TagsSection: React.FC<TagsSectionProps> = ({ formState, dispatch, existingTags, theme }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
        Tags
      </Text>
      <TagInput
        tags={formState.tempTags}
        onAddTag={(tag: string) => dispatch({ type: 'ADD_TAG', tag })}
        onRemoveTag={(tag: string) => dispatch({ type: 'REMOVE_TAG', tag })}
        existingTags={existingTags}
        theme={theme}
      />
    </View>
  );
};

export default TagsSection;