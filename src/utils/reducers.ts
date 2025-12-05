import { Book, FormState } from '../types';

export const initialBookState: FormState = {
  title: '',
  author: '',
  coverUrl: '',
  status: 'Unfinished',
  rating: 0,
  totalPages: 0,
  currentPage: 0,
  bookUrl: '',
  tags: [],
  tempTags: [],
  isbn: '',
  format: 'Physical',
  publisher: '',
  publicationYear: '',
  language: 'English',
  originalLanguage: '',
  seriesName: '',
  seriesOrder: '',
  volumeNumber: '',
  totalVolumes: '',
  totalChapters: '',
  currentChapter: 0,
  trackingType: 'pages',
  collectionType: 'standalone',
  seriesCoverUrl: '',
  totalInSeries: '',
  tempStatus: 'Unfinished',
  tempRating: 0,
};

export type BookAction = 
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'SET_BOOK'; book: Book }
  | { type: 'ADD_TAG'; tag: string }
  | { type: 'REMOVE_TAG'; tag: string }
  | { type: 'RESET' };

export const bookReducer = (state: FormState, action: BookAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    
    case 'SET_BOOK':
      return {
        ...state,
        title: action.book.title,
        author: action.book.author || '',
        coverUrl: action.book.coverUrl || '',
        status: action.book.status || 'Unfinished',
        rating: action.book.rating || 0,
        totalPages: action.book.totalPages || 0,
        currentPage: action.book.currentPage || 0,
        bookUrl: action.book.bookUrl || '',
        isbn: action.book.isbn || '',
        format: action.book.format || 'Physical',
        publisher: action.book.publisher || '',
        publicationYear: action.book.publicationYear || '',
        language: action.book.language || 'English',
        originalLanguage: action.book.originalLanguage || '',
        seriesName: action.book.seriesName || '',
        seriesOrder: action.book.seriesOrder ? String(action.book.seriesOrder) : '',
        volumeNumber: action.book.volumeNumber ? String(action.book.volumeNumber) : '',
        totalVolumes: action.book.totalVolumes ? String(action.book.totalVolumes) : '',
        totalChapters: action.book.totalChapters ? String(action.book.totalChapters) : '',
        currentChapter: action.book.currentChapter || 0,
        trackingType: action.book.trackingType || 'pages',
        collectionType: action.book.collectionType || 'standalone',
        seriesCoverUrl: action.book.seriesCoverUrl || '',
        totalInSeries: action.book.totalInSeries ? String(action.book.totalInSeries) : '',
        tempTags: Array.isArray(action.book.tags) ? action.book.tags : [],
        tags: Array.isArray(action.book.tags) ? action.book.tags : [],
        tempStatus: action.book.status || 'Unfinished',
        tempRating: action.book.rating || 0,
      };

    case 'ADD_TAG':
      if (state.tempTags.includes(action.tag)) return state;
      return { ...state, tempTags: [...state.tempTags, action.tag] };

    case 'REMOVE_TAG':
      return { ...state, tempTags: state.tempTags.filter(t => t !== action.tag) };

    case 'RESET':
      return initialBookState;

    default:
      return state;
  }
};
