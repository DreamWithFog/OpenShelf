import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Theme } from '../../context/AppContext';
import * as Haptics from 'expo-haptics';

interface RereadModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  theme: Theme;
  bookTitle: string;
}

const RereadModal: React.FC<RereadModalProps> = ({ visible, onClose, onConfirm, theme, bookTitle }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </View>
        </TouchableWithoutFeedback>

        <View style={[styles.modalView, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
            <MaterialIcons name="autorenew" size={48} color={theme.primary} />
          </View>

          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Read Again?
          </Text>
          
          <Text style={[styles.modalText, { color: theme.textSecondary }]}>
            You have already finished <Text style={{ fontWeight: 'bold', color: theme.text }}>{bookTitle}</Text>.
            {"\n\n"}
            Do you want to start a new journey from the beginning? This will add to your read count.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onConfirm();
              }}
            >
              <Text style={[styles.textStyle, { color: '#fff' }]}>Start Re-read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  textStyle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RereadModal;
