import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { lightThemes, darkThemes } from '../../theme';
import { globalStyles } from '../../styles/globalStyles';
import * as Haptics from 'expo-haptics';

interface Theme {
  key: string;
  name: string;
  primary: string;
  background: string;
  border: string;
  text: string;
  textSecondary?: string;
}

interface ThemeButtonProps {
  theme: Theme;
  isSelected: boolean;
  onPress: () => void;
  activeTheme: Theme;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({ 
  theme, 
  isSelected, 
  onPress,
  activeTheme 
}) => {
  return (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: isSelected 
            ? activeTheme.primary 
            : activeTheme.background,
        borderWidth: 2,
        borderColor: isSelected 
            ? activeTheme.primary 
            : activeTheme.border,
        minWidth: 90,
        marginRight: 8,
      }}
      onPress={onPress}
    >
      {/* Preview Dot */}
      <View style={{ 
        width: 16, 
        height: 16, 
        borderRadius: 8, 
        backgroundColor: theme.primary, 
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)'
      }} />
      
      <Text style={{
        fontSize: 12,
        fontWeight: '600',
        color: isSelected 
            ? '#fff' 
            : activeTheme.text,
        textAlign: 'center',
      }}>
        {theme.name}
      </Text>
    </TouchableOpacity>
  );
};

const ThemeSelector: React.FC = () => {
  const { 
    theme: activeTheme,
    themeMode, 
    setThemeMode, 
    selectedLightTheme, 
    selectedDarkTheme, 
    setSelectedLightTheme, 
    setSelectedDarkTheme 
  } = useAppContext();
  
  const handleLightThemeSelect = (themeKey: string) => {
    Haptics.selectionAsync();
    setSelectedLightTheme(themeKey);
    if (themeMode === 'system' || themeMode === 'dark') {
      setThemeMode('light');
    }
  };

  const handleDarkThemeSelect = (themeKey: string) => {
    Haptics.selectionAsync();
    setSelectedDarkTheme(themeKey);
    if (themeMode === 'system' || themeMode === 'light') {
      setThemeMode('dark');
    }
  };

  const handleSystemModeToggle = () => {
    Haptics.selectionAsync();
    if (themeMode === 'system') {
      setThemeMode('light');
    } else {
      setThemeMode('system');
    }
  };

  // Sort themes by name just to keep it tidy
  const lightThemeList = useMemo(() => {
    const themes = Object.values(lightThemes);
    return themes.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const darkThemeList = useMemo(() => {
    const themes = Object.values(darkThemes);
    return themes.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Helpers to find names safely
  const currentLightName = lightThemes[selectedLightTheme]?.name || 'Standard';
  const currentDarkName = darkThemes[selectedDarkTheme]?.name || 'Standard';

  return (
    <View style={{
      backgroundColor: activeTheme.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Text style={[globalStyles.subtitle, { color: activeTheme.text }]}>
          Choose Your Theme
        </Text>
      </View>

      {/* System Button */}
      <TouchableOpacity
        style={{
          backgroundColor: themeMode === 'system' ? activeTheme.primary : activeTheme.background,
          borderWidth: 2,
          borderColor: themeMode === 'system' ? activeTheme.primary : activeTheme.border,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          alignItems: 'center',
        }}
        onPress={handleSystemModeToggle}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons 
            name={themeMode === 'system' ? 'phone-portrait' : 'phone-portrait-outline'} 
            size={18} 
            color={themeMode === 'system' ? '#fff' : activeTheme.text}
            style={{ marginRight: 8 }}
          />
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: themeMode === 'system' ? '#fff' : activeTheme.text,
          }}>
            {themeMode === 'system' ? 'System Mode Active' : 'Follow System Theme'}
          </Text>
        </View>
        <Text style={{
          fontSize: 12,
          color: themeMode === 'system' ? 'rgba(255,255,255,0.8)' : activeTheme.textSecondary,
          marginTop: 4,
        }}>
          Light: {currentLightName} - Dark: {currentDarkName}
        </Text>
      </TouchableOpacity>
      
      {/* Light Themes */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[globalStyles.body, { color: activeTheme.text, fontWeight: '600' }]}>
            Light Themes
          </Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View style={{ flexDirection: 'row' }}>
            {lightThemeList.map((t) => (
              <ThemeButton
                key={t.key}
                theme={t as any}
                isSelected={selectedLightTheme === t.key}
                onPress={() => handleLightThemeSelect(t.key)}
                activeTheme={activeTheme}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Dark Themes */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[globalStyles.body, { color: activeTheme.text, fontWeight: '600' }]}>
            Dark Themes
          </Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View style={{ flexDirection: 'row' }}>
            {darkThemeList.map((t) => (
              <ThemeButton
                key={t.key}
                theme={t as any}
                isSelected={selectedDarkTheme === t.key}
                onPress={() => handleDarkThemeSelect(t.key)}
                activeTheme={activeTheme}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ThemeSelector;
