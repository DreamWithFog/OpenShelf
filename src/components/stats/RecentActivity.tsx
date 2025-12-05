import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { formatDate, formatTotalTime } from '../../utils/helpers';
import { Session } from '../../types';

interface Theme {
  cardBackground: string;
  text: string;
  textSecondary: string;
  primary: string;
}

interface RecentActivityProps {
  sessions: Session[];
  theme: Theme;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ sessions, theme }) => {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      {/* FIX: Center the title */}
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 15, textAlign: 'center' }]}>
        Recent Activity
      </Text>
      {sessions.map(session => (
        <View 
          key={session.id} 
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }} numberOfLines={1}>
              {session?.bookTitle || 'Unknown Book'}
            </Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>
              {formatDate(session?.startTime)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.primary }}>
              {session?.endPage && session?.startPage ? `+${session.endPage - session.startPage} pages` : ''}
              {session?.endChapter && session?.startChapter ? `+${session.endChapter - session.startChapter} chapters` : ''}
            </Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              {formatTotalTime(session?.duration || 0)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default RecentActivity;
