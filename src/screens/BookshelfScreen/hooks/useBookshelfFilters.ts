import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from '../../../hooks';
import { Book } from '../../../types';
import { applyFiltersAndSort } from '../../../utils/filterUtils';

interface InitialFilters {
  sortBy?: string;
  searchQuery?: string;
  selectedTags?: string[];
  matchAllTags?: boolean;
  selectedFormats?: string[];
  selectedStatuses?: string[];
  minPages?: string;
  maxPages?: string;
}

export const useBookshelfFilters = (allBooks: Book[], seriesFilter: string | null, initialFilters: InitialFilters | null = null) => {
  // Default state: recent_desc (newest first), no filters
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'recent_desc');
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialFilters?.searchQuery || '');
  
  // All filters default to empty/false
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.selectedTags || []);
  const [matchAllTags, setMatchAllTags] = useState<boolean>(initialFilters?.matchAllTags ?? false); // Changed to false
  const [selectedFormats, setSelectedFormats] = useState<string[]>(initialFilters?.selectedFormats || []);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters?.selectedStatuses || []);
  const [minPages, setMinPages] = useState<string>(initialFilters?.minPages || '');
  const [maxPages, setMaxPages] = useState<string>(initialFilters?.maxPages || '');

  const debouncedSetSearchQuery = useCallback(
    useDebounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSetSearchQuery(searchQuery);
  }, [searchQuery, debouncedSetSearchQuery]);

  const filteredBooks = useMemo(() => {
    return applyFiltersAndSort(allBooks, {
      sortBy,
      searchQuery: debouncedSearchQuery,
      selectedTags,
      matchAllTags,
      selectedFormats,
      selectedStatuses,
      minPages,
      maxPages,
      seriesFilter
    });
  }, [allBooks, debouncedSearchQuery, selectedTags, matchAllTags, selectedFormats, selectedStatuses, minPages, maxPages, seriesFilter, sortBy]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allBooks.forEach(book => {
      if (book.tags) {
        // Handle both string (comma-separated) and array formats
        if (typeof book.tags === 'string') {
          const tags = book.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
          tags.forEach(tag => tagSet.add(tag));
        } else if (Array.isArray(book.tags)) {
          book.tags.forEach((tag: string) => { 
            if (tag && tag.trim()) tagSet.add(tag.trim()); 
          });
        }
      }
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [allBooks]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedTags.length > 0) count++;
    if (selectedFormats.length > 0) count++;
    if (selectedStatuses.length > 0) count++;
    if (minPages !== '' || maxPages !== '') count++;
    return count;
  }, [selectedTags, selectedFormats, selectedStatuses, minPages, maxPages]);

  const handleClearFilters = useCallback(() => {
    // Reset everything to default state
    setSortBy('recent_desc'); // Keep sort order as recent, newest first
    setSelectedTags([]);
    setSelectedFormats([]);
    setSelectedStatuses([]);
    setMinPages('');
    setMaxPages('');
    setMatchAllTags(false); // Reset to OR logic
    // Don't reset search query - user might want to keep searching
  }, []);

  return {
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    matchAllTags,
    setMatchAllTags,
    selectedFormats,
    setSelectedFormats,
    selectedStatuses,
    setSelectedStatuses,
    minPages,
    setMinPages,
    maxPages,
    setMaxPages,
    filteredBooks,
    allTags,
    activeFiltersCount,
    handleClearFilters
  };
};
