import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Theme } from '../../../context/AppContext';

interface EditGoalModalProps {
  visible: boolean;
  currentGoal: number;
  onSave: (goal: number) => void;
  onClose: () => void;
  theme: Theme;
}

const EditGoalModal: React.FC<EditGoalModalProps> = ({ visible, currentGoal, onSave, onClose, theme }) => {
  const [val, setVal] = useState(currentGoal.toString());

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centered}>
           <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
             <View style={[styles.box, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.text }]}>Set Yearly Goal</Text>
                <TextInput 
                   style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
                   value={val}
                   onChangeText={setVal}
                   keyboardType="number-pad"
                   autoFocus
                />
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num > 0) onSave(num);
                    onClose();
                  }}
                >
                   <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Goal</Text>
                </TouchableOpacity>
             </View>
           </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  box: { width: '80%', padding: 24, borderRadius: 16, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 24, textAlign: 'center', marginBottom: 16 },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center' }
});

export default EditGoalModal;
