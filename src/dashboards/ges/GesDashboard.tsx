import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, radius } from '@theme/index';
import { apiClient } from '@shared/api/apiClient';
import { useAuthStore } from '@store/authStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'offices', label: 'Office Hierarchy' },
  { key: 'schools', label: 'Schools' },
  { key: 'reports', label: 'Compliance Reports' },
  { key: 'inspections', label: 'Inspections' },
  { key: 'statistics', label: 'Statistics' },
];

const GES_LEVEL_LABELS: Record<string, string> = {
  national: 'National',
  regional: 'Regional',
  district: 'District / Municipal',
  circuit: 'Circuit',
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  enrollment: 'Enrollment',
  staffing: 'Staffing',
  infrastructure: 'Infrastructure',
  academic_performance: 'Academic Performance',
  financial: 'Financial',
  health_safety: 'Health & Safety',
  inspection: 'Inspection',
  compliance: 'Compliance',
  special_report: 'Special Report',
};

const STATUS_COLORS: Record<string, string> = {
  draft: colors.textLight,
  submitted: colors.info,
  under_review: colors.warning,
  approved: colors.success,
  rejected: colors.danger,
  overdue: colors.danger,
};

interface GesOffice {
  id: string;
  officeKey: string;
  name: string;
  level: string;
  parentId: string | null;
  gesCode: string | null;
  region: string | null;
  district: string | null;
  headName: string | null;
  headTitle: string | null;
  active: boolean;
  children?: GesOffice[];
}

interface GesReport {
  id: string;
  tenantId: string;
  schoolName: string;
  schoolLevel: string | null;
  schoolCode: string | null;
  gesOfficeId: string;
  reportType: string;
  title: string;
  description: string | null;
  academicYear: string;
  term: string | null;
  status: string;
  submittedAt: string | null;
  deadline: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  createdAt: string;
}

interface GesSchool {
  id: string;
  tenantKey: string;
  schoolName: string;
  schoolCode: string | null;
  schoolLevel: string | null;
  region: string | null;
  district: string | null;
  gesCircuitId: string | null;
  active: boolean;
}

export function GesDashboard() {
  const { user } = useAuthStore();
  const [activePage, setActivePage] = useState('overview');
  const [offices, setOffices] = useState<GesOffice[]>([]);
  const [officeTree, setOfficeTree] = useState<any[]>([]);
  const [reports, setReports] = useState<GesReport[]>([]);
  const [schools, setSchools] = useState<GesSchool[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [officeForm, setOfficeForm] = useState({
    officeKey: '', name: '', level: 'regional', parentId: '',
    gesCode: '', region: '', district: '', headName: '', headTitle: '',
  });
  const [reportForm, setReportForm] = useState({
    reportType: 'enrollment', title: '', description: '', academicYear: '2026/2027', term: 'Term 1',
  });
  const [, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [officesRes, treeRes] = await Promise.all([
        apiClient.get<GesOffice[]>('/ges/offices'),
        apiClient.get<any[]>('/ges/offices/tree'),
      ]);
      setOffices(officesRes || []);
      setOfficeTree(treeRes || []);
      // Auto-select first office or national
      const national = (officesRes || []).find((o) => o.level === 'national');
      const firstOffice = national || (officesRes || [])[0];
      if (firstOffice) {
        setSelectedOfficeId(firstOffice.id);
      }
    } catch (err: any) {
      console.error('[GES] Failed to load data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load reports and schools when office changes
  useEffect(() => {
    if (!selectedOfficeId) return;
    (async () => {
      try {
        const [reportsRes, schoolsRes, statsRes] = await Promise.all([
          apiClient.get<GesReport[]>(`/ges/reports?officeId=${selectedOfficeId}&includeChildren=true`),
          apiClient.get<GesSchool[]>(`/ges/schools?officeId=${selectedOfficeId}&includeChildren=true`),
          apiClient.get<any>(`/ges/stats/${selectedOfficeId}?includeChildren=true`),
        ]);
        setReports(reportsRes || []);
        setSchools(schoolsRes || []);
        setStats(statsRes);
      } catch (err: any) {
        console.error('[GES] Failed to load office data:', err.message);
      }
    })();
  }, [selectedOfficeId]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderOfficeNode = (node: GesOffice, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    return (
      <View key={node.id} style={{ marginLeft: depth * 20 }}>
        <TouchableOpacity
          style={styles.treeNode}
          onPress={() => hasChildren ? toggleNode(node.id) : setSelectedOfficeId(node.id)}
        >
          <Text style={{ fontSize: 16, marginRight: 6 }}>
            {hasChildren ? (isExpanded ? '▼' : '▶') : '•'}
          </Text>
          <Text style={[styles.treeNodeText, selectedOfficeId === node.id && styles.treeNodeActive]}>
            {node.name}
          </Text>
          <View style={[styles.levelBadge, { backgroundColor: (node.level === 'national' ? colors.primary : node.level === 'regional' ? colors.info : node.level === 'district' ? colors.warning : colors.success) + '20' }]}>
            <Text style={[styles.levelBadgeText, { color: node.level === 'national' ? colors.primary : node.level === 'regional' ? colors.info : node.level === 'district' ? colors.warning : colors.success }]}>
              {GES_LEVEL_LABELS[node.level] || node.level}
            </Text>
          </View>
        </TouchableOpacity>
        {isExpanded && hasChildren && node.children!.map((child) => renderOfficeNode(child, depth + 1))}
      </View>
    );
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>GES Oversight Dashboard</Text>
            <Text style={styles.pageSubtitle}>Monitor and manage schools across the GES hierarchy</Text>

            {/* Office selector */}
            <Text style={styles.sectionTitle}>Select GES Office</Text>
            <View style={styles.officeChipsRow}>
              {offices.filter((o) => o.level === 'national' || o.level === 'regional').map((o) => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.officeChip, selectedOfficeId === o.id && styles.officeChipActive]}
                  onPress={() => setSelectedOfficeId(o.id)}
                >
                  <Text style={[styles.officeChipText, selectedOfficeId === o.id && styles.officeChipTextActive]}>{o.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {stats && (
              <CardGrid>
                <StatCard label="Total Schools" value={stats.totalSchools || 0} accentColor={colors.primary} icon="🏫" />
                <StatCard label="Total Reports" value={stats.totalReports || 0} accentColor={colors.info} icon="📋" />
                <StatCard label="Pending Review" value={stats.pendingReview || 0} accentColor={colors.warning} icon="⏳" />
                <StatCard label="Overdue" value={stats.overdue || 0} accentColor={colors.danger} icon="⚠" />
              </CardGrid>
            )}

            {stats && stats.byLevel && Object.keys(stats.byLevel).length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Schools by Level</Text>
                <View style={styles.infoCard}>
                  {Object.entries(stats.byLevel).map(([level, count]) => (
                    <View key={level} style={styles.statRow}>
                      <Text style={styles.statLabel}>{GES_LEVEL_LABELS[level] || level}</Text>
                      <Text style={styles.statValue}>{count as number}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {stats && stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Reports by Status</Text>
                <View style={styles.infoCard}>
                  {Object.entries(stats.byStatus).map(([status, count]) => (
                    <View key={status} style={styles.statRow}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] || colors.textLight }]} />
                      <Text style={styles.statLabel}>{status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
                      <Text style={styles.statValue}>{count as number}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {reports.slice(0, 5).map((r) => (
              <View key={r.id} style={styles.reportCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportTitle}>{r.title}</Text>
                  <Text style={styles.reportMeta}>{r.schoolName} · {REPORT_TYPE_LABELS[r.reportType] || r.reportType}</Text>
                  <Text style={styles.reportDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[r.status] || colors.textLight) + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] || colors.textLight }]}>{r.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'offices':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>GES Office Hierarchy</Text>
                <Text style={styles.pageSubtitle}>National → Regional → District → Circuit</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowOfficeModal(true)}>
                <Text style={styles.addBtnText}>+ Add Office</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.treeContainer}>
              {officeTree.map((node) => renderOfficeNode(node))}
            </View>

            {offices.length === 0 && (
              <Text style={styles.emptyText}>No GES offices found. Create the national office to get started.</Text>
            )}
          </ScrollView>
        );

      case 'schools':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Schools Under Oversight</Text>
            <Text style={styles.pageSubtitle}>All schools under selected GES office and its sub-offices</Text>

            {selectedOfficeId && (
              <View style={styles.officeChipsRow}>
                {offices.filter((o) => o.level === 'circuit' || o.level === 'district').slice(0, 10).map((o) => (
                  <TouchableOpacity
                    key={o.id}
                    style={[styles.officeChip, selectedOfficeId === o.id && styles.officeChipActive]}
                    onPress={() => setSelectedOfficeId(o.id)}
                  >
                    <Text style={[styles.officeChipText, selectedOfficeId === o.id && styles.officeChipTextActive]}>{o.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <CardGrid>
              <StatCard label="Total Schools" value={schools.length} accentColor={colors.primary} icon="🏫" />
              <StatCard label="Active" value={schools.filter((s) => s.active).length} accentColor={colors.success} icon="✅" />
              <StatCard label="Inactive" value={schools.filter((s) => !s.active).length} accentColor={colors.textLight} icon="⭕" />
            </CardGrid>

            <Text style={styles.sectionTitle}>School List</Text>
            {schools.length === 0 ? (
              <Text style={styles.emptyText}>No schools found under this office.</Text>
            ) : (
              <DataTable
                columns={[
                  { key: 'schoolName', label: 'School Name' },
                  { key: 'schoolLevel', label: 'Level', render: (s: any) => GES_LEVEL_LABELS[s.schoolLevel] || s.schoolLevel || '—' },
                  { key: 'region', label: 'Region', render: (s: any) => s.region || '—' },
                  { key: 'district', label: 'District', render: (s: any) => s.district || '—' },
                  { key: 'schoolCode', label: 'Code', render: (s: any) => s.schoolCode || '—' },
                ]}
                data={schools}
              />
            )}
          </ScrollView>
        );

      case 'reports':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Compliance Reports</Text>
                <Text style={styles.pageSubtitle}>Reports submitted by schools under this office</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowReportModal(true)}>
                <Text style={styles.addBtnText}>+ New Report</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total" value={reports.length} accentColor={colors.primary} icon="📋" />
              <StatCard label="Pending" value={reports.filter((r) => r.status === 'submitted' || r.status === 'under_review').length} accentColor={colors.warning} icon="⏳" />
              <StatCard label="Approved" value={reports.filter((r) => r.status === 'approved').length} accentColor={colors.success} icon="✅" />
              <StatCard label="Overdue" value={reports.filter((r) => r.status === 'overdue' || (r.deadline && new Date(r.deadline) < new Date() && r.status !== 'approved')).length} accentColor={colors.danger} icon="⚠" />
            </CardGrid>

            <Text style={styles.sectionTitle}>All Reports</Text>
            {reports.length === 0 ? (
              <Text style={styles.emptyText}>No reports found.</Text>
            ) : (
              reports.map((r) => (
                <View key={r.id} style={styles.reportCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportTitle}>{r.title}</Text>
                    <Text style={styles.reportMeta}>{r.schoolName} · {REPORT_TYPE_LABELS[r.reportType] || r.reportType} · {r.academicYear}</Text>
                    <Text style={styles.reportDate}>Submitted: {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'Not submitted'}</Text>
                    {r.deadline && (
                      <Text style={[styles.reportDate, new Date(r.deadline) < new Date() && r.status !== 'approved' && { color: colors.danger }]}>
                        Deadline: {new Date(r.deadline).toLocaleDateString()}
                      </Text>
                    )}
                    {r.reviewNotes && <Text style={styles.reportDate}>Review: {r.reviewNotes}</Text>}
                  </View>
                  <View style={styles.reportActions}>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[r.status] || colors.textLight) + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] || colors.textLight }]}>{r.status.replace(/_/g, ' ')}</Text>
                    </View>
                    {(r.status === 'submitted' || r.status === 'under_review') && (
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                        <TouchableOpacity
                          style={[styles.miniBtn, { backgroundColor: colors.success + '20' }]}
                          onPress={async () => {
                            try {
                              await apiClient.put(`/ges/reports/${r.id}/status?reviewerId=${user?.id || 'ges'}`, { status: 'approved', reviewNotes: 'Approved' });
                              Alert.alert('Success', 'Report approved.');
                              loadData();
                            } catch (err: any) {
                              Alert.alert('Error', err.message || 'Failed to approve report.');
                            }
                          }}
                        >
                          <Text style={[styles.miniBtnText, { color: colors.success }]}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.miniBtn, { backgroundColor: colors.danger + '20' }]}
                          onPress={async () => {
                            try {
                              await apiClient.put(`/ges/reports/${r.id}/status?reviewerId=${user?.id || 'ges'}`, { status: 'rejected', reviewNotes: 'Rejected' });
                              Alert.alert('Success', 'Report rejected.');
                              loadData();
                            } catch (err: any) {
                              Alert.alert('Error', err.message || 'Failed to reject report.');
                            }
                          }}
                        >
                          <Text style={[styles.miniBtnText, { color: colors.danger }]}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        );

      case 'inspections':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Inspection Schedule</Text>
            <Text style={styles.pageSubtitle}>Plan and track school inspections</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>Inspection scheduling features will be available once inspection data is configured.</Text>
              <Text style={styles.infoText}>This module will support:</Text>
              <Text style={styles.infoText}>• Scheduled school inspections by circuit supervisors</Text>
              <Text style={styles.infoText}>• Inspection checklists and forms</Text>
              <Text style={styles.infoText}>• Findings and recommendations tracking</Text>
              <Text style={styles.infoText}>• Follow-up inspection scheduling</Text>
            </View>
          </ScrollView>
        );

      case 'statistics':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Statistics & Analytics</Text>
            <Text style={styles.pageSubtitle}>Aggregate statistics across the GES hierarchy</Text>

            {stats && (
              <>
                <CardGrid>
                  <StatCard label="Total Schools" value={stats.totalSchools || 0} accentColor={colors.primary} icon="🏫" />
                  <StatCard label="Total Reports" value={stats.totalReports || 0} accentColor={colors.info} icon="📋" />
                  <StatCard label="Pending Review" value={stats.pendingReview || 0} accentColor={colors.warning} icon="⏳" />
                  <StatCard label="Overdue" value={stats.overdue || 0} accentColor={colors.danger} icon="⚠" />
                </CardGrid>

                {stats.byType && Object.keys(stats.byType).length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Reports by Type</Text>
                    <View style={styles.infoCard}>
                      {Object.entries(stats.byType).map(([type, count]) => (
                        <View key={type} style={styles.statRow}>
                          <Text style={styles.statLabel}>{REPORT_TYPE_LABELS[type] || type}</Text>
                          <Text style={styles.statValue}>{count as number}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {stats.byLevel && Object.keys(stats.byLevel).length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Schools by Level</Text>
                    <View style={styles.infoCard}>
                      {Object.entries(stats.byLevel).map(([level, count]) => (
                        <View key={level} style={styles.statRow}>
                          <Text style={styles.statLabel}>{GES_LEVEL_LABELS[level] || level}</Text>
                          <Text style={styles.statValue}>{count as number}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Reports by Status</Text>
                    <View style={styles.infoCard}>
                      {Object.entries(stats.byStatus).map(([status, count]) => (
                        <View key={status} style={styles.statRow}>
                          <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] || colors.textLight }]} />
                          <Text style={styles.statLabel}>{status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
                          <Text style={styles.statValue}>{count as number}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DashboardLayout
        navItems={NAV_ITEMS}
        activeKey={activePage}
        onNavigate={setActivePage}
        title="GES Oversight"
      >
        {renderPage()}
      </DashboardLayout>

      {/* Create Office Modal */}
      <Modal visible={showOfficeModal} transparent animationType="fade" onRequestClose={() => setShowOfficeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Create GES Office</Text>

              <Text style={styles.inputLabel}>Office Name</Text>
              <TextInput style={styles.textInput} value={officeForm.name} onChangeText={(v) => setOfficeForm({ ...officeForm, name: v })} placeholder="e.g. Greater Accra Regional Directorate" />

              <Text style={styles.inputLabel}>Office Key</Text>
              <TextInput style={styles.textInput} value={officeForm.officeKey} onChangeText={(v) => setOfficeForm({ ...officeForm, officeKey: v })} placeholder="e.g. ges-greater-accra" autoCapitalize="none" />

              <Text style={styles.inputLabel}>Level</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm }}>
                {Object.entries(GES_LEVEL_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.officeChip, officeForm.level === key && styles.officeChipActive]}
                    onPress={() => setOfficeForm({ ...officeForm, level: key })}
                  >
                    <Text style={[styles.officeChipText, officeForm.level === key && styles.officeChipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Parent Office</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm }}>
                {offices.map((o) => (
                  <TouchableOpacity
                    key={o.id}
                    style={[styles.officeChip, officeForm.parentId === o.id && styles.officeChipActive]}
                    onPress={() => setOfficeForm({ ...officeForm, parentId: o.id })}
                  >
                    <Text style={[styles.officeChipText, officeForm.parentId === o.id && styles.officeChipTextActive]}>{o.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>GES Code (optional)</Text>
              <TextInput style={styles.textInput} value={officeForm.gesCode} onChangeText={(v) => setOfficeForm({ ...officeForm, gesCode: v })} placeholder="e.g. GES-AR-001" />

              <Text style={styles.inputLabel}>Region (optional)</Text>
              <TextInput style={styles.textInput} value={officeForm.region} onChangeText={(v) => setOfficeForm({ ...officeForm, region: v })} placeholder="e.g. Greater Accra" />

              <Text style={styles.inputLabel}>District (optional)</Text>
              <TextInput style={styles.textInput} value={officeForm.district} onChangeText={(v) => setOfficeForm({ ...officeForm, district: v })} placeholder="e.g. Accra Metropolitan" />

              <Text style={styles.inputLabel}>Head Name (optional)</Text>
              <TextInput style={styles.textInput} value={officeForm.headName} onChangeText={(v) => setOfficeForm({ ...officeForm, headName: v })} placeholder="e.g. Mr. John Doe" />

              <Text style={styles.inputLabel}>Head Title (optional)</Text>
              <TextInput style={styles.textInput} value={officeForm.headTitle} onChangeText={(v) => setOfficeForm({ ...officeForm, headTitle: v })} placeholder="e.g. Regional Director" />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalApproveBtn}
                  onPress={async () => {
                    if (!officeForm.name.trim() || !officeForm.officeKey.trim()) {
                      Alert.alert('Error', 'Office name and key are required.');
                      return;
                    }
                    try {
                      await apiClient.post('/ges/offices', {
                        officeKey: officeForm.officeKey.trim(),
                        name: officeForm.name.trim(),
                        level: officeForm.level,
                        parentId: officeForm.parentId || (officeForm.level === 'national' ? undefined : undefined),
                        gesCode: officeForm.gesCode.trim() || undefined,
                        region: officeForm.region.trim() || undefined,
                        district: officeForm.district.trim() || undefined,
                        headName: officeForm.headName.trim() || undefined,
                        headTitle: officeForm.headTitle.trim() || undefined,
                      });
                      setShowOfficeModal(false);
                      setOfficeForm({ officeKey: '', name: '', level: 'regional', parentId: '', gesCode: '', region: '', district: '', headName: '', headTitle: '' });
                      Alert.alert('Success', 'GES office created successfully.');
                      loadData();
                    } catch (err: any) {
                      Alert.alert('Error', err.message || 'Failed to create office.');
                    }
                  }}
                >
                  <Text style={styles.modalBtnTextWhite}>Create Office</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowOfficeModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Report Modal */}
      <Modal visible={showReportModal} transparent animationType="fade" onRequestClose={() => setShowReportModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>New Compliance Report</Text>

              <Text style={styles.inputLabel}>Report Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm }}>
                {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.officeChip, reportForm.reportType === key && styles.officeChipActive]}
                    onPress={() => setReportForm({ ...reportForm, reportType: key })}
                  >
                    <Text style={[styles.officeChipText, reportForm.reportType === key && styles.officeChipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.textInput} value={reportForm.title} onChangeText={(v) => setReportForm({ ...reportForm, title: v })} placeholder="e.g. Term 1 Enrollment Report 2026/2027" />

              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput style={[styles.textInput, { minHeight: 80 }]} value={reportForm.description} onChangeText={(v) => setReportForm({ ...reportForm, description: v })} placeholder="Brief description of the report" multiline />

              <Text style={styles.inputLabel}>Academic Year</Text>
              <TextInput style={styles.textInput} value={reportForm.academicYear} onChangeText={(v) => setReportForm({ ...reportForm, academicYear: v })} placeholder="e.g. 2026/2027" />

              <Text style={styles.inputLabel}>Term</Text>
              <TextInput style={styles.textInput} value={reportForm.term} onChangeText={(v) => setReportForm({ ...reportForm, term: v })} placeholder="e.g. Term 1" />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalApproveBtn}
                  onPress={async () => {
                    if (!reportForm.title.trim()) {
                      Alert.alert('Error', 'Title is required.');
                      return;
                    }
                    try {
                      await apiClient.post(`/ges/reports?tenantId=${user?.tenantId || ''}`, {
                        reportType: reportForm.reportType,
                        title: reportForm.title.trim(),
                        description: reportForm.description.trim() || undefined,
                        academicYear: reportForm.academicYear.trim(),
                        term: reportForm.term.trim() || undefined,
                        gesOfficeId: selectedOfficeId || undefined,
                      });
                      setShowReportModal(false);
                      setReportForm({ reportType: 'enrollment', title: '', description: '', academicYear: '2026/2027', term: 'Term 1' });
                      Alert.alert('Success', 'Report created as draft.');
                      loadData();
                    } catch (err: any) {
                      Alert.alert('Error', err.message || 'Failed to create report.');
                    }
                  }}
                >
                  <Text style={styles.modalBtnTextWhite}>Create Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowReportModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 22, fontWeight: '700' as any, color: colors.text, marginBottom: 4 },
  pageSubtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600' as any, color: colors.text, marginTop: 24, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  addBtnText: { color: colors.white, fontWeight: '600' as any, fontSize: fontSize.sm },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: 40, marginBottom: 40 },
  officeChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  officeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  officeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  officeChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' as any },
  officeChipTextActive: { color: colors.white, fontWeight: '600' as any },
  treeContainer: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  treeNode: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 4 },
  treeNodeText: { fontSize: fontSize.md, color: colors.text, flex: 1 },
  treeNodeActive: { color: colors.primary, fontWeight: '600' as any },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  levelBadgeText: { fontSize: 10, fontWeight: '600' as any },
  reportCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 12 },
  reportTitle: { fontSize: fontSize.md, fontWeight: '600' as any, color: colors.text, marginBottom: 4 },
  reportMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  reportDate: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  reportActions: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  statusText: { fontSize: fontSize.xs, fontWeight: '600' as any },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  miniBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm },
  miniBtnText: { fontSize: fontSize.xs, fontWeight: '600' as any },
  infoCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  infoText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 6 },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  statLabel: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  statValue: { fontSize: fontSize.md, fontWeight: '700' as any, color: colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700' as any, color: colors.text, marginBottom: 16 },
  inputLabel: { fontSize: fontSize.sm, fontWeight: '600' as any, color: colors.text, marginTop: 12, marginBottom: 4 },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalApproveBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.md, flex: 1, alignItems: 'center' },
  modalCancelBtn: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.md, flex: 1, alignItems: 'center' },
  modalBtnTextWhite: { color: colors.white, fontWeight: '600' as any, fontSize: fontSize.md },
  modalBtnTextSecondary: { color: colors.textSecondary, fontWeight: '600' as any, fontSize: fontSize.md },
});
