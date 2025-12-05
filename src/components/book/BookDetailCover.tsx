import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  View, 
  Image, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Animated, 
  ViewStyle, 
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BookDetailCoverProps {
  coverUrl: string | null;
  isEditing: boolean;
  onPickImage: () => void;
  onUrlChange: (url: string) => void;
  isUploadingImage: boolean;
  isOptimizingImage: boolean;
  theme: { 
    placeholderBg: string; 
    primary: string; 
    text: string; 
    textSecondary: string; 
    inputBackground: string; 
    border: string; 
    cardBackground: string; 
    danger?: string 
  };
  currentCoverUrl: string | null;
}

export interface BookDetailCoverRef {
  triggerGlow: () => void;
}

const BookDetailCover = forwardRef<BookDetailCoverRef, BookDetailCoverProps>(({
  coverUrl,
  isEditing,
  onPickImage,
  onUrlChange,
  isUploadingImage,
  isOptimizingImage,
  theme,
  currentCoverUrl
}, ref) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const glowOpacity = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    triggerGlow: () => {
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }));

  const animatedGlowStyle: Animated.WithAnimatedObject<ViewStyle> = {
    borderColor: glowOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(76, 175, 80, 0)', 'rgba(76, 175, 80, 1)']
    }),
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity,
    shadowRadius: glowOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 30]
    }),
    elevation: glowOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20]
    }),
  };

  // --- Read-Only Mode ---
  if (!isEditing) {
    if (coverUrl) {
      return (
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.imageWrapper,
              {
                borderColor: 'transparent', 
              },
              animatedGlowStyle
            ]}
          >
            <Image
              source={{ uri: coverUrl }}
              style={styles.coverImage}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />

            {imageLoading && (
              <ActivityIndicator
                style={styles.loader}
                color={theme.primary}
                size="large"
              />
            )}
          </Animated.View>
        </View>
      );
    }

    return (
      <View style={[styles.placeholderContainer, { backgroundColor: theme.placeholderBg }]}>
        {/* FIX: Replaced emoji with Icon */}
        <MaterialIcons name="menu-book" size={64} color={theme.textSecondary} />
      </View>
    );
  }

  // --- Edit Mode ---
  return (
    <View style={styles.container}>
      <View style={{ position: 'relative' }}>
        {coverUrl ? (
          <>
            <Image
              source={{ uri: coverUrl }}
              style={[
                styles.coverImage,
                { opacity: isOptimizingImage ? 0.5 : 1 }
              ]}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {(imageLoading || isOptimizingImage) && (
              <View style={styles.overlayLoader}>
                <ActivityIndicator
                  color="#fff"
                  size="large"
                />
                {isOptimizingImage && (
                  <Text style={styles.optimizingText}>
                    Optimizing image...
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={[
            styles.placeholderContainer, 
            { 
              backgroundColor: theme.placeholderBg,
              borderWidth: 2,
              borderColor: theme.border,
              borderStyle: 'dashed'
            }
          ]}>
            <MaterialIcons name="add-photo-alternate" size={48} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, marginTop: 10, fontSize: 14 }}>
              No Cover Image
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={onPickImage}
          disabled={isUploadingImage || isOptimizingImage}
          style={[
            styles.actionButton,
            { backgroundColor: theme.primary, opacity: (isUploadingImage || isOptimizingImage) ? 0.6 : 1 }
          ]}
        >
          <MaterialIcons name="photo-library" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.actionButtonText}>
            {isOptimizingImage ? "Optimizing..." : coverUrl ? "Change Cover Image" : "Add Cover Image"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowUrlInput(!showUrlInput)}
          style={[
            styles.actionButton,
            { 
              backgroundColor: theme.cardBackground,
              borderWidth: 1,
              borderColor: theme.border 
            }
          ]}
        >
          <MaterialIcons name="link" size={20} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, fontSize: 16 }}>
            {showUrlInput ? "Hide URL Input" : "Use Image URL"}
          </Text>
        </TouchableOpacity>

        {showUrlInput && (
          <View style={{ marginTop: 15, width: '100%' }}>
            <TextInput
              placeholder="Cover Image URL (https://...)"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.urlInput,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                  color: theme.text
                }
              ]}
              value={currentCoverUrl || ''}
              onChangeText={onUrlChange}
              keyboardType="url"
              autoCapitalize="none"
              maxLength={2000}
            />
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 5, fontStyle: 'italic' }}>
              Enter a direct link to an image
            </Text>
          </View>
        )}

        {coverUrl && (
          <TouchableOpacity
            onPress={() => {
              onUrlChange('');
              setShowUrlInput(false);
            }}
            style={styles.removeButton}
          >
            <Text style={{ color: theme.danger || '#f44336', fontSize: 14 }}>
              Remove Cover Image
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%', 
  },
  imageWrapper: {
    borderRadius: 16,
    borderWidth: 4,
    padding: 4,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  placeholderContainer: {
    width: 200,
    height: 300,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  loader: {
    position: 'absolute',
    top: '45%',
    left: '43%',
  },
  overlayLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  optimizingText: {
    color: '#fff',
    marginTop: 10,
  },
  actionsContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'stretch', 
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  removeButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
});

export default BookDetailCover;
