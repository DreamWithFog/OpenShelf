import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Theme } from '../../../context/AppContext';
import { Book, Session } from '../../../types';

interface SessionData {
  startDate: Date;
  endDate: Date;
  hours: number;
  minutes: number;
  startPage: string;
  endPage: string;
}

interface SessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;  // FIX: Changed signature
  editingSession: Session | null;
  sessionData: SessionData;
  setSessionData: (data: SessionData) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  book: Book;
  theme: Theme;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  visible,
  onClose,
  onSave,
  editingSession,
  sessionData,
  setSessionData,
  showDatePicker,
  setShowDatePicker,
  book,
  theme
}) => {
  const isChapterTracking = book?.trackingType === 'chapters';
  const unitLabel = isChapterTracking ? 'Chapter' : 'Page';
  const unitLabelPlural = isChapterTracking ? 'Chapters' : 'Pages';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View style={{
          backgroundColor: theme.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          maxHeight: '80%',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>
              {editingSession ? 'Edit Session' : 'Add Session'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          <Text style={{ color: theme.text, marginBottom: 8, fontWeight: '600' }}>Date:</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              backgroundColor: theme.inputBackground,
              padding: 15,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 15,
            }}
          >
            <Text style={{ color: theme.text }}>
              {sessionData.startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={sessionData.startDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setSessionData({ ...sessionData, startDate: selectedDate, endDate: selectedDate });
                }
              }}
            />
          )}

          {/* Duration */}
          <Text style={{ color: theme.text, marginBottom: 8, fontWeight: '600' }}>Duration:</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Hours"
                placeholderTextColor={theme.textSecondary}
                style={{
                  backgroundColor: theme.inputBackground,
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                value={sessionData.hours?.toString()}
                onChangeText={(value) => setSessionData({ ...sessionData, hours: parseInt(value) || 0 })}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Minutes"
                placeholderTextColor={theme.textSecondary}
                style={{
                  backgroundColor: theme.inputBackground,
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                value={sessionData.minutes?.toString()}
                onChangeText={(value) => setSessionData({ ...sessionData, minutes: parseInt(value) || 0 })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Pages or Chapters */}
          <Text style={{ color: theme.text, marginBottom: 8, fontWeight: '600' }}>{unitLabelPlural}:</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder={`Start ${unitLabel}`}
                placeholderTextColor={theme.textSecondary}
                style={{
                  backgroundColor: theme.inputBackground,
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                value={sessionData.startPage}
                onChangeText={(value) => setSessionData({ ...sessionData, startPage: value })}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder={`End ${unitLabel}`}
                placeholderTextColor={theme.textSecondary}
                style={{
                  backgroundColor: theme.inputBackground,
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                value={sessionData.endPage}
                onChangeText={(value) => setSessionData({ ...sessionData, endPage: value })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={onSave}
            style={{
              backgroundColor: theme.primary,
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              {editingSession ? 'Update Session' : 'Add Session'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
