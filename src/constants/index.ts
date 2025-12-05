export const STATUS_OPTIONS: string[] = ['Unfinished', 'Reading', 'Finished', 'Want to Read', 'DNF'];

// FIX: Removed duplicate CAROUSEL (STACK and CAROUSEL are the same view)
export const GRID_VIEWS = {
  COMFORTABLE: 'comfortable',
  COMPACT: 'compact',
  DETAILED: 'detailed',
  STACK: 'stack',
} as const;

// FIX: Removed CAROUSEL entry
export const ITEM_HEIGHTS = {
  [GRID_VIEWS.COMFORTABLE]: 250,
  [GRID_VIEWS.COMPACT]: 180,
  [GRID_VIEWS.DETAILED]: 144,
  [GRID_VIEWS.STACK]: 400,
} as const;

// Enhanced status colors for better distinction
export const STATUS_COLORS = {
  'Finished': '#10B981',      // Emerald green - success/complete
  'Reading': '#3B82F6',        // Blue - active/in-progress  
  'Want to Read': '#F59E0B',   // Amber - pending/wishlist
  'Unfinished': '#8B5CF6',    // Purple - paused/on-hold
  'DNF': '#EF4444',            // Red - abandoned
  'Abandoned': '#6B7280',      // Gray
  'None': '#9CA3AF',           // Light gray
} as const;

// Status colors for dark mode (brighter variants)
export const STATUS_COLORS_DARK = {
  'Finished': '#34D399',       // Brighter emerald
  'Reading': '#60A5FA',        // Brighter blue
  'Want to Read': '#FCD34D',   // Brighter amber  
  'Unfinished': '#A78BFA',     // Brighter purple
  'DNF': '#F87171',            // Brighter red
  'Abandoned': '#9CA3AF',      // Brighter gray
  'None': '#D1D5DB',           // Light gray
} as const;

export const BOOK_FORMATS: string[] = ['Physical', 'Ebook', 'Audiobook', 'Webpage'];

export const TRACKING_TYPES = [
  { value: 'pages', label: 'Pages' },
  { value: 'chapters', label: 'Chapters' },
] as const;

export const COMMON_LANGUAGES: string[] = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Japanese',
  'Chinese',
  'Korean',
  'Arabic',
  'Hindi',
  'Bengali',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Turkish',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Other'
];

export const COLLECTION_TYPES = [
  { 
    value: 'standalone', 
    label: 'Standalone Book', 
    icon: 'book', 
    description: 'A single book that is not part of a series.' 
  },
  { 
    value: 'series', 
    label: 'Part of Series', 
    icon: 'library', 
    description: 'A book that belongs to a larger series of books.' 
  },
  { 
    value: 'volume', 
    label: 'Volume/Manga', 
    icon: 'layers', 
    description: 'A numbered volume of an story (manga, light novels, etc.)' 
  },
  { 
    value: 'collection', 
    label: 'Collection/Anthology', 
    icon: 'grid', 
    description: 'A single work within a larger published collection or anthology.' 
  },
] as const;

export const LIGHT_THEMES = [
  { key: 'light', name: 'Light' },
  { key: 'emerald', name: 'Emerald' },
  { key: 'roseGold', name: 'Rose Gold' },
  { key: 'ocean', name: 'Ocean' },
  { key: 'sunset', name: 'Sunset' },
  { key: 'purple', name: 'Purple' },
  { key: 'cherry', name: 'Cherry' },
  { key: 'sapphire', name: 'Sapphire' },
  { key: 'peach', name: 'Peach' },
  { key: 'turquoise', name: 'Turquoise' },
  { key: 'vanilla', name: 'Vanilla' },
  { key: 'charcoal', name: 'Charcoal' },
  { key: 'goldenHour', name: 'Golden Hour' },
  { key: 'arctic', name: 'Arctic' },
  { key: 'crimson', name: 'Crimson' },
  { key: 'lavender', name: 'Lavender' },
  { key: 'mint', name: 'Mint' },
  { key: 'coral', name: 'Coral' },
  { key: 'beige', name: 'Beige' },
  { key: 'lime', name: 'Lime' },
  { key: 'indigo', name: 'Indigo' },
  { key: 'steel', name: 'Steel' },
  { key: 'magenta', name: 'Magenta' },
  { key: 'pine', name: 'Pine' },
  { key: 'amber', name: 'Amber' },
  { key: 'slate', name: 'Slate' },
  { key: 'wine', name: 'Wine' },
  { key: 'electric', name: 'Electric' },
  { key: 'copper', name: 'Copper' },
  { key: 'lilac', name: 'Lilac' },
  { key: 'sage', name: 'Sage' },
];

export const DARK_THEMES = [
  { key: 'dark', name: 'Dark' },
  { key: 'midnight', name: 'Midnight' },
  { key: 'midnightPurple', name: 'Midnight Purple' },
  { key: 'darkEmerald', name: 'Dark Emerald' },
  { key: 'darkRose', name: 'Dark Rose' },
  { key: 'darkOcean', name: 'Dark Ocean' },
];
