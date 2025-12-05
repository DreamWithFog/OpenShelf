import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { GRID_VIEWS, ITEM_HEIGHTS } from '../../constants';
import {
  EmptyState,
  BookSkeleton,
  BookPreviewModal
} from '../../components';
import {
  BookItem,
  FloatingActionButton,
  CardStackView,
  BookSpotlight,
  MultiBookSpotlight
} from '../../components/book';
import { globalStyles } from '../../styles/globalStyles';

import { useBookshelfFilters, useBookshelfDisplay, useBookshelf } from './hooks';
import { SearchBar, SeriesHeader, Header, FilterModal, BulkActionsModal } from './components';
import { renderSeriesItem, getItemLayout } from './utils/renderHelpers';
import { Book, RootStackParamList, DisplayItem } from '../../types';

interface SavedFilters {
  sortBy?: string;
  searchQuery?: string;
  selectedTags?: string[];
  matchAllTags?: boolean;
  selectedFormats?: string[];
  selectedStatuses?: string[];
  minPages?: string;
  maxPages?: string;
}

let savedFilters: SavedFilters | null = null;
let savedScrollOffset: number = 0;

type BookshelfScreenProps = NativeStackScreenProps<RootStackParamList, 'My Bookshelf'>;

const BookshelfScreen: React.FC<BookshelfScreenProps> = ({ navigation, route }) => {
  const {
    theme,
    gridView,
    activeSession,
    seriesFilter,
    isSelectionMode,
    setIsSelectionMode,
    selectedBooks,
    setSelectedBooks,
    showBulkActions,
    setShowBulkActions,
    previewBook,
    setPreviewBook,
    showPreview,
    setShowPreview,
    spotlightBook,
    showSpotlight,
    spotlightBooks,
    showMultiSpotlight,
    allBooks,
    isLoading,
    isRefreshing,
    toggleSelectionMode,
    handleBulkAction,
    handleSpotlightComplete,
    handleMultiBookSpotlightComplete,
    handleRefresh,
    handleBookPress,
    handleBookLongPress,
    handleBackFromSeries,
  } = useBookshelf(navigation, route);

  const insets = useSafeAreaInsets();
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const scrollOffsetRef = useRef<number>(savedScrollOffset);

  const {
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
  } = useBookshelfFilters(allBooks, seriesFilter, savedFilters);

  const { displayItems } = useBookshelfDisplay(
    filteredBooks,
    sortBy,
    seriesFilter
  );

  const selectableItems = isSelectionMode
    ? displayItems.filter((item: DisplayItem) => !item.isSeries)
    : displayItems;

  const currentGridView = isSelectionMode ? GRID_VIEWS.COMPACT : gridView;

  // Save filters when they change
  useEffect(() => {
    savedFilters = {
      sortBy,
      searchQuery,
      selectedTags,
      matchAllTags,
      selectedFormats,
      selectedStatuses,
      minPages,
      maxPages
    };
  }, [sortBy, searchQuery, selectedTags, matchAllTags, selectedFormats, selectedStatuses, minPages, maxPages]);

  // Restore scroll position when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (flatListRef.current && scrollOffsetRef.current > 0 && !isLoading) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: scrollOffsetRef.current,
            animated: false
          });
        }, 100);
      }
    }, [isLoading])
  );

  // Handle scroll events to save position
  const handleScroll = useCallback((event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    scrollOffsetRef.current = offset;
    savedScrollOffset = offset;
  }, []);

  const renderBookItem = useCallback(({ item }: { item: DisplayItem }) => {
    if (item.isSeries) {
      return renderSeriesItem(item, currentGridView, theme, handleBookPress, GRID_VIEWS, ITEM_HEIGHTS);
    }

    const isSelected = selectedBooks.some((b: Book) => b.id === item.id);

    const viewMode = currentGridView === GRID_VIEWS.COMPACT ? 'compact' :
      currentGridView === GRID_VIEWS.DETAILED ? 'list' :
        'grid';

    return (
      <View style={{ position: 'relative' }}>
        <BookItem
          book={item}
          theme={theme}
          viewMode={viewMode}
          onPress={() => handleBookPress(item)}
          onLongPress={() => handleBookLongPress(item)} // Added long press handler
        />

        {isSelectionMode && (
          <View style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: isSelected ? theme.primary : 'rgba(255,255,255,0.9)',
            borderWidth: 2,
            borderColor: isSelected ? theme.primary : theme.border,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 3,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}>
            {isSelected && (
              <Feather name="check" size={16} color="#fff" />
            )}
          </View>
        )}

        {isSelected && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: 8,
            pointerEvents: 'none',
          }} />
        )}
      </View>
    );
  }, [currentGridView, navigation, sortBy, theme, handleBookPress, handleBookLongPress, isSelectionMode, selectedBooks]);

  const renderSkeleton = useCallback(() => (
    <BookSkeleton theme={theme} gridView={currentGridView} />
  ), [theme, currentGridView]);

  const getItemLayoutCallback = useCallback((data: ArrayLike<DisplayItem> | null | undefined, index: number) =>
    getItemLayout(data, index, ITEM_HEIGHTS, currentGridView),
    [currentGridView]);

  const keyExtractor = useCallback((item: DisplayItem) =>
    item.isSeries ? item.id.toString() : 'book-' + item.id,
    []);

  return (
    <SafeAreaView
      style={[globalStyles.container, { backgroundColor: theme.background }]}
      accessible={true}
      accessibilityLabel="Bookshelf screen"
    >
      {!seriesFilter && (
        <Header
          navigation={navigation}
          theme={theme}
          activeFiltersCount={activeFiltersCount}
          onShowFilterModal={() => setShowFilterModal(true)}
          isSelectionMode={isSelectionMode}
          onToggleSelectionMode={toggleSelectionMode}
          selectedCount={selectedBooks.length}
        />
      )}

      {seriesFilter && (
        <SeriesHeader
          seriesName={seriesFilter}
          bookCount={displayItems.length}
          onBack={handleBackFromSeries}
          theme={theme}
        />
      )}

      <FilterModal
        visible={showFilterModal}
        theme={theme}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedTags={selectedTags}
        allTags={allTags}
        onTagChange={setSelectedTags}
        matchAllTags={matchAllTags}
        onToggleMatchAll={setMatchAllTags}
        selectedFormats={selectedFormats}
        onFormatChange={setSelectedFormats}
        selectedStatuses={selectedStatuses}
        onStatusChange={setSelectedStatuses}
        minPages={minPages}
        onMinPagesChange={setMinPages}
        maxPages={maxPages}
        onMaxPagesChange={setMaxPages}
        onClearFilters={handleClearFilters}
      />

      <BulkActionsModal
        visible={showBulkActions}
        selectedBooks={selectedBooks}
        onClose={() => setShowBulkActions(false)}
        onBulkAction={handleBulkAction}
        theme={theme}
        allTags={allTags}
      />

      <View style={{ paddingHorizontal: 16 }}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          theme={theme}
          books={allBooks}
        />
      </View>

      {isSelectionMode && selectedBooks.length > 0 && (
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 8,
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.primary,
              borderRadius: 8,
              padding: 12,
              alignItems: 'center',
            }}
            onPress={() => {
              setShowBulkActions(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Actions ({selectedBooks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: theme.cardBackground,
              borderRadius: 8,
              padding: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: theme.border,
            }}
            onPress={() => {
              const allDisplayBooks = selectableItems.filter(item => !item.isSeries) as Book[];
              const allSelected = allDisplayBooks.length > 0 && allDisplayBooks.every(book =>
                selectedBooks.some(b => b.id === book.id)
              );

              if (allSelected) {
                setSelectedBooks([]);
              } else {
                setSelectedBooks(allDisplayBooks);
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={{ color: theme.text, fontWeight: '600' }}>
              {selectableItems.filter(item => !item.isSeries).every(book =>
                selectedBooks.some(b => b.id === book.id)
              ) && selectableItems.length > 0 ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeSession && gridView !== GRID_VIEWS.STACK && !isSelectionMode && (
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            marginHorizontal: 16,
            marginVertical: 8,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('BookDetail', { bookId: activeSession.bookId });
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Feather name="book-open" size={24} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', opacity: 0.9 }}>
                READING NOW
              </Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 }} numberOfLines={1}>
                {activeSession.bookTitle}
              </Text>
              <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                Tap to return to session
              </Text>
            </View>
          </View>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
              GO
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={[globalStyles.gridContainer, { flex: 1 }]}>
        {currentGridView === GRID_VIEWS.STACK ? (
          isLoading && !isRefreshing ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>Loading cards...</Text>
            </View>
          ) : (
            <CardStackView
              books={selectableItems}
              navigation={navigation}
              theme={theme}
              onSeriesPress={handleBookPress}
              onBookLongPress={handleBookLongPress}
              onBookPress={handleBookPress}
              isSelectionMode={isSelectionMode}
            />
          )
        ) : (
          isLoading && !isRefreshing ? (
            <FlatList
              data={Array(6).fill({})}
              renderItem={renderSkeleton}
              keyExtractor={(_, index) => 'skeleton-' + index}
              numColumns={
                currentGridView === GRID_VIEWS.DETAILED ? 1 :
                  currentGridView === GRID_VIEWS.COMPACT ? 3 : 2
              }
              columnWrapperStyle={
                currentGridView === GRID_VIEWS.DETAILED ? undefined : { justifyContent: 'center' }
              }
              key={'skeleton-' + currentGridView}
              accessible={false}
            />
          ) : selectableItems.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No books found" : seriesFilter ? "No books in this series" : isSelectionMode ? "No books to select" : "Your library is empty"}
              message={searchQuery ? "Try adjusting your search terms" : seriesFilter ? "" : isSelectionMode ? "Only standalone books can be selected" : "Add your first book to get started!"}
              theme={theme}
            />
          ) : (
            <FlatList
              ref={flatListRef}
              data={selectableItems}
              extraData={selectedBooks}
              renderItem={renderBookItem}
              keyExtractor={keyExtractor}
              numColumns={
                currentGridView === GRID_VIEWS.DETAILED ? 1 :
                  currentGridView === GRID_VIEWS.COMPACT ? 3 : 2
              }
              columnWrapperStyle={
                currentGridView === GRID_VIEWS.DETAILED ? undefined : { justifyContent: 'center' }
              }
              key={'books-' + currentGridView + '-' + (isSelectionMode ? 'select' : 'normal')}
              getItemLayout={getItemLayoutCallback}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.primary]}
                  tintColor={theme.primary}
                />
              }
              contentContainerStyle={{
                paddingBottom: insets.bottom + 100,
              }}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={8}
              updateCellsBatchingPeriod={50}
              initialNumToRender={15}
              windowSize={5}
              scrollEventThrottle={16}
              onScroll={handleScroll}
            />
          )
        )}
      </View>

      {!isSelectionMode && (
        <FloatingActionButton
          onPress={() => navigation.navigate('AddBook')}
          theme={theme}
          insets={insets}
        />
      )}

      <BookPreviewModal
        visible={showPreview}
        book={previewBook}
        onClose={() => setShowPreview(false)}
        theme={theme}
      />

      <BookSpotlight
        visible={showSpotlight}
        book={spotlightBook}
        onComplete={handleSpotlightComplete}
        theme={theme}
      />

      <MultiBookSpotlight
        visible={showMultiSpotlight}
        books={spotlightBooks}
        onComplete={handleMultiBookSpotlightComplete}
        theme={theme}
      />
    </SafeAreaView>
  );
};

export default BookshelfScreen;
