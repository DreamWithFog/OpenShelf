import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';
import { RootStackParamList } from '../../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type BackupDataSectionNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface BackupDataSectionProps {
  theme: Theme;
  navigation: BackupDataSectionNavigationProp;
}

export const BackupDataSection: React.FC<BackupDataSectionProps> = ({ theme, navigation }) => (
  <View style={{
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  }}>
    <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 15 }]}>
      Backup & Data
    </Text>

    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
      onPress={() => navigation.navigate('Backup')}
      accessible={true}
      accessibilityLabel="Manage backups"
      accessibilityHint="View and manage automatic backups"
      accessibilityRole="button"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
        <Ionicons name="cloud-outline" size={24} color={theme.primary} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[globalStyles.body, { color: theme.text }]}>Manage Backups</Text>
          <Text style={[globalStyles.caption, { color: theme.textSecondary }]} numberOfLines={2}>
            Auto-backup, restore, import, and export
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>

    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
      }}
      onPress={() => navigation.navigate('BulkImport')}
      accessible={true}
      accessibilityLabel="Bulk import books"
      accessibilityHint="Import books from Goodreads, LibraryThing, or StoryGraph"
      accessibilityRole="button"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
        <Ionicons name="download-outline" size={24} color={theme.primary} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[globalStyles.body, { color: theme.text }]}>Bulk Import Books</Text>
          <Text style={[globalStyles.caption, { color: theme.textSecondary }]} numberOfLines={2}>
            From Goodreads, LibraryThing, StoryGraph
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  </View>
);
