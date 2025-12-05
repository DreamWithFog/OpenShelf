import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppContext } from '../../context/AppContext';
import { RootStackParamList } from '../../types';
import { globalStyles } from '../../styles/globalStyles';
import { ThemeSelector } from '../../components/settings';
import { ViewModeSection, BackupDataSection, DebugSection } from './components';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, currentTheme, changeTheme, gridView, setGridView, db } = useAppContext();

  const handleDataChange = () => {
    // Navigate back to force refresh
    navigation.navigate('My Bookshelf');
  };

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemeSelector 
          theme={theme}
          currentTheme={currentTheme}
          onThemeChange={changeTheme}
        />

        <ViewModeSection 
          theme={theme}
          gridView={gridView}
          onViewChange={setGridView}
        />

        <BackupDataSection 
          theme={theme}
          navigation={navigation}
        />

        <DebugSection 
          theme={theme} 
          db={db}
          onDataChange={handleDataChange}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default SettingsScreen;
