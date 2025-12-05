import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ToastProps {
  visible: boolean;
  message: string;
  onUndo?: () => void;
  onDismiss?: () => void;
  theme: { cardBackground: string; text: string; primary: string; textSecondary: string };
}

const Toast: React.FC<ToastProps> = ({ visible, message, onUndo, onDismiss, theme }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  const handleUndo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleDismiss();
    if (onUndo) {
      setTimeout(() => onUndo(), 300); // Wait for animation
    }
  };

  if (!visible && (slideAnim as any)._value === 100) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: theme.cardBackground,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons name="delete" size={20} color={theme.text} />
        <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      </View>
      
      <TouchableOpacity
        onPress={handleUndo}
        style={[styles.undoButton, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.undoText}>UNDO</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <MaterialIcons name="close" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  undoButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  undoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;