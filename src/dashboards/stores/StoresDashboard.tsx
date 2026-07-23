import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRequisitionStore, Requisition } from '@store/requisitionStore';
import { useKitchenStore } from '@store/kitchenStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'inventory', label: 'Stock Inventory' },
  { key: 'received', label: 'Goods Received' },
  { key: 'requisition', label: 'Requisitions' },
  { key: 'kitchenIssues', label: 'Kitchen Issues' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'audit', label: 'Stock Audit' },
  { key: 'alerts', label: 'Low-Stock Alerts' },
];

interface InventoryItem { id: string; name: string; category: string; quantity: number; unit: string; reorderLevel: number; unitCost: number; }
interface ReceivedLog { id: string; date: string; itemName: string; quantity: number; unit: string; supplier: string; invoiceNo: string; }
interface Supplier { id: string; name: string; phone: string; items: string; rating: number; }
interface AuditRecord { id: string; date: string; itemsCounted: number; discrepancies: number; status: 'In Progress' | 'Completed'; notes: string; }

const CATEGORIES = ['Foodstuff', 'Cleaning', 'Stationery', 'Medical', 'Fuel', 'Maintenance', 'Other'];
const UNITS = ['bags', 'cartons', 'gallons', 'boxes', 'units', 'litres', 'kg', 'rolls'];

let idCounter = 100;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Maize bags', category: 'Foodstuff', quantity: 120, unit: 'bags', reorderLevel: 50, unitCost: 180 },
  { id: '2', name: 'Cooking oil', category: 'Foodstuff', quantity: 15, unit: 'gallons', reorderLevel: 20, unitCost: 350 },
  { id: '3', name: 'Cleaning detergent', category: 'Cleaning', quantity: 8, unit: 'cartons', reorderLevel: 10, unitCost: 120 },
  { id: '4', name: 'Toilet roll', category: 'Cleaning', quantity: 65, unit: 'cartons', reorderLevel: 30, unitCost: 85 },
  { id: '5', name: 'Rice', category: 'Foodstuff', quantity: 45, unit: 'bags', reorderLevel: 25, unitCost: 220 },
  { id: '6', name: 'Chalk', category: 'Stationery', quantity: 12, unit: 'boxes', reorderLevel: 15, unitCost: 25 },
  { id: '7', name: 'First aid supplies', category: 'Medical', quantity: 12, unit: 'units', reorderLevel: 25, unitCost: 45 },
  { id: '8', name: 'Diesel', category: 'Fuel', quantity: 200, unit: 'litres', reorderLevel: 100, unitCost: 15 },
  { id: '9', name: 'Exercise books', category: 'Stationery', quantity: 500, unit: 'units', reorderLevel: 200, unitCost: 3 },
  { id: '10', name: 'Brooms', category: 'Cleaning', quantity: 5, unit: 'units', reorderLevel: 12, unitCost: 18 },
];

const INITIAL_RECEIVED: ReceivedLog[] = [
  { id: '1', date: '2026-07-06', itemName: 'Maize bags', quantity: 50, unit: 'bags', supplier: 'Kumasi Grains Ltd', invoiceNo: 'INV-2401' },
  { id: '2', date: '2026-07-03', itemName: 'Toilet roll', quantity: 20, unit: 'cartons', supplier: 'Hygiene Co.', invoiceNo: 'INV-2398' },
  { id: '3', date: '2026-06-28', itemName: 'Rice', quantity: 30, unit: 'bags', supplier: 'Tamale Farms', invoiceNo: 'INV-2385' },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Kumasi Grains Ltd', phone: '024 111 2222', items: 'Maize, Rice, Beans', rating: 5 },
  { id: '2', name: 'Hygiene Co.', phone: '020 333 4444', items: 'Detergent, Toilet roll, Brooms', rating: 4 },
  { id: '3', name: 'Tamale Farms', phone: '027 555 6666', items: 'Rice, Maize', rating: 4 },
  { id: '4', name: 'MediSupply Ghana', phone: '023 777 8888', items: 'First aid, Medical supplies', rating: 5 },
  { id: '5', name: 'Stationery Hub', phone: '024 999 0000', items: 'Chalk, Exercise books, Pens', rating: 3 },
];

const INITIAL_AUDITS: AuditRecord[] = [
  { id: '1', date: '2026-06-30', itemsCounted: 342, discrepancies: 3, status: 'Completed', notes: '2 items over-counted, 1 under-counted. Adjusted.' },
  { id: '2', date: '2026-05-31', itemsCounted: 338, discrepancies: 1, status: 'Completed', notes: '1 missing carton of toilet roll. Written off.' },
];

export function StoresDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuthStore();
  const storesOfficer = user?.displayName ?? 'Stores Officer';

  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [received, setReceived] = useState(INITIAL_RECEIVED);
  const { requisitions, updateStatus: updateReqStatusStore, deleteRequisition: deleteReqStore, issueByStores } = useRequisitionStore();
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [audits, setAudits] = useState(INITIAL_AUDITS);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const [itemForm, setItemForm] = useState({ name: '', category: CATEGORIES[0], quantity: '', unit: UNITS[0], reorderLevel: '', unitCost: '' });
  const [receivedForm, setReceivedForm] = useState({ itemName: '', quantity: '', unit: UNITS[0], supplier: '', invoiceNo: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', items: '', rating: 3 });
  const [auditForm, setAuditForm] = useState({ itemsCounted: '', discrepancies: '', notes: '' });
  const [restockForm, setRestockForm] = useState({ itemId: '', quantity: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel);
  const totalValue = inventory.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const pendingRequisitions = requisitions.filter(r => r.status === 'Pending');

  const stockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.reorderLevel * 0.5) return 'Critical';
    if (item.quantity <= item.reorderLevel) return 'Low';
    return 'OK';
  };
  const statusColor = (status: string) =>
    status === 'Critical' ? colors.danger : status === 'Low' ? colors.warning : colors.success;
  const reqStatusColor = (status: string) =>
    status === 'Received' ? colors.success :
    status === 'Issued' ? colors.info :
    status === 'Domestic Approved' ? colors.purple :
    status === 'Senior Housemaster Approved' ? colors.primaryLight :
    status === 'Rejected' ? colors.danger :
    status === 'Pending' ? colors.warning : colors.textSecondary;

  const handleAddItem = () => {
    if (!itemForm.name.trim() || !itemForm.quantity.trim()) { Alert.alert('Error', 'Please enter item name and quantity'); return; }
    const qty = parseInt(itemForm.quantity);
    const reorder = parseInt(itemForm.reorderLevel) || 0;
    const cost = parseFloat(itemForm.unitCost) || 0;
    if (isNaN(qty) || qty < 0) { Alert.alert('Error', 'Invalid quantity'); return; }
    setInventory([...inventory, { id: nextId(), name: itemForm.name.trim(), category: itemForm.category, quantity: qty, unit: itemForm.unit, reorderLevel: reorder, unitCost: cost }]);
    setItemForm({ name: '', category: CATEGORIES[0], quantity: '', unit: UNITS[0], reorderLevel: '', unitCost: '' }); closeModal();
    Alert.alert('Success', 'Item added to inventory!');
  };

  const handleRestock = () => {
    if (!restockForm.itemId || !restockForm.quantity.trim()) { Alert.alert('Error', 'Select item and enter quantity'); return; }
    const qty = parseInt(restockForm.quantity);
    if (isNaN(qty) || qty <= 0) { Alert.alert('Error', 'Invalid quantity'); return; }
    setInventory(inventory.map(i => i.id === restockForm.itemId ? { ...i, quantity: i.quantity + qty } : i));
    const item = inventory.find(i => i.id === restockForm.itemId);
    if (item) {
      setReceived([{ id: nextId(), date: todayISO(), itemName: item.name, quantity: qty, unit: item.unit, supplier: 'Direct Restock', invoiceNo: 'N/A' }, ...received]);
    }
    setRestockForm({ itemId: '', quantity: '' }); closeModal();
    Alert.alert('Success', 'Stock restocked and received log updated!');
  };

  const adjustStock = (id: string, delta: number) => {
    setInventory(inventory.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i));
  };

  const deleteItem = (id: string) => {
    Alert.alert('Delete', 'Remove this item from inventory?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setInventory(inventory.filter(i => i.id !== id)) },
    ]);
  };

  const handleLogReceived = () => {
    if (!receivedForm.itemName.trim() || !receivedForm.quantity.trim() || !receivedForm.supplier.trim()) {
      Alert.alert('Error', 'Please fill item, quantity, and supplier'); return;
    }
    const qty = parseInt(receivedForm.quantity);
    if (isNaN(qty) || qty <= 0) { Alert.alert('Error', 'Invalid quantity'); return; }
    setReceived([{ id: nextId(), date: todayISO(), itemName: receivedForm.itemName.trim(), quantity: qty, unit: receivedForm.unit, supplier: receivedForm.supplier.trim(), invoiceNo: receivedForm.invoiceNo.trim() || 'N/A' }, ...received]);
    const invItem = inventory.find(i => i.name.toLowerCase() === receivedForm.itemName.trim().toLowerCase());
    if (invItem) {
      setInventory(inventory.map(i => i.id === invItem.id ? { ...i, quantity: i.quantity + qty } : i));
    }
    setReceivedForm({ itemName: '', quantity: '', unit: UNITS[0], supplier: '', invoiceNo: '' }); closeModal();
    Alert.alert('Success', 'Goods received logged and stock updated!');
  };

  const deleteReceived = (id: string) => {
    Alert.alert('Delete', 'Delete this received log entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setReceived(received.filter(r => r.id !== id)) },
    ]);
  };

  const updateReqStatus = (id: string, status: Requisition['status']) => {
    if (status === 'Issued') {
      issueByStores(id, storesOfficer);
      const req = requisitions.find(r => r.id === id);
      if (req) {
        const invItem = inventory.find(i => i.name.toLowerCase() === req.itemName.toLowerCase());
        if (invItem) {
          setInventory(inventory.map(i => i.id === invItem.id ? { ...i, quantity: Math.max(0, i.quantity - req.quantity) } : i));
        }
      }
    } else {
      updateReqStatusStore(id, status);
    }
  };

  const deleteRequisition = (id: string) => {
    Alert.alert('Delete', 'Delete this requisition?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReqStore(id) },
    ]);
  };

  const handleAddSupplier = () => {
    if (!supplierForm.name.trim() || !supplierForm.phone.trim()) { Alert.alert('Error', 'Please enter supplier name and phone'); return; }
    setSuppliers([...suppliers, { id: nextId(), name: supplierForm.name.trim(), phone: supplierForm.phone.trim(), items: supplierForm.items.trim() || 'General supplies', rating: supplierForm.rating }]);
    setSupplierForm({ name: '', phone: '', items: '', rating: 3 }); closeModal();
    Alert.alert('Success', 'Supplier added!');
  };

  const deleteSupplier = (id: string) => {
    Alert.alert('Delete', 'Remove this supplier?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setSuppliers(suppliers.filter(s => s.id !== id)) },
    ]);
  };

  const handleStartAudit = () => {
    if (!auditForm.itemsCounted.trim()) { Alert.alert('Error', 'Enter items counted'); return; }
    const counted = parseInt(auditForm.itemsCounted);
    const discrep = parseInt(auditForm.discrepancies) || 0;
    setAudits([{ id: nextId(), date: todayISO(), itemsCounted: counted, discrepancies: discrep, status: 'Completed', notes: auditForm.notes.trim() || 'No notes.' }, ...audits]);
    setAuditForm({ itemsCounted: '', discrepancies: '', notes: '' }); closeModal();
    Alert.alert('Success', 'Audit recorded!');
  };

  const deleteAudit = (id: string) => {
    Alert.alert('Delete', 'Delete this audit record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAudits(audits.filter(a => a.id !== id)) },
    ]);
  };

  const createRequisitionFromAlert = (item: InventoryItem) => {
    const reorderQty = item.reorderLevel * 2 - item.quantity;
    useRequisitionStore.getState().submitRequisition({
      itemName: item.name, quantity: reorderQty, unit: item.unit,
      department: 'Stores', requestedBy: 'Auto - Low Stock Alert',
      priority: 'Urgent', notes: 'Auto-generated from low-stock alert',
    });
    Alert.alert('Requisition Created', `Requisition for ${reorderQty} ${item.unit} of ${item.name} created.`);
  };

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

  const renderModal = () => {
    if (!showModal) return null;
    return (
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {modalType === 'item' && (
                <>
                  <Text style={styles.modalTitle}>Add Inventory Item</Text>
                  <Text style={styles.inputLabel}>Item Name</Text>
                  <TextInput style={styles.input} value={itemForm.name} onChangeText={(v) => setItemForm({ ...itemForm, name: v })} placeholder="e.g. Maize bags" placeholderTextColor={colors.textLight} />
                  {renderSelect('Category', itemForm.category, CATEGORIES, (v) => setItemForm({ ...itemForm, category: v }))}
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput style={styles.input} value={itemForm.quantity} onChangeText={(v) => setItemForm({ ...itemForm, quantity: v })} placeholder="e.g. 120" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  {renderSelect('Unit', itemForm.unit, UNITS, (v) => setItemForm({ ...itemForm, unit: v }))}
                  <Text style={styles.inputLabel}>Reorder Level</Text>
                  <TextInput style={styles.input} value={itemForm.reorderLevel} onChangeText={(v) => setItemForm({ ...itemForm, reorderLevel: v })} placeholder="e.g. 50" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Unit Cost (GH₵)</Text>
                  <TextInput style={styles.input} value={itemForm.unitCost} onChangeText={(v) => setItemForm({ ...itemForm, unitCost: v })} placeholder="e.g. 180" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                </>
              )}

              {modalType === 'received' && (
                <>
                  <Text style={styles.modalTitle}>Log Goods Received</Text>
                  <Text style={styles.inputLabel}>Item Name</Text>
                  <TextInput style={styles.input} value={receivedForm.itemName} onChangeText={(v) => setReceivedForm({ ...receivedForm, itemName: v })} placeholder="e.g. Maize bags" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput style={styles.input} value={receivedForm.quantity} onChangeText={(v) => setReceivedForm({ ...receivedForm, quantity: v })} placeholder="e.g. 50" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  {renderSelect('Unit', receivedForm.unit, UNITS, (v) => setReceivedForm({ ...receivedForm, unit: v }))}
                  <Text style={styles.inputLabel}>Supplier</Text>
                  <TextInput style={styles.input} value={receivedForm.supplier} onChangeText={(v) => setReceivedForm({ ...receivedForm, supplier: v })} placeholder="e.g. Kumasi Grains Ltd" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Invoice No. (optional)</Text>
                  <TextInput style={styles.input} value={receivedForm.invoiceNo} onChangeText={(v) => setReceivedForm({ ...receivedForm, invoiceNo: v })} placeholder="e.g. INV-2402" placeholderTextColor={colors.textLight} />
                </>
              )}

              {modalType === 'supplier' && (
                <>
                  <Text style={styles.modalTitle}>Add Supplier</Text>
                  <Text style={styles.inputLabel}>Supplier Name</Text>
                  <TextInput style={styles.input} value={supplierForm.name} onChangeText={(v) => setSupplierForm({ ...supplierForm, name: v })} placeholder="e.g. Kumasi Grains Ltd" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput style={styles.input} value={supplierForm.phone} onChangeText={(v) => setSupplierForm({ ...supplierForm, phone: v })} placeholder="e.g. 024 111 2222" placeholderTextColor={colors.textLight} keyboardType="phone-pad" />
                  <Text style={styles.inputLabel}>Items Supplied</Text>
                  <TextInput style={styles.input} value={supplierForm.items} onChangeText={(v) => setSupplierForm({ ...supplierForm, items: v })} placeholder="e.g. Maize, Rice, Beans" placeholderTextColor={colors.textLight} />
                  <Text style={styles.inputLabel}>Rating</Text>
                  {renderStarRating(supplierForm.rating, (v) => setSupplierForm({ ...supplierForm, rating: v }))}
                </>
              )}

              {modalType === 'audit' && (
                <>
                  <Text style={styles.modalTitle}>Start New Audit</Text>
                  <Text style={styles.inputLabel}>Items Counted</Text>
                  <TextInput style={styles.input} value={auditForm.itemsCounted} onChangeText={(v) => setAuditForm({ ...auditForm, itemsCounted: v })} placeholder="e.g. 342" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Discrepancies Found</Text>
                  <TextInput style={styles.input} value={auditForm.discrepancies} onChangeText={(v) => setAuditForm({ ...auditForm, discrepancies: v })} placeholder="e.g. 3" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={auditForm.notes} onChangeText={(v) => setAuditForm({ ...auditForm, notes: v })} placeholder="Audit notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
                </>
              )}

              {modalType === 'restock' && (
                <>
                  <Text style={styles.modalTitle}>Restock Item</Text>
                  <Text style={styles.inputLabel}>Select Item</Text>
                  <View style={styles.selectRow}>
                    {inventory.map((item) => (
                      <TouchableOpacity key={item.id} style={[styles.selectChip, restockForm.itemId === item.id && styles.selectChipActive]} onPress={() => setRestockForm({ ...restockForm, itemId: item.id })}>
                        <Text style={[styles.selectChipText, restockForm.itemId === item.id && styles.selectChipTextActive]}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.inputLabel}>Quantity to Add</Text>
                  <TextInput style={styles.input} value={restockForm.quantity} onChangeText={(v) => setRestockForm({ ...restockForm, quantity: v })} placeholder="e.g. 50" placeholderTextColor={colors.textLight} keyboardType="numeric" />
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
                  switch (modalType) {
                    case 'item': handleAddItem(); break;
                    case 'received': handleLogReceived(); break;
                    case 'supplier': handleAddSupplier(); break;
                    case 'audit': handleStartAudit(); break;
                    case 'restock': handleRestock(); break;
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
              <StatCard label="Total Items" value={inventory.length} accentColor={colors.primary} />
              <StatCard label="Low Stock" value={lowStockItems.length} subtitle="Below reorder level" accentColor={colors.danger} />
              <StatCard label="Inventory Value" value={`GH₵ ${totalValue.toLocaleString()}`} accentColor={colors.success} />
              <StatCard label="Pending Requisitions" value={pendingRequisitions.length} accentColor={colors.warning} />
              <StatCard label="Ready to Issue" value={requisitions.filter(r => r.status === 'Domestic Approved').length} accentColor={colors.purple} />
              <StatCard label="Suppliers" value={suppliers.length} accentColor={colors.info} />
              <StatCard label="Goods Received" value={received.length} subtitle="This period" accentColor={colors.purple} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Low-Stock Summary</Text>
            {lowStockItems.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>All items are above reorder levels.</Text></View>
            ) : (
              lowStockItems.map((item) => (
                <View key={item.id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertItem}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor(stockStatus(item)) + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor(stockStatus(item)) }]}>{stockStatus(item).toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.alertDetail}>Current: {item.quantity} {item.unit} | Reorder at: {item.reorderLevel} {item.unit}</Text>
                  <Text style={styles.alertShortfall}>Shortfall: {item.reorderLevel - item.quantity} {item.unit}</Text>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>Recent Goods Received</Text>
            {received.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.logCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTitle}>{item.itemName}</Text>
                  <Text style={styles.logMeta}>{item.date} | {item.quantity} {item.unit} | {item.supplier}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      case 'inventory':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Items" value={inventory.length} accentColor={colors.primary} />
              <StatCard label="Low Stock" value={lowStockItems.length} accentColor={colors.danger} />
              <StatCard label="Inventory Value" value={`GH₵ ${totalValue.toLocaleString()}`} accentColor={colors.success} />
              <StatCard label="Categories" value={new Set(inventory.map(i => i.category)).size} accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.pageTitle}>Stock Inventory</Text>
            <Text style={styles.pageSubtitle}>Manage all store items and stock levels</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={() => openModal('item')}>
                <Text style={styles.actionBtnText}>+ Add Item</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary, { flex: 1 }]} onPress={() => openModal('restock')}>
                <Text style={styles.actionBtnText}>Restock</Text>
              </TouchableOpacity>
            </View>

            {inventory.map((item) => {
              const st = stockStatus(item);
              return (
                <View key={item.id} style={styles.inventoryCard}>
                  <View style={styles.inventoryHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inventoryName}>{item.name}</Text>
                      <Text style={styles.inventoryMeta}>{item.category} | {item.quantity} {item.unit} | Reorder: {item.reorderLevel} | GH₵ {item.unitCost}/{item.unit}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor(st) + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor(st) }]}>{st.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.inventoryActions}>
                    <TouchableOpacity style={styles.stockBtn} onPress={() => adjustStock(item.id, -1)}>
                      <Text style={styles.stockBtnText}>-1</Text>
                    </TouchableOpacity>
                    <Text style={styles.stockValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.stockBtn} onPress={() => adjustStock(item.id, 1)}>
                      <Text style={styles.stockBtnText}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stockBtn} onPress={() => adjustStock(item.id, 10)}>
                      <Text style={styles.stockBtnText}>+10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteItem(item.id)}>
                      <Text style={styles.smallBtnDangerText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        );

      case 'received':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Entries" value={received.length} accentColor={colors.primary} />
              <StatCard label="This Month" value={received.filter(r => r.date.startsWith('2026-07')).length} accentColor={colors.info} />
              <StatCard label="Suppliers Used" value={new Set(received.map(r => r.supplier)).size} accentColor={colors.success} />
              <StatCard label="Total Items" value={received.reduce((s, r) => s + r.quantity, 0)} accentColor={colors.purple} />
            </CardGrid>

            <Text style={styles.pageTitle}>Goods Received Log</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('received')}>
              <Text style={styles.actionBtnText}>+ Log Goods Received</Text>
            </TouchableOpacity>
            {received.map((item) => (
              <View key={item.id} style={styles.logCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTitle}>{item.itemName}</Text>
                  <Text style={styles.logMeta}>{item.date} | {item.quantity} {item.unit} | {item.supplier} | {item.invoiceNo}</Text>
                </View>
                <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteReceived(item.id)}>
                  <Text style={styles.smallBtnDangerText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'requisition':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={requisitions.length} accentColor={colors.primary} />
              <StatCard label="Ready to Issue" value={requisitions.filter(r => r.status === 'Domestic Approved').length} accentColor={colors.warning} />
              <StatCard label="Issued" value={requisitions.filter(r => r.status === 'Issued' || r.status === 'Received').length} accentColor={colors.success} />
              <StatCard label="Rejected" value={requisitions.filter(r => r.status === 'Rejected').length} accentColor={colors.danger} />
            </CardGrid>

            <Text style={styles.pageTitle}>Requisition / Issue Log</Text>
            <Text style={styles.pageSubtitle}>Issue items after approval from Senior Housemaster and Asst. Headmaster (Domestic)</Text>
            {requisitions.map((item) => (
              <View key={item.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{item.itemName}</Text>
                    <Text style={styles.reqMeta}>{item.date} | {item.quantity} {item.unit} | {item.department} | By {item.requestedBy}</Text>
                    {item.house && <Text style={styles.reqMeta}>House: {item.house}</Text>}
                    {item.notes ? <Text style={styles.reqNotes}>{item.notes}</Text> : null}
                    {item.approvals.length > 0 && (
                      <Text style={styles.reqMeta}>Approvals: {item.approvals.map(a => `${a.step}: ${a.action}`).join(' → ')}</Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: reqStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: reqStatusColor(item.status) }]}>{item.status}</Text>
                  </View>
                </View>
                {item.priority === 'Urgent' && (
                  <View style={styles.priorityBadge}><Text style={styles.priorityText}>URGENT</Text></View>
                )}
                <View style={styles.reqActions}>
                  {item.status === 'Domestic Approved' && (
                    <TouchableOpacity style={[styles.statusToggle, { borderColor: colors.success }]} onPress={() => updateReqStatus(item.id, 'Issued')}>
                      <Text style={[styles.statusToggleText, { color: colors.success }]}>Issue & Deduct Stock</Text>
                    </TouchableOpacity>
                  )}
                  {item.status !== 'Domestic Approved' && item.status !== 'Issued' && item.status !== 'Received' && item.status !== 'Rejected' && (
                    <Text style={styles.reqWaitingText}>Awaiting approvals before issuance</Text>
                  )}
                  <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteRequisition(item.id)}>
                    <Text style={styles.smallBtnDangerText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'kitchenIssues':
        return (
          <View>
            <KitchenIssuesView />
          </View>
        );

      case 'suppliers':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Suppliers" value={suppliers.length} accentColor={colors.primary} />
              <StatCard label="Top Rated" value={suppliers.filter(s => s.rating >= 4).length} accentColor={colors.success} />
              <StatCard label="Avg Rating" value={(suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1)} accentColor={colors.accent} />
              <StatCard label="Categories" value={new Set(suppliers.flatMap(s => s.items.split(',').map(i => i.trim()))).size} accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.pageTitle}>Suppliers</Text>
            <Text style={styles.pageSubtitle}>Manage supplier directory and contacts</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('supplier')}>
              <Text style={styles.actionBtnText}>+ Add Supplier</Text>
            </TouchableOpacity>
            {suppliers.map((item) => (
              <View key={item.id} style={styles.supplierCard}>
                <View style={styles.supplierHeader}>
                  <View style={styles.supplierAvatar}>
                    <Text style={styles.supplierAvatarText}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.supplierName}>{item.name}</Text>
                    <Text style={styles.supplierPhone}>{item.phone}</Text>
                  </View>
                  <View style={styles.starDisplay}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Text key={s} style={[styles.starSmall, s <= item.rating && styles.starActive]}>{s <= item.rating ? '\u2605' : '\u2606'}</Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.supplierItems}>Supplies: {item.items}</Text>
                <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteSupplier(item.id)}>
                  <Text style={styles.smallBtnDangerText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'audit':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Audits" value={audits.length} accentColor={colors.primary} />
              <StatCard label="Completed" value={audits.filter(a => a.status === 'Completed').length} accentColor={colors.success} />
              <StatCard label="Total Discrepancies" value={audits.reduce((s, a) => s + a.discrepancies, 0)} accentColor={colors.warning} />
              <StatCard label="Last Audit" value={audits[0]?.date || 'None'} accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.pageTitle}>Stock Audit</Text>
            <Text style={styles.pageSubtitle}>Periodic count reconciliation</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('audit')}>
              <Text style={styles.actionBtnText}>+ Start New Audit</Text>
            </TouchableOpacity>
            {audits.map((item) => (
              <View key={item.id} style={styles.auditCard}>
                <View style={styles.auditHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.auditDate}>{item.date}</Text>
                    <Text style={styles.auditMeta}>{item.itemsCounted} items counted | {item.discrepancies} discrepancies</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.statusText, { color: colors.success }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.auditNotes}>{item.notes}</Text>
                <TouchableOpacity style={styles.smallBtnDanger} onPress={() => deleteAudit(item.id)}>
                  <Text style={styles.smallBtnDangerText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'alerts':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Alerts" value={lowStockItems.length} accentColor={colors.danger} />
              <StatCard label="Critical" value={lowStockItems.filter(i => i.quantity <= i.reorderLevel * 0.5).length} accentColor={colors.danger} />
              <StatCard label="Low" value={lowStockItems.filter(i => i.quantity > i.reorderLevel * 0.5).length} accentColor={colors.warning} />
              <StatCard label="Healthy" value={inventory.length - lowStockItems.length} accentColor={colors.success} />
            </CardGrid>

            <Text style={styles.pageTitle}>Low-Stock Alerts</Text>
            <Text style={styles.pageSubtitle}>Items below reorder threshold - auto-detected from inventory</Text>
            {lowStockItems.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>All items are above reorder levels.</Text></View>
            ) : (
              lowStockItems.map((item) => {
                const st = stockStatus(item);
                return (
                  <View key={item.id} style={styles.alertCard}>
                    <View style={styles.alertHeader}>
                      <Text style={styles.alertItem}>{item.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor(st) + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor(st) }]}>{st.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.alertDetail}>Current: {item.quantity} {item.unit} | Reorder at: {item.reorderLevel} {item.unit}</Text>
                    <Text style={styles.alertShortfall}>Shortfall: {item.reorderLevel - item.quantity} {item.unit}</Text>
                    <View style={styles.alertActions}>
                      <TouchableOpacity style={styles.reorderBtn} onPress={() => createRequisitionFromAlert(item)}>
                        <Text style={styles.reorderBtnText}>Create Requisition</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.reorderBtn, styles.restockBtn]} onPress={() => { setRestockForm({ itemId: item.id, quantity: String(item.reorderLevel * 2 - item.quantity) }); openModal('restock'); }}>
                        <Text style={styles.reorderBtnText}>Quick Restock</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Stores"
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
  actionRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnSecondary: { backgroundColor: colors.accent },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  inventoryCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  inventoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  inventoryName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  inventoryMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  inventoryActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stockBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  stockBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  stockValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, minWidth: 40, textAlign: 'center' },
  logCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  logTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  logMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reqCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  reqTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  reqMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reqNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  priorityBadge: { alignSelf: 'flex-start', backgroundColor: colors.dangerBg, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, marginBottom: spacing.sm },
  priorityText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger },
  reqActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  supplierCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  supplierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  supplierAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  supplierAvatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.white },
  supplierName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  supplierPhone: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  supplierItems: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  starDisplay: { flexDirection: 'row' },
  starSmall: { fontSize: fontSize.sm, color: colors.textLight, marginRight: 2 },
  auditCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  auditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  auditDate: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  auditMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  auditNotes: { fontSize: fontSize.sm, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.sm, lineHeight: 20 },
  alertCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.danger },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.danger, marginBottom: spacing.xs },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  alertItem: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  alertDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  alertShortfall: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium, marginBottom: spacing.md },
  alertActions: { flexDirection: 'row', gap: spacing.sm },
  reorderBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', flex: 1 },
  restockBtn: { backgroundColor: colors.success },
  reorderBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, fontStyle: 'italic' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  statusToggle: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  statusToggleText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary },
  smallBtnDanger: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.dangerBg, borderRadius: radius.sm },
  smallBtnDangerText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.danger },
  reqWaitingText: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic' },
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
  star: { fontSize: fontSize.xxl, color: colors.textLight, marginRight: spacing.xs },
  starActive: { color: colors.accent },
  starRow: { flexDirection: 'row', marginBottom: spacing.sm },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});

function KitchenIssuesView() {
  const { issues, stock, getLowStock, getOutOfStock } = useKitchenStore();
  const lowStock = getLowStock();
  const outOfStock = getOutOfStock();

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Issues" value={issues.length} subtitle="Items issued to kitchen" accentColor={colors.primary} />
        <StatCard label="Kitchen Stock Items" value={stock.length} accentColor={colors.info} />
        <StatCard label="Low Stock" value={lowStock.length} accentColor={colors.warning} />
        <StatCard label="Out of Stock" value={outOfStock.length} accentColor={colors.danger} />
      </CardGrid>
      <Text style={styles.pageTitle}>Items Issued to Kitchen</Text>
      <Text style={styles.pageSubtitle}>Track all stock issued from stores to the kitchen for meal preparation</Text>

      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚠ Kitchen Stock Alerts</Text>
          {outOfStock.map((s) => (
            <Text key={s.id} style={{ fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.semibold, marginTop: 2 }}>OUT: {s.name} — kitchen needs resupply!</Text>
          ))}
          {lowStock.map((s) => (
            <Text key={s.id} style={{ fontSize: fontSize.sm, color: colors.warning, marginTop: 2 }}>LOW: {s.name} — {s.quantity} {s.unit} left</Text>
          ))}
        </View>
      )}

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'item', label: 'Item', render: (i: any) => i.itemName },
          { key: 'qty', label: 'Quantity', render: (i: any) => `${i.quantity} ${i.unit}` },
          { key: 'to', label: 'Issued To', render: (i: any) => i.issuedTo },
          { key: 'purpose', label: 'Purpose', render: (i: any) => i.purpose || '—' },
        ]}
        data={issues}
      />
    </View>
  );
}
