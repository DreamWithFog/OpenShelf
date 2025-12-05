import { applyFiltersAndSort, FilterConfig } from '../filterUtils';
import { Book } from '../../types';

// Mock Data
const mockBooks: Book[] = [
  { id: 1, title: 'Apple', author: 'Author A', rating: 5, tags: ['Sci-Fi'], status: 'Reading', totalPages: 100, updatedAt: '2023-01-01' },
  { id: 2, title: 'Banana', author: 'Author B', rating: 3, tags: ['Sci-Fi', 'Fantasy'], status: 'Finished', totalPages: 200, updatedAt: '2023-01-02' },
  { id: 3, title: 'Cherry', author: 'Author C', rating: 4, tags: ['Fantasy'], status: 'Unfinished', totalPages: 300, updatedAt: '2023-01-03' },
] as Book[];

// Default Config Helper
const defaultConfig: FilterConfig = {
  sortBy: 'recent_desc',
  searchQuery: '',
  selectedTags: [],
  matchAllTags: true,
  selectedFormats: [],
  selectedStatuses: [],
  minPages: '',
  maxPages: '',
  seriesFilter: null
};

describe('Filter & Sort Logic', () => {

  test('Sorting: Title Ascending (A-Z)', () => {
    const result = applyFiltersAndSort(mockBooks, { ...defaultConfig, sortBy: 'title_asc' });
    expect(result[0].title).toBe('Apple');
    expect(result[2].title).toBe('Cherry');
  });

  test('Sorting: Title Descending (Z-A)', () => {
    const result = applyFiltersAndSort(mockBooks, { ...defaultConfig, sortBy: 'title_desc' });
    expect(result[0].title).toBe('Cherry');
    expect(result[2].title).toBe('Apple');
  });

  test('Sorting: Rating Descending (High to Low)', () => {
    const result = applyFiltersAndSort(mockBooks, { ...defaultConfig, sortBy: 'rating_desc' });
    expect(result[0].rating).toBe(5); // Apple
    expect(result[1].rating).toBe(4); // Cherry
    expect(result[2].rating).toBe(3); // Banana
  });

  test('Filter: Status', () => {
    const result = applyFiltersAndSort(mockBooks, { ...defaultConfig, selectedStatuses: ['Reading'] });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Apple');
  });

  test('Filter: Page Range', () => {
    // Books with pages >= 200 (Banana 200, Cherry 300)
    const result = applyFiltersAndSort(mockBooks, { ...defaultConfig, minPages: '200' });
    expect(result.length).toBe(2);
    expect(result.find(b => b.title === 'Apple')).toBeUndefined();
  });

  test('Tag Logic: OR (Union)', () => {
    // Show books that are Sci-Fi OR Fantasy (All 3 books)
    const result = applyFiltersAndSort(mockBooks, { 
      ...defaultConfig, 
      selectedTags: ['Sci-Fi', 'Fantasy'],
      matchAllTags: false // OR Logic
    });
    expect(result.length).toBe(3);
  });

  test('Tag Logic: AND (Intersection)', () => {
    // Show books that are Sci-Fi AND Fantasy (Only Banana)
    const result = applyFiltersAndSort(mockBooks, { 
      ...defaultConfig, 
      selectedTags: ['Sci-Fi', 'Fantasy'],
      matchAllTags: true // AND Logic
    });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Banana');
  });
  
  test('Search: Fuzzy Match', () => {
    const result = applyFiltersAndSort(mockBooks, { ...defaultConfig, searchQuery: 'Author B' });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Banana');
  });

});
