import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import {
  usePTAStore, PTA_ROLES,
  ACCESS_ROLES as PTA_ACCESS_ROLES, ACCESS_LEVELS as PTA_ACCESS_LEVELS, PAYMENT_METHODS,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, TRANSACTION_TYPES,
} from '@store/ptaStore';
import type { AccessRole as PTAAccessRole, AccessRecord as PTAAccessRecord, TransactionType } from '@store/ptaStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'wards', label: 'My Ward(s)' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'fundraising', label: 'Fundraising' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'directory', label: 'Directory' },
  { key: 'dues', label: 'PTA Dues' },
  { key: 'finance', label: 'Finance' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'access', label: 'Access Control' },
];

const ACCESS_RESOURCES = ['Announcements', 'Fundraising Projects', 'Meeting Schedule', 'Parent Directory', 'PTA Dues', 'Finance', 'Feedback'];

export function PTADashboard() {
  const [activePage, setActivePage] = useState('wards');
  const { user, logout } = useAuthStore();
  const parentName = user?.displayName ?? 'Parent';

  return (
    <DashboardLayout
      title="PTA"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
    >
      {activePage === 'wards' && <WardsPage />}
      {activePage === 'announcements' && <AnnouncementsPage />}
      {activePage === 'fundraising' && <FundraisingPage parentName={parentName} />}
      {activePage === 'meetings' && <MeetingsPage />}
      {activePage === 'directory' && <DirectoryPage />}
      {activePage === 'dues' && <DuesPage parentName={parentName} />}
      {activePage === 'finance' && <FinancePage treasurerName={parentName} />}
      {activePage === 'feedback' && <FeedbackPage />}
      {activePage === 'access' && <AccessControlPage parentName={parentName} />}
    </DashboardLayout>
  );
}

// ── Wards Page ──

function WardsPage() {
  const { wards } = usePTAStore();

  return (
    <View>
      <CardGrid>
        <StatCard label="Wards" value={wards.length} accentColor={colors.primary} />
        <StatCard label="Fees Cleared" value={wards.filter((w) => w.feesStatus === 'Cleared').length} accentColor={colors.success} />
        <StatCard label="Avg Attendance" value={wards.length > 0 ? wards.reduce((s, w) => s + parseFloat(w.attendance), 0) / wards.length : 0} accentColor={colors.info} />
      </CardGrid>

      <Text style={styles.pageTitle}>My Ward(s)</Text>
      <Text style={styles.pageSubtitle}>Read-only view of your children's records</Text>

      {wards.map((ward) => (
        <View key={ward.id} style={styles.wardCard}>
          <Text style={styles.wardName}>{ward.name}</Text>
          <Text style={styles.wardDetail}>{ward.className} | {ward.house} House</Text>
          <View style={styles.wardStats}>
            <View style={styles.wardStat}>
              <Text style={styles.wardStatLabel}>Attendance</Text>
              <Text style={styles.wardStatValue}>{ward.attendance}</Text>
            </View>
            <View style={styles.wardStat}>
              <Text style={styles.wardStatLabel}>Avg Score</Text>
              <Text style={styles.wardStatValue}>{ward.avgScore}</Text>
            </View>
            <View style={styles.wardStat}>
              <Text style={styles.wardStatLabel}>Fees</Text>
              <Text style={[styles.wardStatValue, { color: ward.feesStatus === 'Cleared' ? colors.success : colors.danger }]}>{ward.feesStatus}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewReportBtn} onPress={() => Alert.alert('Report Card', `Report card for ${ward.name} would open here.`)}>
            <Text style={styles.viewReportText}>View Report Card</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ── Announcements Page ──

function AnnouncementsPage() {
  const { announcements, addAnnouncement, deleteAnnouncement } = usePTAStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', author: '' });

  const handleAdd = () => {
    if (!form.title.trim() || !form.body.trim()) {
      Alert.alert('Error', 'Title and body are required');
      return;
    }
    addAnnouncement({
      title: form.title.trim(),
      body: form.body.trim(),
      date: new Date().toISOString().slice(0, 10),
      author: form.author.trim() || 'PTA Member',
    });
    setForm({ title: '', body: '', author: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Announcement posted');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Announcements" value={announcements.length} accentColor={colors.primary} />
        <StatCard label="This Month" value={announcements.filter((a) => a.date.startsWith('2026-07')).length} accentColor={colors.info} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Announcements</Text>
          <Text style={styles.pageSubtitle}>School-to-parent broadcast messages</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Post Announcement</Text>
        </TouchableOpacity>
      </View>

      {announcements.map((item) => (
        <View key={item.id} style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>{item.title}</Text>
          <Text style={styles.announcementBody}>{item.body}</Text>
          <View style={styles.announcementFooter}>
            <Text style={styles.announcementDate}>{item.date} | {item.author}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Delete', 'Remove this announcement?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteAnnouncement(item.id) }])}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Post Announcement</Text>

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Announcement title" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Body</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.body} onChangeText={(v) => setForm({ ...form, body: v })} placeholder="Announcement details..." placeholderTextColor={colors.textLight} multiline numberOfLines={4} />

              <Text style={styles.inputLabel}>Author (optional)</Text>
              <TextInput style={styles.input} value={form.author} onChangeText={(v) => setForm({ ...form, author: v })} placeholder="Your name" placeholderTextColor={colors.textLight} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextLight}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Fundraising Page ──

function FundraisingPage({ parentName }: { parentName: string }) {
  const { fundraising, addFundraisingProject, contribute, deleteFundraisingProject } = usePTAStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [projForm, setProjForm] = useState({ project: '', targetAmount: '', description: '' });
  const [contribForm, setContribForm] = useState({ amount: '' });

  const handleAddProject = () => {
    if (!projForm.project.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }
    const target = parseFloat(projForm.targetAmount);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Error', 'Invalid target amount');
      return;
    }
    addFundraisingProject({
      project: projForm.project.trim(),
      targetAmount: target,
      description: projForm.description.trim() || undefined,
    });
    setProjForm({ project: '', targetAmount: '', description: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Fundraising project created');
  };

  const handleContribute = () => {
    if (!showContribute) return;
    const amount = parseFloat(contribForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }
    contribute(showContribute, parentName, amount);
    setContribForm({ amount: '' });
    setShowContribute(null);
    Alert.alert('Success', 'Contribution recorded. Thank you!');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Projects" value={fundraising.length} accentColor={colors.primary} />
        <StatCard label="Total Raised" value={`GH₵${fundraising.reduce((s, p) => s + p.raisedAmount, 0).toLocaleString()}`} accentColor={colors.success} />
        <StatCard label="Total Target" value={`GH₵${fundraising.reduce((s, p) => s + p.targetAmount, 0).toLocaleString()}`} accentColor={colors.info} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Fundraising Projects</Text>
          <Text style={styles.pageSubtitle}>Support school improvement initiatives</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Add Project</Text>
        </TouchableOpacity>
      </View>

      {fundraising.map((item) => {
        const pct = item.targetAmount > 0 ? Math.round((item.raisedAmount / item.targetAmount) * 100) : 0;
        return (
          <View key={item.id} style={styles.fundraisingCard}>
            <Text style={styles.fundraisingTitle}>{item.project}</Text>
            {item.description ? <Text style={styles.fundraisingDesc}>{item.description}</Text> : null}
            <Text style={styles.fundraisingAmount}>Raised: GH₵{item.raisedAmount.toLocaleString()} / GH₵{item.targetAmount.toLocaleString()}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
            </View>
            <Text style={styles.fundraisingPct}>{pct}% funded</Text>
            <View style={styles.fundraisingActions}>
              <TouchableOpacity style={styles.contributeBtn} onPress={() => setShowContribute(item.id)}>
                <Text style={styles.contributeBtnText}>Contribute</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Delete', `Delete "${item.project}"?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteFundraisingProject(item.id) }])}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
            {item.contributions.length > 0 && (
              <View style={styles.contribList}>
                <Text style={styles.contribTitle}>Recent Contributions</Text>
                {item.contributions.slice(0, 3).map((c) => (
                  <Text key={c.id} style={styles.contribItem}>{c.contributorName}: GH₵{c.amount.toLocaleString()} ({c.date})</Text>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Fundraising Project</Text>

              <Text style={styles.inputLabel}>Project Name</Text>
              <TextInput style={styles.input} value={projForm.project} onChangeText={(v) => setProjForm({ ...projForm, project: v })} placeholder="e.g. New Library Books" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Target Amount (GH₵)</Text>
              <TextInput style={styles.input} value={projForm.targetAmount} onChangeText={(v) => setProjForm({ ...projForm, targetAmount: v })} placeholder="e.g. 15000" placeholderTextColor={colors.textLight} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={projForm.description} onChangeText={(v) => setProjForm({ ...projForm, description: v })} placeholder="Project description..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAddProject}>
                  <Text style={styles.modalBtnTextLight}>Add Project</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showContribute !== null} animationType="slide" transparent onRequestClose={() => setShowContribute(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contribute</Text>
            <Text style={styles.modalSubtitle}>Support this fundraising project</Text>

            <Text style={styles.inputLabel}>Amount (GH₵)</Text>
            <TextInput style={styles.input} value={contribForm.amount} onChangeText={(v) => setContribForm({ amount: v })} placeholder="e.g. 500" placeholderTextColor={colors.textLight} keyboardType="numeric" />

            <Text style={styles.requesterInfo}>Contributor: {parentName}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowContribute(null)}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleContribute}>
                <Text style={styles.modalBtnTextLight}>Contribute</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Meetings Page ──

function MeetingsPage() {
  const { meetings, setRSVP } = usePTAStore();

  return (
    <View>
      <CardGrid>
        <StatCard label="Upcoming" value={meetings.length} accentColor={colors.primary} />
        <StatCard label="Will Attend" value={meetings.filter((m) => m.rsvp === 'Will Attend').length} accentColor={colors.success} />
        <StatCard label="Not Responded" value={meetings.filter((m) => m.rsvp === 'Not Responded').length} accentColor={colors.warning} />
      </CardGrid>

      <Text style={styles.pageTitle}>Meeting Schedule</Text>
      <Text style={styles.pageSubtitle}>Upcoming PTA meeting dates with RSVP</Text>

      {meetings.map((item) => (
        <View key={item.id} style={styles.meetingCard}>
          <Text style={styles.meetingDate}>{item.date} at {item.time}</Text>
          <Text style={styles.meetingTopic}>{item.topic}</Text>
          <Text style={styles.meetingLocation}>Location: {item.location}</Text>
          <Text style={styles.rsvpStatus}>RSVP: {item.rsvp}</Text>
          <View style={styles.rsvpActions}>
            <TouchableOpacity
              style={[styles.rsvpYesBtn, item.rsvp === 'Will Attend' && styles.rsvpActive]}
              onPress={() => setRSVP(item.id, 'Will Attend')}
            >
              <Text style={styles.rsvpYesText}>Will Attend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rsvpNoBtn, item.rsvp === 'Cannot Attend' && styles.rsvpNoActive]}
              onPress={() => setRSVP(item.id, 'Cannot Attend')}
            >
              <Text style={styles.rsvpNoText}>Cannot Attend</Text>
            </TouchableOpacity>
            {item.rsvp !== 'Not Responded' && (
              <TouchableOpacity onPress={() => setRSVP(item.id, 'Not Responded')}>
                <Text style={styles.resetRsvpText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Directory Page ──

function DirectoryPage() {
  const { directory, addDirectoryEntry } = usePTAStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', ptaRole: PTA_ROLES[0], wardNames: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Error', 'Name and phone are required');
      return;
    }
    addDirectoryEntry({
      name: form.name.trim(),
      phone: form.phone.trim(),
      ptaRole: form.ptaRole,
      wardNames: form.wardNames.trim() || '-',
    });
    setForm({ name: '', phone: '', ptaRole: PTA_ROLES[0], wardNames: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Directory entry added');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Parents" value={directory.length} accentColor={colors.primary} />
        <StatCard label="Executives" value={directory.filter((d) => d.ptaRole !== 'Member').length} accentColor={colors.info} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Parent Directory</Text>
          <Text style={styles.pageSubtitle}>Contact list — no student academic data visible</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Add Parent</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'name', label: 'Parent Name', render: (i: any) => i.name },
          { key: 'phone', label: 'Phone', render: (i: any) => i.phone },
          { key: 'ptaRole', label: 'PTA Role', render: (i: any) => i.ptaRole },
          { key: 'wardNames', label: 'Wards', render: (i: any) => i.wardNames },
        ]}
        data={directory}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Parent</Text>

              <Text style={styles.inputLabel}>Parent Name</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Parent name" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.input} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="e.g. 024-XXX-XXXX" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>PTA Role</Text>
              <View style={styles.selectRow}>
                {PTA_ROLES.map((r) => (
                  <TouchableOpacity key={r} style={[styles.selectChip, form.ptaRole === r && styles.selectChipActive]} onPress={() => setForm({ ...form, ptaRole: r })}>
                    <Text style={[styles.selectChipText, form.ptaRole === r && styles.selectChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Ward Names</Text>
              <TextInput style={styles.input} value={form.wardNames} onChangeText={(v) => setForm({ ...form, wardNames: v })} placeholder="e.g. Kwame, Adwoa" placeholderTextColor={colors.textLight} />

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

// ── Dues Page ──

function DuesPage({ parentName }: { parentName: string }) {
  const { dues, payDues } = usePTAStore();
  const [showPay, setShowPay] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: '', method: PAYMENT_METHODS[0] });

  const handlePay = () => {
    if (!showPay) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }
    payDues(showPay, amount, form.method);
    setForm({ amount: '', method: PAYMENT_METHODS[0] });
    setShowPay(null);
    Alert.alert('Success', 'Payment recorded');
  };

  const totalOwing = dues.filter((d) => d.status !== 'Paid').reduce((s, d) => s + (d.amount - d.amountPaid), 0);
  const totalPaid = dues.reduce((s, d) => s + d.amountPaid, 0);

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Paid" value={`GH₵${totalPaid.toLocaleString()}`} accentColor={colors.success} />
        <StatCard label="Outstanding" value={`GH₵${totalOwing.toLocaleString()}`} accentColor={colors.danger} />
        <StatCard label="Terms Paid" value={dues.filter((d) => d.status === 'Paid').length} accentColor={colors.primary} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>PTA Dues</Text>
          <Text style={styles.pageSubtitle}>Pay your PTA dues per term</Text>
        </View>
      </View>

      {dues.map((due) => (
        <View key={due.id} style={styles.dueCard}>
          <View style={styles.dueHeader}>
            <Text style={styles.dueTerm}>{due.term}</Text>
            <Text style={[styles.dueBadge, due.status === 'Paid' && styles.dueBadgePaid, due.status === 'Owing' && styles.dueBadgeOwing, due.status === 'Partial' && styles.dueBadgePartial]}>
              {due.status}
            </Text>
          </View>
          <Text style={styles.dueAmount}>Amount: GH₵{due.amount.toLocaleString()}</Text>
          <Text style={styles.duePaid}>Paid: GH₵{due.amountPaid.toLocaleString()}</Text>
          {due.status !== 'Paid' && (
            <Text style={styles.dueRemaining}>Remaining: GH₵{(due.amount - due.amountPaid).toLocaleString()}</Text>
          )}
          <Text style={styles.dueDueDate}>Due: {due.dueDate}</Text>
          {due.paidDate && <Text style={styles.duePaidDate}>Paid on: {due.paidDate} via {due.method}</Text>}

          {due.status !== 'Paid' && (
            <TouchableOpacity style={styles.payBtn} onPress={() => setShowPay(due.id)}>
              <Text style={styles.payBtnText}>Pay Dues</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Modal visible={showPay !== null} animationType="slide" transparent onRequestClose={() => setShowPay(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pay PTA Dues</Text>
            <Text style={styles.modalSubtitle}>Record a dues payment</Text>

            <Text style={styles.inputLabel}>Amount (GH₵)</Text>
            <TextInput style={styles.input} value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} placeholder="e.g. 200" placeholderTextColor={colors.textLight} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.selectRow}>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity key={m} style={[styles.selectChip, form.method === m && styles.selectChipActive]} onPress={() => setForm({ ...form, method: m })}>
                  <Text style={[styles.selectChipText, form.method === m && styles.selectChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.requesterInfo}>Paid by: {parentName}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowPay(null)}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handlePay}>
                <Text style={styles.modalBtnTextLight}>Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Finance Page ──

function FinancePage({ treasurerName }: { treasurerName: string }) {
  const { transactions, budgets, addTransaction, addBudgetCategory, deleteBudgetCategory } = usePTAStore();
  const [subPage, setSubPage] = useState<'ledger' | 'budget'>('ledger');
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [txnForm, setTxnForm] = useState({ type: 'Income' as TransactionType, category: '', description: '', amount: '', date: '', method: PAYMENT_METHODS[0] });
  const [budgetForm, setBudgetForm] = useState({ name: '', allocated: '', term: '2025/2026' });

  const totalIncome = transactions.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  const categories = txnForm.type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleAddTxn = () => {
    if (!txnForm.description.trim() || !txnForm.amount.trim() || !txnForm.date.trim()) {
      Alert.alert('Error', 'Description, amount and date are required');
      return;
    }
    const amount = parseFloat(txnForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }
    if (!txnForm.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    addTransaction({
      type: txnForm.type,
      category: txnForm.category,
      description: txnForm.description.trim(),
      amount,
      date: txnForm.date.trim(),
      method: txnForm.method,
      recordedBy: treasurerName,
    });
    setTxnForm({ type: 'Income', category: '', description: '', amount: '', date: '', method: PAYMENT_METHODS[0] });
    setShowAddTxn(false);
    Alert.alert('Success', 'Transaction recorded');
  };

  const handleAddBudget = () => {
    if (!budgetForm.name.trim()) {
      Alert.alert('Error', 'Budget category name is required');
      return;
    }
    const allocated = parseFloat(budgetForm.allocated);
    if (isNaN(allocated) || allocated <= 0) {
      Alert.alert('Error', 'Invalid allocated amount');
      return;
    }
    addBudgetCategory({
      name: budgetForm.name.trim(),
      allocated,
      term: budgetForm.term,
    });
    setBudgetForm({ name: '', allocated: '', term: '2025/2026' });
    setShowAddBudget(false);
    Alert.alert('Success', 'Budget category added');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Income" value={`GH₵${totalIncome.toLocaleString()}`} accentColor={colors.success} />
        <StatCard label="Total Expenses" value={`GH₵${totalExpense.toLocaleString()}`} accentColor={colors.danger} />
        <StatCard label="Net Balance" value={`GH₵${netBalance.toLocaleString()}`} accentColor={netBalance >= 0 ? colors.primary : colors.danger} />
        <StatCard label="Budget Used" value={`${totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}%`} accentColor={colors.info} />
      </CardGrid>

      <View style={styles.subTabRow}>
        <TouchableOpacity style={[styles.subTab, subPage === 'ledger' && styles.subTabActive]} onPress={() => setSubPage('ledger')}>
          <Text style={[styles.subTabText, subPage === 'ledger' && styles.subTabTextActive]}>Transaction Ledger</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.subTab, subPage === 'budget' && styles.subTabActive]} onPress={() => setSubPage('budget')}>
          <Text style={[styles.subTabText, subPage === 'budget' && styles.subTabTextActive]}>Budget Tracking</Text>
        </TouchableOpacity>
      </View>

      {subPage === 'ledger' && (
        <View>
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Transaction Ledger</Text>
              <Text style={styles.pageSubtitle}>All PTA income and expense records</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddTxn(true)}>
              <Text style={styles.actionBtnText}>+ Add Transaction</Text>
            </TouchableOpacity>
          </View>

          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (i: any) => i.date },
              { key: 'type', label: 'Type', render: (i: any) => i.type },
              { key: 'category', label: 'Category', render: (i: any) => i.category },
              { key: 'description', label: 'Description', render: (i: any) => i.description },
              { key: 'amount', label: 'Amount', render: (i: any) => `${i.type === 'Income' ? '+' : '-'}GH₵${i.amount.toLocaleString()}` },
              { key: 'method', label: 'Method', render: (i: any) => i.method },
            ]}
            data={transactions}
          />
        </View>
      )}

      {subPage === 'budget' && (
        <View>
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Budget Tracking</Text>
              <Text style={styles.pageSubtitle}>Allocated vs spent per category</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddBudget(true)}>
              <Text style={styles.actionBtnText}>+ Add Budget Category</Text>
            </TouchableOpacity>
          </View>

          {budgets.map((b) => {
            const pct = b.allocated > 0 ? Math.min(100, Math.round((b.spent / b.allocated) * 100)) : 0;
            const remaining = b.allocated - b.spent;
            return (
              <View key={b.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetName}>{b.name}</Text>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', `Delete budget "${b.name}"?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteBudgetCategory(b.id) }])}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.budgetTerm}>Term: {b.term}</Text>
                <Text style={styles.budgetAmounts}>Spent: GH₵{b.spent.toLocaleString()} / GH₵{b.allocated.toLocaleString()}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct >= 90 ? colors.danger : pct >= 75 ? colors.warning : colors.success }]} />
                </View>
                <View style={styles.budgetFooter}>
                  <Text style={styles.budgetPct}>{pct}% used</Text>
                  <Text style={[styles.budgetRemaining, remaining < 0 && { color: colors.danger }]}>
                    {remaining >= 0 ? `GH₵${remaining.toLocaleString()} left` : `GH₵${Math.abs(remaining).toLocaleString()} over`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={showAddTxn} animationType="slide" transparent onRequestClose={() => setShowAddTxn(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <Text style={styles.modalSubtitle}>Record an income or expense</Text>

              <Text style={styles.inputLabel}>Transaction Type</Text>
              <View style={styles.selectRow}>
                {TRANSACTION_TYPES.map((t) => (
                  <TouchableOpacity key={t} style={[styles.selectChip, txnForm.type === t && styles.selectChipActive]} onPress={() => setTxnForm({ ...txnForm, type: t, category: '' })}>
                    <Text style={[styles.selectChipText, txnForm.type === t && styles.selectChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.selectRow}>
                {categories.map((c) => (
                  <TouchableOpacity key={c} style={[styles.selectChip, txnForm.category === c && styles.selectChipActive]} onPress={() => setTxnForm({ ...txnForm, category: c })}>
                    <Text style={[styles.selectChipText, txnForm.category === c && styles.selectChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={styles.input} value={txnForm.description} onChangeText={(v) => setTxnForm({ ...txnForm, description: v })} placeholder="e.g. Term 3 dues collection" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Amount (GH₵)</Text>
              <TextInput style={styles.input} value={txnForm.amount} onChangeText={(v) => setTxnForm({ ...txnForm, amount: v })} placeholder="e.g. 500" placeholderTextColor={colors.textLight} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} value={txnForm.date} onChangeText={(v) => setTxnForm({ ...txnForm, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.selectRow}>
                {PAYMENT_METHODS.map((m) => (
                  <TouchableOpacity key={m} style={[styles.selectChip, txnForm.method === m && styles.selectChipActive]} onPress={() => setTxnForm({ ...txnForm, method: m })}>
                    <Text style={[styles.selectChipText, txnForm.method === m && styles.selectChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.requesterInfo}>Recorded by: {treasurerName}</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAddTxn(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAddTxn}>
                  <Text style={styles.modalBtnTextLight}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showAddBudget} animationType="slide" transparent onRequestClose={() => setShowAddBudget(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Budget Category</Text>

            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput style={styles.input} value={budgetForm.name} onChangeText={(v) => setBudgetForm({ ...budgetForm, name: v })} placeholder="e.g. Events & Meetings" placeholderTextColor={colors.textLight} />

            <Text style={styles.inputLabel}>Allocated Amount (GH₵)</Text>
            <TextInput style={styles.input} value={budgetForm.allocated} onChangeText={(v) => setBudgetForm({ ...budgetForm, allocated: v })} placeholder="e.g. 2000" placeholderTextColor={colors.textLight} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Term</Text>
            <TextInput style={styles.input} value={budgetForm.term} onChangeText={(v) => setBudgetForm({ ...budgetForm, term: v })} placeholder="e.g. 2025/2026" placeholderTextColor={colors.textLight} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAddBudget(false)}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAddBudget}>
                <Text style={styles.modalBtnTextLight}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Feedback Page ──

function FeedbackPage() {
  const { feedback, submitFeedback } = usePTAStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '' });

  const handleSubmit = () => {
    if (!form.subject.trim() || !form.body.trim()) {
      Alert.alert('Error', 'Subject and details are required');
      return;
    }
    submitFeedback(form.subject.trim(), form.body.trim());
    setForm({ subject: '', body: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Feedback submitted to Headmaster');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Submissions" value={feedback.length} accentColor={colors.primary} />
        <StatCard label="Acknowledged" value={feedback.filter((f) => f.status === 'Acknowledged' || f.status === 'Actioned').length} accentColor={colors.success} />
        <StatCard label="Pending" value={feedback.filter((f) => f.status === 'Received').length} accentColor={colors.warning} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Feedback / Suggestions</Text>
          <Text style={styles.pageSubtitle}>Your input routed to the Headmaster</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Submit Feedback</Text>
        </TouchableOpacity>
      </View>

      {feedback.map((item) => (
        <View key={item.id} style={styles.feedbackCard}>
          <Text style={styles.feedbackSubject}>{item.subject}</Text>
          <Text style={styles.feedbackBody}>{item.body}</Text>
          <Text style={styles.feedbackMeta}>{item.date} | {item.status}</Text>
          {item.response && (
            <View style={styles.feedbackResponse}>
              <Text style={styles.feedbackResponseLabel}>Response:</Text>
              <Text style={styles.feedbackResponseText}>{item.response}</Text>
            </View>
          )}
        </View>
      ))}

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Submit Feedback</Text>

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput style={styles.input} value={form.subject} onChangeText={(v) => setForm({ ...form, subject: v })} placeholder="Brief subject" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Details</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.body} onChangeText={(v) => setForm({ ...form, body: v })} placeholder="Your feedback or suggestion..." placeholderTextColor={colors.textLight} multiline numberOfLines={4} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleSubmit}>
                  <Text style={styles.modalBtnTextLight}>Submit</Text>
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

function AccessControlPage({ parentName }: { parentName: string }) {
  const { accessRecords, grantAccess } = usePTAStore();
  const [showGrant, setShowGrant] = useState(false);
  const [form, setForm] = useState({ personName: '', role: 'Member' as PTAAccessRole, resource: '', accessLevel: 'Read Only' as string, notes: '' });

  const handleGrant = () => {
    if (!form.personName.trim() || !form.resource) {
      Alert.alert('Error', 'Person name and resource are required');
      return;
    }
    grantAccess({
      personName: form.personName.trim(),
      role: form.role,
      resource: form.resource,
      accessLevel: form.accessLevel as PTAAccessRecord['accessLevel'],
      grantedBy: parentName,
      notes: form.notes.trim() || undefined,
    });
    setForm({ personName: '', role: 'Member', resource: '', accessLevel: 'Read Only', notes: '' });
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
          <Text style={styles.pageSubtitle}>Manage who can access PTA resources</Text>
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
                {PTA_ACCESS_ROLES.map((r) => (
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
                {PTA_ACCESS_LEVELS.map((l) => (
                  <TouchableOpacity key={l} style={[styles.selectChip, form.accessLevel === l && styles.selectChipActive]} onPress={() => setForm({ ...form, accessLevel: l })}>
                    <Text style={[styles.selectChipText, form.accessLevel === l && styles.selectChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Access notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />

              <Text style={styles.requesterInfo}>Granted by: {parentName}</Text>

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

// ── Styles ──

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  wardCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  wardName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  wardDetail: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
  wardStats: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  wardStat: { flex: 1 },
  wardStatLabel: { fontSize: fontSize.xs, color: colors.textLight },
  wardStatValue: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.xs },
  viewReportBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  viewReportText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  announcementCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  announcementTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  announcementBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  announcementFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  announcementDate: { fontSize: fontSize.xs, color: colors.textLight },
  deleteText: { fontSize: fontSize.xs, color: colors.danger, fontWeight: fontWeight.medium },
  fundraisingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  fundraisingTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  fundraisingDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  fundraisingAmount: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  progressBar: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, marginBottom: spacing.xs },
  progressFill: { height: 8, backgroundColor: colors.success, borderRadius: radius.sm },
  fundraisingPct: { fontSize: fontSize.xs, color: colors.success, fontWeight: fontWeight.semibold },
  fundraisingActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  contributeBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  contributeBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  contribList: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  contribTitle: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.xs },
  contribItem: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: 2 },
  meetingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  meetingDate: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  meetingTopic: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.xs },
  meetingLocation: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
  rsvpStatus: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium, marginBottom: spacing.sm },
  rsvpActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rsvpYesBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  rsvpActive: { borderWidth: 2, borderColor: colors.primary },
  rsvpYesText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rsvpNoBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  rsvpNoActive: { borderColor: colors.danger, borderWidth: 2 },
  rsvpNoText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  resetRsvpText: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  feedbackCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  feedbackSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  feedbackBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  feedbackMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm },
  feedbackResponse: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  feedbackResponseLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary, marginBottom: 2 },
  feedbackResponseText: { fontSize: fontSize.sm, color: colors.textSecondary },
  dueCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  dueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  dueTerm: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  dueBadge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  dueBadgePaid: { backgroundColor: colors.success + '20', color: colors.success },
  dueBadgeOwing: { backgroundColor: colors.danger + '20', color: colors.danger },
  dueBadgePartial: { backgroundColor: colors.warning + '20', color: colors.warning },
  dueAmount: { fontSize: fontSize.sm, color: colors.text, marginBottom: 2 },
  duePaid: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  dueRemaining: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium, marginBottom: 2 },
  dueDueDate: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: 2 },
  duePaidDate: { fontSize: fontSize.xs, color: colors.success, marginBottom: spacing.sm },
  payBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  payBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalScroll: { width: '100%', maxHeight: '90%' },
  modalScrollContent: { alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 480, padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  textArea: { minHeight: 80 },
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
  subTabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  subTab: { flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  subTabActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  subTabText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  subTabTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  budgetCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  budgetName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  budgetTerm: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: spacing.xs },
  budgetAmounts: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  budgetPct: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.semibold },
  budgetRemaining: { fontSize: fontSize.xs, color: colors.success, fontWeight: fontWeight.semibold },
});
