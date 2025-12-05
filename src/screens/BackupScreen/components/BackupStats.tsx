import React from 'react';
import { View, Text } from 'react-native';
import { Theme } from '../../../context/AppContext';

interface BackupStatistics {
  totalBackups: number;
  totalSize: number;
  withImages: number;
  daysSinceBackup: number | null;
}

interface BackupStatsProps {
  stats: BackupStatistics | null;
  theme: Theme;
  formatFileSize: (size: number) => string;
}

const BackupStats: React.FC<BackupStatsProps> = ({ stats, theme, formatFileSize }) => {
  if (!stats) return null;

  return (
    <View style={{
      backgroundColor: theme.cardBackground,
      margin: 16,
      padding: 16,
      borderRadius: 12,
    }}>
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Backup Status
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: theme.textSecondary }}>Total Backups:</Text>
        <Text style={{ color: theme.text, fontWeight: 'bold' }}>{stats.totalBackups}</Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: theme.textSecondary }}>Total Size:</Text>
        <Text style={{ color: theme.text, fontWeight: 'bold' }}>{formatFileSize(stats.totalSize)}</Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: theme.textSecondary }}>With Images:</Text>
        <Text style={{ color: theme.text, fontWeight: 'bold' }}>{stats.withImages || 0}</Text>
      </View>
      
      {stats.daysSinceBackup !== null && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.textSecondary }}>Last Backup:</Text>
          <Text style={{ 
            color: stats.daysSinceBackup > 7 ? theme.danger : theme.text, 
            fontWeight: 'bold' 
          }}>
            {stats.daysSinceBackup === 0 ? 'Today' : `${stats.daysSinceBackup} days ago`}
          </Text>
        </View>
      )}
      
      {stats.daysSinceBackup !== null && stats.daysSinceBackup > 7 && (
        <View style={{
          backgroundColor: theme.danger,
          padding: 8,
          borderRadius: 8,
          marginTop: 12,
        }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>
            Warning: It's been over a week since your last backup!
          </Text>
        </View>
      )}
    </View>
  );
};

export default BackupStats;