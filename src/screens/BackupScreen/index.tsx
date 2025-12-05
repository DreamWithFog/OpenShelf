import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppContext } from '../../context/AppContext';
import backupManager from '../../utils/backupManager';
import { globalStyles } from '../../styles/globalStyles';
import { EmptyState } from '../../components';
import { useBackupOperations } from './hooks/useBackupOperations';
import BackupStats from './components/BackupStats';
import BackupItem from './components/BackupItem';
import ActionModal from './components/ActionModal';

// Define types for navigation
type RootStackParamList = {
  BackupScreen: undefined;
  // Add other screen names and their params if known
};

type BackupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BackupScreen'>;

interface BackupScreenProps {
  navigation: BackupScreenNavigationProp;
}

// Define types for Backup and BackupStats
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

interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackupTime: number | null;
  daysSinceBackup: number | null;
  oldestBackup: Backup | undefined;
  newestBackup: Backup | undefined;
  withImages: number;
}

const BackupScreen: React.FC<BackupScreenProps> = ({ navigation }) => {
  const { theme, db } = useAppContext();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);

  const loadBackups = async (): Promise<void> => {
    try {
      const [backupList, backupStats] = await Promise.all([
        backupManager.getBackupList(),
        backupManager.getBackupStats()
      ]);
      
      setBackups(backupList as Backup[]);
      setStats(backupStats as BackupStats);
    } catch (error) {
      Alert.alert('Error', 'Failed to load backups');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  if (!db) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const {
    handleCreateBackup,
    handleImportData,
    handleExportBackup,
    handleRestoreBackup,
    handleDeleteBackup,
  } = useBackupOperations(db, setIsLoading, loadBackups);

  useEffect(() => {
    loadBackups();
  }, []);

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    loadBackups();
  };

  const handlePlusButton = (): void => {
    setShowActionModal(true);
  };

  const onCreateBackup = (): void => {
    setShowActionModal(false);
    handleCreateBackup();
  };

  const onImportData = (): void => {
    setShowActionModal(false);
    handleImportData();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={[globalStyles.header, { justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[globalStyles.headerTitle, { color: theme.text }]}>Backups</Text>
        <TouchableOpacity onPress={handlePlusButton}>
          <Feather name="plus-circle" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <BackupStats stats={stats} theme={theme} formatFileSize={formatFileSize} />

      {/* Backup List */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {backups.length === 0 ? (
          <EmptyState
            title="No backups yet"
            message="Tap + to create your first backup or import data"
            theme={theme}
          />
        ) : (
          backups.map((backup) => (
            <BackupItem
              key={backup.filename}
              backup={backup}
              onExport={handleExportBackup}
              onRestore={handleRestoreBackup}
              onDelete={handleDeleteBackup}
              theme={theme}
              formatFileSize={formatFileSize}
            />
          ))
        )}
      </ScrollView>

      {/* Action Modal */}
      <ActionModal
        visible={showActionModal}
        onClose={() => setShowActionModal(false)}
        onCreateBackup={onCreateBackup}
        onImportData={onImportData}
        theme={theme}
      />
    </SafeAreaView>
  );
};

export default BackupScreen;
