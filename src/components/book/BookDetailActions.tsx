import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { globalStyles } from '../../styles/globalStyles';
import { STATUS_OPTIONS, STATUS_COLORS } from '../../constants';
import { EditableStarRating, ThemedStarRating } from '../common';
import { Book, ActiveSession } from '../../types';

interface BookDetailActionsProps {
  book: Book | null;
  bookState: { tempStatus: string; tempRating: number | null };
  dispatch: React.Dispatch<any>;
  isEditing: boolean;
  theme: { 
    text: string; 
    textSecondary: string;
    cardBackground: string; 
    border: string; 
    primary: string; 
    starColor: string; 
    starEmpty: string;
    warning: string;
    danger: string;
  };
  activeSession: ActiveSession | null;
  onStartSession: () => void;
  onOpenFocusMode?: () => void;
  onShowSessionConflict?: () => void;
}

const BookDetailActions: React.FC<BookDetailActionsProps> = ({
  book,
  bookState,
  dispatch,
  isEditing,
  theme,
  activeSession,
  onStartSession,
  onOpenFocusMode,
  onShowSessionConflict
}) => {
  const isReadingThisBook = activeSession?.bookId === book?.id;
  const isReadingOtherBook = activeSession && activeSession.bookId !== book?.id;

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Case 1: Already reading this book - open focus mode
    if (isReadingThisBook) {
      if (onOpenFocusMode) {
        onOpenFocusMode();
      }
      return;
    }

    // Case 2: Reading another book - show conflict modal
    if (isReadingOtherBook) {
      if (onShowSessionConflict) {
        onShowSessionConflict();
      }
      return;
    }

    // Case 3: No active session - start new one
    onStartSession();
  };

  if (isEditing) {
    return (
      <View style={{ marginBottom: 20 }}>
        {/* Status Selection */}
        <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
          Status
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={{
                  backgroundColor: bookState.tempStatus === status ? STATUS_COLORS[status as keyof typeof STATUS_COLORS] : theme.cardBackground,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
                }}
                onPress={() => dispatch({ type: 'SET_FIELD', field: 'tempStatus', value: status })}
              >
                <Text style={{
                  color: bookState.tempStatus === status ? '#fff' : theme.text,
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Rating */}
        <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
          Rating
        </Text>
        <EditableStarRating
          rating={bookState.tempRating || 0}
          onRatingChange={(rating: number) => dispatch({ type: 'SET_FIELD', field: 'tempRating', value: rating })}
          theme={theme}
        />
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 20 }}>
      
      {/* START/CONTINUE READING BUTTON */}
      <TouchableOpacity
        style={[styles.startButton, { 
          backgroundColor: isReadingThisBook ? theme.primary : theme.cardBackground,
          borderColor: isReadingThisBook ? theme.primary : 
                       isReadingOtherBook ? theme.warning : 
                       theme.primary,
        }]}
        onPress={handleButtonPress}
        accessible={true}
        accessibilityLabel={isReadingThisBook ? 'Continue reading session' : 'Start reading session'}
        accessibilityRole="button"
      >
        <View style={[styles.iconCircle, {
          backgroundColor: isReadingThisBook ? 'rgba(255,255,255,0.2)' : 
                           isReadingOtherBook ? `${theme.warning}20` : 
                           `${theme.primary}20`
        }]}>
          {isReadingThisBook ? (
             <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#fff" />
          ) : isReadingOtherBook ? (
             <MaterialIcons name="warning" size={24} color={theme.warning} />
          ) : (
             <MaterialIcons name="play-arrow" size={28} color={theme.primary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.startText, { 
            color: isReadingThisBook ? '#fff' : theme.text 
          }]}>
            {isReadingThisBook ? 'Continue Reading' : 
             isReadingOtherBook ? 'Another Session Active' : 
             'Start Reading'}
          </Text>
          {isReadingOtherBook && (
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              Reading: {activeSession.bookTitle}
            </Text>
          )}
          {isReadingThisBook && (
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
              Tap to open focus mode
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Status Display */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 15 
      }}>
        <Text style={[globalStyles.subtitle, { color: theme.text }]}>
          Status
        </Text>
        <View style={{
          backgroundColor: STATUS_COLORS[book?.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.None,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
        }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
            {book?.status || 'None'}
          </Text>
        </View>
      </View>

      {/* Rating Display */}
      {(book?.rating || 0) > 0 && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 15 
        }}>
          <Text style={[globalStyles.subtitle, { color: theme.text }]}>
            Rating
          </Text>
          <ThemedStarRating rating={book.rating!} theme={theme} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default BookDetailActions;
