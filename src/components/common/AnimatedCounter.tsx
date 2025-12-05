import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, StyleProp, TextStyle } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
  formatter?: (val: number) => string | number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  style, 
  duration = 1000,
  formatter 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Reset to 0 when value changes (for key-based remounting or updates)
    animatedValue.setValue(0);

    const listener = animatedValue.addListener(({ value: animValue }) => {
      setDisplayValue(Math.round(animValue));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false, // useNativeDriver: false is required for listener updates on non-layout props
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration, animatedValue]);

  return (
    <Text style={style}>
      {formatter ? formatter(displayValue) : displayValue}
    </Text>
  );
};

export default AnimatedCounter;
