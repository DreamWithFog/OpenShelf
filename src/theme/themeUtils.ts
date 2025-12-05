export interface ThemeColors {
  key: string;
  name: string;
  unlockLevel?: number; // NEW: Level required to unlock this theme (undefined = always unlocked)
  primary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  inputBackground: string;
  placeholderBg: string;
  starColor: string;
  starEmpty: string;
  success: string;
  warning: string;
  danger: string;
  tagBg: string;
  tagText: string;
  secondary: string;
  fabBackground: string;
  fabIcon: string;
  selectedTag: string;
  skeletonBase: string;
  skeletonHighlight: string;
}

// --- Color Math Helpers ---

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const componentToHex = (c: number) => {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

// Mixes two colors. Weight is the percentage of color2 in the mix (0 to 1)
// mixColors('#ff0000', '#000000', 0.8) -> 80% black, 20% red
const mixColors = (color1: string, color2: string, weight: number) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = c1.r * (1 - weight) + c2.r * weight;
  const g = c1.g * (1 - weight) + c2.g * weight;
  const b = c1.b * (1 - weight) + c2.b * weight;

  return rgbToHex(r, g, b);
};

// --- Generator ---

export const createDarkVariant = (lightTheme: ThemeColors): ThemeColors => {
  // Base Black for mixing (Pure black #000000 or slight off-black #050505)
  const BASE_DARK = '#050505'; 
  
  // 1. Generate Tinted Backgrounds
  // 94% Dark + 6% Primary color = Subtle atmospheric tint
  const tintedBackground = mixColors(lightTheme.primary, BASE_DARK, 0.94);
  
  // 85% Dark + 15% Primary = Lighter card to stand out
  const tintedCard = mixColors(lightTheme.primary, BASE_DARK, 0.88);
  
  // 60% Dark + 40% Primary = Nice colored borders
  const tintedBorder = mixColors(lightTheme.primary, BASE_DARK, 0.75);

  // 2. Muted Text Colors
  // Instead of pure white, we tint the white slightly with the primary color for warmth
  const tintedText = mixColors(lightTheme.primary, '#FFFFFF', 0.95); // 95% White
  const tintedTextSec = mixColors(lightTheme.primary, '#A0A0A0', 0.90); // 90% Grey

  return {
    ...lightTheme,
    key: `dark${lightTheme.key.charAt(0).toUpperCase() + lightTheme.key.slice(1)}`,
    name: `Dark ${lightTheme.name}`,
    
    // Structural Colors (Tinted)
    background: tintedBackground,
    cardBackground: tintedCard,
    inputBackground: mixColors(lightTheme.primary, BASE_DARK, 0.82), // Slightly lighter than card
    
    // Text
    text: tintedText,
    textSecondary: tintedTextSec,
    textTertiary: '#525252',
    
    // UI Elements
    border: tintedBorder,
    placeholderBg: mixColors(lightTheme.primary, BASE_DARK, 0.80),
    
    // Tags should be dark but colorful
    tagBg: mixColors(lightTheme.primary, BASE_DARK, 0.70),
    tagText: tintedText,
    
    // Skeleton (Loading states)
    skeletonBase: mixColors(lightTheme.primary, BASE_DARK, 0.85),
    skeletonHighlight: mixColors(lightTheme.primary, BASE_DARK, 0.75),
    
    // Stars
    starEmpty: tintedBorder,
    
    // Keep the FAB popping
    fabIcon: '#FFFFFF', 
  };
};
