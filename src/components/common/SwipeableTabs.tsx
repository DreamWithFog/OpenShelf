import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  LayoutChangeEvent
} from 'react-native';
import { MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const INITIAL_WIDTH = Dimensions.get('window').width;

interface TabItem {
  label: string;
  count?: number;
  icon?: string;
  iconSet?: 'Material' | 'Feather' | 'Community'; 
}

interface SwipeableTabsProps {
  tabs: TabItem[];
  children: React.ReactNode;
  theme: {
    cardBackground: string;
    border: string;
    primary: string;
    text: string;
    textSecondary: string;
  };
  initialTab?: number;
  onTabChange?: (index: number) => void;
  lazyLoad?: boolean;
}

const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  tabs,
  children,
  theme,
  initialTab = 0,
  onTabChange,
  lazyLoad = false
}) => {
  const [activeIndex, setActiveIndex] = useState(initialTab);
  const [containerWidth, setContainerWidth] = useState(INITIAL_WIDTH);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const childrenArray = React.Children.toArray(children);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (Math.abs(containerWidth - width) > 1) {
      setContainerWidth(width);
    }
  };

  const switchTab = (index: number) => {
    if (index === activeIndex || index < 0 || index >= childrenArray.length) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveIndex(index);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * containerWidth,
        animated: true,
      });
    }

    onTabChange?.(index);
  };

  // Update active index based on scroll position
  const handleScrollEnd = () => {
    scrollX.addListener(({ value }) => {
      const newIndex = Math.round(value / containerWidth);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < childrenArray.length) {
        setActiveIndex(newIndex);
        onTabChange?.(newIndex);
      }
    });
  };

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const newIndex = Math.round(value / containerWidth);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < childrenArray.length) {
        setActiveIndex(newIndex);
        onTabChange?.(newIndex);
      }
    });

    return () => {
      scrollX.removeListener(listener);
    };
  }, [activeIndex, containerWidth, childrenArray.length]);

  const tabWidth = containerWidth / tabs.length;

  // Calculate indicator position directly from scroll
  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, containerWidth * (tabs.length - 1)],
    outputRange: [0, tabWidth * (tabs.length - 1)],
    extrapolate: 'clamp',
  });

  const renderIcon = (tab: TabItem, isActive: boolean) => {
    if (!tab.icon) return null;
    const color = isActive ? theme.primary : theme.textSecondary;
    const size = 20;

    if (tab.iconSet === 'Feather') return <Feather name={tab.icon as any} size={size} color={color} style={{ marginBottom: 2 }} />;
    if (tab.iconSet === 'Community') return <MaterialCommunityIcons name={tab.icon as any} size={size} color={color} style={{ marginBottom: 2 }} />;
    return <MaterialIcons name={tab.icon as any} size={size} color={color} style={{ marginBottom: 2 }} />;
  };

  return (
    <View style={{ flex: 1 }} onLayout={handleLayout}>
      {/* Tab Headers */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: theme.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        position: 'relative',
      }}>
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;
          return (
            <TouchableOpacity
              key={index}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => switchTab(index)}
              activeOpacity={0.7}
            >
              {renderIcon(tab, isActive)}
              <Text style={{
                fontSize: 12,
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive ? theme.primary : theme.textSecondary,
              }}>
                {tab.label}
              </Text>
              
              {tab.count !== undefined && tab.count > 0 && (
                <View style={{
                  position: 'absolute',
                  top: 4,
                  right: '10%',
                  backgroundColor: theme.primary,
                  borderRadius: 8,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Animated Tab Indicator - Directly Driven by Scroll */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: tabWidth,
            height: 3,
            backgroundColor: theme.primary,
            transform: [{ translateX: indicatorTranslateX }],
          }}
        />
      </View>

      {/* Tab Content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        decelerationRate="fast"
        style={{ flex: 1 }}
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        {childrenArray.map((child, index) => (
          <View
            key={index}
            style={{
              width: containerWidth,
              flex: 1,
            }}
          >
            {lazyLoad ? (
              Math.abs(index - activeIndex) <= 1 ? child : <View style={{ flex: 1 }} />
            ) : (
              child
            )}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

export default SwipeableTabs;
