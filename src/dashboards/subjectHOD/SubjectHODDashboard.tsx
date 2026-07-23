import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Department Overview' },
  { key: 'syllabus', label: 'Syllabus Tracker' },
  { key: 'lesson', label: 'Lesson Plan Review' },
  { key: 'exam', label: 'Internal Exam Setting' },
  { key: 'results', label: 'Result Entry' },
];

export function SubjectHODDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { logout } = useAuthStore();

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Department" value="Mathematics" accentColor={colors.primary} />
              <StatCard label="Teachers" value="6" accentColor={colors.info} />
              <StatCard label="Classes" value="14" accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Teacher List & Class Coverage</Text>
            <DataTable
              columns={[
                { key: 'teacher', label: 'Teacher', render: (i) => i.teacher },
                { key: 'subjects', label: 'Subjects', render: (i) => i.subjects },
                { key: 'classes', label: 'Classes', render: (i) => i.classes },
              ]}
              data={[
                { teacher: 'Mr. Mensah', subjects: 'Elect. Math, Core Math', classes: 'SHS2 Sci A/B, SHS1 Sci A' },
                { teacher: 'Mrs. Adjei', subjects: 'Core Math', classes: 'SHS1 Arts A/B' },
                { teacher: 'Mr. Owusu', subjects: 'Elect. Math', classes: 'SHS3 Sci A/B' },
              ]}
            />
          </View>
        );
      case 'syllabus':
        return (
          <View>
            <Text style={styles.pageTitle}>Syllabus Tracker</Text>
            <Text style={styles.pageSubtitle}>Topic-by-topic coverage log per class</Text>
            <DataTable
              columns={[
                { key: 'class', label: 'Class', render: (i) => i.class },
                { key: 'topics', label: 'Topics Covered', render: (i) => i.topics },
                { key: 'total', label: 'Total Topics', render: (i) => i.total },
                { key: 'pct', label: 'Coverage', render: (i) => i.pct },
              ]}
              data={[
                { class: 'SHS2 Sci A', topics: '38', total: '52', pct: '73%' },
                { class: 'SHS2 Sci B', topics: '35', total: '52', pct: '67%' },
                { class: 'SHS1 Sci A', topics: '22', total: '48', pct: '46%' },
              ]}
            />
          </View>
        );
      case 'lesson':
        return (
          <View>
            <Text style={styles.pageTitle}>Lesson Plan Review</Text>
            <Text style={styles.pageSubtitle}>Approve or comment on teachers' lesson plans</Text>
            <DataTable
              columns={[
                { key: 'teacher', label: 'Teacher', render: (i) => i.teacher },
                { key: 'topic', label: 'Topic', render: (i) => i.topic },
                { key: 'date', label: 'Submitted', render: (i) => i.date },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { teacher: 'Mr. Mensah', topic: 'Quadratic Equations', date: 'Jul 05', status: 'Approved' },
                { teacher: 'Mrs. Adjei', topic: 'Indices & Logarithms', date: 'Jul 04', status: 'Pending' },
                { teacher: 'Mr. Owusu', topic: 'Differentiation', date: 'Jul 03', status: 'Pending' },
              ]}
            />
          </View>
        );
      case 'exam':
        return (
          <View>
            <Text style={styles.pageTitle}>Internal Exam Setting</Text>
            <Text style={styles.pageSubtitle}>Coordinate question paper creation and moderation</Text>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>+ Create Exam Paper</Text></TouchableOpacity>
            <DataTable
              columns={[
                { key: 'exam', label: 'Exam', render: (i) => i.exam },
                { key: 'setter', label: 'Setter', render: (i) => i.setter },
                { key: 'moderator', label: 'Moderator', render: (i) => i.moderator },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { exam: 'Core Math Mid-Sem', setter: 'Mr. Mensah', moderator: 'Mrs. Adjei', status: 'Moderated' },
                { exam: 'Elect. Math Mid-Sem', setter: 'Mr. Owusu', moderator: 'Mr. Mensah', status: 'Pending Moderation' },
              ]}
            />
          </View>
        );
      case 'results':
        return (
          <View>
            <Text style={styles.pageTitle}>Result Entry</Text>
            <Text style={styles.pageSubtitle}>Input and verify subject scores per class</Text>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>+ Enter Scores</Text></TouchableOpacity>
            <DataTable
              columns={[
                { key: 'class', label: 'Class', render: (i) => i.class },
                { key: 'entered', label: 'Scores Entered', render: (i) => i.entered },
                { key: 'total', label: 'Total Students', render: (i) => i.total },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { class: 'SHS2 Sci A', entered: '38', total: '38', status: 'Complete' },
                { class: 'SHS2 Sci B', entered: '20', total: '35', status: 'In Progress' },
                { class: 'SHS1 Sci A', entered: '0', total: '42', status: 'Not Started' },
              ]}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Subject HOD — Mathematics" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
