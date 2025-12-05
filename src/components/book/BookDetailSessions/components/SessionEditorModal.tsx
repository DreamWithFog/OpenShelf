import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { Session } from '../../../../types';  // FIX: Use global Session type

interface SessionData {
  date: Date;
  startValue: string;
  endValue: string;
  hours: string;
  minutes: string;
}

interface SessionEditorModalProps {
  theme: { cardBackground: string; text: string; textSecondary: string; inputBackground: string; border: string; primary: string };
  visible: boolean;
  onClose: () => void;
  sessionData: SessionData;
  setSessionData: React.Dispatch<React.SetStateAction<SessionData>>;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  editingSession: Session | null;  // FIX: Use Session type
  onSave: () => void;
  isChapterTracking: boolean;
}

const SessionEditorModal: React.FC<SessionEditorModalProps> = ({
  theme,
  visible,
  onClose,
  sessionData,
  setSessionData,
  showDatePicker,
  setShowDatePicker,
  editingSession,
  onSave,
  isChapterTracking
}) => {
  const unitLabel = isChapterTracking ? 'Chapter' : 'Page';

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
          backgroundColor: theme.cardBackground,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          maxHeight: '80%',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Text style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: 'bold'
            }}>
              {editingSession ? 'Edit Session' : 'Add Session'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date Picker */}
            <TouchableOpacity
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                marginBottom: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: theme.text }}>
                {sessionData.date.toLocaleDateString()}
              </Text>
              <MaterialIcons name="calendar-today" size={20} color={theme.primary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={sessionData.date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setSessionData({ ...sessionData, date: selectedDate });
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            {/* Start Unit */}
            <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>
              Start {unitLabel}
            </Text>
            <TextInput
              placeholder={`Starting ${unitLabel.toLowerCase()}`}
              placeholderTextColor={theme.textSecondary}
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: theme.text,
                marginBottom: 15,
              }}
              value={sessionData.startValue}
              onChangeText={(text) => setSessionData({ ...sessionData, startValue: text })}
              keyboardType="numeric"
            />

            {/* End Unit */}
            <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>
              End {unitLabel}
            </Text>
            <TextInput
              placeholder={`Ending ${unitLabel.toLowerCase()}`}
              placeholderTextColor={theme.textSecondary}
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: theme.text,
                marginBottom: 15,
              }}
              value={sessionData.endValue}
              onChangeText={(text) => setSessionData({ ...sessionData, endValue: text })}
              keyboardType="numeric"
            />

            {/* Duration */}
            <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>
              Duration
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>
                  Hours
                </Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  style={{
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: theme.text,
                  }}
                  value={sessionData.hours}
                  onChangeText={(text) => setSessionData({ ...sessionData, hours: text })}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>
                  Minutes
                </Text>
                <TextInput
                  placeholder="30"
                  placeholderTextColor={theme.textSecondary}
                  style={{
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: theme.text,
                  }}
                  value={sessionData.minutes}
                  onChangeText={(text) => setSessionData({ ...sessionData, minutes: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.cardBackground,
                  borderWidth: 1,
                  borderColor: theme.border,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
                onPress={onClose}
              >
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
                onPress={onSave}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                  {editingSession ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SessionEditorModal;
