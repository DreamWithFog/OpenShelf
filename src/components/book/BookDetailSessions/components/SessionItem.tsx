import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDate, formatTotalTime } from '../../../../utils/helpers';
import { Session } from '../../../../types';  // FIX: Use global Session type

interface SessionItemProps {
  theme: { cardBackground: string; primary: string; textSecondary: string; text: string; danger: string; success: string };
  session: Session;  // FIX: Use Session instead of item
  isChapterTracking: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  theme,
  session,  // FIX: Renamed from item
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
    <View style={{
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    }}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8 
      }}>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          {formatDate(session.endTime || session.startTime)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={onEdit} style={{ padding: 4 }}>
            <MaterialIcons name="edit" size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
            <MaterialIcons name="delete-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.text, fontSize: 14 }}>
          {unitLabel} {startUnit || 0} → {endUnit || '?'}
        </Text>
        <Text style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>
          {duration}
        </Text>
      </View>
      
      {unitsRead > 0 && (
        <View style={{ marginTop: 6 }}>
          <View style={{
            backgroundColor: theme.success + '20',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
          }}>
            <Text style={{ color: theme.success, fontSize: 12, fontWeight: 'bold' }}>
              +{unitsRead} {unitsRead === 1 ? unitLabelSingular : unitLabel.toLowerCase()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SessionItem;
