import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native';
import { STATUS_COLORS } from '../../constants';
import CustomTag from '../common/CustomTag';
import { formatDate } from '../../utils/helpers';
import { Book } from '../../types';

interface Theme {
  cardBackground: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  placeholderBg: string;
  starColor: string;
  starEmpty: string;
  selectedTag: string;
  tagBg: string;
  border: string;
  tagText: string;
}

interface BookPreviewModalProps {
  visible: boolean;
  book: Book | null;
  onClose: () => void;
  theme: Theme;
}

const BookPreviewModal: React.FC<BookPreviewModalProps> = ({ visible, book, onClose, theme }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);
  
  if (!book) return null;
  
  const statusColor = STATUS_COLORS[book?.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.None;
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.previewOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.previewModal, 
            { 
              backgroundColor: theme.cardBackground,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={2}>
              {book?.title || 'Untitled'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.previewContent}>
            {book?.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.previewCover} />
            ) : (
              <View style={[styles.previewCover, { backgroundColor: theme.placeholderBg }]}>
                <Text style={{ fontSize: 40 }}>Book</Text>
              </View>
            )}
            
            <View style={styles.previewDetails}>
              <Text style={[styles.previewAuthor, { color: theme.textSecondary }]}>
                By: {book?.author || 'Unknown Author'}
              </Text>
              
              <View style={styles.previewStatusContainer}>
                <View style={[styles.previewStatusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.previewStatusText}>{book?.status || 'None'}</Text>
                </View>
                
                {(book?.status === 'Finished' || book?.status === 'Abandoned') && book?.rating && book.rating > 0 && (
                  <View style={styles.previewRating}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Text key={index} style={{ fontSize: 16, color: index < book.rating! ? theme.starColor : theme.starEmpty }}>
                        {index < book.rating! ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Página actual / total (si hay páginas totales) */}
              {book?.totalPages && book.totalPages > 0 && (
                <Text style={[styles.previewProgress, { color: theme.textSecondary }]}>
                  Pages: {book?.currentPage ? `${book.currentPage} / ` : ''}{book.totalPages}
                </Text>
              )}
              
              {/* URL del libro */}
              {book?.bookUrl && (
                <View style={{ marginTop: 4 }}>
                  <Text style={[styles.previewMetaLabel, { color: theme.textTertiary }]}>
                    URL:
                  </Text>
                  <Text style={[styles.previewMetaValue, { color: theme.text, textDecorationLine: 'underline' }]} numberOfLines={1}>
                    {book.bookUrl}
                  </Text>
                </View>
              )}

              {/* Fecha de creación/actualización */}
              {book?.createdAt && (
                <View style={{ marginTop: 4 }}>
                  <Text style={[styles.previewMetaLabel, { color: theme.textTertiary }]}>
                    Added:
                  </Text>
                  <Text style={[styles.previewMetaValue, { color: theme.text }]}>
                    {formatDate(new Date(book.createdAt))}
                  </Text>
                </View>
              )}
              
              {book?.updatedAt && (
                <View style={{ marginTop: 4 }}>
                  <Text style={[styles.previewMetaLabel, { color: theme.textTertiary }]}>
                    Updated:
                  </Text>
                  <Text style={[styles.previewMetaValue, { color: theme.text }]}>
                    {formatDate(new Date(book.updatedAt))}
                  </Text>
                </View>
              )}
              
              {/* Tags */}
              {book?.tags && book.tags.length > 0 && (
                <View style={styles.previewTagsContainer}>
                  <Text style={[styles.previewMetaLabel, { color: theme.textTertiary, marginBottom: 4 }]}>
                    Tags:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {book.tags.slice(0, 5).map((tag: string, idx: number) => (
                      <CustomTag
                        key={idx}
                        tag={tag}
                        selected={false}
                        theme={theme}
                      />
                    ))}
                    {book.tags.length > 5 && (
                      <Text style={[styles.previewMoreTags, { color: theme.textSecondary }]}>
                        +{book.tags.length - 5} more
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  previewContent: {
    flexDirection: 'row',
  },
  previewCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewDetails: {
    flex: 1,
    marginLeft: 16,
  },
  previewAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  previewStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  previewStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewRating: {
    flexDirection: 'row',
  },
  previewProgress: {
    fontSize: 12,
    marginBottom: 8,
  },
  previewMetaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewMetaValue: {
    fontSize: 12,
  },
  previewTagsContainer: {
    marginTop: 8,
  },
  previewMoreTags: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default BookPreviewModal;