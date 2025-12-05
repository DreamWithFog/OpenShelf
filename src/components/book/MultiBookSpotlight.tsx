import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Book } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MultiBookSpotlightProps {
  visible: boolean;
  books: Book[];
  onComplete?: () => void;
  theme: { placeholderBg: string };
}

const MultiBookSpotlight: React.FC<MultiBookSpotlightProps> = ({ visible, books, onComplete, theme }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate scroll width
  const CARD_WIDTH = 144; // 120px + 24px margin
  const displayBooks = Math.min(books.length, 10);
  const totalScrollWidth = displayBooks * CARD_WIDTH;

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  };

  const startAutoScroll = () => {
    // Scroll through all books at 800ms per book
    const scrollDuration = displayBooks * 800;
    
    Animated.timing(scrollX, {
      toValue: totalScrollWidth,
      duration: scrollDuration,
      useNativeDriver: true,
    }).start(() => {
      // Animation completed - wait 2 seconds at the end, then dismiss
      dismissTimeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, 500);
    });
  };

  useEffect(() => {
    if (visible && books && books.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Start auto-scroll after entrance
      setTimeout(() => {
        startAutoScroll();
      }, 500);

      // Sync ScrollView with animation
      const listenerId = scrollX.addListener(({ value }) => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: value, animated: false });
        }
      });

      return () => {
        if (dismissTimeoutRef.current) {
          clearTimeout(dismissTimeoutRef.current);
        }
        scrollX.removeListener(listenerId);
      };
    }
  }, [visible, books, fadeAnim, scaleAnim, scrollX, onComplete]);

  if (!visible || !books || books.length === 0) return null;

  // Determine if all books are volumes in same series
  const isVolumeSeries = books.length > 1 && 
    books.every(book => book.collectionType === 'volume') &&
    books.every(book => book.seriesName === books[0].seriesName);

  // Limit display to first 10 books if more
  const displayBooksArray = books.slice(0, 10);
  const hasMore = books.length > 10;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    
    handleDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <BlurView intensity={80} tint="dark" style={styles.blurOverlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Title - NO STAR EMOJIS */}
          <Text style={styles.label}>
            {books.length} {isVolumeSeries ? 'VOLUMES' : 'BOOKS'} ADDED!
          </Text>

          {/* Book Covers Carousel - FULL WIDTH EDGE-TO-EDGE */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            style={styles.carousel}
            scrollEnabled={false}
            pointerEvents="none"
          >
            {displayBooksArray.map((book, index) => (
              <View key={book.id} style={styles.bookCard}>
                {book.coverUrl ? (
                  <Image
                    source={{ uri: book.coverUrl }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.coverImage, styles.placeholderCover, { backgroundColor: theme.placeholderBg }]}>
                    <Text style={styles.placeholderTitle} numberOfLines={4}>
                      {book.title}
                    </Text>
                  </View>
                )}
                {book.volumeNumber && (
                  <View style={styles.volumeBadge}>
                    <Text style={styles.volumeText}>Vol {book.volumeNumber}</Text>
                  </View>
                )}
              </View>
            ))}
            {hasMore && (
              <View style={styles.bookCard}>
                <View style={[styles.coverImage, styles.moreCard]}>
                  <Text style={styles.moreNumber}>+{books.length - 10}</Text>
                  <Text style={styles.moreText}>more</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Series/Collection Info */}
          {isVolumeSeries && (
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {books[0].seriesName}
              </Text>
              {books[0].author && (
                <Text style={styles.author} numberOfLines={1}>
                  by {books[0].author}
                </Text>
              )}
            </View>
          )}
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    width: SCREEN_WIDTH,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
    marginTop: 20,
    color: '#FFD700',
    paddingHorizontal: 20,
  },
  carousel: {
    marginBottom: 24,
    maxHeight: 200,
    width: SCREEN_WIDTH,
  },
  carouselContainer: {
    paddingHorizontal: 10,
    gap: 16,
  },
  bookCard: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.8)',
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  moreCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  moreNumber: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  moreText: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 8,
  },
  volumeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  volumeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#fff',
  },
  author: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
  },
});

export default MultiBookSpotlight;
