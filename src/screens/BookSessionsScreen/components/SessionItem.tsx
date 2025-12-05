import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDate, formatTotalTime } from '../../../utils/helpers';
import { Session } from '../../../types';

interface SessionItemProps {
  session: Session;
  theme: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    primary: string;
    danger: string;
    success: string;
    border: string;
  };
  isChapterTracking: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const SessionItem: React.FC<SessionItemProps> = ({
  session,
  theme,
  isChapterTracking,
  onEdit,
  onDelete,
}) => {
  const duration = formatTotalTime(session.duration || 0);
  const unitsRead = isChapterTracking
    ? ((session.endChapter || 0) - (session.startChapter || 0))
    : ((session.endPage || 0) - (session.startPage || 0));

  const startUnit = isChapterTracking ? session.startChapter : session.startPage;
  const endUnit = isChapterTracking ? session.endChapter : session.endPage;
  const unitLabel = isChapterTracking ? 'Chapters' : 'Pages';
  const unitLabelSingular = isChapterTracking ? 'chapter' : 'page';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderLeftColor: theme.primary,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {formatDate(session.endTime || session.startTime)}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <MaterialIcons name="edit" size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <MaterialIcons name="delete-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.range, { color: theme.text }]}>
          {unitLabel} {startUnit || 0} → {endUnit || '?'}
        </Text>
        <Text style={[styles.duration, { color: theme.primary }]}>{duration}</Text>
      </View>

      {unitsRead > 0 && (
        <View style={styles.badge}>
          <View
            style={[
              styles.badgeContainer,
              { backgroundColor: theme.success + '20' },
            ]}
          >
            <Text style={[styles.badgeText, { color: theme.success }]}>
              +{unitsRead} {unitsRead === 1 ? unitLabelSingular : unitLabel.toLowerCase()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  range: {
    fontSize: 14,
  },
  duration: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badge: {
    marginTop: 6,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
