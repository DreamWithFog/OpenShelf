import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';

interface NoteEditorModalProps {
  theme: { cardBackground: string; border: string; text: string; textSecondary: string; inputBackground: string; primary: string };
  visible: boolean;
  onClose: () => void;
  noteText: string;
  setNoteText: (text: string) => void;
  notePage: string;
  setNotePage: (page: string) => void;
  editingNote: boolean;
  onSave: () => void;
  trackingType?: 'pages' | 'chapters' | 'percentage'; // Add tracking type
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ 
  theme, 
  visible, 
  onClose, 
  noteText, 
  setNoteText, 
  notePage, 
  setNotePage, 
  editingNote, 
  onSave,
  trackingType = 'pages' // Default to pages if not provided
}) => {
  // Determine the placeholder text based on tracking type
  const getPlaceholder = () => {
    switch (trackingType) {
      case 'chapters':
        return 'Chapter number (optional)';
      case 'percentage':
        return 'Progress % (optional)';
      case 'pages':
      default:
        return 'Page number (optional)';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.cardBackground,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
              maxHeight: '80%',
            }}
          >
            <View style={{
              width: 40,
              height: 4,
              backgroundColor: theme.border,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }} />

            <TextInput
              placeholder={getPlaceholder()}
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
              value={notePage}
              onChangeText={setNotePage}
              keyboardType="numeric"
              maxLength={6}
            />

            <TextInput
              placeholder="Write your note or quote here..."
              placeholderTextColor={theme.textSecondary}
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: theme.text,
                height: 150,
                textAlignVertical: 'top',
                marginBottom: 20,
              }}
              value={noteText}
              onChangeText={setNoteText}
              multiline={true}
              maxLength={5000}
            />

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
                  {editingNote ? 'Update' : 'Add Note'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default NoteEditorModal;
