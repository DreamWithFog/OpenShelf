import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../../../context/AppContext';
import { SessionAnalysis } from '../../../../utils/sessionAnalysis';
import * as Haptics from 'expo-haptics';

interface SessionWrappedProps {
  visible: boolean;
  analysis: SessionAnalysis | null;
  onClose: () => void;
  onAddNote: () => void;
  theme: Theme;
}

const SessionWrapped: React.FC<SessionWrappedProps> = ({ visible, analysis, onClose, onAddNote, theme }) => {
  if (!analysis) return null;

  // Celebration Logic
  const isFinished = analysis.isBookFinished;
  const headerColor = isFinished ? '#FFD700' : theme.primary; 
  const iconName = isFinished ? "trophy" : "party-popper";
  const titleText = isFinished ? "Book Completed!" : "Session Complete!";
  const subtitleText = isFinished ? "You finished the journey. Well done!" : analysis.quote;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          
          {/* Header Icon Bubble */}
          <View style={[styles.iconHeader, { backgroundColor: headerColor, borderColor: theme.cardBackground }]}>
            <MaterialCommunityIcons name={iconName} size={32} color="#fff" />
          </View>

          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text style={[styles.title, { color: theme.text }]}>{titleText}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitleText}</Text>
          </View>

          {/* Main Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.mainStat}>
              <Text style={[styles.bigNumber, { color: headerColor }]}>{analysis.pagesRead}</Text>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                 {analysis.speedLabel.includes('ch') ? 'Chapters' : 'Pages'} Read
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.sideStats}>
              <View style={styles.row}>
                 <MaterialIcons name="timer" size={16} color={theme.textSecondary} />
                 <Text style={[styles.statVal, { color: theme.text }]}>{analysis.durationMinutes} min</Text>
              </View>
              <View style={styles.row}>
                 <MaterialIcons name="speed" size={16} color={theme.textSecondary} />
                 <Text style={[styles.statVal, { color: theme.text }]}>{analysis.speed} {analysis.speedLabel}</Text>
              </View>
              {analysis.comparison && !isFinished && (
                <Text style={{ color: theme.success, fontSize: 11, marginTop: 4 }}>{analysis.comparison}</Text>
              )}
            </View>
          </View>

          {/* Badges (Hide if finished to focus on the trophy) */}
          {!isFinished && analysis.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {analysis.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                  <Text style={[styles.tagText, { color: theme.primary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
             <TouchableOpacity 
               style={[styles.secondaryBtn, { borderColor: theme.border }]}
               onPress={() => { Haptics.selectionAsync(); onAddNote(); }}
             >
               <MaterialIcons name="edit" size={20} color={theme.text} />
               <Text style={{ color: theme.text, fontWeight: '600', marginLeft: 8 }}>Add Note</Text>
             </TouchableOpacity>

             <TouchableOpacity 
               style={[styles.primaryBtn, { backgroundColor: headerColor }]}
               onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onClose(); }}
             >
               <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                 {isFinished ? 'Close' : 'Finish'}
               </Text>
             </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconHeader: {
    position: 'absolute',
    top: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  mainStat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 56,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: '80%',
    marginHorizontal: 16,
  },
  sideStats: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  primaryBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
  },
});

export default SessionWrapped;
