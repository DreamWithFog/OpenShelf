import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatTotalTime } from '../../../utils/helpers';
import { SessionItem } from './SessionItem';
import type { GroupedSessions } from '../../../database/operations/sessionOperations';
import type { Session } from '../../../types';

interface SessionGroupProps {
  group: GroupedSessions;
  theme: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    primary: string;
    success: string;
    border: string;
  };
  isChapterTracking: boolean;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: number) => void;
}

export const SessionGroup: React.FC<SessionGroupProps> = ({
  group,
  theme,
  isChapterTracking,
  onEditSession,
  onDeleteSession,
}) => {
  const [isExpanded, setIsExpanded] = useState(group.readingNumber === 1);

  const unitLabel = isChapterTracking ? 'chapters' : 'pages';
  const readingLabel = group.readingNumber === 1 ? 'First Read' : `Reread #${group.readingNumber - 1}`;
  
  const formattedStartDate = new Date(group.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedEndDate = group.endDate
    ? new Date(group.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'In Progress';

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.badgeText, { color: theme.primary }]}>
              {group.readingNumber}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.readingLabel, { color: theme.text }]}>
              {readingLabel}
            </Text>
            <Text style={[styles.dateRange, { color: theme.textSecondary }]}>
              {formattedStartDate} → {formattedEndDate}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.stats}>
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              {group.sessions.length} session{group.sessions.length !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.statText, { color: theme.primary }]}>
              {formatTotalTime(group.totalDuration)}
            </Text>
            {group.totalUnitsRead > 0 && (
              <Text style={[styles.statText, { color: theme.success }]}>
                +{group.totalUnitsRead} {unitLabel}
              </Text>
            )}
          </View>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={theme.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sessionsList}>
          {group.sessions.map((session, index) => (
            <View key={session.id}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              <SessionItem
                session={session}
                theme={theme}
                isChapterTracking={isChapterTracking}
                onEdit={() => onEditSession(session)}
                onDelete={() => onDeleteSession(session.id)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  readingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateRange: {
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 11,
    marginBottom: 2,
  },
  sessionsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
