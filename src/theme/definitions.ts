import { ThemeColors } from './themeUtils';

// Base defaults to spread
const baseTheme = {
  textSecondary: '#666666',
  textTertiary: '#999999',
  starColor: '#FFD700',
  starEmpty: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#FF3B30',
  fabIcon: '#FFFFFF',
  skeletonBase: '#E1E9EE',
  skeletonHighlight: '#F2F8FC',
};

export const CREATIVE_THEMES: ThemeColors[] = [
  // STARTER THEMES (Level 1) - Only 2 themes to start
  // 1. The Classic (Clean, Apple-like) - ALWAYS UNLOCKED
  {
    ...baseTheme,
    key: 'standard',
    name: 'Standard',
    unlockLevel: 1, // Always available
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#F2F2F7',
    cardBackground: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
    inputBackground: '#FFFFFF',
    placeholderBg: '#F2F2F7',
    tagBg: '#E5E5EA',
    tagText: '#000000',
    fabBackground: '#007AFF',
    selectedTag: '#007AFF',
  },
  // 2. Paperback (Warm, cozy, like an old book) - STARTER
  {
    ...baseTheme,
    key: 'paperback',
    name: 'Paperback',
    unlockLevel: 1,
    primary: '#8D6E63', // Warm Brown
    secondary: '#D7CCC8',
    background: '#F9F5F0', // Cream
    cardBackground: '#FFFFFF',
    text: '#4E342E', // Dark Brown text
    textSecondary: '#8D6E63',
    border: '#EFEBE9',
    inputBackground: '#FFFFFF',
    placeholderBg: '#EFEBE9',
    tagBg: '#EFEBE9',
    tagText: '#5D4037',
    fabBackground: '#8D6E63',
    selectedTag: '#8D6E63',
    starColor: '#FFA000',
  },
  
  // EARLY UNLOCKS (Level 3-8) - Quick early rewards
  // 3. Ocean (Deep Blue, Calm) - Level 3
  {
    ...baseTheme,
    key: 'ocean',
    name: 'Ocean',
    unlockLevel: 3,
    primary: '#0288D1', // Light Blue
    secondary: '#03A9F4',
    background: '#E1F5FE', // Very light blue
    cardBackground: '#FFFFFF',
    text: '#01579B', // Deep Blue text
    border: '#B3E5FC',
    inputBackground: '#FFFFFF',
    placeholderBg: '#B3E5FC',
    tagBg: '#B3E5FC',
    tagText: '#01579B',
    fabBackground: '#0288D1',
    selectedTag: '#0288D1',
  },
  // 4. Nordic (Cool, Icy, Minimalist) - Level 5
  {
    ...baseTheme,
    key: 'nordic',
    name: 'Nordic',
    unlockLevel: 5,
    primary: '#546E7A', // Blue Grey
    secondary: '#78909C',
    background: '#ECEFF1', // Cool Grey
    cardBackground: '#FFFFFF',
    text: '#263238', // Dark Blue Grey
    border: '#CFD8DC',
    inputBackground: '#FAFAFA',
    placeholderBg: '#CFD8DC',
    tagBg: '#CFD8DC',
    tagText: '#37474F',
    fabBackground: '#546E7A',
    selectedTag: '#546E7A',
  },
  // 5. Slate (Professional, Grey/Blue) - Level 8
  {
    ...baseTheme,
    key: 'slate',
    name: 'Slate',
    unlockLevel: 8,
    primary: '#455A64',
    secondary: '#607D8B',
    background: '#ECEFF1',
    cardBackground: '#FFFFFF',
    text: '#263238',
    border: '#CFD8DC',
    inputBackground: '#FFFFFF',
    placeholderBg: '#CFD8DC',
    tagBg: '#CFD8DC',
    tagText: '#37474F',
    fabBackground: '#455A64',
    selectedTag: '#455A64',
  },
  
  // MID-TIER UNLOCKS (Level 12-25) - Building momentum
  // 6. Matcha (Calm, Green, Organic) - Level 12
  {
    ...baseTheme,
    key: 'matcha',
    name: 'Matcha',
    unlockLevel: 12,
    primary: '#66BB6A', // Green
    secondary: '#9CCC65',
    background: '#F1F8E9', // Light Green tint
    cardBackground: '#FFFFFF',
    text: '#1B5E20', // Dark Green text
    border: '#DCEDC8',
    inputBackground: '#FFFFFF',
    placeholderBg: '#DCEDC8',
    tagBg: '#DCEDC8',
    tagText: '#33691E',
    fabBackground: '#66BB6A',
    selectedTag: '#66BB6A',
  },
  // 7. Sakura (Delicate, Pink, Floral) - Level 15
  {
    ...baseTheme,
    key: 'sakura',
    name: 'Sakura',
    unlockLevel: 15,
    primary: '#FF80AB', // Pink
    secondary: '#FF4081',
    background: '#FFF0F5', // Lavender Blush
    cardBackground: '#FFFFFF',
    text: '#880E4F', // Dark Pink text
    border: '#F8BBD0', // Light Pink border
    inputBackground: '#FFFFFF',
    placeholderBg: '#FCE4EC',
    tagBg: '#FCE4EC',
    tagText: '#C2185B',
    fabBackground: '#FF80AB',
    selectedTag: '#FF80AB',
  },
  // 8. Lavender (Purple, Soft, Dreamy) - Level 20
  {
    ...baseTheme,
    key: 'lavender',
    name: 'Lavender',
    unlockLevel: 20,
    primary: '#AB47BC', // Purple
    secondary: '#BA68C8',
    background: '#F3E5F5', // Light Purple tint
    cardBackground: '#FFFFFF',
    text: '#4A148C', // Deep Purple text
    border: '#E1BEE7',
    inputBackground: '#FFFFFF',
    placeholderBg: '#E1BEE7',
    tagBg: '#E1BEE7',
    tagText: '#6A1B9A',
    fabBackground: '#AB47BC',
    selectedTag: '#AB47BC',
  },
  // 9. Mint (Fresh, Cyan, Pop) - Level 25
  {
    ...baseTheme,
    key: 'mint',
    name: 'Mint',
    unlockLevel: 25,
    primary: '#26A69A', // Teal
    secondary: '#80CBC4',
    background: '#E0F2F1', // Light Teal
    cardBackground: '#FFFFFF',
    text: '#004D40', // Dark Teal
    border: '#B2DFDB',
    inputBackground: '#FFFFFF',
    placeholderBg: '#B2DFDB',
    tagBg: '#B2DFDB',
    tagText: '#00695C',
    fabBackground: '#26A69A',
    selectedTag: '#26A69A',
  },
  
  // HIGH-TIER UNLOCKS (Level 30-50) - Rewarding dedication
  // 10. Sunset (Gradient vibe, Orange/Purple) - Level 30
  {
    ...baseTheme,
    key: 'sunset',
    name: 'Sunset',
    unlockLevel: 30,
    primary: '#FF7043', // Deep Orange
    secondary: '#FFCA28',
    background: '#FFF3E0', // Light Orange tint
    cardBackground: '#FFFFFF',
    text: '#BF360C', // Burnt Orange text
    border: '#FFE0B2',
    inputBackground: '#FFFFFF',
    placeholderBg: '#FFE0B2',
    tagBg: '#FFE0B2',
    tagText: '#E64A19',
    fabBackground: '#FF7043',
    selectedTag: '#FF7043',
  },
  // 11. Midnight (Dark Blue on White - High Contrast) - Level 35
  {
    ...baseTheme,
    key: 'midnight',
    name: 'Midnight',
    unlockLevel: 35,
    primary: '#1A237E', // Navy Blue
    secondary: '#303F9F',
    background: '#E8EAF6', // Very light Indigo
    cardBackground: '#FFFFFF',
    text: '#000000',
    border: '#C5CAE9',
    inputBackground: '#FFFFFF',
    placeholderBg: '#C5CAE9',
    tagBg: '#C5CAE9',
    tagText: '#1A237E',
    fabBackground: '#1A237E',
    selectedTag: '#1A237E',
  },
  // 12. Berry (Red/Purple, Rich) - Level 40
  {
    ...baseTheme,
    key: 'berry',
    name: 'Berry',
    unlockLevel: 40,
    primary: '#C2185B', // Pink/Red
    secondary: '#E91E63',
    background: '#FCE4EC', // Pink tint
    cardBackground: '#FFFFFF',
    text: '#880E4F',
    border: '#F8BBD0',
    inputBackground: '#FFFFFF',
    placeholderBg: '#F8BBD0',
    tagBg: '#F8BBD0',
    tagText: '#880E4F',
    fabBackground: '#C2185B',
    selectedTag: '#C2185B',
  },
  // 13. Lemonade (Yellow, Bright, Happy) - Level 50
  {
    ...baseTheme,
    key: 'lemonade',
    name: 'Lemonade',
    unlockLevel: 50,
    primary: '#FBC02D', // Yellow
    secondary: '#FDD835',
    background: '#FFFDE7', // Light Yellow
    cardBackground: '#FFFFFF',
    text: '#F57F17', // Dark Yellow/Orange
    border: '#FFF59D',
    inputBackground: '#FFFFFF',
    placeholderBg: '#FFF59D',
    tagBg: '#FFF59D',
    tagText: '#F9A825',
    fabBackground: '#FBC02D',
    selectedTag: '#FBC02D',
  },
  
  // PREMIUM UNLOCKS (Level 60-75) - For dedicated readers
  // 14. Coral (Vibrant, Peach/Pink mix) - Level 60
  {
    ...baseTheme,
    key: 'coral',
    name: 'Coral',
    unlockLevel: 60,
    primary: '#FF7043',
    secondary: '#FF8A65',
    background: '#FBE9E7',
    cardBackground: '#FFFFFF',
    text: '#BF360C',
    border: '#FFCCBC',
    inputBackground: '#FFFFFF',
    placeholderBg: '#FFCCBC',
    tagBg: '#FFCCBC',
    tagText: '#D84315',
    fabBackground: '#FF7043',
    selectedTag: '#FF7043',
  },
  // 15. Vamp (Dramatic, Red, Black, White) - Level 75 (LEGENDARY)
  {
    ...baseTheme,
    key: 'vamp',
    name: 'Vamp',
    unlockLevel: 75,
    primary: '#D32F2F', // Red
    secondary: '#B71C1C',
    background: '#FAFAFA', // Stark White
    cardBackground: '#FFFFFF',
    text: '#212121', // Almost Black
    border: '#FFCDD2', // Red tint
    inputBackground: '#FFFFFF',
    placeholderBg: '#FFCDD2',
    tagBg: '#FFCDD2',
    tagText: '#B71C1C',
    fabBackground: '#D32F2F',
    selectedTag: '#D32F2F',
  }
];

// Theme unlock milestones for better visibility
export const THEME_UNLOCK_MILESTONES = [
  { level: 1, count: 2, description: "Starter themes" },
  { level: 3, count: 1, description: "First unlock!" },
  { level: 5, count: 1, description: "Nordic frost" },
  { level: 8, count: 1, description: "Professional slate" },
  { level: 12, count: 1, description: "Organic matcha" },
  { level: 15, count: 1, description: "Cherry blossom" },
  { level: 20, count: 1, description: "Dreamy lavender" },
  { level: 25, count: 1, description: "Fresh mint" },
  { level: 30, count: 1, description: "Sunset vibes" },
  { level: 35, count: 1, description: "Midnight blue" },
  { level: 40, count: 1, description: "Berry blast" },
  { level: 50, count: 1, description: "Sunny lemonade" },
  { level: 60, count: 1, description: "Coral reef" },
  { level: 75, count: 1, description: "Legendary Vamp" },
];
