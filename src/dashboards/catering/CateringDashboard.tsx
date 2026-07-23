import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, RequisitionModal } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRequisitionStore } from '@store/requisitionStore';
import { useKitchenStore } from '@store/kitchenStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'menu', label: 'Menu Planner' },
  { key: 'customMenu', label: 'Special Diet Menus' },
  { key: 'stock', label: 'Kitchen Stock & Issuing' },
  { key: 'requisition', label: 'Food Stock Requisition' },
  { key: 'finance', label: 'Financial Request' },
  { key: 'headcount', label: 'Meal Headcount' },
  { key: 'staff', label: 'Kitchen Staff Roster' },
  { key: 'hygiene', label: 'Hygiene Inspection Log' },
  { key: 'cost', label: 'Food Cost Estimator' },
];

interface MenuDay { id: string; day: string; breakfast: string; lunch: string; dinner: string; }
interface HeadcountEntry { id: string; date: string; breakfast: number; lunch: number; dinner: number; }
interface StaffMember { id: string; name: string; role: string; shift: string; status: 'Active' | 'On Leave' | 'Sick'; phone: string; attendance: { present: number; total: number }; }
interface InspectionRecord { id: string; date: string; area: string; inspector: string; result: 'Passed' | 'Action Needed' | 'Failed'; score: number; notes: string; }
interface CostEstimate { id: string; meal: string; servings: number; costPerServing: number; totalCost: number; date: string; }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHIFTS = ['Morning', 'Afternoon', 'Evening', 'Full day'];
const ROLES = ['Head Cook', 'Cook', 'Kitchen Help', 'Server', 'Cleaner'];
const INSPECTION_AREAS = ['Main Kitchen', 'Store room', 'Dining hall', 'Pantry', 'Prep area', 'Wash area'];

let idCounter = 100;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

const INITIAL_MENU: MenuDay[] = [
  { id: '1', day: 'Monday', breakfast: 'Porridge + bread', lunch: 'Jollof rice + chicken', dinner: 'Banku + tilapia' },
  { id: '2', day: 'Tuesday', breakfast: 'Tea + eggs', lunch: 'Fufu + goat soup', dinner: 'Rice + stew' },
  { id: '3', day: 'Wednesday', breakfast: 'Hausa koko + koko bread', lunch: 'Kenkey + fried fish', dinner: 'Yam + garden egg stew' },
  { id: '4', day: 'Thursday', breakfast: 'Tea + bread', lunch: 'Waakye + egg', dinner: 'Tuo zaafi + ayoyo' },
  { id: '5', day: 'Friday', breakfast: 'Porridge + bread', lunch: 'Plain rice + chicken stew', dinner: 'Konkonte + groundnut soup' },
];

const INITIAL_HEADCOUNT: HeadcountEntry[] = [
  { id: '1', date: '2026-07-06', breakfast: 832, lunch: 838, dinner: 825 },
  { id: '2', date: '2026-07-05', breakfast: 830, lunch: 835, dinner: 820 },
  { id: '3', date: '2026-07-04', breakfast: 828, lunch: 833, dinner: 818 },
  { id: '4', date: '2026-07-03', breakfast: 825, lunch: 830, dinner: 815 },
];

const INITIAL_STAFF: StaffMember[] = [
  { id: '1', name: 'Madam Akos', role: 'Head Cook', shift: 'Full day', status: 'Active', phone: '024 111 2222', attendance: { present: 22, total: 24 } },
  { id: '2', name: 'Mr. Kofi', role: 'Cook', shift: 'Morning', status: 'Active', phone: '020 333 4444', attendance: { present: 20, total: 24 } },
  { id: '3', name: 'Ms. Esi', role: 'Kitchen Help', shift: 'Evening', status: 'Active', phone: '027 555 6666', attendance: { present: 21, total: 24 } },
  { id: '4', name: 'Mr. Yaw', role: 'Cook', shift: 'Full day', status: 'On Leave', phone: '023 777 8888', attendance: { present: 15, total: 24 } },
];

const INITIAL_INSPECTIONS: InspectionRecord[] = [
  { id: '1', date: '2026-07-01', area: 'Main Kitchen', inspector: 'Mrs. Adjei', result: 'Passed', score: 95, notes: 'Clean, well organized' },
  { id: '2', date: '2026-06-28', area: 'Store room', inspector: 'Mr. Tetteh', result: 'Action Needed', score: 72, notes: 'Reorganize dry goods, check expiry dates' },
  { id: '3', date: '2026-06-15', area: 'Dining hall', inspector: 'Mrs. Adjei', result: 'Passed', score: 90, notes: 'Good condition' },
];

const INITIAL_COSTS: CostEstimate[] = [
  { id: '1', meal: 'Jollof rice + chicken', servings: 838, costPerServing: 8.5, totalCost: 7123, date: '2026-07-06' },
  { id: '2', meal: 'Fufu + goat soup', servings: 835, costPerServing: 12.0, totalCost: 10020, date: '2026-07-05' },
  { id: '3', meal: 'Waakye + egg', servings: 833, costPerServing: 6.5, totalCost: 5415, date: '2026-07-04' },
];

const MENU_TEMPLATES: Record<string, Omit<MenuDay, 'id'>> = {
  'Local Delights': { day: '', breakfast: 'Hausa koko + bread', lunch: 'Jollof rice + chicken', dinner: 'Banku + tilapia' },
  'Continental Mix': { day: '', breakfast: 'Tea + eggs + sausages', lunch: 'Fried rice + salad', dinner: 'Spaghetti + sauce' },
  'Budget Saver': { day: '', breakfast: 'Porridge + bread', lunch: 'Waakye + egg', dinner: 'Konkonte + groundnut soup' },
};

export function CateringDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showReqModal, setShowReqModal] = useState(false);
  const { logout, user } = useAuthStore();
  const { getByDepartment } = useRequisitionStore();
  const myRequisitions = getByDepartment('Kitchen');
  const reqStatusColor = (s: string) => s === 'Issued' ? colors.success : s === 'Approved' ? colors.info : s === 'Rejected' ? colors.danger : colors.warning;

  const [menu, setMenu] = useState<MenuDay[]>(INITIAL_MENU);
  const [headcount, setHeadcount] = useState<HeadcountEntry[]>(INITIAL_HEADCOUNT);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [inspections, setInspections] = useState<InspectionRecord[]>(INITIAL_INSPECTIONS);
  const [costs, setCosts] = useState<CostEstimate[]>(INITIAL_COSTS);

  const {
    stock: kitchenStock, issues: kitchenIssues, customMenus, financialReqs,
    addStockItem, updateStockItem, deleteStockItem, restockItem, issueItem,
    getLowStock, getOutOfStock,
    addCustomMenu, updateCustomMenu, deleteCustomMenu, toggleCustomMenu,
    submitFinancialReq, deleteFinancialReq,
  } = useKitchenStore();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [menuForm, setMenuForm] = useState({ day: DAYS[0], breakfast: '', lunch: '', dinner: '' });
  const [headcountForm, setHeadcountForm] = useState({ date: todayISO(), breakfast: '', lunch: '', dinner: '' });
  const [staffForm, setStaffForm] = useState({ name: '', role: ROLES[0], shift: SHIFTS[0], phone: '' });
  const [inspectionForm, setInspectionForm] = useState({ area: INSPECTION_AREAS[0], inspector: '', score: '', result: 'Passed' as 'Passed' | 'Action Needed' | 'Failed', notes: '' });
  const [costForm, setCostForm] = useState({ meal: '', servings: '', costPerServing: '' });
  const [stockForm, setStockForm] = useState({ name: '', quantity: '', unit: 'bags', reorderLevel: '', category: 'Grains' });
  const [issueForm, setIssueForm] = useState({ itemName: '', quantity: '', unit: 'bags', issuedTo: 'Kitchen - Breakfast', purpose: '' });
  const [restockForm, setRestockForm] = useState({ itemId: '', quantity: '' });
  const [customMenuForm, setCustomMenuForm] = useState({ personName: '', personRole: 'Student', reason: '', day: DAYS[0], breakfast: '', lunch: '', dinner: '' });
  const [financeForm, setFinanceForm] = useState({ amount: '', purpose: '', notes: '' });

  const openModal = (type: string, id?: string) => { setModalType(type); setEditingId(id || null); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

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

  const handleSaveMenu = () => {
    if (!menuForm.breakfast.trim() && !menuForm.lunch.trim() && !menuForm.dinner.trim()) {
      Alert.alert('Error', 'Please enter at least one meal'); return;
    }
    if (editingId) {
      setMenu(menu.map(m => m.id === editingId ? { ...m, ...menuForm } : m));
    } else {
      setMenu([...menu, { id: nextId(), ...menuForm }]);
    }
    setMenuForm({ day: DAYS[0], breakfast: '', lunch: '', dinner: '' }); closeModal();
  };

  const handleDeleteMenu = (id: string) => {
    Alert.alert('Delete', 'Remove this menu day?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setMenu(menu.filter(m => m.id !== id)) },
    ]);
  };

  const applyTemplate = (templateName: string) => {
    const tpl = MENU_TEMPLATES[templateName];
    if (!tpl) return;
    const usedDays = new Set(menu.map(m => m.day));
    const nextDay = DAYS.find(d => !usedDays.has(d));
    if (!nextDay) { Alert.alert('Info', 'All days already have menus. Delete one first.'); return; }
    setMenu([...menu, { id: nextId(), day: nextDay, breakfast: tpl.breakfast, lunch: tpl.lunch, dinner: tpl.dinner }]);
    Alert.alert('Template Applied', `${templateName} added for ${nextDay}.`);
  };

  const handleSaveHeadcount = () => {
    const b = parseInt(headcountForm.breakfast) || 0;
    const l = parseInt(headcountForm.lunch) || 0;
    const d = parseInt(headcountForm.dinner) || 0;
    if (b === 0 && l === 0 && d === 0) { Alert.alert('Error', 'Enter at least one count'); return; }
    if (editingId) {
      setHeadcount(headcount.map(h => h.id === editingId ? { ...h, date: headcountForm.date, breakfast: b, lunch: l, dinner: d } : h));
    } else {
      setHeadcount([{ id: nextId(), date: headcountForm.date, breakfast: b, lunch: l, dinner: d }, ...headcount]);
    }
    setHeadcountForm({ date: todayISO(), breakfast: '', lunch: '', dinner: '' }); closeModal();
  };

  const handleDeleteHeadcount = (id: string) => {
    Alert.alert('Delete', 'Remove this headcount entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setHeadcount(headcount.filter(h => h.id !== id)) },
    ]);
  };

  const handleSaveStaff = () => {
    if (!staffForm.name.trim()) { Alert.alert('Error', 'Please enter staff name'); return; }
    if (editingId) {
      setStaff(staff.map(s => s.id === editingId ? { ...s, name: staffForm.name.trim(), role: staffForm.role, shift: staffForm.shift, phone: staffForm.phone.trim() } : s));
    } else {
      setStaff([...staff, { id: nextId(), name: staffForm.name.trim(), role: staffForm.role, shift: staffForm.shift, status: 'Active', phone: staffForm.phone.trim(), attendance: { present: 0, total: 0 } }]);
    }
    setStaffForm({ name: '', role: ROLES[0], shift: SHIFTS[0], phone: '' }); closeModal();
  };

  const toggleStaffStatus = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'On Leave' : s.status === 'On Leave' ? 'Sick' : 'Active' } : s));
  };

  const markAttendance = (id: string, present: boolean) => {
    setStaff(staff.map(s => {
      if (s.id !== id) return s;
      const newTotal = s.attendance.total + 1;
      const newPresent = s.attendance.present + (present ? 1 : 0);
      return { ...s, attendance: { present: newPresent, total: newTotal } };
    }));
  };

  const handleDeleteStaff = (id: string) => {
    Alert.alert('Delete', 'Remove this staff member?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setStaff(staff.filter(s => s.id !== id)) },
    ]);
  };

  const handleSaveInspection = () => {
    const score = parseInt(inspectionForm.score);
    if (isNaN(score) || score < 0 || score > 100) { Alert.alert('Error', 'Enter a valid score (0-100)'); return; }
    const result = score >= 85 ? 'Passed' : score >= 60 ? 'Action Needed' : 'Failed';
    if (editingId) {
      setInspections(inspections.map(i => i.id === editingId ? { ...i, area: inspectionForm.area, inspector: inspectionForm.inspector.trim(), score, result, notes: inspectionForm.notes.trim() } : i));
    } else {
      setInspections([{ id: nextId(), date: todayISO(), area: inspectionForm.area, inspector: inspectionForm.inspector.trim() || 'Unknown', score, result, notes: inspectionForm.notes.trim() }, ...inspections]);
    }
    setInspectionForm({ area: INSPECTION_AREAS[0], inspector: '', score: '', result: 'Passed', notes: '' }); closeModal();
  };

  const handleDeleteInspection = (id: string) => {
    Alert.alert('Delete', 'Delete this inspection record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setInspections(inspections.filter(i => i.id !== id)) },
    ]);
  };

  const handleSaveCost = () => {
    const servings = parseInt(costForm.servings);
    const costPerServing = parseFloat(costForm.costPerServing);
    if (!costForm.meal.trim() || isNaN(servings) || servings <= 0 || isNaN(costPerServing) || costPerServing <= 0) {
      Alert.alert('Error', 'Please enter meal name, servings, and cost per serving'); return;
    }
    const totalCost = Math.round(servings * costPerServing);
    if (editingId) {
      setCosts(costs.map(c => c.id === editingId ? { ...c, meal: costForm.meal.trim(), servings, costPerServing, totalCost } : c));
    } else {
      setCosts([{ id: nextId(), meal: costForm.meal.trim(), servings, costPerServing, totalCost, date: todayISO() }, ...costs]);
    }
    setCostForm({ meal: '', servings: '', costPerServing: '' }); closeModal();
  };

  const handleDeleteCost = (id: string) => {
    Alert.alert('Delete', 'Delete this cost estimate?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setCosts(costs.filter(c => c.id !== id)) },
    ]);
  };

  // ── Kitchen Stock handlers ──
  const STOCK_CATEGORIES = ['Grains', 'Cooking', 'Produce', 'Protein', 'Condiments', 'Fuel', 'Other'];
  const STOCK_UNITS = ['bags', 'gallons', 'crates', 'sacks', 'cartons', 'boxes', 'loads', 'kg', 'litres'];
  const ISSUE_TARGETS = ['Kitchen - Breakfast', 'Kitchen - Lunch', 'Kitchen - Dinner', 'Kitchen - General', 'Store room'];

  const handleSaveStock = () => {
    const qty = parseInt(stockForm.quantity);
    const reorder = parseInt(stockForm.reorderLevel);
    if (!stockForm.name.trim() || isNaN(qty) || qty < 0 || isNaN(reorder) || reorder < 0) {
      Alert.alert('Error', 'Please enter valid name, quantity, and reorder level'); return;
    }
    const item = { name: stockForm.name.trim(), quantity: qty, unit: stockForm.unit, reorderLevel: reorder, category: stockForm.category };
    if (editingId) {
      updateStockItem(editingId, item);
    } else {
      addStockItem(item);
    }
    setStockForm({ name: '', quantity: '', unit: 'bags', reorderLevel: '', category: 'Grains' }); closeModal();
  };

  const handleDeleteStock = (id: string) => {
    Alert.alert('Delete', 'Remove this stock item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteStockItem(id) },
    ]);
  };

  const handleIssue = () => {
    const qty = parseInt(issueForm.quantity);
    if (!issueForm.itemName || isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Select an item and enter a valid quantity'); return;
    }
    const item = kitchenStock.find(s => s.name === issueForm.itemName);
    if (!item || qty > item.quantity) {
      Alert.alert('Error', 'Insufficient stock for this issue'); return;
    }
    issueItem(issueForm.itemName, qty, issueForm.unit, issueForm.issuedTo, issueForm.purpose.trim());
    setIssueForm({ itemName: '', quantity: '', unit: 'bags', issuedTo: 'Kitchen - Breakfast', purpose: '' }); closeModal();
  };

  const handleRestock = () => {
    const qty = parseInt(restockForm.quantity);
    if (!restockForm.itemId || isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Enter a valid restock quantity'); return;
    }
    restockItem(restockForm.itemId, qty);
    setRestockForm({ itemId: '', quantity: '' }); closeModal();
  };

  // ── Custom Menu handlers ──
  const PERSON_ROLES = ['Student', 'Teacher', 'Staff', 'Headmaster', 'Visitor', 'Medical'];

  const handleSaveCustomMenu = () => {
    if (!customMenuForm.personName.trim() || !customMenuForm.reason.trim()) {
      Alert.alert('Error', 'Please enter person name and dietary reason'); return;
    }
    const menu = {
      personName: customMenuForm.personName.trim(),
      personRole: customMenuForm.personRole,
      reason: customMenuForm.reason.trim(),
      day: customMenuForm.day,
      breakfast: customMenuForm.breakfast.trim(),
      lunch: customMenuForm.lunch.trim(),
      dinner: customMenuForm.dinner.trim(),
      active: true,
    };
    if (editingId) {
      updateCustomMenu(editingId, menu);
    } else {
      addCustomMenu(menu);
    }
    setCustomMenuForm({ personName: '', personRole: 'Student', reason: '', day: DAYS[0], breakfast: '', lunch: '', dinner: '' }); closeModal();
  };

  const handleDeleteCustomMenu = (id: string) => {
    Alert.alert('Delete', 'Remove this special diet menu?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCustomMenu(id) },
    ]);
  };

  // ── Financial Requisition handlers ──
  const handleSaveFinance = () => {
    const amount = parseFloat(financeForm.amount);
    if (isNaN(amount) || amount <= 0 || !financeForm.purpose.trim()) {
      Alert.alert('Error', 'Please enter a valid amount and purpose'); return;
    }
    submitFinancialReq({
      amount,
      purpose: financeForm.purpose.trim(),
      requestedBy: user?.displayName || 'Catering Officer',
      notes: financeForm.notes.trim(),
    });
    setFinanceForm({ amount: '', purpose: '', notes: '' }); closeModal();
  };

  const handleDeleteFinance = (id: string) => {
    Alert.alert('Delete', 'Delete this financial request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFinancialReq(id) },
    ]);
  };

  const finStatusColor = (s: string) => s === 'Disbursed' ? colors.success : s === 'Approved' ? colors.info : s === 'Rejected' ? colors.danger : colors.warning;

  const latestHeadcount = headcount[0];
  const avgHeadcount = headcount.length > 0
    ? Math.round(headcount.reduce((s, h) => s + h.breakfast + h.lunch + h.dinner, 0) / headcount.length)
    : 0;
  const activeStaff = staff.filter(s => s.status === 'Active').length;
  const complianceScore = inspections.length > 0
    ? Math.round(inspections.reduce((s, i) => s + i.score, 0) / inspections.length)
    : 0;
  const totalMealCost = costs.reduce((s, c) => s + c.totalCost, 0);
  const avgCostPerServing = costs.length > 0
    ? (costs.reduce((s, c) => s + c.costPerServing, 0) / costs.length).toFixed(2)
    : '0.00';
  const pendingReqs = myRequisitions.filter(r => r.status === 'Pending').length;
  const lowStockItems = getLowStock();
  const outOfStockItems = getOutOfStock();
  const pendingFinReqs = financialReqs.filter(r => r.status === 'Pending').length;
  const totalFinRequested = financialReqs.filter(r => r.status === 'Pending').reduce((s, r) => s + r.amount, 0);
  const totalFinDisbursed = financialReqs.filter(r => r.status === 'Disbursed').reduce((s, r) => s + r.amount, 0);
  const activeCustomMenus = customMenus.filter(c => c.active).length;
  const inspectionResultColor = (r: string) => r === 'Passed' ? colors.success : r === 'Action Needed' ? colors.warning : colors.danger;
  const staffStatusColor = (s: string) => s === 'Active' ? colors.success : s === 'On Leave' ? colors.warning : colors.danger;

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Today's Meals" value={latestHeadcount ? latestHeadcount.breakfast + latestHeadcount.lunch + latestHeadcount.dinner : 0} subtitle="Total fed today" accentColor={colors.primary} />
              <StatCard label="Avg Daily" value={avgHeadcount} subtitle="Across all days" accentColor={colors.info} />
              <StatCard label="Active Staff" value={activeStaff} subtitle={`${staff.length} total`} accentColor={colors.success} />
              <StatCard label="Hygiene Score" value={`${complianceScore}%`} subtitle={complianceScore >= 85 ? 'Compliant' : 'Needs attention'} accentColor={complianceScore >= 85 ? colors.success : colors.warning} />
            </CardGrid>
            <CardGrid>
              <StatCard label="Pending Reqs" value={pendingReqs} subtitle="To Stores" accentColor={colors.warning} />
              <StatCard label="Meal Cost" value={`GH₵${avgCostPerServing}`} subtitle="Per serving avg" accentColor={colors.accent} />
              <StatCard label="Menu Days" value={menu.length} subtitle="Planned" accentColor={colors.primary} />
              <StatCard label="Inspections" value={inspections.length} subtitle="Logged" accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.pageTitle}>Kitchen Overview</Text>
            <Text style={styles.pageSubtitle}>Quick snapshot of catering operations</Text>

            <Text style={styles.sectionTitle}>Recent Headcount</Text>
            {headcount.slice(0, 3).map((h) => (
              <View key={h.id} style={styles.miniCard}>
                <Text style={styles.miniDate}>{h.date}</Text>
                <View style={styles.miniStats}>
                  <Text style={styles.miniStat}>B: {h.breakfast}</Text>
                  <Text style={styles.miniStat}>L: {h.lunch}</Text>
                  <Text style={styles.miniStat}>D: {h.dinner}</Text>
                </View>
              </View>
            ))}

            {complianceScore < 85 && (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>⚠ Hygiene Compliance Alert</Text>
                <Text style={styles.alertText}>Current compliance score is {complianceScore}%. Target is 85%+. Schedule an inspection.</Text>
              </View>
            )}
            {pendingReqs > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={styles.alertTitle}>📦 {pendingReqs} Pending Requisition{pendingReqs > 1 ? 's' : ''}</Text>
                <Text style={styles.alertText}>Awaiting Stores approval. Check the Requisition page for details.</Text>
              </View>
            )}
            {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
              <View style={[styles.alertCard, { borderLeftColor: outOfStockItems.length > 0 ? colors.danger : colors.warning }]}>
                <Text style={styles.alertTitle}>⚠ Kitchen Stock Alert</Text>
                {outOfStockItems.length > 0 && <Text style={[styles.alertText, { color: colors.danger, fontWeight: fontWeight.semibold }]}>{outOfStockItems.length} item(s) OUT OF STOCK — requisition urgently!</Text>}
                {lowStockItems.length > 0 && <Text style={[styles.alertText, { color: colors.warning }]}>{lowStockItems.length} item(s) running low — check Kitchen Stock page.</Text>}
              </View>
            )}
            {pendingFinReqs > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.info }]}>
                <Text style={styles.alertTitle}>💰 {pendingFinReqs} Pending Financial Request{pendingFinReqs > 1 ? 's' : ''}</Text>
                <Text style={styles.alertText}>GH₵{totalFinRequested.toLocaleString()} awaiting Bursar approval.</Text>
              </View>
            )}
          </View>
        );
      case 'menu':
        return (
          <View>
            <CardGrid>
              <StatCard label="Days Planned" value={menu.length} accentColor={colors.primary} />
              <StatCard label="Meals Entered" value={menu.filter(m => m.breakfast || m.lunch || m.dinner).length * 3} accentColor={colors.info} />
              <StatCard label="Missing Days" value={DAYS.filter(d => !menu.find(m => m.day === d)).length} accentColor={colors.warning} />
            </CardGrid>
            <Text style={styles.pageTitle}>Menu Planner</Text>
            <Text style={styles.pageSubtitle}>Plan weekly meals — add, edit, or apply templates</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setMenuForm({ day: DAYS.find(d => !menu.find(m => m.day === d)) || DAYS[0], breakfast: '', lunch: '', dinner: '' }); openModal('menu'); }}>
              <Text style={styles.actionBtnText}>+ Add Menu Day</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Quick Templates</Text>
            <View style={styles.selectRow}>
              {Object.keys(MENU_TEMPLATES).map((name) => (
                <TouchableOpacity key={name} style={styles.templateChip} onPress={() => applyTemplate(name)}>
                  <Text style={styles.templateChipText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {menu.map((item) => (
              <View key={item.id} style={styles.menuCard}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuDay}>{item.day}</Text>
                  <View style={styles.menuActions}>
                    <TouchableOpacity onPress={() => { setMenuForm({ day: item.day, breakfast: item.breakfast, lunch: item.lunch, dinner: item.dinner }); openModal('menu', item.id); }}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteMenu(item.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.menuMeal}>🌅 Breakfast: {item.breakfast || '—'}</Text>
                <Text style={styles.menuMeal}>☀ Lunch: {item.lunch || '—'}</Text>
                <Text style={styles.menuMeal}>🌙 Dinner: {item.dinner || '—'}</Text>
              </View>
            ))}
          </View>
        );
      case 'requisition':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Requests" value={myRequisitions.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={myRequisitions.filter(r => r.status === 'Pending').length} accentColor={colors.warning} />
              <StatCard label="Issued" value={myRequisitions.filter(r => r.status === 'Issued').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Food Stock Requisition</Text>
            <Text style={styles.pageSubtitle}>Request food items from Stores — track status here</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReqModal(true)}>
              <Text style={styles.actionBtnText}>+ New Requisition to Stores</Text>
            </TouchableOpacity>
            {myRequisitions.length === 0 ? (
              <Text style={styles.emptyText}>No requisitions yet. Tap above to request items from Stores.</Text>
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
      case 'headcount':
        return (
          <View>
            <CardGrid>
              <StatCard label="Today Total" value={latestHeadcount ? latestHeadcount.breakfast + latestHeadcount.lunch + latestHeadcount.dinner : 0} accentColor={colors.primary} />
              <StatCard label="Avg Daily" value={avgHeadcount} accentColor={colors.info} />
              <StatCard label="Trend" value={headcount.length >= 2 ? (headcount[0].breakfast + headcount[0].lunch + headcount[0].dinner) > (headcount[1].breakfast + headcount[1].lunch + headcount[1].dinner) ? '↑ Up' : '↓ Down' : '—'} accentColor={colors.accent} />
              <StatCard label="Days Logged" value={headcount.length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Meal Headcount</Text>
            <Text style={styles.pageSubtitle}>Log daily numbers fed — track trends and plan portions</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setHeadcountForm({ date: todayISO(), breakfast: '', lunch: '', dinner: '' }); openModal('headcount'); }}>
              <Text style={styles.actionBtnText}>+ Log Daily Headcount</Text>
            </TouchableOpacity>
            {headcount.map((h) => {
              const total = h.breakfast + h.lunch + h.dinner;
              return (
                <View key={h.id} style={styles.hcCard}>
                  <View style={styles.hcHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hcDate}>{h.date}</Text>
                      <Text style={styles.hcTotal}>{total} meals served</Text>
                    </View>
                    <View style={styles.menuActions}>
                      <TouchableOpacity onPress={() => { setHeadcountForm({ date: h.date, breakfast: String(h.breakfast), lunch: String(h.lunch), dinner: String(h.dinner) }); openModal('headcount', h.id); }}>
                        <Text style={styles.editLink}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteHeadcount(h.id)}>
                        <Text style={styles.deleteLink}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.hcBars}>
                    <View style={styles.hcBarRow}>
                      <Text style={styles.hcBarLabel}>Breakfast</Text>
                      <View style={styles.hcBarTrack}>
                        <View style={[styles.hcBarFill, { width: `${Math.min(100, (h.breakfast / Math.max(h.breakfast, h.lunch, h.dinner, 1)) * 100)}%`, backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={styles.hcBarValue}>{h.breakfast}</Text>
                    </View>
                    <View style={styles.hcBarRow}>
                      <Text style={styles.hcBarLabel}>Lunch</Text>
                      <View style={styles.hcBarTrack}>
                        <View style={[styles.hcBarFill, { width: `${Math.min(100, (h.lunch / Math.max(h.breakfast, h.lunch, h.dinner, 1)) * 100)}%`, backgroundColor: colors.success }]} />
                      </View>
                      <Text style={styles.hcBarValue}>{h.lunch}</Text>
                    </View>
                    <View style={styles.hcBarRow}>
                      <Text style={styles.hcBarLabel}>Dinner</Text>
                      <View style={styles.hcBarTrack}>
                        <View style={[styles.hcBarFill, { width: `${Math.min(100, (h.dinner / Math.max(h.breakfast, h.lunch, h.dinner, 1)) * 100)}%`, backgroundColor: colors.info }]} />
                      </View>
                      <Text style={styles.hcBarValue}>{h.dinner}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        );
      case 'staff':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Staff" value={staff.length} accentColor={colors.primary} />
              <StatCard label="Active" value={activeStaff} accentColor={colors.success} />
              <StatCard label="On Leave" value={staff.filter(s => s.status === 'On Leave').length} accentColor={colors.warning} />
              <StatCard label="Avg Attendance" value={`${staff.filter(s => s.attendance.total > 0).length > 0 ? Math.round(staff.filter(s => s.attendance.total > 0).reduce((sum, s) => sum + (s.attendance.present / s.attendance.total * 100), 0) / staff.filter(s => s.attendance.total > 0).length) : 0}%`} accentColor={colors.info} />
            </CardGrid>
            <Text style={styles.pageTitle}>Kitchen Staff Roster</Text>
            <Text style={styles.pageSubtitle}>Manage staff, track attendance, and update status</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setStaffForm({ name: '', role: ROLES[0], shift: SHIFTS[0], phone: '' }); openModal('staff'); }}>
              <Text style={styles.actionBtnText}>+ Add Staff Member</Text>
            </TouchableOpacity>
            {staff.map((s) => (
              <View key={s.id} style={styles.staffCard}>
                <View style={styles.staffHeader}>
                  <View style={[styles.staffAvatar, { backgroundColor: staffStatusColor(s.status) }]}>
                    <Text style={styles.staffAvatarText}>{s.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.staffName}>{s.name}</Text>
                    <Text style={styles.staffMeta}>{s.role} | {s.shift} | {s.phone || 'No phone'}</Text>
                    {s.attendance.total > 0 && (
                      <Text style={styles.staffAttendance}>Attendance: {s.attendance.present}/{s.attendance.total} ({Math.round(s.attendance.present / s.attendance.total * 100)}%)</Text>
                    )}
                  </View>
                  <TouchableOpacity style={[styles.statusPill, { borderColor: staffStatusColor(s.status) }]} onPress={() => toggleStaffStatus(s.id)}>
                    <Text style={[styles.statusPillText, { color: staffStatusColor(s.status) }]}>{s.status}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.staffActions}>
                  <TouchableOpacity style={styles.attendanceBtn} onPress={() => markAttendance(s.id, true)}>
                    <Text style={styles.attendanceBtnText}>✓ Present</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.attendanceBtn, { borderColor: colors.danger }]} onPress={() => markAttendance(s.id, false)}>
                    <Text style={[styles.attendanceBtnText, { color: colors.danger }]}>✗ Absent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setStaffForm({ name: s.name, role: s.role, shift: s.shift, phone: s.phone }); openModal('staff', s.id); }}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteStaff(s.id)}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'hygiene':
        return (
          <View>
            <CardGrid>
              <StatCard label="Compliance" value={`${complianceScore}%`} accentColor={complianceScore >= 85 ? colors.success : colors.warning} />
              <StatCard label="Inspections" value={inspections.length} accentColor={colors.primary} />
              <StatCard label="Passed" value={inspections.filter(i => i.result === 'Passed').length} accentColor={colors.success} />
              <StatCard label="Action Needed" value={inspections.filter(i => i.result === 'Action Needed' || i.result === 'Failed').length} accentColor={colors.danger} />
            </CardGrid>
            <Text style={styles.pageTitle}>Hygiene Inspection Log</Text>
            <Text style={styles.pageSubtitle}>Log inspections — compliance score auto-calculated from scores</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setInspectionForm({ area: INSPECTION_AREAS[0], inspector: '', score: '', result: 'Passed', notes: '' }); openModal('inspection'); }}>
              <Text style={styles.actionBtnText}>+ Log Inspection</Text>
            </TouchableOpacity>
            <View style={styles.complianceBar}>
              <View style={styles.complianceBarTrack}>
                <View style={[styles.complianceBarFill, { width: `${complianceScore}%`, backgroundColor: complianceScore >= 85 ? colors.success : complianceScore >= 60 ? colors.warning : colors.danger }]} />
              </View>
              <Text style={styles.complianceBarLabel}>{complianceScore}% compliance</Text>
            </View>
            {inspections.map((item) => (
              <View key={item.id} style={styles.inspCard}>
                <View style={styles.inspHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inspArea}>{item.area}</Text>
                    <Text style={styles.inspMeta}>{item.date} | Inspector: {item.inspector}</Text>
                    {item.notes ? <Text style={styles.inspNotes}>{item.notes}</Text> : null}
                  </View>
                  <View style={styles.inspRight}>
                    <Text style={styles.inspScore}>{item.score}/100</Text>
                    <View style={[styles.statusBadge, { backgroundColor: inspectionResultColor(item.result) + '20' }]}>
                      <Text style={[styles.statusText, { color: inspectionResultColor(item.result) }]}>{item.result}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.menuActions}>
                  <TouchableOpacity onPress={() => { setInspectionForm({ area: item.area, inspector: item.inspector, score: String(item.score), result: item.result, notes: item.notes }); openModal('inspection', item.id); }}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteInspection(item.id)}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'cost':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Cost" value={`GH₵${totalMealCost.toLocaleString()}`} accentColor={colors.primary} />
              <StatCard label="Avg/Serving" value={`GH₵${avgCostPerServing}`} accentColor={colors.info} />
              <StatCard label="Meals Costed" value={costs.length} accentColor={colors.accent} />
              <StatCard label="Total Servings" value={costs.reduce((s, c) => s + c.servings, 0).toLocaleString()} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Food Cost Estimator</Text>
            <Text style={styles.pageSubtitle}>Estimate meal costs — plan budget per serving and per day</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setCostForm({ meal: '', servings: '', costPerServing: '' }); openModal('cost'); }}>
              <Text style={styles.actionBtnText}>+ Add Cost Estimate</Text>
            </TouchableOpacity>
            {costs.map((c) => (
              <View key={c.id} style={styles.costCard}>
                <View style={styles.costHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.costMeal}>{c.meal}</Text>
                    <Text style={styles.costMeta}>{c.date} | {c.servings} servings | GH₵{c.costPerServing.toFixed(2)}/serving</Text>
                  </View>
                  <Text style={styles.costTotal}>GH₵{c.totalCost.toLocaleString()}</Text>
                </View>
                <View style={styles.menuActions}>
                  <TouchableOpacity onPress={() => { setCostForm({ meal: c.meal, servings: String(c.servings), costPerServing: String(c.costPerServing) }); openModal('cost', c.id); }}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteCost(c.id)}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'customMenu':
        return (
          <View>
            <CardGrid>
              <StatCard label="Active Diets" value={activeCustomMenus} accentColor={colors.purple} />
              <StatCard label="Total Custom" value={customMenus.length} accentColor={colors.info} />
              <StatCard label="Students" value={customMenus.filter(c => c.personRole === 'Student').length} accentColor={colors.primary} />
              <StatCard label="Staff" value={customMenus.filter(c => c.personRole === 'Teacher' || c.personRole === 'Staff').length} accentColor={colors.accent} />
            </CardGrid>
            <Text style={styles.pageTitle}>Special Diet Menus</Text>
            <Text style={styles.pageSubtitle}>Create custom menus for individuals with dietary needs — they will see these on their dashboard</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setCustomMenuForm({ personName: '', personRole: 'Student', reason: '', day: DAYS[0], breakfast: '', lunch: '', dinner: '' }); openModal('customMenu'); }}>
              <Text style={styles.actionBtnText}>+ Add Special Diet</Text>
            </TouchableOpacity>
            {customMenus.length === 0 ? (
              <Text style={styles.emptyText}>No special diet menus yet. Add one for students or staff with dietary needs.</Text>
            ) : (
              customMenus.map((c) => (
                <View key={c.id} style={[styles.menuCard, !c.active && { opacity: 0.5 }]}>
                  <View style={styles.menuHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuDay}>{c.personName}</Text>
                      <Text style={styles.staffMeta}>{c.personRole} | {c.day} | Reason: {c.reason}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: c.active ? colors.purple + '20' : colors.textLight + '20' }]}>
                      <Text style={[styles.statusText, { color: c.active ? colors.purple : colors.textLight }]}>{c.active ? 'Active' : 'Inactive'}</Text>
                    </View>
                  </View>
                  <Text style={styles.menuMeal}>🌅 Breakfast: {c.breakfast || '—'}</Text>
                  <Text style={styles.menuMeal}>☀ Lunch: {c.lunch || '—'}</Text>
                  <Text style={styles.menuMeal}>🌙 Dinner: {c.dinner || '—'}</Text>
                  <View style={styles.menuActions}>
                    <TouchableOpacity onPress={() => toggleCustomMenu(c.id)}>
                      <Text style={styles.editLink}>{c.active ? 'Deactivate' : 'Activate'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setCustomMenuForm({ personName: c.personName, personRole: c.personRole, reason: c.reason, day: c.day, breakfast: c.breakfast, lunch: c.lunch, dinner: c.dinner }); openModal('customMenu', c.id); }}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCustomMenu(c.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      case 'stock':
        return (
          <View>
            <CardGrid>
              <StatCard label="Stock Items" value={kitchenStock.length} accentColor={colors.primary} />
              <StatCard label="Low Stock" value={lowStockItems.length} accentColor={colors.warning} />
              <StatCard label="Out of Stock" value={outOfStockItems.length} accentColor={colors.danger} />
              <StatCard label="Issues Logged" value={kitchenIssues.length} accentColor={colors.info} />
            </CardGrid>
            <Text style={styles.pageTitle}>Kitchen Stock & Issuing</Text>
            <Text style={styles.pageSubtitle}>Track kitchen inventory, issue items for meal prep, and monitor stock alerts</Text>

            {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>⚠ Stock Alerts</Text>
                {outOfStockItems.map((s) => (
                  <Text key={s.id} style={[styles.alertText, { color: colors.danger, fontWeight: fontWeight.semibold }]}>OUT OF STOCK: {s.name} — make a requisition now!</Text>
                ))}
                {lowStockItems.map((s) => (
                  <Text key={s.id} style={[styles.alertText, { color: colors.warning }]}>LOW: {s.name} — {s.quantity} {s.unit} left (reorder at {s.reorderLevel})</Text>
                ))}
              </View>
            )}

            <View style={styles.stockActions}>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginBottom: 0 }]} onPress={() => { setStockForm({ name: '', quantity: '', unit: 'bags', reorderLevel: '', category: 'Grains' }); openModal('stock'); }}>
                <Text style={styles.actionBtnText}>+ Add Stock Item</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginBottom: 0, backgroundColor: colors.info }]} onPress={() => { setIssueForm({ itemName: kitchenStock[0]?.name || '', quantity: '', unit: kitchenStock[0]?.unit || 'bags', issuedTo: 'Kitchen - Breakfast', purpose: '' }); openModal('issue'); }}>
                <Text style={styles.actionBtnText}>↗ Issue Item</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Kitchen Stock</Text>
            {kitchenStock.map((s) => {
              const isOut = s.quantity === 0;
              const isLow = s.quantity > 0 && s.quantity <= s.reorderLevel;
              return (
                <View key={s.id} style={styles.stockCard}>
                  <View style={styles.stockHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stockName}>{s.name}</Text>
                      <Text style={styles.stockMeta}>{s.category} | {s.quantity} {s.unit} | Reorder at {s.reorderLevel}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isOut ? colors.danger + '20' : isLow ? colors.warning + '20' : colors.success + '20' }]}>
                      <Text style={[styles.statusText, { color: isOut ? colors.danger : isLow ? colors.warning : colors.success }]}>{isOut ? 'Out' : isLow ? 'Low' : 'OK'}</Text>
                    </View>
                  </View>
                  <View style={styles.stockBarTrack}>
                    <View style={[styles.stockBarFill, { width: `${Math.min(100, (s.quantity / Math.max(s.reorderLevel * 2, 1)) * 100)}%`, backgroundColor: isOut ? colors.danger : isLow ? colors.warning : colors.success }]} />
                  </View>
                  <View style={styles.menuActions}>
                    <TouchableOpacity onPress={() => { setRestockForm({ itemId: s.id, quantity: '' }); openModal('restock'); }}>
                      <Text style={styles.editLink}>+ Restock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setStockForm({ name: s.name, quantity: String(s.quantity), unit: s.unit, reorderLevel: String(s.reorderLevel), category: s.category }); openModal('stock', s.id); }}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteStock(s.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>Recent Issues</Text>
            {kitchenIssues.map((iss) => (
              <View key={iss.id} style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.issueName}>{iss.itemName}</Text>
                    <Text style={styles.issueMeta}>{iss.date} | {iss.quantity} {iss.unit} → {iss.issuedTo}</Text>
                    {iss.purpose ? <Text style={styles.issuePurpose}>{iss.purpose}</Text> : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'finance':
        return (
          <View>
            <CardGrid>
              <StatCard label="Pending" value={pendingFinReqs} subtitle="Awaiting approval" accentColor={colors.warning} />
              <StatCard label="Requested" value={`GH₵${totalFinRequested.toLocaleString()}`} subtitle="Total pending" accentColor={colors.primary} />
              <StatCard label="Disbursed" value={`GH₵${totalFinDisbursed.toLocaleString()}`} subtitle="Total received" accentColor={colors.success} />
              <StatCard label="Total Reqs" value={financialReqs.length} accentColor={colors.info} />
            </CardGrid>
            <Text style={styles.pageTitle}>Financial Request to Bursar</Text>
            <Text style={styles.pageSubtitle}>Request money from the Bursary for food purchases and kitchen operations</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setFinanceForm({ amount: '', purpose: '', notes: '' }); openModal('finance'); }}>
              <Text style={styles.actionBtnText}>+ Request Money from Bursar</Text>
            </TouchableOpacity>
            {financialReqs.length === 0 ? (
              <Text style={styles.emptyText}>No financial requests yet. Tap above to request funds from the Bursar.</Text>
            ) : (
              financialReqs.map((r) => (
                <View key={r.id} style={styles.finCard}>
                  <View style={styles.finHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.finAmount}>GH₵{r.amount.toLocaleString()}</Text>
                      <Text style={styles.finMeta}>{r.date} | {r.purpose}</Text>
                      <Text style={styles.finBy}>Requested by: {r.requestedBy}</Text>
                      {r.notes ? <Text style={styles.reqNotes}>{r.notes}</Text> : null}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: finStatusColor(r.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: finStatusColor(r.status) }]}>{r.status}</Text>
                    </View>
                  </View>
                  <View style={styles.menuActions}>
                    <TouchableOpacity onPress={() => handleDeleteFinance(r.id)}>
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
    <DashboardLayout
      title="Catering / Kitchen"
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
      <RequisitionModal
        visible={showReqModal}
        onClose={() => setShowReqModal(false)}
        department="Kitchen"
        requestedBy={user?.displayName || 'Catering Officer'}
      />
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {modalType === 'menu' && (
                <>
                  <Text style={styles.modalTitle}>{editingId ? 'Edit Menu Day' : 'Add Menu Day'}</Text>
                  {renderSelect('Day', menuForm.day, DAYS.filter(d => !menu.find(m => m.day === d) || d === menuForm.day), (v) => setMenuForm({ ...menuForm, day: v }))}
                  <Text style={styles.inputLabel}>Breakfast</Text>
                  <TextInput style={styles.input} value={menuForm.breakfast} onChangeText={(v) => setMenuForm({ ...menuForm, breakfast: v })} placeholder="e.g. Porridge + bread" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Lunch</Text>
                  <TextInput style={styles.input} value={menuForm.lunch} onChangeText={(v) => setMenuForm({ ...menuForm, lunch: v })} placeholder="e.g. Jollof rice + chicken" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Dinner</Text>
                  <TextInput style={styles.input} value={menuForm.dinner} onChangeText={(v) => setMenuForm({ ...menuForm, dinner: v })} placeholder="e.g. Banku + tilapia" placeholderTextColor={colors.textLight} />
                </>
              )}
              {modalType === 'headcount' && (
                <>
                  <Text style={styles.modalTitle}>{editingId ? 'Edit Headcount' : 'Log Daily Headcount'}</Text>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput style={styles.input} value={headcountForm.date} onChangeText={(v) => setHeadcountForm({ ...headcountForm, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Breakfast Count</Text>
                  <TextInput style={styles.input} value={headcountForm.breakfast} onChangeText={(v) => setHeadcountForm({ ...headcountForm, breakfast: v })} placeholder="e.g. 832" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Lunch Count</Text>
                  <TextInput style={styles.input} value={headcountForm.lunch} onChangeText={(v) => setHeadcountForm({ ...headcountForm, lunch: v })} placeholder="e.g. 838" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Dinner Count</Text>
                  <TextInput style={styles.input} value={headcountForm.dinner} onChangeText={(v) => setHeadcountForm({ ...headcountForm, dinner: v })} placeholder="e.g. 825" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                </>
              )}
              {modalType === 'staff' && (
                <>
                  <Text style={styles.modalTitle}>{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</Text>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput style={styles.input} value={staffForm.name} onChangeText={(v) => setStaffForm({ ...staffForm, name: v })} placeholder="e.g. Madam Akos" placeholderTextColor={colors.textLight} />
                  {renderSelect('Role', staffForm.role, ROLES, (v) => setStaffForm({ ...staffForm, role: v }))}
                  {renderSelect('Shift', staffForm.shift, SHIFTS, (v) => setStaffForm({ ...staffForm, shift: v }))}
                  <Text style={styles.inputLabel}>Phone (optional)</Text>
                  <TextInput style={styles.input} value={staffForm.phone} onChangeText={(v) => setStaffForm({ ...staffForm, phone: v })} placeholder="e.g. 024 111 2222" placeholderTextColor={colors.textLight} keyboardType="phone-pad" />
                </>
              )}
              {modalType === 'inspection' && (
                <>
                  <Text style={styles.modalTitle}>{editingId ? 'Edit Inspection' : 'Log Inspection'}</Text>
                  {renderSelect('Area', inspectionForm.area, INSPECTION_AREAS, (v) => setInspectionForm({ ...inspectionForm, area: v }))}
                  <Text style={styles.inputLabel}>Inspector Name</Text>
                  <TextInput style={styles.input} value={inspectionForm.inspector} onChangeText={(v) => setInspectionForm({ ...inspectionForm, inspector: v })} placeholder="e.g. Mrs. Adjei" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Score (0-100) — result auto-calculated</Text>
                  <TextInput style={styles.input} value={inspectionForm.score} onChangeText={(v) => setInspectionForm({ ...inspectionForm, score: v })} placeholder="e.g. 95" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={inspectionForm.notes} onChangeText={(v) => setInspectionForm({ ...inspectionForm, notes: v })} placeholder="Observations and action items..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
                </>
              )}
              {modalType === 'cost' && (
                <>
                  <Text style={styles.modalTitle}>{editingId ? 'Edit Cost Estimate' : 'Add Cost Estimate'}</Text>
                  <Text style={styles.inputLabel}>Meal Name</Text>
                  <TextInput style={styles.input} value={costForm.meal} onChangeText={(v) => setCostForm({ ...costForm, meal: v })} placeholder="e.g. Jollof rice + chicken" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Servings</Text>
                  <TextInput style={styles.input} value={costForm.servings} onChangeText={(v) => setCostForm({ ...costForm, servings: v })} placeholder="e.g. 838" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Cost Per Serving (GH₵)</Text>
                  <TextInput style={styles.input} value={costForm.costPerServing} onChangeText={(v) => setCostForm({ ...costForm, costPerServing: v })} placeholder="e.g. 8.50" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  {costForm.servings && costForm.costPerServing ? (
                    <Text style={styles.costPreview}>Total: GH₵{(parseInt(costForm.servings) * parseFloat(costForm.costPerServing)).toLocaleString()}</Text>
                  ) : null}
                </>
              )}
              {modalType === 'stock' && (
                <>
                  <Text style={styles.modalTitle}>{editingId ? 'Edit Stock Item' : 'Add Stock Item'}</Text>
                  <Text style={styles.inputLabel}>Item Name</Text>
                  <TextInput style={styles.input} value={stockForm.name} onChangeText={(v) => setStockForm({ ...stockForm, name: v })} placeholder="e.g. Maize bags" placeholderTextColor={colors.textLight} />
                  {renderSelect('Category', stockForm.category, STOCK_CATEGORIES, (v) => setStockForm({ ...stockForm, category: v }))}
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput style={styles.input} value={stockForm.quantity} onChangeText={(v) => setStockForm({ ...stockForm, quantity: v })} placeholder="e.g. 80" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  {renderSelect('Unit', stockForm.unit, STOCK_UNITS, (v) => setStockForm({ ...stockForm, unit: v }))}
                  <Text style={styles.inputLabel}>Reorder Level</Text>
                  <TextInput style={styles.input} value={stockForm.reorderLevel} onChangeText={(v) => setStockForm({ ...stockForm, reorderLevel: v })} placeholder="e.g. 30" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                </>
              )}
              {modalType === 'issue' && (
                <>
                  <Text style={styles.modalTitle}>Issue Item for Meal Prep</Text>
                  {renderSelect('Item', issueForm.itemName, kitchenStock.map(s => s.name), (v) => { const item = kitchenStock.find(s => s.name === v); setIssueForm({ ...issueForm, itemName: v, unit: item?.unit || issueForm.unit }); })}
                  <Text style={styles.inputLabel}>Quantity to Issue</Text>
                  <TextInput style={styles.input} value={issueForm.quantity} onChangeText={(v) => setIssueForm({ ...issueForm, quantity: v })} placeholder="e.g. 10" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  {renderSelect('Unit', issueForm.unit, STOCK_UNITS, (v) => setIssueForm({ ...issueForm, unit: v }))}
                  {renderSelect('Issue To', issueForm.issuedTo, ISSUE_TARGETS, (v) => setIssueForm({ ...issueForm, issuedTo: v }))}
                  <Text style={styles.inputLabel}>Purpose (optional)</Text>
                  <TextInput style={styles.input} value={issueForm.purpose} onChangeText={(v) => setIssueForm({ ...issueForm, purpose: v })} placeholder="e.g. Porridge preparation" placeholderTextColor={colors.textLight} />
                  {issueForm.itemName && (() => { const si = kitchenStock.find(s => s.name === issueForm.itemName); return si ? <Text style={styles.costPreview}>Available: {si.quantity} {si.unit}</Text> : null; })()}
                </>
              )}
              {modalType === 'restock' && (
                <>
                  <Text style={styles.modalTitle}>Restock Item</Text>
                  {(() => { const si = kitchenStock.find(s => s.id === restockForm.itemId); return si ? <Text style={styles.inputLabel}>Item: {si.name} (Current: {si.quantity} {si.unit})</Text> : null; })()}
                  <Text style={styles.inputLabel}>Quantity to Add</Text>
                  <TextInput style={styles.input} value={restockForm.quantity} onChangeText={(v) => setRestockForm({ ...restockForm, quantity: v })} placeholder="e.g. 50" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                </>
              )}
              {modalType === 'customMenu' && (
                <>
                  <Text style={styles.modalTitle}>{editingId ? 'Edit Special Diet' : 'Add Special Diet Menu'}</Text>
                  <Text style={styles.inputLabel}>Person Name</Text>
                  <TextInput style={styles.input} value={customMenuForm.personName} onChangeText={(v) => setCustomMenuForm({ ...customMenuForm, personName: v })} placeholder="e.g. Kwame Asante" placeholderTextColor={colors.textLight} />
                  {renderSelect('Role', customMenuForm.personRole, PERSON_ROLES, (v) => setCustomMenuForm({ ...customMenuForm, personRole: v }))}
                  <Text style={styles.inputLabel}>Dietary Reason</Text>
                  <TextInput style={styles.input} value={customMenuForm.reason} onChangeText={(v) => setCustomMenuForm({ ...customMenuForm, reason: v })} placeholder="e.g. Lactose intolerant, Diabetic, Vegetarian" placeholderTextColor={colors.textLight} />
                  {renderSelect('Day', customMenuForm.day, DAYS, (v) => setCustomMenuForm({ ...customMenuForm, day: v }))}
                  <Text style={styles.inputLabel}>Breakfast</Text>
                  <TextInput style={styles.input} value={customMenuForm.breakfast} onChangeText={(v) => setCustomMenuForm({ ...customMenuForm, breakfast: v })} placeholder="Special breakfast" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Lunch</Text>
                  <TextInput style={styles.input} value={customMenuForm.lunch} onChangeText={(v) => setCustomMenuForm({ ...customMenuForm, lunch: v })} placeholder="Special lunch" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Dinner</Text>
                  <TextInput style={styles.input} value={customMenuForm.dinner} onChangeText={(v) => setCustomMenuForm({ ...customMenuForm, dinner: v })} placeholder="Special dinner" placeholderTextColor={colors.textLight} />
                </>
              )}
              {modalType === 'finance' && (
                <>
                  <Text style={styles.modalTitle}>Request Money from Bursar</Text>
                  <Text style={styles.inputLabel}>Amount (GH₵)</Text>
                  <TextInput style={styles.input} value={financeForm.amount} onChangeText={(v) => setFinanceForm({ ...financeForm, amount: v })} placeholder="e.g. 5000" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Purpose</Text>
                  <TextInput style={styles.input} value={financeForm.purpose} onChangeText={(v) => setFinanceForm({ ...financeForm, purpose: v })} placeholder="e.g. Weekly foodstuff purchase" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Notes (optional)</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={financeForm.notes} onChangeText={(v) => setFinanceForm({ ...financeForm, notes: v })} placeholder="Additional details for the Bursar..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
                </>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
                  switch (modalType) {
                    case 'menu': handleSaveMenu(); break;
                    case 'headcount': handleSaveHeadcount(); break;
                    case 'staff': handleSaveStaff(); break;
                    case 'inspection': handleSaveInspection(); break;
                    case 'cost': handleSaveCost(); break;
                    case 'stock': handleSaveStock(); break;
                    case 'issue': handleIssue(); break;
                    case 'restock': handleRestock(); break;
                    case 'customMenu': handleSaveCustomMenu(); break;
                    case 'finance': handleSaveFinance(); break;
                  }
                }}>
                  <Text style={styles.modalBtnTextLight}>{editingId ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
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
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  menuCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  menuDay: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  menuMeal: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs },
  menuActions: { flexDirection: 'row', gap: spacing.md },
  editLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  deleteLink: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.semibold },
  templateChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border },
  templateChipText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  hcCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  hcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  hcDate: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  hcTotal: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  hcBars: { gap: spacing.sm },
  hcBarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hcBarLabel: { fontSize: fontSize.xs, color: colors.textSecondary, width: 70 },
  hcBarTrack: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' as const },
  hcBarFill: { height: 8, borderRadius: 4 },
  hcBarValue: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.text, minWidth: 40, textAlign: 'right' },
  staffCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  staffHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  staffAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  staffAvatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.white },
  staffName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  staffMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  staffAttendance: { fontSize: fontSize.xs, color: colors.info, marginTop: spacing.xs },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5 },
  statusPillText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  staffActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  attendanceBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.success },
  attendanceBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.success },
  inspCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  inspHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  inspArea: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  inspMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  inspNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  inspRight: { alignItems: 'flex-end' },
  inspScore: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  complianceBar: { marginBottom: spacing.lg },
  complianceBarTrack: { height: 12, backgroundColor: colors.surfaceAlt, borderRadius: 6, overflow: 'hidden' as const, marginBottom: spacing.xs },
  complianceBarFill: { height: 12, borderRadius: 6 },
  complianceBarLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  costCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  costHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costMeal: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  costMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  costTotal: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  costPreview: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.success, marginTop: spacing.sm },
  miniCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniDate: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  miniStats: { flexDirection: 'row', gap: spacing.md },
  miniStat: { fontSize: fontSize.sm, color: colors.textSecondary },
  alertCard: { backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.danger },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.danger, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  reqCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reqTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  reqMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reqNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalScroll: { width: '100%', maxHeight: '90%' },
  modalScrollContent: { alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 480, padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  textArea: { minHeight: 60 },
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
  stockActions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  stockCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  stockName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  stockMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  stockBarTrack: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' as const, marginBottom: spacing.sm },
  stockBarFill: { height: 8, borderRadius: 4 },
  issueCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  issueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  issueName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  issueMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  issuePurpose: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic' as const, marginTop: 2 },
  finCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  finHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  finAmount: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  finMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  finBy: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
});
