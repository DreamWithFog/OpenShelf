import React from 'react';
import { View } from 'react-native';

interface IconProps {
  color?: string;
  size?: number;
}

// Custom Play Icon
export const PlayIcon: React.FC<IconProps> = ({ color = '#fff', size = 20 }) => (
  <View style={{ 
    width: 0, 
    height: 0,
    borderLeftWidth: size * 0.8,
    borderRightWidth: 0,
    borderTopWidth: size * 0.5,
    borderBottomWidth: size * 0.5,
    borderLeftColor: color,
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: size * 0.15,
  }} />
);

// Custom Pause Icon
export const PauseIcon: React.FC<IconProps> = ({ color = '#fff', size = 20 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ 
      width: size * 0.3, 
      height: size, 
      backgroundColor: color,
      borderRadius: size * 0.1,
    }} />
    <View style={{ width: size * 0.25 }} />
    <View style={{ 
      width: size * 0.3, 
      height: size, 
      backgroundColor: color,
      borderRadius: size * 0.1,
    }} />
  </View>
);

// Custom Stop Icon
export const StopIcon: React.FC<IconProps> = ({ color = '#fff', size = 20 }) => (
  <View style={{ 
    width: size * 0.7, 
    height: size * 0.7, 
    backgroundColor: color,
    borderRadius: size * 0.1,
  }} />
);