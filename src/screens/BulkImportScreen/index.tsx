import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../../context/AppContext';
import { InstructionsSection, SourcesList, ImportNoteCard, SelectFileButton, PreviewCard, ActionButtons } from './components';
import { useFileImport, useImportConfirmation } from './hooks';
import { RootStackParamList } from '../../types';

type BulkImportNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BulkImport'>;

const BulkImportScreen = () => {
  const { theme, db } = useAppContext();
  const navigation = useNavigation<BulkImportNavigationProp>();

  const {
    isProcessing,
    parsedBooks,
    importStats,
    detectedSource,
    handlePickFile,
    handleCancel,
    setIsProcessing,
  } = useFileImport();

  const { handleConfirmImport } = useImportConfirmation(
    db!,
    parsedBooks,
    detectedSource,
    setIsProcessing,
    navigation
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Bulk Import Books</Text>

        {!parsedBooks ? (
          <>
            <InstructionsSection theme={theme} />
            <SourcesList theme={theme} />
            <ImportNoteCard theme={theme} />
            <SelectFileButton theme={theme} onPress={handlePickFile} isProcessing={isProcessing} />
          </>
        ) : (
          <>
            {/* FIX: Ensure importStats is not null */}
            {importStats && (
              <PreviewCard
                theme={theme}
                parsedBooks={parsedBooks}
                importStats={importStats}
                detectedSource={detectedSource || 'Unknown'}
              />
            )}
            <ActionButtons
              theme={theme}
              parsedBooks={parsedBooks}
              isProcessing={isProcessing}
              onConfirm={handleConfirmImport}
              onCancel={handleCancel}
            />
          </>
        )}

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.processingText, { color: theme.text }]}>
              Processing file...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default BulkImportScreen;
