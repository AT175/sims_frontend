import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable, KitchenMenuWidget } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { usePLCStore, OBSERVATION_RATINGS } from '@store/plcStore';
import type { ObservationRating } from '@store/plcStore';
import { useTeacherStore } from '@store/teacherStore';
import {
  MATERIAL_TYPES,
  ANNOUNCEMENT_PRIORITIES, DAYS_OF_WEEK,
  REMEDIAL_PROGRESS,
} from '@store/teacherStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'subjects', label: 'My Subjects & Classes' },
  { key: 'timetable', label: 'My Timetable' },
  { key: 'lessonPlans', label: 'Lesson Plans' },
  { key: 'materials', label: 'Lesson Materials' },
  { key: 'av', label: 'Audio & Video Library' },
  { key: 'live', label: 'Live / Virtual Class' },
  { key: 'assignments', label: 'Assignments & Assessments' },
  { key: 'gradebook', label: 'Gradebook' },
  { key: 'attendance', label: 'Class Attendance' },
  { key: 'roster', label: 'Student Roster' },
  { key: 'syllabus', label: 'Syllabus Tracker' },
  { key: 'remedial', label: 'Remedial Support' },
  { key: 'announcements', label: 'Class Announcements' },
  { key: 'plc', label: 'PLC' },
  { key: 'menu', label: "Today's Menu" },
];

export function TeacherDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuthStore();
  const teacherName = user?.displayName ?? 'Teacher';

  const {
    meetings, observations, resources, actionItems,
    addObservation,
  } = usePLCStore();

  const tStore = useTeacherStore();
  const {
    subjects, materials, avRecordings, liveSessions, assignments,
    roster, announcements, lessonPlans, timetable, syllabus, remedial,
    addMaterial, deleteMaterial, addAV, deleteAV,
    startLiveSession, endLiveSession, scheduleLiveSession, cancelLiveSession,
    addAssignment, publishAssignment, closeAssignment, deleteAssignment, gradeSubmission,
    markAttendance, getAttendanceForDate, getAttendanceStats,
    addAnnouncement, deleteAnnouncement,
    addLessonPlan, deleteLessonPlan, markLessonTaught,
    addSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic, getSyllabusProgress,
    addRemedialStudent, updateRemedialProgress, deleteRemedialStudent,
  } = tStore;

  const [showObsModal, setShowObsModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAVModal, setShowAVModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
  const [showLessonUploadModal, setShowLessonUploadModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showRemedialModal, setShowRemedialModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(subjects[0]?.classForm ?? '');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.subject ?? '');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, string>>({});
  const [gradingSub, setGradingSub] = useState<{ id: string; studentName: string; maxScore: number } | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [reflectingId, setReflectingId] = useState<string | null>(null);
  const [lessonReflection, setLessonReflection] = useState('');

  const [materialForm, setMaterialForm] = useState({ title: '', type: 'Note' as any, classForm: selectedClass, subject: selectedSubject, topic: '', description: '' });
  const [avForm, setAVForm] = useState({ title: '', type: 'Audio' as any, duration: '', classForm: selectedClass, subject: selectedSubject, topic: '' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', classForm: selectedClass, subject: selectedSubject, dueDate: '', maxScore: 20 });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '', classForm: selectedClass, priority: 'Normal' as any });
  const [lessonPlanForm, setLessonPlanForm] = useState({ subject: selectedSubject, classForm: selectedClass, date: new Date().toISOString().slice(0, 10), topic: '', objectives: '', teachingMethods: '', resources: '', activities: '', assessment: '', homework: '' });
  const [uploadForm, setUploadForm] = useState({ subject: selectedSubject, classForm: selectedClass, date: new Date().toISOString().slice(0, 10), topic: '', fileName: '' });
  const [liveForm, setLiveForm] = useState({ subject: selectedSubject, classForm: selectedClass, scheduledTime: '', topic: '' });
  const [syllabusForm, setSyllabusForm] = useState({ subject: selectedSubject, classForm: selectedClass, topic: '', subTopics: '', week: 1 });
  const [remedialForm, setRemedialForm] = useState({ studentName: '', admNo: '', classForm: selectedClass, subject: selectedSubject, area: '', intervention: '', notes: '' });

  const [obsForm, setObsForm] = useState({
    date: new Date().toISOString().slice(0, 10), teacherName: teacherName, observedTeacher: '', subject: '', classForm: '',
    lessonTopic: '', observerName: teacherName, rating: 'Good' as ObservationRating,
    strengths: '', improvements: '', questionsRaised: '',
    studentEngagement: 'Good' as ObservationRating, classroomManagement: 'Good' as ObservationRating,
    instructionalClarity: 'Good' as ObservationRating,
    recommendations: '', followUpAction: '',
  });

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );

  const statusColor = (s: string) =>
    s === 'Completed' ? colors.success : s === 'Scheduled' ? colors.warning :
    s === 'Discussed' ? colors.success : s === 'Reviewed' ? colors.info :
    s === 'Submitted' ? colors.warning : s === 'Approved' ? colors.success :
    s === 'Rejected' ? colors.danger : s === 'Pending' ? colors.warning :
    s === 'In Progress' ? colors.info : s === 'Overdue' ? colors.danger :
    s === 'Not Started' ? colors.textSecondary : s === 'Live' ? colors.danger :
    s === 'Published' ? colors.success : s === 'Draft' ? colors.textSecondary :
    s === 'Closed' ? colors.textSecondary : s === 'Graded' ? colors.success :
    s === 'Late' ? colors.warning : s === 'Taught' ? colors.success :
    s === 'Planned' ? colors.info : s === 'Rescheduled' ? colors.warning :
    s === 'Improving' ? colors.info : s === 'On Track' ? colors.success :
    s === 'Needs More Help' ? colors.danger : s === 'Just Started' ? colors.warning :
    s === 'Ended' ? colors.textSecondary : s === 'Cancelled' ? colors.danger :
    colors.textSecondary;

  const handleSubmitObservation = () => {
    if (!obsForm.observedTeacher.trim() || !obsForm.observerName.trim()) { Alert.alert('Error', 'Observed teacher and observer are required'); return; }
    if (!obsForm.subject.trim() || !obsForm.lessonTopic.trim()) { Alert.alert('Error', 'Subject and lesson topic are required'); return; }
    addObservation(obsForm);
    setObsForm({ date: new Date().toISOString().slice(0, 10), teacherName: teacherName, observedTeacher: '', subject: '', classForm: '', lessonTopic: '', observerName: teacherName, rating: 'Good', strengths: '', improvements: '', questionsRaised: '', studentEngagement: 'Good', classroomManagement: 'Good', instructionalClarity: 'Good', recommendations: '', followUpAction: '' });
    setShowObsModal(false);
    Alert.alert('Submitted', 'Your critical friend observation has been submitted to the PLC Coordinator.');
  };

  const todayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()] as any;
  };

  const todayTimetable = tStore.getTodayTimetable(todayName());
  const todayAttendance = getAttendanceForDate(selectedClass, attendanceDate);
  const attendanceStats = getAttendanceStats(selectedClass);
  const classGradebook = tStore.getGradebookForClass(selectedClass, selectedSubject);
  const syllabusProgress = getSyllabusProgress(selectedSubject, selectedClass);
  const publishedAssignments = assignments.filter((a) => a.status === 'Published');
  const pendingGrading = assignments.flatMap((a) => a.submissions.filter((s) => s.status === 'Submitted' || s.status === 'Late').map((s) => ({ ...s, assignmentTitle: a.title, maxScore: a.maxScore })));

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Teacher Overview</Text>
            <Text style={styles.pageSubtitle}>Welcome, {teacherName}</Text>
            <CardGrid>
              <StatCard label="My Classes" value={subjects.length} subtitle="Assigned" accentColor={colors.primary} />
              <StatCard label="Today's Lessons" value={todayTimetable.length} subtitle={todayName()} accentColor={colors.info} />
              <StatCard label="Assignments" value={publishedAssignments.length} subtitle="Published" accentColor={colors.warning} />
              <StatCard label="Pending Grading" value={pendingGrading.length} subtitle="To grade" accentColor={colors.danger} />
              <StatCard label="Lesson Plans" value={lessonPlans.filter((l) => l.status === 'Planned').length} subtitle="Planned" accentColor={colors.purple} />
              <StatCard label="Syllabus Coverage" value={`${syllabusProgress.pct}%`} subtitle={`${syllabusProgress.completed}/${syllabusProgress.total} topics`} accentColor={colors.success} />
              <StatCard label="Materials" value={materials.length} subtitle="Uploaded" accentColor={colors.accent} />
              <StatCard label="AV Recordings" value={avRecordings.length} subtitle="In library" accentColor={colors.info} />
            </CardGrid>
            {todayTimetable.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Today's Schedule — {todayName()}</Text>
                {todayTimetable.map((t) => (
                  <View key={t.id} style={styles.subjectCard}>
                    <Text style={styles.subjectName}>Period {t.period}: {t.subject} — {t.classForm}</Text>
                    <Text style={styles.subjectClass}>{t.startTime}–{t.endTime} | Room {t.room}</Text>
                  </View>
                ))}
              </View>
            )}
            {pendingGrading.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Pending Grading</Text>
                {pendingGrading.slice(0, 5).map((s) => (
                  <View key={s.id} style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{s.studentName} — {s.assignmentTitle}</Text>
                      <Text style={styles.alertText}>Submitted: {s.submittedDate} | Max: {s.maxScore} marks</Text>
                    </View>
                    {renderBadge(s.status, statusColor(s.status))}
                  </View>
                ))}
              </View>
            )}
            {lessonPlans.filter((l) => l.status === 'Planned').length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Upcoming Lesson Plans</Text>
                {lessonPlans.filter((l) => l.status === 'Planned').slice(0, 3).map((l) => (
                  <View key={l.id} style={styles.subjectCard}>
                    <Text style={styles.subjectName}>{l.topic}</Text>
                    <Text style={styles.subjectClass}>{l.subject} — {l.classForm} | {l.date}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        );
      case 'subjects':
        return (
          <View>
            <Text style={styles.pageTitle}>My Subjects & Classes</Text>
            <Text style={styles.pageSubtitle}>Assigned by your HOD — access is scoped to these only</Text>
            {subjects.map((item) => (
              <View key={item.id} style={styles.subjectCard}>
                <Text style={styles.subjectName}>{item.subject}</Text>
                <Text style={styles.subjectClass}>{item.classForm}</Text>
                <Text style={styles.subjectMeta}>{item.students} students | HOD: {item.hod} | {item.isElective ? 'Elective' : 'Core'}</Text>
                <View style={styles.rowBtns}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => { setSelectedClass(item.classForm); setSelectedSubject(item.subject); setActivePage('gradebook'); }}>
                    <Text style={styles.smallBtnText}>Gradebook</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => { setSelectedClass(item.classForm); setSelectedSubject(item.subject); setActivePage('attendance'); }}>
                    <Text style={styles.smallBtnText}>Attendance</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => { setSelectedClass(item.classForm); setSelectedSubject(item.subject); setActivePage('syllabus'); }}>
                    <Text style={styles.smallBtnText}>Syllabus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'timetable':
        return (
          <View>
            <Text style={styles.pageTitle}>My Timetable</Text>
            <Text style={styles.pageSubtitle}>Weekly teaching schedule</Text>
            {DAYS_OF_WEEK.map((day) => {
              const dayEntries = timetable.filter((t) => t.day === day).sort((a, b) => a.period - b.period);
              if (dayEntries.length === 0) return null;
              return (
                <View key={day} style={{ marginBottom: spacing.md }}>
                  <Text style={styles.sectionTitle}>{day}</Text>
                  {dayEntries.map((t) => (
                    <View key={t.id} style={styles.timetableCard}>
                      <View style={styles.timetablePeriod}><Text style={styles.timetablePeriodText}>P{t.period}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.subjectName}>{t.subject}</Text>
                        <Text style={styles.subjectClass}>{t.classForm} | {t.startTime}–{t.endTime} | Room {t.room}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
            {timetable.length === 0 && <Text style={styles.emptyText}>No timetable entries.</Text>}
          </View>
        );
      case 'lessonPlans':
        return (
          <View>
            <Text style={styles.pageTitle}>Lesson Plans</Text>
            <Text style={styles.pageSubtitle}>Plan, teach, and reflect on your lessons</Text>
            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setShowLessonPlanModal(true)}>
                <Text style={styles.actionBtnText}>+ Create Lesson Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.info }]} onPress={() => setShowLessonUploadModal(true)}>
                <Text style={styles.actionBtnText}>Upload Prepared Plan</Text>
              </TouchableOpacity>
            </View>
            {lessonPlans.length === 0 && <Text style={styles.emptyText}>No lesson plans yet.</Text>}
            {lessonPlans.map((lp) => (
              <View key={lp.id} style={[styles.subjectCard, { borderLeftWidth: 4, borderLeftColor: statusColor(lp.status) }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{lp.topic}</Text>
                    <Text style={styles.subjectClass}>{lp.subject} — {lp.classForm} | {lp.date}</Text>
                    {lp.fileName ? (
                      <Text style={[styles.subjectMeta, { color: colors.info }]}>📎 {lp.fileName}</Text>
                    ) : (
                      <>
                        <Text style={styles.subjectMeta}>Objectives: {lp.objectives}</Text>
                        <Text style={styles.subjectMeta}>Methods: {lp.teachingMethods}</Text>
                        <Text style={styles.subjectMeta}>Resources: {lp.resources}</Text>
                        <Text style={styles.subjectMeta}>Activities: {lp.activities}</Text>
                        <Text style={styles.subjectMeta}>Assessment: {lp.assessment}</Text>
                        <Text style={styles.subjectMeta}>Homework: {lp.homework}</Text>
                      </>
                    )}
                    {lp.reflection ? <Text style={[styles.subjectMeta, { fontStyle: 'italic' as const }]}>Reflection: {lp.reflection}</Text> : null}
                  </View>
                  {renderBadge(lp.status, statusColor(lp.status))}
                </View>
                {lp.status === 'Planned' && (
                  <View style={styles.rowBtns}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => { setReflectingId(lp.id); setLessonReflection(''); }}>
                      <Text style={styles.smallBtnText}>Mark Taught</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteLessonPlan(lp.id); Alert.alert('Deleted', 'Lesson plan deleted.'); }}>
                      <Text style={styles.smallBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      case 'materials':
        return (
          <View>
            <Text style={styles.pageTitle}>Lesson Materials</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowMaterialModal(true)}>
              <Text style={styles.actionBtnText}>+ Upload Material</Text>
            </TouchableOpacity>
            {materials.length === 0 && <Text style={styles.emptyText}>No materials uploaded.</Text>}
            {materials.map((m) => (
              <View key={m.id} style={styles.subjectCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{m.title}</Text>
                    <Text style={styles.subjectClass}>{m.type} | {m.classForm} | {m.topic}</Text>
                    {m.description ? <Text style={styles.subjectMeta}>{m.description}</Text> : null}
                    <Text style={styles.subjectMeta}>Uploaded: {m.dateUploaded} by {m.uploadedBy}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { deleteMaterial(m.id); Alert.alert('Deleted', 'Material removed.'); }}>
                    <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'av':
        return (
          <View>
            <Text style={styles.pageTitle}>Audio & Video Library</Text>
            <Text style={styles.pageSubtitle}>Record or upload lessons — supports offline playback on student devices</Text>
            <View style={styles.avActions}>
              <TouchableOpacity style={styles.recordBtn} onPress={() => { setAVForm({ ...avForm, type: 'Audio' }); setShowAVModal(true); }}>
                <Text style={styles.recordBtnText}>+ Add Audio Lesson</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recordBtn} onPress={() => { setAVForm({ ...avForm, type: 'Video' }); setShowAVModal(true); }}>
                <Text style={styles.recordBtnText}>+ Add Video Lesson</Text>
              </TouchableOpacity>
            </View>
            {avRecordings.length === 0 && <Text style={styles.emptyText}>No recordings yet.</Text>}
            {avRecordings.map((a) => (
              <View key={a.id} style={styles.subjectCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{a.title}</Text>
                    <Text style={styles.subjectClass}>{a.type} | {a.duration} | {a.classForm}</Text>
                    <Text style={styles.subjectMeta}>Topic: {a.topic} | Recorded: {a.dateRecorded}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { deleteAV(a.id); Alert.alert('Deleted', 'Recording removed.'); }}>
                    <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'live':
        return (
          <View>
            <Text style={styles.pageTitle}>Live / Virtual Class Session</Text>
            <Text style={styles.pageSubtitle}>Start or schedule an online class</Text>
            <TouchableOpacity style={styles.startLiveBtn} onPress={() => setShowLiveModal(true)}>
              <Text style={styles.startLiveBtnText}>+ Schedule Live Class</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Sessions</Text>
            {liveSessions.length === 0 && <Text style={styles.emptyText}>No sessions scheduled.</Text>}
            {liveSessions.map((s) => (
              <View key={s.id} style={styles.sessionCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionSubject}>{s.subject} — {s.classForm}</Text>
                    <Text style={styles.sessionTime}>{s.scheduledTime}</Text>
                    <Text style={styles.sessionTime}>Topic: {s.topic}</Text>
                    {s.participants > 0 && <Text style={styles.sessionTime}>Participants: {s.participants}</Text>}
                  </View>
                  {renderBadge(s.status, statusColor(s.status))}
                </View>
                {s.status === 'Scheduled' && (
                  <View style={styles.rowBtns}>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => { startLiveSession(s.id, teacherName); Alert.alert('Live', 'Session is now live.'); }}>
                      <Text style={styles.smallBtnText}>Start Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { cancelLiveSession(s.id); Alert.alert('Cancelled', 'Session cancelled.'); }}>
                      <Text style={styles.smallBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {s.status === 'Live' && (
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { endLiveSession(s.id); Alert.alert('Ended', 'Session ended.'); }}>
                    <Text style={styles.smallBtnText}>End Session</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        );
      case 'assignments':
        return (
          <View>
            <Text style={styles.pageTitle}>Assignments & Assessments</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAssignmentModal(true)}>
              <Text style={styles.actionBtnText}>+ Create Assignment</Text>
            </TouchableOpacity>
            {pendingGrading.length > 0 && (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>⚠ {pendingGrading.length} submission{pendingGrading.length > 1 ? 's' : ''} to grade</Text>
                <Text style={styles.alertText}>Review and grade pending submissions</Text>
              </View>
            )}
            {assignments.length === 0 && <Text style={styles.emptyText}>No assignments yet.</Text>}
            {assignments.map((a) => (
              <View key={a.id} style={styles.subjectCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{a.title}</Text>
                    <Text style={styles.subjectClass}>{a.classForm} | Due: {a.dueDate} | Max: {a.maxScore}</Text>
                    {a.description ? <Text style={styles.subjectMeta}>{a.description}</Text> : null}
                    <Text style={styles.subjectMeta}>Submissions: {a.submissions.length} | Graded: {a.submissions.filter((s) => s.status === 'Graded').length}</Text>
                  </View>
                  {renderBadge(a.status, statusColor(a.status))}
                </View>
                {a.submissions.length > 0 && (
                  <View style={{ marginTop: spacing.sm }}>
                    {a.submissions.map((sub) => (
                      <View key={sub.id} style={styles.subCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.subName}>{sub.studentName} ({sub.admNo})</Text>
                          <Text style={styles.subMeta}>Submitted: {sub.submittedDate}{sub.score !== undefined ? ` | Score: ${sub.score}/${a.maxScore}` : ''}</Text>
                          {sub.feedback ? <Text style={styles.subMeta}>Feedback: {sub.feedback}</Text> : null}
                        </View>
                        {renderBadge(sub.status, statusColor(sub.status))}
                        {(sub.status === 'Submitted' || sub.status === 'Late') && (
                          <TouchableOpacity style={styles.gradeBtn} onPress={() => { setGradingSub({ id: sub.id, studentName: sub.studentName, maxScore: a.maxScore }); setGradeScore(''); setGradeFeedback(''); }}>
                            <Text style={styles.gradeBtnText}>Grade</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.rowBtns}>
                  {a.status === 'Draft' && <TouchableOpacity style={styles.smallBtn} onPress={() => { publishAssignment(a.id); Alert.alert('Published', 'Assignment is now visible to students.'); }}><Text style={styles.smallBtnText}>Publish</Text></TouchableOpacity>}
                  {a.status === 'Published' && <TouchableOpacity style={styles.smallBtn} onPress={() => { closeAssignment(a.id); Alert.alert('Closed', 'Assignment closed.'); }}><Text style={styles.smallBtnText}>Close</Text></TouchableOpacity>}
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteAssignment(a.id); Alert.alert('Deleted', 'Assignment deleted.'); }}><Text style={styles.smallBtnText}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'gradebook':
        return (
          <View>
            <Text style={styles.pageTitle}>Gradebook</Text>
            <Text style={styles.pageSubtitle}>{selectedSubject} — {selectedClass}</Text>
            <View style={styles.pickerRow}>
              {subjects.map((s) => (
                <TouchableOpacity key={s.id} style={[styles.pickerChip, selectedClass === s.classForm && selectedSubject === s.subject && styles.pickerChipActive]} onPress={() => { setSelectedClass(s.classForm); setSelectedSubject(s.subject); }}>
                  <Text style={[styles.pickerChipText, selectedClass === s.classForm && selectedSubject === s.subject && styles.pickerChipTextActive]}>{s.classForm}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {classGradebook.length > 0 ? (
              <DataTable
                columns={[
                  { key: 'studentName', label: 'Student', render: (i: any) => i.studentName },
                  { key: 'classwork', label: 'CW', render: (i: any) => `${i.classwork}/${i.classworkMax}` },
                  { key: 'homework', label: 'HW', render: (i: any) => `${i.homework}/${i.homeworkMax}` },
                  { key: 'test', label: 'Test', render: (i: any) => `${i.test}/${i.testMax}` },
                  { key: 'exam', label: 'Exam', render: (i: any) => `${i.exam}/${i.examMax}` },
                  { key: 'total', label: 'Total', render: (i: any) => `${i.total}/${i.totalMax}` },
                  { key: 'grade', label: 'Grade', render: (i: any) => i.grade },
                ]}
                data={classGradebook}
              />
            ) : (
              <Text style={styles.emptyText}>No grade entries for this class yet.</Text>
            )}
          </View>
        );
      case 'attendance':
        return (
          <View>
            <Text style={styles.pageTitle}>Class Attendance</Text>
            <Text style={styles.pageSubtitle}>{selectedSubject} — {selectedClass}</Text>
            <View style={styles.pickerRow}>
              {subjects.map((s) => (
                <TouchableOpacity key={s.id} style={[styles.pickerChip, selectedClass === s.classForm && selectedSubject === s.subject && styles.pickerChipActive]} onPress={() => { setSelectedClass(s.classForm); setSelectedSubject(s.subject); }}>
                  <Text style={[styles.pickerChipText, selectedClass === s.classForm && selectedSubject === s.subject && styles.pickerChipTextActive]}>{s.classForm}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <CardGrid>
              <StatCard label="Present" value={attendanceStats.present} accentColor={colors.success} />
              <StatCard label="Absent" value={attendanceStats.absent} accentColor={colors.danger} />
              <StatCard label="Late" value={attendanceStats.late} accentColor={colors.warning} />
              <StatCard label="Excused" value={attendanceStats.excused} accentColor={colors.info} />
            </CardGrid>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={attendanceDate} onChangeText={setAttendanceDate} />
            <Text style={styles.sectionTitle}>Mark Attendance — Tap to cycle status</Text>
            {roster.filter((r) => r.classForm === selectedClass).map((s) => {
              const current = attendanceDraft[s.admNo] || (todayAttendance.find((a) => a.studentName === s.name)?.status ?? 'Present');
              return (
                <TouchableOpacity key={s.id} style={styles.attendanceRow} onPress={() => {
                  const order = ['Present', 'Late', 'Excused', 'Absent'];
                  const idx = order.indexOf(current);
                  setAttendanceDraft({ ...attendanceDraft, [s.admNo]: order[(idx + 1) % order.length] });
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{s.name}</Text>
                    <Text style={styles.subjectMeta}>{s.admNo}</Text>
                  </View>
                  {renderBadge(current, current === 'Present' ? colors.success : current === 'Late' ? colors.warning : current === 'Excused' ? colors.info : colors.danger)}
                </TouchableOpacity>
              );
            })}
            {roster.filter((r) => r.classForm === selectedClass).length === 0 && <Text style={styles.emptyText}>No students in roster for this class.</Text>}
            {roster.filter((r) => r.classForm === selectedClass).length > 0 && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => {
                const classStudents = roster.filter((r) => r.classForm === selectedClass);
                const records = classStudents.map((s) => ({
                  studentName: s.name, admNo: s.admNo, classForm: selectedClass, subject: selectedSubject,
                  date: attendanceDate, status: (attendanceDraft[s.admNo] || 'Present') as any,
                }));
                markAttendance(records);
                setAttendanceDraft({});
                Alert.alert('Success', `Attendance marked for ${records.length} students on ${attendanceDate}.`);
              }}>
                <Text style={styles.actionBtnText}>Save Attendance</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case 'roster':
        return (
          <View>
            <Text style={styles.pageTitle}>Student Roster</Text>
            <Text style={styles.pageSubtitle}>{selectedClass}</Text>
            <View style={styles.pickerRow}>
              {[...new Set(subjects.map((s) => s.classForm))].map((c) => (
                <TouchableOpacity key={c} style={[styles.pickerChip, selectedClass === c && styles.pickerChipActive]} onPress={() => setSelectedClass(c)}>
                  <Text style={[styles.pickerChipText, selectedClass === c && styles.pickerChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <DataTable
              columns={[
                { key: 'name', label: 'Name', render: (i: any) => i.name },
                { key: 'admNo', label: 'Adm No', render: (i: any) => i.admNo },
                { key: 'avgScore', label: 'Avg Score', render: (i: any) => i.avgScore },
                { key: 'attendancePct', label: 'Attendance', render: (i: any) => i.attendancePct },
                { key: 'lastGrade', label: 'Last Grade', render: (i: any) => i.lastGrade },
                { key: 'guardianName', label: 'Guardian', render: (i: any) => i.guardianName },
                { key: 'guardianPhone', label: 'Phone', render: (i: any) => i.guardianPhone },
              ]}
              data={roster.filter((r) => r.classForm === selectedClass)}
            />
          </View>
        );
      case 'syllabus':
        return (
          <View>
            <Text style={styles.pageTitle}>Syllabus Tracker</Text>
            <Text style={styles.pageSubtitle}>{selectedSubject} — {selectedClass} | Coverage: {syllabusProgress.pct}%</Text>
            <View style={styles.pickerRow}>
              {subjects.map((s) => (
                <TouchableOpacity key={s.id} style={[styles.pickerChip, selectedClass === s.classForm && selectedSubject === s.subject && styles.pickerChipActive]} onPress={() => { setSelectedClass(s.classForm); setSelectedSubject(s.subject); }}>
                  <Text style={[styles.pickerChipText, selectedClass === s.classForm && selectedSubject === s.subject && styles.pickerChipTextActive]}>{s.classForm}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSyllabusModal(true)}>
              <Text style={styles.actionBtnText}>+ Add Syllabus Topic</Text>
            </TouchableOpacity>
            {syllabus.filter((t) => t.subject === selectedSubject && t.classForm === selectedClass).map((t) => (
              <View key={t.id} style={[styles.subjectCard, { borderLeftWidth: 4, borderLeftColor: statusColor(t.status) }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>Week {t.week}: {t.topic}</Text>
                    <Text style={styles.subjectMeta}>{t.subTopics}</Text>
                    {t.dateTaught ? <Text style={styles.subjectMeta}>Taught: {t.dateTaught}</Text> : null}
                    {t.notes ? <Text style={styles.subjectMeta}>Notes: {t.notes}</Text> : null}
                  </View>
                  {renderBadge(t.status, statusColor(t.status))}
                </View>
                {t.status !== 'Completed' && (
                  <View style={styles.rowBtns}>
                    {t.status === 'Not Started' && <TouchableOpacity style={styles.smallBtn} onPress={() => updateSyllabusTopic(t.id, { status: 'In Progress' })}><Text style={styles.smallBtnText}>Start</Text></TouchableOpacity>}
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => { updateSyllabusTopic(t.id, { status: 'Completed', dateTaught: new Date().toISOString().slice(0, 10) }); Alert.alert('Completed', 'Topic marked as completed.'); }}><Text style={styles.smallBtnText}>Mark Complete</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => deleteSyllabusTopic(t.id)}><Text style={styles.smallBtnText}>Delete</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            {syllabus.filter((t) => t.subject === selectedSubject && t.classForm === selectedClass).length === 0 && <Text style={styles.emptyText}>No syllabus topics for this class.</Text>}
          </View>
        );
      case 'remedial':
        return (
          <View>
            <Text style={styles.pageTitle}>Remedial Support</Text>
            <Text style={styles.pageSubtitle}>Track students needing extra help and their progress</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowRemedialModal(true)}>
              <Text style={styles.actionBtnText}>+ Add Remedial Student</Text>
            </TouchableOpacity>
            {remedial.length === 0 && <Text style={styles.emptyText}>No remedial students.</Text>}
            {remedial.map((r) => (
              <View key={r.id} style={[styles.subjectCard, { borderLeftWidth: 4, borderLeftColor: statusColor(r.progress) }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{r.studentName} ({r.admNo})</Text>
                    <Text style={styles.subjectClass}>{r.classForm} | {r.subject}</Text>
                    <Text style={styles.subjectMeta}>Area: {r.area}</Text>
                    <Text style={styles.subjectMeta}>Intervention: {r.intervention}</Text>
                    <Text style={styles.subjectMeta}>Started: {r.dateStarted}</Text>
                    <Text style={styles.subjectMeta}>Notes: {r.notes}</Text>
                  </View>
                  {renderBadge(r.progress, statusColor(r.progress))}
                </View>
                <View style={styles.rowBtns}>
                  {REMEDIAL_PROGRESS.map((p) => (
                    <TouchableOpacity key={p} style={[styles.smallBtn, r.progress === p && { backgroundColor: colors.primary }]} onPress={() => { updateRemedialProgress(r.id, p, r.notes); Alert.alert('Updated', `Progress set to ${p}.`); }}>
                      <Text style={styles.smallBtnText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => deleteRemedialStudent(r.id)}><Text style={styles.smallBtnText}>Remove</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'menu':
        return (
          <View>
            <KitchenMenuWidget role="Teacher" />
          </View>
        );
      case 'plc':
        return (
          <View>
            <CardGrid>
              <StatCard label="Meetings" value={meetings.length} accentColor={colors.primary} />
              <StatCard label="My Observations" value={observations.filter(o => o.observerName === teacherName).length} accentColor={colors.info} />
              <StatCard label="Observed By Me" value={observations.filter(o => o.observedTeacher === teacherName).length} accentColor={colors.purple} />
              <StatCard label="Resources" value={resources.length} accentColor={colors.success} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowObsModal(true)}>
              <Text style={styles.actionBtnText}>+ Submit Critical Friend Observation</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Upcoming PLC Meetings</Text>
            {meetings.filter(m => m.status === 'Scheduled').length === 0 && <Text style={styles.emptyText}>No scheduled meetings.</Text>}
            {meetings.filter(m => m.status === 'Scheduled').map(m => (
              <View key={m.id} style={styles.subjectCard}>
                <Text style={styles.subjectName}>{m.topic}</Text>
                <Text style={styles.subjectClass}>{m.date} | {m.startTime}–{m.endTime} | {m.location}</Text>
                <Text style={styles.subjectMeta}>Facilitator: {m.facilitator}</Text>
                {m.agenda ? <Text style={styles.subjectMeta}>Agenda: {m.agenda}</Text> : null}
              </View>
            ))}

            <Text style={styles.sectionTitle}>My Critical Friend Observations</Text>
            <Text style={styles.pageSubtitle}>Observations you submitted after watching a colleague's lesson</Text>
            {observations.filter(o => o.observerName === teacherName).length === 0 && <Text style={styles.emptyText}>You haven't submitted any observations yet.</Text>}
            {observations.filter(o => o.observerName === teacherName).map(o => (
              <View key={o.id} style={[styles.subjectCard, { borderLeftWidth: 4, borderLeftColor: statusColor(o.status) }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{o.observedTeacher} — {o.subject}</Text>
                    <Text style={styles.subjectClass}>{o.lessonTopic} | {o.date}</Text>
                    <Text style={styles.subjectMeta}>Rating: {o.rating}</Text>
                    <Text style={styles.subjectMeta}>Strengths: {o.strengths}</Text>
                    <Text style={styles.subjectMeta}>Improvements: {o.improvements}</Text>
                  </View>
                  {renderBadge(o.status, statusColor(o.status))}
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Observations of My Lessons</Text>
            <Text style={styles.pageSubtitle}>Feedback from colleagues who observed your teaching</Text>
            {observations.filter(o => o.observedTeacher === teacherName).length === 0 && <Text style={styles.emptyText}>No observations of your lessons yet.</Text>}
            {observations.filter(o => o.observedTeacher === teacherName).map(o => (
              <View key={o.id} style={[styles.subjectCard, { borderLeftWidth: 4, borderLeftColor: statusColor(o.status) }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>Observed by {o.observerName}</Text>
                    <Text style={styles.subjectClass}>{o.subject} — {o.lessonTopic} | {o.date}</Text>
                    <Text style={styles.subjectMeta}>Rating: {o.rating}</Text>
                    <Text style={styles.subjectMeta}>Strengths: {o.strengths}</Text>
                    <Text style={styles.subjectMeta}>Improvements: {o.improvements}</Text>
                    <Text style={styles.subjectMeta}>Recommendations: {o.recommendations}</Text>
                  </View>
                  {renderBadge(o.status, statusColor(o.status))}
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Shared Resources</Text>
            {resources.map(r => (
              <View key={r.id} style={styles.subjectCard}>
                <Text style={styles.subjectName}>{r.title}</Text>
                <Text style={styles.subjectClass}>{r.category} | Shared by {r.sharedBy} | {r.date}</Text>
                {r.description ? <Text style={styles.subjectMeta}>{r.description}</Text> : null}
              </View>
            ))}

            <Text style={styles.sectionTitle}>My Action Items</Text>
            {actionItems.filter(a => a.owner === teacherName).length === 0 && <Text style={styles.emptyText}>No action items assigned to you.</Text>}
            {actionItems.filter(a => a.owner === teacherName).map(a => (
              <View key={a.id} style={[styles.subjectCard, { borderLeftWidth: 4, borderLeftColor: statusColor(a.status) }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{a.action}</Text>
                    <Text style={styles.subjectClass}>Session: {a.session} | Due: {a.due}</Text>
                  </View>
                  {renderBadge(a.status, statusColor(a.status))}
                </View>
              </View>
            ))}
          </View>
        );
      case 'announcements':
        return (
          <View>
            <Text style={styles.pageTitle}>Class Announcements</Text>
            <Text style={styles.pageSubtitle}>Message all students in a specific assigned class</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAnnouncementModal(true)}>
              <Text style={styles.actionBtnText}>+ Post Announcement</Text>
            </TouchableOpacity>
            {announcements.length === 0 && <Text style={styles.emptyText}>No announcements yet.</Text>}
            {announcements.map((a) => (
              <View key={a.id} style={[styles.announcementCard, { borderLeftWidth: 4, borderLeftColor: a.priority === 'Urgent' ? colors.danger : a.priority === 'Important' ? colors.warning : colors.info }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.announcementTitle}>{a.title}</Text>
                    <Text style={styles.announcementMeta}>{a.classForm} | {a.date} | By {a.postedBy}</Text>
                    {a.body ? <Text style={styles.subjectMeta}>{a.body}</Text> : null}
                  </View>
                  {renderBadge(a.priority, a.priority === 'Urgent' ? colors.danger : a.priority === 'Important' ? colors.warning : colors.info)}
                </View>
                <TouchableOpacity onPress={() => { deleteAnnouncement(a.id); Alert.alert('Deleted', 'Announcement removed.'); }}>
                  <Text style={{ color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.sm }}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Teacher Platform"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
    >
      {renderPage()}

      <Modal visible={showObsModal} transparent animationType="fade" onRequestClose={() => setShowObsModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Critical Friend Observation</Text>
          <Text style={styles.modalSubtitle}>Submit feedback after observing a colleague's lesson</Text>

          <Text style={styles.inputLabel}>Date *</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={obsForm.date} onChangeText={(v) => setObsForm({ ...obsForm, date: v })} />
          <Text style={styles.inputLabel}>Teacher Observed (Colleague) *</Text>
          <TextInput style={styles.input} placeholder="Name of the teacher whose lesson you observed" placeholderTextColor={colors.textLight} value={obsForm.observedTeacher} onChangeText={(v) => setObsForm({ ...obsForm, observedTeacher: v })} />
          <Text style={styles.inputLabel}>Your Name (Observer) *</Text>
          <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={colors.textLight} value={obsForm.observerName} onChangeText={(v) => setObsForm({ ...obsForm, observerName: v })} />
          <Text style={styles.inputLabel}>Subject *</Text>
          <TextInput style={styles.input} placeholder="e.g. Elect. Math" placeholderTextColor={colors.textLight} value={obsForm.subject} onChangeText={(v) => setObsForm({ ...obsForm, subject: v })} />
          <Text style={styles.inputLabel}>Class/Form</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={obsForm.classForm} onChangeText={(v) => setObsForm({ ...obsForm, classForm: v })} />
          <Text style={styles.inputLabel}>Lesson Topic *</Text>
          <TextInput style={styles.input} placeholder="e.g. Quadratic equations" placeholderTextColor={colors.textLight} value={obsForm.lessonTopic} onChangeText={(v) => setObsForm({ ...obsForm, lessonTopic: v })} />

          <Text style={styles.inputLabel}>Overall Rating</Text>
          <View style={styles.selectRow}>
            {OBSERVATION_RATINGS.map((opt) => (
              <TouchableOpacity key={opt} style={[styles.selectChip, obsForm.rating === opt && styles.selectChipActive]} onPress={() => setObsForm({ ...obsForm, rating: opt })}>
                <Text style={[styles.selectChipText, obsForm.rating === opt && styles.selectChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Strengths Observed</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What did the teacher do well?" placeholderTextColor={colors.textLight} value={obsForm.strengths} onChangeText={(v) => setObsForm({ ...obsForm, strengths: v })} multiline />
          <Text style={styles.inputLabel}>Areas for Improvement</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What could be improved?" placeholderTextColor={colors.textLight} value={obsForm.improvements} onChangeText={(v) => setObsForm({ ...obsForm, improvements: v })} multiline />
          <Text style={styles.inputLabel}>Questions Raised</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Questions for PLC discussion" placeholderTextColor={colors.textLight} value={obsForm.questionsRaised} onChangeText={(v) => setObsForm({ ...obsForm, questionsRaised: v })} multiline />

          <Text style={styles.inputLabel}>Student Engagement</Text>
          <View style={styles.selectRow}>
            {OBSERVATION_RATINGS.map((opt) => (
              <TouchableOpacity key={opt} style={[styles.selectChip, obsForm.studentEngagement === opt && styles.selectChipActive]} onPress={() => setObsForm({ ...obsForm, studentEngagement: opt })}>
                <Text style={[styles.selectChipText, obsForm.studentEngagement === opt && styles.selectChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Classroom Management</Text>
          <View style={styles.selectRow}>
            {OBSERVATION_RATINGS.map((opt) => (
              <TouchableOpacity key={opt} style={[styles.selectChip, obsForm.classroomManagement === opt && styles.selectChipActive]} onPress={() => setObsForm({ ...obsForm, classroomManagement: opt })}>
                <Text style={[styles.selectChipText, obsForm.classroomManagement === opt && styles.selectChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Instructional Clarity</Text>
          <View style={styles.selectRow}>
            {OBSERVATION_RATINGS.map((opt) => (
              <TouchableOpacity key={opt} style={[styles.selectChip, obsForm.instructionalClarity === opt && styles.selectChipActive]} onPress={() => setObsForm({ ...obsForm, instructionalClarity: opt })}>
                <Text style={[styles.selectChipText, obsForm.instructionalClarity === opt && styles.selectChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Recommendations</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Suggestions for the teacher" placeholderTextColor={colors.textLight} value={obsForm.recommendations} onChangeText={(v) => setObsForm({ ...obsForm, recommendations: v })} multiline />
          <Text style={styles.inputLabel}>Follow-up Action</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What should happen next?" placeholderTextColor={colors.textLight} value={obsForm.followUpAction} onChangeText={(v) => setObsForm({ ...obsForm, followUpAction: v })} multiline />

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowObsModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleSubmitObservation}><Text style={styles.modalBtnTextLight}>Submit</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Material Modal */}
      <Modal visible={showMaterialModal} transparent animationType="fade" onRequestClose={() => setShowMaterialModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Upload Lesson Material</Text>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. Quadratic Equations Notes" placeholderTextColor={colors.textLight} value={materialForm.title} onChangeText={(v) => setMaterialForm({ ...materialForm, title: v })} />
          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.selectRow}>{MATERIAL_TYPES.map((opt) => (<TouchableOpacity key={opt} style={[styles.selectChip, materialForm.type === opt && styles.selectChipActive]} onPress={() => setMaterialForm({ ...materialForm, type: opt })}><Text style={[styles.selectChipText, materialForm.type === opt && styles.selectChipTextActive]}>{opt}</Text></TouchableOpacity>))}</View>
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={materialForm.classForm} onChangeText={(v) => setMaterialForm({ ...materialForm, classForm: v })} />
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Elective Mathematics" placeholderTextColor={colors.textLight} value={materialForm.subject} onChangeText={(v) => setMaterialForm({ ...materialForm, subject: v })} />
          <Text style={styles.inputLabel}>Topic / Chapter</Text>
          <TextInput style={styles.input} placeholder="e.g. Ch. 5" placeholderTextColor={colors.textLight} value={materialForm.topic} onChangeText={(v) => setMaterialForm({ ...materialForm, topic: v })} />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Brief description" placeholderTextColor={colors.textLight} value={materialForm.description} onChangeText={(v) => setMaterialForm({ ...materialForm, description: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowMaterialModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!materialForm.title.trim()) { Alert.alert('Error', 'Title is required'); return; } addMaterial({ ...materialForm, uploadedBy: teacherName }); setMaterialForm({ title: '', type: 'Note', classForm: selectedClass, subject: selectedSubject, topic: '', description: '' }); setShowMaterialModal(false); Alert.alert('Success', 'Material uploaded.'); }}><Text style={styles.modalBtnTextLight}>Upload</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* AV Modal */}
      <Modal visible={showAVModal} transparent animationType="fade" onRequestClose={() => setShowAVModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Add {avForm.type} Lesson</Text>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. Quadratic Formula Walkthrough" placeholderTextColor={colors.textLight} value={avForm.title} onChangeText={(v) => setAVForm({ ...avForm, title: v })} />
          <Text style={styles.inputLabel}>Duration</Text>
          <TextInput style={styles.input} placeholder="e.g. 12:30" placeholderTextColor={colors.textLight} value={avForm.duration} onChangeText={(v) => setAVForm({ ...avForm, duration: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={avForm.classForm} onChangeText={(v) => setAVForm({ ...avForm, classForm: v })} />
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Elective Mathematics" placeholderTextColor={colors.textLight} value={avForm.subject} onChangeText={(v) => setAVForm({ ...avForm, subject: v })} />
          <Text style={styles.inputLabel}>Topic</Text>
          <TextInput style={styles.input} placeholder="e.g. Quadratic equations" placeholderTextColor={colors.textLight} value={avForm.topic} onChangeText={(v) => setAVForm({ ...avForm, topic: v })} />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAVModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!avForm.title.trim()) { Alert.alert('Error', 'Title is required'); return; } addAV({ ...avForm, recordedBy: teacherName }); setAVForm({ title: '', type: 'Audio', duration: '', classForm: selectedClass, subject: selectedSubject, topic: '' }); setShowAVModal(false); Alert.alert('Success', 'Recording added.'); }}><Text style={styles.modalBtnTextLight}>Add</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Assignment Modal */}
      <Modal visible={showAssignmentModal} transparent animationType="fade" onRequestClose={() => setShowAssignmentModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Create Assignment</Text>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. Quadratic Eq. Exercise 3" placeholderTextColor={colors.textLight} value={assignmentForm.title} onChangeText={(v) => setAssignmentForm({ ...assignmentForm, title: v })} />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Assignment instructions" placeholderTextColor={colors.textLight} value={assignmentForm.description} onChangeText={(v) => setAssignmentForm({ ...assignmentForm, description: v })} multiline />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={assignmentForm.classForm} onChangeText={(v) => setAssignmentForm({ ...assignmentForm, classForm: v })} />
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Elective Mathematics" placeholderTextColor={colors.textLight} value={assignmentForm.subject} onChangeText={(v) => setAssignmentForm({ ...assignmentForm, subject: v })} />
          <Text style={styles.inputLabel}>Due Date *</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={assignmentForm.dueDate} onChangeText={(v) => setAssignmentForm({ ...assignmentForm, dueDate: v })} />
          <Text style={styles.inputLabel}>Max Score</Text>
          <TextInput style={styles.input} placeholder="20" placeholderTextColor={colors.textLight} value={String(assignmentForm.maxScore)} onChangeText={(v) => setAssignmentForm({ ...assignmentForm, maxScore: parseInt(v) || 0 })} keyboardType="numeric" />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAssignmentModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!assignmentForm.title.trim()) { Alert.alert('Error', 'Title is required'); return; } if (!assignmentForm.dueDate.trim()) { Alert.alert('Error', 'Due date is required'); return; } addAssignment(assignmentForm); setAssignmentForm({ title: '', description: '', classForm: selectedClass, subject: selectedSubject, dueDate: '', maxScore: 20 }); setShowAssignmentModal(false); Alert.alert('Success', 'Assignment created as draft. Publish it to make it visible to students.'); }}><Text style={styles.modalBtnTextLight}>Create</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Grading Modal */}
      <Modal visible={!!gradingSub} transparent animationType="fade" onRequestClose={() => setGradingSub(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Grade Submission</Text>
          <Text style={styles.modalSubtitle}>{gradingSub?.studentName} | Max: {gradingSub?.maxScore}</Text>
          <Text style={styles.inputLabel}>Score *</Text>
          <TextInput style={styles.input} placeholder="Enter score" placeholderTextColor={colors.textLight} value={gradeScore} onChangeText={setGradeScore} keyboardType="numeric" />
          <Text style={styles.inputLabel}>Feedback</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Feedback for student" placeholderTextColor={colors.textLight} value={gradeFeedback} onChangeText={setGradeFeedback} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setGradingSub(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!gradingSub) return; const score = parseFloat(gradeScore); if (isNaN(score)) { Alert.alert('Error', 'Enter a valid score'); return; } gradeSubmission(gradingSub.id, score, gradeFeedback); setGradingSub(null); setGradeScore(''); setGradeFeedback(''); Alert.alert('Success', 'Submission graded.'); }}><Text style={styles.modalBtnTextLight}>Grade</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Announcement Modal */}
      <Modal visible={showAnnouncementModal} transparent animationType="fade" onRequestClose={() => setShowAnnouncementModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Post Announcement</Text>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput style={styles.input} placeholder="Announcement title" placeholderTextColor={colors.textLight} value={announcementForm.title} onChangeText={(v) => setAnnouncementForm({ ...announcementForm, title: v })} />
          <Text style={styles.inputLabel}>Body</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Announcement message" placeholderTextColor={colors.textLight} value={announcementForm.body} onChangeText={(v) => setAnnouncementForm({ ...announcementForm, body: v })} multiline />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={announcementForm.classForm} onChangeText={(v) => setAnnouncementForm({ ...announcementForm, classForm: v })} />
          <Text style={styles.inputLabel}>Priority</Text>
          <View style={styles.selectRow}>{ANNOUNCEMENT_PRIORITIES.map((opt) => (<TouchableOpacity key={opt} style={[styles.selectChip, announcementForm.priority === opt && styles.selectChipActive]} onPress={() => setAnnouncementForm({ ...announcementForm, priority: opt })}><Text style={[styles.selectChipText, announcementForm.priority === opt && styles.selectChipTextActive]}>{opt}</Text></TouchableOpacity>))}</View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAnnouncementModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!announcementForm.title.trim()) { Alert.alert('Error', 'Title is required'); return; } addAnnouncement({ ...announcementForm, postedBy: teacherName }); setAnnouncementForm({ title: '', body: '', classForm: selectedClass, priority: 'Normal' }); setShowAnnouncementModal(false); Alert.alert('Success', 'Announcement posted.'); }}><Text style={styles.modalBtnTextLight}>Post</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Lesson Plan Modal */}
      <Modal visible={showLessonPlanModal} transparent animationType="fade" onRequestClose={() => setShowLessonPlanModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Create Lesson Plan</Text>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Elective Mathematics" placeholderTextColor={colors.textLight} value={lessonPlanForm.subject} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, subject: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={lessonPlanForm.classForm} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, classForm: v })} />
          <Text style={styles.inputLabel}>Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={lessonPlanForm.date} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, date: v })} />
          <Text style={styles.inputLabel}>Topic *</Text>
          <TextInput style={styles.input} placeholder="e.g. Integration by substitution" placeholderTextColor={colors.textLight} value={lessonPlanForm.topic} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, topic: v })} />
          <Text style={styles.inputLabel}>Objectives</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Learning objectives" placeholderTextColor={colors.textLight} value={lessonPlanForm.objectives} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, objectives: v })} multiline />
          <Text style={styles.inputLabel}>Teaching Methods</Text>
          <TextInput style={styles.input} placeholder="e.g. Direct instruction + guided practice" placeholderTextColor={colors.textLight} value={lessonPlanForm.teachingMethods} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, teachingMethods: v })} />
          <Text style={styles.inputLabel}>Resources</Text>
          <TextInput style={styles.input} placeholder="e.g. Whiteboard, textbook" placeholderTextColor={colors.textLight} value={lessonPlanForm.resources} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, resources: v })} />
          <Text style={styles.inputLabel}>Activities</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Lesson activities" placeholderTextColor={colors.textLight} value={lessonPlanForm.activities} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, activities: v })} multiline />
          <Text style={styles.inputLabel}>Assessment</Text>
          <TextInput style={styles.input} placeholder="e.g. Exit ticket" placeholderTextColor={colors.textLight} value={lessonPlanForm.assessment} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, assessment: v })} />
          <Text style={styles.inputLabel}>Homework</Text>
          <TextInput style={styles.input} placeholder="e.g. Exercise 7.2 Q1-10" placeholderTextColor={colors.textLight} value={lessonPlanForm.homework} onChangeText={(v) => setLessonPlanForm({ ...lessonPlanForm, homework: v })} />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowLessonPlanModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!lessonPlanForm.topic.trim()) { Alert.alert('Error', 'Topic is required'); return; } addLessonPlan(lessonPlanForm); setLessonPlanForm({ subject: selectedSubject, classForm: selectedClass, date: new Date().toISOString().slice(0, 10), topic: '', objectives: '', teachingMethods: '', resources: '', activities: '', assessment: '', homework: '' }); setShowLessonPlanModal(false); Alert.alert('Success', 'Lesson plan created.'); }}><Text style={styles.modalBtnTextLight}>Create</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Lesson Plan Upload Modal */}
      <Modal visible={showLessonUploadModal} transparent animationType="fade" onRequestClose={() => setShowLessonUploadModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Upload Prepared Lesson Plan</Text>
          <Text style={styles.modalSubtitle}>Upload an already-prepared lesson plan file (PDF, Word, etc.)</Text>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Elective Mathematics" placeholderTextColor={colors.textLight} value={uploadForm.subject} onChangeText={(v) => setUploadForm({ ...uploadForm, subject: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={uploadForm.classForm} onChangeText={(v) => setUploadForm({ ...uploadForm, classForm: v })} />
          <Text style={styles.inputLabel}>Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={uploadForm.date} onChangeText={(v) => setUploadForm({ ...uploadForm, date: v })} />
          <Text style={styles.inputLabel}>Topic *</Text>
          <TextInput style={styles.input} placeholder="e.g. Integration by substitution" placeholderTextColor={colors.textLight} value={uploadForm.topic} onChangeText={(v) => setUploadForm({ ...uploadForm, topic: v })} />
          <Text style={styles.inputLabel}>File Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Lesson_Plan_Ch7.pdf" placeholderTextColor={colors.textLight} value={uploadForm.fileName} onChangeText={(v) => setUploadForm({ ...uploadForm, fileName: v })} />
          <TouchableOpacity style={styles.filePickerBtn} onPress={() => Alert.alert('File Picker', 'File picker would open here. Enter the file name above for now.')}>
            <Text style={styles.filePickerBtnText}>Choose File...</Text>
          </TouchableOpacity>
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowLessonUploadModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!uploadForm.topic.trim()) { Alert.alert('Error', 'Topic is required'); return; } if (!uploadForm.fileName.trim()) { Alert.alert('Error', 'File name is required'); return; } addLessonPlan({ ...uploadForm, objectives: '', teachingMethods: '', resources: '', activities: '', assessment: '', homework: '', fileUrl: uploadForm.fileName, fileName: uploadForm.fileName }); setUploadForm({ subject: selectedSubject, classForm: selectedClass, date: new Date().toISOString().slice(0, 10), topic: '', fileName: '' }); setShowLessonUploadModal(false); Alert.alert('Success', 'Lesson plan uploaded.'); }}><Text style={styles.modalBtnTextLight}>Upload</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Lesson Reflection Modal */}
      <Modal visible={!!reflectingId} transparent animationType="fade" onRequestClose={() => setReflectingId(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Mark Lesson Taught</Text>
          <Text style={styles.modalSubtitle}>Add a reflection on how the lesson went</Text>
          <Text style={styles.inputLabel}>Reflection</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What went well? What would you change?" placeholderTextColor={colors.textLight} value={lessonReflection} onChangeText={setLessonReflection} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setReflectingId(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!reflectingId) return; markLessonTaught(reflectingId, lessonReflection); setReflectingId(null); setLessonReflection(''); Alert.alert('Success', 'Lesson marked as taught.'); }}><Text style={styles.modalBtnTextLight}>Mark Taught</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Live Session Modal */}
      <Modal visible={showLiveModal} transparent animationType="fade" onRequestClose={() => setShowLiveModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Schedule Live Class</Text>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Elective Mathematics" placeholderTextColor={colors.textLight} value={liveForm.subject} onChangeText={(v) => setLiveForm({ ...liveForm, subject: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={liveForm.classForm} onChangeText={(v) => setLiveForm({ ...liveForm, classForm: v })} />
          <Text style={styles.inputLabel}>Scheduled Time *</Text>
          <TextInput style={styles.input} placeholder="e.g. 2026-07-11 14:00" placeholderTextColor={colors.textLight} value={liveForm.scheduledTime} onChangeText={(v) => setLiveForm({ ...liveForm, scheduledTime: v })} />
          <Text style={styles.inputLabel}>Topic *</Text>
          <TextInput style={styles.input} placeholder="e.g. Integration by substitution" placeholderTextColor={colors.textLight} value={liveForm.topic} onChangeText={(v) => setLiveForm({ ...liveForm, topic: v })} />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowLiveModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!liveForm.topic.trim() || !liveForm.scheduledTime.trim()) { Alert.alert('Error', 'Topic and scheduled time are required'); return; } scheduleLiveSession(liveForm); setLiveForm({ subject: selectedSubject, classForm: selectedClass, scheduledTime: '', topic: '' }); setShowLiveModal(false); Alert.alert('Success', 'Live class scheduled.'); }}><Text style={styles.modalBtnTextLight}>Schedule</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Syllabus Modal */}
      <Modal visible={showSyllabusModal} transparent animationType="fade" onRequestClose={() => setShowSyllabusModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Add Syllabus Topic</Text>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Elective Mathematics" placeholderTextColor={colors.textLight} value={syllabusForm.subject} onChangeText={(v) => setSyllabusForm({ ...syllabusForm, subject: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={syllabusForm.classForm} onChangeText={(v) => setSyllabusForm({ ...syllabusForm, classForm: v })} />
          <Text style={styles.inputLabel}>Topic *</Text>
          <TextInput style={styles.input} placeholder="e.g. Differential Equations" placeholderTextColor={colors.textLight} value={syllabusForm.topic} onChangeText={(v) => setSyllabusForm({ ...syllabusForm, topic: v })} />
          <Text style={styles.inputLabel}>Sub-Topics</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. First order, separation of variables" placeholderTextColor={colors.textLight} value={syllabusForm.subTopics} onChangeText={(v) => setSyllabusForm({ ...syllabusForm, subTopics: v })} multiline />
          <Text style={styles.inputLabel}>Week</Text>
          <TextInput style={styles.input} placeholder="1" placeholderTextColor={colors.textLight} value={String(syllabusForm.week)} onChangeText={(v) => setSyllabusForm({ ...syllabusForm, week: parseInt(v) || 1 })} keyboardType="numeric" />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowSyllabusModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!syllabusForm.topic.trim()) { Alert.alert('Error', 'Topic is required'); return; } addSyllabusTopic(syllabusForm); setSyllabusForm({ subject: selectedSubject, classForm: selectedClass, topic: '', subTopics: '', week: 1 }); setShowSyllabusModal(false); Alert.alert('Success', 'Syllabus topic added.'); }}><Text style={styles.modalBtnTextLight}>Add</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Remedial Modal */}
      <Modal visible={showRemedialModal} transparent animationType="fade" onRequestClose={() => setShowRemedialModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Add Remedial Student</Text>
          <Text style={styles.inputLabel}>Student Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Daniel Osei" placeholderTextColor={colors.textLight} value={remedialForm.studentName} onChangeText={(v) => setRemedialForm({ ...remedialForm, studentName: v })} />
          <Text style={styles.inputLabel}>Admission No</Text>
          <TextInput style={styles.input} placeholder="e.g. 2026/004" placeholderTextColor={colors.textLight} value={remedialForm.admNo} onChangeText={(v) => setRemedialForm({ ...remedialForm, admNo: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={remedialForm.classForm} onChangeText={(v) => setRemedialForm({ ...remedialForm, classForm: v })} />
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Elective Mathematics" placeholderTextColor={colors.textLight} value={remedialForm.subject} onChangeText={(v) => setRemedialForm({ ...remedialForm, subject: v })} />
          <Text style={styles.inputLabel}>Area of Difficulty *</Text>
          <TextInput style={styles.input} placeholder="e.g. Factoring quadratics" placeholderTextColor={colors.textLight} value={remedialForm.area} onChangeText={(v) => setRemedialForm({ ...remedialForm, area: v })} />
          <Text style={styles.inputLabel}>Intervention</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. After-school practice sessions" placeholderTextColor={colors.textLight} value={remedialForm.intervention} onChangeText={(v) => setRemedialForm({ ...remedialForm, intervention: v })} multiline />
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Additional notes" placeholderTextColor={colors.textLight} value={remedialForm.notes} onChangeText={(v) => setRemedialForm({ ...remedialForm, notes: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowRemedialModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!remedialForm.studentName.trim() || !remedialForm.area.trim()) { Alert.alert('Error', 'Student name and area of difficulty are required'); return; } addRemedialStudent({ ...remedialForm, dateStarted: new Date().toISOString().slice(0, 10), progress: 'Just Started' }); setRemedialForm({ studentName: '', admNo: '', classForm: selectedClass, subject: selectedSubject, area: '', intervention: '', notes: '' }); setShowRemedialModal(false); Alert.alert('Success', 'Student added to remedial support.'); }}><Text style={styles.modalBtnTextLight}>Add</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  subjectCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  subjectName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  subjectClass: { fontSize: fontSize.md, color: colors.primary, marginTop: spacing.xs },
  subjectMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  avActions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  recordBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  recordBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  startLiveBtn: { backgroundColor: colors.danger, borderRadius: radius.md, paddingVertical: spacing.sm + 6, alignItems: 'center', marginBottom: spacing.lg },
  startLiveBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  sessionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  sessionSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  sessionTime: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  sessionStatus: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: spacing.xs },
  announcementCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  announcementTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  announcementMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, fontStyle: 'italic', paddingVertical: spacing.md },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 480, padding: spacing.xl, maxHeight: '90%' },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  textArea: { minHeight: 60 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  selectChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  selectChipText: { fontSize: fontSize.xs, color: colors.textSecondary },
  selectChipTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalBtn: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  modalBtnTextLight: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  pickerChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  pickerChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  pickerChipText: { fontSize: fontSize.xs, color: colors.textSecondary },
  pickerChipTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  rowBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  smallBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: spacing.xs, marginBottom: spacing.xs },
  smallBtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  timetableCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  timetablePeriod: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  timetablePeriodText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  subCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.xs, gap: spacing.sm },
  subName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  subMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  gradeBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  gradeBtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warning + '15', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  filePickerBtn: { borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.sm, backgroundColor: colors.primary + '08' },
  filePickerBtnText: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
