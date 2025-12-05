import { createDarkVariant, ThemeColors } from './themeUtils';
import { CREATIVE_THEMES } from './definitions';

// 1. Create the Light Themes Map
const lightThemesMap: Record<string, ThemeColors> = {};
CREATIVE_THEMES.forEach(theme => {
  lightThemesMap[theme.key] = theme;
});

// 2. Auto-Generate Dark Themes Map
const darkThemesMap: Record<string, ThemeColors> = {};
CREATIVE_THEMES.forEach(theme => {
  const darkTheme = createDarkVariant(theme);
  darkThemesMap[darkTheme.key] = darkTheme;
});

export const lightThemes = lightThemesMap;
export const darkThemes = darkThemesMap;

// Flattened export for fallback usage if needed
export const allThemesArray = [
  ...Object.values(lightThemes),
  ...Object.values(darkThemes)
];
