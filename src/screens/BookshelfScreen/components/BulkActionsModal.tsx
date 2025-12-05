import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { globalStyles } from '../../../styles/globalStyles';
import { STATUS_OPTIONS, BOOK_FORMATS, COMMON_LANGUAGES, TRACKING_TYPES } from '../../../constants';
import { Book } from '../../../types';
import { Theme } from '../../../context/AppContext';

interface BulkActionsModalProps {
  visible: boolean;
  selectedBooks: Book[];
  onClose: () => void;
  onBulkAction: (action: string, value: string | number | null) => void;
  theme: Theme;
  allTags: string[];
}

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  visible,
  selectedBooks,
  onClose,
  onBulkAction,
  theme,
  allTags
}) => {
  const [showSubModal, setShowSubModal] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');

  const handleAction = (action: string, value: string | number | null) => {
    const bookCount = selectedBooks.length;
    const bookText = bookCount === 1 ? '1 book' : `${bookCount} books`;

    let summary = '';
    switch (action) {
      case 'delete':
        summary = `Delete ${bookText}`;
        break;
      case 'status':
        summary = `Change status of ${bookText} to "${value}"`;
        break;
      case 'addTags':
        summary = `Add tag "${value}" to ${bookText}`;
        break;
      case 'removeTags':
        summary = `Remove tag "${value}" from ${bookText}`;
        break;
      case 'series':
        summary = `Add ${bookText} to series "${value}"`;
        break;
      case 'format':
        summary = `Set format of ${bookText} to "${value}"`;
        break;
      case 'language':
        summary = `Set language of ${bookText} to "${value}"`;
        break;
      case 'rating':
        summary = `Rate ${bookText} as ${value} stars`;
        break;
      case 'trackingType':
        summary = `Set tracking type of ${bookText} to "${value}"`;
        break;
    }

    if (action === 'delete') {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete ${bookText}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onBulkAction(action, value);
              onClose();
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Confirm Action',
        summary,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Apply',
            onPress: () => {
              onBulkAction(action, value);
              onClose();
            }
          }
        ]
      );
    }

    setShowSubModal(null);
    setCustomInput('');
  };

  const BulkActionButton: React.FC<{ icon: keyof typeof Feather.glyphMap, label: string, onPress: () => void, color?: string }> = ({ icon, label, onPress, color }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: color ? `${color}15` : `${theme.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        <Feather name={icon} size={20} color={color || theme.primary} />
      </View>
      <Text style={[globalStyles.body, { color: color || theme.text, flex: 1 }]}>
        {label}
      </Text>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const SubModal: React.FC<{ title: string, options: readonly { label: string; value: string }[] | string[], onSelect: (value: string) => void, allowCustom?: boolean }> = ({ title, options, onSelect, allowCustom = false }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSubModal === title}
      onRequestClose={() => setShowSubModal(null)}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
        activeOpacity={1}
        onPress={() => setShowSubModal(null)}
      >
        <View style={{
          backgroundColor: theme.cardBackground,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '80%',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}>
            <Text style={[globalStyles.subtitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={() => setShowSubModal(null)}>
              <Feather name="x" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {allowCustom && (
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
              <TextInput
                style={[globalStyles.input, {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                placeholder={`Enter ${title.toLowerCase()}...`}
                placeholderTextColor={theme.textSecondary}
                value={customInput}
                onChangeText={setCustomInput}
                onSubmitEditing={() => {
                  if (customInput.trim()) {
                    onSelect(customInput.trim());
                    setCustomInput('');
                  }
                }}
              />
            </View>
          )}

          <ScrollView style={{ maxHeight: 400 }}>
            {options.map((option, index) => {
              const displayText = typeof option === 'string' ? option : option.label;
              const value = typeof option === 'string' ? option : option.value;

              return (
                <TouchableOpacity
                  key={`${value}-${index}`}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                  onPress={() => onSelect(value)}
                >
                  <Text style={[globalStyles.body, { color: theme.text }]}>{displayText}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
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
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '80%',
            }}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}>
              <Text style={[globalStyles.title, { color: theme.text }]}>
                Bulk Actions
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Selected count */}
            <View style={{
              padding: 12,
              backgroundColor: `${theme.primary}10`,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}>
              <Text style={[globalStyles.body, { color: theme.primary, textAlign: 'center', fontWeight: '600' }]}>
                {selectedBooks.length} {selectedBooks.length === 1 ? 'book' : 'books'} selected
              </Text>
            </View>

            <ScrollView>
              <BulkActionButton
                icon="trash-2"
                label="Delete Selected"
                color={theme.danger}
                onPress={() => handleAction('delete', null)}
              />

              <BulkActionButton
                icon="bookmark"
                label="Change Status"
                onPress={() => setShowSubModal('Select Status')}
              />

              <BulkActionButton
                icon="tag"
                label="Add Tags"
                onPress={() => setShowSubModal('Add Tag')}
              />

              <BulkActionButton
                icon="tag"
                label="Remove Tags"
                onPress={() => setShowSubModal('Remove Tag')}
              />

              <BulkActionButton
                icon="layers"
                label="Add to Series"
                onPress={() => setShowSubModal('Series Name')}
              />

              <BulkActionButton
                icon="book"
                label="Set Format"
                onPress={() => setShowSubModal('Select Format')}
              />

              <BulkActionButton
                icon="globe"
                label="Set Language"
                onPress={() => setShowSubModal('Select Language')}
              />

              <BulkActionButton
                icon="star"
                label="Rate Books"
                onPress={() => setShowSubModal('Select Rating')}
              />

              <BulkActionButton
                icon="file-text"
                label="Set Tracking Type"
                onPress={() => setShowSubModal('Select Tracking')}
              />

              {/* Bottom padding for safe area */}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sub-modals */}
      <SubModal
        title="Select Status"
        options={STATUS_OPTIONS}
        onSelect={(value) => handleAction('status', value)}
      />

      <SubModal
        title="Add Tag"
        options={allTags}
        allowCustom={true}
        onSelect={(value) => handleAction('addTags', value)}
      />

      <SubModal
        title="Remove Tag"
        options={allTags}
        onSelect={(value) => handleAction('removeTags', value)}
      />

      <SubModal
        title="Series Name"
        options={[]}
        allowCustom={true}
        onSelect={(value) => handleAction('series', value)}
      />

      <SubModal
        title="Select Format"
        options={BOOK_FORMATS}
        onSelect={(value) => handleAction('format', value)}
      />

      <SubModal
        title="Select Language"
        options={COMMON_LANGUAGES}
        onSelect={(value) => handleAction('language', value)}
      />

      <SubModal
        title="Select Rating"
        options={['0', '1', '2', '3', '4', '5']}
        onSelect={(value) => handleAction('rating', value)}
      />

      <SubModal
        title="Select Tracking"
        options={TRACKING_TYPES}
        onSelect={(value) => handleAction('trackingType', value)}
      />
    </>
  );
};
