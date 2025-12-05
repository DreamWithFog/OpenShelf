import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../../../styles/globalStyles';

interface SessionsHeaderProps {
  theme: { text: string; primary: string };
  totalSessions: number;  // FIX: Changed from isThisBookActive/onStartSession
  onAddSession: () => void;
}

const SessionsHeader: React.FC<SessionsHeaderProps> = ({
  theme,
  totalSessions,
  onAddSession
}) => (
  <View style={{ 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 16
  }}>
    <Text style={[globalStyles.subtitle, { color: theme.text }]}>
      Reading Sessions {totalSessions > 0 && `(${totalSessions})`}
    </Text>
    <TouchableOpacity
      style={{
        backgroundColor: theme.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
      }}
      onPress={onAddSession}
    >
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
        + Add
      </Text>
    </TouchableOpacity>
  </View>
);

export default SessionsHeader;
