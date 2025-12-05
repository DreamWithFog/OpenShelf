import { useMemo } from 'react';
import { Book, DisplayItem } from '../../../types/books';

export const useBookshelfDisplay = (filteredBooks: Book[], sortBy: string, seriesFilter: string | null): { displayItems: DisplayItem[] } => {
  const displayItems = useMemo((): DisplayItem[] => {
    if (seriesFilter) {
      // When viewing a specific series, just return the books in that series
      return filteredBooks.map(book => ({ ...book, isSeries: false }));
    }

    // 1. Group books into Series vs Standalone
    const seriesMap = new Map<string, Book[]>();
    const standaloneBooks: DisplayItem[] = [];

    filteredBooks.forEach(book => {
      if (book.seriesName && book.seriesName.trim() && book.collectionType !== 'standalone') {
        const seriesName = book.seriesName.trim();
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, []);
        }
        seriesMap.get(seriesName)!.push(book);
      } else {
        standaloneBooks.push({ ...book, isSeries: false });
      }
    });

    // 2. Create Series Display Items
    const seriesItems: DisplayItem[] = Array.from(seriesMap.entries()).map(([seriesName, books]) => {
      // Sort books inside the series by volume/order
      const sortedBooks = books.sort((a, b) => {
        const orderA = a.seriesOrder ?? a.volumeNumber ?? 0;
        const orderB = b.seriesOrder ?? b.volumeNumber ?? 0;
        return (orderA as number) - (orderB as number);
      });

      const firstBook = sortedBooks[0];
      const collectionType = firstBook?.collectionType || 'series';
      
      const totalInCollection = collectionType === 'volume' 
        ? (firstBook?.totalVolumes || null)
        : (firstBook?.totalInSeries || null);
      
      // Use first book's properties for consistent sorting
      return {
        id: 'series-' + seriesName,
        isSeries: true,
        seriesName: seriesName,
        books: sortedBooks,
        volumeCount: sortedBooks.length,
        totalInCollection: totalInCollection,
        collectionType: collectionType,
        coverUrl: firstBook?.seriesCoverUrl || firstBook?.coverUrl || '',
        title: seriesName, // Use series name as title
        author: firstBook?.author || '',
        status: collectionType === 'volume' ? 'Volumes' : collectionType === 'collection' ? 'Collection' : 'Series',
        rating: firstBook?.rating || 0,
        updatedAt: firstBook?.updatedAt || '',
        createdAt: firstBook?.createdAt || '',
      };
    });

    // 3. Combine everything
    let combined: DisplayItem[] = [...seriesItems, ...standaloneBooks];
    
    // 4. Apply sorting based on sortBy parameter
    const sortParts = sortBy.split('_');
    const sortKey = sortParts[0];
    const sortDir = sortParts[1] || 'desc';
    const isAsc = sortDir === 'asc';

    switch (sortKey) {
      case 'title':
        combined.sort((a, b) => {
          const valA = (a.title || '').toLowerCase();
          const valB = (b.title || '').toLowerCase();
          const comparison = valA.localeCompare(valB);
          return isAsc ? comparison : -comparison;
        });
        break;
      
      case 'author':
        combined.sort((a, b) => {
          const valA = (a.author || '').toLowerCase();
          const valB = (b.author || '').toLowerCase();
          const comparison = valA.localeCompare(valB);
          return isAsc ? comparison : -comparison;
        });
        break;
      
      case 'rating':
        combined.sort((a, b) => {
          const valA = a.rating || 0;
          const valB = b.rating || 0;
          const diff = valA - valB;
          return isAsc ? diff : -diff;
        });
        break;

      case 'recent':
      default:
        combined.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt || '1970-01-01';
          const dateB = b.updatedAt || b.createdAt || '1970-01-01';
          const comparison = dateB.localeCompare(dateA);
          return isAsc ? -comparison : comparison;
        });
        break;
    }

    return combined;
  }, [filteredBooks, sortBy, seriesFilter]);

  return { displayItems };
};
