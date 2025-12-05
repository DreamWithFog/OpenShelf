import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, Image, Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../../../context/AppContext';
import { Book, ActiveSession } from '../../../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FocusTimerModeProps {
  visible: boolean;
  book: Book | null;
  seconds: number;
  isPaused: boolean;
  activeSession: ActiveSession;
  onPauseResume: () => void;
  onStop: () => void;
  onClose: () => void;
  theme: Theme;
}

const FocusTimerMode: React.FC<FocusTimerModeProps> = ({
  visible,
  book,
  seconds,
  isPaused,
  activeSession,
  onPauseResume,
  onStop,
  onClose,
  theme
}) => {
  const breathAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Breathing animation
  useEffect(() => {
    if (!isPaused && visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, { toValue: 1.03, duration: 4000, useNativeDriver: true }),
          Animated.timing(breathAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      breathAnim.setValue(1);
    }
  }, [isPaused, visible]);

  // Handle Android back button
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  if (!visible || !book) return null;

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Ambient Background */}
        {book.coverUrl && (
           <Image 
             source={{ uri: book.coverUrl }} 
             style={StyleSheet.absoluteFill} 
             blurRadius={Platform.OS === 'ios' ? 50 : 30} 
           />
        )}
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

        {/* Content */}
        <View style={[styles.content, { 
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20
        }]}>
          
          {/* Header HUD */}
          <View style={styles.hudTop}>
            <TouchableOpacity 
              onPress={handleClose}
              style={styles.backButton}
              accessible={true}
              accessibilityLabel="Exit focus mode"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.backButtonText}>Exit Focus</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <View style={styles.hudItem}>
              <MaterialCommunityIcons name="book-open-page-variant" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.hudText}>
                Start: {book.trackingType === 'chapters' ? activeSession.startChapter : activeSession.startPage}
              </Text>
            </View>
          </View>

          {/* Main Visual: Breathing Cover */}
          <Animated.View style={[styles.coverWrapper, { transform: [{ scale: breathAnim }] }]}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.coverImage} />
            ) : (
              <View style={[styles.placeholderCover, { backgroundColor: theme.primary }]}>
                 <MaterialIcons name="menu-book" size={64} color="#fff" />
              </View>
            )}
          </Animated.View>

          {/* Title & Timer */}
          <View style={styles.infoSection}>
            <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
            <Text style={styles.authorText}>{book.author}</Text>
            
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity 
              onPress={onPauseResume}
              style={[styles.circleButton, { backgroundColor: isPaused ? theme.success : theme.warning }]}
              accessible={true}
              accessibilityLabel={isPaused ? "Resume session" : "Pause session"}
              accessibilityRole="button"
            >
              <MaterialIcons name={isPaused ? "play-arrow" : "pause"} size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onStop}
              style={[styles.circleButton, { backgroundColor: theme.danger || '#FF3B30', transform: [{ scale: 0.8 }] }]}
              accessible={true}
              accessibilityLabel="End session"
              accessibilityRole="button"
            >
              <MaterialIcons name="stop" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>
            {isPaused ? "Session Paused" : "Focus Mode Active"}
          </Text>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  hudTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  hudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hudText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  coverWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 30,
  },
  coverImage: {
    width: SCREEN_WIDTH * 0.55,
    height: (SCREEN_WIDTH * 0.55) * 1.5,
    borderRadius: 16,
  },
  placeholderCover: {
    width: SCREEN_WIDTH * 0.55,
    height: (SCREEN_WIDTH * 0.55) * 1.5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  authorText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200', 
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    marginBottom: 10,
  },
  circleButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});

export default FocusTimerMode;
