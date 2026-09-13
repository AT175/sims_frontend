import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { apiClient } from '@shared/api/apiClient';

export function CareerCenterPage() {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [favoriteSubjects, setFavoriteSubjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'universities' | 'scholarships' | 'careers'>('recommendations');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, opps] = await Promise.all([
        apiClient.get<any>('/career/recommendations/me').catch(() => null),
        apiClient.get<any>('/career/opportunities').catch(() => null),
      ]);
      setRecommendations(recs);
      setOpportunities(opps);
      if (recs?.profile) {
        setInterests(recs.profile.interests || []);
        setFavoriteSubjects(recs.profile.favoriteSubjects || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      await apiClient.post('/career/profile', { studentId: 'me', interests, favoriteSubjects });
      setShowProfileModal(false);
      loadData();
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  if (loading) {
    return (
      <View>
        <Text style={styles.pageTitle}>Career Center</Text>
        <Text style={styles.pageSubtitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Career Center</Text>
      <Text style={styles.pageSubtitle}>Plan your future — universities, scholarships, and careers</Text>

      <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfileModal(true)}>
        <Text style={styles.profileBtnText}>Update My Interests</Text>
      </TouchableOpacity>

      <View style={styles.tabRow}>
        {(['recommendations', 'universities', 'scholarships', 'careers'] as const).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'recommendations' ? 'For You' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'recommendations' && recommendations && (
        <View>
          <Text style={styles.sectionTitle}>Recommended Career Paths</Text>
          {recommendations.recommendedCareers?.map((c: any, i: number) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{c.name}</Text>
              <Text style={styles.cardMeta}>{c.category} | {c.matchScore} subject match</Text>
              <Text style={styles.cardDesc}>{c.description}</Text>
              <Text style={styles.cardMeta}>Careers: {c.careers.join(', ')}</Text>
              <Text style={styles.cardMeta}>Salary: {c.averageSalary}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Recommended Universities</Text>
          {recommendations.recommendedUniversities?.map((u: any, i: number) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{u.name}</Text>
              <Text style={styles.cardMeta}>{u.country} | {u.type}</Text>
              <Text style={styles.cardDesc}>{u.description}</Text>
              <Text style={[styles.cardMeta, { color: u.eligible.includes('Strong') ? colors.success : u.eligible.includes('Good') ? colors.primary : colors.warning }]}>
                {u.eligible}
              </Text>
              <Text style={styles.cardMeta}>Programs: {u.programs.join(', ')}</Text>
              <Text style={styles.cardMeta}>Requirements: {u.minGrade}</Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'universities' && opportunities && (
        <View>
          {opportunities.universities?.map((u: any, i: number) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{u.name}</Text>
              <Text style={styles.cardMeta}>{u.country} | {u.type}</Text>
              <Text style={styles.cardDesc}>{u.description}</Text>
              <Text style={styles.cardMeta}>Programs: {u.programs.join(', ')}</Text>
              <Text style={styles.cardMeta}>Min Grade: {u.minGrade}</Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'scholarships' && opportunities && (
        <View>
          {opportunities.scholarships?.map((s: any, i: number) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{s.name}</Text>
              <Text style={styles.cardMeta}>{s.provider} | {s.level}</Text>
              <Text style={styles.cardDesc}>{s.description}</Text>
              <Text style={styles.cardMeta}>Amount: {s.amount}</Text>
              <Text style={styles.cardMeta}>Deadline: {s.deadline}</Text>
              <Text style={styles.cardMeta}>Countries: {s.countries.join(', ')}</Text>
              <Text style={styles.cardMeta}>Eligibility: {s.eligibility.join(', ')}</Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'careers' && opportunities && (
        <View>
          {opportunities.careerPaths?.map((c: any, i: number) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{c.name}</Text>
              <Text style={styles.cardMeta}>{c.category}</Text>
              <Text style={styles.cardDesc}>{c.description}</Text>
              <Text style={styles.cardMeta}>Subjects: {c.subjects.join(', ')}</Text>
              <Text style={styles.cardMeta}>Careers: {c.careers.join(', ')}</Text>
              <Text style={styles.cardMeta}>Salary: {c.averageSalary}</Text>
            </View>
          ))}
        </View>
      )}

      <Modal visible={showProfileModal} animationType="slide" transparent onRequestClose={() => setShowProfileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Career Interests</Text>
            <Text style={styles.inputLabel}>Select your interests:</Text>
            <View style={styles.chipRow}>
              {['STEM', 'Business', 'Healthcare', 'Arts', 'Education', 'Agriculture', 'Law', 'Technology'].map((int) => (
                <TouchableOpacity key={int} style={[styles.chip, interests.includes(int) && styles.chipActive]} onPress={() => {
                  setInterests((prev) => prev.includes(int) ? prev.filter((x) => x !== int) : [...prev, int]);
                }}>
                  <Text style={[styles.chipText, interests.includes(int) && styles.chipTextActive]}>{int}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Favorite subjects:</Text>
            <View style={styles.chipRow}>
              {['Mathematics', 'English Language', 'Science', 'Physics (Elective)', 'Chemistry (Elective)', 'Biology (Elective)', 'Economics (Elective)', 'Geography (Elective)', 'History (Elective)'].map((s) => (
                <TouchableOpacity key={s} style={[styles.chip, favoriteSubjects.includes(s) && styles.chipActive]} onPress={() => {
                  setFavoriteSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
                }}>
                  <Text style={[styles.chipText, favoriteSubjects.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProfileModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  profileBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignSelf: 'flex-start', marginBottom: spacing.md },
  profileBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  tabRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: fontSize.sm, color: colors.textSecondary },
  tabTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  cardDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500 },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: 20, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'flex-end' },
  cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  cancelBtnText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  saveBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.primary },
  saveBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
