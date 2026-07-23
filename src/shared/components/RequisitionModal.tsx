import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useRequisitionStore } from '@store/requisitionStore';

const UNITS = ['bags', 'cartons', 'gallons', 'boxes', 'units', 'litres', 'kg', 'rolls', 'bottles', 'packs'];
const PRIORITIES = ['Low', 'Normal', 'Urgent'];

interface RequisitionModalProps {
  visible: boolean;
  onClose: () => void;
  department: string;
  requestedBy: string;
  defaultItem?: string;
  defaultUnit?: string;
  house?: string;
}

export function RequisitionModal({
  visible,
  onClose,
  department,
  requestedBy,
  defaultItem = '',
  defaultUnit = UNITS[0],
  house,
}: RequisitionModalProps) {
  const { submitRequisition } = useRequisitionStore();

  const [itemName, setItemName] = useState(defaultItem);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState(defaultUnit);
  const [priority, setPriority] = useState('Normal');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!itemName.trim() || !quantity.trim()) {
      Alert.alert('Error', 'Please enter item name and quantity');
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Invalid quantity');
      return;
    }
    submitRequisition({
      itemName: itemName.trim(),
      quantity: qty,
      unit,
      department,
      requestedBy,
      priority: priority as 'Low' | 'Normal' | 'Urgent',
      notes: notes.trim(),
      house,
    });
    setItemName('');
    setQuantity('');
    setUnit(defaultUnit);
    setPriority('Normal');
    setNotes('');
    onClose();
    Alert.alert('Success', `Requisition submitted to Stores for ${department}!`);
  };

  const handleClose = () => {
    setItemName('');
    setQuantity('');
    setUnit(defaultUnit);
    setPriority('Normal');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Requisition</Text>
            <Text style={styles.modalSubtitle}>Request items from Stores — {department}</Text>

            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder="e.g. Cooking oil"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g. 5"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Unit</Text>
            <View style={styles.selectRow}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.selectChip, unit === u && styles.selectChipActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.selectChipText, unit === u && styles.selectChipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.selectRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.selectChip,
                    priority === p && styles.selectChipActive,
                    p === 'Urgent' && priority === p && { borderColor: colors.danger, backgroundColor: colors.danger + '15' },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      priority === p && styles.selectChipTextActive,
                      p === 'Urgent' && priority === p && { color: colors.danger },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes for the Stores Officer..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.requesterInfo}>Requested by: {requestedBy}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={handleClose}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleSubmit}>
                <Text style={styles.modalBtnTextLight}>Submit to Stores</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalScroll: { width: '100%', maxHeight: '90%' },
  modalScrollContent: { alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 480, padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  textArea: { minHeight: 60 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  selectChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  selectChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  selectChipTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  requesterInfo: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm, marginBottom: spacing.sm },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
});
