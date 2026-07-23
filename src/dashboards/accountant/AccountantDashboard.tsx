import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore, useBursaryStore, useBursarStore, useKitchenStore } from '@store/index';
import {
  BURSARY_PAYMENT_METHODS as PAYMENT_METHODS, EXPENDITURE_CATEGORIES,
} from '@store/index';
import { FinancialReqStatus } from '@store/kitchenStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Financial Overview' },
  { key: 'fees', label: 'Fee / Capitation Ledger' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'expenditure', label: 'Expenditure Log' },
  { key: 'budgetSubmissions', label: 'Budget Submissions' },
  { key: 'budget', label: 'Budget Planner' },
  { key: 'kitchenFinance', label: 'Kitchen Finance' },
  { key: 'returnsApproval', label: 'Returns Approval' },
  { key: 'reports', label: 'Financial Reports' },
];

const formatGH = (n: number) => `GH₵${n.toLocaleString()}`;

export function AccountantDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuthStore();
  const userName = user?.displayName ?? 'Accountant';

  const store = useBursaryStore();
  const bursarStore = useBursarStore();
  const kitchenStore = useKitchenStore();
  const { financialReqs, issues, updateFinancialReqStatus } = kitchenStore;
  const { returns, approveReturn, rejectReturn } = bursarStore;

  const { fees, receipts, payroll, expenditure, budgetItems, budgetSubmissions, invoices } = store;

  const totalCollected = store.getTotalCollected();
  const totalOutstanding = store.getTotalOutstanding();
  const payrollTotals = store.getTotalPayroll();
  const totalExpenditure = store.getTotalExpenditure();
  const budgetTotals = store.getTotalBudget();
  const pendingBudgetSubs = store.getPendingBudgetSubmissions();
  const overdueInvoices = store.getOverdueInvoices();

  const pendingReqs = financialReqs.filter((r) => r.status === 'Pending');
  const totalPendingReqs = pendingReqs.reduce((s, r) => s + r.amount, 0);
  const totalDisbursed = financialReqs.filter((r) => r.status === 'Disbursed').reduce((s, r) => s + r.amount, 0);
  const totalApprovedReqs = financialReqs.filter((r) => r.status === 'Approved').reduce((s, r) => s + r.amount, 0);

  const submittedReturns = returns.filter((r) => r.status === 'Submitted');
  const approvedReturns = returns.filter((r) => r.status === 'Approved');
  const rejectedReturns = returns.filter((r) => r.status === 'Rejected');

  const finStatusColor = (s: string) => s === 'Disbursed' ? colors.success : s === 'Approved' ? colors.info : s === 'Rejected' ? colors.danger : colors.warning;

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );

  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    const dateStr = new Date().toISOString().slice(0, 10);
    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'overview') {
      title = 'Financial Overview Report';
      body += `<h2>Financial Summary</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Fees Collected</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(totalCollected)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Outstanding</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(totalOutstanding)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Payroll (Gross)</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(payrollTotals.gross)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Payroll (Net)</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(payrollTotals.net)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Expenditure</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(totalExpenditure)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Budget Allocated</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(budgetTotals.allocated)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Budget Spent</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(budgetTotals.spent)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Budget Remaining</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(budgetTotals.remaining)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Overdue Invoices</td><td style="padding:8px 12px;border:1px solid #ddd">${overdueInvoices.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Budget Submissions</td><td style="padding:8px 12px;border:1px solid #ddd">${pendingBudgetSubs.length}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'fees') {
      title = reportType === 'full' ? title : 'Fee Collection Report';
      body += `<h2>Fee Ledger</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Adm No</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Fee Type</th><th style="padding:6px 8px;border:1px solid #ddd">Due</th><th style="padding:6px 8px;border:1px solid #ddd">Paid</th><th style="padding:6px 8px;border:1px solid #ddd">Balance</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      fees.forEach((f: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${f.admNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${f.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${f.class}</td><td style="padding:4px 8px;border:1px solid #ddd">${f.feeType}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(f.amountDue)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(f.amountPaid)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(f.balance)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.status}</td></tr>`;
      });
      body += `</tbody></table>`;
      body += `<h2>Payment Receipts</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Receipt No</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd">Amount</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Method</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th>
      </tr></thead><tbody>`;
      receipts.forEach((r: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${r.receiptNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.studentName}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(r.amount)}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.method}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.date}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'payroll') {
      title = reportType === 'full' ? title : 'Payroll Summary Report';
      body += `<h2>Payroll — ${payroll[0]?.payPeriod || 'Current Period'}</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Staff</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Position</th><th style="padding:6px 8px;border:1px solid #ddd">Gross</th><th style="padding:6px 8px;border:1px solid #ddd">Deductions</th><th style="padding:6px 8px;border:1px solid #ddd">Net</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      payroll.forEach((p: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${p.staffName}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.position}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(p.grossSalary)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(p.deductions)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(p.netSalary)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${p.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'expenditure') {
      title = reportType === 'full' ? title : 'Expenditure Report';
      body += `<h2>Expenditure Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Category</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Description</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vendor</th><th style="padding:6px 8px;border:1px solid #ddd">Amount</th>
      </tr></thead><tbody>`;
      expenditure.forEach((e: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${e.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${e.category}</td><td style="padding:4px 8px;border:1px solid #ddd">${e.description}</td><td style="padding:4px 8px;border:1px solid #ddd">${e.vendor}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(e.amount)}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'budget') {
      title = reportType === 'full' ? title : 'Budget Report';
      body += `<h2>Budget Allocation vs Actual</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Department</th><th style="padding:6px 8px;border:1px solid #ddd">Allocated</th><th style="padding:6px 8px;border:1px solid #ddd">Spent</th><th style="padding:6px 8px;border:1px solid #ddd">Remaining</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      budgetItems.forEach((b: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${b.department}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(b.allocated)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(b.spent)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(b.remaining)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${b.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'invoices') {
      title = reportType === 'full' ? 'Comprehensive Financial Report' : 'Invoice Report';
      body += `<h2>Invoices</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Invoice No</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd">Total</th><th style="padding:6px 8px;border:1px solid #ddd">Paid</th><th style="padding:6px 8px;border:1px solid #ddd">Balance</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      invoices.forEach((i: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${i.invoiceNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.studentName}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(i.totalAmount)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(i.amountPaid)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(i.balance)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${i.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'budgetSubs') {
      title = reportType === 'full' ? 'Comprehensive Financial Report' : 'Budget Submissions Report';
      body += `<h2>Budget Submissions from Departments</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Department</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Submitted By</th><th style="padding:6px 8px;border:1px solid #ddd">Total Requested</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      budgetSubmissions.forEach((b: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${b.department}</td><td style="padding:4px 8px;border:1px solid #ddd">${b.submittedBy}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(b.totalRequested)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${b.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:40px;color:#1A1A2E;max-width:900px;margin:0 auto}h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}h2{color:#2D3142;margin-top:30px}.header{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#888}.confidential{background:#FEF6E7;border-left:4px solid #F59E0B;padding:10px 15px;margin:15px 0;font-size:13px;color:#92400E}table{font-size:13px}th{font-weight:600}.footer{margin-top:40px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><span>SIMS — Accountant</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1><div class="confidential">CONFIDENTIAL — This report contains financial records for school administration purposes only.</div>${body}
      <div class="footer">SIMS — Financial Report — ${dateStr}</div>
      <script>window.onload=function(){window.print()}</script></body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  const handleApprove = (id: string, status: FinancialReqStatus) => {
    updateFinancialReqStatus(id, status);
    Alert.alert('Updated', `Request marked as ${status}.`);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Financial Overview</Text>
            <Text style={styles.pageSubtitle}>Welcome, {userName}</Text>
            <CardGrid>
              <StatCard label="Fees Collected" value={formatGH(totalCollected)} subtitle="This term" accentColor={colors.success} />
              <StatCard label="Outstanding" value={formatGH(totalOutstanding)} subtitle="Unpaid fees" accentColor={colors.danger} />
              <StatCard label="Payroll (Net)" value={formatGH(payrollTotals.net)} subtitle={payroll[0]?.payPeriod || 'Current'} accentColor={colors.primary} />
              <StatCard label="Expenditure" value={formatGH(totalExpenditure)} subtitle="Total spent" accentColor={colors.warning} />
              <StatCard label="Budget Remaining" value={formatGH(budgetTotals.remaining)} subtitle={`of ${formatGH(budgetTotals.allocated)}`} accentColor={colors.info} />
              <StatCard label="Overdue Invoices" value={overdueInvoices.length} accentColor={colors.danger} />
              <StatCard label="Pending Budget Subs" value={pendingBudgetSubs.length} accentColor={colors.purple} />
              <StatCard label="Kitchen Pending" value={formatGH(totalPendingReqs)} subtitle={`${pendingReqs.length} requests`} accentColor={colors.accent} />
              <StatCard label="Returns to Approve" value={submittedReturns.length} subtitle="From Bursar" accentColor={colors.purple} />
            </CardGrid>

            {overdueInvoices.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Overdue Invoices</Text>
                {overdueInvoices.map((inv) => (
                  <View key={inv.id} style={styles.overdueCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.overdueTitle}>{inv.invoiceNo} — {inv.studentName}</Text>
                      <Text style={styles.overdueMeta}>{inv.class} — Guardian: {inv.guardianName}</Text>
                      <Text style={styles.overdueAmount}>Balance: {formatGH(inv.balance)}</Text>
                    </View>
                    {renderBadge('Overdue', colors.danger)}
                  </View>
                ))}
              </View>
            )}

            {pendingBudgetSubs.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Budget Submissions Awaiting Action</Text>
                {pendingBudgetSubs.map((b) => (
                  <View key={b.id} style={styles.pendingSubCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pendingSubTitle}>{b.department} — {formatGH(b.totalRequested)}</Text>
                      <Text style={styles.pendingSubMeta}>Submitted by: {b.submittedBy}</Text>
                      <Text style={styles.pendingSubMeta}>Supervisor: {b.supervisorName}</Text>
                    </View>
                    {renderBadge(b.status, b.status === 'Supervisor Approved' ? colors.info : colors.warning)}
                  </View>
                ))}
              </View>
            )}

            {pendingReqs.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Kitchen Financial Requests</Text>
                {pendingReqs.map((r) => (
                  <View key={r.id} style={styles.pendingSubCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pendingSubTitle}>{formatGH(r.amount)} — {r.purpose}</Text>
                      <Text style={styles.pendingSubMeta}>Requested by: {r.requestedBy}</Text>
                    </View>
                    {renderBadge('Pending', colors.warning)}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        );

      case 'fees':
        return <FeesPage fees={fees} receipts={receipts} store={store} renderBadge={renderBadge} userName={userName} />;

      case 'invoices':
        return <InvoicesPage invoices={invoices} store={store} renderBadge={renderBadge} />;

      case 'payroll':
        return <PayrollPage payroll={payroll} store={store} renderBadge={renderBadge} totals={payrollTotals} />;

      case 'expenditure':
        return <ExpenditurePage expenditure={expenditure} store={store} totalExpenditure={totalExpenditure} />;

      case 'budgetSubmissions':
        return <BudgetSubmissionsPage submissions={budgetSubmissions} store={store} renderBadge={renderBadge} />;

      case 'budget':
        return <BudgetPage budgetItems={budgetItems} renderBadge={renderBadge} totals={budgetTotals} />;

      case 'kitchenFinance':
        return (
          <ScrollView>
            <CardGrid>
              <StatCard label="Pending" value={pendingReqs.length} subtitle="Awaiting review" accentColor={colors.warning} />
              <StatCard label="Pending Amount" value={formatGH(totalPendingReqs)} subtitle="To be approved" accentColor={colors.primary} />
              <StatCard label="Approved" value={formatGH(totalApprovedReqs)} subtitle="Ready to disburse" accentColor={colors.info} />
              <StatCard label="Disbursed" value={formatGH(totalDisbursed)} subtitle="Total paid out" accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Kitchen Financial Requests</Text>
            <Text style={styles.pageSubtitle}>Money requests from Catering Department — approve or reject (disbursement handled by Bursar)</Text>

            {pendingReqs.length > 0 && (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>⚠ {pendingReqs.length} Pending Request{pendingReqs.length > 1 ? 's' : ''}</Text>
                <Text style={styles.alertText}>{formatGH(totalPendingReqs)} awaiting your approval from the Kitchen.</Text>
              </View>
            )}

            {financialReqs.length === 0 ? (
              <Text style={styles.emptyText}>No kitchen financial requests.</Text>
            ) : (
              financialReqs.map((r) => (
                <View key={r.id} style={styles.finCard}>
                  <View style={styles.finHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.finAmount}>{formatGH(r.amount)}</Text>
                      <Text style={styles.finMeta}>{r.date} | {r.purpose}</Text>
                      <Text style={styles.finBy}>Requested by: {r.requestedBy}</Text>
                      {r.notes ? <Text style={styles.finNotes}>{r.notes}</Text> : null}
                    </View>
                    {renderBadge(r.status, finStatusColor(r.status))}
                  </View>
                  {r.status === 'Pending' && (
                    <View style={styles.finActions}>
                      <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.success }]} onPress={() => handleApprove(r.id, 'Approved')}>
                        <Text style={styles.finBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.danger }]} onPress={() => handleApprove(r.id, 'Rejected')}>
                        <Text style={styles.finBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {r.status === 'Approved' && (
                    <View style={styles.finActions}>
                      <Text style={styles.finInfoText}>Awaiting Bursar disbursement</Text>
                    </View>
                  )}
                </View>
              ))
            )}

            <Text style={styles.pageTitle}>Kitchen Stock Issues</Text>
            <Text style={styles.pageSubtitle}>Items issued from kitchen stock for meal preparation</Text>
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (i: any) => i.date },
                { key: 'item', label: 'Item', render: (i: any) => i.itemName },
                { key: 'qty', label: 'Qty', render: (i: any) => `${i.quantity} ${i.unit}` },
                { key: 'to', label: 'Issued To', render: (i: any) => i.issuedTo },
                { key: 'purpose', label: 'Purpose', render: (i: any) => i.purpose || '—' },
              ]}
              data={issues}
            />
          </ScrollView>
        );

      case 'returnsApproval':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Bursary Returns Approval</Text>
            <Text style={styles.pageSubtitle}>Daily/Monthly returns submitted by the Bursar — review and approve or reject</Text>

            <CardGrid>
              <StatCard label="Submitted" value={submittedReturns.length} subtitle="Awaiting review" accentColor={colors.warning} />
              <StatCard label="Approved" value={approvedReturns.length} accentColor={colors.success} />
              <StatCard label="Rejected" value={rejectedReturns.length} accentColor={colors.danger} />
            </CardGrid>

            {submittedReturns.length > 0 && (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>⚠ {submittedReturns.length} Return{submittedReturns.length > 1 ? 's' : ''} Awaiting Approval</Text>
                <Text style={styles.alertText}>The Bursar has submitted returns that need your review.</Text>
              </View>
            )}

            {returns.length === 0 ? (
              <Text style={styles.emptyText}>No bursary returns submitted.</Text>
            ) : (
              returns.map((r: any) => (
                <View key={r.id} style={styles.returnCard}>
                  <View style={styles.finHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.returnPeriod}>{r.period} Return — {r.dateFrom} to {r.dateTo}</Text>
                      <Text style={styles.finMeta}>Income: {formatGH(r.totalIncome)} — Expense: {formatGH(r.totalExpense)}</Text>
                      <Text style={[styles.finAmount, { color: r.netBalance >= 0 ? colors.success : colors.danger }]}>Net: {formatGH(r.netBalance)}</Text>
                      <Text style={styles.finBy}>Submitted by: {r.submittedBy}{r.dateSubmitted ? ` on ${r.dateSubmitted}` : ''}</Text>
                      {r.approvedBy ? <Text style={styles.finBy}>Approved by: {r.approvedBy}</Text> : null}
                      {r.notes ? <Text style={styles.finNotes}>{r.notes}</Text> : null}
                    </View>
                    {renderBadge(r.status, r.status === 'Approved' ? colors.success : r.status === 'Rejected' ? colors.danger : r.status === 'Submitted' ? colors.info : colors.textSecondary)}
                  </View>
                  {r.status === 'Submitted' && (
                    <View style={styles.finActions}>
                      <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.success }]} onPress={() => { approveReturn(r.id, userName); Alert.alert('Success', 'Return approved.'); }}>
                        <Text style={styles.finBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.danger }]} onPress={() => { rejectReturn(r.id); Alert.alert('Success', 'Return rejected.'); }}>
                        <Text style={styles.finBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        );

      case 'reports':
        return <ReportsPage generatePDF={generatePDF} totals={{ totalCollected, totalOutstanding, payrollTotals, totalExpenditure, budgetTotals, overdueInvoices: overdueInvoices.length, pendingBudgetSubs: pendingBudgetSubs.length }} />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Accountant" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
    </DashboardLayout>
  );
}

// ── Fees Page ──

function FeesPage({ fees, receipts, store, renderBadge, userName }: any) {
  const [showPay, setShowPay] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ amount: '', method: PAYMENT_METHODS[0], notes: '' });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const feeStatusColor = (s: string) => s === 'Cleared' ? colors.success : s === 'Partial' ? colors.warning : colors.danger;

  const filtered = fees.filter((f: any) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || f.studentName.toLowerCase().includes(q) || f.admNo.toLowerCase().includes(q) || f.class.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'All' || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handlePay = () => {
    if (!showPay) return;
    const amount = parseFloat(payForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Invalid amount.');
      return;
    }
    store.recordPayment(showPay, amount, payForm.method, userName, payForm.notes);
    setPayForm({ amount: '', method: PAYMENT_METHODS[0], notes: '' });
    setShowPay(null);
    Alert.alert('Success', 'Payment recorded. Receipt generated.');
  };

  const payingFee = fees.find((f: any) => f.id === showPay);

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Fee / Capitation Ledger</Text>
      <Text style={styles.pageSubtitle}>{fees.length} fee records — {formatGH(store.getTotalCollected())} collected, {formatGH(store.getTotalOutstanding())} outstanding</Text>

      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Search by name, adm no, class..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
      </View>
      <View style={styles.filterRow}>
        {['All', 'Cleared', 'Partial', 'Owing'].map((s) => (
          <TouchableOpacity key={s} style={[styles.filterChip, filterStatus === s && styles.filterChipActive]} onPress={() => setFilterStatus(s)}>
            <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={!!showPay} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            {payingFee && (
              <>
                <Text style={styles.payStudent}>{payingFee.studentName} — {payingFee.admNo}</Text>
                <Text style={styles.payMeta}>{payingFee.feeType} — {payingFee.term}</Text>
                <Text style={styles.payMeta}>Due: {formatGH(payingFee.amountDue)} | Paid: {formatGH(payingFee.amountPaid)} | Balance: {formatGH(payingFee.balance)}</Text>
              </>
            )}
            <Text style={styles.inputLabel}>Amount (GH₵)</Text>
            <TextInput style={styles.textInput} value={payForm.amount} onChangeText={(v) => setPayForm({ ...payForm, amount: v })} placeholder="500" keyboardType="numeric" />
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.pickerRow}>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity key={m} style={[styles.pickerChip, payForm.method === m && styles.pickerChipActive]} onPress={() => setPayForm({ ...payForm, method: m })}>
                  <Text style={[styles.pickerChipText, payForm.method === m && styles.pickerChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput style={[styles.textInput, { minHeight: 50 }]} value={payForm.notes} onChangeText={(v) => setPayForm({ ...payForm, notes: v })} placeholder="Optional notes..." multiline />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowPay(null)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handlePay}>
                <Text style={styles.modalBtnTextSubmit}>Record Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DataTable
        columns={[
          { key: 'admNo', label: 'Adm No', render: (i: any) => i.admNo },
          { key: 'student', label: 'Student', render: (i: any) => i.studentName },
          { key: 'feeType', label: 'Fee Type', render: (i: any) => i.feeType },
          { key: 'due', label: 'Due', render: (i: any) => formatGH(i.amountDue) },
          { key: 'paid', label: 'Paid', render: (i: any) => formatGH(i.amountPaid) },
          { key: 'balance', label: 'Balance', render: (i: any) => formatGH(i.balance) },
          { key: 'status', label: 'Status', render: (i: any) => renderBadge(i.status, feeStatusColor(i.status)) },
        ]}
        data={filtered}
      />

      {filtered.length === 0 && <Text style={styles.emptyText}>No fee records found.</Text>}

      {filtered.filter((f: any) => f.balance > 0).length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Quick Payment</Text>
          {filtered.filter((f: any) => f.balance > 0).map((f: any) => (
            <TouchableOpacity key={f.id} style={styles.payRow} onPress={() => setShowPay(f.id)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.payRowName}>{f.studentName} — {f.admNo}</Text>
                <Text style={styles.payRowBalance}>Balance: {formatGH(f.balance)}</Text>
              </View>
              <Text style={styles.payRowAction}>Record Payment →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Payment Receipts</Text>
      {receipts.map((r: any) => (
        <View key={r.id} style={styles.receiptCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.receiptNo}>{r.receiptNo}</Text>
            <Text style={styles.receiptMeta}>{r.studentName} — {r.date}</Text>
            <Text style={styles.receiptAmount}>{formatGH(r.amount)} via {r.method}</Text>
            <Text style={styles.receiptNotes}>{r.notes}</Text>
          </View>
          <Text style={styles.receiptBy}>Received by {r.receivedBy}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Invoices Page ──

function InvoicesPage({ invoices, store, renderBadge }: any) {
  const invStatusColor = (s: string) => s === 'Paid' ? colors.success : s === 'Overdue' ? colors.danger : s === 'Cancelled' ? colors.textLight : colors.info;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Invoices</Text>
      <Text style={styles.pageSubtitle}>{invoices.length} invoices — {invoices.filter((i: any) => i.status === 'Overdue').length} overdue</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Issue Invoice', 'Use the Fee Ledger to record payments. Invoices are auto-generated for owing students.')}>
        <Text style={styles.actionBtnText}>+ Issue Invoice</Text>
      </TouchableOpacity>

      {invoices.map((inv: any) => (
        <View key={inv.id} style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.invoiceNo}>{inv.invoiceNo}</Text>
              <Text style={styles.invoiceStudent}>{inv.studentName} — {inv.class}</Text>
              <Text style={styles.invoiceMeta}>Guardian: {inv.guardianName}</Text>
              <Text style={styles.invoiceMeta}>Term: {inv.term}</Text>
              <Text style={styles.invoiceMeta}>Issued: {inv.dateIssued} — Due: {inv.dueDate}</Text>
            </View>
            {renderBadge(inv.status, invStatusColor(inv.status))}
          </View>
          <View style={styles.invoiceItems}>
            {inv.items.map((item: any, i: number) => (
              <View key={i} style={styles.invoiceItemRow}>
                <Text style={styles.invoiceItemDesc}>{item.description}</Text>
                <Text style={styles.invoiceItemAmt}>{formatGH(item.amount)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.invoiceFooter}>
            <Text style={styles.invoiceTotal}>Total: {formatGH(inv.totalAmount)}</Text>
            <Text style={styles.invoicePaid}>Paid: {formatGH(inv.amountPaid)}</Text>
            <Text style={styles.invoiceBalance}>Balance: {formatGH(inv.balance)}</Text>
          </View>
          {inv.status !== 'Cancelled' && inv.status !== 'Paid' && (
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.danger, marginTop: spacing.sm }]} onPress={() => { store.cancelInvoice(inv.id); Alert.alert('Success', 'Invoice cancelled.'); }}>
              <Text style={styles.modalBtnTextSubmit}>Cancel Invoice</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Payroll Page ──

function PayrollPage({ payroll, store, renderBadge, totals }: any) {
  const payrollStatusColor = (s: string) => s === 'Paid' ? colors.success : s === 'Processed' ? colors.info : colors.warning;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Payroll</Text>
      <Text style={styles.pageSubtitle}>{payroll[0]?.payPeriod || 'Current period'}</Text>
      <CardGrid>
        <StatCard label="Total Gross" value={formatGH(totals.gross)} accentColor={colors.primary} />
        <StatCard label="Total Deductions" value={formatGH(totals.deductions)} accentColor={colors.danger} />
        <StatCard label="Total Net" value={formatGH(totals.net)} accentColor={colors.success} />
        <StatCard label="Pending" value={payroll.filter((p: any) => p.status === 'Pending').length} accentColor={colors.warning} />
      </CardGrid>

      {payroll.map((p: any) => (
        <View key={p.id} style={styles.payrollCard}>
          <View style={styles.payrollHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.payrollName}>{p.staffName}</Text>
              <Text style={styles.payrollPosition}>{p.position} — {p.department}</Text>
            </View>
            {renderBadge(p.status, payrollStatusColor(p.status))}
          </View>
          <View style={styles.payrollRow}>
            <View style={styles.payrollCol}><Text style={styles.payrollLabel}>Gross</Text><Text style={styles.payrollValue}>{formatGH(p.grossSalary)}</Text></View>
            <View style={styles.payrollCol}><Text style={styles.payrollLabel}>SSF</Text><Text style={styles.payrollValue}>{formatGH(p.ssfContribution)}</Text></View>
            <View style={styles.payrollCol}><Text style={styles.payrollLabel}>Tax</Text><Text style={styles.payrollValue}>{formatGH(p.taxDeduction)}</Text></View>
            <View style={styles.payrollCol}><Text style={styles.payrollLabel}>Net</Text><Text style={[styles.payrollValue, { color: colors.success }]}>{formatGH(p.netSalary)}</Text></View>
          </View>
          {p.status === 'Pending' && (
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.info, marginTop: spacing.sm }]} onPress={() => { store.processPayroll(p.id); Alert.alert('Success', 'Payroll processed.'); }}>
              <Text style={styles.modalBtnTextSubmit}>Process Payroll</Text>
            </TouchableOpacity>
          )}
          {p.status === 'Processed' && (
            <Text style={styles.finInfoText}>Awaiting Bursar payment</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Expenditure Page ──

function ExpenditurePage({ expenditure, store, totalExpenditure }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: EXPENDITURE_CATEGORIES[0], description: '', amount: '', vendor: '', paymentMethod: PAYMENT_METHODS[0], authorizedBy: '', notes: '' });

  const catColor = (c: string) => c === 'Utilities' ? colors.info : c === 'Salaries' ? colors.success : c === 'Repairs' ? colors.warning : c === 'Equipment' ? colors.purple : c === 'Capital' ? colors.accent : colors.textSecondary;

  const byCategory = store.getExpenditureByCategory();

  const handleRecord = () => {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0 || !form.description || !form.vendor) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    store.recordExpenditure({ ...form, amount, authorizedBy: form.authorizedBy || 'Accountant' });
    setForm({ category: EXPENDITURE_CATEGORIES[0], description: '', amount: '', vendor: '', paymentMethod: PAYMENT_METHODS[0], authorizedBy: '', notes: '' });
    setShowForm(false);
    Alert.alert('Success', 'Expenditure recorded.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Expenditure Log</Text>
      <Text style={styles.pageSubtitle}>Total: {formatGH(totalExpenditure)} — {expenditure.length} entries</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Record Expenditure</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Record Expenditure</Text>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.pickerRow}>
                {EXPENDITURE_CATEGORIES.map((c) => (
                  <TouchableOpacity key={c} style={[styles.pickerChip, form.category === c && styles.pickerChipActive]} onPress={() => setForm({ ...form, category: c })}>
                    <Text style={[styles.pickerChipText, form.category === c && styles.pickerChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={styles.textInput} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
              <Text style={styles.inputLabel}>Amount (GH₵)</Text>
              <TextInput style={styles.textInput} value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} placeholder="500" keyboardType="numeric" />
              <Text style={styles.inputLabel}>Vendor / Payee</Text>
              <TextInput style={styles.textInput} value={form.vendor} onChangeText={(v) => setForm({ ...form, vendor: v })} />
              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.pickerRow}>
                {PAYMENT_METHODS.map((m) => (
                  <TouchableOpacity key={m} style={[styles.pickerChip, form.paymentMethod === m && styles.pickerChipActive]} onPress={() => setForm({ ...form, paymentMethod: m })}>
                    <Text style={[styles.pickerChipText, form.paymentMethod === m && styles.pickerChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Authorized By</Text>
              <TextInput style={styles.textInput} value={form.authorizedBy} onChangeText={(v) => setForm({ ...form, authorizedBy: v })} placeholder="Headmaster" />
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={[styles.textInput, { minHeight: 50 }]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleRecord}>
                  <Text style={styles.modalBtnTextSubmit}>Record</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>By Category</Text>
      {byCategory.map((c: any) => {
        const pct = totalExpenditure > 0 ? Math.round((c.total / totalExpenditure) * 100) : 0;
        return (
          <View key={c.category} style={styles.catBarRow}>
            <Text style={styles.catBarLabel}>{c.category}</Text>
            <View style={styles.catBarTrack}>
              <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: catColor(c.category) }]} />
            </View>
            <Text style={styles.catBarAmount}>{formatGH(c.total)}</Text>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>All Expenditure</Text>
      {expenditure.map((e: any) => (
        <View key={e.id} style={styles.expCard}>
          <View style={styles.expHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.expDesc}>{e.description}</Text>
              <Text style={styles.expMeta}>{e.date} — {e.vendor} — {e.paymentMethod}</Text>
              <Text style={styles.expAuth}>Authorized by: {e.authorizedBy}</Text>
              {e.notes ? <Text style={styles.expNotes}>{e.notes}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.expAmount}>{formatGH(e.amount)}</Text>
              <View style={[styles.typeBadge, { backgroundColor: catColor(e.category) + '20', marginTop: 4 }]}>
                <Text style={[styles.typeText, { color: catColor(e.category) }]}>{e.category}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Budget Submissions Page ──

function BudgetSubmissionsPage({ submissions, store, renderBadge }: any) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showReview, setShowReview] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  const subStatusColor = (s: string) => s === 'Accountant Approved' ? colors.success : s === 'Rejected' ? colors.danger : s === 'Supervisor Approved' ? colors.info : s === 'Pending Accountant' ? colors.warning : colors.textSecondary;

  const handleReview = () => {
    if (!showReview) return;
    if (reviewAction === 'approve') {
      store.approveBudgetSubmissionAccountant(showReview, reviewNotes);
      Alert.alert('Success', 'Budget submission approved.');
    } else {
      store.rejectBudgetSubmission(showReview, reviewNotes);
      Alert.alert('Success', 'Budget submission rejected.');
    }
    setShowReview(null);
    setReviewNotes('');
  };

  const detailSub = submissions.find((s: any) => s.id === showReview);

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Budget Submissions</Text>
      <Text style={styles.pageSubtitle}>Budget requests from departments via supervisors — {submissions.length} submissions</Text>

      {submissions.map((s: any) => (
        <View key={s.id} style={styles.subCard}>
          <TouchableOpacity onPress={() => setExpanded(expanded === s.id ? null : s.id)}>
            <View style={styles.subHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subDepartment}>{s.department}</Text>
                <Text style={styles.subMeta}>Submitted by: {s.submittedBy}</Text>
                <Text style={styles.subMeta}>Supervisor: {s.supervisorName}</Text>
                <Text style={styles.subMeta}>Date: {s.dateSubmitted}</Text>
                <Text style={styles.subAmount}>Total Requested: {formatGH(s.totalRequested)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                {renderBadge(s.status, subStatusColor(s.status))}
                <Text style={styles.expandToggle}>{expanded === s.id ? '−' : '+'}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {expanded === s.id && (
            <View style={styles.subDetail}>
              <Text style={styles.subJustLabel}>Justification:</Text>
              <Text style={styles.subJustText}>{s.justification}</Text>

              <Text style={styles.subJustLabel}>Requested Items:</Text>
              {s.items.map((item: any, i: number) => (
                <View key={i} style={styles.subItemRow}>
                  <Text style={styles.subItemDesc}>{item.description}</Text>
                  <Text style={styles.subItemQty}>{item.quantity} × {formatGH(item.unitCost)}</Text>
                  <Text style={styles.subItemTotal}>{formatGH(item.total)}</Text>
                </View>
              ))}

              {s.supervisorNotes && (
                <>
                  <Text style={styles.subJustLabel}>Supervisor Notes:</Text>
                  <Text style={styles.subJustText}>{s.supervisorNotes}</Text>
                </>
              )}
              {s.accountantNotes && (
                <>
                  <Text style={styles.subJustLabel}>Accountant Notes:</Text>
                  <Text style={styles.subJustText}>{s.accountantNotes}</Text>
                </>
              )}

              {(s.status === 'Pending Accountant' || s.status === 'Supervisor Approved') && (
                <View style={styles.subActions}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.success }]} onPress={() => { setShowReview(s.id); setReviewAction('approve'); setReviewNotes(''); }}>
                    <Text style={styles.modalBtnTextSubmit}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.danger }]} onPress={() => { setShowReview(s.id); setReviewAction('reject'); setReviewNotes(''); }}>
                    <Text style={styles.modalBtnTextSubmit}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {detailSub && (
        <Modal visible={!!showReview} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{reviewAction === 'approve' ? 'Approve Budget Submission' : 'Reject Budget Submission'}</Text>
              <Text style={styles.payStudent}>{detailSub.department} — {formatGH(detailSub.totalRequested)}</Text>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={[styles.textInput, { minHeight: 80 }]} value={reviewNotes} onChangeText={setReviewNotes} placeholder={reviewAction === 'approve' ? 'Approval notes...' : 'Reason for rejection...'} multiline />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowReview(null)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: reviewAction === 'approve' ? colors.success : colors.danger }]} onPress={handleReview}>
                  <Text style={styles.modalBtnTextSubmit}>{reviewAction === 'approve' ? 'Approve' : 'Reject'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

// ── Budget Page ──

function BudgetPage({ budgetItems, renderBadge, totals }: any) {
  const budgetStatusColor = (s: string) => s === 'Active' ? colors.success : s === 'Approved' ? colors.info : s === 'Submitted' ? colors.warning : s === 'Rejected' ? colors.danger : colors.textSecondary;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Budget Planner</Text>
      <Text style={styles.pageSubtitle}>Term 3, 2025/2026 Academic Year</Text>
      <CardGrid>
        <StatCard label="Total Allocated" value={formatGH(totals.allocated)} accentColor={colors.primary} />
        <StatCard label="Total Spent" value={formatGH(totals.spent)} accentColor={colors.warning} />
        <StatCard label="Total Remaining" value={formatGH(totals.remaining)} accentColor={colors.success} />
        <StatCard label="Utilization" value={`${totals.allocated > 0 ? Math.round((totals.spent / totals.allocated) * 100) : 0}%`} accentColor={colors.info} />
      </CardGrid>

      {budgetItems.map((b: any) => {
        const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
        return (
          <View key={b.id} style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.budgetDept}>{b.department}</Text>
                <Text style={styles.budgetNotes}>{b.notes}</Text>
              </View>
              {renderBadge(b.status, budgetStatusColor(b.status))}
            </View>
            <View style={styles.budgetBarRow}>
              <View style={styles.budgetBarTrack}>
                <View style={[styles.budgetBarFill, { width: `${pct}%`, backgroundColor: pct > 80 ? colors.danger : pct > 50 ? colors.warning : colors.success }]} />
              </View>
              <Text style={styles.budgetBarPct}>{pct}%</Text>
            </View>
            <View style={styles.budgetFooter}>
              <Text style={styles.budgetAllocated}>Allocated: {formatGH(b.allocated)}</Text>
              <Text style={styles.budgetSpent}>Spent: {formatGH(b.spent)}</Text>
              <Text style={styles.budgetRemaining}>Remaining: {formatGH(b.remaining)}</Text>
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Submit', 'Budget will be submitted to the Governing Board for approval.')}>
        <Text style={styles.actionBtnText}>Submit for Board Approval</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Reports Page ──

function ReportsPage({ generatePDF, totals }: any) {
  const reportTypes = [
    { key: 'overview', name: 'Financial Overview', desc: 'Complete financial summary', color: colors.primary },
    { key: 'fees', name: 'Fee Collection Report', desc: `${formatGH(totals.totalCollected)} collected, ${formatGH(totals.totalOutstanding)} outstanding`, color: colors.success },
    { key: 'payroll', name: 'Payroll Summary', desc: `Net: ${formatGH(totals.payrollTotals.net)}`, color: colors.info },
    { key: 'expenditure', name: 'Expenditure Report', desc: `Total: ${formatGH(totals.totalExpenditure)}`, color: colors.warning },
    { key: 'budget', name: 'Budget vs Actual', desc: `Remaining: ${formatGH(totals.budgetTotals.remaining)}`, color: colors.purple },
    { key: 'invoices', name: 'Invoice Report', desc: `${totals.overdueInvoices} overdue`, color: colors.danger },
    { key: 'budgetSubs', name: 'Budget Submissions', desc: `${totals.pendingBudgetSubs} pending`, color: colors.accent },
  ];

  const collectedPct = (totals.totalCollected + totals.totalOutstanding) > 0 ? Math.round((totals.totalCollected / (totals.totalCollected + totals.totalOutstanding)) * 100) : 0;
  const outstandingPct = (totals.totalCollected + totals.totalOutstanding) > 0 ? Math.round((totals.totalOutstanding / (totals.totalCollected + totals.totalOutstanding)) * 100) : 0;
  const budgetUsedPct = totals.budgetTotals.allocated > 0 ? Math.round((totals.budgetTotals.spent / totals.budgetTotals.allocated) * 100) : 0;
  const budgetRemainingPct = totals.budgetTotals.allocated > 0 ? Math.round((totals.budgetTotals.remaining / totals.budgetTotals.allocated) * 100) : 0;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Financial Reports</Text>
      <Text style={styles.pageSubtitle}>Generate printable PDF reports for financial operations</Text>

      <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
        <Text style={styles.pdfFullBtnText}>Generate Full Financial Report (PDF)</Text>
      </TouchableOpacity>

      <View style={styles.pdfBtnRow}>
        {reportTypes.map((r) => (
          <TouchableOpacity key={r.key} style={[styles.pdfBtn, { backgroundColor: r.color }]} onPress={() => generatePDF(r.key)}>
            <Text style={styles.pdfBtnText}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Fee Collection</Text>
        <TouchableOpacity onPress={() => generatePDF('fees')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Collected</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${collectedPct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{formatGH(totals.totalCollected)}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Outstanding</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${outstandingPct}%`, backgroundColor: colors.danger }]} />
          </View>
          <Text style={styles.reportBarCount}>{formatGH(totals.totalOutstanding)}</Text>
        </View>
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Budget Utilization</Text>
        <TouchableOpacity onPress={() => generatePDF('budget')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Spent</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${budgetUsedPct}%`, backgroundColor: colors.warning }]} />
          </View>
          <Text style={styles.reportBarCount}>{formatGH(totals.budgetTotals.spent)}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Remaining</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${budgetRemainingPct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{formatGH(totals.budgetTotals.remaining)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },

  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  // Search & Filter
  searchRow: { marginBottom: spacing.sm },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },

  // Action
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500, maxHeight: '90%' },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pickerChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  pickerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  pickerChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  modalBtnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextCancel: { color: colors.textSecondary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  modalBtnTextSubmit: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  // Payment
  payStudent: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  payMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  payRow: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payRowName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  payRowBalance: { fontSize: fontSize.sm, color: colors.danger, marginTop: 2 },
  payRowAction: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },

  // Receipts
  receiptCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptNo: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  receiptMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  receiptAmount: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.success, marginTop: 2 },
  receiptNotes: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  receiptBy: { fontSize: fontSize.xs, color: colors.textLight, textAlign: 'right' },

  // Invoices
  invoiceCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  invoiceNo: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  invoiceStudent: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: 2 },
  invoiceMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  invoiceItems: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight },
  invoiceItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  invoiceItemDesc: { fontSize: fontSize.sm, color: colors.text },
  invoiceItemAmt: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  invoiceFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight },
  invoiceTotal: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  invoicePaid: { fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semibold },
  invoiceBalance: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.bold },

  // Payroll
  payrollCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  payrollHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payrollName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  payrollPosition: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  payrollRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  payrollCol: { flex: 1 },
  payrollLabel: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  payrollValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.semibold, marginTop: 2 },

  // Expenditure
  expCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  expDesc: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  expMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  expAuth: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  expNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic' as const, marginTop: 2 },
  expAmount: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.danger },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  typeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  catBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  catBarLabel: { fontSize: fontSize.sm, color: colors.textSecondary, width: 100, flexShrink: 0 },
  catBarTrack: { flex: 1, height: 12, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, marginHorizontal: spacing.sm, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: radius.sm },
  catBarAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, width: 70, textAlign: 'right' },

  // Budget Submissions
  subCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subDepartment: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  subMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  subAmount: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, marginTop: spacing.xs },
  expandToggle: { fontSize: fontSize.xl, color: colors.primary, fontWeight: fontWeight.bold },
  subDetail: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  subJustLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.sm },
  subJustText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  subItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  subItemDesc: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  subItemQty: { fontSize: fontSize.sm, color: colors.textSecondary, marginHorizontal: spacing.sm },
  subItemTotal: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.semibold },
  subActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },

  // Budget
  budgetCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  budgetDept: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  budgetNotes: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  budgetBarRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  budgetBarTrack: { flex: 1, height: 10, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, overflow: 'hidden' },
  budgetBarFill: { height: '100%', borderRadius: radius.sm },
  budgetBarPct: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  budgetAllocated: { fontSize: fontSize.sm, color: colors.textSecondary },
  budgetSpent: { fontSize: fontSize.sm, color: colors.warning, fontWeight: fontWeight.semibold },
  budgetRemaining: { fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semibold },

  // Overview
  overdueCard: { backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: colors.danger },
  overdueTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.danger },
  overdueMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  overdueAmount: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.semibold, marginTop: 2 },
  pendingSubCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pendingSubTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  pendingSubMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  // Kitchen Finance
  alertCard: { backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.warning },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.warning, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary },
  finCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  finHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  finAmount: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  finMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  finBy: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  finNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic' as const, marginTop: 2 },
  finActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  finBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: 'center' },
  finBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  finInfoText: { fontSize: fontSize.sm, color: colors.textSecondary, fontStyle: 'italic' as const, textAlign: 'center', marginTop: spacing.sm },

  // Returns
  returnCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  returnPeriod: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },

  // Reports
  pdfFullBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  pdfFullBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  pdfBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pdfBtn: { borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  pdfBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  pdfLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },
  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
  reportSectionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  reportBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  reportBarLabel: { fontSize: fontSize.sm, color: colors.textSecondary, width: 100, flexShrink: 0 },
  reportBarTrack: { flex: 1, height: 12, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, marginHorizontal: spacing.sm, overflow: 'hidden' },
  reportBarFill: { height: '100%', borderRadius: radius.sm },
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, width: 80, textAlign: 'right' },

  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
