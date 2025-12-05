import { Book } from '../types';

export interface FilterConfig {
  sortBy: string;
  searchQuery: string;
  selectedTags: string[];
  matchAllTags: boolean;
  selectedFormats: string[];
  selectedStatuses: string[];
  minPages: string;
  maxPages: string;
  seriesFilter: string | null;
}

export const applyFiltersAndSort = (allBooks: Book[], config: FilterConfig): Book[] => {
  let filtered = [...allBooks];
  
  // 1. Search Terms Parsing
  const searchTerms = config.searchQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);

  // A. Series Context - filter to series but DON'T return early
  if (config.seriesFilter) {
    filtered = filtered.filter(book => book.seriesName === config.seriesFilter);
  }

  // B. Search Query - ALWAYS apply if there are search terms
  if (searchTerms.length > 0) {
    filtered = filtered.filter(book => {
      const title = (book.title || '').toLowerCase();
      const author = (book.author || '').toLowerCase();
      const series = (book.seriesName || '').toLowerCase();
      
      // When inside a series, search primarily by title and series order
      // This prevents ISBN numbers from interfering with searches like "book 2"
      if (config.seriesFilter) {
        const seriesOrder = book.seriesOrder ? book.seriesOrder.toString() : '';
        const volumeNumber = book.volumeNumber ? book.volumeNumber.toString() : '';
        const searchableText = title + ' ' + seriesOrder + ' ' + volumeNumber;
        return searchTerms.every(term => searchableText.includes(term));
      }
      
      // Outside of series, search all fields
      const isbn = (book.isbn || '').toLowerCase();
      const searchableText = title + ' ' + author + ' ' + isbn + ' ' + series;
      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // C. Format Filter - only apply if formats selected
  if (config.selectedFormats.length > 0) {
    filtered = filtered.filter(book => config.selectedFormats.includes(book.format || 'Physical'));
  }

  // D. Status Filter - only apply if statuses selected
  if (config.selectedStatuses.length > 0) {
    filtered = filtered.filter(book => config.selectedStatuses.includes(book.status || 'Unfinished'));
  }

  // E. Page Range Filter - only apply if values provided
  const min = parseInt(config.minPages, 10);
  const max = parseInt(config.maxPages, 10);
  if (!isNaN(min)) {
    filtered = filtered.filter(book => (book.totalPages || 0) >= min);
  }
  if (!isNaN(max)) {
    filtered = filtered.filter(book => (book.totalPages || 0) <= max);
  }

  // F. Tag Filter - only apply if tags selected
  if (config.selectedTags.length > 0) {
    filtered = filtered.filter(book => {
      if (!book.tags) return false;
      
      // Parse tags: handle both string and array formats
      let bookTags: string[];
      if (typeof book.tags === 'string') {
        bookTags = book.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      } else if (Array.isArray(book.tags)) {
        bookTags = book.tags;
      } else {
        return false;
      }
      
      if (config.matchAllTags) {
        return config.selectedTags.every(tag => bookTags.includes(tag));
      } else {
        return config.selectedTags.some(tag => bookTags.includes(tag));
      }
    });
  }

  // G. Sorting Logic
  // If inside a series, default sort by volume order
  if (config.seriesFilter) {
    filtered.sort((a, b) => {
      const orderA = a.seriesOrder ?? a.volumeNumber ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.seriesOrder ?? b.volumeNumber ?? Number.MAX_SAFE_INTEGER;
      return (orderA as number) - (orderB as number);
    });
    return filtered;
  }

  // Otherwise use the sortBy parameter
  const sortParts = config.sortBy.split('_');
  const sortKey = sortParts[0];
  const sortDir = sortParts[1] || 'desc';
  const isAsc = sortDir === 'asc';

  switch (sortKey) {
    case 'title':
      filtered.sort((a, b) => {
        const valA = (a.title || '').toLowerCase();
        const valB = (b.title || '').toLowerCase();
        const comparison = valA.localeCompare(valB);
        return isAsc ? comparison : -comparison;
      });
      break;
    
    case 'author':
      filtered.sort((a, b) => {
        const valA = (a.author || '').toLowerCase();
        const valB = (b.author || '').toLowerCase();
        const comparison = valA.localeCompare(valB);
        return isAsc ? comparison : -comparison;
      });
      break;
    
    case 'rating':
      filtered.sort((a, b) => {
        const valA = a.rating || 0;
        const valB = b.rating || 0;
        const diff = valA - valB;
        return isAsc ? diff : -diff;
      });
      break;

    case 'recent':
    default:
      filtered.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || '1970-01-01';
        const dateB = b.updatedAt || b.createdAt || '1970-01-01';
        const comparison = dateB.localeCompare(dateA);
        return isAsc ? -comparison : comparison;
      });
      break;
  }

  return filtered;
};
