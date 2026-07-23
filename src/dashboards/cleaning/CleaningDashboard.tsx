import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, RequisitionModal } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRequisitionStore } from '@store/requisitionStore';
import { useCleaningStore, CLEANING_AREAS } from '@store/cleaningStore';
import { useKitchenStore } from '@store/kitchenStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'roster', label: 'Duty Roster' },
  { key: 'tasks', label: 'Task Checklist' },
  { key: 'supplies', label: 'Supply Inventory' },
  { key: 'requisitions', label: 'Supply Requests' },
  { key: 'staff', label: 'Staff Attendance' },
  { key: 'maintenance', label: 'Maintenance Issues' },
  { key: 'inspection', label: 'Inspection Reports' },
];

const TASK_FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const ISSUE_STATUSES = ['Reported', 'Repair Scheduled', 'Fixed'] as const;
const INSPECTION_RESULTS = ['Passed', 'Needs Attention', 'Failed'] as const;
const STAFF_STATUSES = ['Present', 'Absent', 'On Leave'] as const;
const ROSTER_STATUSES = ['Pending', 'In Progress', 'Completed'] as const;
const SUPPLY_CATEGORIES = ['Disinfectant', 'Cleaning Agent', 'Equipment', 'Hygiene', 'PPE', 'Consumables'];
const SUPPLY_UNITS = ['gallons', 'cartons', 'units', 'pairs', 'rolls', 'packs', 'boxes', 'litres'];

export function CleaningDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showReqModal, setShowReqModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState('All');

  const { logout, user } = useAuthStore();
  const { getByDepartment } = useRequisitionStore();
  const myRequisitions = getByDepartment('Cleaning');
  const reqStatusColor = (s: string) => s === 'Issued' ? colors.success : s === 'Approved' ? colors.info : s === 'Rejected' ? colors.danger : colors.warning;

  const {
    tasks, issues, inspections, staff, supplies, roster,
    addTask, toggleTask, deleteTask,
    addIssue, updateIssueStatus, deleteIssue,
    addInspection, deleteInspection, getComplianceScore,
    toggleCheckIn, updateStaffStatus,
    addSupply, updateSupply, deleteSupply, restockSupply, getLowStockSupplies,
    updateRosterStatus, addRosterEntry, deleteRosterEntry,
  } = useCleaningStore();

  const { getTodayMenu } = useKitchenStore();
  const todayMenu = getTodayMenu();
  const diningHallTasks = tasks.filter(t => t.area === 'Dining Hall');

  // Form state
  const [taskForm, setTaskForm] = useState({ task: '', area: CLEANING_AREAS[0], frequency: 'Daily' as string, assignedTo: '', priority: 'Medium' as string });
  const [issueForm, setIssueForm] = useState({ location: '', issue: '', priority: 'Medium' as string, notes: '' });
  const [inspectionForm, setInspectionForm] = useState({ area: CLEANING_AREAS[0], inspector: '', result: 'Passed' as string, score: '', notes: '' });
  const [supplyForm, setSupplyForm] = useState({ name: '', quantity: '', unit: 'units', reorderLevel: '', category: 'Equipment' });
  const [restockForm, setRestockForm] = useState({ supplyId: '', quantity: '' });
  const [rosterForm, setRosterForm] = useState({ area: CLEANING_AREAS[0], assignedTo: '', frequency: 'Daily', time: '' });

  const openModal = (type: string, id?: string) => { setModalType(type); setEditingId(id || null); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

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

  // ── Handlers ──
  const handleSaveTask = () => {
    if (!taskForm.task.trim() || !taskForm.assignedTo.trim()) { Alert.alert('Error', 'Please enter task and assignee'); return; }
    addTask({ task: taskForm.task.trim(), area: taskForm.area, frequency: taskForm.frequency as any, assignedTo: taskForm.assignedTo.trim(), priority: taskForm.priority as any });
    setTaskForm({ task: '', area: CLEANING_AREAS[0], frequency: 'Daily', assignedTo: '', priority: 'Medium' }); closeModal();
  };

  const handleSaveIssue = () => {
    if (!issueForm.location.trim() || !issueForm.issue.trim()) { Alert.alert('Error', 'Please enter location and issue'); return; }
    addIssue({ location: issueForm.location.trim(), issue: issueForm.issue.trim(), priority: issueForm.priority as any, reportedBy: user?.displayName || 'Cleaning Supervisor', notes: issueForm.notes.trim() });
    setIssueForm({ location: '', issue: '', priority: 'Medium', notes: '' }); closeModal();
  };

  const handleSaveInspection = () => {
    const score = parseInt(inspectionForm.score);
    if (!inspectionForm.inspector.trim() || isNaN(score) || score < 0 || score > 100) { Alert.alert('Error', 'Enter inspector name and valid score (0-100)'); return; }
    addInspection({ date: new Date().toISOString().slice(0, 10), area: inspectionForm.area, inspector: inspectionForm.inspector.trim(), result: inspectionForm.result as any, score, notes: inspectionForm.notes.trim() });
    setInspectionForm({ area: CLEANING_AREAS[0], inspector: '', result: 'Passed', score: '', notes: '' }); closeModal();
  };

  const handleSaveSupply = () => {
    const qty = parseInt(supplyForm.quantity);
    const reorder = parseInt(supplyForm.reorderLevel);
    if (!supplyForm.name.trim() || isNaN(qty) || qty < 0 || isNaN(reorder) || reorder < 0) { Alert.alert('Error', 'Enter valid name, quantity, and reorder level'); return; }
    const item = { name: supplyForm.name.trim(), quantity: qty, unit: supplyForm.unit, reorderLevel: reorder, category: supplyForm.category };
    if (editingId) { updateSupply(editingId, item); } else { addSupply(item); }
    setSupplyForm({ name: '', quantity: '', unit: 'units', reorderLevel: '', category: 'Equipment' }); closeModal();
  };

  const handleRestock = () => {
    const qty = parseInt(restockForm.quantity);
    if (!restockForm.supplyId || isNaN(qty) || qty <= 0) { Alert.alert('Error', 'Enter valid quantity'); return; }
    restockSupply(restockForm.supplyId, qty);
    setRestockForm({ supplyId: '', quantity: '' }); closeModal();
  };

  const handleSaveRoster = () => {
    if (!rosterForm.assignedTo.trim() || !rosterForm.time.trim()) { Alert.alert('Error', 'Enter assignee and time'); return; }
    addRosterEntry({ area: rosterForm.area, assignedTo: rosterForm.assignedTo.trim(), frequency: rosterForm.frequency, time: rosterForm.time.trim() });
    setRosterForm({ area: CLEANING_AREAS[0], assignedTo: '', frequency: 'Daily', time: '' }); closeModal();
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert('Delete', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
    ]);
  };

  const handleDeleteIssue = (id: string) => {
    Alert.alert('Delete', 'Remove this issue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteIssue(id) },
    ]);
  };

  const handleDeleteInspection = (id: string) => {
    Alert.alert('Delete', 'Remove this inspection?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteInspection(id) },
    ]);
  };

  const handleDeleteSupply = (id: string) => {
    Alert.alert('Delete', 'Remove this supply item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSupply(id) },
    ]);
  };

  const handleDeleteRoster = (id: string) => {
    Alert.alert('Delete', 'Remove this roster entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRosterEntry(id) },
    ]);
  };

  // ── Computed values ──
  const todayTasks = tasks.filter(t => t.date === new Date().toISOString().slice(0, 10));
  const completedTasks = todayTasks.filter(t => t.done).length;
  const totalTasks = todayTasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const complianceScore = getComplianceScore();
  const presentStaff = staff.filter(s => s.status === 'Present').length;
  const checkedInStaff = staff.filter(s => s.todayCheckedIn).length;
  const lowStockSupplies = getLowStockSupplies();
  const pendingIssues = issues.filter(i => i.status !== 'Fixed').length;
  const rosterPending = roster.filter(r => r.status === 'Pending').length;
  const rosterInProgress = roster.filter(r => r.status === 'In Progress').length;
  const rosterCompleted = roster.filter(r => r.status === 'Completed').length;
  const pendingReqs = myRequisitions.filter(r => r.status === 'Pending').length;

  const statusColor = (s: string) => s === 'Completed' || s === 'Fixed' || s === 'Passed' ? colors.success : s === 'In Progress' || s === 'Repair Scheduled' || s === 'Needs Attention' ? colors.warning : s === 'Pending' || s === 'Reported' || s === 'Failed' ? colors.danger : colors.info;
  const priorityColor = (p: string) => p === 'High' ? colors.danger : p === 'Medium' ? colors.warning : colors.info;

  const filteredTasks = taskFilter === 'All' ? todayTasks : todayTasks.filter(t => t.area === taskFilter);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Tasks Today" value={`${completedTasks}/${totalTasks}`} subtitle={`${taskCompletionRate}% complete`} accentColor={colors.primary} />
              <StatCard label="Compliance" value={`${complianceScore}%`} subtitle="Inspection avg" accentColor={complianceScore >= 85 ? colors.success : colors.warning} />
              <StatCard label="Staff Present" value={`${presentStaff}/${staff.length}`} subtitle={`${checkedInStaff} checked in`} accentColor={colors.info} />
              <StatCard label="Open Issues" value={pendingIssues} subtitle="Maintenance" accentColor={pendingIssues > 0 ? colors.danger : colors.success} />
              <StatCard label="Low Supplies" value={lowStockSupplies.length} subtitle="Need reorder" accentColor={lowStockSupplies.length > 0 ? colors.warning : colors.success} />
              <StatCard label="Roster Done" value={`${rosterCompleted}/${roster.length}`} subtitle="Duty status" accentColor={colors.accent} />
              <StatCard label="Pending Reqs" value={pendingReqs} subtitle="From Stores" accentColor={pendingReqs > 0 ? colors.warning : colors.info} />
              <StatCard label="Dining Hall" value={`${diningHallTasks.filter(t => t.done).length}/${diningHallTasks.length}`} subtitle="Meal cleanup" accentColor={colors.purple} />
            </CardGrid>

            {lowStockSupplies.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={styles.alertTitle}>⚠ Supply Alert</Text>
                {lowStockSupplies.map((s) => (
                  <Text key={s.id} style={[styles.alertText, { color: colors.warning }]}>LOW: {s.name} — {s.quantity} {s.unit} left (reorder at {s.reorderLevel})</Text>
                ))}
                <TouchableOpacity style={styles.alertBtn} onPress={() => setActivePage('supplies')}>
                  <Text style={styles.alertBtnText}>Go to Supply Inventory →</Text>
                </TouchableOpacity>
              </View>
            )}

            {pendingIssues > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
                <Text style={styles.alertTitle}>⚠ {pendingIssues} Unresolved Maintenance Issue{pendingIssues > 1 ? 's' : ''}</Text>
                <Text style={styles.alertText}>Facility problems need attention. Check Maintenance Issues page.</Text>
                <TouchableOpacity style={styles.alertBtn} onPress={() => setActivePage('maintenance')}>
                  <Text style={styles.alertBtnText}>View Issues →</Text>
                </TouchableOpacity>
              </View>
            )}

            {complianceScore > 0 && complianceScore < 85 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={styles.alertTitle}>⚠ Compliance Below Target</Text>
                <Text style={styles.alertText}>Current inspection average is {complianceScore}%. Target is 85%+.</Text>
              </View>
            )}

            {todayMenu && (
              <View style={styles.kitchenCard}>
                <Text style={styles.kitchenTitle}>🍽️ Kitchen Schedule — Dining Hall Cleaning</Text>
                <Text style={styles.kitchenMeta}>Today's meals: {todayMenu.breakfast} | {todayMenu.lunch} | {todayMenu.dinner}</Text>
                <Text style={styles.kitchenMeta}>Dining hall must be cleaned after each meal ({diningHallTasks.filter(t => t.done).length}/{diningHallTasks.length} done)</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => { setTaskForm({ task: '', area: CLEANING_AREAS[0], frequency: 'Daily', assignedTo: '', priority: 'Medium' }); openModal('task'); }}>
                <Text style={styles.quickBtnText}>+ Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.danger }]} onPress={() => { setIssueForm({ location: '', issue: '', priority: 'Medium', notes: '' }); openModal('issue'); }}>
                <Text style={styles.quickBtnText}>+ Report Issue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => { setInspectionForm({ area: CLEANING_AREAS[0], inspector: '', result: 'Passed', score: '', notes: '' }); openModal('inspection'); }}>
                <Text style={styles.quickBtnText}>+ Log Inspection</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => setShowReqModal(true)}>
                <Text style={styles.quickBtnText}>+ Request Supplies</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'roster':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Duties" value={roster.length} accentColor={colors.primary} />
              <StatCard label="Completed" value={rosterCompleted} accentColor={colors.success} />
              <StatCard label="In Progress" value={rosterInProgress} accentColor={colors.warning} />
              <StatCard label="Pending" value={rosterPending} accentColor={colors.danger} />
            </CardGrid>
            <Text style={styles.pageTitle}>Duty Roster</Text>
            <Text style={styles.pageSubtitle}>Cleaning schedule by area — tap status to cycle</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setRosterForm({ area: CLEANING_AREAS[0], assignedTo: '', frequency: 'Daily', time: '' }); openModal('roster'); }}>
              <Text style={styles.actionBtnText}>+ Add Roster Entry</Text>
            </TouchableOpacity>
            {roster.map((r) => (
              <View key={r.id} style={styles.rosterCard}>
                <View style={styles.rosterHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rosterArea}>{r.area}</Text>
                    <Text style={styles.rosterMeta}>{r.assignedTo} | {r.frequency} | {r.time}</Text>
                  </View>
                  <TouchableOpacity style={[styles.statusBadge, { backgroundColor: statusColor(r.status) + '20' }]} onPress={() => {
                    const idx = ROSTER_STATUSES.indexOf(r.status);
                    updateRosterStatus(r.id, ROSTER_STATUSES[(idx + 1) % ROSTER_STATUSES.length]);
                  }}>
                    <Text style={[styles.statusText, { color: statusColor(r.status) }]}>{r.status}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => handleDeleteRoster(r.id)}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'tasks':
        return (
          <View>
            <CardGrid>
              <StatCard label="Today's Tasks" value={totalTasks} accentColor={colors.primary} />
              <StatCard label="Completed" value={completedTasks} accentColor={colors.success} />
              <StatCard label="Pending" value={totalTasks - completedTasks} accentColor={colors.warning} />
              <StatCard label="Rate" value={`${taskCompletionRate}%`} accentColor={colors.info} />
            </CardGrid>
            <Text style={styles.pageTitle}>Task Checklist</Text>
            <Text style={styles.pageSubtitle}>Tap checkbox to toggle completion — filter by area</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setTaskForm({ task: '', area: CLEANING_AREAS[0], frequency: 'Daily', assignedTo: '', priority: 'Medium' }); openModal('task'); }}>
              <Text style={styles.actionBtnText}>+ Add Task</Text>
            </TouchableOpacity>

            <View style={styles.filterRow}>
              <TouchableOpacity style={[styles.filterChip, taskFilter === 'All' && styles.filterChipActive]} onPress={() => setTaskFilter('All')}>
                <Text style={[styles.filterText, taskFilter === 'All' && styles.filterTextActive]}>All ({totalTasks})</Text>
              </TouchableOpacity>
              {CLEANING_AREAS.filter(a => todayTasks.some(t => t.area === a)).map((area) => (
                <TouchableOpacity key={area} style={[styles.filterChip, taskFilter === area && styles.filterChipActive]} onPress={() => setTaskFilter(area)}>
                  <Text style={[styles.filterText, taskFilter === area && styles.filterTextActive]}>{area}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredTasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks for this filter.</Text>
            ) : (
              filteredTasks.map((item) => (
                <View key={item.id} style={styles.taskCard}>
                  <TouchableOpacity onPress={() => toggleTask(item.id)} style={styles.taskLeft}>
                    <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                      {item.done ? <Text style={styles.checkmark}>✓</Text> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskText, item.done && styles.taskTextDone]}>{item.task}</Text>
                      <Text style={styles.taskMeta}>{item.area} | {item.assignedTo} | {item.frequency}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.taskRight}>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityColor(item.priority) + '20' }]}>
                      <Text style={[styles.priorityText, { color: priorityColor(item.priority) }]}>{item.priority}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      case 'supplies':
        return (
          <View>
            <CardGrid>
              <StatCard label="Supply Items" value={supplies.length} accentColor={colors.primary} />
              <StatCard label="Low Stock" value={lowStockSupplies.length} accentColor={colors.warning} />
              <StatCard label="Categories" value={new Set(supplies.map(s => s.category)).size} accentColor={colors.info} />
              <StatCard label="Pending Reqs" value={pendingReqs} accentColor={colors.accent} />
            </CardGrid>
            <Text style={styles.pageTitle}>Cleaning Supply Inventory</Text>
            <Text style={styles.pageSubtitle}>Track cleaning materials and stock levels</Text>

            {lowStockSupplies.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={styles.alertTitle}>⚠ Low Stock Alert</Text>
                {lowStockSupplies.map((s) => (
                  <Text key={s.id} style={[styles.alertText, { color: s.quantity === 0 ? colors.danger : colors.warning }]}>{s.name}: {s.quantity} {s.unit} {s.quantity === 0 ? '— OUT!' : `(reorder at ${s.reorderLevel})`}</Text>
                ))}
                <TouchableOpacity style={styles.alertBtn} onPress={() => setShowReqModal(true)}>
                  <Text style={styles.alertBtnText}>Request from Stores →</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginBottom: 0 }]} onPress={() => { setSupplyForm({ name: '', quantity: '', unit: 'units', reorderLevel: '', category: 'Equipment' }); openModal('supply'); }}>
                <Text style={styles.actionBtnText}>+ Add Supply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginBottom: 0, backgroundColor: colors.info }]} onPress={() => setShowReqModal(true)}>
                <Text style={styles.actionBtnText}>+ Request from Stores</Text>
              </TouchableOpacity>
            </View>

            {supplies.map((s) => {
              const isLow = s.quantity <= s.reorderLevel;
              const isOut = s.quantity === 0;
              return (
                <View key={s.id} style={styles.supplyCard}>
                  <View style={styles.supplyHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.supplyName}>{s.name}</Text>
                      <Text style={styles.supplyMeta}>{s.category} | {s.quantity} {s.unit} | Reorder at {s.reorderLevel}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isOut ? colors.danger + '20' : isLow ? colors.warning + '20' : colors.success + '20' }]}>
                      <Text style={[styles.statusText, { color: isOut ? colors.danger : isLow ? colors.warning : colors.success }]}>{isOut ? 'Out' : isLow ? 'Low' : 'OK'}</Text>
                    </View>
                  </View>
                  <View style={styles.supplyBarTrack}>
                    <View style={[styles.supplyBarFill, { width: `${Math.min(100, (s.quantity / Math.max(s.reorderLevel * 2, 1)) * 100)}%`, backgroundColor: isOut ? colors.danger : isLow ? colors.warning : colors.success }]} />
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => { setRestockForm({ supplyId: s.id, quantity: '' }); openModal('restock'); }}>
                      <Text style={styles.editLink}>+ Restock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setSupplyForm({ name: s.name, quantity: String(s.quantity), unit: s.unit, reorderLevel: String(s.reorderLevel), category: s.category }); openModal('supply', s.id); }}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteSupply(s.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        );
      case 'requisitions':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Requests" value={myRequisitions.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={pendingReqs} accentColor={colors.warning} />
              <StatCard label="Issued" value={myRequisitions.filter(r => r.status === 'Issued').length} accentColor={colors.success} />
              <StatCard label="Rejected" value={myRequisitions.filter(r => r.status === 'Rejected').length} accentColor={colors.danger} />
            </CardGrid>
            <Text style={styles.pageTitle}>Supply Requests</Text>
            <Text style={styles.pageSubtitle}>Cleaning materials requested from Stores</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReqModal(true)}>
              <Text style={styles.actionBtnText}>+ Request Supplies from Stores</Text>
            </TouchableOpacity>
            {myRequisitions.length === 0 ? (
              <Text style={styles.emptyText}>No supply requests yet. Tap above to request from Stores.</Text>
            ) : (
              myRequisitions.map((req) => (
                <View key={req.id} style={styles.reqCard}>
                  <View style={styles.reqHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reqTitle}>{req.itemName}</Text>
                      <Text style={styles.reqMeta}>{req.date} | {req.quantity} {req.unit} | Priority: {req.priority}</Text>
                      {req.notes ? <Text style={styles.reqNotes}>{req.notes}</Text> : null}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: reqStatusColor(req.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: reqStatusColor(req.status) }]}>{req.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      case 'staff':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Staff" value={staff.length} accentColor={colors.primary} />
              <StatCard label="Present" value={presentStaff} accentColor={colors.success} />
              <StatCard label="Checked In" value={checkedInStaff} accentColor={colors.info} />
              <StatCard label="On Leave" value={staff.filter(s => s.status === 'On Leave').length} accentColor={colors.warning} />
            </CardGrid>
            <Text style={styles.pageTitle}>Cleaning Staff Attendance</Text>
            <Text style={styles.pageSubtitle}>Tap check-in to toggle — tap status to cycle</Text>
            {staff.map((s) => (
              <View key={s.id} style={styles.staffCard}>
                <View style={styles.staffHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.staffName}>{s.name}</Text>
                    <Text style={styles.staffMeta}>{s.role} | {s.area} | {s.phone}</Text>
                  </View>
                  <TouchableOpacity style={[styles.statusBadge, { backgroundColor: statusColor(s.status) + '20' }]} onPress={() => {
                    const idx = STAFF_STATUSES.indexOf(s.status);
                    updateStaffStatus(s.id, STAFF_STATUSES[(idx + 1) % STAFF_STATUSES.length]);
                  }}>
                    <Text style={[styles.statusText, { color: statusColor(s.status) }]}>{s.status}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.checkInBtn, s.todayCheckedIn ? { backgroundColor: colors.success } : { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border }]}
                  onPress={() => toggleCheckIn(s.id)}
                >
                  <Text style={[styles.checkInText, { color: s.todayCheckedIn ? colors.white : colors.textSecondary }]}>
                    {s.todayCheckedIn ? '✓ Checked In' : 'Check In'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      case 'maintenance':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Issues" value={issues.length} accentColor={colors.primary} />
              <StatCard label="Open" value={pendingIssues} accentColor={colors.danger} />
              <StatCard label="Scheduled" value={issues.filter(i => i.status === 'Repair Scheduled').length} accentColor={colors.warning} />
              <StatCard label="Fixed" value={issues.filter(i => i.status === 'Fixed').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Maintenance Issue Log</Text>
            <Text style={styles.pageSubtitle}>Report facility damage or repairs needed</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setIssueForm({ location: '', issue: '', priority: 'Medium', notes: '' }); openModal('issue'); }}>
              <Text style={styles.actionBtnText}>+ Report Issue</Text>
            </TouchableOpacity>
            {issues.length === 0 ? (
              <Text style={styles.emptyText}>No maintenance issues reported.</Text>
            ) : (
              issues.map((iss) => (
                <View key={iss.id} style={styles.issueCard}>
                  <View style={styles.issueHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.issueTitle}>{iss.issue}</Text>
                      <Text style={styles.issueMeta}>{iss.date} | {iss.location} | By: {iss.reportedBy}</Text>
                      {iss.notes ? <Text style={styles.issueNotes}>{iss.notes}</Text> : null}
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityColor(iss.priority) + '20' }]}>
                      <Text style={[styles.priorityText, { color: priorityColor(iss.priority) }]}>{iss.priority}</Text>
                    </View>
                  </View>
                  <View style={styles.issueActions}>
                    <TouchableOpacity
                      style={[styles.statusBadge, { backgroundColor: statusColor(iss.status) + '20' }]}
                      onPress={() => {
                        const idx = ISSUE_STATUSES.indexOf(iss.status);
                        updateIssueStatus(iss.id, ISSUE_STATUSES[(idx + 1) % ISSUE_STATUSES.length]);
                      }}
                    >
                      <Text style={[styles.statusText, { color: statusColor(iss.status) }]}>{iss.status}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteIssue(iss.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      case 'inspection':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Inspections" value={inspections.length} accentColor={colors.primary} />
              <StatCard label="Avg Score" value={`${complianceScore}%`} accentColor={complianceScore >= 85 ? colors.success : colors.warning} />
              <StatCard label="Passed" value={inspections.filter(i => i.result === 'Passed').length} accentColor={colors.success} />
              <StatCard label="Needs Attention" value={inspections.filter(i => i.result === 'Needs Attention').length} accentColor={colors.warning} />
            </CardGrid>
            <Text style={styles.pageTitle}>Inspection Reports</Text>
            <Text style={styles.pageSubtitle}>Log and track cleaning inspection results</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setInspectionForm({ area: CLEANING_AREAS[0], inspector: '', result: 'Passed', score: '', notes: '' }); openModal('inspection'); }}>
              <Text style={styles.actionBtnText}>+ Log Inspection</Text>
            </TouchableOpacity>
            {inspections.length === 0 ? (
              <Text style={styles.emptyText}>No inspections logged yet.</Text>
            ) : (
              inspections.map((insp) => (
                <View key={insp.id} style={styles.inspectionCard}>
                  <View style={styles.inspectionHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inspectionArea}>{insp.area}</Text>
                      <Text style={styles.inspectionMeta}>{insp.date} | Inspector: {insp.inspector} | Score: {insp.score}%</Text>
                      {insp.notes ? <Text style={styles.inspectionNotes}>{insp.notes}</Text> : null}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor(insp.result) + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor(insp.result) }]}>{insp.result}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleDeleteInspection(insp.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Cleaning / Labourers" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
      <RequisitionModal
        visible={showReqModal}
        onClose={() => setShowReqModal(false)}
        department="Cleaning"
        requestedBy={user?.displayName || 'Cleaning Supervisor'}
      />
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: spacing.xl }}>
            {modalType === 'task' && (
              <>
                <Text style={styles.modalTitle}>Add Cleaning Task</Text>
                <Text style={styles.inputLabel}>Task Description</Text>
                <TextInput style={styles.input} value={taskForm.task} onChangeText={(v) => setTaskForm({ ...taskForm, task: v })} placeholder="e.g. Mop dining hall floor" placeholderTextColor={colors.textLight} />
                {renderSelect('Area', taskForm.area, CLEANING_AREAS, (v) => setTaskForm({ ...taskForm, area: v }))}
                {renderSelect('Frequency', taskForm.frequency, TASK_FREQUENCIES, (v) => setTaskForm({ ...taskForm, frequency: v }))}
                <Text style={styles.inputLabel}>Assigned To</Text>
                <TextInput style={styles.input} value={taskForm.assignedTo} onChangeText={(v) => setTaskForm({ ...taskForm, assignedTo: v })} placeholder="e.g. Mr. Kofi" placeholderTextColor={colors.textLight} />
                {renderSelect('Priority', taskForm.priority, PRIORITIES, (v) => setTaskForm({ ...taskForm, priority: v }))}
              </>
            )}
            {modalType === 'issue' && (
              <>
                <Text style={styles.modalTitle}>Report Maintenance Issue</Text>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput style={styles.input} value={issueForm.location} onChangeText={(v) => setIssueForm({ ...issueForm, location: v })} placeholder="e.g. Dorm B toilet" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Issue Description</Text>
                <TextInput style={styles.input} value={issueForm.issue} onChangeText={(v) => setIssueForm({ ...issueForm, issue: v })} placeholder="e.g. Broken pipe" placeholderTextColor={colors.textLight} />
                {renderSelect('Priority', issueForm.priority, PRIORITIES, (v) => setIssueForm({ ...issueForm, priority: v }))}
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput style={[styles.input, styles.textArea]} value={issueForm.notes} onChangeText={(v) => setIssueForm({ ...issueForm, notes: v })} placeholder="Additional details..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
              </>
            )}
            {modalType === 'inspection' && (
              <>
                <Text style={styles.modalTitle}>Log Inspection</Text>
                {renderSelect('Area', inspectionForm.area, CLEANING_AREAS, (v) => setInspectionForm({ ...inspectionForm, area: v }))}
                <Text style={styles.inputLabel}>Inspector Name</Text>
                <TextInput style={styles.input} value={inspectionForm.inspector} onChangeText={(v) => setInspectionForm({ ...inspectionForm, inspector: v })} placeholder="e.g. Mr. Tetteh" placeholderTextColor={colors.textLight} />
                {renderSelect('Result', inspectionForm.result, INSPECTION_RESULTS as readonly string[], (v) => setInspectionForm({ ...inspectionForm, result: v }))}
                <Text style={styles.inputLabel}>Score (0-100)</Text>
                <TextInput style={styles.input} value={inspectionForm.score} onChangeText={(v) => setInspectionForm({ ...inspectionForm, score: v })} placeholder="e.g. 88" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput style={[styles.input, styles.textArea]} value={inspectionForm.notes} onChangeText={(v) => setInspectionForm({ ...inspectionForm, notes: v })} placeholder="Observations..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
              </>
            )}
            {modalType === 'supply' && (
              <>
                <Text style={styles.modalTitle}>{editingId ? 'Edit Supply Item' : 'Add Supply Item'}</Text>
                <Text style={styles.inputLabel}>Supply Name</Text>
                <TextInput style={styles.input} value={supplyForm.name} onChangeText={(v) => setSupplyForm({ ...supplyForm, name: v })} placeholder="e.g. Bleach" placeholderTextColor={colors.textLight} />
                {renderSelect('Category', supplyForm.category, SUPPLY_CATEGORIES, (v) => setSupplyForm({ ...supplyForm, category: v }))}
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput style={styles.input} value={supplyForm.quantity} onChangeText={(v) => setSupplyForm({ ...supplyForm, quantity: v })} placeholder="e.g. 15" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                {renderSelect('Unit', supplyForm.unit, SUPPLY_UNITS, (v) => setSupplyForm({ ...supplyForm, unit: v }))}
                <Text style={styles.inputLabel}>Reorder Level</Text>
                <TextInput style={styles.input} value={supplyForm.reorderLevel} onChangeText={(v) => setSupplyForm({ ...supplyForm, reorderLevel: v })} placeholder="e.g. 8" placeholderTextColor={colors.textLight} keyboardType="numeric" />
              </>
            )}
            {modalType === 'restock' && (
              <>
                <Text style={styles.modalTitle}>Restock Supply</Text>
                {(() => { const si = supplies.find(s => s.id === restockForm.supplyId); return si ? <Text style={styles.inputLabel}>Item: {si.name} (Current: {si.quantity} {si.unit})</Text> : null; })()}
                <Text style={styles.inputLabel}>Quantity to Add</Text>
                <TextInput style={styles.input} value={restockForm.quantity} onChangeText={(v) => setRestockForm({ ...restockForm, quantity: v })} placeholder="e.g. 20" placeholderTextColor={colors.textLight} keyboardType="numeric" />
              </>
            )}
            {modalType === 'roster' && (
              <>
                <Text style={styles.modalTitle}>Add Roster Entry</Text>
                {renderSelect('Area', rosterForm.area, CLEANING_AREAS, (v) => setRosterForm({ ...rosterForm, area: v }))}
                <Text style={styles.inputLabel}>Assigned To</Text>
                <TextInput style={styles.input} value={rosterForm.assignedTo} onChangeText={(v) => setRosterForm({ ...rosterForm, assignedTo: v })} placeholder="e.g. Mr. Kofi + 2" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Frequency</Text>
                <TextInput style={styles.input} value={rosterForm.frequency} onChangeText={(v) => setRosterForm({ ...rosterForm, frequency: v })} placeholder="e.g. Daily" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput style={styles.input} value={rosterForm.time} onChangeText={(v) => setRosterForm({ ...rosterForm, time: v })} placeholder="e.g. 06:00 - 07:00" placeholderTextColor={colors.textLight} />
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
                switch (modalType) {
                  case 'task': handleSaveTask(); break;
                  case 'issue': handleSaveIssue(); break;
                  case 'inspection': handleSaveInspection(); break;
                  case 'supply': handleSaveSupply(); break;
                  case 'restock': handleRestock(); break;
                  case 'roster': handleSaveRoster(); break;
                }
              }}>
                <Text style={styles.modalBtnTextLight}>{editingId ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },

  // Alerts
  alertCard: { backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.warning },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.warning, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  alertBtn: { marginTop: spacing.xs },
  alertBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },

  // Kitchen integration card
  kitchenCard: { backgroundColor: colors.purpleBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.purple },
  kitchenTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.purple, marginBottom: spacing.xs },
  kitchenMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },

  // Quick actions
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  // Roster
  rosterCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  rosterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rosterArea: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  rosterMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  // Tasks
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  filterChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: fontSize.xs, color: colors.textSecondary },
  filterTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  taskCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.border, marginRight: spacing.md, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  taskText: { fontSize: fontSize.md, color: colors.text },
  taskTextDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  taskMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  priorityBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  priorityText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  // Supplies
  supplyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  supplyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  supplyName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  supplyMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  supplyBarTrack: { height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, marginTop: spacing.sm, marginBottom: spacing.sm },
  supplyBarFill: { height: 6, borderRadius: 3 },

  // Staff
  staffCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  staffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  staffName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  staffMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  checkInBtn: { marginTop: spacing.sm, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' },
  checkInText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  // Issues
  issueCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  issueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  issueTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  issueMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  issueNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  issueActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },

  // Inspections
  inspectionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  inspectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  inspectionArea: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  inspectionMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  inspectionNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },

  // Card actions (shared)
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  editLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary },
  deleteLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.danger },

  // Requisitions (existing)
  reqCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reqTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  reqMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reqNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500 },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  selectChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectChipText: { fontSize: fontSize.xs, color: colors.textSecondary },
  selectChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
});
