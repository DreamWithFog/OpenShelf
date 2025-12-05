import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Book } from '../../../../types';
import { Theme } from '../../../../context/AppContext';
import * as Haptics from 'expo-haptics';

interface EndSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (endValue: number) => void;
  startValue: number;
  book: Book | null;
  theme: Theme;
}

const EndSessionModal: React.FC<EndSessionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  startValue,
  book,
  theme
}) => {
  const isChapterTracking = book?.trackingType === 'chapters';
  const unitLabel = isChapterTracking ? 'Chapter' : 'Page';
  const maxValue = isChapterTracking ? book?.totalChapters : book?.totalPages;
  
  const [endValue, setEndValue] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setEndValue('');
      setErrorMsg(null);
    }
  }, [visible]);

  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirm = () => {
    const value = parseInt(endValue);
    
    if (isNaN(value) || value < 0) {
      setErrorMsg(`Please enter a valid ${unitLabel.toLowerCase()} number`);
      triggerShake();
      return;
    }
    
    // FIX: Re-added restriction, but allow EQUAL values (0 progress)
    // This blocks going backward (value < startValue) 
    // but allows staying same (value === startValue) for logging time only.
    if (value < startValue) {
      setErrorMsg(`End ${unitLabel.toLowerCase()} cannot be less than start (${startValue})`);
      triggerShake();
      return;
    }
    
    if (maxValue && value > maxValue) {
      setErrorMsg(`Cannot exceed total ${unitLabel.toLowerCase()}s (${maxValue})`);
      triggerShake();
      return;
    }
    
    setErrorMsg(null);
    onConfirm(value);
  };

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
            <View style={[styles.modalView, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              
              <View style={styles.header}>
                <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}15` }]}>
                  <MaterialIcons name="save" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>End Session</Text>
              </View>

              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                You started at {unitLabel} <Text style={{ color: theme.text, fontWeight: 'bold' }}>{startValue}</Text>
              </Text>

              <Animated.View style={{ transform: [{ translateX: shakeAnim }], width: '100%' }}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Where did you stop?
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: theme.inputBackground, 
                      color: theme.text,
                      borderColor: errorMsg ? (theme.danger || '#ff4444') : theme.border
                    }
                  ]}
                  value={endValue}
                  onChangeText={(text) => {
                    setEndValue(text);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  keyboardType="number-pad"
                  placeholder={startValue.toString()}
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                  selectionColor={theme.primary}
                />
              </Animated.View>

              {errorMsg && (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={14} color={theme.danger || '#ff4444'} />
                  <Text style={[styles.errorText, { color: theme.danger || '#ff4444' }]}>
                    {errorMsg}
                  </Text>
                </View>
              )}

              {!errorMsg && maxValue && (
                <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                  Total: {maxValue} {unitLabel.toLowerCase()}s
                </Text>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  onPress={handleConfirm}
                >
                  <Text style={[styles.buttonText, { color: '#fff' }]}>Save Session</Text>
                </TouchableOpacity>
              </View>

            </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EndSessionModal;
