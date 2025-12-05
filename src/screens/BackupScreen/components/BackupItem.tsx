import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface Backup {
  filename: string;
  filepath: string;
  size: number;
  modificationTime: number;
  displayDate: string;
  isManual: boolean;
  hasImages: boolean;
  imageCount: number;
  format: string;
}

interface BackupItemProps {
  backup: Backup;
  onExport: (backup: Backup) => void;
  onRestore: (backup: Backup) => void;
  onDelete: (backup: Backup) => void;
  theme: Theme;
  formatFileSize: (size: number) => string;
}

const BackupItem: React.FC<BackupItemProps> = ({ backup, onExport, onRestore, onDelete, theme, formatFileSize }) => {
  return (
    <View
      style={{
        backgroundColor: theme.cardBackground,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Feather 
            name={backup.isManual ? 'save' : 'clock'} 
            size={16} 
            color={backup.isManual ? theme.primary : theme.textSecondary} 
          />
          <Text style={{
            color: theme.text,
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 8,
          }}>
            {backup.isManual ? 'Manual Backup' : 'Auto Backup'}
          </Text>
        </View>
        
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 2 }}>
          {backup.displayDate}
        </Text>
        
        <Text style={{ color: theme.textTertiary, fontSize: 11 }}>
          Size: {formatFileSize(backup.size)} • {backup.format}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {/* Export Button */}
        <TouchableOpacity
          onPress={() => onExport(backup)}
          style={{
            padding: 8,
            backgroundColor: theme.success,
            borderRadius: 8,
          }}
        >
          <Feather name="download" size={18} color="#fff" />
        </TouchableOpacity>
        
        {/* Restore Button */}
        <TouchableOpacity
          onPress={() => onRestore(backup)}
          style={{
            padding: 8,
            backgroundColor: theme.primary,
            borderRadius: 8,
          }}
        >
          <Feather name="upload" size={18} color="#fff" />
        </TouchableOpacity>
        
        {/* Delete Button */}
        <TouchableOpacity
          onPress={() => onDelete(backup)}
          style={{
            padding: 8,
            backgroundColor: theme.danger,
            borderRadius: 8,
          }}
        >
          <Feather name="trash-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BackupItem;