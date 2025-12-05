import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CustomTag } from '../../../components';
import { Theme } from '../../../context/AppContext';
import { BOOK_FORMATS, STATUS_OPTIONS } from '../../../constants';

interface FilterModalProps {
  visible: boolean;
  theme: Theme;
  onClose: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedTags: string[];
  allTags: string[];
  onTagChange: (tags: string[]) => void;
  matchAllTags: boolean;
  onToggleMatchAll: (val: boolean) => void;
  selectedFormats: string[];
  onFormatChange: (formats: string[]) => void;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  minPages: string;
  onMinPagesChange: (val: string) => void;
  maxPages: string;
  onMaxPagesChange: (val: string) => void;
  onClearFilters: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  theme,
  onClose,
  sortBy,
  onSortChange,
  selectedTags,
  allTags,
  onTagChange,
  matchAllTags,
  onToggleMatchAll,
  selectedFormats,
  onFormatChange,
  selectedStatuses,
  onStatusChange,
  minPages,
  onMinPagesChange,
  maxPages,
  onMaxPagesChange,
  onClearFilters,
}) => {
  const insets = useSafeAreaInsets();
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
    }
  }, [visible]);

  const handleCloseAnimation = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleResetAnimation = () => {
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleCloseAnimation();
        } else {
          handleResetAnimation();
        }
      },
    })
  ).current;

  const toggleSelection = (current: string[], item: string, setter: (val: string[]) => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  // LOGIC: Handle Bidirectional Sorting
  const handleSortPress = (baseKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check if this category is already active
    if (sortBy.startsWith(baseKey)) {
      // Toggle Direction
      if (sortBy.endsWith('_asc')) {
        onSortChange(`${baseKey}_desc`);
      } else {
        onSortChange(`${baseKey}_asc`);
      }
    } else {
      // Set default direction based on category
      if (baseKey === 'rating' || baseKey === 'recent') {
        onSortChange(`${baseKey}_desc`); // Newest/Highest first by default
      } else {
        onSortChange(`${baseKey}_asc`); // A-Z by default
      }
    }
  };

  const sortOptions = [
    { key: 'recent', label: 'Recently Updated', icon: 'clock' },
    { key: 'title', label: 'Title', icon: 'type' },
    { key: 'author', label: 'Author', icon: 'user' },
    { key: 'rating', label: 'Rating', icon: 'star' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseAnimation}
    >
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleCloseAnimation}>
          <View style={StyleSheet.absoluteFillObject}>
             <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          </View>
        </TouchableWithoutFeedback>

        <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
          <Animated.View 
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 12,
              paddingBottom: insets.bottom + 20,
              maxHeight: '90%',
              transform: [{ translateY: panY }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -5 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <View 
              {...panResponder.panHandlers} 
              style={{ alignItems: 'center', paddingVertical: 12, width: '100%', backgroundColor: 'transparent' }}
            >
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>
                Refine Library
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              
              {/* 1. SORT BY */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SORT ORDER</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {sortOptions.map((option) => {
                    const isActive = sortBy.startsWith(option.key);
                    const isAsc = sortBy.endsWith('_asc');

                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.chip, 
                          { 
                            backgroundColor: isActive ? theme.primary : theme.cardBackground,
                            borderColor: isActive ? theme.primary : theme.border
                          }
                        ]}
                        onPress={() => handleSortPress(option.key)}
                      >
                        <Feather name={option.icon as any} size={14} color={isActive ? '#fff' : theme.text} />
                        <Text style={[styles.chipText, { color: isActive ? '#fff' : theme.text }]}>
                          {option.label}
                        </Text>
                        {isActive && (
                          <MaterialCommunityIcons 
                            name={isAsc ? "arrow-up" : "arrow-down"} 
                            size={16} 
                            color="#fff" 
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. STATUS */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>STATUS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {STATUS_OPTIONS.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.chip, 
                        { 
                          backgroundColor: selectedStatuses.includes(status) ? `${theme.primary}20` : theme.cardBackground,
                          borderColor: selectedStatuses.includes(status) ? theme.primary : theme.border
                        }
                      ]}
                      onPress={() => toggleSelection(selectedStatuses, status, onStatusChange)}
                    >
                      <Text style={[styles.chipText, { color: selectedStatuses.includes(status) ? theme.primary : theme.text }]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 3. FORMAT */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>FORMAT</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {BOOK_FORMATS.map((format) => (
                    <TouchableOpacity
                      key={format}
                      style={[
                        styles.chip, 
                        { 
                          backgroundColor: selectedFormats.includes(format) ? `${theme.primary}20` : theme.cardBackground,
                          borderColor: selectedFormats.includes(format) ? theme.primary : theme.border
                        }
                      ]}
                      onPress={() => toggleSelection(selectedFormats, format, onFormatChange)}
                    >
                      <Text style={[styles.chipText, { color: selectedFormats.includes(format) ? theme.primary : theme.text }]}>
                        {format}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 4. PAGE COUNT */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PAGE COUNT</Text>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
                    placeholder="Min"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                    value={minPages}
                    onChangeText={onMinPagesChange}
                  />
                  <Text style={{ color: theme.textSecondary }}>to</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
                    placeholder="Max"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                    value={maxPages}
                    onChangeText={onMaxPagesChange}
                  />
                </View>
              </View>

              {/* 5. TAGS */}
              {allTags.length > 0 && (
                <View style={styles.section}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: 0 }]}>TAGS</Text>
                    
                    {/* Logic Toggle */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                        {matchAllTags ? 'Match All (AND)' : 'Match Any (OR)'}
                      </Text>
                      <Switch
                        trackColor={{ false: theme.border, true: theme.primary }}
                        thumbColor={"#fff"}
                        ios_backgroundColor={theme.border}
                        onValueChange={onToggleMatchAll}
                        value={matchAllTags}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {allTags.map((tag) => (
                      <CustomTag
                        key={tag}
                        tag={tag}
                        selected={selectedTags.includes(tag)}
                        onPress={() => toggleSelection(selectedTags, tag, onTagChange)}
                        theme={theme}
                      />
                    ))}
                  </View>
                </View>
              )}

            </ScrollView>

            {/* Footer */}
            <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.border }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: theme.cardBackground, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}
                onPress={() => {
                  onClearFilters();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: theme.primary, padding: 16, borderRadius: 16, alignItems: 'center' }}
                onPress={() => {
                  onClose();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Show Results</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
  },
});
