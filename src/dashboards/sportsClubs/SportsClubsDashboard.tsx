import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable, RequisitionModal } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRequisitionStore } from '@store/requisitionStore';
import {
  useSportsStore, CLUB_CATEGORIES, SPORTS,
  EQUIPMENT_CONDITIONS as SPORTS_EQUIPMENT_CONDITIONS, ACHIEVEMENT_LEVELS,
  ACCESS_ROLES as SPORTS_ACCESS_ROLES, ACCESS_LEVELS as SPORTS_ACCESS_LEVELS, MEETING_DAYS,
} from '@store/sportsStore';
import type { EquipmentCondition as SportsEquipmentCondition, AchievementLevel, AccessRole as SportsAccessRole, AccessRecord as SportsAccessRecord } from '@store/sportsStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'clubs', label: 'Clubs & Societies' },
  { key: 'fixtures', label: 'Sports Fixtures' },
  { key: 'participation', label: 'Participation' },
  { key: 'equipment', label: 'Equipment & Kits' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'access', label: 'Access Control' },
  { key: 'requisitions', label: 'Requisitions' },
];

const ACCESS_RESOURCES = ['Clubs & Societies', 'Sports Fixtures', 'Equipment & Kits', 'Achievements', 'Participation Records'];

export function SportsClubsDashboard() {
  const [activePage, setActivePage] = useState('clubs');
  const { user, logout } = useAuthStore();
  const coordinatorName = user?.displayName ?? 'Sports Coordinator';

  return (
    <DashboardLayout
      title="Sports & Clubs"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
    >
      {activePage === 'clubs' && <ClubsPage />}
      {activePage === 'fixtures' && <FixturesPage />}
      {activePage === 'participation' && <ParticipationPage />}
      {activePage === 'equipment' && <EquipmentPage />}
      {activePage === 'achievements' && <AchievementsPage />}
      {activePage === 'access' && <AccessControlPage coordinatorName={coordinatorName} />}
      {activePage === 'requisitions' && <RequisitionsPage coordinatorName={coordinatorName} />}
    </DashboardLayout>
  );
}

// ── Clubs Page ──

function ClubsPage() {
  const { clubs, addClub } = useSportsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: CLUB_CATEGORIES[0], patron: '', memberCount: '0', meetingDay: MEETING_DAYS[0], description: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.patron.trim()) {
      Alert.alert('Error', 'Club name and patron are required');
      return;
    }
    addClub({
      name: form.name.trim(),
      category: form.category,
      patron: form.patron.trim(),
      memberCount: parseInt(form.memberCount) || 0,
      meetingDay: form.meetingDay,
      description: form.description.trim() || undefined,
    });
    setForm({ name: '', category: CLUB_CATEGORIES[0], patron: '', memberCount: '0', meetingDay: MEETING_DAYS[0], description: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Club added');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Active Clubs" value={clubs.length} subtitle="Across all categories" accentColor={colors.primary} />
        <StatCard label="Total Members" value={clubs.reduce((s, c) => s + c.memberCount, 0)} accentColor={colors.info} />
        <StatCard label="Academic Clubs" value={clubs.filter((c) => c.category === 'Academic').length} accentColor={colors.success} />
        <StatCard label="Sports Clubs" value={clubs.filter((c) => c.category === 'Sports').length} accentColor={colors.warning} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Clubs & Societies Registry</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Add Club</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'name', label: 'Club', render: (i: any) => i.name },
          { key: 'category', label: 'Category', render: (i: any) => i.category },
          { key: 'patron', label: 'Patron', render: (i: any) => i.patron },
          { key: 'members', label: 'Members', render: (i: any) => String(i.memberCount) },
          { key: 'meetingDay', label: 'Meets', render: (i: any) => i.meetingDay },
        ]}
        data={clubs}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Club</Text>
              <Text style={styles.modalSubtitle}>Register a new club or society</Text>

              <Text style={styles.inputLabel}>Club Name</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="e.g. Debate Society" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.selectRow}>
                {CLUB_CATEGORIES.map((c) => (
                  <TouchableOpacity key={c} style={[styles.selectChip, form.category === c && styles.selectChipActive]} onPress={() => setForm({ ...form, category: c })}>
                    <Text style={[styles.selectChipText, form.category === c && styles.selectChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Patron</Text>
              <TextInput style={styles.input} value={form.patron} onChangeText={(v) => setForm({ ...form, patron: v })} placeholder="Staff name" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Member Count</Text>
              <TextInput style={styles.input} value={form.memberCount} onChangeText={(v) => setForm({ ...form, memberCount: v })} placeholder="e.g. 45" placeholderTextColor={colors.textLight} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Meeting Day</Text>
              <View style={styles.selectRow}>
                {MEETING_DAYS.map((d) => (
                  <TouchableOpacity key={d} style={[styles.selectChip, form.meetingDay === d && styles.selectChipActive]} onPress={() => setForm({ ...form, meetingDay: d })}>
                    <Text style={[styles.selectChipText, form.meetingDay === d && styles.selectChipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Club description..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextLight}>Add Club</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Fixtures Page ──

function FixturesPage() {
  const { fixtures, addFixture, updateFixtureResult } = useSportsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showResult, setShowResult] = useState<string | null>(null);
  const [form, setForm] = useState({ date: '', sport: SPORTS[0], match: '', venue: '' });
  const [resultForm, setResultForm] = useState({ scoreHome: '', scoreAway: '', result: '' });

  const handleAdd = () => {
    if (!form.date.trim() || !form.match.trim() || !form.venue.trim()) {
      Alert.alert('Error', 'Date, match and venue are required');
      return;
    }
    addFixture({ date: form.date.trim(), sport: form.sport, match: form.match.trim(), venue: form.venue.trim() });
    setForm({ date: '', sport: SPORTS[0], match: '', venue: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Fixture added');
  };

  const handleResult = () => {
    if (!showResult) return;
    if (!resultForm.result.trim()) {
      Alert.alert('Error', 'Result summary is required');
      return;
    }
    updateFixtureResult(showResult, resultForm.scoreHome.trim(), resultForm.scoreAway.trim(), resultForm.result.trim());
    setResultForm({ scoreHome: '', scoreAway: '', result: '' });
    setShowResult(null);
    Alert.alert('Success', 'Result recorded');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Upcoming" value={fixtures.filter((f) => f.status === 'Upcoming').length} accentColor={colors.info} />
        <StatCard label="Completed" value={fixtures.filter((f) => f.status === 'Completed').length} accentColor={colors.success} />
        <StatCard label="Cancelled" value={fixtures.filter((f) => f.status === 'Cancelled').length} accentColor={colors.danger} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Sports Fixtures</Text>
          <Text style={styles.pageSubtitle}>Inter-house and inter-school match schedule</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Add Fixture</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'sport', label: 'Sport', render: (i: any) => i.sport },
          { key: 'match', label: 'Match', render: (i: any) => i.match },
          { key: 'venue', label: 'Venue', render: (i: any) => i.venue },
          { key: 'status', label: 'Status', render: (i: any) => i.status },
          { key: 'result', label: 'Result', render: (i: any) => i.result ?? '-' },
        ]}
        data={fixtures}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Fixture</Text>
              <Text style={styles.modalSubtitle}>Schedule a new match</Text>

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Sport</Text>
              <View style={styles.selectRow}>
                {SPORTS.map((s) => (
                  <TouchableOpacity key={s} style={[styles.selectChip, form.sport === s && styles.selectChipActive]} onPress={() => setForm({ ...form, sport: s })}>
                    <Text style={[styles.selectChipText, form.sport === s && styles.selectChipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Match</Text>
              <TextInput style={styles.input} value={form.match} onChangeText={(v) => setForm({ ...form, match: v })} placeholder="e.g. Aggrey vs Danquah" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Venue</Text>
              <TextInput style={styles.input} value={form.venue} onChangeText={(v) => setForm({ ...form, venue: v })} placeholder="e.g. School field" placeholderTextColor={colors.textLight} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextLight}>Add Fixture</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showResult !== null} animationType="slide" transparent onRequestClose={() => setShowResult(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Result</Text>
            <Text style={styles.modalSubtitle}>Enter match scores and result summary</Text>

            <Text style={styles.inputLabel}>Home Score</Text>
            <TextInput style={styles.input} value={resultForm.scoreHome} onChangeText={(v) => setResultForm({ ...resultForm, scoreHome: v })} placeholder="e.g. 3" placeholderTextColor={colors.textLight} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Away Score</Text>
            <TextInput style={styles.input} value={resultForm.scoreAway} onChangeText={(v) => setResultForm({ ...resultForm, scoreAway: v })} placeholder="e.g. 1" placeholderTextColor={colors.textLight} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Result Summary</Text>
            <TextInput style={styles.input} value={resultForm.result} onChangeText={(v) => setResultForm({ ...resultForm, result: v })} placeholder="e.g. Won 3-1" placeholderTextColor={colors.textLight} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowResult(null)}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleResult}>
                <Text style={styles.modalBtnTextLight}>Save Result</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Participation Page ──

function ParticipationPage() {
  const { participation, addParticipation } = useSportsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: '', activity: '', participantCount: '0', notes: '' });

  const handleAdd = () => {
    if (!form.date.trim() || !form.activity.trim()) {
      Alert.alert('Error', 'Date and activity are required');
      return;
    }
    addParticipation({
      date: form.date.trim(),
      activity: form.activity.trim(),
      participantCount: parseInt(form.participantCount) || 0,
      notes: form.notes.trim() || undefined,
    });
    setForm({ date: '', activity: '', participantCount: '0', notes: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Participation logged');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Records" value={participation.length} accentColor={colors.primary} />
        <StatCard label="Total Participants" value={participation.reduce((s, p) => s + p.participantCount, 0)} accentColor={colors.info} />
        <StatCard label="Avg Attendance" value={participation.length > 0 ? Math.round(participation.reduce((s, p) => s + p.participantCount, 0) / participation.length) : 0} accentColor={colors.success} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Participation Log</Text>
          <Text style={styles.pageSubtitle}>Track student involvement in activities</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Log Attendance</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'activity', label: 'Activity', render: (i: any) => i.activity },
          { key: 'participants', label: 'Participants', render: (i: any) => String(i.participantCount) },
        ]}
        data={participation}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log Attendance</Text>

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Activity</Text>
              <TextInput style={styles.input} value={form.activity} onChangeText={(v) => setForm({ ...form, activity: v })} placeholder="e.g. Football practice" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Participant Count</Text>
              <TextInput style={styles.input} value={form.participantCount} onChangeText={(v) => setForm({ ...form, participantCount: v })} placeholder="e.g. 32" placeholderTextColor={colors.textLight} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextLight}>Log</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Equipment Page ──

function EquipmentPage() {
  const { equipment, addEquipment } = useSportsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ item: '', quantity: '1', condition: 'Good' as SportsEquipmentCondition, location: '', notes: '' });

  const handleAdd = () => {
    if (!form.item.trim() || !form.location.trim()) {
      Alert.alert('Error', 'Item name and location are required');
      return;
    }
    addEquipment({
      item: form.item.trim(),
      quantity: parseInt(form.quantity) || 1,
      condition: form.condition,
      location: form.location.trim(),
      notes: form.notes.trim() || undefined,
    });
    setForm({ item: '', quantity: '1', condition: 'Good', location: '', notes: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Equipment added');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Items" value={equipment.reduce((s, e) => s + e.quantity, 0)} accentColor={colors.primary} />
        <StatCard label="Good Condition" value={equipment.filter((e) => e.condition === 'Good').length} accentColor={colors.success} />
        <StatCard label="Needs Repair" value={equipment.filter((e) => e.condition === 'Needs Repair' || e.condition === 'Poor').length} accentColor={colors.danger} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Equipment & Kits Inventory</Text>
          <Text style={styles.pageSubtitle}>Sports gear and club equipment</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Add Equipment</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'item', label: 'Item', render: (i: any) => i.item },
          { key: 'qty', label: 'Qty', render: (i: any) => String(i.quantity) },
          { key: 'condition', label: 'Condition', render: (i: any) => i.condition },
          { key: 'location', label: 'Location', render: (i: any) => i.location },
        ]}
        data={equipment}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Equipment</Text>

              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput style={styles.input} value={form.item} onChangeText={(v) => setForm({ ...form, item: v })} placeholder="e.g. Footballs" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput style={styles.input} value={form.quantity} onChangeText={(v) => setForm({ ...form, quantity: v })} placeholder="e.g. 15" placeholderTextColor={colors.textLight} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Condition</Text>
              <View style={styles.selectRow}>
                {SPORTS_EQUIPMENT_CONDITIONS.map((c) => (
                  <TouchableOpacity key={c} style={[styles.selectChip, form.condition === c && styles.selectChipActive]} onPress={() => setForm({ ...form, condition: c })}>
                    <Text style={[styles.selectChipText, form.condition === c && styles.selectChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Location</Text>
              <TextInput style={styles.input} value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} placeholder="e.g. Sports Store" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextLight}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Achievements Page ──

function AchievementsPage() {
  const { achievements, addAchievement } = useSportsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: '', achievement: '', level: 'School' as AchievementLevel, recipients: '' });

  const handleAdd = () => {
    if (!form.achievement.trim() || !form.date.trim()) {
      Alert.alert('Error', 'Date and achievement are required');
      return;
    }
    addAchievement({
      date: form.date.trim(),
      achievement: form.achievement.trim(),
      level: form.level,
      recipients: form.recipients.trim() || undefined,
    });
    setForm({ date: '', achievement: '', level: 'School', recipients: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Achievement logged');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Awards" value={achievements.length} accentColor={colors.primary} />
        <StatCard label="National" value={achievements.filter((a) => a.level === 'National').length} accentColor={colors.info} />
        <StatCard label="Regional" value={achievements.filter((a) => a.level === 'Regional').length} accentColor={colors.success} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Achievements Log</Text>
          <Text style={styles.pageSubtitle}>Trophies, awards, and records won</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Log Achievement</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'achievement', label: 'Achievement', render: (i: any) => i.achievement },
          { key: 'level', label: 'Level', render: (i: any) => i.level },
          { key: 'recipients', label: 'Recipients', render: (i: any) => i.recipients ?? '-' },
        ]}
        data={achievements}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log Achievement</Text>

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Achievement</Text>
              <TextInput style={styles.input} value={form.achievement} onChangeText={(v) => setForm({ ...form, achievement: v })} placeholder="e.g. Inter-school Football Champions" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Level</Text>
              <View style={styles.selectRow}>
                {ACHIEVEMENT_LEVELS.map((l) => (
                  <TouchableOpacity key={l} style={[styles.selectChip, form.level === l && styles.selectChipActive]} onPress={() => setForm({ ...form, level: l })}>
                    <Text style={[styles.selectChipText, form.level === l && styles.selectChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Recipients (optional)</Text>
              <TextInput style={styles.input} value={form.recipients} onChangeText={(v) => setForm({ ...form, recipients: v })} placeholder="e.g. Football Team" placeholderTextColor={colors.textLight} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextLight}>Log</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Access Control Page ──

function AccessControlPage({ coordinatorName }: { coordinatorName: string }) {
  const { accessRecords, grantAccess } = useSportsStore();
  const [showGrant, setShowGrant] = useState(false);
  const [form, setForm] = useState({ personName: '', role: 'Teacher' as SportsAccessRole, resource: '', accessLevel: 'Read Only' as string, notes: '' });

  const handleGrant = () => {
    if (!form.personName.trim() || !form.resource) {
      Alert.alert('Error', 'Person name and resource are required');
      return;
    }
    grantAccess({
      personName: form.personName.trim(),
      role: form.role,
      resource: form.resource,
      accessLevel: form.accessLevel as SportsAccessRecord['accessLevel'],
      grantedBy: coordinatorName,
      notes: form.notes.trim() || undefined,
    });
    setForm({ personName: '', role: 'Teacher', resource: '', accessLevel: 'Read Only', notes: '' });
    setShowGrant(false);
    Alert.alert('Success', 'Access granted');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Access Records" value={accessRecords.length} accentColor={colors.primary} />
        <StatCard label="Full Access" value={accessRecords.filter((a) => a.accessLevel === 'Full').length} accentColor={colors.success} />
        <StatCard label="Restricted" value={accessRecords.filter((a) => a.accessLevel === 'Restricted' || a.accessLevel === 'No Access').length} accentColor={colors.danger} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Access Control</Text>
          <Text style={styles.pageSubtitle}>Manage who can access sports and clubs resources</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowGrant(true)}>
          <Text style={styles.actionBtnText}>+ Grant Access</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'person', label: 'Person', render: (i: any) => i.personName },
          { key: 'role', label: 'Role', render: (i: any) => i.role },
          { key: 'resource', label: 'Resource', render: (i: any) => i.resource },
          { key: 'level', label: 'Access Level', render: (i: any) => i.accessLevel },
          { key: 'grantedBy', label: 'Granted By', render: (i: any) => i.grantedBy },
        ]}
        data={accessRecords}
      />

      <Modal visible={showGrant} animationType="slide" transparent onRequestClose={() => setShowGrant(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Grant Access</Text>
              <Text style={styles.modalSubtitle}>Assign resource access to a person</Text>

              <Text style={styles.inputLabel}>Person Name</Text>
              <TextInput style={styles.input} value={form.personName} onChangeText={(v) => setForm({ ...form, personName: v })} placeholder="Person or group name" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.selectRow}>
                {SPORTS_ACCESS_ROLES.map((r) => (
                  <TouchableOpacity key={r} style={[styles.selectChip, form.role === r && styles.selectChipActive]} onPress={() => setForm({ ...form, role: r })}>
                    <Text style={[styles.selectChipText, form.role === r && styles.selectChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Resource</Text>
              <View style={styles.selectRow}>
                {ACCESS_RESOURCES.map((r) => (
                  <TouchableOpacity key={r} style={[styles.selectChip, form.resource === r && styles.selectChipActive]} onPress={() => setForm({ ...form, resource: r })}>
                    <Text style={[styles.selectChipText, form.resource === r && styles.selectChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Access Level</Text>
              <View style={styles.selectRow}>
                {SPORTS_ACCESS_LEVELS.map((l) => (
                  <TouchableOpacity key={l} style={[styles.selectChip, form.accessLevel === l && styles.selectChipActive]} onPress={() => setForm({ ...form, accessLevel: l })}>
                    <Text style={[styles.selectChipText, form.accessLevel === l && styles.selectChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Access notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />

              <Text style={styles.requesterInfo}>Granted by: {coordinatorName}</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowGrant(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleGrant}>
                  <Text style={styles.modalBtnTextLight}>Grant Access</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Requisitions Page ──

function RequisitionsPage({ coordinatorName }: { coordinatorName: string }) {
  const requisitions = useRequisitionStore((s) => s.requisitions);
  const [showReq, setShowReq] = useState(false);

  const sportsReqs = requisitions.filter((r) => r.department === 'Sports & Clubs');

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Reqs" value={sportsReqs.length} accentColor={colors.primary} />
        <StatCard label="Pending" value={sportsReqs.filter((r) => r.status === 'Pending').length} accentColor={colors.warning} />
        <StatCard label="Issued" value={sportsReqs.filter((r) => r.status === 'Issued').length} accentColor={colors.success} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Requisitions</Text>
          <Text style={styles.pageSubtitle}>Request items from Stores for Sports & Clubs</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReq(true)}>
          <Text style={styles.actionBtnText}>+ New Requisition</Text>
        </TouchableOpacity>
      </View>

      {sportsReqs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No requisitions yet. Tap "New Requisition" to request items from Stores.</Text>
        </View>
      ) : (
        <DataTable
          columns={[
            { key: 'date', label: 'Date', render: (i: any) => i.date },
            { key: 'item', label: 'Item', render: (i: any) => i.itemName },
            { key: 'qty', label: 'Qty', render: (i: any) => `${i.quantity} ${i.unit}` },
            { key: 'priority', label: 'Priority', render: (i: any) => i.priority },
            { key: 'status', label: 'Status', render: (i: any) => i.status },
          ]}
          data={sportsReqs}
        />
      )}

      <RequisitionModal
        visible={showReq}
        onClose={() => setShowReq(false)}
        department="Sports & Clubs"
        requestedBy={coordinatorName}
      />
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalScroll: { width: '100%', maxHeight: '90%' },
  modalScrollContent: { alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 480, padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  textArea: { minHeight: 60 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  selectChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  selectChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  selectChipTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  requesterInfo: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm, marginBottom: spacing.sm },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
  emptyBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xxl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, fontWeight: fontWeight.medium, textAlign: 'center' },
});
