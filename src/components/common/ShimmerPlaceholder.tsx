import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface ShimmerPlaceholderProps {
  width: number;
  height: number;
  borderRadius?: number;
  theme: { skeletonBase: string; skeletonHighlight: string };
}

const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({ width, height, borderRadius = 8, theme }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
  };

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: theme.skeletonBase,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: theme.skeletonHighlight,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
};

export default ShimmerPlaceholder;
