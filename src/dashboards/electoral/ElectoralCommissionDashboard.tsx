import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert, Image } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { electionApi } from '@shared/api/electionApi';

const NAV_ITEMS: NavItem[] = [
  { key: 'calendar', label: 'Election Calendar' },
  { key: 'candidates', label: 'Candidate Registration' },
  { key: 'voters', label: 'Voter Roll' },
  { key: 'ballot', label: 'Ballot Management' },
  { key: 'voting', label: 'Voting & Live Results' },
  { key: 'reports', label: 'Election Reports' },
  { key: 'settings', label: 'Settings' },
];

export function ElectoralCommissionDashboard() {
  const [activePage, setActivePage] = useState('calendar');
  const { logout } = useAuthStore();
  
  // Candidate registration modal state
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    position: '',
    class: '',
    house: '',
    manifesto: '',
    photo: null as string | null,
  });

  // Add Voter modal state
  const [showVoterModal, setShowVoterModal] = useState(false);
  const [voterFilter, setVoterFilter] = useState({
    academicYear: '2025/2026',
    level: 'SHS3',
    class: 'Sci A',
  });
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Voter ID generation state
  const [showVoterIdModal, setShowVoterIdModal] = useState(false);
  const [generatedVoterIds, setGeneratedVoterIds] = useState<any[]>([]);

  // Ballot management state
  const [universalCredential, setUniversalCredential] = useState<any>(null);

  // Load universal credential on mount
  useEffect(() => {
    generateUniversalCredential();
  }, []);

  const generateUniversalCredential = async () => {
    try {
      const response = await electionApi.generateTempCredentials('');
      setUniversalCredential(response);
    } catch (error) {
      console.error('Failed to generate universal credential:', error);
    }
  };

  const handleSeedStudents = async () => {
    try {
      const response = await electionApi.seedStudents();
      const voterIdsList = response.voterIds.map((v: any) => `${v.name}: ${v.voterId}`).join('\n');
      Alert.alert('Success', `${response.message}\n\nVoter IDs:\n${voterIdsList}`);
    } catch (error: any) {
      console.error('Failed to seed students:', error);
      Alert.alert('Error', error?.message || 'Failed to seed students');
    }
  };

  // Mock student data
  const mockStudents = [
    { id: '1', name: 'Ama Serwaa', class: 'SHS3 Sci A', house: 'Unity', registered: true },
    { id: '2', name: 'Kofi Bamfo', class: 'SHS3 Arts B', house: 'Peace', registered: true },
    { id: '3', name: 'Grace Opoku', class: 'SHS3 Sci B', house: 'Unity', registered: false },
    { id: '4', name: 'Daniel Osei', class: 'SHS3 Sci A', house: 'Justice', registered: true },
    { id: '5', name: 'Emmanuel Mensah', class: 'SHS3 Arts A', house: 'Freedom', registered: true },
    { id: '6', name: 'Abena Owusu', class: 'SHS3 Sci C', house: 'Peace', registered: false },
    { id: '7', name: 'Kwame Asante', class: 'SHS3 Sci A', house: 'Unity', registered: true },
    { id: '8', name: 'Felicity Adjei', class: 'SHS3 Arts B', house: 'Peace', registered: true },
    { id: '9', name: 'Samuel Darko', class: 'SHS3 Sci B', house: 'Justice', registered: false },
    { id: '10', name: 'Dorothy Mensah', class: 'SHS3 Arts A', house: 'Freedom', registered: true },
  ];

  const handlePhotoUpload = () => {
    // Create a hidden file input for web
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          setCandidateForm({ ...candidateForm, photo: event.target.result });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRegisterCandidate = () => {
    if (!candidateForm.name || !candidateForm.position || !candidateForm.class) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    // TODO: Submit to backend
    Alert.alert('Success', 'Candidate registered successfully');
    setShowCandidateModal(false);
    setCandidateForm({ name: '', position: '', class: '', house: '', manifesto: '', photo: null });
  };

  const handleGenerateVoterIds = async () => {
    try {
      const response = await electionApi.generateVoterIds();
      const ids = response.voterIds.map(v => ({
        id: v.id,
        name: v.name,
        class: 'SHS3 Sci A', // Would come from backend
        house: 'Unity', // Would come from backend
        registered: true,
        voterId: v.voterId,
      }));
      setGeneratedVoterIds(ids);
      setShowVoterIdModal(true);
      Alert.alert('Success', `Generated ${response.count} voter IDs`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate voter IDs');
      console.error(error);
    }
  };

  const handleDownloadPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <title>Voter ID List - SIMS High School</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1A1A2E; text-align: center; }
            h2 { color: #5C6370; font-size: 16px; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #1A1A2E; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .voter-id { font-weight: bold; color: #6366f1; }
          </style>
        </head>
        <body>
          <h1>Voter ID List</h1>
          <h2>SIMS High School - SRC Elections 2026/2027</h2>
          <table>
            <thead>
              <tr>
                <th>Voter ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>House</th>
              </tr>
            </thead>
            <tbody>
              ${generatedVoterIds.map(v => `
                <tr>
                  <td class="voter-id">${v.voterId}</td>
                  <td>${v.name}</td>
                  <td>${v.class}</td>
                  <td>${v.house}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 30px; text-align: center; color: #5C6370;">
            Generated on: ${new Date().toLocaleDateString()}
          </p>
        </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'calendar':
        return (
          <View>
            <Text style={styles.pageTitle}>Election Calendar</Text>
            <Text style={styles.pageSubtitle}>SRC & Prefectorial Elections 2026/2027</Text>
            
            {/* Timeline Visualization */}
            <View style={styles.timelineContainer}>
              {[
                { phase: 'Nomination Period', dates: 'Jul 1 - Jul 7', status: 'completed', icon: '✓' },
                { phase: 'Campaign Window', dates: 'Jul 8 - Jul 14', status: 'active', icon: '▶' },
                { phase: 'Voting Day', dates: 'Jul 15', status: 'upcoming', icon: '•' },
                { phase: 'Results Declaration', dates: 'Jul 16', status: 'upcoming', icon: '•' },
              ].map((item, i) => (
                <View key={i} style={styles.timelineItem}>
                  <View style={[
                    styles.timelineDot,
                    item.status === 'completed' && styles.timelineDotCompleted,
                    item.status === 'active' && styles.timelineDotActive,
                  ]}>
                    <Text style={[
                      styles.timelineIcon,
                      item.status === 'completed' && { color: colors.white },
                      item.status === 'active' && { color: colors.white },
                    ]}>{item.icon}</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelinePhase}>{item.phase}</Text>
                    <Text style={styles.timelineDates}>{item.dates}</Text>
                  </View>
                  {i < 3 && <View style={styles.timelineLine} />}
                </View>
              ))}
            </View>

            {/* Detailed Phase Cards */}
            <Text style={styles.sectionTitle}>Phase Details</Text>
            {[
              { phase: 'Nomination Period', dates: 'Jul 1 - Jul 7', status: 'Completed', description: 'Students submitted nomination forms with endorsements' },
              { phase: 'Campaign Window', dates: 'Jul 8 - Jul 14', status: 'Active', description: 'Candidates campaign, manifestos published, debates scheduled' },
              { phase: 'Voting Day', dates: 'Jul 15', status: 'Upcoming', description: 'Digital voting opens at 08:00, closes at 16:00' },
              { phase: 'Results Declaration', dates: 'Jul 16', status: 'Upcoming', description: 'Results announced, winners sworn in' },
            ].map((item, i) => (
              <View key={i} style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                  <Text style={styles.calendarPhase}>{item.phase}</Text>
                  <View style={[
                    styles.statusBadge,
                    item.status === 'Completed' ? { backgroundColor: colors.success } :
                    item.status === 'Active' ? { backgroundColor: colors.primary } :
                    { backgroundColor: colors.surfaceAlt }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      (item.status === 'Completed' || item.status === 'Active') ? { color: colors.white } : { color: colors.textSecondary }
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.calendarDates}>{item.dates}</Text>
                <Text style={styles.calendarDescription}>{item.description}</Text>
              </View>
            ))}
          </View>
        );
      case 'candidates':
        return (
          <View>
            <Text style={styles.pageTitle}>Candidate Registration</Text>
            <Text style={styles.pageSubtitle}>Nominee applications and eligibility vetting</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCandidateModal(true)}>
              <Text style={styles.actionBtnText}>+ Register Candidate</Text>
            </TouchableOpacity>
            <CardGrid>
              <StatCard label="Total Candidates" value="12" subtitle="Across all positions" accentColor={colors.primary} />
              <StatCard label="Vetted" value="9" subtitle="75% approved" accentColor={colors.success} />
              <StatCard label="Pending" value="3" subtitle="Awaiting review" accentColor={colors.warning} />
            </CardGrid>
            <DataTable
              columns={[
                { key: 'name', label: 'Name', render: (i) => i.name },
                { key: 'position', label: 'Position', render: (i) => i.position },
                { key: 'class', label: 'Class', render: (i) => i.class },
                { key: 'house', label: 'House', render: (i) => i.house },
                { key: 'vetted', label: 'Vetted', render: (i) => i.vetted },
              ]}
              data={[
                { name: 'Ama Serwaa', position: 'SRC President', class: 'SHS3 Sci A', house: 'Unity', vetted: 'Yes' },
                { name: 'Kofi Bamfo', position: 'SRC President', class: 'SHS3 Arts B', house: 'Peace', vetted: 'Yes' },
                { name: 'Grace Opoku', position: "Girls' Prefect", class: 'SHS3 Sci B', house: 'Unity', vetted: 'Pending' },
                { name: 'Daniel Osei', position: "Boys' Prefect", class: 'SHS3 Sci A', house: 'Justice', vetted: 'Yes' },
                { name: 'Emmanuel Mensah', position: 'Sports Prefect', class: 'SHS3 Arts A', house: 'Freedom', vetted: 'Yes' },
                { name: 'Abena Owusu', position: 'Library Prefect', class: 'SHS3 Sci C', house: 'Peace', vetted: 'Pending' },
              ]}
            />
          </View>
        );
      case 'voters':
        return (
          <View>
            <Text style={styles.pageTitle}>Voter Roll</Text>
            <Text style={styles.pageSubtitle}>Eligible student voters by class/level</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginRight: spacing.sm }]} onPress={() => setShowVoterModal(true)}>
                <Text style={styles.actionBtnText}>+ Add Voter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: colors.success, marginRight: spacing.sm }]} onPress={handleGenerateVoterIds}>
                <Text style={styles.actionBtnText}>Generate Voter IDs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: colors.info, marginLeft: spacing.sm }]} onPress={handleSeedStudents}>
                <Text style={styles.actionBtnText}>Seed Students</Text>
              </TouchableOpacity>
            </View>
            <CardGrid>
              <StatCard label="Total Eligible" value="1,180" subtitle="SHS2 + SHS3" accentColor={colors.primary} />
              <StatCard label="Registered" value="1,142" subtitle="96.8%" accentColor={colors.success} />
              <StatCard label="Pending" value="38" subtitle="3.2%" accentColor={colors.warning} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Voter Registration by Class</Text>
            <DataTable
              columns={[
                { key: 'class', label: 'Class', render: (i) => i.class },
                { key: 'eligible', label: 'Eligible', render: (i) => i.eligible },
                { key: 'registered', label: 'Registered', render: (i) => i.registered },
                { key: 'pct', label: '%', render: (i) => i.pct },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { class: 'SHS3 Sci A', eligible: '45', registered: '45', pct: '100%', status: 'Complete' },
                { class: 'SHS3 Sci B', eligible: '42', registered: '42', pct: '100%', status: 'Complete' },
                { class: 'SHS3 Sci C', eligible: '38', registered: '38', pct: '100%', status: 'Complete' },
                { class: 'SHS3 Arts A', eligible: '50', registered: '50', pct: '100%', status: 'Complete' },
                { class: 'SHS3 Arts B', eligible: '47', registered: '47', pct: '100%', status: 'Complete' },
                { class: 'SHS3 Arts C', eligible: '45', registered: '45', pct: '100%', status: 'Complete' },
                { class: 'SHS3 Gen A', eligible: '52', registered: '52', pct: '100%', status: 'Complete' },
                { class: 'SHS3 Gen B', eligible: '48', registered: '48', pct: '100%', status: 'Complete' },
                { class: 'SHS3 Gen C', eligible: '45', registered: '38', pct: '84%', status: 'Pending' },
                { class: 'SHS2 Sci A', eligible: '48', registered: '48', pct: '100%', status: 'Complete' },
                { class: 'SHS2 Sci B', eligible: '44', registered: '44', pct: '100%', status: 'Complete' },
                { class: 'SHS2 Sci C', eligible: '40', registered: '40', pct: '100%', status: 'Complete' },
                { class: 'SHS2 Arts A', eligible: '52', registered: '52', pct: '100%', status: 'Complete' },
                { class: 'SHS2 Arts B', eligible: '48', registered: '48', pct: '100%', status: 'Complete' },
                { class: 'SHS2 Arts C', eligible: '45', registered: '45', pct: '100%', status: 'Complete' },
                { class: 'SHS2 Gen A', eligible: '55', registered: '55', pct: '100%', status: 'Complete' },
                { class: 'SHS2 Gen B', eligible: '50', registered: '50', pct: '100%', status: 'Complete' },
                { class: 'SHS2 Gen C', eligible: '48', registered: '45', pct: '94%', status: 'Pending' },
              ]}
            />
          </View>
        );
      case 'ballot':
        return (
          <View>
            <Text style={styles.pageTitle}>Ballot Management</Text>
            <Text style={styles.pageSubtitle}>Universal voting credentials for all students</Text>
            
            {/* Universal Credential Display */}
            {universalCredential && (
              <View style={styles.universalCredentialCard}>
                <View style={styles.credentialHeader}>
                  <Text style={styles.credentialTitle}>Universal Voting Credential</Text>
                  <TouchableOpacity style={styles.regenerateBtn} onPress={generateUniversalCredential}>
                    <Text style={styles.regenerateBtnText}>Regenerate</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.credentialBody}>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>Username:</Text>
                    <Text style={styles.credentialValue}>{universalCredential.username}</Text>
                  </View>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>Password:</Text>
                    <Text style={styles.credentialValue}>{universalCredential.password}</Text>
                  </View>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>Expires At:</Text>
                    <Text style={styles.credentialValue}>{new Date(universalCredential.expiresAt).toLocaleString()}</Text>
                  </View>
                </View>
                <Text style={styles.credentialNote}>
                  Share this credential with all students to access the voting dashboard.
                </Text>
              </View>
            )}

            <CardGrid>
              <StatCard label="Active Credential" value="1" subtitle="Universal access" accentColor={colors.primary} />
              <StatCard label="Valid For" value="2 Hours" subtitle="Per session" accentColor={colors.warning} />
              <StatCard label="Access Type" value="Universal" subtitle="All voters" accentColor={colors.success} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Registered Voters</Text>
            <Text style={styles.pageSubtitle}>Students who can use the universal credential to vote</Text>
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Class</Text>
                <TextInput
                  style={styles.filterInput}
                  value={voterFilter.class}
                  onChangeText={(text) => setVoterFilter({ ...voterFilter, class: text })}
                  placeholder="e.g., SHS3 Sci A"
                />
              </View>
            </View>
            <ScrollView style={styles.voterListScroll}>
              {mockStudents.filter(s => s.registered).map((student) => (
                <View key={student.id} style={styles.voterItem}>
                  <View style={styles.voterItemLeft}>
                    <Text style={styles.voterName}>{student.name}</Text>
                    <Text style={styles.voterClass}>{student.class} | {student.house}</Text>
                  </View>
                  <View style={styles.voterItemRight}>
                    <Text style={styles.universalBadge}>Uses Universal Credential</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );
      case 'voting':
        return (
          <View>
            <Text style={styles.pageTitle}>Voting & Live Results</Text>
            <Text style={styles.pageSubtitle}>Digital ballot — fully offline-capable, tallies locally per polling device</Text>
            <View style={styles.liveStatusCard}>
              <Text style={styles.liveStatus}>Voting Not Yet Open</Text>
              <Text style={styles.liveDate}>Opens: July 15, 2026 at 08:00</Text>
            </View>
            
            <CardGrid>
              <StatCard label="Total Votes Cast" value="0" subtitle="0% turnout" accentColor={colors.primary} />
              <StatCard label="Polling Stations" value="5" subtitle="All active" accentColor={colors.success} />
              <StatCard label="Time Remaining" value="--:--" subtitle="Not started" accentColor={colors.warning} />
            </CardGrid>
            
            <Text style={styles.sectionTitle}>Live Tally (Preview)</Text>
            <DataTable
              columns={[
                { key: 'position', label: 'Position', render: (i) => i.position },
                { key: 'candidate', label: 'Candidate', render: (i) => i.candidate },
                { key: 'votes', label: 'Votes', render: (i) => i.votes },
                { key: 'pct', label: '%', render: (i) => i.pct },
              ]}
              data={[
                { position: 'SRC President', candidate: 'Ama Serwaa', votes: '0', pct: '0%' },
                { position: 'SRC President', candidate: 'Kofi Bamfo', votes: '0', pct: '0%' },
                { position: "Boys' Prefect", candidate: 'Daniel Osei', votes: '0', pct: '0%' },
                { position: "Girls' Prefect", candidate: 'Grace Opoku', votes: '0', pct: '0%' },
                { position: 'Sports Prefect', candidate: 'Emmanuel Mensah', votes: '0', pct: '0%' },
              ]}
            />
            
            <Text style={styles.sectionTitle}>Voting Progress by Station</Text>
            {['Main Hall', 'Science Block', 'Arts Block', 'Library', 'Assembly Hall'].map((station, i) => (
              <View key={i} style={styles.stationCard}>
                <View style={styles.stationHeader}>
                  <Text style={styles.stationName}>{station}</Text>
                  <Text style={styles.stationStatus}>Not Started</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '0%' }]} />
                </View>
                <Text style={styles.progressText}>0 / 0 votes</Text>
              </View>
            ))}
          </View>
        );
      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Election Reports</Text>
            <Text style={styles.pageSubtitle}>Final results, turnout, and audit trail</Text>
            {['Final Results Report', 'Voter Turnout Analysis', 'Election Audit Trail', 'Campaign Violations', 'Eligibility Verification Report'].map((r) => (
              <TouchableOpacity key={r} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{r}</Text>
                <Text style={styles.reportAction}>Generate (PDF)</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'settings':
        return (
          <View>
            <Text style={styles.pageTitle}>Election Settings</Text>
            <Text style={styles.pageSubtitle}>Configure election rules and thresholds</Text>
            {[
              { label: 'Minimum GPA for candidacy', value: '2.5' },
              { label: 'Minimum attendance %', value: '80%' },
              { label: 'Voting threshold for winner', value: '50% + 1' },
              { label: 'Voting start time', value: '08:00' },
              { label: 'Voting end time', value: '16:00' },
            ].map((s, i) => (
              <View key={i} style={styles.settingCard}>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Text style={styles.settingValue}>{s.value}</Text>
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
      title="Electoral Commission"
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
      
      {/* Candidate Registration Modal */}
      <Modal
        visible={showCandidateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCandidateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register New Candidate</Text>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalLabel}>Candidate Photo</Text>
              <TouchableOpacity
                style={styles.photoUploadArea}
                onPress={handlePhotoUpload}
              >
                {candidateForm.photo ? (
                  <Image source={{ uri: candidateForm.photo }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderIcon}>📷</Text>
                    <Text style={styles.photoPlaceholderText}>Tap to upload photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <Text style={styles.modalLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter candidate's full name"
                value={candidateForm.name}
                onChangeText={(text) => setCandidateForm({ ...candidateForm, name: text })}
              />
              
              <Text style={styles.modalLabel}>Position *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. SRC President, Boys' Prefect"
                value={candidateForm.position}
                onChangeText={(text) => setCandidateForm({ ...candidateForm, position: text })}
              />
              
              <Text style={styles.modalLabel}>Class *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. SHS3 Sci A"
                value={candidateForm.class}
                onChangeText={(text) => setCandidateForm({ ...candidateForm, class: text })}
              />
              
              <Text style={styles.modalLabel}>House</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Unity, Peace, Justice"
                value={candidateForm.house}
                onChangeText={(text) => setCandidateForm({ ...candidateForm, house: text })}
              />
              
              <Text style={styles.modalLabel}>Manifesto</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Brief campaign manifesto..."
                value={candidateForm.manifesto}
                onChangeText={(text) => setCandidateForm({ ...candidateForm, manifesto: text })}
                multiline
                numberOfLines={4}
              />
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowCandidateModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={handleRegisterCandidate}
              >
                <Text style={styles.modalBtnText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Voter Modal */}
      <Modal
        visible={showVoterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVoterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>Add Voters to Roll</Text>
            
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Academic Year</Text>
                <TextInput
                  style={styles.filterInput}
                  value={voterFilter.academicYear}
                  onChangeText={(text) => setVoterFilter({ ...voterFilter, academicYear: text })}
                />
              </View>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Level</Text>
                <TextInput
                  style={styles.filterInput}
                  value={voterFilter.level}
                  onChangeText={(text) => setVoterFilter({ ...voterFilter, level: text })}
                />
              </View>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Class</Text>
                <TextInput
                  style={styles.filterInput}
                  value={voterFilter.class}
                  onChangeText={(text) => setVoterFilter({ ...voterFilter, class: text })}
                />
              </View>
            </View>

            <View style={styles.selectAllRow}>
              <TouchableOpacity
                style={styles.selectAllBtn}
                onPress={() => {
                  const unregisteredStudents = mockStudents.filter(s => !s.registered);
                  if (selectedStudents.size === unregisteredStudents.length) {
                    setSelectedStudents(new Set());
                  } else {
                    setSelectedStudents(new Set(unregisteredStudents.map(s => s.id)));
                  }
                }}
              >
                <Text style={styles.selectAllBtnText}>
                  {selectedStudents.size === mockStudents.filter(s => !s.registered).length ? 'Deselect All' : 'Select All Unregistered'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.selectedCount}>
                {selectedStudents.size} / {mockStudents.filter(s => !s.registered).length} unregistered selected
              </Text>
            </View>

            <ScrollView style={styles.voterListScroll}>
              {mockStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  style={[
                    styles.voterItem,
                    selectedStudents.has(student.id) && styles.voterItemSelected,
                    student.registered && styles.voterItemDisabled,
                  ]}
                  onPress={() => {
                    if (student.registered) return; // Don't allow selecting registered students
                    const newSelected = new Set(selectedStudents);
                    if (newSelected.has(student.id)) {
                      newSelected.delete(student.id);
                    } else {
                      newSelected.add(student.id);
                    }
                    setSelectedStudents(newSelected);
                  }}
                  disabled={student.registered}
                >
                  <View style={styles.voterItemLeft}>
                    <View style={[
                      styles.voterCheckbox,
                      selectedStudents.has(student.id) && styles.voterCheckboxChecked,
                      student.registered && styles.voterCheckboxDisabled,
                    ]}>
                      {selectedStudents.has(student.id) && <Text style={styles.voterCheckmark}>✓</Text>}
                    </View>
                    <View style={styles.voterInfo}>
                      <Text style={[styles.voterName, student.registered && styles.voterNameDisabled]}>{student.name}</Text>
                      <Text style={styles.voterClass}>{student.class}</Text>
                    </View>
                  </View>
                  <View style={styles.voterItemRight}>
                    <Text style={[
                      styles.voterStatus,
                      student.registered ? styles.voterStatusRegistered : styles.voterStatusUnregistered
                    ]}>
                      {student.registered ? 'Registered' : 'Not Registered'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => {
                  setShowVoterModal(false);
                  setSelectedStudents(new Set());
                }}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={() => {
                  Alert.alert('Success', `${selectedStudents.size} voter(s) added to roll`);
                  setShowVoterModal(false);
                  setSelectedStudents(new Set());
                }}
              >
                <Text style={styles.modalBtnText}>Add {selectedStudents.size} Voter(s)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Voter ID Generation Modal */}
      <Modal
        visible={showVoterIdModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVoterIdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>Generated Voter IDs</Text>
            <Text style={styles.modalSubtitle}>{generatedVoterIds.length} voter IDs generated</Text>
            
            <ScrollView style={styles.voterIdListScroll}>
              {generatedVoterIds.map((voter) => (
                <View key={voter.id} style={styles.voterIdCard}>
                  <View style={styles.voterIdHeader}>
                    <Text style={styles.voterIdNumber}>{voter.voterId}</Text>
                    <Text style={styles.voterIdName}>{voter.name}</Text>
                  </View>
                  <View style={styles.voterIdDetails}>
                    <Text style={styles.voterIdDetail}>{voter.class}</Text>
                    <Text style={styles.voterIdDetail}>{voter.house}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowVoterIdModal(false)}
              >
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDownload]}
                onPress={handleDownloadPDF}
              >
                <Text style={styles.modalBtnText}>Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={() => {
                  Alert.alert('Success', 'Voter IDs saved to database');
                  setShowVoterIdModal(false);
                }}
              >
                <Text style={styles.modalBtnText}>Save IDs</Text>
              </TouchableOpacity>
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
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  actionRow: { flexDirection: 'row', marginBottom: spacing.lg },
  // Timeline Styles
  timelineContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl, paddingHorizontal: spacing.sm },
  timelineItem: { alignItems: 'center', flex: 1, position: 'relative' },
  timelineDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.border },
  timelineDotCompleted: { backgroundColor: colors.success, borderColor: colors.success },
  timelineDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timelineIcon: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textSecondary },
  timelineContent: { marginTop: spacing.sm, alignItems: 'center' },
  timelinePhase: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, textAlign: 'center' },
  timelineDates: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center' },
  timelineLine: { position: 'absolute', top: 20, left: '50%', width: '100%', height: 2, backgroundColor: colors.borderLight, zIndex: -1 },
  // Calendar Card Styles
  calendarCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  calendarPhase: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  calendarDates: { fontSize: fontSize.sm, color: colors.textSecondary },
  calendarDescription: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: fontSize.sm * 1.5 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  liveStatusCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' },
  liveStatus: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textSecondary },
  liveDate: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  reportAction: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  // Settings Styles
  settingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  settingValue: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: colors.black + '80', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 500, maxHeight: '80%', padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  modalSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  modalScroll: { maxHeight: 400, marginBottom: spacing.lg },
  modalLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  modalInput: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.border },
  modalTextArea: { height: 100, textAlignVertical: 'top' },
  // Photo Upload Styles
  photoUploadArea: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  photoPreview: { width: '100%', height: '100%', borderRadius: radius.lg },
  photoPlaceholder: { alignItems: 'center' },
  photoPlaceholderIcon: { fontSize: 40, marginBottom: spacing.sm },
  photoPlaceholderText: { fontSize: fontSize.sm, color: colors.textSecondary },
  // Voter Modal Styles
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  filterItem: { flex: 1 },
  filterLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.xs },
  filterInput: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: fontSize.sm, borderWidth: 1, borderColor: colors.border },
  selectAllRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  selectAllBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.primary + '15', borderRadius: radius.sm },
  selectAllBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  selectedCount: { fontSize: fontSize.sm, color: colors.textSecondary },
  voterListScroll: { maxHeight: 300, marginBottom: spacing.lg },
  voterItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, marginBottom: spacing.xs },
  voterItemSelected: { backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary },
  voterItemDisabled: { opacity: 0.5 },
  voterItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  voterCheckbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  voterCheckboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  voterCheckboxDisabled: { opacity: 0.3 },
  voterCheckmark: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  voterInfo: { flex: 1 },
  voterName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  voterNameDisabled: { color: colors.textSecondary },
  voterClass: { fontSize: fontSize.xs, color: colors.textSecondary },
  voterItemRight: { marginLeft: spacing.sm },
  voterStatus: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  voterStatusRegistered: { backgroundColor: colors.successBg, color: colors.success },
  voterStatusUnregistered: { backgroundColor: colors.warningBg, color: colors.warning },
  // Voter ID Card Styles
  voterIdListScroll: { maxHeight: 300, marginBottom: spacing.lg },
  voterIdCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  voterIdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  voterIdNumber: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  voterIdName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  voterIdDetails: { flexDirection: 'row', gap: spacing.md },
  voterIdDetail: { fontSize: fontSize.sm, color: colors.textSecondary },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnDownload: { backgroundColor: colors.info },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  generateBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md },
  generateBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  credentialsCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  credentialItem: { marginBottom: spacing.md },
  credentialLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  credentialValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  universalCredentialCard: { backgroundColor: colors.primary + '10', borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 2, borderColor: colors.primary },
  credentialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  credentialTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  regenerateBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md },
  regenerateBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  credentialBody: { marginBottom: spacing.lg },
  credentialNote: { fontSize: fontSize.sm, color: colors.textSecondary, fontStyle: 'italic', textAlign: 'center' },
  universalBadge: { backgroundColor: colors.success + '20', color: colors.success, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  voterIdInputCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.lg },
  voterIdInputTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  voterIdInputSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  voterIdInput: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.lg },
  verifyVoterIdBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  verifyVoterIdBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  verifiedVoterCard: { backgroundColor: colors.success + '15', borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' },
  verifiedVoterIcon: { fontSize: 48, color: colors.success, marginBottom: spacing.sm },
  verifiedVoterTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.success, marginBottom: spacing.sm },
  verifiedVoterName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  verifiedVoterDetails: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xs },
  // Voting Station Styles
  stationCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  stationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  stationName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  stationStatus: { fontSize: fontSize.sm, color: colors.textSecondary },
  progressBar: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.xs },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressText: { fontSize: fontSize.xs, color: colors.textSecondary },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
