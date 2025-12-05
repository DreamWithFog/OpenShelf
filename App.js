import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useAppContext } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary, Toast } from './src/components/common';

const AppContent = () => {
  const { theme, undoData, showUndoToast, executeUndo, dismissUndo } = useAppContext();

  return (
    <>
      <AppNavigator />
      
      <Toast
        visible={showUndoToast}
        message={undoData?.message || 'Deleted'}
        onUndo={executeUndo}
        onDismiss={dismissUndo}
        theme={theme}
      />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
