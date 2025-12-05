import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Book } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BookSpotlightProps {
  visible: boolean;
  book: Book | null;
  onComplete?: () => void;
  theme: { placeholderBg: string };
}

const BookSpotlight: React.FC<BookSpotlightProps> = ({ visible, book, onComplete, theme }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && book) {
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

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 1 }
      ).start();

      // Auto-dismiss after 3 seconds
      const timeout = setTimeout(() => {
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
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible, book, fadeAnim, scaleAnim, glowOpacity, onComplete]);

  if (!visible || !book) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onComplete}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Book Cover with Glow */}
          <View style={styles.bookContainer}>
            <Animated.View
              style={[
                styles.glowBorder,
                {
                  opacity: glowOpacity,
                  shadowOpacity: glowOpacity,
                },
              ]}
            >
              {book.coverUrl ? (
                <Animated.Image
                  source={{ uri: book.coverUrl }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.coverImage, { backgroundColor: theme.placeholderBg, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 48 }}>📚</Text>
                </View>
              )}
            </Animated.View>
          </View>

          {/* Book Info */}
          <View style={styles.infoContainer}>
            <Text style={[styles.label, { color: '#FFD700' }]}>BOOK ADDED</Text>
            <Text style={[styles.title, { color: '#fff' }]} numberOfLines={2}>
              {book.title}
            </Text>
            {book.author && (
              <Text style={[styles.author, { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={1}>
                by {book.author}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  bookContainer: {
    marginBottom: 30,
  },
  glowBorder: {
    borderRadius: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 215, 0, 1)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 20,
    padding: 4,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  infoContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BookSpotlight;