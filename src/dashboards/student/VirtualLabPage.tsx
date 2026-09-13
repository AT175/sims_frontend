import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { apiClient } from '@shared/api/apiClient';

const isWeb = Platform.OS === 'web';

export function VirtualLabPage() {
  const [labs, setLabs] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    loadLabs();
  }, []);

  const loadLabs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any>('/virtual-lab/labs');
      setLabs(data);
    } catch (e) {
      console.error('Failed to load labs:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const data = await apiClient.get<any>(`/virtual-lab/progress/${(apiClient as any).token ? 'me' : 'me'}`);
      setProgress(data);
    } catch (e) {
      // Progress may not exist yet
    }
  };

  const openLab = (lab: any) => {
    if (isWeb && lab.url) {
      window.open(lab.url, '_blank');
    }
  };

  const recordCompletion = async (lab: any) => {
    try {
      await apiClient.post('/virtual-lab/progress', {
        labId: lab.id,
        labTitle: lab.title,
        subject: lab.subject,
        classForm: lab.classForm?.[0],
        completed: true,
        score: 100,
        timeSpent: 600,
      });
      loadProgress();
    } catch (e) {
      console.error('Failed to record progress:', e);
    }
  };

  if (loading) {
    return (
      <View>
        <Text style={styles.pageTitle}>Virtual Science Lab</Text>
        <Text style={styles.pageSubtitle}>Loading labs...</Text>
      </View>
    );
  }

  const subjects = labs ? [...new Set([...labs.phetLabs.map((l: any) => l.subject), ...labs.customLabs.map((l: any) => l.subject)])] : [];
  const filteredPhet = selectedSubject ? labs?.phetLabs.filter((l: any) => l.subject === selectedSubject) : labs?.phetLabs;
  const filteredCustom = selectedSubject ? labs?.customLabs.filter((l: any) => l.subject === selectedSubject) : labs?.customLabs;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Virtual Science Lab</Text>
      <Text style={styles.pageSubtitle}>Interactive simulations for hands-on learning</Text>

      {progress && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress.completedLabs || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress.totalLabs || 0}</Text>
            <Text style={styles.statLabel}>Attempted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.floor((progress.totalTimeSpent || 0) / 60)}m</Text>
            <Text style={styles.statLabel}>Time Spent</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Filter by Subject</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity style={[styles.chip, !selectedSubject && styles.chipActive]} onPress={() => setSelectedSubject('')}>
          <Text style={[styles.chipText, !selectedSubject && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {subjects.map((s: string) => (
          <TouchableOpacity key={s} style={[styles.chip, selectedSubject === s && styles.chipActive]} onPress={() => setSelectedSubject(s)}>
            <Text style={[styles.chipText, selectedSubject === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredCustom && filteredCustom.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Ghana-Specific Labs</Text>
          {filteredCustom.map((lab: any) => (
            <View key={lab.id} style={styles.labCard}>
              <Text style={styles.labTitle}>{lab.title}</Text>
              <Text style={styles.labSubject}>{lab.subject} | {lab.topic}</Text>
              <Text style={styles.labDesc}>{lab.description}</Text>
              <View style={styles.labActions}>
                <TouchableOpacity style={styles.labBtn} onPress={() => openLab(lab)}>
                  <Text style={styles.labBtnText}>Open Lab</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.completeBtn} onPress={() => recordCompletion(lab)}>
                  <Text style={styles.completeBtnText}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>PhET Interactive Simulations</Text>
      {filteredPhet && filteredPhet.length > 0 ? (
        filteredPhet.map((lab: any) => (
          <View key={lab.id} style={styles.labCard}>
            <Text style={styles.labTitle}>{lab.title}</Text>
            <Text style={styles.labSubject}>{lab.subject} | {lab.topic}</Text>
            <Text style={styles.labDesc}>{lab.description}</Text>
            <View style={styles.labActions}>
              <TouchableOpacity style={styles.labBtn} onPress={() => openLab(lab)}>
                <Text style={styles.labBtnText}>Open Simulation</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.completeBtn} onPress={() => recordCompletion(lab)}>
                <Text style={styles.completeBtnText}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No simulations available for this subject.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: 20, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  labCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  labTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  labSubject: { fontSize: fontSize.sm, color: colors.primary, marginTop: spacing.xs },
  labDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.sm },
  labActions: { flexDirection: 'row', gap: spacing.sm },
  labBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, flex: 1, alignItems: 'center' },
  labBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  completeBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.success, flex: 1, alignItems: 'center' },
  completeBtnText: { color: colors.success, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  emptyText: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.lg },
});
