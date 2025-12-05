import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';
import { DisplayItem } from '../../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = 32;
const COMPACT_COLUMNS = 3;
const GRID_COLUMNS = 2;

const COMPACT_ITEM_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING - (8 * COMPACT_COLUMNS)) / COMPACT_COLUMNS;
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING - (8 * GRID_COLUMNS)) / GRID_COLUMNS;

export const renderSeriesItem = (item: DisplayItem, gridView: string, theme: Theme, onPress: (item: DisplayItem) => void, GRID_VIEWS: Record<string, string>, ITEM_HEIGHTS: Record<string, number>) => {
  if (gridView === GRID_VIEWS.DETAILED) {
    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        style={{
          marginHorizontal: 0,
          marginVertical: 12
        }}
      >
        <View style={{
          flexDirection: 'row',
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
          padding: 12,
          borderWidth: 2,
          borderColor: theme.primary,
          height: 110,
        }}>
          {item.coverUrl ? (
            <Image
              source={{ uri: item.coverUrl }}
              style={{
                width: 60,
                height: 80,
                borderRadius: 6,
                marginRight: 12,
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              width: 60,
              height: 80,
              borderRadius: 6,
              backgroundColor: theme.border,
              marginRight: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <MaterialIcons name="collections-bookmark" size={30} color={theme.textSecondary} />
            </View>
          )}

          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 4,
              }} numberOfLines={2}>
                {item.title}
              </Text>

              {item.author && (
                <Text style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                }} numberOfLines={1}>
                  {item.author}
                </Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <MaterialIcons name="collections-bookmark" size={14} color={theme.primary} style={{ marginRight: 4 }} />
                <Text style={{
                  color: theme.primary,
                  fontSize: 11,
                  fontWeight: 'bold',
                }}>
                  {item.status}
                </Text>
              </View>

              <View style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
              }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                  {item.volumeCount} {item.collectionType === 'volume' ? 'vol' : 'books'}
                  {item.totalInCollection ? ` of ${item.totalInCollection}` : ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ justifyContent: 'center' }}>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const isCompact = gridView === GRID_VIEWS.COMPACT;

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={{
        width: isCompact ? COMPACT_ITEM_WIDTH : GRID_ITEM_WIDTH,
        margin: isCompact ? 2 : 4,
      }}
    >
      <View style={{
        backgroundColor: theme.cardBackground,
        borderRadius: 12,
        padding: isCompact ? 8 : 12,
        borderWidth: 2,
        borderColor: theme.primary,
        height: isCompact ? 180 : 250,
      }}>
        <View style={{
          position: 'absolute',
          top: isCompact ? 4 : 8,
          right: isCompact ? 4 : 8,
          backgroundColor: theme.primary,
          paddingHorizontal: 6,
          paddingVertical: 3,
          borderRadius: 10,
          zIndex: 10,
        }}>
          {/* FIX: Wrap everything in a single Text component */}
          <Text style={{ color: '#fff', fontSize: isCompact ? 9 : 10, fontWeight: 'bold' }}>
            {item.volumeCount}
            {item.totalInCollection ? `/${item.totalInCollection}` : ''}{' '}
            {item.collectionType === 'volume'
              ? (item.volumeCount === 1 ? 'vol' : 'vols')
              : (item.volumeCount === 1 ? 'book' : 'books')}
          </Text>
        </View>

        {item.coverUrl ? (
          <Image
            source={{ uri: item.coverUrl }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
        ) : (
          <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.border,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <MaterialIcons name="collections-bookmark" size={40} color={theme.textSecondary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const getItemLayout = (
  data: ArrayLike<DisplayItem> | null | undefined, 
  index: number, 
  ITEM_HEIGHTS: Record<string, number>, 
  gridView: string
) => ({
  length: ITEM_HEIGHTS[gridView],
  offset: ITEM_HEIGHTS[gridView] * index,
  index,
});
