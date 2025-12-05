import React, { useRef } from 'react';
import { TouchableOpacity, Text, Animated } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { EdgeInsets } from 'react-native-safe-area-context';

interface FloatingActionButtonProps {
  onPress: () => void;
  theme: { fabBackground: string; fabIcon: string };
  insets?: EdgeInsets;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress, theme, insets }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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
  
  return (
    <Animated.View style={[
      globalStyles.fab, 
      { 
        backgroundColor: theme.fabBackground,
        bottom: 10 + (insets?.bottom || 0), // Changed from 80 to 10
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      <TouchableOpacity
        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Add new book"
        accessibilityHint="Double tap to add a new book to your library"
        accessibilityRole="button"
      >
        <Text style={[globalStyles.fabText, { color: theme.fabIcon }]}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingActionButton;