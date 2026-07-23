import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'events', label: 'Event Planner' },
  { key: 'grievances', label: 'Grievance Log' },
  { key: 'prefects', label: 'Prefect Roster' },
  { key: 'budget', label: 'Budget Tracker' },
  { key: 'initiatives', label: 'Initiatives' },
  { key: 'feedback', label: 'Student Feedback' },
];

interface Announcement { id: string; title: string; body: string; date: string; author: string; pinned: boolean; views: number; }
interface Grievance { id: string; date: string; from: string; subject: string; category: string; priority: 'low' | 'medium' | 'high'; status: 'Under Review' | 'Forwarded' | 'Resolved' | 'Rejected'; }
interface Initiative { id: string; name: string; lead: string; progress: number; status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'; startDate: string; endDate: string; }
interface Prefect { id: string; name: string; portfolio: string; className: string; level: 'Senior' | 'Junior'; }
interface EventItem { id: string; event: string; date: string; status: string; budget: string; }
interface Transaction { id: string; date: string; description: string; amount: string; type: 'Income' | 'Expense'; }
interface FeedbackEntry { id: string; category: string; rating: number; comment: string; date: string; from: string; }

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Inter-house Sports Day - July 12', body: 'All students are expected to participate. House masters will coordinate team selections. Sports kit required.', date: 'Jul 06', author: 'SRC President', pinned: true, views: 842 },
  { id: '2', title: 'SRC General Assembly - Friday 3pm', body: 'Mandatory assembly in the main hall. Agenda: budget report, prefect nominations, and sports day logistics.', date: 'Jul 04', author: 'SRC Secretary', pinned: false, views: 631 },
  { id: '3', title: 'New prefect nominations open', body: 'Nomination forms available at the SRC office. Deadline: July 15. SHS2 students eligible for junior prefect roles.', date: 'Jul 02', author: 'Electoral Commission', pinned: false, views: 514 },
  { id: '4', title: 'Library extended hours during exams', body: 'Library will remain open until 9pm from July 15-22. Silent study zones enforced.', date: 'Jun 28', author: 'SRC Vice President', pinned: false, views: 923 },
  { id: '5', title: 'Dining hall feedback survey', body: 'Please complete the survey on meal quality and variety. Results will be shared with Catering Unit.', date: 'Jun 25', author: 'SRC Secretary', pinned: false, views: 387 },
];

const INITIAL_GRIEVANCES: Grievance[] = [
  { id: '1', date: '2026-07-02', from: 'Anonymous', subject: 'Library closing too early', category: 'Facilities', priority: 'medium', status: 'Under Review' },
  { id: '2', date: '2026-06-28', from: 'SHS2 Sci A', subject: 'Request for more sports equipment', category: 'Sports', priority: 'low', status: 'Forwarded' },
  { id: '3', date: '2026-06-25', from: 'SHS1 Arts B', subject: 'Dining hall too crowded at lunch', category: 'Catering', priority: 'high', status: 'Resolved' },
  { id: '4', date: '2026-06-20', from: 'SHS3 Sci B', subject: 'Wi-Fi unreliable in study area', category: 'ICT', priority: 'medium', status: 'Forwarded' },
  { id: '5', date: '2026-06-18', from: 'Anonymous', subject: 'Bullying in Aggrey House dorm', category: 'Welfare', priority: 'high', status: 'Resolved' },
  { id: '6', date: '2026-06-15', from: 'SHS2 Home Ec', subject: 'Request for microwave in common room', category: 'Facilities', priority: 'low', status: 'Rejected' },
];

const INITIAL_INITIATIVES: Initiative[] = [
  { id: '1', name: 'Peer Tutoring Programme', lead: 'Kofi Bamfo', progress: 75, status: 'In Progress', startDate: 'Jun 01', endDate: 'Jul 30' },
  { id: '2', name: 'Campus Cleanliness Drive', lead: 'Efua Mensah', progress: 100, status: 'Completed', startDate: 'May 15', endDate: 'Jun 30' },
  { id: '3', name: 'Inter-House Sports Festival', lead: 'Daniel Osei', progress: 40, status: 'In Progress', startDate: 'Jul 01', endDate: 'Aug 15' },
  { id: '4', name: 'Mental Health Awareness Week', lead: 'Grace Opoku', progress: 15, status: 'Planning', startDate: 'Aug 01', endDate: 'Aug 07' },
  { id: '5', name: 'SRC Mobile App Feedback', lead: 'SRC IT Committee', progress: 0, status: 'On Hold', startDate: 'Jun 10', endDate: 'Sep 01' },
];

const INITIAL_PREFECTS: Prefect[] = [
  { id: '1', name: 'Ama Serwaa', portfolio: 'SRC President', className: 'SHS3 Sci A', level: 'Senior' },
  { id: '2', name: 'Kofi Bamfo', portfolio: 'Vice President', className: 'SHS3 Arts B', level: 'Senior' },
  { id: '3', name: 'Grace Opoku', portfolio: "Girls' Prefect", className: 'SHS3 Sci B', level: 'Senior' },
  { id: '4', name: 'Daniel Osei', portfolio: "Boys' Prefect", className: 'SHS3 Sci A', level: 'Senior' },
  { id: '5', name: 'Efua Mensah', portfolio: 'Dining Hall Prefect', className: 'SHS2 Home Ec', level: 'Junior' },
];

const INITIAL_EVENTS: EventItem[] = [
  { id: '1', event: 'Inter-house Sports', date: 'Jul 12', status: 'Planning', budget: 'GH₵ 2,000' },
  { id: '2', event: 'SRC Inauguration', date: 'Jul 20', status: 'Confirmed', budget: 'GH₵ 1,500' },
  { id: '3', event: 'Cultural Day', date: 'Aug 05', status: 'Tentative', budget: 'GH₵ 3,000' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-07-05', description: 'Sports day supplies', amount: '850', type: 'Expense' },
  { id: '2', date: '2026-07-01', description: 'SRC dues - July', amount: '1247', type: 'Income' },
  { id: '3', date: '2026-06-20', description: 'Cultural event prep', amount: '970', type: 'Expense' },
  { id: '4', date: '2026-06-15', description: 'SRC dues - June', amount: '1247', type: 'Income' },
  { id: '5', date: '2026-06-10', description: 'Assembly hall decorations', amount: '200', type: 'Expense' },
  { id: '6', date: '2026-06-05', description: 'SRC office supplies', amount: '180', type: 'Expense' },
];

const INITIAL_FEEDBACK: FeedbackEntry[] = [
  { id: '1', category: 'Academic Support', rating: 4, comment: 'Peer tutoring has been very helpful for Elective Math.', date: 'Jul 03', from: 'SHS2 Sci A' },
  { id: '2', category: 'Facilities', rating: 2, comment: 'The library is too small and closes too early during exams.', date: 'Jul 02', from: 'Anonymous' },
  { id: '3', category: 'Catering Quality', rating: 2, comment: 'Not enough variety in meals. Same menu every week.', date: 'Jun 28', from: 'SHS1 Arts B' },
  { id: '4', category: 'Sports & Recreation', rating: 4, comment: 'Great sports equipment but need more balls for football.', date: 'Jun 25', from: 'SHS3 Sci B' },
  { id: '5', category: 'SRC Communication', rating: 4, comment: 'Announcements are timely but could use more notice for events.', date: 'Jun 20', from: 'SHS2 Home Ec' },
];

const GRIEVANCE_CATEGORIES = ['Facilities', 'Catering', 'Sports', 'ICT', 'Welfare', 'Academic', 'Transport', 'Other'];
const FEEDBACK_CATEGORIES = ['Academic Support', 'Facilities', 'Catering Quality', 'Sports & Recreation', 'SRC Communication', 'Dormitory Life', 'Health Services'];
const PREFECT_PORTFOLIOS = ['SRC President', 'Vice President', 'Secretary', 'Asst. Secretary', "Girls' Prefect", "Boys' Prefect", 'Dining Hall Prefect', 'Organiser', 'Library Prefect', 'Sports Prefect'];

let idCounter = 100;
const nextId = () => String(++idCounter);

export function SRCDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { logout } = useAuthStore();

  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [grievances, setGrievances] = useState(INITIAL_GRIEVANCES);
  const [initiatives, setInitiatives] = useState(INITIAL_INITIATIVES);
  const [prefects, setPrefects] = useState(INITIAL_PREFECTS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [feedback, setFeedback] = useState(INITIAL_FEEDBACK);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });
  const [eventForm, setEventForm] = useState({ name: '', date: '', budget: '' });
  const [grievanceForm, setGrievanceForm] = useState({ from: '', subject: '', category: GRIEVANCE_CATEGORIES[0], priority: 'medium' as 'low' | 'medium' | 'high' });
  const [prefectForm, setPrefectForm] = useState({ name: '', portfolio: PREFECT_PORTFOLIOS[0], className: '', level: 'Senior' as 'Senior' | 'Junior' });
  const [transactionForm, setTransactionForm] = useState({ description: '', amount: '', type: 'Expense' as 'Income' | 'Expense' });
  const [initiativeForm, setInitiativeForm] = useState({ name: '', lead: '', startDate: '', endDate: '' });
  const [feedbackForm, setFeedbackForm] = useState({ category: FEEDBACK_CATEGORIES[0], rating: 3, comment: '', from: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const todayStr = () => new Date().toLocaleDateString('en-GB', { month: 'short', day: '2-digit' });
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const handlePostAnnouncement = () => {
    if (!announcementForm.title.trim()) { Alert.alert('Error', 'Please enter a title'); return; }
    setAnnouncements([{ id: nextId(), title: announcementForm.title.trim(), body: announcementForm.body.trim() || 'No description provided.', date: todayStr(), author: 'SRC Member', pinned: false, views: 0 }, ...announcements]);
    setAnnouncementForm({ title: '', body: '' }); closeModal();
    Alert.alert('Success', 'Announcement posted!');
  };

  const togglePin = (id: string) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const deleteAnnouncement = (id: string) => {
    Alert.alert('Delete', 'Delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAnnouncements(announcements.filter(a => a.id !== id)) },
    ]);
  };

  const handleCreateEvent = () => {
    if (!eventForm.name.trim() || !eventForm.date.trim()) { Alert.alert('Error', 'Please enter event name and date'); return; }
    setEvents([...events, { id: nextId(), event: eventForm.name.trim(), date: eventForm.date.trim(), status: 'Planning', budget: eventForm.budget.trim() ? `GH₵ ${eventForm.budget.trim()}` : 'TBD' }]);
    setEventForm({ name: '', date: '', budget: '' }); closeModal();
    Alert.alert('Success', 'Event created!');
  };

  const deleteEvent = (id: string) => {
    Alert.alert('Delete', 'Delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setEvents(events.filter(e => e.id !== id)) },
    ]);
  };

  const handleLogGrievance = () => {
    if (!grievanceForm.subject.trim()) { Alert.alert('Error', 'Please enter a subject'); return; }
    setGrievances([{ id: nextId(), date: todayISO(), from: grievanceForm.from.trim() || 'Anonymous', subject: grievanceForm.subject.trim(), category: grievanceForm.category, priority: grievanceForm.priority, status: 'Under Review' }, ...grievances]);
    setGrievanceForm({ from: '', subject: '', category: GRIEVANCE_CATEGORIES[0], priority: 'medium' }); closeModal();
    Alert.alert('Success', 'Grievance logged!');
  };

  const updateGrievanceStatus = (id: string, status: Grievance['status']) => {
    setGrievances(grievances.map(g => g.id === id ? { ...g, status } : g));
  };

  const deleteGrievance = (id: string) => {
    Alert.alert('Delete', 'Delete this grievance?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setGrievances(grievances.filter(g => g.id !== id)) },
    ]);
  };

  const handleAddPrefect = () => {
    if (!prefectForm.name.trim() || !prefectForm.className.trim()) { Alert.alert('Error', 'Please enter name and class'); return; }
    setPrefects([...prefects, { id: nextId(), name: prefectForm.name.trim(), portfolio: prefectForm.portfolio, className: prefectForm.className.trim(), level: prefectForm.level }]);
    setPrefectForm({ name: '', portfolio: PREFECT_PORTFOLIOS[0], className: '', level: 'Senior' }); closeModal();
    Alert.alert('Success', 'Prefect added to roster!');
  };

  const deletePrefect = (id: string) => {
    Alert.alert('Remove', 'Remove this prefect from the roster?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPrefects(prefects.filter(p => p.id !== id)) },
    ]);
  };

  const handleAddTransaction = () => {
    if (!transactionForm.description.trim() || !transactionForm.amount.trim()) { Alert.alert('Error', 'Please enter description and amount'); return; }
    const amt = parseFloat(transactionForm.amount.trim());
    if (isNaN(amt) || amt <= 0) { Alert.alert('Error', 'Please enter a valid amount'); return; }
    setTransactions([{ id: nextId(), date: todayISO(), description: transactionForm.description.trim(), amount: transactionForm.amount.trim(), type: transactionForm.type }, ...transactions]);
    setTransactionForm({ description: '', amount: '', type: 'Expense' }); closeModal();
    Alert.alert('Success', 'Transaction recorded!');
  };

  const deleteTransaction = (id: string) => {
    Alert.alert('Delete', 'Delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setTransactions(transactions.filter(t => t.id !== id)) },
    ]);
  };

  const handleCreateInitiative = () => {
    if (!initiativeForm.name.trim() || !initiativeForm.lead.trim()) { Alert.alert('Error', 'Please enter name and lead'); return; }
    setInitiatives([...initiatives, { id: nextId(), name: initiativeForm.name.trim(), lead: initiativeForm.lead.trim(), progress: 0, status: 'Planning', startDate: initiativeForm.startDate.trim() || todayStr(), endDate: initiativeForm.endDate.trim() || 'TBD' }]);
    setInitiativeForm({ name: '', lead: '', startDate: '', endDate: '' }); closeModal();
    Alert.alert('Success', 'Initiative created!');
  };

  const updateInitiativeProgress = (id: string, progress: number) => {
    setInitiatives(initiatives.map(i => i.id === id ? { ...i, progress, status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : i.status } : i));
  };

  const updateInitiativeStatus = (id: string, status: Initiative['status']) => {
    setInitiatives(initiatives.map(i => i.id === id ? { ...i, status } : i));
  };

  const deleteInitiative = (id: string) => {
    Alert.alert('Delete', 'Delete this initiative?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setInitiatives(initiatives.filter(i => i.id !== id)) },
    ]);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackForm.comment.trim()) { Alert.alert('Error', 'Please enter a comment'); return; }
    setFeedback([{ id: nextId(), category: feedbackForm.category, rating: feedbackForm.rating, comment: feedbackForm.comment.trim(), date: todayStr(), from: feedbackForm.from.trim() || 'Anonymous' }, ...feedback]);
    setFeedbackForm({ category: FEEDBACK_CATEGORIES[0], rating: 3, comment: '', from: '' }); closeModal();
    Alert.alert('Success', 'Feedback submitted!');
  };

  const computeBudget = () => {
    let income = 0, expense = 0;
    transactions.forEach(t => { const amt = parseFloat(t.amount); if (t.type === 'Income') income += amt; else expense += amt; });
    return { income, expense, balance: income - expense };
  };

  const budget = computeBudget();

  const computeFeedbackStats = () => {
    if (feedback.length === 0) return { avg: 0, positive: 0, attention: 0 };
    const avg = feedback.reduce((s, f) => s + f.rating, 0) / feedback.length;
    const positive = feedback.filter(f => f.rating >= 4).length;
    const attention = feedback.filter(f => f.rating <= 2).length;
    return { avg, positive: Math.round((positive / feedback.length) * 100), attention: Math.round((attention / feedback.length) * 100) };
  };

  const fbStats = computeFeedbackStats();

  const feedbackByCategory = FEEDBACK_CATEGORIES.map(cat => {
    const items = feedback.filter(f => f.category === cat);
    const avg = items.length > 0 ? items.reduce((s, f) => s + f.rating, 0) / items.length : 0;
    return { category: cat, rating: avg, responses: items.length };
  }).filter(c => c.responses > 0);

  const initiativeStatusColor = (status: string) =>
    status === 'Completed' ? colors.success : status === 'In Progress' ? colors.info : status === 'On Hold' ? colors.warning : colors.primary;

  const priorityColor = (priority: string) =>
    priority === 'high' ? colors.danger : priority === 'medium' ? colors.warning : colors.info;

  const grievanceStatusColor = (status: string) =>
    status === 'Resolved' ? colors.success : status === 'Forwarded' ? colors.info : status === 'Rejected' ? colors.danger : colors.warning;

  const renderModal = () => {
    if (!showModal) return null;

    const renderSelect = (label: string, value: string, options: string[], onSelect: (v: string) => void) => (
      <View>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.selectRow}>
          {options.map((opt) => (
            <TouchableOpacity key={opt} style={[styles.selectChip, value === opt && styles.selectChipActive]} onPress={() => onSelect(opt)}>
              <Text style={[styles.selectChipText, value === opt && styles.selectChipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );

    const renderStarRating = (value: number, onChange: (v: number) => void) => (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[styles.star, star <= value && styles.starActive]}>{star <= value ? '\u2605' : '\u2606'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    return (
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {modalType === 'announcement' && (
                <>
                  <Text style={styles.modalTitle}>Post Announcement</Text>
                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput style={styles.input} value={announcementForm.title} onChangeText={(v) => setAnnouncementForm({ ...announcementForm, title: v })} placeholder="Announcement title" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Body</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={announcementForm.body} onChangeText={(v) => setAnnouncementForm({ ...announcementForm, body: v })} placeholder="Announcement details..." placeholderTextColor={colors.textLight} multiline numberOfLines={4} />
                </>
              )}

              {modalType === 'event' && (
                <>
                  <Text style={styles.modalTitle}>Create Event</Text>
                  <Text style={styles.inputLabel}>Event Name</Text>
                  <TextInput style={styles.input} value={eventForm.name} onChangeText={(v) => setEventForm({ ...eventForm, name: v })} placeholder="e.g. SRC Quiz Night" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput style={styles.input} value={eventForm.date} onChangeText={(v) => setEventForm({ ...eventForm, date: v })} placeholder="e.g. Jul 25" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Budget (GH₵)</Text>
                  <TextInput style={styles.input} value={eventForm.budget} onChangeText={(v) => setEventForm({ ...eventForm, budget: v })} placeholder="e.g. 500" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                </>
              )}

              {modalType === 'grievance' && (
                <>
                  <Text style={styles.modalTitle}>Log Grievance</Text>
                  <Text style={styles.inputLabel}>From (optional)</Text>
                  <TextInput style={styles.input} value={grievanceForm.from} onChangeText={(v) => setGrievanceForm({ ...grievanceForm, from: v })} placeholder="Anonymous" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Subject</Text>
                  <TextInput style={styles.input} value={grievanceForm.subject} onChangeText={(v) => setGrievanceForm({ ...grievanceForm, subject: v })} placeholder="Brief description of the issue" placeholderTextColor={colors.textLight} />
                  {renderSelect('Category', grievanceForm.category, GRIEVANCE_CATEGORIES, (v) => setGrievanceForm({ ...grievanceForm, category: v }))}
                  {renderSelect('Priority', grievanceForm.priority, ['low', 'medium', 'high'], (v) => setGrievanceForm({ ...grievanceForm, priority: v as 'low' | 'medium' | 'high' }))}
                </>
              )}

              {modalType === 'prefect' && (
                <>
                  <Text style={styles.modalTitle}>Add Prefect</Text>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput style={styles.input} value={prefectForm.name} onChangeText={(v) => setPrefectForm({ ...prefectForm, name: v })} placeholder="e.g. John Mensah" placeholderTextColor={colors.textLight} />
                  {renderSelect('Portfolio', prefectForm.portfolio, PREFECT_PORTFOLIOS, (v) => setPrefectForm({ ...prefectForm, portfolio: v }))}
                  <Text style={styles.inputLabel}>Class</Text>
                  <TextInput style={styles.input} value={prefectForm.className} onChangeText={(v) => setPrefectForm({ ...prefectForm, className: v })} placeholder="e.g. SHS3 Sci A" placeholderTextColor={colors.textLight} />
                  {renderSelect('Level', prefectForm.level, ['Senior', 'Junior'], (v) => setPrefectForm({ ...prefectForm, level: v as 'Senior' | 'Junior' }))}
                </>
              )}

              {modalType === 'transaction' && (
                <>
                  <Text style={styles.modalTitle}>Add Transaction</Text>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput style={styles.input} value={transactionForm.description} onChangeText={(v) => setTransactionForm({ ...transactionForm, description: v })} placeholder="e.g. Sports day supplies" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Amount (GH₵)</Text>
                  <TextInput style={styles.input} value={transactionForm.amount} onChangeText={(v) => setTransactionForm({ ...transactionForm, amount: v })} placeholder="e.g. 500" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  {renderSelect('Type', transactionForm.type, ['Income', 'Expense'], (v) => setTransactionForm({ ...transactionForm, type: v as 'Income' | 'Expense' }))}
                </>
              )}

              {modalType === 'initiative' && (
                <>
                  <Text style={styles.modalTitle}>Create Initiative</Text>
                  <Text style={styles.inputLabel}>Initiative Name</Text>
                  <TextInput style={styles.input} value={initiativeForm.name} onChangeText={(v) => setInitiativeForm({ ...initiativeForm, name: v })} placeholder="e.g. Reading Club Launch" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Lead Person</Text>
                  <TextInput style={styles.input} value={initiativeForm.lead} onChangeText={(v) => setInitiativeForm({ ...initiativeForm, lead: v })} placeholder="e.g. Ama Serwaa" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TextInput style={styles.input} value={initiativeForm.startDate} onChangeText={(v) => setInitiativeForm({ ...initiativeForm, startDate: v })} placeholder="e.g. Aug 01" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TextInput style={styles.input} value={initiativeForm.endDate} onChangeText={(v) => setInitiativeForm({ ...initiativeForm, endDate: v })} placeholder="e.g. Aug 30" placeholderTextColor={colors.textLight} />
                </>
              )}

              {modalType === 'feedback' && (
                <>
                  <Text style={styles.modalTitle}>Submit Feedback</Text>
                  {renderSelect('Category', feedbackForm.category, FEEDBACK_CATEGORIES, (v) => setFeedbackForm({ ...feedbackForm, category: v }))}
                  <Text style={styles.inputLabel}>Rating</Text>
                  {renderStarRating(feedbackForm.rating, (v) => setFeedbackForm({ ...feedbackForm, rating: v }))}
                  <Text style={styles.inputLabel}>Comment</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={feedbackForm.comment} onChangeText={(v) => setFeedbackForm({ ...feedbackForm, comment: v })} placeholder="Share your thoughts..." placeholderTextColor={colors.textLight} multiline numberOfLines={4} />
                  <Text style={styles.inputLabel}>From (optional)</Text>
                  <TextInput style={styles.input} value={feedbackForm.from} onChangeText={(v) => setFeedbackForm({ ...feedbackForm, from: v })} placeholder="Anonymous" placeholderTextColor={colors.textLight} />
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
                  switch (modalType) {
                    case 'announcement': handlePostAnnouncement(); break;
                    case 'event': handleCreateEvent(); break;
                    case 'grievance': handleLogGrievance(); break;
                    case 'prefect': handleAddPrefect(); break;
                    case 'transaction': handleAddTransaction(); break;
                    case 'initiative': handleCreateInitiative(); break;
                    case 'feedback': handleSubmitFeedback(); break;
                  }
                }}>
                  <Text style={styles.modalBtnTextLight}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Announcements" value={announcements.length} subtitle="All time" accentColor={colors.primary} />
              <StatCard label="Open Grievances" value={grievances.filter(g => g.status === 'Under Review' || g.status === 'Forwarded').length} subtitle="Awaiting action" accentColor={colors.warning} />
              <StatCard label="Active Initiatives" value={initiatives.filter(i => i.status === 'In Progress').length} subtitle="In progress" accentColor={colors.info} />
              <StatCard label="Budget Balance" value={`GH₵ ${budget.balance.toLocaleString()}`} subtitle="Available" accentColor={colors.success} />
              <StatCard label="Upcoming Events" value={events.length} subtitle="Scheduled" accentColor={colors.purple} />
              <StatCard label="Prefects" value={prefects.length} subtitle="Active roster" accentColor={colors.accent} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            {announcements.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <Text style={styles.announcementTitle}>{item.title}</Text>
                  {item.pinned && <View style={styles.pinnedBadge}><Text style={styles.pinnedText}>PINNED</Text></View>}
                </View>
                <Text style={styles.announcementBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.announcementMeta}>{item.date} | By {item.author} | {item.views} views</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Active Initiatives</Text>
            {initiatives.filter(i => i.status === 'In Progress').map((item) => (
              <View key={item.id} style={styles.initiativeCard}>
                <View style={styles.initiativeHeader}>
                  <Text style={styles.initiativeName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: initiativeStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: initiativeStatusColor(item.status) }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.initiativeMeta}>Lead: {item.lead} | {item.startDate} → {item.endDate}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: colors.primary }]} />
                </View>
                <Text style={styles.progressLabel}>{item.progress}% complete</Text>
              </View>
            ))}
          </View>
        );

      case 'announcements':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Posts" value={announcements.length} accentColor={colors.primary} />
              <StatCard label="Pinned" value={announcements.filter(a => a.pinned).length} accentColor={colors.warning} />
              <StatCard label="Total Views" value={announcements.reduce((sum, a) => sum + a.views, 0).toLocaleString()} accentColor={colors.info} />
              <StatCard label="This Month" value={announcements.filter(a => a.date.includes('Jul')).length} accentColor={colors.success} />
            </CardGrid>

            <Text style={styles.pageTitle}>Student Announcements</Text>
            <Text style={styles.pageSubtitle}>SRC-to-student-body communication</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('announcement')}>
              <Text style={styles.actionBtnText}>+ Post Announcement</Text>
            </TouchableOpacity>
            {announcements.map((item) => (
              <View key={item.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <Text style={styles.announcementTitle}>{item.title}</Text>
                  {item.pinned && <View style={styles.pinnedBadge}><Text style={styles.pinnedText}>PINNED</Text></View>}
                </View>
                <Text style={styles.announcementBody}>{item.body}</Text>
                <View style={styles.announcementFooter}>
                  <Text style={styles.announcementMeta}>{item.date} | By {item.author} | {item.views} views</Text>
                  <View style={styles.announcementActions}>
                    <TouchableOpacity onPress={() => togglePin(item.id)} style={styles.iconBtn}>
                      <Text style={styles.iconBtnText}>{item.pinned ? 'Unpin' : 'Pin'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteAnnouncement(item.id)} style={styles.iconBtnDanger}>
                      <Text style={styles.iconBtnDangerText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      case 'events':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Events" value={events.length} accentColor={colors.primary} />
              <StatCard label="Confirmed" value={events.filter(e => e.status === 'Confirmed').length} accentColor={colors.success} />
              <StatCard label="In Planning" value={events.filter(e => e.status === 'Planning').length} accentColor={colors.warning} />
              <StatCard label="Total Budget" value={`GH₵ ${events.reduce((s, e) => s + parseInt(e.budget.replace(/[^0-9]/g, '') || '0'), 0).toLocaleString()}`} accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.pageTitle}>Event Planner</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('event')}>
              <Text style={styles.actionBtnText}>+ Create Event</Text>
            </TouchableOpacity>
            {events.map((item) => (
              <View key={item.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventName}>{item.event}</Text>
                    <Text style={styles.eventMeta}>{item.date} | Budget: {item.budget}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: (item.status === 'Confirmed' ? colors.success : item.status === 'Planning' ? colors.warning : colors.info) + '20' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Confirmed' ? colors.success : item.status === 'Planning' ? colors.warning : colors.info }]}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => {
                    const statuses = ['Planning', 'Confirmed', 'Tentative'];
                    const idx = statuses.indexOf(item.status);
                    const next = statuses[(idx + 1) % statuses.length];
                    setEvents(events.map(e => e.id === item.id ? { ...e, status: next } : e));
                  }}>
                    <Text style={styles.smallBtnText}>Cycle Status</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteEvent(item.id)}>
                    <Text style={styles.smallBtnDangerText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'grievances':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={grievances.length} accentColor={colors.primary} />
              <StatCard label="Under Review" value={grievances.filter(g => g.status === 'Under Review').length} accentColor={colors.warning} />
              <StatCard label="Resolved" value={grievances.filter(g => g.status === 'Resolved').length} accentColor={colors.success} />
              <StatCard label="High Priority" value={grievances.filter(g => g.priority === 'high').length} accentColor={colors.danger} />
            </CardGrid>

            <Text style={styles.pageTitle}>Grievance Log</Text>
            <Text style={styles.pageSubtitle}>Student complaints/suggestions for SRC attention</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('grievance')}>
              <Text style={styles.actionBtnText}>+ Log Grievance</Text>
            </TouchableOpacity>
            {grievances.map((item) => (
              <View key={item.id} style={styles.grievanceCard}>
                <View style={styles.grievanceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.grievanceSubject}>{item.subject}</Text>
                    <Text style={styles.grievanceMeta}>{item.date} | From: {item.from} | {item.category}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: priorityColor(item.priority) + '20' }]}>
                    <Text style={[styles.statusText, { color: priorityColor(item.priority) }]}>{item.priority.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.grievanceActions}>
                  {(['Under Review', 'Forwarded', 'Resolved', 'Rejected'] as const).map((st) => (
                    <TouchableOpacity key={st} style={[styles.statusToggle, item.status === st && { backgroundColor: grievanceStatusColor(st) + '20', borderColor: grievanceStatusColor(st) }]} onPress={() => updateGrievanceStatus(item.id, st)}>
                      <Text style={[styles.statusToggleText, item.status === st && { color: grievanceStatusColor(st), fontWeight: fontWeight.bold }]}>{st}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteGrievance(item.id)}>
                    <Text style={styles.smallBtnDangerText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'prefects':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Prefects" value={prefects.length} accentColor={colors.primary} />
              <StatCard label="Senior (SHS3)" value={prefects.filter(p => p.level === 'Senior').length} accentColor={colors.info} />
              <StatCard label="Junior (SHS2)" value={prefects.filter(p => p.level === 'Junior').length} accentColor={colors.warning} />
              <StatCard label="Vacant Roles" value={PREFECT_PORTFOLIOS.filter(p => !prefects.some(pf => pf.portfolio === p)).length} subtitle="Unassigned portfolios" accentColor={colors.danger} />
            </CardGrid>

            <Text style={styles.pageTitle}>Prefect Roster</Text>
            <Text style={styles.pageSubtitle}>Current SRC leadership and prefect body</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('prefect')}>
              <Text style={styles.actionBtnText}>+ Add Prefect</Text>
            </TouchableOpacity>

            {PREFECT_PORTFOLIOS.map((portfolio) => {
              const prefect = prefects.find(p => p.portfolio === portfolio);
              return (
                <View key={portfolio} style={[styles.prefectCard, !prefect && styles.prefectCardVacant]}>
                  <View style={styles.prefectAvatar}>
                    <Text style={styles.prefectAvatarText}>
                      {prefect ? prefect.name.split(' ').map(n => n[0]).join('') : '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prefectPortfolio}>{portfolio}</Text>
                    {prefect ? (
                      <Text style={styles.prefectName}>{prefect.name} | {prefect.className} | {prefect.level}</Text>
                    ) : (
                      <Text style={styles.prefectVacant}>Vacant - No prefect assigned</Text>
                    )}
                  </View>
                  {prefect && (
                    <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deletePrefect(prefect.id)}>
                      <Text style={styles.smallBtnDangerText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        );

      case 'budget':
        return (
          <View>
            <CardGrid>
              <StatCard label="Income" value={`GH₵ ${budget.income.toLocaleString()}`} accentColor={colors.success} />
              <StatCard label="Expenses" value={`GH₵ ${budget.expense.toLocaleString()}`} accentColor={colors.danger} />
              <StatCard label="Balance" value={`GH₵ ${budget.balance.toLocaleString()}`} accentColor={colors.primary} />
              <StatCard label="Transactions" value={transactions.length} subtitle="Total records" accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.pageTitle}>Budget Tracker</Text>
            <Text style={styles.pageSubtitle}>SRC-managed funds</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('transaction')}>
              <Text style={styles.actionBtnText}>+ Add Transaction</Text>
            </TouchableOpacity>
            {transactions.map((item) => (
              <View key={item.id} style={styles.transactionCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transactionDesc}>{item.description}</Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
                <Text style={[styles.transactionAmount, item.type === 'Income' ? { color: colors.success } : { color: colors.danger }]}>
                  {item.type === 'Income' ? '+' : '-'}GH₵ {parseFloat(item.amount).toLocaleString()}
                </Text>
                <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteTransaction(item.id)}>
                  <Text style={styles.smallBtnDangerText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'initiatives':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={initiatives.length} accentColor={colors.primary} />
              <StatCard label="In Progress" value={initiatives.filter(i => i.status === 'In Progress').length} accentColor={colors.info} />
              <StatCard label="Completed" value={initiatives.filter(i => i.status === 'Completed').length} accentColor={colors.success} />
              <StatCard label="On Hold" value={initiatives.filter(i => i.status === 'On Hold').length} accentColor={colors.warning} />
            </CardGrid>

            <Text style={styles.pageTitle}>SRC Initiatives</Text>
            <Text style={styles.pageSubtitle}>Projects and programmes led by the SRC</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('initiative')}>
              <Text style={styles.actionBtnText}>+ Create Initiative</Text>
            </TouchableOpacity>
            {initiatives.map((item) => (
              <View key={item.id} style={styles.initiativeCard}>
                <View style={styles.initiativeHeader}>
                  <Text style={styles.initiativeName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: initiativeStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: initiativeStatusColor(item.status) }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.initiativeMeta}>Lead: {item.lead} | {item.startDate} → {item.endDate}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.progress === 100 ? colors.success : colors.primary }]} />
                </View>
                <Text style={styles.progressLabel}>{item.progress}% complete</Text>

                <View style={styles.initiativeControls}>
                  <View style={styles.progressControls}>
                    <TouchableOpacity style={styles.progressBtn} onPress={() => updateInitiativeProgress(item.id, Math.max(0, item.progress - 10))}>
                      <Text style={styles.progressBtnText}>-10%</Text>
                    </TouchableOpacity>
                    <Text style={styles.progressValue}>{item.progress}%</Text>
                    <TouchableOpacity style={styles.progressBtn} onPress={() => updateInitiativeProgress(item.id, Math.min(100, item.progress + 10))}>
                      <Text style={styles.progressBtnText}>+10%</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.initiativeStatusRow}>
                    {(['Planning', 'In Progress', 'Completed', 'On Hold'] as const).map((st) => (
                      <TouchableOpacity key={st} style={[styles.statusToggle, item.status === st && { backgroundColor: initiativeStatusColor(st) + '20', borderColor: initiativeStatusColor(st) }]} onPress={() => updateInitiativeStatus(item.id, st)}>
                        <Text style={[styles.statusToggleText, item.status === st && { color: initiativeStatusColor(st), fontWeight: fontWeight.bold }]}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteInitiative(item.id)}>
                    <Text style={styles.smallBtnDangerText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'feedback':
        return (
          <View>
            <CardGrid>
              <StatCard label="Responses" value={feedback.length} subtitle="This term" accentColor={colors.primary} />
              <StatCard label="Avg Rating" value={fbStats.avg.toFixed(1)} subtitle="Out of 5" accentColor={colors.warning} />
              <StatCard label="Positive" value={`${fbStats.positive}%`} subtitle="4-5 stars" accentColor={colors.success} />
              <StatCard label="Needs Attention" value={`${fbStats.attention}%`} subtitle="1-2 stars" accentColor={colors.danger} />
            </CardGrid>

            <Text style={styles.pageTitle}>Student Feedback</Text>
            <Text style={styles.pageSubtitle}>Survey results and sentiment from the student body</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('feedback')}>
              <Text style={styles.actionBtnText}>+ Submit Feedback</Text>
            </TouchableOpacity>

            {feedbackByCategory.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Category Averages</Text>
                {feedbackByCategory.map((item, i) => (
                  <View key={i} style={styles.feedbackCard}>
                    <View style={styles.feedbackHeader}>
                      <Text style={styles.feedbackCategory}>{item.category}</Text>
                      <Text style={styles.feedbackRating}>{item.rating.toFixed(1)} / 5</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${(item.rating / 5) * 100}%`, backgroundColor: item.rating >= 3.5 ? colors.success : item.rating >= 2.5 ? colors.warning : colors.danger }]} />
                    </View>
                    <Text style={styles.feedbackMeta}>{item.responses} response{item.responses !== 1 ? 's' : ''}</Text>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Individual Feedback</Text>
            {feedback.map((item) => (
              <View key={item.id} style={styles.feedbackEntryCard}>
                <View style={styles.feedbackEntryHeader}>
                  <View style={styles.feedbackEntryStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Text key={s} style={[styles.starSmall, s <= item.rating && styles.starActive]}>{s <= item.rating ? '\u2605' : '\u2606'}</Text>
                    ))}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: (item.rating >= 4 ? colors.success : item.rating >= 3 ? colors.warning : colors.danger) + '20' }]}>
                    <Text style={[styles.statusText, { color: item.rating >= 4 ? colors.success : item.rating >= 3 ? colors.warning : colors.danger }]}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.feedbackComment}>"{item.comment}"</Text>
                <Text style={styles.feedbackEntryMeta}>{item.date} | By {item.from}</Text>
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
      title="SRC"
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
      {renderModal()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  announcementCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  announcementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  announcementTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1, marginRight: spacing.sm },
  announcementBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs, lineHeight: 20 },
  announcementFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  announcementMeta: { fontSize: fontSize.xs, color: colors.textLight, flex: 1 },
  announcementActions: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  iconBtnText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary },
  iconBtnDanger: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.dangerBg, borderRadius: radius.sm },
  iconBtnDangerText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.danger },
  pinnedBadge: { backgroundColor: colors.warning + '20', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  pinnedText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.warning },
  eventCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  eventName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  eventMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  grievanceCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  grievanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  grievanceSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  grievanceMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  grievanceActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  statusToggle: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  statusToggleText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary },
  prefectCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  prefectCardVacant: { backgroundColor: colors.surfaceAlt, borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.border },
  prefectAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  prefectAvatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.white },
  prefectPortfolio: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  prefectName: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  prefectVacant: { fontSize: fontSize.sm, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  transactionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  transactionDesc: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  transactionDate: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  transactionAmount: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginRight: spacing.md },
  initiativeCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  initiativeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  initiativeName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 },
  initiativeMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  initiativeControls: { marginTop: spacing.sm, gap: spacing.sm },
  progressControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progressBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  progressBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  progressValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  initiativeStatusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  progressBarBg: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, marginBottom: spacing.xs },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressLabel: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  smallBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  smallBtnText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary },
  smallBtnDanger: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.dangerBg, borderRadius: radius.sm },
  smallBtnDangerText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.danger },
  feedbackCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  feedbackCategory: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  feedbackRating: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  feedbackMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  feedbackEntryCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  feedbackEntryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  feedbackEntryStars: { flexDirection: 'row' },
  starSmall: { fontSize: fontSize.md, color: colors.textLight, marginRight: 2 },
  star: { fontSize: fontSize.xxl, color: colors.textLight, marginRight: spacing.xs },
  starActive: { color: colors.accent },
  starRow: { flexDirection: 'row', marginBottom: spacing.sm },
  feedbackComment: { fontSize: fontSize.md, color: colors.text, fontStyle: 'italic', marginBottom: spacing.xs, lineHeight: 22 },
  feedbackEntryMeta: { fontSize: fontSize.xs, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalScroll: { width: '100%', maxHeight: '90%' },
  modalScrollContent: { alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 480, padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  selectChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  selectChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  selectChipTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
