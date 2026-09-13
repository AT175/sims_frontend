import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { apiClient } from '@shared/api/apiClient';

export function PeerLearningPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ subject: 'Mathematics', topic: '', question: '', tags: '' });
  const [newAnswer, setNewAnswer] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'forum' | 'groups' | 'leaderboard'>('forum');
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    loadQuestions();
    loadLeaderboard();
    loadGroups();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await apiClient.get<any[]>('/peer/questions');
      setQuestions(data);
    } catch (e) { console.error('Failed to load questions:', e); }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await apiClient.get<any[]>('/peer/leaderboard');
      setLeaderboard(data);
    } catch (e) { /* not available */ }
  };

  const loadGroups = async () => {
    try {
      const data = await apiClient.get<any[]>('/peer/groups');
      setGroups(data);
    } catch (e) { /* not available */ }
  };

  const askQuestion = async () => {
    if (!newQuestion.question.trim()) return;
    try {
      await apiClient.post('/peer/questions', {
        subject: newQuestion.subject,
        topic: newQuestion.topic,
        question: newQuestion.question,
        tags: newQuestion.tags ? newQuestion.tags.split(',').map((t) => t.trim()) : [],
      });
      setShowAskModal(false);
      setNewQuestion({ subject: 'Mathematics', topic: '', question: '', tags: '' });
      loadQuestions();
    } catch (e: any) {
      alert(e.message || 'Failed to post question');
    }
  };

  const openQuestion = async (q: any) => {
    setSelectedQuestion(q);
    try {
      const data = await apiClient.get<any>(`/peer/questions/${q.id}`);
      setAnswers(data.answers || []);
    } catch (e) { /* not available */ }
  };

  const submitAnswer = async () => {
    if (!newAnswer.trim() || !selectedQuestion) return;
    try {
      await apiClient.post(`/peer/questions/${selectedQuestion.id}/answers`, { content: newAnswer });
      setNewAnswer('');
      setShowAnswerModal(false);
      openQuestion(selectedQuestion);
    } catch (e: any) {
      alert(e.message || 'Failed to post answer');
    }
  };

  const upvoteQuestion = async (q: any) => {
    try {
      await apiClient.post(`/peer/questions/${q.id}/upvote`);
      loadQuestions();
    } catch (e) { /* not available */ }
  };

  const joinGroup = async (groupId: string) => {
    try {
      await apiClient.post(`/peer/groups/${groupId}/join`);
      loadGroups();
    } catch (e: any) {
      alert(e.message || 'Failed to join group');
    }
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Peer Learning</Text>
      <Text style={styles.pageSubtitle}>Learn together — ask questions, answer peers, join study groups</Text>

      <View style={styles.tabRow}>
        {(['forum', 'groups', 'leaderboard'] as const).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'forum' ? 'Q&A Forum' : tab === 'groups' ? 'Study Groups' : 'Leaderboard'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'forum' && (
        <View>
          <TouchableOpacity style={styles.askBtn} onPress={() => setShowAskModal(true)}>
            <Text style={styles.askBtnText}>+ Ask a Question</Text>
          </TouchableOpacity>

          {selectedQuestion ? (
            <View style={styles.selectedQuestionCard}>
              <TouchableOpacity onPress={() => setSelectedQuestion(null)}>
                <Text style={styles.backLink}>← Back to questions</Text>
              </TouchableOpacity>
              <Text style={styles.qTitle}>{selectedQuestion.question}</Text>
              <Text style={styles.qMeta}>{selectedQuestion.subject} | {selectedQuestion.studentName} | {selectedQuestion.upvotes} upvotes</Text>
              {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {selectedQuestion.tags.map((tag: string, i: number) => (
                    <Text key={i} style={styles.tag}>{tag}</Text>
                  ))}
                </View>
              )}

              <Text style={styles.sectionTitle}>Answers ({answers.length})</Text>
              {answers.length > 0 ? (
                answers.map((a, i) => (
                  <View key={i} style={[styles.answerCard, a.isAccepted && styles.acceptedAnswer]}>
                    <Text style={styles.answerText}>{a.content}</Text>
                    <Text style={styles.answerMeta}>{a.studentName} | {a.upvotes} upvotes {a.isAccepted ? '✓ Accepted' : ''}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No answers yet. Be the first to answer!</Text>
              )}

              <TouchableOpacity style={styles.answerBtn} onPress={() => setShowAnswerModal(true)}>
                <Text style={styles.answerBtnText}>+ Answer This Question</Text>
              </TouchableOpacity>
            </View>
          ) : (
            questions.length > 0 ? (
              questions.map((q) => (
                <TouchableOpacity key={q.id} style={styles.questionCard} onPress={() => openQuestion(q)}>
                  <Text style={styles.qTitle}>{q.question}</Text>
                  <Text style={styles.qMeta}>{q.subject} | {q.studentName} | {q.answerCount} answers | {q.upvotes} upvotes</Text>
                  {q.tags && q.tags.length > 0 && (
                    <View style={styles.tagRow}>
                      {q.tags.map((tag: string, i: number) => (
                        <Text key={i} style={styles.tag}>{tag}</Text>
                      ))}
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xs }}>
                    <TouchableOpacity style={styles.upvoteBtn} onPress={(e) => { e.stopPropagation?.(); upvoteQuestion(q); }}>
                      <Text style={styles.upvoteBtnText}>▲ Upvote ({q.upvotes})</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No questions yet. Be the first to ask!</Text>
            )
          )}
        </View>
      )}

      {activeTab === 'groups' && (
        <View>
          <Text style={styles.sectionTitle}>Study Groups</Text>
          {groups.length > 0 ? (
            groups.map((g) => (
              <View key={g.id} style={styles.groupCard}>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupMeta}>{g.subject} | {g.members?.length || 0} members</Text>
                {g.description && <Text style={styles.groupDesc}>{g.description}</Text>}
                <TouchableOpacity style={styles.joinBtn} onPress={() => joinGroup(g.id)}>
                  <Text style={styles.joinBtnText}>Join Group</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No study groups yet. Ask your teacher to create one!</Text>
          )}
        </View>
      )}

      {activeTab === 'leaderboard' && (
        <View>
          <Text style={styles.sectionTitle}>Top Contributors</Text>
          {leaderboard.length > 0 ? (
            leaderboard.map((l, i) => (
              <View key={i} style={styles.leaderboardCard}>
                <Text style={styles.rank}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaderName}>{l.name}</Text>
                  <Text style={styles.leaderStats}>{l.answers} answers | {l.upvotes} upvotes | {l.accepted} accepted</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No contributions yet. Start answering questions to climb the leaderboard!</Text>
          )}
        </View>
      )}

      <Modal visible={showAskModal} animationType="slide" transparent onRequestClose={() => setShowAskModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ask a Question</Text>
            <Text style={styles.inputLabel}>Subject</Text>
            <View style={styles.chipRow}>
              {['Mathematics', 'English Language', 'Science', 'Social Studies', 'Physics (Elective)', 'Chemistry (Elective)'].map((s) => (
                <TouchableOpacity key={s} style={[styles.chip, newQuestion.subject === s && styles.chipActive]} onPress={() => setNewQuestion({ ...newQuestion, subject: s })}>
                  <Text style={[styles.chipText, newQuestion.subject === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Topic (optional)</Text>
            <TextInput style={styles.input} value={newQuestion.topic} onChangeText={(v) => setNewQuestion({ ...newQuestion, topic: v })} placeholder="e.g. Quadratic equations" placeholderTextColor={colors.textLight} />
            <Text style={styles.inputLabel}>Your Question</Text>
            <TextInput style={[styles.input, { minHeight: 80 }]} value={newQuestion.question} onChangeText={(v) => setNewQuestion({ ...newQuestion, question: v })} placeholder="Type your question..." placeholderTextColor={colors.textLight} multiline />
            <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
            <TextInput style={styles.input} value={newQuestion.tags} onChangeText={(v) => setNewQuestion({ ...newQuestion, tags: v })} placeholder="e.g. algebra, equations" placeholderTextColor={colors.textLight} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAskModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={askQuestion}>
                <Text style={styles.saveBtnText}>Post Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAnswerModal} animationType="slide" transparent onRequestClose={() => setShowAnswerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Answer Question</Text>
            <Text style={styles.qPreview}>{selectedQuestion?.question}</Text>
            <TextInput style={[styles.input, { minHeight: 100 }]} value={newAnswer} onChangeText={setNewAnswer} placeholder="Type your answer..." placeholderTextColor={colors.textLight} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAnswerModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={submitAnswer}>
                <Text style={styles.saveBtnText}>Post Answer</Text>
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
  tabRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: fontSize.sm, color: colors.textSecondary },
  tabTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  askBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignSelf: 'flex-start', marginBottom: spacing.md },
  askBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  questionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  selectedQuestionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  backLink: { fontSize: fontSize.sm, color: colors.primary, marginBottom: spacing.sm },
  qTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  qMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  qPreview: { fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm, fontStyle: 'italic' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: { fontSize: fontSize.xs, backgroundColor: colors.surfaceAlt, color: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 10 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  answerCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm },
  acceptedAnswer: { borderWidth: 2, borderColor: colors.success },
  answerText: { fontSize: fontSize.sm, color: colors.text },
  answerMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  answerBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignSelf: 'flex-start', marginTop: spacing.sm },
  answerBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  groupCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  groupName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  groupMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  groupDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.sm },
  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, alignSelf: 'flex-start' },
  joinBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  leaderboardCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  rank: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  leaderName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  leaderStats: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.lg },
  upvoteBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.primary },
  upvoteBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500 },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
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
