import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SessionConflictModalProps {
  visible: boolean;
  onClose: () => void;
  currentBookTitle: string;
  onViewCurrent: () => void;
  onEndAndStart: () => void;
  theme: any;
}

const SessionConflictModal: React.FC<SessionConflictModalProps> = ({
  visible,
  onClose,
  currentBookTitle,
  onViewCurrent,
  onEndAndStart,
  theme
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="alert-circle-outline" 
              size={60} 
              color={theme.primary || '#FF9500'} 
            />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Active Session Detected
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            You already have an active reading session for:
          </Text>

          <View style={[styles.bookTitleContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.bookTitle, { color: theme.primary || '#FF9500' }]} numberOfLines={2}>
              "{currentBookTitle}"
            </Text>
          </View>

          <Text style={[styles.question, { color: theme.textSecondary }]}>
            What would you like to do?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor: theme.border }]}
              onPress={onViewCurrent}
            >
              <MaterialCommunityIcons 
                name="eye-outline" 
                size={20} 
                color={theme.text} 
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: theme.text }]}>
                View Current Session
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: theme.primary || '#FF9500' }]}
              onPress={onEndAndStart}
            >
              <MaterialCommunityIcons 
                name="swap-horizontal" 
                size={20} 
                color="#FFFFFF" 
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                End & Start New
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  bookTitleContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  question: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 50,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});

export default SessionConflictModal;
