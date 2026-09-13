import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { apiClient } from '@shared/api/apiClient';

export function AITutorPage() {
  const [subject, setSubject] = useState('Mathematics');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [weakAreas, setWeakAreas] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadWeakAreas();
    loadHistory();
  }, []);

  const loadWeakAreas = async () => {
    try {
      const data = await apiClient.get<any>('/tutor/weak-areas/me');
      setWeakAreas(data);
    } catch (e) { /* not available */ }
  };

  const loadHistory = async () => {
    try {
      const data = await apiClient.get<any[]>('/tutor/history/me');
      setHistory(data);
    } catch (e) { /* not available */ }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user', content: question, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuestion = question;
    setQuestion('');

    try {
      const result = await apiClient.post<any>('/tutor/ask', { subject, question: currentQuestion, sessionId });
      setSessionId(result.sessionId);
      setMessages((prev) => [...prev, { role: 'tutor', content: result.answer, timestamp: new Date().toISOString() }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'tutor', content: 'Sorry, I could not process your question. Please try again.', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const quickAsk = (q: string) => {
    setQuestion(q);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <Text style={styles.pageTitle}>AI Tutor</Text>
        <Text style={styles.pageSubtitle}>Your personal learning assistant</Text>

        {weakAreas && weakAreas.weakAreas && weakAreas.weakAreas.length > 0 && (
          <View style={styles.weakAreaCard}>
            <Text style={styles.weakAreaTitle}>Subjects to Focus On</Text>
            {weakAreas.weakAreas.map((a: any, i: number) => (
              <Text key={i} style={styles.weakAreaItem}>• {a.subject}: {a.averageScore}%</Text>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Subject</Text>
        <View style={styles.chipRow}>
          {['Mathematics', 'English Language', 'Science', 'Social Studies', 'Physics (Elective)', 'Chemistry (Elective)'].map((s) => (
            <TouchableOpacity key={s} style={[styles.chip, subject === s && styles.chipActive]} onPress={() => setSubject(s)}>
              <Text style={[styles.chipText, subject === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Questions</Text>
        <View style={styles.chipRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => quickAsk(`Explain today's lesson on ${subject}`)}>
            <Text style={styles.quickBtnText}>Explain today's lesson</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => quickAsk(`Give me practice questions on ${subject}`)}>
            <Text style={styles.quickBtnText}>Practice questions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => quickAsk(`I don't understand ${subject}, can you help?`)}>
            <Text style={styles.quickBtnText}>I need help</Text>
          </TouchableOpacity>
        </View>

        {messages.length > 0 && (
          <View style={styles.chatContainer}>
            {messages.map((msg, i) => (
              <View key={i} style={[styles.chatBubble, msg.role === 'user' ? styles.userBubble : styles.tutorBubble]}>
                <Text style={[styles.chatText, msg.role === 'user' ? styles.userText : styles.tutorText]}>{msg.content}</Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.chatBubble, styles.tutorBubble]}>
                <Text style={styles.tutorText}>Thinking...</Text>
              </View>
            )}
          </View>
        )}

        {history.length > 0 && messages.length === 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {history.slice(0, 5).map((h, i) => (
              <TouchableOpacity key={i} style={styles.historyCard} onPress={() => setSessionId(h.id)}>
                <Text style={styles.historySubject}>{h.subject}</Text>
                <Text style={styles.historyMeta}>{h.topic || 'General'} | {h.messageCount} messages</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Ask about ${subject}...`}
          placeholderTextColor={colors.textLight}
          value={question}
          onChangeText={setQuestion}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={askQuestion} disabled={loading || !question.trim()}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  weakAreaCard: { backgroundColor: '#fef3c7', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  weakAreaTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: '#92400e', marginBottom: spacing.xs },
  weakAreaItem: { fontSize: fontSize.sm, color: '#92400e', marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: 20, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  quickBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  quickBtnText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  chatContainer: { marginTop: spacing.md, gap: spacing.sm },
  chatBubble: { maxWidth: '85%', borderRadius: radius.md, padding: spacing.md },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  tutorBubble: { alignSelf: 'flex-start', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chatText: { fontSize: fontSize.sm },
  userText: { color: colors.white },
  tutorText: { color: colors.text },
  historyCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  historySubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  historyMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  inputContainer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, maxHeight: 80 },
  sendBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  sendBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
