import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../context/AppContext';

interface ReReadModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmReRead: () => void;
  onConfirmCorrection: () => void;
  theme: Theme;
}

const ReReadModal: React.FC<ReReadModalProps> = ({
  visible,
  onClose,
  onConfirmReRead,
  onConfirmCorrection,
  theme
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 300 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={[
                styles.modalView, 
                { 
                  backgroundColor: theme.cardBackground, 
                  borderColor: theme.border,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim
                }
              ]}
            >
              
              {/* Header Icon */}
              <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}15` }]}>
                <MaterialIcons name="repeat" size={32} color={theme.primary} />
              </View>

              {/* Title */}
              <Text style={[styles.title, { color: theme.text }]}>Re-reading this book?</Text>
              
              {/* Description */}
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                You are moving a finished book back to <Text style={{color: theme.text, fontWeight: 'bold'}}>Reading</Text>.
              </Text>
              
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                Do you want to start a fresh read-through (reset progress), or are you just correcting the status?
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                
                {/* Option A: New Read-Through (Primary) */}
                <TouchableOpacity
                  style={[styles.mainButton, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  onPress={onConfirmReRead}
                >
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="auto-stories" size={20} color="#fff" />
                    <View style={styles.textStack}>
                      <Text style={[styles.mainButtonText, { color: '#fff' }]}>Start New Read</Text>
                      <Text style={[styles.subButtonText, { color: 'rgba(255,255,255,0.8)' }]}>Reset progress & bumps count</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Option B: Correction (Secondary) */}
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}
                  onPress={onConfirmCorrection}
                >
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="edit" size={20} color={theme.text} />
                    <View style={styles.textStack}>
                      <Text style={[styles.mainButtonText, { color: theme.text }]}>Just Fixing Status</Text>
                      <Text style={[styles.subButtonText, { color: theme.textSecondary }]}>Keep progress & history</Text>
                    </View>
                  </View>
                </TouchableOpacity>

              </View>

              {/* Cancel Text */}
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  mainButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textStack: {
    marginLeft: 12,
    flex: 1,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subButtonText: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 16,
    padding: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReReadModal;
