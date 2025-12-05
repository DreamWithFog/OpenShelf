import React, { useState, memo } from 'react';
import { Image, View, ActivityIndicator, ImageSourcePropType, StyleProp, ViewStyle, ImageStyle } from 'react-native';

interface OptimizedImageProps {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  placeholderColor?: string;
  // Add other Image props if needed
  resizeMethod?: 'auto' | 'resize' | 'scale';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  progressiveRenderingEnabled?: boolean;
  fadeDuration?: number;
}

const OptimizedImage = memo(({ source, style, placeholderColor = '#f0f0f0', ...props }: OptimizedImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error || !source || (typeof source === 'object' && 'uri' in source && !source.uri)) {
    return <View style={[style, { backgroundColor: placeholderColor }]} />;
  }

  return (
    <View style={style}>
      <Image
        source={source}
        style={style}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        // CRITICAL PERFORMANCE SETTINGS
        resizeMethod="resize" // Use hardware acceleration
        resizeMode="cover"
        progressiveRenderingEnabled={true} // Progressive JPEG loading
        fadeDuration={0} // Disable fade animation for performance
        {...props}
      />
      {loading && (
        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if source URI changes
  const prevUri = typeof prevProps.source === 'object' && 'uri' in prevProps.source ? prevProps.source.uri : undefined;
  const nextUri = typeof nextProps.source === 'object' && 'uri' in nextProps.source ? nextProps.source.uri : undefined;
  return prevUri === nextUri;
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;