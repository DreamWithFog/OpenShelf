import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  BookshelfScreen, 
  BookDetailScreen, 
  AddBookScreen, 
  StatsScreen, 
  SettingsScreen,
  BackupScreen,
  BookNotesScreen,
  BookSessionsScreen,
  BulkImportScreen
} from '../screens';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="My Bookshelf"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="My Bookshelf" component={BookshelfScreen as any} />
        <Stack.Screen name="BookDetail" component={BookDetailScreen as any} />
        <Stack.Screen name="AddBook" component={AddBookScreen as any} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen as any} />
        <Stack.Screen name="Backup" component={BackupScreen} />
        <Stack.Screen name="BookNotes" component={BookNotesScreen as any} />
        <Stack.Screen name="BookSessions" component={BookSessionsScreen as any} />
        <Stack.Screen name="BulkImport" component={BulkImportScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
