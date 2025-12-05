import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateBackup: () => void;
  onImportData: () => void;
  theme: Theme;
}

const ActionModal: React.FC<ActionModalProps> = ({ visible, onClose, onCreateBackup, onImportData, theme }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 16,
          padding: 24,
          width: '80%',
          maxWidth: 400,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 20,
            textAlign: 'center',
          }}>
            Choose Action
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onCreateBackup}
          >
            <Feather name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Create Backup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: theme.success,
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onImportData}
          >
            <Feather name="upload-cloud" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Import Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: theme.textSecondary,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onClose}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ActionModal;