import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useAcademicStore } from '@store/academicStore';
import { CURRICULUM_STATUSES, TERM_NAMES } from '@store/academicStore';
import type { CurriculumStatus, TermName } from '@store/academicStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Department Overview' },
  { key: 'syllabus', label: 'Syllabus Tracker' },
  { key: 'lesson', label: 'Lesson Plan Review' },
  { key: 'exam', label: 'Internal Exam Setting' },
  { key: 'results', label: 'Result Entry' },
  { key: 'reports', label: 'Reports & PDF' },
];

const CLASS_FORMS = ['SHS1 Sci A', 'SHS1 Sci B', 'SHS1 Arts A', 'SHS1 Arts B', 'SHS1 Bus A', 'SHS1 Gen A',
  'SHS2 Sci A', 'SHS2 Sci B', 'SHS2 Arts A', 'SHS2 Arts B', 'SHS2 Bus A', 'SHS2 Gen A',
  'SHS3 Sci A', 'SHS3 Sci B', 'SHS3 Arts A', 'SHS3 Arts B', 'SHS3 Bus A', 'SHS3 Gen A'];
const LESSON_PLAN_STATUSES = ['Pending', 'Approved', 'Returned'] as const;
const EXAM_PAPER_STATUSES = ['Draft', 'Submitted', 'Under Moderation', 'Moderated', 'Finalized'] as const;
const RESULT_ENTRY_STATUSES = ['Not Started', 'In Progress', 'Complete', 'Verified'] as const;

const todayISO = () => new Date().toISOString().slice(0, 10);
const nextId = () => Math.random().toString(36).slice(2, 10);

interface LessonPlanReview {
  id: string;
  teacher: string;
  subject: string;
  classForm: string;
  topic: string;
  date: string;
  status: typeof LESSON_PLAN_STATUSES[number];
  comments?: string;
}

interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  classForm: string;
  term: TermName;
  maxScore: number;
  setter: string;
  moderator: string;
  status: typeof EXAM_PAPER_STATUSES[number];
  dateCreated: string;
  notes?: string;
}

interface ResultEntry {
  id: string;
  classForm: string;
  subject: string;
  term: TermName;
  entered: number;
  total: number;
  status: typeof RESULT_ENTRY_STATUSES[number];
  enteredBy: string;
  lastUpdated: string;
}

const INITIAL_LESSON_PLANS: LessonPlanReview[] = [];

const INITIAL_EXAM_PAPERS: ExamPaper[] = [];

const INITIAL_RESULT_ENTRIES: ResultEntry[] = [];

export function SubjectHODDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuthStore();
  const hodName = user?.displayName ?? 'Subject HOD';

  const academicStore = useAcademicStore();
  const { curriculum, addCurriculum, updateCurriculum } = academicStore;

  useEffect(() => {
    useAcademicStore.getState().loadAll();
  }, []);

  const [lessonPlans, setLessonPlans] = useState<LessonPlanReview[]>(INITIAL_LESSON_PLANS);
  const [examPapers, setExamPapers] = useState<ExamPaper[]>(INITIAL_EXAM_PAPERS);
  const [resultEntries, setResultEntries] = useState<ResultEntry[]>(INITIAL_RESULT_ENTRIES);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [syllabusForm, setSyllabusForm] = useState({ subject: '', department: 'Mathematics', hod: hodName, classForm: CLASS_FORMS[0], syllabusTopics: 0, topicsCovered: 0, status: 'Not Started' as CurriculumStatus, notes: '' });
  const [examPaperForm, setExamPaperForm] = useState({ title: '', subject: '', classForm: CLASS_FORMS[0], term: 'Term 3' as TermName, maxScore: 50, setter: '', moderator: '', notes: '' });
  const [resultForm, setResultForm] = useState({ classForm: CLASS_FORMS[0], subject: '', term: 'Term 3' as TermName, entered: '', total: '', enteredBy: '' });
  const [lessonComment, setLessonComment] = useState<{ id: string; action: 'approve' | 'return' } | null>(null);
  const [commentText, setCommentText] = useState('');

  const myCurriculum = curriculum;
  const pendingLessonPlans = lessonPlans.filter((lp) => lp.status === 'Pending');
  const pendingExamPapers = examPapers.filter((ep) => ep.status === 'Submitted' || ep.status === 'Under Moderation');
  const incompleteResults = resultEntries.filter((re) => re.status !== 'Verified');

  const avgCoverage = myCurriculum.length > 0 ? Math.round(myCurriculum.reduce((s, c) => s + c.coveragePct, 0) / myCurriculum.length) : 0;

  const openModal = (type: string, id?: string) => {
    setModalType(type);
    setEditingId(id ?? null);
    if (type === 'syllabus' && id) {
      const c = myCurriculum.find((c) => c.id === id);
      if (c) setSyllabusForm({ subject: c.subject, department: c.department, hod: c.hod, classForm: c.classForm, syllabusTopics: c.syllabusTopics, topicsCovered: c.topicsCovered, status: c.status, notes: c.notes });
    } else if (type === 'examPaper' && id) {
      const ep = examPapers.find((ep) => ep.id === id);
      if (ep) setExamPaperForm({ title: ep.title, subject: ep.subject, classForm: ep.classForm, term: ep.term, maxScore: ep.maxScore, setter: ep.setter, moderator: ep.moderator, notes: ep.notes || '' });
    } else if (type === 'result' && id) {
      const re = resultEntries.find((re) => re.id === id);
      if (re) setResultForm({ classForm: re.classForm, subject: re.subject, term: re.term, entered: String(re.entered), total: String(re.total), enteredBy: re.enteredBy });
    }
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const handleSaveSyllabus = () => {
    if (!syllabusForm.subject.trim() || !syllabusForm.classForm) { Alert.alert('Error', 'Subject and class are required'); return; }
    const coveragePct = syllabusForm.syllabusTopics > 0 ? Math.round((syllabusForm.topicsCovered / syllabusForm.syllabusTopics) * 100) : 0;
    if (editingId) {
      updateCurriculum(editingId, { ...syllabusForm, coveragePct });
    } else {
      addCurriculum({ ...syllabusForm, coveragePct } as any);
    }
    setSyllabusForm({ subject: '', department: 'Mathematics', hod: hodName, classForm: CLASS_FORMS[0], syllabusTopics: 0, topicsCovered: 0, status: 'Not Started', notes: '' });
    closeModal();
    Alert.alert('Success', editingId ? 'Syllabus entry updated' : 'Syllabus entry added');
  };

  const handleSaveExamPaper = () => {
    if (!examPaperForm.title.trim() || !examPaperForm.setter.trim()) { Alert.alert('Error', 'Title and setter are required'); return; }
    if (editingId) {
      setExamPapers((prev) => prev.map((ep) => ep.id === editingId ? { ...ep, ...examPaperForm } : ep));
    } else {
      setExamPapers((prev) => [{ ...examPaperForm, id: nextId(), status: 'Draft', dateCreated: todayISO() }, ...prev]);
    }
    setExamPaperForm({ title: '', subject: '', classForm: CLASS_FORMS[0], term: 'Term 3', maxScore: 50, setter: '', moderator: '', notes: '' });
    closeModal();
    Alert.alert('Success', editingId ? 'Exam paper updated' : 'Exam paper created');
  };

  const handleSaveResult = () => {
    const entered = parseInt(resultForm.entered) || 0;
    const total = parseInt(resultForm.total) || 0;
    if (!resultForm.subject.trim() || total <= 0) { Alert.alert('Error', 'Subject and total students are required'); return; }
    const status: typeof RESULT_ENTRY_STATUSES[number] = entered === 0 ? 'Not Started' : entered >= total ? 'Complete' : 'In Progress';
    if (editingId) {
      setResultEntries((prev) => prev.map((re) => re.id === editingId ? { ...re, ...resultForm, entered, total, status, lastUpdated: todayISO() } : re));
    } else {
      setResultEntries((prev) => [{ ...resultForm, id: nextId(), entered, total, status, lastUpdated: todayISO() }, ...prev]);
    }
    setResultForm({ classForm: CLASS_FORMS[0], subject: '', term: 'Term 3', entered: '', total: '', enteredBy: '' });
    closeModal();
    Alert.alert('Success', editingId ? 'Result entry updated' : 'Result entry added');
  };

  const handleLessonAction = () => {
    if (!lessonComment) return;
    setLessonPlans((prev) => prev.map((lp) => lp.id === lessonComment.id ? { ...lp, status: lessonComment.action === 'approve' ? 'Approved' : 'Returned', comments: commentText || undefined } : lp));
    setLessonComment(null);
    setCommentText('');
    Alert.alert('Success', `Lesson plan ${lessonComment.action === 'approve' ? 'approved' : 'returned'}`);
  };

  const advanceExamPaperStatus = (id: string) => {
    setExamPapers((prev) => prev.map((ep) => {
      if (ep.id !== id) return ep;
      const idx = EXAM_PAPER_STATUSES.indexOf(ep.status);
      if (idx < EXAM_PAPER_STATUSES.length - 1) return { ...ep, status: EXAM_PAPER_STATUSES[idx + 1] };
      return ep;
    }));
  };

  const verifyResults = (id: string) => {
    setResultEntries((prev) => prev.map((re) => re.id === id ? { ...re, status: 'Verified' } : re));
    Alert.alert('Success', 'Results verified');
  };

  const renderBadge = (status: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>{status}</Text>
    </View>
  );

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      'Pending': colors.warning, 'Approved': colors.success, 'Returned': colors.danger,
      'Draft': colors.textLight, 'Submitted': colors.info, 'Under Moderation': colors.warning,
      'Moderated': colors.success, 'Finalized': colors.primary,
      'Not Started': colors.textLight, 'In Progress': colors.warning, 'Complete': colors.info, 'Verified': colors.success,
      'Completed': colors.success, 'Revised': colors.info,
    };
    return map[s] ?? colors.textSecondary;
  };

  const renderInput = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.textArea]} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textLight} multiline={multiline} />
    </View>
  );

  const renderSelect = (label: string, value: string, options: readonly string[], onChange: (v: string) => void) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map((opt) => (
          <TouchableOpacity key={opt} style={[styles.selectChip, value === opt && styles.selectChipActive]} onPress={() => onChange(opt)}>
            <Text style={[styles.selectChipText, value === opt && styles.selectChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const generatePDF = () => {
    const now = new Date().toLocaleString();
    const dateStr = todayISO();
    let body = '';

    body += `<h2>Department Summary</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
      <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">HOD</td><td style="padding:8px 12px;border:1px solid #ddd">${hodName}</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Curriculum Entries</td><td style="padding:8px 12px;border:1px solid #ddd">${myCurriculum.length}</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Avg Coverage</td><td style="padding:8px 12px;border:1px solid #ddd">${avgCoverage}%</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Lesson Plans</td><td style="padding:8px 12px;border:1px solid #ddd">${pendingLessonPlans.length}</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Exam Papers</td><td style="padding:8px 12px;border:1px solid #ddd">${examPapers.length}</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Incomplete Results</td><td style="padding:8px 12px;border:1px solid #ddd">${incompleteResults.length}</td></tr>
    </table>`;

    body += `<h2>Syllabus Coverage</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Subject</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Topics Covered</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Total</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Coverage</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
    </tr></thead><tbody>`;
    myCurriculum.forEach((c) => {
      body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${c.subject}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.classForm}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.topicsCovered}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.syllabusTopics}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.coveragePct}%</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.status}</td></tr>`;
    });
    body += `</tbody></table>`;

    body += `<h2>Lesson Plan Reviews</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Teacher</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Topic</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
    </tr></thead><tbody>`;
    lessonPlans.forEach((lp) => {
      body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${lp.teacher}</td><td style="padding:4px 8px;border:1px solid #ddd">${lp.topic}</td><td style="padding:4px 8px;border:1px solid #ddd">${lp.classForm}</td><td style="padding:4px 8px;border:1px solid #ddd">${lp.date}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${lp.status}</td></tr>`;
    });
    body += `</tbody></table>`;

    body += `<h2>Exam Papers</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Title</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Setter</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Moderator</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
    </tr></thead><tbody>`;
    examPapers.forEach((ep) => {
      body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${ep.title}</td><td style="padding:4px 8px;border:1px solid #ddd">${ep.setter}</td><td style="padding:4px 8px;border:1px solid #ddd">${ep.moderator}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${ep.status}</td></tr>`;
    });
    body += `</tbody></table>`;

    body += `<h2>Result Entry Status</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Subject</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Entered</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Total</th>
      <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
    </tr></thead><tbody>`;
    resultEntries.forEach((re) => {
      body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${re.classForm}</td><td style="padding:4px 8px;border:1px solid #ddd">${re.subject}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${re.entered}/${re.total}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${re.total}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${re.status}</td></tr>`;
    });
    body += `</tbody></table>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Subject HOD Report</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:40px;color:#1A1A2E;max-width:900px;margin:0 auto}h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}h2{color:#2D3142;margin-top:30px}table{font-size:13px}th{font-weight:600}.footer{margin-top:40px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:20px}}</style></head><body>
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#888"><span>SIMS — Subject HOD Portal</span><span>Generated: ${now}</span></div>
      <h1>Subject HOD Department Report</h1>${body}
      <div class="footer">SIMS — Subject HOD Report — ${dateStr}</div>
      <script>window.onload=function(){window.print()}</script></body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Curriculum Entries" value={myCurriculum.length} subtitle="Tracked subjects" accentColor={colors.primary} />
              <StatCard label="Avg Coverage" value={`${avgCoverage}%`} subtitle="Syllabus coverage" accentColor={colors.info} />
              <StatCard label="Pending Reviews" value={pendingLessonPlans.length} subtitle="Lesson plans" accentColor={colors.warning} />
              <StatCard label="Exam Papers" value={examPapers.length} subtitle="In progress" accentColor={colors.purple} />
            </CardGrid>

            <Text style={styles.pageTitle}>Syllabus Coverage Summary</Text>
            <DataTable
              columns={[
                { key: 'subject', label: 'Subject', render: (i: any) => i.subject },
                { key: 'classForm', label: 'Class', render: (i: any) => i.classForm },
                { key: 'coveragePct', label: 'Coverage', render: (i: any) => `${i.coveragePct}%` },
                { key: 'status', label: 'Status', render: (i: any) => i.status },
              ]}
              data={myCurriculum}
              emptyMessage="No curriculum entries yet"
            />

            <Text style={[styles.pageTitle, { marginTop: spacing.lg }]}>Pending Lesson Plan Reviews</Text>
            <DataTable
              columns={[
                { key: 'teacher', label: 'Teacher', render: (i: any) => i.teacher },
                { key: 'topic', label: 'Topic', render: (i: any) => i.topic },
                { key: 'date', label: 'Date', render: (i: any) => i.date },
                { key: 'status', label: 'Status', render: (i: any) => i.status },
              ]}
              data={pendingLessonPlans}
              emptyMessage="No pending lesson plans"
            />
          </View>
        );

      case 'syllabus':
        return (
          <View>
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.pageTitle}>Syllabus Tracker</Text>
                <Text style={styles.pageSubtitle}>Topic-by-topic coverage log per class</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('syllabus')}>
                <Text style={styles.actionBtnText}>+ Add Entry</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Entries" value={myCurriculum.length} accentColor={colors.primary} />
              <StatCard label="Avg Coverage" value={`${avgCoverage}%`} accentColor={colors.info} />
              <StatCard label="Completed" value={myCurriculum.filter((c) => c.status === 'Completed').length} accentColor={colors.success} />
              <StatCard label="At Risk (<60%)" value={myCurriculum.filter((c) => c.coveragePct < 60).length} accentColor={colors.danger} />
            </CardGrid>

            <DataTable
              columns={[
                { key: 'subject', label: 'Subject', render: (i: any) => i.subject },
                { key: 'classForm', label: 'Class', render: (i: any) => i.classForm },
                { key: 'topicsCovered', label: 'Covered', render: (i: any) => `${i.topicsCovered}/${i.syllabusTopics}` },
                { key: 'coveragePct', label: 'Coverage', render: (i: any) => `${i.coveragePct}%` },
                { key: 'status', label: 'Status', render: (i: any) => i.status },
                { key: 'actions', label: 'Actions', render: () => 'Edit | Delete' },
              ]}
              data={myCurriculum}
              emptyMessage="No syllabus entries yet. Click '+ Add Entry' to start."
            />
          </View>
        );

      case 'lesson':
        return (
          <View>
            <Text style={styles.pageTitle}>Lesson Plan Review</Text>
            <Text style={styles.pageSubtitle}>Approve or return teachers' lesson plans with comments</Text>

            <CardGrid>
              <StatCard label="Total Plans" value={lessonPlans.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={pendingLessonPlans.length} accentColor={colors.warning} />
              <StatCard label="Approved" value={lessonPlans.filter((lp) => lp.status === 'Approved').length} accentColor={colors.success} />
              <StatCard label="Returned" value={lessonPlans.filter((lp) => lp.status === 'Returned').length} accentColor={colors.danger} />
            </CardGrid>

            <ScrollView style={styles.lessonList} showsVerticalScrollIndicator={false}>
              {lessonPlans.map((lp) => (
                <View key={lp.id} style={styles.lessonCard}>
                  <View style={styles.lessonCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lessonTopic}>{lp.topic}</Text>
                      <Text style={styles.lessonMeta}>{lp.teacher} • {lp.classForm} • {lp.date}</Text>
                      {lp.comments ? <Text style={styles.lessonComment}>Comment: {lp.comments}</Text> : null}
                    </View>
                    {renderBadge(lp.status, statusColor(lp.status))}
                  </View>
                  {lp.status === 'Pending' && (
                    <View style={styles.lessonActions}>
                      <TouchableOpacity style={[styles.lessonBtn, styles.lessonBtnApprove]} onPress={() => { setLessonComment({ id: lp.id, action: 'approve' }); setCommentText(''); }}>
                        <Text style={styles.lessonBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.lessonBtn, styles.lessonBtnReturn]} onPress={() => { setLessonComment({ id: lp.id, action: 'return' }); setCommentText(''); }}>
                        <Text style={styles.lessonBtnText}>Return</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'exam':
        return (
          <View>
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.pageTitle}>Internal Exam Setting</Text>
                <Text style={styles.pageSubtitle}>Coordinate question paper creation and moderation</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('examPaper')}>
                <Text style={styles.actionBtnText}>+ Create Exam Paper</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Papers" value={examPapers.length} accentColor={colors.primary} />
              <StatCard label="Pending Moderation" value={pendingExamPapers.length} accentColor={colors.warning} />
              <StatCard label="Moderated" value={examPapers.filter((ep) => ep.status === 'Moderated').length} accentColor={colors.success} />
              <StatCard label="Finalized" value={examPapers.filter((ep) => ep.status === 'Finalized').length} accentColor={colors.info} />
            </CardGrid>

            <DataTable
              columns={[
                { key: 'title', label: 'Exam Paper', render: (i: any) => i.title },
                { key: 'subject', label: 'Subject', render: (i: any) => i.subject },
                { key: 'classForm', label: 'Class', render: (i: any) => i.classForm },
                { key: 'setter', label: 'Setter', render: (i: any) => i.setter },
                { key: 'moderator', label: 'Moderator', render: (i: any) => i.moderator },
                { key: 'status', label: 'Status', render: (i: any) => i.status },
              ]}
              data={examPapers}
              emptyMessage="No exam papers yet. Click '+ Create Exam Paper' to start."
            />

            <View style={{ marginTop: spacing.lg }}>
              {examPapers.map((ep) => (
                <View key={ep.id} style={styles.examCard}>
                  <View style={styles.lessonCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lessonTopic}>{ep.title}</Text>
                      <Text style={styles.lessonMeta}>{ep.subject} • {ep.classForm} • {ep.term} • Max: {ep.maxScore}</Text>
                      <Text style={styles.lessonMeta}>Setter: {ep.setter} • Moderator: {ep.moderator}</Text>
                      {ep.notes ? <Text style={styles.lessonComment}>Notes: {ep.notes}</Text> : null}
                    </View>
                    {renderBadge(ep.status, statusColor(ep.status))}
                  </View>
                  <View style={styles.lessonActions}>
                    <TouchableOpacity style={[styles.lessonBtn, styles.lessonBtnEdit]} onPress={() => openModal('examPaper', ep.id)}>
                      <Text style={styles.lessonBtnText}>Edit</Text>
                    </TouchableOpacity>
                    {ep.status !== 'Finalized' && (
                      <TouchableOpacity style={[styles.lessonBtn, styles.lessonBtnApprove]} onPress={() => advanceExamPaperStatus(ep.id)}>
                        <Text style={styles.lessonBtnText}>Advance Status</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 'results':
        return (
          <View>
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.pageTitle}>Result Entry</Text>
                <Text style={styles.pageSubtitle}>Track score entry progress per class and verify</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('result')}>
                <Text style={styles.actionBtnText}>+ Add Entry</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Entries" value={resultEntries.length} accentColor={colors.primary} />
              <StatCard label="Complete" value={resultEntries.filter((re) => re.status === 'Complete' || re.status === 'Verified').length} accentColor={colors.success} />
              <StatCard label="In Progress" value={resultEntries.filter((re) => re.status === 'In Progress').length} accentColor={colors.warning} />
              <StatCard label="Verified" value={resultEntries.filter((re) => re.status === 'Verified').length} accentColor={colors.info} />
            </CardGrid>

            <DataTable
              columns={[
                { key: 'classForm', label: 'Class', render: (i: any) => i.classForm },
                { key: 'subject', label: 'Subject', render: (i: any) => i.subject },
                { key: 'entered', label: 'Entered', render: (i: any) => `${i.entered}/${i.total}` },
                { key: 'status', label: 'Status', render: (i: any) => i.status },
                { key: 'enteredBy', label: 'Entered By', render: (i: any) => i.enteredBy || '—' },
              ]}
              data={resultEntries}
              emptyMessage="No result entries yet. Click '+ Add Entry' to start."
            />

            <View style={{ marginTop: spacing.lg }}>
              {resultEntries.map((re) => (
                <View key={re.id} style={styles.examCard}>
                  <View style={styles.lessonCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lessonTopic}>{re.classForm} — {re.subject}</Text>
                      <Text style={styles.lessonMeta}>Term: {re.term} • Entered: {re.entered}/{re.total} • By: {re.enteredBy || '—'}</Text>
                      {re.lastUpdated ? <Text style={styles.lessonComment}>Last updated: {re.lastUpdated}</Text> : null}
                    </View>
                    {renderBadge(re.status, statusColor(re.status))}
                  </View>
                  <View style={styles.lessonActions}>
                    <TouchableOpacity style={[styles.lessonBtn, styles.lessonBtnEdit]} onPress={() => openModal('result', re.id)}>
                      <Text style={styles.lessonBtnText}>Edit</Text>
                    </TouchableOpacity>
                    {re.status === 'Complete' && (
                      <TouchableOpacity style={[styles.lessonBtn, styles.lessonBtnApprove]} onPress={() => verifyResults(re.id)}>
                        <Text style={styles.lessonBtnText}>Verify</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports & PDF</Text>
            <Text style={styles.pageSubtitle}>Generate printable department reports</Text>

            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>Full Department Report</Text>
              <Text style={styles.reportDesc}>Complete report including syllabus coverage, lesson plan reviews, exam papers, and result entry status.</Text>
              <TouchableOpacity style={styles.reportBtn} onPress={generatePDF}>
                <Text style={styles.reportBtnText}>Generate Full Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title={`Subject HOD — ${hodName}`}
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}
    >
      {renderPage()}

      {/* Syllabus Modal */}
      <Modal visible={showModal && modalType === 'syllabus'} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Syllabus Entry' : 'Add Syllabus Entry'}</Text>

              {renderInput('Subject', syllabusForm.subject, (v) => setSyllabusForm({ ...syllabusForm, subject: v }), 'e.g. Core Mathematics')}
              {renderInput('Department', syllabusForm.department, (v) => setSyllabusForm({ ...syllabusForm, department: v }))}
              {renderInput('HOD', syllabusForm.hod, (v) => setSyllabusForm({ ...syllabusForm, hod: v }))}
              {renderSelect('Class', syllabusForm.classForm, CLASS_FORMS, (v) => setSyllabusForm({ ...syllabusForm, classForm: v }))}
              {renderInput('Total Syllabus Topics', String(syllabusForm.syllabusTopics), (v) => setSyllabusForm({ ...syllabusForm, syllabusTopics: parseInt(v) || 0 }), 'e.g. 52')}
              {renderInput('Topics Covered', String(syllabusForm.topicsCovered), (v) => setSyllabusForm({ ...syllabusForm, topicsCovered: parseInt(v) || 0 }), 'e.g. 38')}
              {renderSelect('Status', syllabusForm.status, CURRICULUM_STATUSES, (v) => setSyllabusForm({ ...syllabusForm, status: v as CurriculumStatus }))}
              {renderInput('Notes', syllabusForm.notes, (v) => setSyllabusForm({ ...syllabusForm, notes: v }), 'Additional notes...', true)}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleSaveSyllabus}><Text style={styles.modalBtnTextLight}>{editingId ? 'Update' : 'Add'}</Text></TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Exam Paper Modal */}
      <Modal visible={showModal && modalType === 'examPaper'} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Exam Paper' : 'Create Exam Paper'}</Text>

              {renderInput('Title', examPaperForm.title, (v) => setExamPaperForm({ ...examPaperForm, title: v }), 'e.g. Core Math Mid-Sem 3')}
              {renderInput('Subject', examPaperForm.subject, (v) => setExamPaperForm({ ...examPaperForm, subject: v }), 'e.g. Core Mathematics')}
              {renderSelect('Class', examPaperForm.classForm, CLASS_FORMS, (v) => setExamPaperForm({ ...examPaperForm, classForm: v }))}
              {renderSelect('Term', examPaperForm.term, TERM_NAMES, (v) => setExamPaperForm({ ...examPaperForm, term: v as TermName }))}
              {renderInput('Max Score', String(examPaperForm.maxScore), (v) => setExamPaperForm({ ...examPaperForm, maxScore: parseInt(v) || 50 }), 'e.g. 50')}
              {renderInput('Setter', examPaperForm.setter, (v) => setExamPaperForm({ ...examPaperForm, setter: v }), 'Teacher name')}
              {renderInput('Moderator', examPaperForm.moderator, (v) => setExamPaperForm({ ...examPaperForm, moderator: v }), 'Moderator name')}
              {renderInput('Notes', examPaperForm.notes, (v) => setExamPaperForm({ ...examPaperForm, notes: v }), 'Additional notes...', true)}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleSaveExamPaper}><Text style={styles.modalBtnTextLight}>{editingId ? 'Update' : 'Create'}</Text></TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Result Entry Modal */}
      <Modal visible={showModal && modalType === 'result'} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Result Entry' : 'Add Result Entry'}</Text>

              {renderSelect('Class', resultForm.classForm, CLASS_FORMS, (v) => setResultForm({ ...resultForm, classForm: v }))}
              {renderInput('Subject', resultForm.subject, (v) => setResultForm({ ...resultForm, subject: v }), 'e.g. Core Mathematics')}
              {renderSelect('Term', resultForm.term, TERM_NAMES, (v) => setResultForm({ ...resultForm, term: v as TermName }))}
              {renderInput('Scores Entered', resultForm.entered, (v) => setResultForm({ ...resultForm, entered: v }), 'e.g. 38')}
              {renderInput('Total Students', resultForm.total, (v) => setResultForm({ ...resultForm, total: v }), 'e.g. 42')}
              {renderInput('Entered By', resultForm.enteredBy, (v) => setResultForm({ ...resultForm, enteredBy: v }), 'Teacher name')}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleSaveResult}><Text style={styles.modalBtnTextLight}>{editingId ? 'Update' : 'Add'}</Text></TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Lesson Plan Comment Modal */}
      <Modal visible={!!lessonComment} animationType="slide" transparent onRequestClose={() => setLessonComment(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{lessonComment?.action === 'approve' ? 'Approve Lesson Plan' : 'Return Lesson Plan'}</Text>
            <Text style={styles.modalSubtitle}>Add a comment (optional)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={commentText} onChangeText={setCommentText} placeholder="Enter feedback or comments..." placeholderTextColor={colors.textLight} multiline numberOfLines={4} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setLessonComment(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, lessonComment?.action === 'approve' ? styles.modalBtnSubmit : styles.modalBtnReturn]} onPress={handleLessonAction}><Text style={styles.modalBtnTextLight}>{lessonComment?.action === 'approve' ? 'Approve' : 'Return'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  statusBadge: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  lessonList: { maxHeight: 600 },
  lessonCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight },
  lessonCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  lessonTopic: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  lessonMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  lessonComment: { fontSize: fontSize.sm, color: colors.textLight, fontStyle: 'italic' },
  lessonActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  lessonBtn: { borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' },
  lessonBtnApprove: { backgroundColor: colors.success },
  lessonBtnReturn: { backgroundColor: colors.danger },
  lessonBtnEdit: { backgroundColor: colors.info },
  lessonBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  examCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight },
  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight },
  reportTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  reportDesc: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  reportBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  reportBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalScroll: { width: '100%', maxWidth: 560 },
  modalScrollContent: { paddingVertical: spacing.xxl },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  modalSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: fontSize.md, color: colors.text },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  selectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  selectChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  selectChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnReturn: { backgroundColor: colors.danger },
  modalBtnTextDark: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  modalBtnTextLight: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
