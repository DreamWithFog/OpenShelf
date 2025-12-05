import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ListRenderItem,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur'; 
import { CustomStarRating } from '../common/StarRating';
import { OptimizedImage } from '../common';
import { STATUS_COLORS } from '../../constants';
import { DisplayItem } from '../../types/books';
import { RootStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_WIDTH = Math.floor(SCREEN_WIDTH * 0.75); 
const CARD_HEIGHT = Math.floor(SCREEN_HEIGHT * 0.60);
const SPACING = 20;
const ITEM_SIZE = CARD_WIDTH + SPACING;

type CardStackViewNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CardStackViewProps {
  books: DisplayItem[];
  navigation: CardStackViewNavigationProp;
  theme: {
    cardBackground: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    placeholderBg: string;
    background: string;
  };
  onSeriesPress?: (item: DisplayItem) => void;
  onBookLongPress?: (item: DisplayItem) => void;
  onBookPress?: (item: DisplayItem) => void;
  isSelectionMode?: boolean;
}

const CardStackView: React.FC<CardStackViewProps> = ({ books, navigation, theme, onSeriesPress, onBookLongPress, onBookPress, isSelectionMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Dynamic width state to handle parent padding correctly
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<DisplayItem>>(null);

  // Calculate spacer based on ACTUAL container width, not screen width
  const sideSpacer = (containerWidth - ITEM_SIZE) / 2;
  
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Only update if width changed significantly to prevent loops
    if (Math.abs(containerWidth - width) > 1) {
      setContainerWidth(width);
    }
  }, [containerWidth]);

  const handleCardPress = useCallback((item: DisplayItem) => {
    if (onBookPress) {
      onBookPress(item);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (item.isSeries) {
        if (onSeriesPress) {
          onSeriesPress(item);
        }
      } else {
        navigation.navigate('BookDetail', { bookId: item.id as number });
      }
    }
  }, [navigation, onSeriesPress, onBookPress]);

  const handleCardLongPress = useCallback((item: DisplayItem) => {
    if (!item.isSeries && onBookLongPress) {
      onBookLongPress(item);
    }
  }, [onBookLongPress]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_SIZE);
    const safeIndex = Math.max(0, Math.min(index, books.length - 1));
    setCurrentIndex(safeIndex);
    Haptics.selectionAsync();
  }, [books.length]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_SIZE,
    offset: ITEM_SIZE * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: any) => 
    item.id ? item.id.toString() : Math.random().toString(), 
  []);

  const renderCard: ListRenderItem<DisplayItem> = useCallback(({ item, index }) => {
    const inputRange = [
      (index - 1) * ITEM_SIZE,
      index * ITEM_SIZE,
      (index + 1) * ITEM_SIZE,
    ];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [0, -20, 0], 
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1.05, 0.9], 
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6], 
      extrapolate: 'clamp',
    });

    const rotate = scrollX.interpolate({
      inputRange,
      outputRange: ['-5deg', '0deg', '5deg'],
      extrapolate: 'clamp',
    });

    const isSeries = item.isSeries;
    const pagesRead = item.currentPage || 0;
    const totalPages = item.totalPages || 0;
    const progress = totalPages > 0 ? (pagesRead / totalPages) * 100 : 0;

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ scale }, { translateY }, { rotate }],
            opacity,
            zIndex: index === currentIndex ? 10 : 1,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => handleCardPress(item)}
          onLongPress={() => handleCardLongPress(item)}
          delayLongPress={200}
          style={[
            styles.card, 
            { 
              backgroundColor: theme.cardBackground,
              borderColor: isSeries ? theme.primary : 'transparent',
              borderWidth: isSeries ? 2 : 0,
            }
          ]}
        >
          <View style={styles.coverContainer}>
            {item.coverUrl ? (
              <OptimizedImage
                source={{ uri: item.coverUrl }}
                style={styles.coverImage}
                placeholderColor={theme.border}
              />
            ) : (
              <View style={[styles.placeholderCover, { backgroundColor: theme.border }]}>
                <MaterialIcons name={isSeries ? "collections-bookmark" : "menu-book"} size={80} color={theme.textSecondary} />
              </View>
            )}
            
            {isSeries && (
              <View style={styles.seriesBadgeOverlay}>
                <View style={[styles.seriesBadge, { backgroundColor: theme.primary }]}>
                  <MaterialIcons name="layers" size={16} color="#fff" />
                  <Text style={styles.seriesBadgeText}>
                    {item.volumeCount}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2} ellipsizeMode="tail">
                {item.title || item.seriesName}
              </Text>
              <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
                {isSeries ? 'Series Collection' : item.author}
              </Text>
              
              {!isSeries && item.rating > 0 && (
                <View style={{ marginTop: 6 }}>
                    <CustomStarRating rating={item.rating} size={12} />
                </View>
              )}
            </View>
            
            {!isSeries && item.status === 'Reading' && totalPages > 0 && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                  <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
                </View>
                <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
            )}
            
            <View style={styles.bottomRow}>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: isSeries ? theme.primary : STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.None }
              ]}>
                <Text style={styles.statusText}>{isSeries ? 'SERIES' : item.status}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [scrollX, theme, handleCardPress, handleCardLongPress, currentIndex]);

  if (!books || books.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <MaterialIcons name="auto-stories" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.text }]}>
          No books in your library
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
          Add your first book to get started!
        </Text>
      </View>
    );
  }

  return (
    // Added onLayout to measure real width
    <View 
      style={[styles.container, { backgroundColor: theme.background }]}
      onLayout={handleLayout}
    >
      <View style={styles.indicator}>
         <BlurView intensity={50} tint="dark" style={styles.indicatorBlur}>
          <Text style={styles.indicatorText}>
            {currentIndex + 1} / {books.length}
          </Text>
        </BlurView>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={books}
        renderItem={renderCard}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled={false} 
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        
        // Use the dynamic spacer calculated from real layout width
        contentContainerStyle={{ 
          paddingHorizontal: sideSpacer 
        }}
        
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        removeClippedSubviews={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  indicatorBlur: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  indicatorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardWrapper: {
    width: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden', 
  },
  coverContainer: {
    height: '75%',
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 18,
    fontWeight: '800', 
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  seriesBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  seriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  seriesBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default React.memo(CardStackView);
