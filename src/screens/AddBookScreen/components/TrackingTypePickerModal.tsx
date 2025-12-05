import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { TRACKING_TYPES } from '../../../constants';
import { Theme } from '../../../context/AppContext';
import { EdgeInsets } from 'react-native-safe-area-context';

interface TrackingTypePickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentType: string;
  onSelect: (type: string) => void;
  theme: Theme;
  insets: EdgeInsets;
}

const TrackingTypePickerModal: React.FC<TrackingTypePickerModalProps> = ({ visible, onClose, currentType, onSelect, theme, insets }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: theme.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>
              Select Tracking Type
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>
          {TRACKING_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={{
                padding: 16,
                backgroundColor: currentType === type.value ? theme.primary : theme.cardBackground,
                marginHorizontal: 20,
                marginVertical: 4,
                borderRadius: 12,
              }}
              onPress={() => {
                onSelect(type.value);
                onClose();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={{
                color: currentType === type.value ? '#fff' : theme.text,
                fontSize: 16,
                fontWeight: currentType === type.value ? 'bold' : 'normal',
              }}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default TrackingTypePickerModal;