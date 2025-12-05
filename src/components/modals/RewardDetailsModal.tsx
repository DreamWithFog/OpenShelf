import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemeColors } from '../../theme/themeUtils';

interface RewardDetailsModalProps {
  visible: boolean;
  reward: {
    level: number;
    name: string;
    type: 'theme' | 'feature' | 'xp';
    status: 'locked' | 'unlocked' | 'current';
    icon: string;
  } | null;
  theme: ThemeColors;
  onClose: () => void;
}

const RewardDetailsModal: React.FC<RewardDetailsModalProps> = ({
  visible,
  reward,
  theme,
  onClose
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Haptics.selectionAsync();
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!reward) return null;

  const isLocked = reward.status === 'locked';
  const color = isLocked ? theme.textSecondary : theme.primary;
  const bgColor = isLocked ? theme.border : theme.cardBackground;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View 
          style={[
            styles.container, 
            { 
              backgroundColor: theme.cardBackground,
              borderColor: isLocked ? theme.border : theme.primary,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Header Icon */}
          <View style={[styles.iconContainer, { backgroundColor: isLocked ? theme.border : theme.primary + '20' }]}>
            <MaterialCommunityIcons 
              name={reward.icon as any} 
              size={50} 
              color={color} 
            />
          </View>

          {/* Status Label */}
          <Text style={[styles.statusLabel, { color: color }]}>
            {isLocked ? `UNLOCKS AT LEVEL ${reward.level}` : `UNLOCKED AT LEVEL ${reward.level}`}
          </Text>

          {/* Title */}
          <Text style={[styles.name, { color: theme.text }]}>
            {reward.name}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {reward.type === 'theme' 
              ? `Apply this ${isLocked ? 'mystery ' : ''}color theme to customize your app experience.` 
              : 'Keep reading to reach this milestone!'}
          </Text>

          {/* Close / Action Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isLocked ? theme.border : theme.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: isLocked ? theme.textSecondary : '#FFF' }]}>
              {isLocked ? 'Close' : 'Awesome!'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RewardDetailsModal;
