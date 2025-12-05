import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { COMMON_LANGUAGES } from '../../../constants';
import { Theme } from '../../../context/AppContext';
import { EdgeInsets } from 'react-native-safe-area-context';

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentLanguage: string;
  onSelect: (language: string) => void;
  onSelectCustom: () => void;
  theme: Theme;
  insets: EdgeInsets;
  title?: string;
  showCustomOption?: boolean;
}

const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  visible,
  onClose,
  currentLanguage,
  onSelect,
  onSelectCustom,
  theme,
  insets,
  title = 'Select Language',
  showCustomOption = true
}) => {
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
          maxHeight: '70%',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {COMMON_LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language}
                style={{
                  padding: 16,
                  backgroundColor: currentLanguage === language ? theme.primary : theme.cardBackground,
                  marginHorizontal: 20,
                  marginVertical: 4,
                  borderRadius: 12,
                }}
                onPress={() => {
                  if (language === 'Other' && showCustomOption) {
                    onClose();
                    setTimeout(() => {
                      onSelectCustom();
                    }, 300);
                  } else {
                    onSelect(language);
                    onClose();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={{
                  color: currentLanguage === language ? '#fff' : theme.text,
                  fontSize: 16,
                  fontWeight: currentLanguage === language ? 'bold' : 'normal',
                }}>
                  {language === 'Other' && showCustomOption ? 'Other (Custom)...': language}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default LanguagePickerModal;