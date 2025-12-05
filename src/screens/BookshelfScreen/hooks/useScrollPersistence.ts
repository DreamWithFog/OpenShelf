import { useRef, useCallback } from 'react';
import { FlatList } from 'react-native';

export const useScrollPersistence = () => {
  const flatListRef = useRef<FlatList>(null);
  const scrollPositionRef = useRef(0);
  const contentSizeRef = useRef(0);

  const handleScroll = useCallback((event: any) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
    contentSizeRef.current = event.nativeEvent.contentSize.height;
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (flatListRef.current && scrollPositionRef.current > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: scrollPositionRef.current,
          animated: false
        });
      }, 100);
    }
  }, []);

  return {
    flatListRef,
    handleScroll,
    restoreScrollPosition,
    scrollPosition: scrollPositionRef.current
  };
};
