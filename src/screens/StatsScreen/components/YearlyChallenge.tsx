import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';
import * as Haptics from 'expo-haptics';

interface YearlyChallengeProps {
  booksRead: number;
  target: number;
  theme: Theme;
  onEdit: () => void;
}

const YearlyChallenge: React.FC<YearlyChallengeProps> = ({ booksRead, target, theme, onEdit }) => {
  
  // Case 1: No Goal Set (Target is 0)
  if (!target || target === 0) {
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onEdit(); }}
        style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderStyle: 'dashed', borderWidth: 2 }]}
      >
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
           <View style={{ backgroundColor: `${theme.primary}15`, padding: 12, borderRadius: 50, marginBottom: 12 }}>
             <MaterialIcons name="flag" size={32} color={theme.primary} />
           </View>
           <Text style={[styles.bigNumber, { fontSize: 20, color: theme.text, marginBottom: 4 }]}>Set Yearly Goal</Text>
           <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center' }}>
             Challenge yourself to read more in {new Date().getFullYear()}!
           </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Case 2: Goal Active
  const currentMonth = new Date().getMonth(); // 0-11
  const expectedProgress = Math.round((target / 12) * (currentMonth + 1));
  const diff = booksRead - expectedProgress;
  
  const percentage = Math.min(100, Math.round((booksRead / target) * 100));
  
  let pacingText = "On track";
  let pacingColor = theme.textSecondary;
  
  if (diff > 0) {
    pacingText = `${diff} ahead of schedule!`;
    pacingColor = theme.success;
  } else if (diff < -2) {
    pacingText = `${Math.abs(diff)} behind schedule`;
    pacingColor = theme.danger;
  } else if (diff < 0) {
     pacingText = "Just a bit behind";
     pacingColor = theme.warning;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View>
           <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 }}>YEARLY CHALLENGE</Text>
           <Text style={[styles.bigNumber, { color: theme.text }]}>{booksRead} <Text style={{ fontSize: 16, color: theme.textSecondary }}>/ {target}</Text></Text>
        </View>
        
        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onEdit(); }}>
           <MaterialIcons name="edit" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.track, { backgroundColor: theme.border }]}>
         <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: theme.primary }]} />
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
         <Text style={{ color: pacingColor, fontSize: 12, fontWeight: '600' }}>{pacingText}</Text>
         <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{percentage}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  }
});

export default YearlyChallenge;
