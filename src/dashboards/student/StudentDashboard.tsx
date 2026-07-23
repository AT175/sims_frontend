import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, KitchenMenuWidget } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { electionApi } from '@shared/api/electionApi';

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
  { key: 'elections', label: 'Elections' },
  { key: 'feedback', label: 'Grievance / Feedback' },
];

export function StudentDashboard() {
  const [activePage, setActivePage] = useState('profile');
  const { logout, user } = useAuthStore();
  
  // Election state
  const [voterId, setVoterId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showVoteConfirm, setShowVoteConfirm] = useState(false);
  const [showVoterIdCard, setShowVoterIdCard] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState({
    position: '',
    manifesto: '',
    status: '',
    votes: 0,
  });

  useEffect(() => {
    fetchElectionData();
  }, []);

  const fetchElectionData = async () => {
    try {
      const data = await electionApi.getMyVoterId();
      setVoterId(data.voterId);
      setHasVoted(data.hasVoted);
      setIsCandidate(data.isCandidate);
      if (data.candidateInfo) {
        setCandidateInfo(data.candidateInfo);
      }
    } catch (error) {
      console.error('Failed to fetch election data:', error);
      // Use mock data as fallback
      setVoterId('VOT-2026-0007');
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'profile':
        return (
          <View>
            <View style={styles.profileCard}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>KA</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Kwame Asante</Text>
                <Text style={styles.profileDetail}>Adm No: 2026/001</Text>
                <Text style={styles.profileDetail}>Class: SHS2 Science A</Text>
                <Text style={styles.profileDetail}>House: Aggrey (Room A-12)</Text>
                <Text style={styles.profileDetail}>Guardian: Mr. Asante | 024-XXX-XXXX</Text>
              </View>
            </View>
          </View>
        );
      case 'timetable':
        return (
          <View>
            <Text style={styles.pageTitle}>My Timetable</Text>
            <Text style={styles.pageSubtitle}>Monday</Text>
            {[
              { time: '08:00 - 08:40', subject: 'Elective Mathematics', teacher: 'Mr. Mensah', room: 'Sci Lab 1' },
              { time: '08:40 - 09:20', subject: 'English Language', teacher: 'Mrs. Boateng', room: 'Room 12' },
              { time: '09:20 - 10:00', subject: 'Chemistry', teacher: 'Mr. Adjei', room: 'Chem Lab' },
              { time: '10:15 - 10:55', subject: 'Physics', teacher: 'Mr. Adjei', room: 'Phys Lab' },
              { time: '10:55 - 11:35', subject: 'Core Maths', teacher: 'Mr. Mensah', room: 'Room 12' },
            ].map((item, i) => (
              <View key={i} style={styles.timetableCard}>
                <Text style={styles.timetableTime}>{item.time}</Text>
                <Text style={styles.timetableSubject}>{item.subject}</Text>
                <Text style={styles.timetableDetail}>{item.teacher} | {item.room}</Text>
              </View>
            ))}
          </View>
        );
      case 'classes':
        return (
          <View>
            <Text style={styles.pageTitle}>My Classes</Text>
            {[
              { subject: 'Elective Mathematics', teacher: 'Mr. Mensah', nextSession: 'Live class tomorrow 14:00' },
              { subject: 'Chemistry', teacher: 'Mr. Adjei', nextSession: 'No upcoming session' },
              { subject: 'Physics', teacher: 'Mr. Adjei', nextSession: 'Recording available' },
              { subject: 'English Language', teacher: 'Mrs. Boateng', nextSession: 'Live class Friday 10:00' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.classCard}>
                <Text style={styles.classSubject}>{item.subject}</Text>
                <Text style={styles.classTeacher}>{item.teacher}</Text>
                <Text style={styles.classSession}>{item.nextSession}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'materials':
        return (
          <View>
            <Text style={styles.pageTitle}>Learning Materials</Text>
            <Text style={styles.pageSubtitle}>Downloaded materials available offline</Text>
            {[
              { title: 'Quadratic Equations — Notes', subject: 'Elective Math', type: 'Note', downloaded: true },
              { title: 'Chemical Bonding — Slides', subject: 'Chemistry', type: 'Slide', downloaded: true },
              { title: 'Newton\'s Laws — Video', subject: 'Physics', type: 'Video', downloaded: false },
              { title: 'Past Questions — Core Math', subject: 'Core Math', type: 'Past Q', downloaded: true },
            ].map((item, i) => (
              <View key={i} style={styles.materialCard}>
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
            ))}
          </View>
        );
      case 'assignments':
        return (
          <View>
            <Text style={styles.pageTitle}>Assignments</Text>
            {[
              { title: 'Quadratic Equations Exercise 3', subject: 'Elective Math', due: 'Jul 10', status: 'Pending' },
              { title: 'Chemical Bonding Report', subject: 'Chemistry', due: 'Jul 08', status: 'Submitted' },
              { title: 'Newton\'s Laws Problem Set', subject: 'Physics', due: 'Jul 12', status: 'Pending' },
              { title: 'Essay: Climate Change', subject: 'English', due: 'Jul 05', status: 'Graded (18/20)' },
            ].map((item, i) => (
              <View key={i} style={styles.assignmentCard}>
                <Text style={styles.assignmentTitle}>{item.title}</Text>
                <Text style={styles.assignmentMeta}>{item.subject} | Due: {item.due}</Text>
                <Text style={[styles.assignmentStatus,
                  item.status.startsWith('Graded') ? { color: colors.success } :
                  item.status === 'Submitted' ? { color: colors.info } :
                  { color: colors.warning }
                ]}>{item.status}</Text>
              </View>
            ))}
          </View>
        );
      case 'results':
        return (
          <View>
            <Text style={styles.pageTitle}>Results & Report Cards</Text>
            <CardGrid>
              <StatCard label="Term 2 Average" value="68.5%" accentColor={colors.primary} />
              <StatCard label="Class Position" value="14th" subtitle="of 42" accentColor={colors.info} />
            </CardGrid>
            {[
              { subject: 'Elective Mathematics', score: '72/100', grade: 'B2' },
              { subject: 'Chemistry', score: '65/100', grade: 'B3' },
              { subject: 'Physics', score: '70/100', grade: 'B2' },
              { subject: 'English Language', score: '68/100', grade: 'B3' },
              { subject: 'Core Mathematics', score: '75/100', grade: 'B1' },
            ].map((item, i) => (
              <View key={i} style={styles.resultCard}>
                <Text style={styles.resultSubject}>{item.subject}</Text>
                <Text style={styles.resultScore}>{item.score}</Text>
                <Text style={styles.resultGrade}>{item.grade}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Download Full Report Card (PDF)</Text>
            </TouchableOpacity>
          </View>
        );
      case 'attendance':
        return (
          <View>
            <Text style={styles.pageTitle}>Attendance Record</Text>
            <CardGrid>
              <StatCard label="Class Attendance" value="92.5%" accentColor={colors.success} />
              <StatCard label="House Roll Call" value="96.8%" accentColor={colors.primary} />
            </CardGrid>
            <Text style={styles.pageSubtitle}>Recent absences</Text>
            {[
              { date: '2026-07-01', type: 'Class', subject: 'Chemistry', status: 'Absent' },
              { date: '2026-06-28', type: 'House', subject: 'Roll Call', status: 'Excused' },
            ].map((item, i) => (
              <View key={i} style={styles.attendanceCard}>
                <Text style={styles.attendanceDate}>{item.date}</Text>
                <Text style={styles.attendanceDetail}>{item.type} — {item.subject}</Text>
                <Text style={[styles.attendanceStatus, item.status === 'Absent' ? { color: colors.danger } : { color: colors.warning }]}>
                  {item.status}
                </Text>
              </View>
            ))}
          </View>
        );
      case 'fees':
        return (
          <View>
            <Text style={styles.pageTitle}>Fees / Capitation Status</Text>
            <View style={styles.feeCard}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Total Due (Term 3)</Text>
                <Text style={styles.feeValue}>GH₵ 1,200</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Amount Paid</Text>
                <Text style={styles.feeValue}>GH₵ 1,200</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Balance</Text>
                <Text style={[styles.feeValue, { color: colors.success }]}>GH₵ 0</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Status</Text>
                <Text style={[styles.feeValue, { color: colors.success }]}>Cleared</Text>
              </View>
            </View>
          </View>
        );
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
            {[
              { title: 'Advanced Mathematics', author: 'K.A. Stroud', dueDate: 'Jul 15', fine: 'None' },
              { title: 'Organic Chemistry', author: 'Morrison & Boyd', dueDate: 'Jul 08', fine: 'None' },
            ].map((item, i) => (
              <View key={i} style={styles.libraryCard}>
                <Text style={styles.libraryTitle}>{item.title}</Text>
                <Text style={styles.libraryDetail}>{item.author}</Text>
                <Text style={styles.libraryDue}>Due: {item.dueDate} | Fine: {item.fine}</Text>
              </View>
            ))}
          </View>
        );
      case 'health':
        return (
          <View>
            <Text style={styles.pageTitle}>Health Record</Text>
            <View style={styles.healthCard}>
              <Text style={styles.healthSection}>Known Conditions / Allergies</Text>
              <Text style={styles.healthDetail}>None on file</Text>
            </View>
            <Text style={styles.pageSubtitle}>Sick Bay Visits</Text>
            {[
              { date: '2026-06-20', reason: 'Headache', treatment: 'Paracetamol given' },
              { date: '2026-05-15', reason: 'Stomach upset', treatment: 'Rest, oral rehydration' },
            ].map((item, i) => (
              <View key={i} style={styles.healthVisitCard}>
                <Text style={styles.healthDate}>{item.date}</Text>
                <Text style={styles.healthReason}>{item.reason}</Text>
                <Text style={styles.healthTreatment}>{item.treatment}</Text>
              </View>
            ))}
          </View>
        );
      case 'elections':
        return (
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.pageTitle}>Elections</Text>
            <Text style={styles.pageSubtitle}>SRC & Prefectorial Elections 2026/2027</Text>
            
            {/* Candidate Info Card (if student is a candidate) */}
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
                  <View style={styles.candidateStat}>
                    <Text style={styles.candidateStatValue}>Active</Text>
                    <Text style={styles.candidateStatLabel}>Status</Text>
                  </View>
                </View>
              </View>
            )}
            
            {/* Voter ID Card */}
            <TouchableOpacity style={styles.voterIdCard} onPress={() => setShowVoterIdCard(true)}>
              <View style={styles.voterIdHeader}>
                <Text style={styles.voterIdLabel}>Your Voter ID</Text>
                <Text style={styles.voterIdNumber}>{voterId}</Text>
              </View>
              <Text style={styles.voterIdStatus}>Eligible to Vote</Text>
            </TouchableOpacity>

            {/* Election Status */}
            <View style={styles.electionStatusCard}>
              <Text style={styles.electionStatus}>Voting is Open</Text>
              <Text style={styles.electionDate}>Closes: Jul 10, 2026 at 16:00</Text>
            </View>

            {/* Election Timeline */}
            <Text style={styles.sectionTitle}>Election Timeline</Text>
            <View style={styles.timelineContainer}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotCompleted]} />
                <Text style={styles.timelineLabel}>Nominations</Text>
                <Text style={styles.timelineDate}>Completed</Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotCompleted]} />
                <Text style={styles.timelineLabel}>Campaigning</Text>
                <Text style={styles.timelineDate}>Completed</Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]} />
                <Text style={styles.timelineLabel}>Voting</Text>
                <Text style={styles.timelineDate}>In Progress</Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <Text style={styles.timelineLabel}>Results</Text>
                <Text style={styles.timelineDate}>Jul 11</Text>
              </View>
            </View>

            {/* Voting Section */}
            {hasVoted ? (
              <View style={styles.votedCard}>
                <Text style={styles.votedIcon}>✓</Text>
                <Text style={styles.votedTitle}>You have voted</Text>
                <Text style={styles.votedSubtitle}>Thank you for participating in the elections</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Cast Your Vote — SRC President</Text>
                {[
                  { id: '1', name: 'Ama Serwaa', class: 'SHS3 Sci A', house: 'Unity', manifesto: 'Better welfare for students, improved cafeteria services, and more study areas' },
                  { id: '2', name: 'Kofi Bamfo', class: 'SHS3 Arts B', house: 'Peace', manifesto: 'Improved sports facilities, talent development programs, and student entrepreneurship support' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.candidateCard,
                      selectedCandidate === item.id && styles.candidateCardSelected
                    ]}
                    onPress={() => setSelectedCandidate(item.id)}
                  >
                    <View style={styles.candidateHeader}>
                      <View style={styles.candidateAvatar}>
                        <Text style={styles.candidateAvatarText}>{item.name.split(' ').map(n => n[0]).join('')}</Text>
                      </View>
                      <View style={styles.candidateInfo}>
                        <Text style={styles.candidateName}>{item.name}</Text>
                        <Text style={styles.candidateClass}>{item.class} | {item.house}</Text>
                      </View>
                      {selectedCandidate === item.id && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.candidateManifesto}>{item.manifesto}</Text>
                  </TouchableOpacity>
                ))}

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
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>+ Submit New Grievance</Text>
            </TouchableOpacity>
            {[
              { date: '2026-07-02', subject: 'Library closing too early', status: 'Sent to SRC', to: 'SRC' },
              { date: '2026-06-25', subject: 'Request for counselling', status: 'Appointment booked', to: 'Counselling' },
            ].map((item, i) => (
              <View key={i} style={styles.feedbackCard}>
                <Text style={styles.feedbackSubject}>{item.subject}</Text>
                <Text style={styles.feedbackMeta}>{item.date} | To: {item.to}</Text>
                <Text style={styles.feedbackStatus}>{item.status}</Text>
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
      <Modal
        visible={showVoterIdCard}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVoterIdCard(false)}
      >
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
                  <Text style={styles.voterIdCardAvatarText}>KA</Text>
                </View>
                <View style={styles.voterIdCardInfo}>
                  <Text style={styles.voterIdCardName}>Kwame Asante</Text>
                  <Text style={styles.voterIdCardDetail}>Adm No: 2026/001</Text>
                  <Text style={styles.voterIdCardDetail}>Class: SHS2 Science A</Text>
                  <Text style={styles.voterIdCardDetail}>House: Aggrey</Text>
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
      <Modal
        visible={showVoteConfirm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVoteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Your Vote</Text>
            <Text style={styles.modalSubtitle}>You are about to vote for:</Text>
            <View style={styles.confirmVoteCard}>
              <Text style={styles.confirmVoteName}>
                {selectedCandidate === '1' ? 'Ama Serwaa' : 'Kofi Bamfo'}
              </Text>
              <Text style={styles.confirmVotePosition}>SRC President</Text>
            </View>
            <Text style={styles.modalWarning}>This action cannot be undone.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowVoteConfirm(false)}
              >
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
                  } catch (error) {
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
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  profileDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
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
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultSubject: { fontSize: fontSize.md, color: colors.text, flex: 1 },
  resultScore: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textSecondary },
  resultGrade: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary, marginLeft: spacing.md },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
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
  libraryDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
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
  electionDate: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
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
  // Election Styles
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
  timelineContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: colors.border },
  timelineDotCompleted: { backgroundColor: colors.success, borderColor: colors.success },
  timelineDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timelineLabel: { fontSize: fontSize.xs, color: colors.text, marginTop: spacing.xs, textAlign: 'center' },
  timelineDate: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
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
  // Modal Styles
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
});
