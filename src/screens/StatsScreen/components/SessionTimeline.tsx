import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';
import { Session, Book } from '../../../types';
import { formatDate, formatTotalTime } from '../../../utils/helpers';
import { getTimeIcon } from '../../../utils/sessionAnalysis'; // FIX: Import helper

interface SessionTimelineProps {
  sessions: Session[];
  books: Book[];
  theme: Theme;
}

const BookJourneyBar: React.FC<{ session: Session; book: Book | undefined; theme: Theme }> = ({ session, book, theme }) => {
  if (!book || (!book.totalPages && !book.totalChapters)) return null;

  const isChapter = book.trackingType === 'chapters';
  const total = isChapter ? book.totalChapters || 1 : book.totalPages || 1;
  const start = isChapter ? session.startChapter || 0 : session.startPage || 0;
  const end = isChapter ? session.endChapter || 0 : session.endPage || 0;

  const startPercent = (start / total) * 100;
  const sessionPercent = ((end - start) / total) * 100;

  return (
    <View style={[styles.journeyContainer, { backgroundColor: theme.border }]}>
      {/* Previous Progress */}
      <View style={{ 
        width: `${startPercent}%`, 
        height: '100%', 
        backgroundColor: theme.textSecondary, 
        opacity: 0.3 
      }} />
      {/* Session Progress (Highlight) */}
      <View style={{ 
        width: `${sessionPercent}%`, 
        height: '100%', 
        backgroundColor: theme.primary 
      }} />
    </View>
  );
};

const SessionTimeline: React.FC<SessionTimelineProps> = ({ sessions, books, theme }) => {
  if (!sessions || sessions.length === 0) return null;

  const bookMap = new Map(books.map(b => [b.id, b]));

  return (
    <View>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Session Timeline</Text>
      
      <View style={styles.timelineContainer}>
        {/* Vertical Line */}
        <View style={[styles.verticalLine, { backgroundColor: theme.border }]} />

        {sessions.map((session, index) => {
          const date = new Date(session.startTime);
          const book = bookMap.get(session.bookId);
          const isChapter = book?.trackingType === 'chapters';
          const amount = isChapter 
            ? (session.endChapter || 0) - (session.startChapter || 0)
            : (session.endPage || 0) - (session.startPage || 0);

          return (
            <View key={session.id} style={styles.sessionRow}>
              {/* Time Icon */}
              <View style={[styles.iconBubble, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <MaterialCommunityIcons 
                  name={getTimeIcon(session.startTime) as any} 
                  size={16} 
                  color={theme.textSecondary} 
                />
              </View>

              {/* Content Card */}
              <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={1}>
                      {session.bookTitle}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                      {formatDate(session.startTime)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amountText, { color: theme.primary }]}>
                      +{amount} {isChapter ? 'ch' : 'pg'}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                      {formatTotalTime(session.duration || 0)}
                    </Text>
                  </View>
                </View>

                {/* Book Journey Visualizer */}
                <BookJourneyBar session={session} book={book} theme={theme} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  timelineContainer: {
    paddingLeft: 16,
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    left: 24, // Align with icon center
    top: 0,
    bottom: 0,
    width: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  journeyContainer: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 4,
  },
});

export default SessionTimeline;
