import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface ManualSessionData {
  date: Date;
  hours: number;
  minutes: number;
  startPage: string;
  endPage: string;
}

interface AddSessionModalProps {
  visible: boolean;
  manualSession: ManualSessionData;
  setManualSession: React.Dispatch<React.SetStateAction<ManualSessionData>>;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  onAdd: () => void;
  onCancel: () => void;
  theme: { background: string; text: string; inputBackground: string; border: string; textSecondary: string; primary: string };
  lastReadPage: number; // Nueva prop
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({
  visible,
  manualSession,
  setManualSession,
  showDatePicker,
  setShowDatePicker,
  onAdd,
  onCancel,
  theme,
  lastReadPage  // Nueva prop
}) => {
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || manualSession.date;
    setShowDatePicker(Platform.OS === 'ios');
    setManualSession({ ...manualSession, date: currentDate });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: theme.background,
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 20,
            textAlign: 'center',
          }}>
            Add Reading Session
          </Text>

          {/* Date Selection */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>Date</Text>
            <TouchableOpacity
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
              }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: theme.text, fontSize: 16 }}>
                {manualSession.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={manualSession.date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Duration */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>Duration</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>Hours</Text>
                <TextInput
                  style={{
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.text,
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                  value={manualSession.hours?.toString() || '0'}
                  onChangeText={(text) => {
                    let value = parseInt(text) || 0;
                    if (value < 0) value = 0;
                    if (value > 23) value = 23;
                    setManualSession({
                      ...manualSession,
                      hours: value
                    });
                  }}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>Minutes</Text>
                <TextInput
                  style={{
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.text,
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                  value={manualSession.minutes?.toString() || '0'}
                  onChangeText={(text) => {
                    let value = parseInt(text) || 0;
                    if (value < 0) value = 0;
                    if (value > 59) value = 59;
                    setManualSession({
                      ...manualSession,
                      minutes: value
                    });
                  }}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Pages */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>Pages Read</Text>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>From</Text>
                <TextInput
                  style={{
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.text,
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                  value={manualSession.startPage}
                  onChangeText={(text) => setManualSession({ ...manualSession, startPage: text })}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
              <Text style={{ color: theme.textSecondary, fontSize: 18, marginTop: 16 }}>→</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>To</Text>
                <TextInput
                  style={{
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.text,
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                  value={manualSession.endPage}
                  onChangeText={(text) => setManualSession({ ...manualSession, endPage: text })}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.textSecondary,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={onCancel}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.primary,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={onAdd}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface AddNoteModalProps {
  visible: boolean;
  noteText: string;
  setNoteText: (text: string) => void;
  notePage: string;
  setNotePage: (page: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  theme: { background: string; text: string; inputBackground: string; border: string; textSecondary: string; primary: string };
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  visible,
  noteText,
  setNoteText,
  notePage,
  setNotePage,
  onAdd,
  onCancel,
  theme
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: theme.background,
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 20,
            textAlign: 'center',
          }}>
            Add Reading Note
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>Page Number (optional)</Text>
            <TextInput
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                color: theme.text,
                fontSize: 16,
              }}
              value={notePage}
              onChangeText={setNotePage}
              placeholder="Page number"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>Note</Text>
            <TextInput
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                color: theme.text,
                fontSize: 16,
                height: 120,
                textAlignVertical: 'top',
              }}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Write your note here..."
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.textSecondary,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={onCancel}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.primary,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={onAdd}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export { AddSessionModal, AddNoteModal };