import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, TextInput, Platform, Linking } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, KitchenMenuWidget } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { electionApi } from '@shared/api/electionApi';
import { useAcademicStore } from '@store/academicStore';
import { useLibraryStore } from '@store/libraryStore';
import { useBursaryStore } from '@store/bursaryStore';
import { useKitchenStore } from '@store/kitchenStore';
import { useRegistryStore } from '@store/registryStore';
import { useStudentStore } from '@store/studentStore';
import { apiClient } from '@shared/api/apiClient';

const isWeb = Platform.OS === 'web' || typeof navigator !== 'undefined';

// @ts-expect-error - kept for future use
const _DateInput = ({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: any }) => {
  if (isWeb) {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '10px', border: '1px solid #ccc', borderRadius: radius.sm, width: '100%', fontSize: fontSize.md, marginBottom: spacing.sm, ...style }}
      />
    );
  }
  return <TextInput style={[styles.input, style]} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={value} onChangeText={onChange} />;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'timetable', label: 'Timetable' },
  { key: 'classes', label: 'My Classes' },
  { key: 'materials', label: 'Learning Materials' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'results', label: 'Results & Report Cards' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'fees', label: 'Fees / Capitation' },
  { key: 'menu', label: "Today's Menu" },
  { key: 'library', label: 'Library Account' },
  { key: 'health', label: 'Health Record' },
  { key: 'exeats', label: 'Exeat Requests' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'teacher-content', label: 'Teacher Content' },
  { key: 'house', label: 'My House' },
  { key: 'messages', label: 'Messages' },
  { key: 'elections', label: 'Elections' },
  { key: 'feedback', label: 'Grievance / Feedback' },
];

export function StudentDashboard() {
  const [activePage, setActivePage] = useState('profile');
  const { logout, user } = useAuthStore();
  const sStore = useStudentStore();

  // Election state
  const [voterId, setVoterId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showVoteConfirm, setShowVoteConfirm] = useState(false);
  const [showVoterIdCard, setShowVoterIdCard] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState({ position: '', manifesto: '', status: '', votes: 0 });
  const [candidates, setCandidates] = useState<any[]>([]);

  // Feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ subject: '', body: '', routedTo: 'SRC' });

  // Assignment submission
  const [submittingAssignment, setSubmittingAssignment] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('');

  // Timetable state
  const [timetableDay, setTimetableDay] = useState('Monday');
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Exeat modal state
  const [showExeatModal, setShowExeatModal] = useState(false);
  const [exeatForm, setExeatForm] = useState({ reason: '', reasonDetail: '', destination: '', departureDate: '', returnDate: '', transportMode: 'Bus' });

  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({ recipientType: 'parent', recipientName: '', subject: '', body: '' });

  // Teacher content sub-tab
  const [contentTab, setContentTab] = useState<'materials' | 'live' | 'av' | 'shared' | 'quizzes'>('materials');

  // Fees state
  const feeRecords = useBursaryStore((s) => s.fees);
  const myFees = feeRecords.filter((f) => f.admNo === sStore.profile?.admissionNumber);

  // Library state
  const circulation = useLibraryStore((s) => s.circulation);
  const myCirculation = circulation.filter((c) => c.borrowerName === sStore.profile?.fullName);

  // Academic store for timetable
  const timetables = useAcademicStore((s) => s.timetables);
  const myClass = sStore.profile?.classSection ?? '';
  const myTimetable = timetables.filter((t) => t.classForm === myClass && t.day === timetableDay && t.status === 'Published');

  useEffect(() => {
    sStore.loadAll();
    fetchElectionData();    useAcademicStore.getState().loadAll();
    useLibraryStore.getState().loadAll();
    useBursaryStore.getState().loadAll();
    useKitchenStore.getState().loadAll();
    useRegistryStore.getState().loadAll();
  }, []);

  const fetchElectionData = async () => {
    try {
      const data = await electionApi.getMyVoterId();
      setVoterId(data.voterId);
      setHasVoted(data.hasVoted);
      setIsCandidate(data.isCandidate);
      if (data.candidateInfo) setCandidateInfo(data.candidateInfo);
      const cands = await apiClient.get<any[]>('/students/candidates');
      setCandidates(cands || []);
    } catch {
      setVoterId('VOT-2026-0007');
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'profile': {
        const p = sStore.profile;
        const initials = p ? `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}` : '??';
        return (
          <View>
            <View style={styles.profileCard}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{p?.fullName ?? 'Loading...'}</Text>
                <Text style={styles.profileDetail}>Adm No: {p?.admissionNumber ?? '—'}</Text>
                <Text style={styles.profileDetail}>Class: {p?.classSection ?? '—'}</Text>
                <Text style={styles.profileDetail}>House: {p?.house ?? '—'}</Text>
                <Text style={styles.profileDetail}>Guardian: {p?.guardianName ?? '—'} | {p?.guardianPhone ?? '—'}</Text>
              </View>
            </View>
          </View>
        );
      }
      case 'timetable':
        return (
          <View>
            <Text style={styles.pageTitle}>My Timetable</Text>
            <View style={styles.dayRow}>
              {DAYS.map((d) => (
                <TouchableOpacity key={d} style={[styles.dayChip, timetableDay === d && styles.dayChipActive]} onPress={() => setTimetableDay(d)}>
                  <Text style={[styles.dayChipText, timetableDay === d && styles.dayChipTextActive]}>{d.slice(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {myTimetable.length > 0 ? (
              myTimetable.sort((a, b) => a.period - b.period).map((item) => (
                <View key={item.id} style={styles.timetableCard}>
                  <Text style={styles.timetableTime}>{item.startTime} - {item.endTime}</Text>
                  <Text style={styles.timetableSubject}>{item.subject}</Text>
                  <Text style={styles.timetableDetail}>{item.teacher} | {item.room}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No timetable entries for {timetableDay}.</Text>
            )}
          </View>
        );
      case 'classes':
        return (
          <View>
            <Text style={styles.pageTitle}>My Classes</Text>
            {sStore.classes.length > 0 ? (
              sStore.classes.map((item) => (
                <TouchableOpacity key={item.id} style={styles.classCard}>
                  <Text style={styles.classSubject}>{item.subject}</Text>
                  <Text style={styles.classTeacher}>{item.teacher}</Text>
                  {item.nextSession && <Text style={styles.classSession}>{item.nextSession}</Text>}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No classes assigned yet.</Text>
            )}
          </View>
        );
      case 'materials':
        return (
          <View>
            <Text style={styles.pageTitle}>Learning Materials</Text>
            <Text style={styles.pageSubtitle}>Downloaded materials available offline</Text>
            {sStore.materials.length > 0 ? (
              sStore.materials.map((item) => (
                <View key={item.id} style={styles.materialCard}>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{item.title}</Text>
                    <Text style={styles.materialMeta}>{item.subject} | {item.type}</Text>
                  </View>
                  <View style={[styles.downloadBadge, item.downloaded ? { backgroundColor: colors.success } : { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.primary }]}>
                    <Text style={[styles.downloadText, item.downloaded ? { color: colors.white } : { color: colors.primary }]}>
                      {item.downloaded ? 'Downloaded' : 'Download'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No materials available.</Text>
            )}
          </View>
        );
      case 'assignments':
        return (
          <View>
            <Text style={styles.pageTitle}>Assignments</Text>
            {sStore.assignments.length > 0 ? (
              sStore.assignments.map((item) => (
                <View key={item.id} style={styles.assignmentCard}>
                  <Text style={styles.assignmentTitle}>{item.assignmentTitle}</Text>
                  <Text style={styles.assignmentMeta}>{item.subject} | Due: {item.dueDate}</Text>
                  <Text style={[styles.assignmentStatus,
                    item.status.startsWith('Graded') ? { color: colors.success } :
                    item.status === 'Submitted' ? { color: colors.info } :
                    { color: colors.warning }
                  ]}>{item.status}{item.score != null ? ` (${item.score}/${item.maxScore})` : ''}</Text>
                  {(item.status === 'Pending' || item.status === 'Not Submitted') && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => { setSubmittingAssignment(item.assignmentId); setSubmissionContent(''); setSubmissionFileUrl(''); }}>
                      <Text style={styles.actionBtnText}>Submit Assignment</Text>
                    </TouchableOpacity>
                  )}
                  {item.feedback && <Text style={styles.feedbackText}>Feedback: {item.feedback}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No assignments yet.</Text>
            )}
          </View>
        );
      case 'results': {
        const results = sStore.results;
        const avg = results.length > 0 ? (results.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / results.length).toFixed(1) : '—';
        const pos = results.find((r) => r.classPosition != null);
        return (
          <View>
            <Text style={styles.pageTitle}>Results & Report Cards</Text>
            <CardGrid>
              <StatCard label="Term Average" value={`${avg}%`} accentColor={colors.primary} />
              <StatCard label="Class Position" value={pos ? `${pos.classPosition}th` : '—'} subtitle={pos ? `of ${pos.classSize}` : ''} accentColor={colors.info} />
            </CardGrid>
            {results.length > 0 ? (
              results.map((item) => (
                <View key={item.id} style={styles.resultCard}>
                  <Text style={styles.resultSubject}>{item.subject}</Text>
                  <Text style={styles.resultScore}>{item.score}/{item.maxScore}</Text>
                  <Text style={styles.resultGrade}>{item.grade}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No results published yet.</Text>
            )}
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Download Full Report Card (PDF)</Text>
            </TouchableOpacity>
          </View>
        );
      }
      case 'attendance': {
        const records = sStore.attendance;
        const present = records.filter((a) => a.status === 'Present').length;
        const total = records.length || 1;
        const rate = ((present / total) * 100).toFixed(1);
        const absences = records.filter((a) => a.status !== 'Present');
        return (
          <View>
            <Text style={styles.pageTitle}>Attendance Record</Text>
            <CardGrid>
              <StatCard label="Attendance Rate" value={`${rate}%`} accentColor={colors.success} />
              <StatCard label="Total Records" value={String(records.length)} accentColor={colors.primary} />
            </CardGrid>
            <Text style={styles.pageSubtitle}>Recent absences</Text>
            {absences.length > 0 ? (
              absences.slice(0, 10).map((item) => (
                <View key={item.id} style={styles.attendanceCard}>
                  <Text style={styles.attendanceDate}>{item.date}</Text>
                  <Text style={styles.attendanceDetail}>{item.type} — {item.subject}</Text>
                  <Text style={[styles.attendanceStatus, item.status === 'Absent' ? { color: colors.danger } : { color: colors.warning }]}>
                    {item.status}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No absences recorded.</Text>
            )}
          </View>
        );
      }
      case 'fees': {
        const totalDue = myFees.reduce((s, f) => s + f.amountDue, 0);
        const totalPaid = myFees.reduce((s, f) => s + f.amountPaid, 0);
        const balance = totalDue - totalPaid;
        const feeStatus = balance <= 0 ? 'Cleared' : balance < totalDue ? 'Partial' : 'Owing';
        return (
          <View>
            <Text style={styles.pageTitle}>Fees / Capitation Status</Text>
            <View style={styles.feeCard}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Total Due</Text>
                <Text style={styles.feeValue}>GH₵ {totalDue.toLocaleString()}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Amount Paid</Text>
                <Text style={styles.feeValue}>GH₵ {totalPaid.toLocaleString()}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Balance</Text>
                <Text style={[styles.feeValue, { color: balance <= 0 ? colors.success : colors.danger }]}>GH₵ {balance.toLocaleString()}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Status</Text>
                <Text style={[styles.feeValue, { color: feeStatus === 'Cleared' ? colors.success : feeStatus === 'Partial' ? colors.warning : colors.danger }]}>{feeStatus}</Text>
              </View>
            </View>
            {myFees.length === 0 && <Text style={styles.emptyText}>No fee records found for your account.</Text>}
          </View>
        );
      }
      case 'menu':
        return (
          <View>
            <KitchenMenuWidget role="Student" personName={user?.displayName} />
          </View>
        );
      case 'library':
        return (
          <View>
            <Text style={styles.pageTitle}>Library Account</Text>
            <Text style={styles.pageSubtitle}>Currently borrowed books</Text>
            {myCirculation.length > 0 ? (
              myCirculation.filter((c) => c.status === 'Borrowed' || c.status === 'Overdue').map((item) => (
                <View key={item.id} style={styles.libraryCard}>
                  <Text style={styles.libraryTitle}>{item.bookTitle}</Text>
                  <Text style={styles.libraryDue}>Due: {item.dueDate} | Status: {item.status}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No books currently borrowed.</Text>
            )}
          </View>
        );
      case 'health': {
        const hr = sStore.healthRecords;
        const conditions = hr.find((r) => r.conditions)?.conditions;
        const allergies = hr.find((r) => r.allergies)?.allergies;
        return (
          <View>
            <Text style={styles.pageTitle}>Health Record</Text>
            <View style={styles.healthCard}>
              <Text style={styles.healthSection}>Known Conditions / Allergies</Text>
              <Text style={styles.healthDetail}>{conditions || allergies || 'None on file'}</Text>
            </View>
            <Text style={styles.pageSubtitle}>Sick Bay Visits</Text>
            {hr.length > 0 ? (
              hr.map((item) => (
                <View key={item.id} style={styles.healthVisitCard}>
                  <Text style={styles.healthDate}>{item.date}</Text>
                  <Text style={styles.healthReason}>{item.reason}</Text>
                  <Text style={styles.healthTreatment}>{item.treatment}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No sick bay visits recorded.</Text>
            )}
          </View>
        );
      }
      case 'elections':
        return (
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.pageTitle}>Elections</Text>
            <Text style={styles.pageSubtitle}>SRC & Prefectorial Elections 2026/2027</Text>

            {isCandidate && (
              <View style={styles.candidateInfoCard}>
                <View style={styles.candidateInfoHeader}>
                  <Text style={styles.candidateInfoTitle}>You are a Candidate</Text>
                  <View style={[styles.candidateStatusBadge, candidateInfo.status === 'Approved' ? styles.statusApproved : styles.statusPending]}>
                    <Text style={styles.candidateStatusText}>{candidateInfo.status}</Text>
                  </View>
                </View>
                <Text style={styles.candidatePosition}>{candidateInfo.position}</Text>
                <Text style={styles.candidateManifesto}>{candidateInfo.manifesto}</Text>
                <View style={styles.candidateStats}>
                  <View style={styles.candidateStat}>
                    <Text style={styles.candidateStatValue}>{candidateInfo.votes}</Text>
                    <Text style={styles.candidateStatLabel}>Votes</Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.voterIdCard} onPress={() => setShowVoterIdCard(true)}>
              <View style={styles.voterIdHeader}>
                <Text style={styles.voterIdLabel}>Your Voter ID</Text>
                <Text style={styles.voterIdNumber}>{voterId}</Text>
              </View>
              <Text style={styles.voterIdStatus}>Eligible to Vote</Text>
            </TouchableOpacity>

            <View style={styles.electionStatusCard}>
              <Text style={styles.electionStatus}>Voting is Open</Text>
            </View>

            {hasVoted ? (
              <View style={styles.votedCard}>
                <Text style={styles.votedIcon}>✓</Text>
                <Text style={styles.votedTitle}>You have voted</Text>
                <Text style={styles.votedSubtitle}>Thank you for participating in the elections</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Cast Your Vote — SRC President</Text>
                {candidates.length > 0 ? (
                  candidates.map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.candidateCard, selectedCandidate === item.id && styles.candidateCardSelected]}
                      onPress={() => setSelectedCandidate(item.id)}
                    >
                      <View style={styles.candidateHeader}>
                        <View style={styles.candidateAvatar}>
                          <Text style={styles.candidateAvatarText}>{item.name?.split(' ').map((n: string) => n[0]).join('') ?? '?'}</Text>
                        </View>
                        <View style={styles.candidateInfo}>
                          <Text style={styles.candidateName}>{item.name}</Text>
                          <Text style={styles.candidateClass}>{item.position}</Text>
                        </View>
                        {selectedCandidate === item.id && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.candidateManifesto}>{item.manifesto}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No candidates available.</Text>
                )}
                <TouchableOpacity
                  style={[styles.voteBtn, !selectedCandidate && styles.voteBtnDisabled]}
                  onPress={() => selectedCandidate && setShowVoteConfirm(true)}
                  disabled={!selectedCandidate}
                >
                  <Text style={styles.voteBtnText}>Submit Vote</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        );
      case 'feedback':
        return (
          <View>
            <Text style={styles.pageTitle}>Grievance / Feedback</Text>
            <Text style={styles.pageSubtitle}>Submit a complaint or suggestion to SRC or Counselling</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowFeedbackModal(true)}>
              <Text style={styles.actionBtnText}>+ Submit New Grievance</Text>
            </TouchableOpacity>
            {sStore.feedback.length > 0 ? (
              sStore.feedback.map((item) => (
                <View key={item.id} style={styles.feedbackCard}>
                  <Text style={styles.feedbackSubject}>{item.subject}</Text>
                  <Text style={styles.feedbackMeta}>{item.date} | To: {item.routedTo}</Text>
                  <Text style={styles.feedbackStatus}>{item.status}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No feedback submitted yet.</Text>
            )}
          </View>
        );
      case 'exeats':
        return (
          <View>
            <Text style={styles.pageTitle}>Exeat Requests</Text>
            <Text style={styles.pageSubtitle}>Request permission to leave campus</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowExeatModal(true)}>
              <Text style={styles.actionBtnText}>+ Request New Exeat</Text>
            </TouchableOpacity>
            {sStore.exeats.length > 0 ? (
              sStore.exeats.map((ex) => (
                <View key={ex.id} style={styles.exeatCard}>
                  <View style={styles.exeatHeader}>
                    <Text style={styles.exeatNo}>{ex.exeatNo}</Text>
                    <Text style={[styles.exeatStatusBadge, ex.status === 'Approved' && styles.exeatStatusApproved, ex.status === 'Pending' && styles.exeatStatusPending, ex.status === 'Rejected' && styles.exeatStatusRejected]}>{ex.status}</Text>
                  </View>
                  <Text style={styles.exeatReason}>{ex.reason}</Text>
                  {ex.reasonDetail ? <Text style={styles.exeatDetail}>{ex.reasonDetail}</Text> : null}
                  {ex.destination ? <Text style={styles.exeatMeta}>Destination: {ex.destination}</Text> : null}
                  <Text style={styles.exeatMeta}>Departure: {ex.departureDate} | Return: {ex.returnDate}</Text>
                  {ex.transportMode ? <Text style={styles.exeatMeta}>Transport: {ex.transportMode}</Text> : null}
                  {ex.approvedBy ? <Text style={styles.exeatMeta}>Approved by: {ex.approvedBy} on {ex.approvedDate}</Text> : null}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No exeat requests yet.</Text>
            )}
          </View>
        );
      case 'announcements':
        return (
          <View>
            <Text style={styles.pageTitle}>Announcements</Text>
            <Text style={styles.pageSubtitle}>Notices from your teachers</Text>
            {sStore.announcements.length > 0 ? (
              sStore.announcements.map((a) => (
                <View key={a.id} style={[styles.announcementCard, a.priority === 'High' && styles.announcementHigh]}>
                  <View style={styles.announcementHeader}>
                    <Text style={styles.announcementTitle}>{a.title}</Text>
                    {a.priority === 'High' ? <Text style={styles.announcementPriority}>HIGH</Text> : null}
                  </View>
                  {a.body ? <Text style={styles.announcementBody}>{a.body}</Text> : null}
                  <Text style={styles.announcementMeta}>By {a.postedBy} | {a.date} | {a.classForm}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No announcements available.</Text>
            )}
          </View>
        );
      case 'teacher-content':
        return (
          <View>
            <Text style={styles.pageTitle}>Teacher Content</Text>
            <Text style={styles.pageSubtitle}>Learning resources shared by your teachers</Text>
            <View style={styles.dayRow}>
              {([['materials', 'Materials'], ['live', 'Live Sessions'], ['av', 'AV Recordings'], ['shared', 'Shared Resources'], ['quizzes', 'Quizzes']] as const).map(([key, label]) => (
                <TouchableOpacity key={key} style={[styles.dayChip, contentTab === key && styles.dayChipActive]} onPress={() => setContentTab(key)}>
                  <Text style={[styles.dayChipText, contentTab === key && styles.dayChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {contentTab === 'materials' && (
              sStore.teacherMaterials.length > 0 ? sStore.teacherMaterials.map((m) => (
                <View key={m.id} style={styles.materialCard}>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{m.title}</Text>
                    <Text style={styles.materialMeta}>{m.subject} | {m.classForm} | {m.type}</Text>
                    {m.topic ? <Text style={styles.materialMeta}>Topic: {m.topic}</Text> : null}
                    {m.description ? <Text style={styles.materialMeta}>{m.description}</Text> : null}
                    <Text style={styles.materialMeta}>By {m.uploadedBy} | {m.dateUploaded}</Text>
                  </View>
                  {m.fileUrl ? (
                    <TouchableOpacity style={styles.downloadBadge} onPress={() => isWeb ? window.open(m.fileUrl!, '_blank') : Linking.openURL(m.fileUrl!)}>
                      <Text style={styles.downloadText}>Open</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )) : <Text style={styles.emptyText}>No materials available.</Text>
            )}
            {contentTab === 'live' && (
              sStore.liveSessions.length > 0 ? sStore.liveSessions.map((s) => (
                <View key={s.id} style={styles.liveSessionCard}>
                  <Text style={styles.liveSessionTitle}>{s.topic}</Text>
                  <Text style={styles.materialMeta}>{s.subject} | {s.classForm}</Text>
                  <Text style={styles.materialMeta}>Scheduled: {s.scheduledTime}</Text>
                  <Text style={styles.liveSessionStatus}>Status: {s.status}</Text>
                  {s.startedBy ? <Text style={styles.materialMeta}>Started by: {s.startedBy}</Text> : null}
                  {s.recordingUrl ? (
                    <TouchableOpacity style={styles.downloadBadge} onPress={() => isWeb ? window.open(s.recordingUrl!, '_blank') : Linking.openURL(s.recordingUrl!)}>
                      <Text style={styles.downloadText}>Recording</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )) : <Text style={styles.emptyText}>No live sessions scheduled.</Text>
            )}
            {contentTab === 'av' && (
              sStore.avRecordings.length > 0 ? sStore.avRecordings.map((r) => (
                <View key={r.id} style={styles.materialCard}>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{r.title}</Text>
                    <Text style={styles.materialMeta}>{r.subject} | {r.classForm} | {r.type}</Text>
                    {r.topic ? <Text style={styles.materialMeta}>Topic: {r.topic}</Text> : null}
                    {r.duration ? <Text style={styles.materialMeta}>Duration: {r.duration}</Text> : null}
                    <Text style={styles.materialMeta}>By {r.recordedBy} | {r.dateRecorded}</Text>
                  </View>
                  {r.url ? (
                    <TouchableOpacity style={styles.downloadBadge} onPress={() => isWeb ? window.open(r.url!, '_blank') : Linking.openURL(r.url!)}>
                      <Text style={styles.downloadText}>Play</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )) : <Text style={styles.emptyText}>No AV recordings available.</Text>
            )}
            {contentTab === 'shared' && (
              sStore.sharedResources.length > 0 ? sStore.sharedResources.map((r) => (
                <View key={r.id} style={styles.materialCard}>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{r.title}</Text>
                    <Text style={styles.materialMeta}>{r.subject} | {r.type}</Text>
                    {r.description ? <Text style={styles.materialMeta}>{r.description}</Text> : null}
                    <Text style={styles.materialMeta}>By {r.sharedBy} | {r.sharedDate}</Text>
                  </View>
                  {r.fileUrl ? (
                    <TouchableOpacity style={styles.downloadBadge} onPress={() => isWeb ? window.open(r.fileUrl!, '_blank') : Linking.openURL(r.fileUrl!)}>
                      <Text style={styles.downloadText}>Open</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )) : <Text style={styles.emptyText}>No shared resources available.</Text>
            )}
            {contentTab === 'quizzes' && (
              sStore.quizzes.length > 0 ? sStore.quizzes.map((q) => (
                <View key={q.id} style={styles.quizCard}>
                  <Text style={styles.materialTitle}>{q.title}</Text>
                  <Text style={styles.materialMeta}>{q.subject} | {q.classForm}</Text>
                  <Text style={styles.materialMeta}>Marks: {q.totalMarks} | Duration: {q.duration} min</Text>
                  <Text style={styles.materialMeta}>Due: {q.dueDate} | Expires: {q.expiryDate}</Text>
                  <Text style={styles.liveSessionStatus}>Status: {q.status}</Text>
                </View>
              )) : <Text style={styles.emptyText}>No quizzes published.</Text>
            )}
          </View>
        );
      case 'house':
        return (
          <View>
            <Text style={styles.pageTitle}>My House</Text>
            <Text style={styles.pageSubtitle}>Boarding house information and records</Text>
            {sStore.profile?.house ? (
              <>
                <View style={styles.houseInfoCard}>
                  <Text style={styles.houseInfoTitle}>House: {sStore.profile.house}</Text>
                  <Text style={styles.houseInfoMeta}>Student: {sStore.profile.fullName}</Text>
                  <Text style={styles.houseInfoMeta}>Adm No: {sStore.profile.admissionNumber}</Text>
                </View>

                <Text style={styles.sectionTitle}>Recent Roll Calls</Text>
                {sStore.rollCalls.length > 0 ? (
                  sStore.rollCalls.map((rc) => (
                    <View key={rc.id} style={styles.rollCallCard}>
                      <View style={styles.rollCallHeader}>
                        <Text style={styles.rollCallDate}>{rc.date}</Text>
                        <Text style={[styles.rollCallStatus, rc.status === 'Present' && styles.exeatStatusApproved, rc.status === 'Absent' && styles.exeatStatusRejected]}>{rc.status}</Text>
                      </View>
                      <Text style={styles.materialMeta}>{rc.studentName} | Room: {rc.room || '—'}</Text>
                      {rc.notes ? <Text style={styles.materialMeta}>Notes: {rc.notes}</Text> : null}
                      <Text style={styles.materialMeta}>Recorded by: {rc.recordedBy}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No roll call records.</Text>
                )}

                <Text style={styles.sectionTitle}>Discipline Records</Text>
                {sStore.disciplineRecords.length > 0 ? (
                  sStore.disciplineRecords.map((d) => (
                    <View key={d.id} style={styles.disciplineCard}>
                      <View style={styles.rollCallHeader}>
                        <Text style={styles.rollCallDate}>{d.date}</Text>
                        <Text style={[styles.exeatStatusBadge, d.severity === 'Major' && styles.exeatStatusRejected, d.severity === 'Minor' && styles.exeatStatusPending]}>{d.severity}</Text>
                      </View>
                      <Text style={styles.materialMeta}>{d.studentName}</Text>
                      <Text style={styles.disciplineIncident}>{d.incident}</Text>
                      {d.actionTaken ? <Text style={styles.materialMeta}>Action: {d.actionTaken}</Text> : null}
                      {d.escalated ? <Text style={styles.escalatedText}>ESCALATED</Text> : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No discipline records.</Text>
                )}
              </>
            ) : (
              <Text style={styles.emptyText}>You are not assigned to a house.</Text>
            )}
          </View>
        );
      case 'messages':
        return (
          <View>
            <Text style={styles.pageTitle}>Messages</Text>
            <Text style={styles.pageSubtitle}>Communicate with your parent/guardian, teachers, or administration</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => {
              setMessageForm({ recipientType: 'parent', recipientName: sStore.profile?.guardianName || '', subject: '', body: '' });
              setShowMessageModal(true);
            }}>
              <Text style={styles.actionBtnText}>+ New Message</Text>
            </TouchableOpacity>
            {sStore.messages.length > 0 ? (
              sStore.messages.map((msg) => (
                <View key={msg.id} style={styles.messageCard}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageSubject}>{msg.subject}</Text>
                    <Text style={styles.messageRecipient}>{msg.recipientType === 'parent' ? 'Parent' : msg.recipientType}</Text>
                  </View>
                  <Text style={styles.messageBody}>{msg.body}</Text>
                  <Text style={styles.materialMeta}>To: {msg.recipientName || msg.recipientType} | {new Date(msg.createdAt).toLocaleDateString()}</Text>
                  {msg.reply ? (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyLabel}>Reply:</Text>
                      <Text style={styles.replyText}>{msg.reply}</Text>
                      <Text style={styles.materialMeta}>By {msg.replyBy} on {msg.replyDate}</Text>
                    </View>
                  ) : (
                    <Text style={styles.messagePending}>Awaiting reply...</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No messages sent yet.</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Student Portal"
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

      {/* Voter ID Card Modal */}
      <Modal visible={showVoterIdCard} animationType="slide" transparent onRequestClose={() => setShowVoterIdCard(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Voter ID Card</Text>
            <View style={styles.voterIdCardFull}>
              <View style={styles.voterIdCardHeader}>
                <Text style={styles.voterIdCardSchool}>SIMS High School</Text>
                <Text style={styles.voterIdCardElection}>SRC Elections 2026/2027</Text>
              </View>
              <View style={styles.voterIdCardBody}>
                <View style={styles.voterIdCardAvatar}>
                  <Text style={styles.voterIdCardAvatarText}>{sStore.profile ? `${sStore.profile.firstName[0]}${sStore.profile.lastName[0]}` : '??'}</Text>
                </View>
                <View style={styles.voterIdCardInfo}>
                  <Text style={styles.voterIdCardName}>{sStore.profile?.fullName ?? '—'}</Text>
                  <Text style={styles.voterIdCardDetail}>Adm No: {sStore.profile?.admissionNumber ?? '—'}</Text>
                  <Text style={styles.voterIdCardDetail}>Class: {sStore.profile?.classSection ?? '—'}</Text>
                  <Text style={styles.voterIdCardDetail}>House: {sStore.profile?.house ?? '—'}</Text>
                </View>
              </View>
              <View style={styles.voterIdCardFooter}>
                <Text style={styles.voterIdCardNumber}>{voterId}</Text>
                <Text style={styles.voterIdCardValid}>Valid for: 2026/2027 Elections</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowVoterIdCard(false)}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Vote Confirmation Modal */}
      <Modal visible={showVoteConfirm} animationType="slide" transparent onRequestClose={() => setShowVoteConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Your Vote</Text>
            <Text style={styles.modalSubtitle}>You are about to vote for:</Text>
            <View style={styles.confirmVoteCard}>
              <Text style={styles.confirmVoteName}>
                {candidates.find((c) => c.id === selectedCandidate)?.name ?? '—'}
              </Text>
              <Text style={styles.confirmVotePosition}>SRC President</Text>
            </View>
            <Text style={styles.modalWarning}>This action cannot be undone.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowVoteConfirm(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={async () => {
                  try {
                    await electionApi.castVote(voterId!, selectedCandidate!);
                    setHasVoted(true);
                    setShowVoteConfirm(false);
                    Alert.alert('Success', 'Your vote has been recorded');
                  } catch {
                    Alert.alert('Error', 'Failed to cast vote. Please try again.');
                  }
                }}
              >
                <Text style={styles.modalBtnText}>Confirm Vote</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal visible={showFeedbackModal} transparent animationType="fade" onRequestClose={() => setShowFeedbackModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Submit Grievance / Feedback</Text>
          <Text style={styles.inputLabel}>Subject *</Text>
          <TextInput style={styles.input} placeholder="Brief subject" placeholderTextColor={colors.textLight} value={feedbackForm.subject} onChangeText={(v) => setFeedbackForm({ ...feedbackForm, subject: v })} />
          <Text style={styles.inputLabel}>Routed To</Text>
          <View style={styles.selectRow}>
            {['SRC', 'Counselling', 'Headmaster', 'Bursary'].map((opt) => (
              <TouchableOpacity key={opt} style={[styles.selectChip, feedbackForm.routedTo === opt && styles.selectChipActive]} onPress={() => setFeedbackForm({ ...feedbackForm, routedTo: opt })}>
                <Text style={[styles.selectChipText, feedbackForm.routedTo === opt && styles.selectChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Details *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Describe your grievance or suggestion" placeholderTextColor={colors.textLight} value={feedbackForm.body} onChangeText={(v) => setFeedbackForm({ ...feedbackForm, body: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowFeedbackModal(false)}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
              if (!feedbackForm.subject.trim() || !feedbackForm.body.trim()) { Alert.alert('Error', 'Subject and details are required'); return; }
              sStore.createFeedback(feedbackForm.subject, feedbackForm.body, feedbackForm.routedTo);
              setFeedbackForm({ subject: '', body: '', routedTo: 'SRC' });
              setShowFeedbackModal(false);
              Alert.alert('Success', 'Feedback submitted.');
            }}><Text style={styles.modalBtnText}>Submit</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Assignment Submission Modal */}
      <Modal visible={!!submittingAssignment} transparent animationType="fade" onRequestClose={() => setSubmittingAssignment(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Submit Assignment</Text>
          <Text style={styles.inputLabel}>Written Submission</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Type your answer or notes" placeholderTextColor={colors.textLight} value={submissionContent} onChangeText={setSubmissionContent} multiline />
          <Text style={styles.inputLabel}>Attach File</Text>
          {isWeb ? (
            <input
              type="file"
              style={{ marginBottom: spacing.sm, padding: '8px', border: '1px solid #ccc', borderRadius: radius.sm, width: '100%' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setSubmissionFileUrl(f.name); }}
            />
          ) : (
            <TextInput style={styles.input} placeholder="File URL" placeholderTextColor={colors.textLight} value={submissionFileUrl} onChangeText={setSubmissionFileUrl} />
          )}
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setSubmittingAssignment(null)}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={async () => {
              if (!submittingAssignment) return;
              await sStore.submitAssignment(submittingAssignment, submissionContent || undefined, submissionFileUrl || undefined);
              setSubmittingAssignment(null);
              setSubmissionContent('');
              setSubmissionFileUrl('');
              Alert.alert('Success', 'Assignment submitted.');
            }}><Text style={styles.modalBtnText}>Submit</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Exeat Request Modal */}
      <Modal visible={showExeatModal} transparent animationType="fade" onRequestClose={() => setShowExeatModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Request Exeat</Text>
          <Text style={styles.modalSubtitle}>Fill in the details to request permission to leave campus</Text>
          <Text style={styles.inputLabel}>Reason *</Text>
          <View style={styles.selectRow}>
            {['Medical', 'Family Emergency', 'Personal', 'Official Assignment', 'Other'].map((opt) => (
              <TouchableOpacity key={opt} style={[styles.selectChip, exeatForm.reason === opt && styles.selectChipActive]} onPress={() => setExeatForm({ ...exeatForm, reason: opt })}>
                <Text style={[styles.selectChipText, exeatForm.reason === opt && styles.selectChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Additional Details</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Provide more details about your reason" placeholderTextColor={colors.textLight} value={exeatForm.reasonDetail} onChangeText={(v) => setExeatForm({ ...exeatForm, reasonDetail: v })} multiline />
          <Text style={styles.inputLabel}>Destination</Text>
          <TextInput style={styles.input} placeholder="Where will you be going?" placeholderTextColor={colors.textLight} value={exeatForm.destination} onChangeText={(v) => setExeatForm({ ...exeatForm, destination: v })} />
          <Text style={styles.inputLabel}>Departure Date *</Text>
          {isWeb ? (
            <input type="date" value={exeatForm.departureDate} onChange={(e) => setExeatForm({ ...exeatForm, departureDate: e.target.value })} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: radius.sm, width: '100%', fontSize: fontSize.md, marginBottom: spacing.sm }} />
          ) : (
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={exeatForm.departureDate} onChangeText={(v) => setExeatForm({ ...exeatForm, departureDate: v })} />
          )}
          <Text style={styles.inputLabel}>Return Date *</Text>
          {isWeb ? (
            <input type="date" value={exeatForm.returnDate} onChange={(e) => setExeatForm({ ...exeatForm, returnDate: e.target.value })} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: radius.sm, width: '100%', fontSize: fontSize.md, marginBottom: spacing.sm }} />
          ) : (
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={exeatForm.returnDate} onChangeText={(v) => setExeatForm({ ...exeatForm, returnDate: v })} />
          )}
          <Text style={styles.inputLabel}>Transport Mode</Text>
          <View style={styles.selectRow}>
            {['Bus', 'Car', 'Taxi', 'Walk', 'Other'].map((opt) => (
              <TouchableOpacity key={opt} style={[styles.selectChip, exeatForm.transportMode === opt && styles.selectChipActive]} onPress={() => setExeatForm({ ...exeatForm, transportMode: opt })}>
                <Text style={[styles.selectChipText, exeatForm.transportMode === opt && styles.selectChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowExeatModal(false)}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
              if (!exeatForm.reason.trim() || !exeatForm.departureDate.trim() || !exeatForm.returnDate.trim()) { Alert.alert('Error', 'Reason, departure date, and return date are required'); return; }
              sStore.requestExeat(exeatForm.reason, exeatForm.reasonDetail, exeatForm.destination, exeatForm.departureDate, exeatForm.returnDate, exeatForm.transportMode);
              setExeatForm({ reason: '', reasonDetail: '', destination: '', departureDate: '', returnDate: '', transportMode: 'Bus' });
              setShowExeatModal(false);
              Alert.alert('Success', 'Exeat request submitted. Awaiting approval.');
            }}><Text style={styles.modalBtnText}>Submit</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Message Modal */}
      <Modal visible={showMessageModal} transparent animationType="fade" onRequestClose={() => setShowMessageModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>New Message</Text>
          <Text style={styles.inputLabel}>Send To</Text>
          <View style={styles.selectRow}>
            {['parent', 'teacher', 'headmaster', 'counsellor', 'bursary'].map((opt) => (
              <TouchableOpacity key={opt} style={[styles.selectChip, messageForm.recipientType === opt && styles.selectChipActive]} onPress={() => setMessageForm({ ...messageForm, recipientType: opt, recipientName: opt === 'parent' ? (sStore.profile?.guardianName || '') : '' })}>
                <Text style={[styles.selectChipText, messageForm.recipientType === opt && styles.selectChipTextActive]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {messageForm.recipientType === 'parent' && (
            <>
              <Text style={styles.inputLabel}>Guardian Name</Text>
              <TextInput style={styles.input} placeholder="Guardian name" placeholderTextColor={colors.textLight} value={messageForm.recipientName} onChangeText={(v) => setMessageForm({ ...messageForm, recipientName: v })} />
            </>
          )}
          <Text style={styles.inputLabel}>Subject *</Text>
          <TextInput style={styles.input} placeholder="Message subject" placeholderTextColor={colors.textLight} value={messageForm.subject} onChangeText={(v) => setMessageForm({ ...messageForm, subject: v })} />
          <Text style={styles.inputLabel}>Message *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Type your message" placeholderTextColor={colors.textLight} value={messageForm.body} onChangeText={(v) => setMessageForm({ ...messageForm, body: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowMessageModal(false)}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
              if (!messageForm.subject.trim() || !messageForm.body.trim()) { Alert.alert('Error', 'Subject and message are required'); return; }
              sStore.createMessage(messageForm.recipientType, messageForm.recipientName, messageForm.subject, messageForm.body);
              setMessageForm({ recipientType: 'parent', recipientName: '', subject: '', body: '' });
              setShowMessageModal(false);
              Alert.alert('Success', 'Message sent.');
            }}><Text style={styles.modalBtnText}>Send</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.lg },
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  profileDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  dayRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  dayChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  dayChipActive: { backgroundColor: colors.primary },
  dayChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  dayChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  timetableCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.primary },
  timetableTime: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  timetableSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.xs },
  timetableDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  classCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  classSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  classTeacher: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  classSession: { fontSize: fontSize.sm, color: colors.primary, marginTop: spacing.sm },
  materialCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  materialInfo: { flex: 1 },
  materialTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  materialMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  downloadBadge: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.sm },
  downloadText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  assignmentCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  assignmentTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  assignmentMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  assignmentStatus: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: spacing.sm },
  feedbackText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, fontStyle: 'italic' },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultSubject: { fontSize: fontSize.md, color: colors.text, flex: 1 },
  resultScore: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textSecondary },
  resultGrade: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary, marginLeft: spacing.md },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  attendanceCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendanceDate: { fontSize: fontSize.sm, color: colors.textLight },
  attendanceDetail: { fontSize: fontSize.md, color: colors.text, flex: 1, marginLeft: spacing.sm },
  attendanceStatus: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  feeCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  feeLabel: { fontSize: fontSize.md, color: colors.textSecondary },
  feeValue: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  libraryCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  libraryTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  libraryDue: { fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  healthCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  healthSection: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  healthDetail: { fontSize: fontSize.sm, color: colors.textSecondary },
  healthVisitCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  healthDate: { fontSize: fontSize.xs, color: colors.textLight },
  healthReason: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text, marginTop: spacing.xs },
  healthTreatment: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  electionStatusCard: { backgroundColor: colors.success + '15', borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' },
  electionStatus: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.success },
  candidateCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  candidateName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  candidateClass: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  candidateManifesto: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.sm },
  voteBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  voteBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  feedbackCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  feedbackSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  feedbackMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  feedbackStatus: { fontSize: fontSize.sm, color: colors.info, marginTop: spacing.xs },
  voterIdCard: { backgroundColor: colors.primary + '15', borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.primary },
  voterIdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  voterIdLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  voterIdNumber: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  voterIdStatus: { fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semibold },
  candidateInfoCard: { backgroundColor: colors.info + '15', borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.info },
  candidateInfoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  candidateInfoTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  candidateStatusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusApproved: { backgroundColor: colors.successBg },
  statusPending: { backgroundColor: colors.warningBg },
  candidateStatusText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  candidatePosition: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  candidateStats: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  candidateStat: { alignItems: 'center' },
  candidateStatValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  candidateStatLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  votedCard: { backgroundColor: colors.success + '15', borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  votedIcon: { fontSize: 48, color: colors.success, marginBottom: spacing.sm },
  votedTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.success, marginBottom: spacing.xs },
  votedSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
  candidateCardSelected: { backgroundColor: colors.primary + '15', borderWidth: 2, borderColor: colors.primary },
  candidateHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  candidateAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  candidateAvatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.white },
  candidateInfo: { flex: 1 },
  selectedBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  selectedBadgeText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  voteBtnDisabled: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: colors.black + '80', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 400, padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  modalSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  modalWarning: { fontSize: fontSize.sm, color: colors.danger, textAlign: 'center', marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  voterIdCardFull: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  voterIdCardHeader: { alignItems: 'center', marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  voterIdCardSchool: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  voterIdCardElection: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  voterIdCardBody: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  voterIdCardAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg },
  voterIdCardAvatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.white },
  voterIdCardInfo: { flex: 1 },
  voterIdCardName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  voterIdCardDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  voterIdCardFooter: { alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  voterIdCardNumber: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary, marginBottom: spacing.xs },
  voterIdCardValid: { fontSize: fontSize.sm, color: colors.textSecondary },
  confirmVoteCard: { backgroundColor: colors.primary + '15', borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg },
  confirmVoteName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  confirmVotePosition: { fontSize: fontSize.md, color: colors.textSecondary },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  selectChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  selectChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  // Exeat styles
  exeatCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.primary },
  exeatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  exeatNo: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  exeatStatusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text, overflow: 'hidden' },
  exeatStatusApproved: { backgroundColor: colors.successBg },
  exeatStatusPending: { backgroundColor: colors.warningBg },
  exeatStatusRejected: { backgroundColor: colors.danger + '20' },
  exeatReason: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  exeatDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  exeatMeta: { fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  // Announcement styles
  announcementCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.info },
  announcementHigh: { borderLeftColor: colors.danger, backgroundColor: colors.danger + '08' },
  announcementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  announcementTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 },
  announcementPriority: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.danger + '15', borderRadius: radius.sm, marginLeft: spacing.sm },
  announcementBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  announcementMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm },
  // Live session styles
  liveSessionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.success },
  liveSessionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  liveSessionStatus: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary, marginTop: spacing.xs },
  // Quiz styles
  quizCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.warning },
  // House styles
  houseInfoCard: { backgroundColor: colors.primary + '10', borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.primary + '30' },
  houseInfoTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary, marginBottom: spacing.xs },
  houseInfoMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  rollCallCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  rollCallHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  rollCallDate: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  rollCallStatus: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, overflow: 'hidden' },
  disciplineCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  disciplineIncident: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs, fontStyle: 'italic' },
  escalatedText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger, marginTop: spacing.xs },
  // Message styles
  messageCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  messageSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 },
  messageRecipient: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.primary + '10', borderRadius: radius.sm },
  messageBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  messagePending: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  replyBox: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  replyLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.success, marginBottom: spacing.xs },
  replyText: { fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
});
