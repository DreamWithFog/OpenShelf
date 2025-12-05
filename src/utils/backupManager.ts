import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JSZip from 'jszip';
import { exportAllData, importData, getAllBooks } from '../../database';
import { logger } from '../../logger';
import { Book } from '../types';
import { SQLiteDatabase } from 'expo-sqlite';

const BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;
const COVERS_DIR = `${FileSystem.documentDirectory}covers/`;
const MAX_BACKUPS = 7;
const LAST_BACKUP_KEY = '@last_backup_date';
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface BackupResult {
  success: boolean;
  filename?: string;
  filepath?: string;
  imageCount?: number;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  withImages?: boolean;
  error?: string;
}

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

class BackupManager {
  isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  // Initialize backup directory
  async init(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
        logger.log('Created backup directory');
      }
      
      this.isInitialized = true;
      logger.log('Backup manager initialized successfully');
    } catch (error: unknown) { // Changed from any
      logger.error('Failed to initialize backup manager:', error);
    }
  }

  // Check if auto-backup is needed
  async shouldAutoBackup(): Promise<boolean> {
    try {
      const lastBackup = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      
      if (!lastBackup) {
        return true;
      }
      
      const lastBackupTime = parseInt(lastBackup, 10);
      const now = Date.now();
      const timeSinceBackup = now - lastBackupTime;
      
      return timeSinceBackup > BACKUP_INTERVAL;
    } catch (error: unknown) { // Changed from any
      logger.error('Error checking backup status:', error);
      return false;
    }
  }

  // Create a backup WITH IMAGES (ZIP format)
  async createBackup(db: SQLiteDatabase, isManual: boolean = false): Promise<BackupResult> {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      logger.log('Creating backup with images...');
      
      const zip = new JSZip();
      
      // Get the data to backup
      const backupData = await exportAllData(db);
      zip.file("library_data.json", backupData);
      
      // Get all books to backup their covers
      const books: Book[] = await getAllBooks(db);
      const coversFolder = zip.folder("covers");
      
      let imageCount = 0;
      
      // Add book covers to ZIP
      for (const book of books) {
        if (book.coverUrl && book.coverUrl.startsWith(COVERS_DIR)) {
          try {
            // Read image as base64
            const imageData = await FileSystem.readAsStringAsync(book.coverUrl, {
              encoding: FileSystem.EncodingType.Base64
            });
            
            // Extract just the filename
            const filename = book.coverUrl.split('/').pop();
            
            // Add to ZIP with book ID prefix for easy mapping
            const zipFilename = `${book.id}_${filename}`;
            if (coversFolder) {
              coversFolder.file(zipFilename, imageData, { base64: true });
            }
            imageCount++;
            
            logger.log(`Added cover image: ${book.title}`);
          } catch (error: unknown) { // Changed from any
            logger.warn(`Warning: Failed to backup cover for "${book.title}":`, (error as Error).message);
          }
        }
      }
      
      // Add metadata file with image count
      const metadata = {
        imageCount: imageCount,
        createdAt: new Date().toISOString(),
        version: '2.0',
        isManual: isManual
      };
      zip.file("metadata.json", JSON.stringify(metadata, null, 2));
      
      // Generate ZIP as base64
      const zipBase64 = await zip.generateAsync({ type: "base64" });
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const prefix = isManual ? 'manual' : 'auto';
      const filename = `${prefix}_backup_${timestamp}.zip`;
      const filepath = BACKUP_DIR + filename;
      
      // Save the ZIP backup
      await FileSystem.writeAsStringAsync(filepath, zipBase64, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Update last backup time
      await AsyncStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());
      
      logger.log(`Backup saved successfully: ${filename}`);
      logger.log(`Included ${imageCount} book covers in backup`);
      
      // Clean up old backups
      await this.cleanupOldBackups();
      
      return {
        success: true,
        filename,
        filepath,
        imageCount
      };
    } catch (error: unknown) { // Changed from any
      logger.error('Backup failed:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // Clean up old backups
  async cleanupOldBackups(): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
      
      const backupFiles = files
        .filter(f => f.includes('backup') && (f.endsWith('.json') || f.endsWith('.zip')))
        .sort((a, b) => b.localeCompare(a));
      
      if (backupFiles.length > MAX_BACKUPS) {
        const filesToDelete = backupFiles.slice(MAX_BACKUPS);
        
        for (const file of filesToDelete) {
          await FileSystem.deleteAsync(BACKUP_DIR + file, { idempotent: true });
          logger.log(`Deleted old backup: ${file}`);
        }
      }
    } catch (error: unknown) { // Changed from any
      logger.error('Error cleaning up old backups:', error);
    }
  }

  // Get list of available backups
  async getBackupList(): Promise<Backup[]> {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
      
      const backups = await Promise.all(
        files
          .filter(f => f.includes('backup') && (f.endsWith('.json') || f.endsWith('.zip')))
          .map(async (filename): Promise<Backup> => {
            const filepath = BACKUP_DIR + filename;
            const info = await FileSystem.getInfoAsync(filepath) as FileSystem.FileInfo & { exists: true; isDirectory: false; };
            
            const match = filename.match(/backup_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
            const timestamp = match ? match[1].replace(/-/g, ':').replace('T', ' ') : 'Unknown';
            
            const isZip = filename.endsWith('.zip');
            let imageCount = 0;
            
            // Read metadata from ZIP if available
            if (isZip) {
              try {
                const zipData = await FileSystem.readAsStringAsync(filepath, {
                  encoding: FileSystem.EncodingType.Base64
                });
                
                const zip = new JSZip();
                const zipContent = await zip.loadAsync(zipData, { base64: true });
                
                // Check for metadata file
                const metadataFile = zipContent.file("metadata.json");
                if (metadataFile) {
                  const metadata = JSON.parse(await metadataFile.async("string"));
                  imageCount = metadata.imageCount || 0;
                } else {
                  // Fallback: count files in covers folder
                  const coversFolder = zipContent.folder("covers");
                  if (coversFolder) {
                    coversFolder.forEach((relativePath, file) => {
                      if (!file.dir) imageCount++;
                    });
                  }
                }
              } catch (error: unknown) { // Changed from any
                logger.warn('Could not read backup metadata:', error);
              }
            }
            
            const formatText = isZip 
              ? (imageCount > 0 ? `ZIP (${imageCount} image${imageCount !== 1 ? 's' : ''})` : 'ZIP (no images)')
              : 'JSON (data only)';
            
            return {
              filename,
              filepath,
              size: info.size || 0, // Changed from (info as any).size
              modificationTime: info.modificationTime || 0, // Changed from (info as any).modificationTime
              displayDate: timestamp,
              isManual: filename.startsWith('manual_'),
              hasImages: imageCount > 0,
              imageCount: imageCount,
              format: formatText
            };
          })
      );
      
      backups.sort((a, b) => b.modificationTime - a.modificationTime);
      
      return backups;
    } catch (error: unknown) { // Changed from any
      logger.error('Error getting backup list:', error);
      return [];
    }
  }

  // Restore from backup (handles both JSON and ZIP)
  async restoreBackup(db: SQLiteDatabase, filepath: string): Promise<RestoreResult> {
    try {
      logger.log('📥 Restoring backup...');
      
      const isZip = filepath.endsWith('.zip');
      
      if (isZip) {
        logger.log('Restoring ZIP backup with images...');
        
        // STEP 1: Clear existing data
        logger.log('Clearing existing data...');
        await db.execAsync('DELETE FROM reading_notes');
        await db.execAsync('DELETE FROM sessions');
        await db.execAsync('DELETE FROM books');
        logger.log('Existing data cleared successfully');
        
        // Read ZIP file
        const zipData = await FileSystem.readAsStringAsync(filepath, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        // Load ZIP
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipData, { base64: true });
        
        // Extract JSON data
        const jsonFile = zipContent.file("library_data.json");
        if (!jsonFile) {
          throw new Error('Invalid backup: library_data.json not found');
        }
        
        const jsonContent = await jsonFile.async("string");
        
        // STEP 2: Import data (this includes books AND sessions)
        const importResult = await importData(db, jsonContent);
        
        if (!importResult.success) {
          throw new Error('Data import failed');
        }
        
        // Get the book ID mapping (old ID -> new ID)
        const bookIdMap = importResult.bookIdMap || new Map();
        logger.log(`📋 Book ID mapping created with ${bookIdMap.size} entries`);
        
        // STEP 3: Extract and restore covers
        const coversFolder = zipContent.folder("covers");
        let restoredImages = 0;
        
        if (coversFolder) {
          const coverFiles: { path: string, file: JSZip.JSZipObject }[] = [];
          coversFolder.forEach((relativePath, file) => {
            if (!file.dir) {
              coverFiles.push({ path: relativePath, file });
            }
          });
          
          logger.log(`Restoring ${coverFiles.length} book covers...`);
          
          // Ensure covers directory exists
          const dirInfo = await FileSystem.getInfoAsync(COVERS_DIR);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(COVERS_DIR, { intermediates: true });
          }
          
          // Restore each cover and update book records
          for (const { path, file } of coverFiles) {
            try {
              const imageData = await file.async("base64");
              
              // Extract book ID from filename (format: "oldBookId_originalfilename.jpg")
              const bookIdMatch = path.match(/^(\d+)_/);
              const oldBookId = bookIdMatch ? parseInt(bookIdMatch[1]) : null;
              
              // Get the new book ID from the mapping
              const newBookId = oldBookId ? bookIdMap.get(oldBookId) : null;
              
              // Save with original filename (without book ID prefix)
              const originalFilename = path.replace(/^\d+_/, '');
              const localPath = COVERS_DIR + originalFilename;
              
              await FileSystem.writeAsStringAsync(localPath, imageData, {
                encoding: FileSystem.EncodingType.Base64
              });
              
              // Update book record with new cover path using the NEW book ID
              if (newBookId) {
                await db.runAsync(
                  'UPDATE books SET coverUrl = ? WHERE id = ?',
                  [localPath, newBookId]
                );
                restoredImages++;
                logger.log(`Restored cover for book ID ${oldBookId} -> ${newBookId}: ${originalFilename}`);
              } else {
                logger.warn(`Warning: Could not find new book ID for old ID ${oldBookId}`);
              }
            } catch (error: unknown) { // Changed from any
              logger.warn(`Warning: Failed to restore cover ${path}:`, (error as Error).message);
            }
          }
        }
        
        logger.log(`Backup restored successfully with ${restoredImages} images`);
        return { success: true, withImages: restoredImages > 0 };
      } else {
        // Restore from JSON (legacy, no images)
        logger.log('Restoring JSON backup (no images)...');
        
        // Clear existing data first
        logger.log('Clearing existing data...');
        await db.execAsync('DELETE FROM reading_notes');
        await db.execAsync('DELETE FROM sessions');
        await db.execAsync('DELETE FROM books');
        
        const backupData = await FileSystem.readAsStringAsync(filepath);
        const result = await importData(db, backupData);
        
        if (result.success) {
          logger.log('Backup restored successfully');
          return { success: true, withImages: false };
        } else {
          throw new Error('Import failed');
        }
      }
    } catch (error: unknown) { // Changed from any
      logger.error('Restore failed:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // Delete a specific backup
  async deleteBackup(filepath: string): Promise<{ success: boolean; error?: string }> {
    try {
      await FileSystem.deleteAsync(filepath, { idempotent: true });
      logger.log('Backup deleted successfully');
      return { success: true };
    } catch (error: unknown) { // Changed from any
      logger.error('Error deleting backup:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Get backup statistics
  async getBackupStats(): Promise<BackupStats | null> {
    try {
      const backups = await this.getBackupList();
      const lastBackup = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      
      const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
      const lastBackupTime = lastBackup ? parseInt(lastBackup, 10) : null;
      const daysSinceBackup = lastBackupTime 
        ? Math.floor((Date.now() - lastBackupTime) / (1000 * 60 * 60 * 24))
        : null;
      
      const withImages = backups.filter(b => b.hasImages).length;
      
      return {
        totalBackups: backups.length,
        totalSize,
        lastBackupTime,
        daysSinceBackup,
        oldestBackup: backups[backups.length - 1],
        newestBackup: backups[0],
        withImages
      };
    } catch (error: unknown) { // Changed from any
      logger.error('Error getting backup stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const backupManager = new BackupManager();

export default backupManager;

// Helper function for auto-backup on app start
export const performAutoBackup = async (db: SQLiteDatabase): Promise<boolean> => {
  const shouldBackup = await backupManager.shouldAutoBackup();
  
  if (shouldBackup) {
    logger.log('Auto-backup triggered');
    const result = await backupManager.createBackup(db, false);
    
    if (result.success) {
      logger.log(`Auto-backup completed successfully (${result.imageCount || 0} images included)`);
      return true;
    } else {
      logger.error('Auto-backup failed');
      return false;
    }
  }
  
  return false;
};