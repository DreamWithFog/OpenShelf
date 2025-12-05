import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as Share from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import backupManager from '../../../utils/backupManager';
import { importData } from '../../../../database';
import { logger } from '../../../../logger';
import { SQLiteDatabase } from 'expo-sqlite';

interface Backup {
  filepath: string;
  displayDate: string;
  hasImages: boolean;
}

interface DocumentPickerAsset {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

interface DocumentPickerResult {
  canceled: boolean;
  assets: DocumentPickerAsset[] | null;
}

const COVERS_DIR = `${FileSystem.documentDirectory}covers/`;

export const useBackupOperations = (db: SQLiteDatabase, setIsLoading: (isLoading: boolean) => void, loadBackups: () => void): {
  handleCreateBackup: () => Promise<void>;
  handleImportData: () => Promise<void>;
  handleExportBackup: (backup: Backup) => Promise<void>;
  handleRestoreBackup: (backup: Backup) => void;
  handleDeleteBackup: (backup: Backup) => void;
} => {
  const handleCreateBackup = async () => {
    Alert.alert(
      'Create Backup',
      'Create a manual backup of your library with images?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            setIsLoading(true);
            const result = await backupManager.createBackup(db, true);

            if (result.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                'Success',
                `Backup created successfully!\n${result.imageCount || 0} images included.`
              );
              loadBackups();
            } else {
              Alert.alert('Error', 'Failed to create backup');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleImportJSON = async (file: DocumentPickerAsset) => {
    await db.execAsync('DELETE FROM reading_notes');
    await db.execAsync('DELETE FROM sessions');
    await db.execAsync('DELETE FROM books');

    const content = await FileSystem.readAsStringAsync(file.uri);
    const result = await importData(db, content);

    if (!result.success) {
      throw new Error('Failed to import data');
    }
  };

  const handleImportZIP = async (file: DocumentPickerAsset) => {
    await db.execAsync('DELETE FROM reading_notes');
    await db.execAsync('DELETE FROM sessions');
    await db.execAsync('DELETE FROM books');

    const zipData = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipData, { base64: true });

    const jsonFile = zipContent.file("library_data.json");
    if (!jsonFile) {
      throw new Error('Invalid ZIP: library_data.json not found');
    }

    const jsonContent = await jsonFile.async("string");
    const importResult = await importData(db, jsonContent);

    if (!importResult.success) {
      throw new Error('Failed to import data from ZIP');
    }

    const bookIdMap = importResult.bookIdMap || new Map();

    const coversFolder = zipContent.folder("covers");
    if (coversFolder) {
      const coverFiles: { path: string; file: JSZip.JSZipObject }[] = [];
      coversFolder.forEach((relativePath, file) => {
        if (!file.dir) {
          coverFiles.push({ path: relativePath, file });
        }
      });

      const dirInfo = await FileSystem.getInfoAsync(COVERS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(COVERS_DIR, { intermediates: true });
      }

      for (const { path, file } of coverFiles) {
        try {
          const imageData = await file.async("base64");

          const bookIdMatch = path.match(/^(\d+)_/);
          const oldBookId = bookIdMatch ? parseInt(bookIdMatch[1]) : null;
          const newBookId = oldBookId ? bookIdMap.get(oldBookId) : null;

          const originalFilename = path.replace(/^\d+_/, '');
          const localPath = COVERS_DIR + originalFilename;

          await FileSystem.writeAsStringAsync(localPath, imageData, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (newBookId) {
            await db.runAsync(
              'UPDATE books SET coverUrl = ? WHERE id = ?',
              [localPath, newBookId]
            );
          }
        } catch (error: unknown) {
          logger.warn(`Failed to extract cover ${path}:`, error);
        }
      }
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'application/zip'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const isZip = file.name.endsWith('.zip');

        Alert.alert(
          "Import Data",
          `Import from ${file.name}?\n\nThis will replace all your current data!`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Import",
              style: "destructive",
              onPress: async () => {
                setIsLoading(true);

                try {
                  if (isZip) {
                    await handleImportZIP(file);
                  } else {
                    await handleImportJSON(file);
                  }

                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert("Success", "Data imported successfully!");
                  loadBackups();
                } catch (error: unknown) {
                  logger.error("Import failed:", error);
                  Alert.alert("Error", `Failed to import: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
                } finally {
                  setIsLoading(false);
                }
              }
            }
          ]
        );
      }
    } catch (error: unknown) {
      logger.error("File picker error:", error);
      Alert.alert("Error", "Failed to select file");
    }
  };

  const handleExportBackup = async (backup: Backup) => {
    try {
      if (await Share.isAvailableAsync()) {
        await Share.shareAsync(backup.filepath, {
          mimeType: backup.hasImages ? 'application/zip' : 'application/json',
          dialogTitle: 'Export Backup'
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error: unknown) {
      logger.error("Export failed:", error);
      Alert.alert("Error", "Failed to export backup");
    }
  };

  const handleRestoreBackup = (backup: Backup) => {
    const imageInfo = backup.hasImages ? '\n\nThis backup includes book cover images.' : '\n\nNote: This backup does not include images.';

    Alert.alert(
      'Restore Backup',
      `Restore from ${backup.displayDate}?${imageInfo}\n\nThis will replace all current data!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const result = await backupManager.restoreBackup(db, backup.filepath);

            if (result.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              const imageMsg = result.withImages ? ' Images restored!' : ' (No images in this backup)';
              Alert.alert('Success', `Backup restored!${imageMsg}\n\nPlease restart the app for changes to take effect.`);
            } else {
              Alert.alert('Error', `Failed to restore backup: ${result.error}`);
            }
            setIsLoading(false);
          }
        }
      ]
    );
  };

  const handleDeleteBackup = (backup: Backup) => {
    Alert.alert(
      'Delete Backup',
      `Delete backup from ${backup.displayDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await backupManager.deleteBackup(backup.filepath);

            if (result.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadBackups();
            } else {
              Alert.alert('Error', 'Failed to delete backup');
            }
          }
        }
      ]
    );
  };

  return {
    handleCreateBackup,
    handleImportData,
    handleExportBackup,
    handleRestoreBackup,
    handleDeleteBackup,
  };
};
