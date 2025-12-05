import React from 'react';
import { View } from 'react-native';
import ShimmerPlaceholder from '../common/ShimmerPlaceholder';

interface CompactBookSkeletonProps {
  theme: { cardBackground: string; skeletonBase: string; skeletonHighlight: string };
}

const CompactBookSkeleton: React.FC<CompactBookSkeletonProps> = ({ theme }) => {
  return (
    <View style={{
      margin: 2,
      borderRadius: 8,
      height: 180,
      overflow: 'hidden',
      flex: 1,
      backgroundColor: theme.cardBackground,
    }}>
      <ShimmerPlaceholder 
        width={120} 
        height={180} 
        theme={theme} 
      />
    </View>
  );
};

export default CompactBookSkeleton;
