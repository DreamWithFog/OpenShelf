import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Book } from '../../types';
import { Theme } from '../../context/AppContext';

interface BookItemWrapperProps {
  children: React.ReactNode;
  item: Book;
  onPress?: (item: Book) => void;
  onLongPress?: (item: Book) => void;
  theme: Theme;
  style?: StyleProp<ViewStyle>;
}

const BookItemWrapper: React.FC<BookItemWrapperProps> = ({ children, item, onPress, onLongPress, theme, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(item);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(item);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BookItemWrapper;
