import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomStarRating } from '../common/StarRating';
import { STATUS_COLORS } from '../../constants';
import { Book } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = 32; 
const COMPACT_COLUMNS = 3;
const GRID_COLUMNS = 2;

const COMPACT_ITEM_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING - (8 * COMPACT_COLUMNS)) / COMPACT_COLUMNS;
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING - (8 * GRID_COLUMNS)) / GRID_COLUMNS;
const LIST_ITEM_WIDTH = SCREEN_WIDTH - CONTAINER_PADDING;

interface BookItemProps {
  book: Book & { isSeries?: boolean; seriesName?: string; };
  theme: {
    cardBackground: string;
    placeholderBg: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
  };
  onPress: () => void;
  onLongPress?: () => void;
  viewMode?: 'grid' | 'list' | 'compact' | 'cardStack';
  showProgress?: boolean;
}

const BookItem = memo(({ 
  book, 
  theme, 
  onPress,
  onLongPress,
  viewMode = 'grid',
  showProgress = true 
}: BookItemProps) => {
  const pagesRead = book.currentPage || 0;
  const totalPages = book.totalPages || 0;
  const progress = totalPages > 0 ? (pagesRead / totalPages) * 100 : 0;

  // Grid view
  if (viewMode === 'grid') {
    return (
      <TouchableOpacity
        style={[styles.gridCard, { backgroundColor: theme.cardBackground, width: GRID_ITEM_WIDTH }]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        {book.coverUrl || book.coverPath ? (
          <Image 
            source={{ uri: book.coverPath || book.coverUrl }} 
            style={styles.gridCover}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.gridCover, styles.placeholderCover, { backgroundColor: theme.placeholderBg }]}>
             <MaterialIcons name="menu-book" size={48} color={theme.textSecondary} />
          </View>
        )}
        
        <View style={styles.gridInfo}>
          <Text style={[styles.gridTitle, { color: theme.text }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[styles.gridAuthor, { color: theme.textSecondary }]} numberOfLines={1}>
            {book.author || 'Unknown Author'}
          </Text>
          
          {showProgress && totalPages > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: STATUS_COLORS[book.status as keyof typeof STATUS_COLORS] || theme.primary 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {pagesRead}/{totalPages}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // List view
  if (viewMode === 'list') {
    const statusColor = STATUS_COLORS[book.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.None;
    
    return (
      <TouchableOpacity
        style={[
          styles.listCard, 
          { 
            backgroundColor: theme.cardBackground,
            width: LIST_ITEM_WIDTH 
          }
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        {book.coverUrl || book.coverPath ? (
          <Image 
            source={{ uri: book.coverPath || book.coverUrl }} 
            style={styles.listCover}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.listCover, styles.placeholderCover, { backgroundColor: theme.placeholderBg }]}>
            <MaterialIcons name="menu-book" size={32} color={theme.textSecondary} />
          </View>
        )}
        
        <View style={styles.listContent}>
          <View>
            <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.listAuthor, { color: theme.textSecondary }]} numberOfLines={1}>
              {book.author || 'Unknown Author'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <View style={{
              backgroundColor: statusColor,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10,
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                {book.status || 'None'}
              </Text>
            </View>
            
            {book.status === 'Reading' && totalPages > 0 ? (
              <Text style={{ color: theme.textSecondary, fontSize: 10 }}>
                {pagesRead}/{totalPages} pages
              </Text>
            ) : null}
            
            {book.rating && book.rating > 0 ? (
              <CustomStarRating 
                rating={book.rating} 
                size={12}
              />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Compact view
  if (viewMode === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: theme.cardBackground, width: COMPACT_ITEM_WIDTH }]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        {book.coverUrl || book.coverPath ? (
          <Image 
            source={{ uri: book.coverPath || book.coverUrl }} 
            style={styles.compactCover}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.compactCover, { backgroundColor: theme.placeholderBg, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: theme.text, fontSize: 12, textAlign: 'center', padding: 8 }} numberOfLines={3}>
              {book.title || 'Untitled'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return null;
}, (prevProps, nextProps) => {
  return (
    prevProps.book.id === nextProps.book.id &&
    prevProps.book.currentPage === nextProps.book.currentPage &&
    prevProps.book.title === nextProps.book.title &&
    prevProps.book.rating === nextProps.book.rating &&
    prevProps.theme === nextProps.theme &&
    prevProps.viewMode === nextProps.viewMode
  );
});

const styles = StyleSheet.create({
  gridCard: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 4,
    height: 250,
  },
  gridCover: {
    width: '100%',
    aspectRatio: 2/3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridInfo: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gridAuthor: {
    fontSize: 12,
    marginBottom: 8,
  },
  
  listCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12, 
    padding: 12,
    height: 144,
  },
  listCover: {
    width: 60,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  listProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listProgressText: {
    fontSize: 12,
    minWidth: 60,
  },
  
  compactCard: {
    borderRadius: 8,
    overflow: 'hidden',
    margin: 2,
    height: 180,
  },
  compactCover: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  compactInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  compactTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  compactAuthor: {
    fontSize: 8,
    color: '#fff',
    opacity: 0.8,
  },
  
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    marginTop: 4,
  },
});

BookItem.displayName = 'BookItem';

export default BookItem;
