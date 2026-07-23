import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import {
  useChaplainStore,
  SERVICE_TYPES, COUNSELLING_TYPES,
  FELLOWSHIP_DAYS, OUTREACH_TYPES, BAPTISM_TYPES, VOICE_PARTS, CHOIR_ROLES,
} from '@store/chaplainStore';
import type {
  ServiceType, PrayerStatus, CounsellingType,
  FellowshipDay, OutreachType, BaptismType,
} from '@store/chaplainStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'services', label: 'Service Schedule' },
  { key: 'prayerRequests', label: 'Prayer Requests' },
  { key: 'counselling', label: 'Spiritual Counselling' },
  { key: 'events', label: 'Religious Events' },
  { key: 'fellowships', label: 'Fellowship Groups' },
  { key: 'outreach', label: 'Outreach & Charity' },
  { key: 'choir', label: 'Choir & Music' },
  { key: 'baptism', label: 'Baptism & Dedication' },
  { key: 'reports', label: 'Reports' },
];

export function ChaplainDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  useAuthStore();

  const store = useChaplainStore();

  // ── Form state ──
  const [serviceForm, setServiceForm] = useState({
    type: 'Sunday' as ServiceType, day: 'Sunday', time: '08:00', venue: '', speaker: '', topic: '', attendance: 0, notes: '',
  });
  const [prayerForm, setPrayerForm] = useState({
    studentName: '', studentClass: '', request: '', status: 'Open' as PrayerStatus, visibility: 'Public' as 'Public' | 'Confidential', notes: '',
  });
  const [counsellingForm, setCounsellingForm] = useState({
    studentName: '', studentClass: '', type: 'Spiritual' as CounsellingType, summary: '', followUpDate: '', notes: '',
  });
  const [eventForm, setEventForm] = useState({
    title: '', type: 'Special' as ServiceType, date: '', venue: '', expectedAttendance: 0, coordinator: '', notes: '',
  });
  const [fellowshipForm, setFellowshipForm] = useState({
    name: '', leader: '', day: 'Friday' as FellowshipDay, time: '18:00', venue: '', members: 0, description: '',
  });
  const [outreachForm, setOutreachForm] = useState({
    title: '', type: 'Charity' as OutreachType, date: '', location: '', beneficiaries: 0, coordinator: '', budget: 0, notes: '',
  });
  const [choirForm, setChoirForm] = useState({
    name: '', voicePart: 'Soprano' as typeof VOICE_PARTS[number], role: 'Member' as typeof CHOIR_ROLES[number], class: '', attendance: 0,
  });
  const [baptismForm, setBaptismForm] = useState({
    name: '', type: 'Baptism' as BaptismType, date: '', officiant: '', class: '', parentGuardian: '', notes: '',
  });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  // ── Helpers ──
  const statusColor = (s: string) =>
    s === 'Open' || s === 'Planned' ? colors.warning :
    s === 'Answered' || s === 'Completed' || s === 'Resolved' ? colors.success :
    s === 'In Progress' || s === 'Confirmed' ? colors.primary :
    s === 'Cancelled' || s === 'Referred' ? colors.danger :
    colors.textSecondary;

  const renderSelect = (label: string, value: string, options: readonly string[], onSelect: (v: string) => void) => (
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

  const renderInput = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean) => (
    <View>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.textArea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
      />
    </View>
  );

  // ── Handlers ──
  const handleSaveService = () => {
    if (!serviceForm.venue.trim() || !serviceForm.topic.trim()) { Alert.alert('Error', 'Venue and topic are required'); return; }
    store.addService({ ...serviceForm, venue: serviceForm.venue.trim(), topic: serviceForm.topic.trim(), speaker: serviceForm.speaker.trim(), day: serviceForm.day, notes: serviceForm.notes.trim() });
    setServiceForm({ type: 'Sunday', day: 'Sunday', time: '08:00', venue: '', speaker: '', topic: '', attendance: 0, notes: '' });
    closeModal();
  };

  const handleSavePrayer = () => {
    if (!prayerForm.studentName.trim() || !prayerForm.request.trim()) { Alert.alert('Error', 'Student name and request are required'); return; }
    store.addPrayerRequest({ ...prayerForm, studentName: prayerForm.studentName.trim(), request: prayerForm.request.trim(), dateSubmitted: new Date().toISOString().slice(0, 10), dateAnswered: null, notes: prayerForm.notes.trim() });
    setPrayerForm({ studentName: '', studentClass: '', request: '', status: 'Open', visibility: 'Public', notes: '' });
    closeModal();
  };

  const handleSaveCounselling = () => {
    if (!counsellingForm.studentName.trim() || !counsellingForm.summary.trim()) { Alert.alert('Error', 'Student name and summary are required'); return; }
    store.addCounselling({ ...counsellingForm, studentName: counsellingForm.studentName.trim(), summary: counsellingForm.summary.trim(), date: new Date().toISOString().slice(0, 10), status: 'Open', notes: counsellingForm.notes.trim() });
    setCounsellingForm({ studentName: '', studentClass: '', type: 'Spiritual', summary: '', followUpDate: '', notes: '' });
    closeModal();
  };

  const handleSaveEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date.trim()) { Alert.alert('Error', 'Title and date are required'); return; }
    store.addEvent({ ...eventForm, title: eventForm.title.trim(), actualAttendance: null, status: 'Planned', notes: eventForm.notes.trim() });
    setEventForm({ title: '', type: 'Special', date: '', venue: '', expectedAttendance: 0, coordinator: '', notes: '' });
    closeModal();
  };

  const handleSaveFellowship = () => {
    if (!fellowshipForm.name.trim() || !fellowshipForm.leader.trim()) { Alert.alert('Error', 'Name and leader are required'); return; }
    store.addFellowship({ ...fellowshipForm, name: fellowshipForm.name.trim(), leader: fellowshipForm.leader.trim(), description: fellowshipForm.description.trim() });
    setFellowshipForm({ name: '', leader: '', day: 'Friday', time: '18:00', venue: '', members: 0, description: '' });
    closeModal();
  };

  const handleSaveOutreach = () => {
    if (!outreachForm.title.trim() || !outreachForm.date.trim()) { Alert.alert('Error', 'Title and date are required'); return; }
    store.addOutreach({ ...outreachForm, title: outreachForm.title.trim(), status: 'Planned', notes: outreachForm.notes.trim() });
    setOutreachForm({ title: '', type: 'Charity', date: '', location: '', beneficiaries: 0, coordinator: '', budget: 0, notes: '' });
    closeModal();
  };

  const handleSaveChoir = () => {
    if (!choirForm.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    store.addChoirMember({ ...choirForm, name: choirForm.name.trim() });
    setChoirForm({ name: '', voicePart: 'Soprano', role: 'Member', class: '', attendance: 0 });
    closeModal();
  };

  const handleSaveBaptism = () => {
    if (!baptismForm.name.trim() || !baptismForm.date.trim()) { Alert.alert('Error', 'Name and date are required'); return; }
    store.addBaptism({ ...baptismForm, name: baptismForm.name.trim(), certificateIssued: false, notes: baptismForm.notes.trim() });
    setBaptismForm({ name: '', type: 'Baptism', date: '', officiant: '', class: '', parentGuardian: '', notes: '' });
    closeModal();
  };

  const handleDelete = (type: string, id: string, name: string) =>
    Alert.alert('Delete', `Delete this ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        if (type === 'service') store.deleteService(id);
        else if (type === 'prayer') store.deletePrayerRequest(id);
        else if (type === 'counselling') store.deleteCounselling(id);
        else if (type === 'event') store.deleteEvent(id);
        else if (type === 'fellowship') store.deleteFellowship(id);
        else if (type === 'outreach') store.deleteOutreach(id);
        else if (type === 'choir') store.deleteChoirMember(id);
        else if (type === 'baptism') store.deleteBaptism(id);
      }},
    ]);

  // ── Render ──
  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Weekly Services" value={store.services.length} subtitle="Scheduled" accentColor={colors.primary} />
              <StatCard label="Open Prayer Requests" value={store.prayerRequests.filter(p => p.status === 'Open').length} subtitle="Needs prayer" accentColor={colors.warning} />
              <StatCard label="Active Counselling" value={store.counselling.filter(c => c.status === 'Open').length} subtitle="In progress" accentColor={colors.info} />
              <StatCard label="Upcoming Events" value={store.events.filter(e => e.status === 'Planned' || e.status === 'Confirmed').length} accentColor={colors.accent} />
              <StatCard label="Fellowship Groups" value={store.fellowships.length} subtitle="Active groups" accentColor={colors.purple} />
              <StatCard label="Choir Members" value={store.choir.length} accentColor={colors.success} />
              <StatCard label="Outreach Programs" value={store.outreach.length} subtitle="Community" accentColor={colors.info} />
              <StatCard label="Baptism Records" value={store.baptisms.length} accentColor={colors.accent} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Today's Services</Text>
            {store.services.filter(s => s.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).length > 0 ? (
              store.services.filter(s => s.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).map((s) => (
                <View key={s.id} style={[styles.card, { borderLeftColor: colors.primary }]}>
                  <Text style={styles.cardTitle}>{s.type} — {s.topic}</Text>
                  <Text style={styles.cardMeta}>{s.time} | {s.venue} | Speaker: {s.speaker}</Text>
                  <Text style={styles.cardMeta}>Attendance: {s.attendance}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No services scheduled for today.</Text>
            )}

            <Text style={styles.sectionTitle}>Open Prayer Requests</Text>
            {store.prayerRequests.filter(p => p.status === 'Open').length > 0 ? (
              store.prayerRequests.filter(p => p.status === 'Open').slice(0, 5).map((p) => (
                <View key={p.id} style={[styles.card, { borderLeftColor: colors.warning }]}>
                  <Text style={styles.cardTitle}>{p.studentName} ({p.studentClass})</Text>
                  <Text style={styles.cardMeta}>{p.request}</Text>
                  <Text style={styles.cardMeta}>Submitted: {p.dateSubmitted}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No open prayer requests.</Text>
            )}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => openModal('prayer')}>
                <Text style={styles.quickBtnText}>+ Prayer Request</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => openModal('counselling')}>
                <Text style={styles.quickBtnText}>+ Counselling</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.accent }]} onPress={() => openModal('event')}>
                <Text style={styles.quickBtnText}>+ Event</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => openModal('service')}>
                <Text style={styles.quickBtnText}>+ Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'services':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Services" value={store.services.length} accentColor={colors.primary} />
              <StatCard label="Sunday" value={store.services.filter(s => s.type === 'Sunday').length} accentColor={colors.accent} />
              <StatCard label="Midweek" value={store.services.filter(s => s.type === 'Midweek' || s.type === 'Devotion').length} accentColor={colors.info} />
              <StatCard label="Jumu'ah" value={store.services.filter(s => s.type === 'Friday Jumu\'ah').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Service Schedule</Text>
            <Text style={styles.pageSubtitle}>Manage all religious services and worship gatherings</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('service')}>
              <Text style={styles.actionBtnText}>+ Add Service</Text>
            </TouchableOpacity>
            <ScrollView>
              {store.services.map((s) => (
                <View key={s.id} style={[styles.card, { borderLeftColor: colors.primary }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{s.type} — {s.topic}</Text>
                      <Text style={styles.cardMeta}>{s.day} at {s.time} | {s.venue}</Text>
                      <Text style={styles.cardMeta}>Speaker: {s.speaker} | Attendance: {s.attendance}</Text>
                      {s.notes ? <Text style={styles.cardNotes}>{s.notes}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete('service', s.id, 'service')}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'prayerRequests':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={store.prayerRequests.length} accentColor={colors.primary} />
              <StatCard label="Open" value={store.prayerRequests.filter(p => p.status === 'Open').length} accentColor={colors.warning} />
              <StatCard label="In Progress" value={store.prayerRequests.filter(p => p.status === 'In Progress').length} accentColor={colors.info} />
              <StatCard label="Answered" value={store.prayerRequests.filter(p => p.status === 'Answered').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Prayer Requests</Text>
            <Text style={styles.pageSubtitle}>Track and pray for student requests</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('prayer')}>
              <Text style={styles.actionBtnText}>+ New Prayer Request</Text>
            </TouchableOpacity>
            <ScrollView>
              {store.prayerRequests.map((p) => (
                <View key={p.id} style={[styles.card, { borderLeftColor: statusColor(p.status) }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{p.studentName}</Text>
                        <View style={[styles.badge, { backgroundColor: statusColor(p.status) + '20' }]}>
                          <Text style={[styles.badgeText, { color: statusColor(p.status) }]}>{p.status}</Text>
                        </View>
                        {p.visibility === 'Confidential' && (
                          <View style={[styles.badge, { backgroundColor: colors.danger + '20' }]}>
                            <Text style={[styles.badgeText, { color: colors.danger }]}>🔒</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardMeta}>{p.studentClass} | Submitted: {p.dateSubmitted}</Text>
                      <Text style={styles.cardBody}>{p.request}</Text>
                      {p.dateAnswered && <Text style={styles.cardMeta}>Answered: {p.dateAnswered}</Text>}
                      {p.notes ? <Text style={styles.cardNotes}>{p.notes}</Text> : null}
                      {p.status !== 'Answered' && (
                        <View style={styles.actionRow}>
                          {p.status === 'Open' && (
                            <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.info }]} onPress={() => store.updatePrayerStatus(p.id, 'In Progress')}>
                              <Text style={styles.smallBtnText}>Mark In Progress</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => store.updatePrayerStatus(p.id, 'Answered')}>
                            <Text style={styles.smallBtnText}>Mark Answered</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete('prayer', p.id, 'prayer request')}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'counselling':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Sessions" value={store.counselling.length} accentColor={colors.primary} />
              <StatCard label="Open" value={store.counselling.filter(c => c.status === 'Open').length} accentColor={colors.warning} />
              <StatCard label="Resolved" value={store.counselling.filter(c => c.status === 'Resolved').length} accentColor={colors.success} />
              <StatCard label="Referred" value={store.counselling.filter(c => c.status === 'Referred').length} accentColor={colors.info} />
            </CardGrid>
            <Text style={styles.pageTitle}>Spiritual Counselling</Text>
            <Text style={styles.pageSubtitle}>Faith-based guidance and pastoral care</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('counselling')}>
              <Text style={styles.actionBtnText}>+ New Session</Text>
            </TouchableOpacity>
            <ScrollView>
              {store.counselling.map((c) => (
                <View key={c.id} style={[styles.card, { borderLeftColor: statusColor(c.status) }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{c.studentName}</Text>
                        <View style={[styles.badge, { backgroundColor: statusColor(c.status) + '20' }]}>
                          <Text style={[styles.badgeText, { color: statusColor(c.status) }]}>{c.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardMeta}>{c.studentClass} | {c.type} | {c.date}</Text>
                      <Text style={styles.cardBody}>{c.summary}</Text>
                      {c.followUpDate && <Text style={styles.cardMeta}>Follow-up: {c.followUpDate}</Text>}
                      {c.notes ? <Text style={styles.cardNotes}>{c.notes}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete('counselling', c.id, 'counselling session')}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'events':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Events" value={store.events.length} accentColor={colors.primary} />
              <StatCard label="Upcoming" value={store.events.filter(e => e.status === 'Planned' || e.status === 'Confirmed').length} accentColor={colors.warning} />
              <StatCard label="Completed" value={store.events.filter(e => e.status === 'Completed').length} accentColor={colors.success} />
              <StatCard label="Cancelled" value={store.events.filter(e => e.status === 'Cancelled').length} accentColor={colors.danger} />
            </CardGrid>
            <Text style={styles.pageTitle}>Religious Events</Text>
            <Text style={styles.pageSubtitle}>Special religious programs and celebrations</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('event')}>
              <Text style={styles.actionBtnText}>+ New Event</Text>
            </TouchableOpacity>
            <ScrollView>
              {store.events.map((e) => (
                <View key={e.id} style={[styles.card, { borderLeftColor: statusColor(e.status) }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{e.title}</Text>
                        <View style={[styles.badge, { backgroundColor: statusColor(e.status) + '20' }]}>
                          <Text style={[styles.badgeText, { color: statusColor(e.status) }]}>{e.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardMeta}>{e.type} | {e.date} | {e.venue}</Text>
                      <Text style={styles.cardMeta}>Coordinator: {e.coordinator}</Text>
                      <Text style={styles.cardMeta}>Expected: {e.expectedAttendance}{e.actualAttendance !== null ? ` | Actual: ${e.actualAttendance}` : ''}</Text>
                      {e.notes ? <Text style={styles.cardNotes}>{e.notes}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete('event', e.id, 'event')}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'fellowships':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Groups" value={store.fellowships.length} accentColor={colors.primary} />
              <StatCard label="Total Members" value={store.fellowships.reduce((sum, f) => sum + f.members, 0)} accentColor={colors.accent} />
              <StatCard label="Avg Members" value={Math.round(store.fellowships.reduce((sum, f) => sum + f.members, 0) / (store.fellowships.length || 1))} accentColor={colors.info} />
              <StatCard label="Active Days" value={new Set(store.fellowships.map(f => f.day)).size} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Fellowship Groups</Text>
            <Text style={styles.pageSubtitle}>Student religious fellowships and study groups</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('fellowship')}>
              <Text style={styles.actionBtnText}>+ New Fellowship</Text>
            </TouchableOpacity>
            <ScrollView>
              {store.fellowships.map((f) => (
                <View key={f.id} style={[styles.card, { borderLeftColor: colors.purple }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{f.name}</Text>
                      <Text style={styles.cardMeta}>Leader: {f.leader} | {f.day} at {f.time}</Text>
                      <Text style={styles.cardMeta}>Venue: {f.venue} | Members: {f.members}</Text>
                      {f.description ? <Text style={styles.cardNotes}>{f.description}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete('fellowship', f.id, 'fellowship group')}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'outreach':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Programs" value={store.outreach.length} accentColor={colors.primary} />
              <StatCard label="Planned" value={store.outreach.filter(o => o.status === 'Planned').length} accentColor={colors.warning} />
              <StatCard label="Completed" value={store.outreach.filter(o => o.status === 'Completed').length} accentColor={colors.success} />
              <StatCard label="Beneficiaries" value={store.outreach.reduce((sum, o) => sum + o.beneficiaries, 0)} accentColor={colors.accent} />
            </CardGrid>
            <Text style={styles.pageTitle}>Outreach & Charity</Text>
            <Text style={styles.pageSubtitle}>Community service and charitable programs</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('outreach')}>
              <Text style={styles.actionBtnText}>+ New Outreach</Text>
            </TouchableOpacity>
            <ScrollView>
              {store.outreach.map((o) => (
                <View key={o.id} style={[styles.card, { borderLeftColor: statusColor(o.status) }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{o.title}</Text>
                        <View style={[styles.badge, { backgroundColor: statusColor(o.status) + '20' }]}>
                          <Text style={[styles.badgeText, { color: statusColor(o.status) }]}>{o.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardMeta}>{o.type} | {o.date} | {o.location}</Text>
                      <Text style={styles.cardMeta}>Coordinator: {o.coordinator} | Beneficiaries: {o.beneficiaries}</Text>
                      <Text style={styles.cardMeta}>Budget: GH₵{o.budget}</Text>
                      {o.notes ? <Text style={styles.cardNotes}>{o.notes}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete('outreach', o.id, 'outreach program')}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'choir':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Members" value={store.choir.length} accentColor={colors.primary} />
              <StatCard label="Sopranos/Altos" value={store.choir.filter(c => c.voicePart === 'Soprano' || c.voicePart === 'Alto').length} accentColor={colors.accent} />
              <StatCard label="Tenors/Bass" value={store.choir.filter(c => c.voicePart === 'Tenor' || c.voicePart === 'Bass').length} accentColor={colors.info} />
              <StatCard label="Instrumentalists" value={store.choir.filter(c => c.voicePart === 'Instrumentalist').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Choir & Music</Text>
            <Text style={styles.pageSubtitle}>Choir membership and music ministry</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('choir')}>
              <Text style={styles.actionBtnText}>+ Add Member</Text>
            </TouchableOpacity>
            <ScrollView>
              {store.choir.map((c) => (
                <View key={c.id} style={[styles.card, { borderLeftColor: colors.success }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{c.name}</Text>
                        <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                          <Text style={[styles.badgeText, { color: colors.success }]}>{c.voicePart}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.badgeText, { color: colors.primary }]}>{c.role}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardMeta}>Class: {c.class} | Attendance: {c.attendance}%</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete('choir', c.id, 'choir member')}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'baptism':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Records" value={store.baptisms.length} accentColor={colors.primary} />
              <StatCard label="Baptisms" value={store.baptisms.filter(b => b.type === 'Baptism').length} accentColor={colors.accent} />
              <StatCard label="Dedications" value={store.baptisms.filter(b => b.type === 'Dedication').length} accentColor={colors.info} />
              <StatCard label="Confirmations" value={store.baptisms.filter(b => b.type === 'Confirmation').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Baptism & Dedication</Text>
            <Text style={styles.pageSubtitle}>Sacramental records and certificates</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('baptism')}>
              <Text style={styles.actionBtnText}>+ New Record</Text>
            </TouchableOpacity>
            <ScrollView>
              {store.baptisms.map((b) => (
                <View key={b.id} style={[styles.card, { borderLeftColor: colors.accent }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{b.name}</Text>
                        <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
                          <Text style={[styles.badgeText, { color: colors.accent }]}>{b.type}</Text>
                        </View>
                        {b.certificateIssued && (
                          <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                            <Text style={[styles.badgeText, { color: colors.success }]}>Cert ✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardMeta}>Date: {b.date} | Officiant: {b.officiant}</Text>
                      <Text style={styles.cardMeta}>Class: {b.class} | Parent/Guardian: {b.parentGuardian}</Text>
                      {b.notes ? <Text style={styles.cardNotes}>{b.notes}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete('baptism', b.id, 'baptism record')}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports & Analytics</Text>
            <Text style={styles.pageSubtitle}>Summary of all religious activities on campus</Text>
            <CardGrid>
              <StatCard label="Services/Week" value={store.services.length} accentColor={colors.primary} />
              <StatCard label="Prayer Requests" value={store.prayerRequests.length} subtitle={`${store.prayerRequests.filter(p => p.status === 'Answered').length} answered`} accentColor={colors.success} />
              <StatCard label="Counselling Sessions" value={store.counselling.length} accentColor={colors.info} />
              <StatCard label="Religious Events" value={store.events.length} accentColor={colors.accent} />
              <StatCard label="Fellowship Members" value={store.fellowships.reduce((s, f) => s + f.members, 0)} accentColor={colors.purple} />
              <StatCard label="Outreach Beneficiaries" value={store.outreach.reduce((s, o) => s + o.beneficiaries, 0)} accentColor={colors.success} />
              <StatCard label="Choir Members" value={store.choir.length} accentColor={colors.info} />
              <StatCard label="Sacraments" value={store.baptisms.length} accentColor={colors.accent} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Service Attendance Summary</Text>
            {store.services.map((s) => (
              <View key={s.id} style={styles.card}>
                <Text style={styles.cardTitle}>{s.type} — {s.day} {s.time}</Text>
                <Text style={styles.cardMeta}>{s.topic} | Attendance: {s.attendance}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Fellowship Membership</Text>
            {store.fellowships.map((f) => (
              <View key={f.id} style={styles.card}>
                <Text style={styles.cardTitle}>{f.name}</Text>
                <Text style={styles.cardMeta}>Leader: {f.leader} | Members: {f.members} | {f.day} {f.time}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Outreach Impact</Text>
            {store.outreach.map((o) => (
              <View key={o.id} style={styles.card}>
                <Text style={styles.cardTitle}>{o.title}</Text>
                <Text style={styles.cardMeta}>{o.type} | {o.date} | Beneficiaries: {o.beneficiaries} | Budget: GH₵{o.budget}</Text>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  // ── Modal render ──
  const renderModal = () => {
    let title = '';
    let content: React.ReactNode = null;

    if (modalType === 'service') {
      title = 'Add Service';
      content = (
        <ScrollView>
          {renderSelect('Type', serviceForm.type, SERVICE_TYPES, (v) => setServiceForm({ ...serviceForm, type: v as ServiceType }))}
          {renderInput('Day', serviceForm.day, (v) => setServiceForm({ ...serviceForm, day: v }))}
          {renderInput('Time', serviceForm.time, (v) => setServiceForm({ ...serviceForm, time: v }))}
          {renderInput('Venue', serviceForm.venue, (v) => setServiceForm({ ...serviceForm, venue: v }))}
          {renderInput('Speaker', serviceForm.speaker, (v) => setServiceForm({ ...serviceForm, speaker: v }))}
          {renderInput('Topic', serviceForm.topic, (v) => setServiceForm({ ...serviceForm, topic: v }))}
          {renderInput('Attendance', String(serviceForm.attendance), (v) => setServiceForm({ ...serviceForm, attendance: Number(v) || 0 }))}
          {renderInput('Notes', serviceForm.notes, (v) => setServiceForm({ ...serviceForm, notes: v }), '', true)}
        </ScrollView>
      );
    } else if (modalType === 'prayer') {
      title = 'New Prayer Request';
      content = (
        <ScrollView>
          {renderInput('Student Name', prayerForm.studentName, (v) => setPrayerForm({ ...prayerForm, studentName: v }))}
          {renderInput('Class', prayerForm.studentClass, (v) => setPrayerForm({ ...prayerForm, studentClass: v }))}
          {renderInput('Request', prayerForm.request, (v) => setPrayerForm({ ...prayerForm, request: v }), 'What is the prayer request?', true)}
          {renderSelect('Visibility', prayerForm.visibility, ['Public', 'Confidential'], (v) => setPrayerForm({ ...prayerForm, visibility: v as 'Public' | 'Confidential' }))}
          {renderInput('Notes', prayerForm.notes, (v) => setPrayerForm({ ...prayerForm, notes: v }), '', true)}
        </ScrollView>
      );
    } else if (modalType === 'counselling') {
      title = 'New Counselling Session';
      content = (
        <ScrollView>
          {renderInput('Student Name', counsellingForm.studentName, (v) => setCounsellingForm({ ...counsellingForm, studentName: v }))}
          {renderInput('Class', counsellingForm.studentClass, (v) => setCounsellingForm({ ...counsellingForm, studentClass: v }))}
          {renderSelect('Type', counsellingForm.type, COUNSELLING_TYPES, (v) => setCounsellingForm({ ...counsellingForm, type: v as CounsellingType }))}
          {renderInput('Summary', counsellingForm.summary, (v) => setCounsellingForm({ ...counsellingForm, summary: v }), 'Session summary', true)}
          {renderInput('Follow-up Date (YYYY-MM-DD)', counsellingForm.followUpDate, (v) => setCounsellingForm({ ...counsellingForm, followUpDate: v }))}
          {renderInput('Notes', counsellingForm.notes, (v) => setCounsellingForm({ ...counsellingForm, notes: v }), '', true)}
        </ScrollView>
      );
    } else if (modalType === 'event') {
      title = 'New Religious Event';
      content = (
        <ScrollView>
          {renderInput('Title', eventForm.title, (v) => setEventForm({ ...eventForm, title: v }))}
          {renderSelect('Type', eventForm.type, SERVICE_TYPES, (v) => setEventForm({ ...eventForm, type: v as ServiceType }))}
          {renderInput('Date (YYYY-MM-DD)', eventForm.date, (v) => setEventForm({ ...eventForm, date: v }))}
          {renderInput('Venue', eventForm.venue, (v) => setEventForm({ ...eventForm, venue: v }))}
          {renderInput('Expected Attendance', String(eventForm.expectedAttendance), (v) => setEventForm({ ...eventForm, expectedAttendance: Number(v) || 0 }))}
          {renderInput('Coordinator', eventForm.coordinator, (v) => setEventForm({ ...eventForm, coordinator: v }))}
          {renderInput('Notes', eventForm.notes, (v) => setEventForm({ ...eventForm, notes: v }), '', true)}
        </ScrollView>
      );
    } else if (modalType === 'fellowship') {
      title = 'New Fellowship Group';
      content = (
        <ScrollView>
          {renderInput('Name', fellowshipForm.name, (v) => setFellowshipForm({ ...fellowshipForm, name: v }))}
          {renderInput('Leader', fellowshipForm.leader, (v) => setFellowshipForm({ ...fellowshipForm, leader: v }))}
          {renderSelect('Day', fellowshipForm.day, FELLOWSHIP_DAYS, (v) => setFellowshipForm({ ...fellowshipForm, day: v as FellowshipDay }))}
          {renderInput('Time', fellowshipForm.time, (v) => setFellowshipForm({ ...fellowshipForm, time: v }))}
          {renderInput('Venue', fellowshipForm.venue, (v) => setFellowshipForm({ ...fellowshipForm, venue: v }))}
          {renderInput('Members', String(fellowshipForm.members), (v) => setFellowshipForm({ ...fellowshipForm, members: Number(v) || 0 }))}
          {renderInput('Description', fellowshipForm.description, (v) => setFellowshipForm({ ...fellowshipForm, description: v }), '', true)}
        </ScrollView>
      );
    } else if (modalType === 'outreach') {
      title = 'New Outreach Program';
      content = (
        <ScrollView>
          {renderInput('Title', outreachForm.title, (v) => setOutreachForm({ ...outreachForm, title: v }))}
          {renderSelect('Type', outreachForm.type, OUTREACH_TYPES, (v) => setOutreachForm({ ...outreachForm, type: v as OutreachType }))}
          {renderInput('Date (YYYY-MM-DD)', outreachForm.date, (v) => setOutreachForm({ ...outreachForm, date: v }))}
          {renderInput('Location', outreachForm.location, (v) => setOutreachForm({ ...outreachForm, location: v }))}
          {renderInput('Beneficiaries', String(outreachForm.beneficiaries), (v) => setOutreachForm({ ...outreachForm, beneficiaries: Number(v) || 0 }))}
          {renderInput('Coordinator', outreachForm.coordinator, (v) => setOutreachForm({ ...outreachForm, coordinator: v }))}
          {renderInput('Budget (GH₵)', String(outreachForm.budget), (v) => setOutreachForm({ ...outreachForm, budget: Number(v) || 0 }))}
          {renderInput('Notes', outreachForm.notes, (v) => setOutreachForm({ ...outreachForm, notes: v }), '', true)}
        </ScrollView>
      );
    } else if (modalType === 'choir') {
      title = 'Add Choir Member';
      content = (
        <ScrollView>
          {renderInput('Name', choirForm.name, (v) => setChoirForm({ ...choirForm, name: v }))}
          {renderSelect('Voice Part', choirForm.voicePart, VOICE_PARTS, (v) => setChoirForm({ ...choirForm, voicePart: v as typeof VOICE_PARTS[number] }))}
          {renderSelect('Role', choirForm.role, CHOIR_ROLES, (v) => setChoirForm({ ...choirForm, role: v as typeof CHOIR_ROLES[number] }))}
          {renderInput('Class', choirForm.class, (v) => setChoirForm({ ...choirForm, class: v }))}
          {renderInput('Attendance %', String(choirForm.attendance), (v) => setChoirForm({ ...choirForm, attendance: Number(v) || 0 }))}
        </ScrollView>
      );
    } else if (modalType === 'baptism') {
      title = 'New Baptism/Dedication Record';
      content = (
        <ScrollView>
          {renderInput('Name', baptismForm.name, (v) => setBaptismForm({ ...baptismForm, name: v }))}
          {renderSelect('Type', baptismForm.type, BAPTISM_TYPES, (v) => setBaptismForm({ ...baptismForm, type: v as BaptismType }))}
          {renderInput('Date (YYYY-MM-DD)', baptismForm.date, (v) => setBaptismForm({ ...baptismForm, date: v }))}
          {renderInput('Officiant', baptismForm.officiant, (v) => setBaptismForm({ ...baptismForm, officiant: v }))}
          {renderInput('Class', baptismForm.class, (v) => setBaptismForm({ ...baptismForm, class: v }))}
          {renderInput('Parent/Guardian', baptismForm.parentGuardian, (v) => setBaptismForm({ ...baptismForm, parentGuardian: v }))}
          {renderInput('Notes', baptismForm.notes, (v) => setBaptismForm({ ...baptismForm, notes: v }), '', true)}
        </ScrollView>
      );
    }

    const handleSave = () => {
      if (modalType === 'service') handleSaveService();
      else if (modalType === 'prayer') handleSavePrayer();
      else if (modalType === 'counselling') handleSaveCounselling();
      else if (modalType === 'event') handleSaveEvent();
      else if (modalType === 'fellowship') handleSaveFellowship();
      else if (modalType === 'outreach') handleSaveOutreach();
      else if (modalType === 'choir') handleSaveChoir();
      else if (modalType === 'baptism') handleSaveBaptism();
    };

    return (
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={closeModal}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {content}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <DashboardLayout
      title="Chaplain"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {activePage === 'assigned-roles' ? null : renderPage()}
      </ScrollView>
      {renderModal()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardBody: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  cardNotes: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  deleteBtn: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: fontWeight.bold,
    padding: spacing.xs,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quickBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  quickBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  smallBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  smallBtnText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  // ── Modal styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeBtn: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  // ── Form styles ──
  inputLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  selectChip: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectChipText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  selectChipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
});
