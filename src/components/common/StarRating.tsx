import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  size?: number;
}

export const CustomStarRating: React.FC<StarRatingProps> = ({ rating = 0, maxRating = 5, size = 20 }) => (
  <View style={styles.starContainer}>
    {Array.from({ length: maxRating }).map((_, index) => (
      <Ionicons 
        key={index} 
        name={index < rating ? 'star' : 'star-outline'} 
        size={size} 
        color="#FFD700"
        style={{ marginHorizontal: 2 }}
      />
    ))}
  </View>
);

interface ThemedStarRatingProps extends StarRatingProps {
  theme: { starColor: string; starEmpty: string };
}

export const ThemedStarRating: React.FC<ThemedStarRatingProps> = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 24, 
  theme 
}) => (
  <View style={styles.starContainer}>
    {Array.from({ length: maxRating }).map((_, index) => (
      <Ionicons 
        key={index} 
        name={index < rating ? 'star' : 'star-outline'} 
        size={size} 
        color={index < rating ? '#FFD700' : theme.starEmpty}
        style={{ marginHorizontal: 2 }}
      />
    ))}
  </View>
);

interface EditableStarRatingProps extends ThemedStarRatingProps {
  onRatingChange?: (newRating: number) => void;
}

export const EditableStarRating: React.FC<EditableStarRatingProps> = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 32, 
  theme, 
  onRatingChange 
}) => {
  const handleStarPress = (newRating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRatingChange?.(newRating);
  };

  return (
    <View style={styles.editableWrapper}>
      <Text style={[styles.ratingLabel, { color: theme.text }]}>Rating</Text>
      <View style={styles.starContainer}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const starRating = index + 1;
          const isSelected = starRating <= rating;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleStarPress(starRating)}
              style={styles.starButton}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isSelected ? 'star' : 'star-outline'} 
                size={size} 
                color="#FFD700"
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editableWrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  starButton: {
    padding: 4,
  },
});
