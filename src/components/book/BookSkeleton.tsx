import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceholder from '../common/ShimmerPlaceholder';
import { GRID_VIEWS } from '../../constants';
import CompactBookSkeleton from './CompactBookSkeleton';

interface BookSkeletonProps {
  theme: { cardBackground: string; skeletonBase: string; skeletonHighlight: string };
  gridView: string;
}

const BookSkeleton: React.FC<BookSkeletonProps> = ({ theme, gridView }) => {
  const isCarousel = gridView === GRID_VIEWS.CAROUSEL;
  const isDetailed = gridView === GRID_VIEWS.DETAILED;
  
  if (isCarousel) {
    return (
      <View style={[styles.carouselSkeleton, { backgroundColor: theme.cardBackground }]}>
        <ShimmerPlaceholder width={120} height={160} theme={theme} />
        <View style={styles.skeletonContent}>
          <ShimmerPlaceholder width={160} height={16} theme={theme} />
          <ShimmerPlaceholder width={120} height={14} theme={theme} />
        </View>
      </View>
    );
  }

  if (isDetailed) {
    return (
      <View style={[styles.detailedSkeleton, { backgroundColor: theme.cardBackground }]}>
        <ShimmerPlaceholder width={60} height={80} theme={theme} />
        <View style={styles.skeletonContent}>
          <ShimmerPlaceholder width={160} height={16} theme={theme} />
          <ShimmerPlaceholder width={120} height={14} theme={theme} />
          <ShimmerPlaceholder width={80} height={12} theme={theme} />
        </View>
      </View>
    );
  }

  if (gridView === GRID_VIEWS.COMPACT) {
    return <CompactBookSkeleton theme={theme} />;
  }

  return (
    <View style={[styles.skeletonContainer, { backgroundColor: theme.cardBackground }]}>
      <ShimmerPlaceholder 
        width={200} 
        height={250} 
        theme={theme} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    margin: 4,
    borderRadius: 12,
    height: 250,
    overflow: 'hidden',
    flex: 1, // Match the book items
  },
  carouselSkeleton: {
    width: 200,
    height: 320,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  detailedSkeleton: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    padding: 12,
    height: 144,
    width: '100%',
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
    justifyContent: 'center',
  },
});

export default BookSkeleton;
