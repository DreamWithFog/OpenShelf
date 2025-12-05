import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  theme: { text: string; textSecondary: string; primary: string };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionText, onAction, theme }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
    <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>{message}</Text>
    {actionText && onAction && (
      <TouchableOpacity style={[styles.emptyAction, { backgroundColor: theme.primary }]} onPress={onAction}>
        <Text style={styles.emptyActionText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  emptyMessage: { 
    fontSize: 16, 
    textAlign: 'center', 
    lineHeight: 24, 
    marginBottom: 24 
  },
  emptyAction: { 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 20 
  },
  emptyActionText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});

export default EmptyState;
