import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable, RequisitionModal } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRequisitionStore } from '@store/requisitionStore';
import { useLibraryStore, BOOK_CATEGORIES, LABS, TIME_SLOTS, EQUIPMENT_CONDITIONS, DIGITAL_RESOURCE_TYPES, ACCESS_ROLES, ACCESS_LEVELS } from '@store/libraryStore';
import type { EquipmentCondition, DigitalResourceType, AccessRole, AccessRecord } from '@store/libraryStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'catalogue', label: 'Catalogue' },
  { key: 'circulation', label: 'Borrow / Return' },
  { key: 'ict', label: 'ICT Lab Bookings' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'digital', label: 'Digital Resources' },
  { key: 'access', label: 'Access Control' },
  { key: 'requisitions', label: 'Requisitions' },
];

const ACCESS_RESOURCES = ['Library Catalogue', 'ICT Lab Bookings', 'Equipment Inventory', 'Digital Resources', 'Circulation Records'];

export function LibraryICTDashboard() {
  const [activePage, setActivePage] = useState('catalogue');
  const { user, logout } = useAuthStore();
  const librarianName = user?.displayName ?? 'Librarian';

  return (
    <DashboardLayout
      title="Library & ICT"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
    >
      {activePage === 'catalogue' && <CataloguePage />}
      {activePage === 'circulation' && <CirculationPage />}
      {activePage === 'ict' && <ICTBookingsPage />}
      {activePage === 'equipment' && <EquipmentPage />}
      {activePage === 'digital' && <DigitalResourcesPage />}
      {activePage === 'access' && <AccessControlPage librarianName={librarianName} />}
      {activePage === 'requisitions' && <RequisitionsPage librarianName={librarianName} />}
    </DashboardLayout>
  );
}

// ── Catalogue Page ──

function CataloguePage() {
  const { books, addBook } = useLibraryStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', category: BOOK_CATEGORIES[0], isbn: '', totalCopies: '1' });

  const handleAdd = () => {
    if (!form.title.trim() || !form.author.trim()) {
      Alert.alert('Error', 'Title and author are required');
      return;
    }
    const qty = parseInt(form.totalCopies);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Invalid quantity');
      return;
    }
    addBook({
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category,
      isbn: form.isbn.trim() || undefined,
      totalCopies: qty,
    });
    setForm({ title: '', author: '', category: BOOK_CATEGORIES[0], isbn: '', totalCopies: '1' });
    setShowAdd(false);
    Alert.alert('Success', 'Book added to catalogue');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Books" value={books.reduce((s, b) => s + b.totalCopies, 0).toLocaleString()} accentColor={colors.primary} />
        <StatCard label="Available" value={books.reduce((s, b) => s + b.availableCopies, 0).toLocaleString()} accentColor={colors.success} />
        <StatCard label="Borrowed" value={books.reduce((s, b) => s + (b.totalCopies - b.availableCopies), 0).toLocaleString()} accentColor={colors.warning} />
        <StatCard label="Titles" value={books.length} accentColor={colors.info} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Catalogue</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Add Book</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'title', label: 'Title', render: (i: any) => i.title },
          { key: 'author', label: 'Author', render: (i: any) => i.author },
          { key: 'category', label: 'Category', render: (i: any) => i.category },
          { key: 'available', label: 'Available', render: (i: any) => `${i.availableCopies}/${i.totalCopies}` },
        ]}
        data={books}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Book</Text>
              <Text style={styles.modalSubtitle}>Add a new title to the library catalogue</Text>

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Book title" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Author</Text>
              <TextInput style={styles.input} value={form.author} onChangeText={(v) => setForm({ ...form, author: v })} placeholder="Author name" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.selectRow}>
                {BOOK_CATEGORIES.map((c) => (
                  <TouchableOpacity key={c} style={[styles.selectChip, form.category === c && styles.selectChipActive]} onPress={() => setForm({ ...form, category: c })}>
                    <Text style={[styles.selectChipText, form.category === c && styles.selectChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>ISBN (optional)</Text>
              <TextInput style={styles.input} value={form.isbn} onChangeText={(v) => setForm({ ...form, isbn: v })} placeholder="e.g. 9781234567890" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Total Copies</Text>
              <TextInput style={styles.input} value={form.totalCopies} onChangeText={(v) => setForm({ ...form, totalCopies: v })} placeholder="e.g. 5" placeholderTextColor={colors.textLight} keyboardType="numeric" />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextLight}>Add Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Circulation Page ──

function CirculationPage() {
  const { circulation, books, borrowBook } = useLibraryStore();
  const [showBorrow, setShowBorrow] = useState(false);
  const [form, setForm] = useState({ bookId: '', borrowerName: '', borrowerClass: '', dueDate: '' });

  const handleBorrow = () => {
    if (!form.bookId || !form.borrowerName.trim() || !form.borrowerClass.trim() || !form.dueDate.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    borrowBook(form.bookId, form.borrowerName.trim(), form.borrowerClass.trim(), form.dueDate.trim());
    setForm({ bookId: '', borrowerName: '', borrowerClass: '', dueDate: '' });
    setShowBorrow(false);
    Alert.alert('Success', 'Book borrowed successfully');
  };

  const availableBooks = books.filter((b) => b.availableCopies > 0);

  return (
    <View>
      <CardGrid>
        <StatCard label="Active Loans" value={circulation.filter((c) => c.status === 'Borrowed').length} accentColor={colors.warning} />
        <StatCard label="Overdue" value={circulation.filter((c) => c.status === 'Overdue').length} accentColor={colors.danger} />
        <StatCard label="Returned" value={circulation.filter((c) => c.status === 'Returned').length} accentColor={colors.success} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Borrow / Return Log</Text>
          <Text style={styles.pageSubtitle}>Circulation tracking</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBorrow(true)}>
          <Text style={styles.actionBtnText}>+ Log Borrow</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'book', label: 'Book', render: (i: any) => i.bookTitle },
          { key: 'borrower', label: 'Borrower', render: (i: any) => `${i.borrowerName} (${i.borrowerClass})` },
          { key: 'due', label: 'Due Date', render: (i: any) => i.dueDate },
          { key: 'status', label: 'Status', render: (i: any) => i.status },
        ]}
        data={circulation}
      />

      <Modal visible={showBorrow} animationType="slide" transparent onRequestClose={() => setShowBorrow(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log Borrow</Text>
              <Text style={styles.modalSubtitle}>Issue a book to a student</Text>

              <Text style={styles.inputLabel}>Book</Text>
              {availableBooks.length === 0 ? (
                <Text style={styles.emptyInline}>No books available</Text>
              ) : (
                <View style={styles.selectRow}>
                  {availableBooks.map((b) => (
                    <TouchableOpacity key={b.id} style={[styles.selectChip, form.bookId === b.id && styles.selectChipActive]} onPress={() => setForm({ ...form, bookId: b.id })}>
                      <Text style={[styles.selectChipText, form.bookId === b.id && styles.selectChipTextActive]}>{b.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.inputLabel}>Borrower Name</Text>
              <TextInput style={styles.input} value={form.borrowerName} onChangeText={(v) => setForm({ ...form, borrowerName: v })} placeholder="Student name" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Class</Text>
              <TextInput style={styles.input} value={form.borrowerClass} onChangeText={(v) => setForm({ ...form, borrowerClass: v })} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Due Date</Text>
              <TextInput style={styles.input} value={form.dueDate} onChangeText={(v) => setForm({ ...form, dueDate: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowBorrow(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleBorrow}>
                  <Text style={styles.modalBtnTextLight}>Issue Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── ICT Lab Bookings Page ──

function ICTBookingsPage() {
  const { bookings, addBooking } = useLibraryStore();
  const [showBook, setShowBook] = useState(false);
  const [form, setForm] = useState({ date: '', timeSlot: TIME_SLOTS[0], className: '', teacherName: '', lab: LABS[0], purpose: '' });

  const handleBook = () => {
    if (!form.date.trim() || !form.className.trim() || !form.teacherName.trim()) {
      Alert.alert('Error', 'Date, class and teacher are required');
      return;
    }
    addBooking({
      date: form.date.trim(),
      timeSlot: form.timeSlot,
      className: form.className.trim(),
      teacherName: form.teacherName.trim(),
      lab: form.lab,
      purpose: form.purpose.trim(),
    });
    setForm({ date: '', timeSlot: TIME_SLOTS[0], className: '', teacherName: '', lab: LABS[0], purpose: '' });
    setShowBook(false);
    Alert.alert('Success', 'Lab booked successfully');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Upcoming" value={bookings.filter((b) => b.status === 'Booked').length} accentColor={colors.info} />
        <StatCard label="Completed" value={bookings.filter((b) => b.status === 'Completed').length} accentColor={colors.success} />
        <StatCard label="Cancelled" value={bookings.filter((b) => b.status === 'Cancelled').length} accentColor={colors.danger} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>ICT Lab Bookings</Text>
          <Text style={styles.pageSubtitle}>Class and computer lab scheduling</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBook(true)}>
          <Text style={styles.actionBtnText}>+ Book Lab</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'time', label: 'Time', render: (i: any) => i.timeSlot },
          { key: 'class', label: 'Class', render: (i: any) => i.className },
          { key: 'teacher', label: 'Teacher', render: (i: any) => i.teacherName },
          { key: 'lab', label: 'Lab', render: (i: any) => i.lab },
          { key: 'status', label: 'Status', render: (i: any) => i.status },
        ]}
        data={bookings}
      />

      <Modal visible={showBook} animationType="slide" transparent onRequestClose={() => setShowBook(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Book ICT Lab</Text>
              <Text style={styles.modalSubtitle}>Schedule a class in a computer lab</Text>

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Time Slot</Text>
              <View style={styles.selectRow}>
                {TIME_SLOTS.map((t) => (
                  <TouchableOpacity key={t} style={[styles.selectChip, form.timeSlot === t && styles.selectChipActive]} onPress={() => setForm({ ...form, timeSlot: t })}>
                    <Text style={[styles.selectChipText, form.timeSlot === t && styles.selectChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Lab</Text>
              <View style={styles.selectRow}>
                {LABS.map((l) => (
                  <TouchableOpacity key={l} style={[styles.selectChip, form.lab === l && styles.selectChipActive]} onPress={() => setForm({ ...form, lab: l })}>
                    <Text style={[styles.selectChipText, form.lab === l && styles.selectChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Class</Text>
              <TextInput style={styles.input} value={form.className} onChangeText={(v) => setForm({ ...form, className: v })} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Teacher</Text>
              <TextInput style={styles.input} value={form.teacherName} onChangeText={(v) => setForm({ ...form, teacherName: v })} placeholder="Teacher name" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Purpose (optional)</Text>
              <TextInput style={styles.input} value={form.purpose} onChangeText={(v) => setForm({ ...form, purpose: v })} placeholder="e.g. Practical: Spreadsheets" placeholderTextColor={colors.textLight} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowBook(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleBook}>
                  <Text style={styles.modalBtnTextLight}>Book Lab</Text>
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
  const { equipment, addEquipment } = useLibraryStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ item: '', quantity: '1', condition: 'Good' as EquipmentCondition, location: '', lastServiceDate: '', notes: '' });

  const handleAdd = () => {
    if (!form.item.trim() || !form.location.trim()) {
      Alert.alert('Error', 'Item name and location are required');
      return;
    }
    const qty = parseInt(form.quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Invalid quantity');
      return;
    }
    addEquipment({
      item: form.item.trim(),
      quantity: qty,
      condition: form.condition,
      location: form.location.trim(),
      lastServiceDate: form.lastServiceDate.trim() || new Date().toISOString().slice(0, 10),
      notes: form.notes.trim() || undefined,
    });
    setForm({ item: '', quantity: '1', condition: 'Good', location: '', lastServiceDate: '', notes: '' });
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
          <Text style={styles.pageTitle}>Equipment Inventory</Text>
          <Text style={styles.pageSubtitle}>Computers, devices and maintenance status</Text>
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
          { key: 'lastService', label: 'Last Service', render: (i: any) => i.lastServiceDate },
        ]}
        data={equipment}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Equipment</Text>

              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput style={styles.input} value={form.item} onChangeText={(v) => setForm({ ...form, item: v })} placeholder="e.g. Desktop PCs" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput style={styles.input} value={form.quantity} onChangeText={(v) => setForm({ ...form, quantity: v })} placeholder="e.g. 30" placeholderTextColor={colors.textLight} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Condition</Text>
              <View style={styles.selectRow}>
                {EQUIPMENT_CONDITIONS.map((c) => (
                  <TouchableOpacity key={c} style={[styles.selectChip, form.condition === c && styles.selectChipActive]} onPress={() => setForm({ ...form, condition: c })}>
                    <Text style={[styles.selectChipText, form.condition === c && styles.selectChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Location</Text>
              <TextInput style={styles.input} value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} placeholder="e.g. ICT Lab 1" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Last Service Date</Text>
              <TextInput style={styles.input} value={form.lastServiceDate} onChangeText={(v) => setForm({ ...form, lastServiceDate: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Maintenance notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />

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

// ── Digital Resources Page ──

function DigitalResourcesPage() {
  const { digitalResources, addDigitalResource } = useLibraryStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'E-Book' as DigitalResourceType, fileSize: '', uploadDate: '' });

  const handleAdd = () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    addDigitalResource({
      title: form.title.trim(),
      type: form.type,
      fileSize: form.fileSize.trim() || 'Unknown',
      uploadDate: form.uploadDate.trim() || new Date().toISOString().slice(0, 10),
    });
    setForm({ title: '', type: 'E-Book', fileSize: '', uploadDate: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Digital resource added');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Resources" value={digitalResources.length} accentColor={colors.primary} />
        <StatCard label="Total Downloads" value={digitalResources.reduce((s, r) => s + r.downloads, 0)} accentColor={colors.info} />
        <StatCard label="E-Books" value={digitalResources.filter((r) => r.type === 'E-Book').length} accentColor={colors.success} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Digital Resources</Text>
          <Text style={styles.pageSubtitle}>E-books, past questions and multimedia</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Add Resource</Text>
        </TouchableOpacity>
      </View>

      <DataTable
        columns={[
          { key: 'title', label: 'Title', render: (i: any) => i.title },
          { key: 'type', label: 'Type', render: (i: any) => i.type },
          { key: 'size', label: 'Size', render: (i: any) => i.fileSize },
          { key: 'downloads', label: 'Downloads', render: (i: any) => String(i.downloads) },
        ]}
        data={digitalResources}
      />

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Digital Resource</Text>

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Resource title" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.selectRow}>
                {DIGITAL_RESOURCE_TYPES.map((t) => (
                  <TouchableOpacity key={t} style={[styles.selectChip, form.type === t && styles.selectChipActive]} onPress={() => setForm({ ...form, type: t })}>
                    <Text style={[styles.selectChipText, form.type === t && styles.selectChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>File Size</Text>
              <TextInput style={styles.input} value={form.fileSize} onChangeText={(v) => setForm({ ...form, fileSize: v })} placeholder="e.g. 12.4 MB" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Upload Date</Text>
              <TextInput style={styles.input} value={form.uploadDate} onChangeText={(v) => setForm({ ...form, uploadDate: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

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

// ── Access Control Page ──

function AccessControlPage({ librarianName }: { librarianName: string }) {
  const { accessRecords, grantAccess } = useLibraryStore();
  const [showGrant, setShowGrant] = useState(false);
  const [form, setForm] = useState({ personName: '', role: 'Teacher' as AccessRole, resource: '', accessLevel: 'Read Only' as string, notes: '' });

  const handleGrant = () => {
    if (!form.personName.trim() || !form.resource) {
      Alert.alert('Error', 'Person name and resource are required');
      return;
    }
    grantAccess({
      personName: form.personName.trim(),
      role: form.role,
      resource: form.resource,
      accessLevel: form.accessLevel as AccessRecord['accessLevel'],
      grantedBy: librarianName,
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
          <Text style={styles.pageSubtitle}>Manage who can access library and ICT resources</Text>
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
                {ACCESS_ROLES.map((r) => (
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
                {ACCESS_LEVELS.map((l) => (
                  <TouchableOpacity key={l} style={[styles.selectChip, form.accessLevel === l && styles.selectChipActive]} onPress={() => setForm({ ...form, accessLevel: l })}>
                    <Text style={[styles.selectChipText, form.accessLevel === l && styles.selectChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Access notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />

              <Text style={styles.requesterInfo}>Granted by: {librarianName}</Text>

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

function RequisitionsPage({ librarianName }: { librarianName: string }) {
  const requisitions = useRequisitionStore((s) => s.requisitions);
  const [showReq, setShowReq] = useState(false);

  const libraryReqs = requisitions.filter((r) => r.department === 'Library & ICT');

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Reqs" value={libraryReqs.length} accentColor={colors.primary} />
        <StatCard label="Pending" value={libraryReqs.filter((r) => r.status === 'Pending').length} accentColor={colors.warning} />
        <StatCard label="Issued" value={libraryReqs.filter((r) => r.status === 'Issued').length} accentColor={colors.success} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Requisitions</Text>
          <Text style={styles.pageSubtitle}>Request items from Stores for Library & ICT</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReq(true)}>
          <Text style={styles.actionBtnText}>+ New Requisition</Text>
        </TouchableOpacity>
      </View>

      {libraryReqs.length === 0 ? (
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
          data={libraryReqs}
        />
      )}

      <RequisitionModal
        visible={showReq}
        onClose={() => setShowReq(false)}
        department="Library & ICT"
        requestedBy={librarianName}
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
  emptyInline: { fontSize: fontSize.md, color: colors.textLight, marginBottom: spacing.sm },
  emptyBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xxl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, fontWeight: fontWeight.medium, textAlign: 'center' },
});
