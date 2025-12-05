import { Alert } from 'react-native';
import { isValidUrl, isValidImageUrl, isValidLocalUri } from '../../../utils/helpers';

interface FormState {
  title: string;
  trackingType: string;
  totalPages: string;
  totalChapters: string;
  seriesOrder: string;
  publicationYear: string;
  bookUrl: string;
  coverUrl: string;
}

const validateForm = (formState: FormState): boolean => {
  if (!formState.title.trim()) {
    Alert.alert("Error", "Please enter a book title.");
    return false;
  }

  if (formState.trackingType === 'pages' && formState.totalPages) {
    const pages = parseInt(formState.totalPages, 10);
    if (isNaN(pages) || pages <= 0) {
      Alert.alert("Error", "Total pages must be a positive number.");
      return false;
    }
    if (pages > 100000) {
      Alert.alert("Error", "Total pages seems too high. Please check the number.");
      return false;
    }
  }

  if (formState.trackingType === 'chapters' && formState.totalChapters) {
    const chapters = parseInt(formState.totalChapters, 10);
    if (isNaN(chapters) || chapters <= 0) {
      Alert.alert("Error", "Total chapters must be a positive number.");
      return false;
    }
  }

  if (formState.seriesOrder) {
    const order = parseFloat(formState.seriesOrder);
    if (isNaN(order) || order <= 0) {
      Alert.alert("Error", "Series order must be a positive number (can be decimal like 1.5).");
      return false;
    }
  }

  if (formState.publicationYear) {
    const year = parseInt(formState.publicationYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1000 || year > currentYear + 5) {
      Alert.alert("Error", `Publication year must be between 1000 and ${currentYear + 5}.`);
      return false;
    }
  }

  if (formState.bookUrl && formState.bookUrl.trim()) {
    if (!isValidUrl(formState.bookUrl.trim())) {
      Alert.alert("Error", "Please enter a valid URL (e.g., https://example.com)");
      return false;
    }
  }

  if (formState.coverUrl && formState.coverUrl.trim()) {
    const trimmedUrl = formState.coverUrl.trim();
    
    if (isValidLocalUri(trimmedUrl)) {
      return true;
    }
    
    if (!isValidImageUrl(trimmedUrl)) {
      Alert.alert(
        "Invalid Image URL", 
        "The cover image URL appears to be invalid or unsafe. Please use a valid image URL (http:// or https://)."
      );
      return false;
    }
  }

  return true;
};

export default validateForm;