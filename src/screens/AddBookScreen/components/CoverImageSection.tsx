import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';

interface CoverImageSectionProps {
  theme: Theme;
  coverImage: string | null;
  coverUrl: string;
  pickImage: () => void;
  removeImage: () => void;
  onCoverUrlChange: (url: string) => void;
}

const CoverImageSection: React.FC<CoverImageSectionProps> = ({ 
  theme, 
  coverImage, 
  coverUrl,
  pickImage, 
  removeImage,
  onCoverUrlChange 
}) => {
  const [urlInput, setUrlInput] = useState(coverUrl);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  
  // Debounce URL validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (urlInput && urlInput.trim() !== '') {
        validateImageUrl(urlInput.trim());
      } else {
        setUrlError('');
        setUrlPreview(null);
        onCoverUrlChange('');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [urlInput]);

  const validateImageUrl = async (url: string) => {
    // Reset states
    setUrlError('');
    setUrlPreview(null);
    
    // Check if URL is valid format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUrlError('URL must start with http:// or https://');
      return;
    }

    // Check if it looks like an image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );

    if (!hasImageExtension && !url.includes('googleusercontent.com') && !url.includes('covers.openlibrary.org')) {
      setUrlError('URL should point to an image file');
      return;
    }

    // Try to load the image
    setIsValidatingUrl(true);
    
    Image.getSize(
      url,
      (width, height) => {
        // Success
        setIsValidatingUrl(false);
        setUrlPreview(url);
        onCoverUrlChange(url);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      (error) => {
        // Failed to load
        setIsValidatingUrl(false);
        setUrlError('Failed to load image from URL');
        console.error('Image load error:', error);
      }
    );
  };

  const handlePickImage = () => {
    if (urlPreview) {
      // User has a valid URL preview, ask if they want to replace it
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Clear URL when picking image
      setUrlInput('');
      setUrlPreview(null);
      setUrlError('');
      onCoverUrlChange('');
    }
    pickImage();
  };

  const handleRemoveImage = () => {
    removeImage();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearUrl = () => {
    setUrlInput('');
    setUrlPreview(null);
    setUrlError('');
    onCoverUrlChange('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Determine what to display
  const displayImage = coverImage || urlPreview;
  const imageSource = coverImage ? 'upload' : urlPreview ? 'url' : null;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
        Cover Image
      </Text>
      
      {/* Image Preview */}
      <View style={styles.coverContainer}>
        {displayImage ? (
          <>
            <Image source={{ uri: displayImage }} style={styles.coverImage} />
            
            {/* Source Badge */}
            <View style={[styles.sourceBadge, { backgroundColor: theme.primary }]}>
              <Ionicons 
                name={imageSource === 'upload' ? 'image' : 'link'} 
                size={12} 
                color="#fff" 
              />
              <Text style={styles.sourceBadgeText}>
                {imageSource === 'upload' ? 'Uploaded' : 'From URL'}
              </Text>
            </View>

            {/* Remove Button */}
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={imageSource === 'upload' ? handleRemoveImage : handleClearUrl}
            >
              <Ionicons name="close-circle" size={32} color={theme.danger} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.coverPlaceholder, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
            onPress={handlePickImage}
          >
            <Ionicons name="camera" size={40} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Add Cover Image</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Change Image Button (when image exists) */}
      {displayImage && (
        <TouchableOpacity
          style={[styles.changeButton, { backgroundColor: theme.border }]}
          onPress={handlePickImage}
        >
          <Ionicons name="camera" size={18} color={theme.text} />
          <Text style={{ color: theme.text, marginLeft: 8, fontWeight: '600' }}>
            Change Image
          </Text>
        </TouchableOpacity>
      )}

      <Text style={{ 
        color: theme.textSecondary, 
        fontSize: 12, 
        textAlign: 'center', 
        marginVertical: 10 
      }}>
        {displayImage ? 'or replace with URL' : 'or enter a URL'}
      </Text>

      {/* URL Input */}
      <View>
        <TextInput
          style={[
            globalStyles.input, 
            { 
              backgroundColor: theme.inputBackground, 
              color: theme.text,
              borderColor: urlError ? theme.danger : theme.border,
              borderWidth: urlError ? 2 : 1,
            }
          ]}
          placeholder="Cover Image URL (https://...)"
          placeholderTextColor={theme.textSecondary}
          value={urlInput}
          onChangeText={setUrlInput}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={1000}
          editable={!isValidatingUrl}
        />

        {/* Loading Indicator */}
        {isValidatingUrl && (
          <View style={styles.urlFeedback}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={{ color: theme.textSecondary, marginLeft: 8, fontSize: 12 }}>
              Validating image...
            </Text>
          </View>
        )}

        {/* Error Message */}
        {urlError && (
          <View style={styles.urlFeedback}>
            <Ionicons name="alert-circle" size={16} color={theme.danger} />
            <Text style={{ color: theme.danger, marginLeft: 6, fontSize: 12 }}>
              {urlError}
            </Text>
          </View>
        )}

        {/* Success Message */}
        {urlPreview && !urlError && (
          <View style={styles.urlFeedback}>
            <Ionicons name="checkmark-circle" size={16} color={theme.success || '#10b981'} />
            <Text style={{ color: theme.success || '#10b981', marginLeft: 6, fontSize: 12 }}>
              Image loaded successfully
            </Text>
          </View>
        )}
      </View>

      {/* Warning if both exist */}
      {coverImage && urlPreview && (
        <View style={[styles.warningBox, { backgroundColor: `${theme.warning || '#f59e0b'}20`, borderColor: theme.warning || '#f59e0b' }]}>
          <Ionicons name="warning" size={16} color={theme.warning || '#f59e0b'} />
          <Text style={{ color: theme.warning || '#f59e0b', marginLeft: 8, fontSize: 12, flex: 1 }}>
            Note: Uploaded image will be used. URL will be ignored.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  coverContainer: {
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  coverImage: {
    width: 150,
    height: 225,
    borderRadius: 10,
  },
  sourceBadge: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: [{ translateX: -40 }],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  sourceBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: 100,
  },
  coverPlaceholder: {
    width: 150,
    height: 225,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  urlFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
});

export default CoverImageSection;
