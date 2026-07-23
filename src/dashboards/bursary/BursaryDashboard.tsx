import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore, useBursarStore, useBursaryStore, useKitchenStore } from '@store/index';
import {
  CASH_TXN_CATEGORIES,
  RETURN_PERIODS, MEAL_TYPES, HOUSES, SUPPLY_UNITS,
} from '@store/index';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Bursary Overview' },
  { key: 'cashbook', label: 'Cash Book' },
  { key: 'studentAccounts', label: 'Student Accounts' },
  { key: 'pettyCash', label: 'Petty Cash' },
  { key: 'imprest', label: 'Imprest Accounts' },
  { key: 'procurement', label: 'Procurement' },
  { key: 'feeding', label: 'Feeding Account' },
  { key: 'boardingSupplies', label: 'Boarding Supplies' },
  { key: 'disbursements', label: 'Disbursements' },
  { key: 'returns', label: 'Daily/Monthly Returns' },
  { key: 'reports', label: 'Bursary Reports' },
];

const formatGH = (n: number) => `GH₵${n.toLocaleString()}`;

export function BursaryDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuthStore();
  const userName = user?.displayName ?? 'Bursar';

  const store = useBursarStore();
  const bursaryStore = useBursaryStore();
  const kitchenStore = useKitchenStore();
  const { cashTransactions, studentAccounts, pettyCash, imprest, procurement, feeding, boardingSupplies, returns } = store;
  const { payroll } = bursaryStore;
  const { financialReqs } = kitchenStore;

  const cashBalance = store.getCashBalance();
  const totalIncome = store.getTotalIncome();
  const totalExpense = store.getTotalExpense();
  const feedingByMeal = store.getFeedingCostByMeal();
  const boardingTotal = store.getBoardingSupplyTotal();
  const pendingPettyCash = pettyCash.filter((p) => p.status === 'Requested');
  const pendingProcurement = procurement.filter((p) => p.status === 'Requisitioned');
  const pendingImprest = imprest.filter((i) => i.status === 'Pending Retirement');
  const draftReturns = returns.filter((r) => r.status === 'Draft');

  const approvedBudgetSubs = bursaryStore.getApprovedBudgetSubmissions();
  const approvedKitchenReqs = financialReqs.filter((r) => r.status === 'Approved');
  const processedPayroll = payroll.filter((p) => p.status === 'Processed');
  const totalToDisburse =
    approvedBudgetSubs.reduce((s, b) => s + b.totalRequested, 0) +
    approvedKitchenReqs.reduce((s, r) => s + r.amount, 0) +
    processedPayroll.reduce((s, p) => s + p.netSalary, 0);

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
      title = 'Bursary Overview Report';
      body += `<h2>Bursary Summary</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Cash Balance</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(cashBalance)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Income</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(totalIncome)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Expense</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(totalExpense)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Student Accounts</td><td style="padding:8px 12px;border:1px solid #ddd">${studentAccounts.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Petty Cash</td><td style="padding:8px 12px;border:1px solid #ddd">${pendingPettyCash.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Procurement</td><td style="padding:8px 12px;border:1px solid #ddd">${pendingProcurement.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Feeding Records</td><td style="padding:8px 12px;border:1px solid #ddd">${feeding.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Boarding Supplies Total</td><td style="padding:8px 12px;border:1px solid #ddd">${formatGH(boardingTotal)}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'cashbook') {
      title = reportType === 'full' ? title : 'Cash Book Report';
      body += `<h2>Cash Book</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Category</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Description</th><th style="padding:6px 8px;border:1px solid #ddd">Amount</th><th style="padding:6px 8px;border:1px solid #ddd">Balance</th>
      </tr></thead><tbody>`;
      cashTransactions.forEach((t: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${t.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.category}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.description}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(t.amount)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(t.balanceAfter)}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'studentAccounts') {
      title = reportType === 'full' ? title : 'Student Pocket Money Accounts';
      body += `<h2>Student Accounts</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Adm No</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th><th style="padding:6px 8px;border:1px solid #ddd">Deposited</th><th style="padding:6px 8px;border:1px solid #ddd">Withdrawn</th><th style="padding:6px 8px;border:1px solid #ddd">Balance</th>
      </tr></thead><tbody>`;
      studentAccounts.forEach((a: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${a.admNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${a.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${a.class}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(a.totalDeposited)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(a.totalWithdrawn)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(a.balance)}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'pettyCash') {
      title = reportType === 'full' ? title : 'Petty Cash Report';
      body += `<h2>Petty Cash</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Description</th><th style="padding:6px 8px;border:1px solid #ddd">Amount</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Requested By</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      pettyCash.forEach((p: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${p.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.description}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(p.amount)}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.requestedBy}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${p.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'imprest') {
      title = reportType === 'full' ? title : 'Imprest Account Report';
      body += `<h2>Imprest Accounts</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Holder</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Department</th><th style="padding:6px 8px;border:1px solid #ddd">Amount</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Purpose</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      imprest.forEach((i: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${i.holder}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.department}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(i.amount)}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.purpose}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${i.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'procurement') {
      title = reportType === 'full' ? title : 'Procurement Report';
      body += `<h2>Procurement Requests</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Item</th><th style="padding:6px 8px;border:1px solid #ddd">Qty</th><th style="padding:6px 8px;border:1px solid #ddd">Est. Cost</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Supplier</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      procurement.forEach((p: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${p.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.item}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${p.quantity} ${p.unit}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(p.estimatedCost)}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.supplier}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${p.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'feeding') {
      title = reportType === 'full' ? title : 'Feeding Account Report';
      body += `<h2>Feeding Records</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Meal</th><th style="padding:6px 8px;border:1px solid #ddd">Headcount</th><th style="padding:6px 8px;border:1px solid #ddd">Cost/Head</th><th style="padding:6px 8px;border:1px solid #ddd">Total Cost</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      feeding.forEach((f: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${f.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${f.meal}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.headcount}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(f.costPerHead)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(f.totalCost)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'boarding') {
      title = reportType === 'full' ? title : 'Boarding Supplies Report';
      body += `<h2>Boarding Supplies</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Item</th><th style="padding:6px 8px;border:1px solid #ddd">Qty</th><th style="padding:6px 8px;border:1px solid #ddd">Unit Cost</th><th style="padding:6px 8px;border:1px solid #ddd">Total</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th>
      </tr></thead><tbody>`;
      boardingSupplies.forEach((b: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${b.item}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${b.quantity} ${b.unit}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(b.unitCost)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(b.totalCost)}</td><td style="padding:4px 8px;border:1px solid #ddd">${b.house}</td><td style="padding:4px 8px;border:1px solid #ddd">${b.datePurchased}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'returns') {
      title = reportType === 'full' ? 'Comprehensive Bursary Report' : 'Daily/Monthly Returns Report';
      body += `<h2>Bursary Returns</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Period</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">From</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">To</th><th style="padding:6px 8px;border:1px solid #ddd">Income</th><th style="padding:6px 8px;border:1px solid #ddd">Expense</th><th style="padding:6px 8px;border:1px solid #ddd">Net</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      returns.forEach((r: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${r.period}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.dateFrom}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.dateTo}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(r.totalIncome)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(r.totalExpense)}</td><td style="text-align:right;padding:4px 8px;border:1px solid #ddd">${formatGH(r.netBalance)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${r.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:40px;color:#1A1A2E;max-width:900px;margin:0 auto}h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}h2{color:#2D3142;margin-top:30px}.header{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#888}.confidential{background:#FEF6E7;border-left:4px solid #F59E0B;padding:10px 15px;margin:15px 0;font-size:13px;color:#92400E}table{font-size:13px}th{font-weight:600}.footer{margin-top:40px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><span>SIMS — Bursary</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1><div class="confidential">CONFIDENTIAL — This report contains bursary records for school administration purposes only.</div>${body}
      <div class="footer">SIMS — Bursary Report — ${dateStr}</div>
      <script>window.onload=function(){window.print()}</script></body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Bursary Overview</Text>
            <Text style={styles.pageSubtitle}>Welcome, {userName}</Text>
            <CardGrid>
              <StatCard label="Cash Balance" value={formatGH(cashBalance)} subtitle="Current float" accentColor={colors.success} />
              <StatCard label="Total Income" value={formatGH(totalIncome)} subtitle="All receipts" accentColor={colors.primary} />
              <StatCard label="Total Expense" value={formatGH(totalExpense)} subtitle="All payments" accentColor={colors.danger} />
              <StatCard label="Student Accounts" value={studentAccounts.length} subtitle="Active accounts" accentColor={colors.info} />
              <StatCard label="Feeding Records" value={feeding.length} subtitle="Meal entries" accentColor={colors.warning} />
              <StatCard label="Boarding Supplies" value={formatGH(boardingTotal)} subtitle="Total spent" accentColor={colors.purple} />
              <StatCard label="Pending Petty Cash" value={pendingPettyCash.length} accentColor={colors.accent} />
              <StatCard label="Pending Procurement" value={pendingProcurement.length} accentColor={colors.danger} />
              <StatCard label="To Disburse" value={formatGH(totalToDisburse)} subtitle="Accountant approved" accentColor={colors.primary} />
            </CardGrid>

            {totalToDisburse > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Awaiting Disbursement (Accountant Approved)</Text>
                {approvedBudgetSubs.length > 0 && (
                  <View style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{approvedBudgetSubs.length} Budget Submission{approvedBudgetSubs.length > 1 ? 's' : ''}</Text>
                      <Text style={styles.alertText}>{formatGH(approvedBudgetSubs.reduce((s, b) => s + b.totalRequested, 0))} ready to disburse</Text>
                    </View>
                    {renderBadge('Approved', colors.info)}
                  </View>
                )}
                {approvedKitchenReqs.length > 0 && (
                  <View style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{approvedKitchenReqs.length} Kitchen Request{approvedKitchenReqs.length > 1 ? 's' : ''}</Text>
                      <Text style={styles.alertText}>{formatGH(approvedKitchenReqs.reduce((s, r) => s + r.amount, 0))} ready to disburse</Text>
                    </View>
                    {renderBadge('Approved', colors.info)}
                  </View>
                )}
                {processedPayroll.length > 0 && (
                  <View style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{processedPayroll.length} Processed Salary Payment{processedPayroll.length > 1 ? 's' : ''}</Text>
                      <Text style={styles.alertText}>{formatGH(processedPayroll.reduce((s, p) => s + p.netSalary, 0))} awaiting payment</Text>
                    </View>
                    {renderBadge('Processed', colors.info)}
                  </View>
                )}
              </View>
            )}

            {pendingPettyCash.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Pending Petty Cash Requests</Text>
                {pendingPettyCash.map((p) => (
                  <View key={p.id} style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{formatGH(p.amount)} — {p.description}</Text>
                      <Text style={styles.alertText}>Requested by: {p.requestedBy}</Text>
                    </View>
                    {renderBadge('Pending', colors.warning)}
                  </View>
                ))}
              </View>
            )}

            {pendingProcurement.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Pending Procurement Requisitions</Text>
                {pendingProcurement.map((p) => (
                  <View key={p.id} style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{p.item} — {p.quantity} {p.unit}</Text>
                      <Text style={styles.alertText}>Est. {formatGH(p.estimatedCost)} — {p.department}</Text>
                    </View>
                    {renderBadge('Requisitioned', colors.warning)}
                  </View>
                ))}
              </View>
            )}

            {pendingImprest.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Imprest Pending Retirement</Text>
                {pendingImprest.map((i) => (
                  <View key={i.id} style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{i.holder} — {formatGH(i.amount)}</Text>
                      <Text style={styles.alertText}>Retired: {formatGH(i.retiredAmount ?? 0)} — Awaiting voucher</Text>
                    </View>
                    {renderBadge('Pending', colors.warning)}
                  </View>
                ))}
              </View>
            )}

            {draftReturns.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Draft Returns — Not Yet Submitted</Text>
                {draftReturns.map((r) => (
                  <View key={r.id} style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{r.period} Return — {r.dateFrom} to {r.dateTo}</Text>
                      <Text style={styles.alertText}>Net: {formatGH(r.netBalance)} — Needs submission</Text>
                    </View>
                    {renderBadge('Draft', colors.textSecondary)}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        );

      case 'cashbook':
        return <CashBookPage store={store} renderBadge={renderBadge} userName={userName} />;

      case 'studentAccounts':
        return <StudentAccountsPage accounts={studentAccounts} store={store} renderBadge={renderBadge} userName={userName} />;

      case 'pettyCash':
        return <PettyCashPage pettyCash={pettyCash} store={store} renderBadge={renderBadge} userName={userName} />;

      case 'imprest':
        return <ImprestPage imprest={imprest} store={store} renderBadge={renderBadge} />;

      case 'procurement':
        return <ProcurementPage procurement={procurement} store={store} renderBadge={renderBadge} />;

      case 'feeding':
        return <FeedingPage feeding={feeding} store={store} renderBadge={renderBadge} feedingByMeal={feedingByMeal} />;

      case 'boardingSupplies':
        return <BoardingSuppliesPage supplies={boardingSupplies} store={store} total={boardingTotal} />;

      case 'disbursements':
        return (
          <DisbursementsPage
            approvedBudgetSubs={approvedBudgetSubs}
            approvedKitchenReqs={approvedKitchenReqs}
            processedPayroll={processedPayroll}
            totalToDisburse={totalToDisburse}
            bursaryStore={bursaryStore}
            kitchenStore={kitchenStore}
            bursarStore={store}
            renderBadge={renderBadge}
            userName={userName}
          />
        );

      case 'returns':
        return <ReturnsPage returns={returns} store={store} renderBadge={renderBadge} />;

      case 'reports':
        return <ReportsPage generatePDF={generatePDF} totals={{ cashBalance, totalIncome, totalExpense, studentAccounts: studentAccounts.length, feeding: feeding.length, boardingTotal, pendingPettyCash: pendingPettyCash.length, pendingProcurement: pendingProcurement.length }} />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Bursary" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
    </DashboardLayout>
  );
}

// ── Cash Book Page ──

function CashBookPage({ store, renderBadge, userName }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Income' as 'Income' | 'Expense', category: CASH_TXN_CATEGORIES[0], description: '', amount: '', receivedFrom: '', paidTo: '', handledBy: '' });

  const handleRecord = () => {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0 || !form.description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    store.recordCashTransaction({ ...form, amount, handledBy: form.handledBy || userName, receivedFrom: form.receivedFrom || undefined, paidTo: form.paidTo || undefined });
    setForm({ type: 'Income', category: CASH_TXN_CATEGORIES[0], description: '', amount: '', receivedFrom: '', paidTo: '', handledBy: '' });
    setShowForm(false);
    Alert.alert('Success', 'Cash transaction recorded.');
  };

  const typeColor = (t: string) => t === 'Income' ? colors.success : colors.danger;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Cash Book</Text>
      <Text style={styles.pageSubtitle}>Balance: {formatGH(store.getCashBalance())} — {store.cashTransactions.length} transactions</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Record Cash Transaction</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Record Cash Transaction</Text>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.pickerRow}>
                {['Income', 'Expense'].map((t) => (
                  <TouchableOpacity key={t} style={[styles.pickerChip, form.type === t && styles.pickerChipActive]} onPress={() => setForm({ ...form, type: t as 'Income' | 'Expense' })}>
                    <Text style={[styles.pickerChipText, form.type === t && styles.pickerChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.pickerRow}>
                {CASH_TXN_CATEGORIES.map((c) => (
                  <TouchableOpacity key={c} style={[styles.pickerChip, form.category === c && styles.pickerChipActive]} onPress={() => setForm({ ...form, category: c })}>
                    <Text style={[styles.pickerChipText, form.category === c && styles.pickerChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={styles.textInput} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
              <Text style={styles.inputLabel}>Amount (GH₵)</Text>
              <TextInput style={styles.textInput} value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} placeholder="500" keyboardType="numeric" />
              {form.type === 'Income' ? (
                <>
                  <Text style={styles.inputLabel}>Received From</Text>
                  <TextInput style={styles.textInput} value={form.receivedFrom} onChangeText={(v) => setForm({ ...form, receivedFrom: v })} placeholder="Parent name / Source" />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Paid To</Text>
                  <TextInput style={styles.textInput} value={form.paidTo} onChangeText={(v) => setForm({ ...form, paidTo: v })} placeholder="Vendor / Payee" />
                </>
              )}
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

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'receiptNo', label: 'Receipt', render: (i: any) => i.receiptNo },
          { key: 'description', label: 'Description', render: (i: any) => i.description },
          { key: 'type', label: 'Type', render: (i: any) => renderBadge(i.type, typeColor(i.type)) },
          { key: 'amount', label: 'Amount', render: (i: any) => formatGH(i.amount) },
          { key: 'balance', label: 'Balance', render: (i: any) => formatGH(i.balanceAfter) },
        ]}
        data={store.cashTransactions}
      />
    </ScrollView>
  );
}

// ── Student Accounts Page ──

function StudentAccountsPage({ accounts, store, renderBadge, userName }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showTxn, setShowTxn] = useState<'Deposit' | 'Withdrawal' | null>(null);
  const [txnForm, setTxnForm] = useState({ amount: '', description: '' });
  const [search, setSearch] = useState('');

  const filtered = accounts.filter((a: any) => {
    const q = search.toLowerCase().trim();
    return !q || a.studentName.toLowerCase().includes(q) || a.admNo.toLowerCase().includes(q) || a.class.toLowerCase().includes(q);
  });

  const selectedAccount = accounts.find((a: any) => a.id === selected);

  const handleTxn = () => {
    if (!selected || !showTxn) return;
    const amount = parseFloat(txnForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Invalid amount.');
      return;
    }
    if (showTxn === 'Deposit') {
      store.depositPocketMoney(selected, amount, txnForm.description || 'Deposit', userName);
    } else {
      const acc = accounts.find((a: any) => a.id === selected);
      if (acc && acc.balance < amount) {
        Alert.alert('Error', 'Insufficient balance.');
        return;
      }
      store.withdrawPocketMoney(selected, amount, txnForm.description || 'Withdrawal', userName);
    }
    setTxnForm({ amount: '', description: '' });
    setShowTxn(null);
    Alert.alert('Success', `${showTxn} recorded.`);
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Student Accounts — Pocket Money</Text>
      <Text style={styles.pageSubtitle}>{accounts.length} accounts — Total held: {formatGH(accounts.reduce((s: number, a: any) => s + a.balance, 0))}</Text>

      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Search by name, adm no, class..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
      </View>

      {filtered.map((a: any) => (
        <TouchableOpacity key={a.id} style={styles.accountCard} onPress={() => setSelected(selected === a.id ? null : a.id)}>
          <View style={styles.accountHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{a.studentName} — {a.admNo}</Text>
              <Text style={styles.accountMeta}>{a.class} — Guardian: {a.guardianName}</Text>
              <Text style={styles.accountBalance}>Balance: {formatGH(a.balance)}</Text>
            </View>
            <Text style={styles.expandToggle}>{selected === a.id ? '−' : '+'}</Text>
          </View>

          {selected === a.id && (
            <View style={styles.accountDetail}>
              <Text style={styles.subJustLabel}>Transaction History</Text>
              {a.transactions.map((t: any) => (
                <View key={t.id} style={styles.txnRow}>
                  <Text style={styles.txnDate}>{t.date}</Text>
                  {renderBadge(t.type, t.type === 'Deposit' ? colors.success : colors.danger)}
                  <Text style={styles.txnDesc}>{t.description}</Text>
                  <Text style={[styles.txnAmount, { color: t.type === 'Deposit' ? colors.success : colors.danger }]}>{formatGH(t.amount)}</Text>
                </View>
              ))}
              <View style={styles.subActions}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.success }]} onPress={() => { setShowTxn('Deposit'); setTxnForm({ amount: '', description: '' }); }}>
                  <Text style={styles.modalBtnTextSubmit}>Deposit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.warning }]} onPress={() => { setShowTxn('Withdrawal'); setTxnForm({ amount: '', description: '' }); }}>
                  <Text style={styles.modalBtnTextSubmit}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}

      {selectedAccount && (
        <Modal visible={!!showTxn} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{showTxn} — {selectedAccount.studentName}</Text>
              <Text style={styles.payMeta}>Current Balance: {formatGH(selectedAccount.balance)}</Text>
              <Text style={styles.inputLabel}>Amount (GH₵)</Text>
              <TextInput style={styles.textInput} value={txnForm.amount} onChangeText={(v) => setTxnForm({ ...txnForm, amount: v })} placeholder="50" keyboardType="numeric" />
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={styles.textInput} value={txnForm.description} onChangeText={(v) => setTxnForm({ ...txnForm, description: v })} placeholder="Pocket money / Toiletries / etc." />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowTxn(null)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleTxn}>
                  <Text style={styles.modalBtnTextSubmit}>Record {showTxn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

// ── Petty Cash Page ──

function PettyCashPage({ pettyCash, store, renderBadge, userName }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', requestedBy: '', notes: '' });

  const statusColor = (s: string) => s === 'Disbursed' ? colors.success : s === 'Approved' ? colors.info : s === 'Rejected' ? colors.danger : colors.warning;

  const handleAdd = () => {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0 || !form.description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    store.addPettyCashEntry({ ...form, amount, date: new Date().toISOString().slice(0, 10) });
    setForm({ description: '', amount: '', requestedBy: '', notes: '' });
    setShowForm(false);
    Alert.alert('Success', 'Petty cash request added.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Petty Cash</Text>
      <Text style={styles.pageSubtitle}>{pettyCash.length} entries — {pettyCash.filter((p: any) => p.status === 'Requested').length} pending</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Add Petty Cash Request</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Petty Cash Request</Text>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput style={styles.textInput} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
            <Text style={styles.inputLabel}>Amount (GH₵)</Text>
            <TextInput style={styles.textInput} value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} placeholder="30" keyboardType="numeric" />
            <Text style={styles.inputLabel}>Requested By</Text>
            <TextInput style={styles.textInput} value={form.requestedBy} onChangeText={(v) => setForm({ ...form, requestedBy: v })} placeholder="Department / Staff" />
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput style={[styles.textInput, { minHeight: 50 }]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                <Text style={styles.modalBtnTextSubmit}>Add Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {pettyCash.map((p: any) => (
        <View key={p.id} style={styles.finCard}>
          <View style={styles.finHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.finAmount}>{formatGH(p.amount)}</Text>
              <Text style={styles.finMeta}>{p.date} | {p.description}</Text>
              <Text style={styles.finBy}>Requested by: {p.requestedBy}</Text>
              {p.notes ? <Text style={styles.finNotes}>{p.notes}</Text> : null}
              {p.receiptNo ? <Text style={styles.finBy}>Receipt: {p.receiptNo}</Text> : null}
            </View>
            {renderBadge(p.status, statusColor(p.status))}
          </View>
          {p.status === 'Requested' && (
            <View style={styles.finActions}>
              <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.success }]} onPress={() => { store.approvePettyCash(p.id, userName); Alert.alert('Success', 'Approved.'); }}>
                <Text style={styles.finBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.danger }]} onPress={() => { store.rejectPettyCash(p.id); Alert.alert('Success', 'Rejected.'); }}>
                <Text style={styles.finBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
          {p.status === 'Approved' && (
            <View style={styles.finActions}>
              <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.primary }]} onPress={() => { store.disbursePettyCash(p.id); Alert.alert('Success', 'Disbursed.'); }}>
                <Text style={styles.finBtnText}>Mark Disbursed</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Imprest Page ──

function ImprestPage({ imprest, store, renderBadge }: any) {
  const [showRetire, setShowRetire] = useState<string | null>(null);
  const [retireForm, setRetireForm] = useState({ retiredAmount: '', voucherNo: '' });

  const statusColor = (s: string) => s === 'Retired' ? colors.success : s === 'Pending Retirement' ? colors.warning : colors.info;
  const detailImprest = imprest.find((i: any) => i.id === showRetire);

  const handleRetire = () => {
    if (!showRetire) return;
    const amount = parseFloat(retireForm.retiredAmount);
    if (isNaN(amount) || amount < 0 || !retireForm.voucherNo) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    store.retireImprest(showRetire, amount, retireForm.voucherNo);
    setRetireForm({ retiredAmount: '', voucherNo: '' });
    setShowRetire(null);
    Alert.alert('Success', 'Imprest retired.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Imprest Accounts</Text>
      <Text style={styles.pageSubtitle}>{imprest.length} accounts — {formatGH(imprest.reduce((s: number, i: any) => s + i.amount, 0))} total issued</Text>

      {imprest.map((i: any) => (
        <View key={i.id} style={styles.imprestCard}>
          <View style={styles.finHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.finAmount}>{formatGH(i.amount)}</Text>
              <Text style={styles.finMeta}>{i.holder} — {i.department}</Text>
              <Text style={styles.finBy}>Issued: {i.dateIssued} — Purpose: {i.purpose}</Text>
              {i.retiredAmount !== undefined && <Text style={styles.finBy}>Retired: {formatGH(i.retiredAmount)} — Voucher: {i.retirementVoucherNo || 'N/A'}</Text>}
              {i.notes ? <Text style={styles.finNotes}>{i.notes}</Text> : null}
            </View>
            {renderBadge(i.status, statusColor(i.status))}
          </View>
          {i.status === 'Pending Retirement' && (
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary, marginTop: spacing.sm }]} onPress={() => { setShowRetire(i.id); setRetireForm({ retiredAmount: String(i.retiredAmount ?? ''), voucherNo: '' }); }}>
              <Text style={styles.modalBtnTextSubmit}>Retire Imprest</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {detailImprest && (
        <Modal visible={!!showRetire} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Retire Imprest — {detailImprest.holder}</Text>
              <Text style={styles.payMeta}>Issued: {formatGH(detailImprest.amount)} — Purpose: {detailImprest.purpose}</Text>
              <Text style={styles.inputLabel}>Retired Amount (GH₵)</Text>
              <TextInput style={styles.textInput} value={retireForm.retiredAmount} onChangeText={(v) => setRetireForm({ ...retireForm, retiredAmount: v })} placeholder="2850" keyboardType="numeric" />
              <Text style={styles.inputLabel}>Retirement Voucher No.</Text>
              <TextInput style={styles.textInput} value={retireForm.voucherNo} onChangeText={(v) => setRetireForm({ ...retireForm, voucherNo: v })} placeholder="RV-002" />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowRetire(null)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleRetire}>
                  <Text style={styles.modalBtnTextSubmit}>Retire</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

// ── Procurement Page ──

function ProcurementPage({ procurement, store, renderBadge }: any) {
  const [showForm, setShowForm] = useState(false);
  const [showDeliver, setShowDeliver] = useState<string | null>(null);
  const [deliverForm, setDeliverForm] = useState({ actualCost: '' });
  const [form, setForm] = useState({ item: '', quantity: '', unit: SUPPLY_UNITS[0], estimatedCost: '', supplier: '', requestedBy: '', department: '', notes: '' });

  const statusColor = (s: string) => s === 'Delivered' ? colors.success : s === 'Ordered' ? colors.info : s === 'Approved' ? colors.primary : s === 'Rejected' ? colors.danger : colors.warning;
  const detailProc = procurement.find((p: any) => p.id === showDeliver);

  const handleAdd = () => {
    const qty = parseInt(form.quantity);
    const cost = parseFloat(form.estimatedCost);
    if (!form.item || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0 || !form.supplier) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    store.addProcurement({ ...form, quantity: qty, estimatedCost: cost, date: new Date().toISOString().slice(0, 10) });
    setForm({ item: '', quantity: '', unit: SUPPLY_UNITS[0], estimatedCost: '', supplier: '', requestedBy: '', department: '', notes: '' });
    setShowForm(false);
    Alert.alert('Success', 'Procurement requisition added.');
  };

  const handleDeliver = () => {
    if (!showDeliver) return;
    const cost = parseFloat(deliverForm.actualCost);
    if (isNaN(cost) || cost <= 0) {
      Alert.alert('Error', 'Invalid cost.');
      return;
    }
    store.deliverProcurement(showDeliver, cost);
    setDeliverForm({ actualCost: '' });
    setShowDeliver(null);
    Alert.alert('Success', 'Procurement marked as delivered.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Procurement</Text>
      <Text style={styles.pageSubtitle}>{procurement.length} requisitions — {procurement.filter((p: any) => p.status === 'Requisitioned').length} pending</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ New Requisition</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>New Procurement Requisition</Text>
              <Text style={styles.inputLabel}>Item</Text>
              <TextInput style={styles.textInput} value={form.item} onChangeText={(v) => setForm({ ...form, item: v })} />
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput style={styles.textInput} value={form.quantity} onChangeText={(v) => setForm({ ...form, quantity: v })} placeholder="10" keyboardType="numeric" />
              <Text style={styles.inputLabel}>Unit</Text>
              <View style={styles.pickerRow}>
                {SUPPLY_UNITS.map((u) => (
                  <TouchableOpacity key={u} style={[styles.pickerChip, form.unit === u && styles.pickerChipActive]} onPress={() => setForm({ ...form, unit: u })}>
                    <Text style={[styles.pickerChipText, form.unit === u && styles.pickerChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Estimated Cost (GH₵)</Text>
              <TextInput style={styles.textInput} value={form.estimatedCost} onChangeText={(v) => setForm({ ...form, estimatedCost: v })} placeholder="4000" keyboardType="numeric" />
              <Text style={styles.inputLabel}>Supplier</Text>
              <TextInput style={styles.textInput} value={form.supplier} onChangeText={(v) => setForm({ ...form, supplier: v })} />
              <Text style={styles.inputLabel}>Requested By</Text>
              <TextInput style={styles.textInput} value={form.requestedBy} onChangeText={(v) => setForm({ ...form, requestedBy: v })} placeholder="Department / Staff" />
              <Text style={styles.inputLabel}>Department</Text>
              <TextInput style={styles.textInput} value={form.department} onChangeText={(v) => setForm({ ...form, department: v })} placeholder="Kitchen / Science Lab / etc." />
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={[styles.textInput, { minHeight: 50 }]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextSubmit}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {procurement.map((p: any) => (
        <View key={p.id} style={styles.procCard}>
          <View style={styles.finHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.procItem}>{p.item} — {p.quantity} {p.unit}</Text>
              <Text style={styles.finMeta}>Est. {formatGH(p.estimatedCost)} — {p.supplier}</Text>
              <Text style={styles.finBy}>Requested by: {p.requestedBy} ({p.department})</Text>
              {p.actualCost !== undefined && <Text style={styles.finBy}>Actual: {formatGH(p.actualCost)} — Delivered: {p.dateDelivered}</Text>}
              {p.notes ? <Text style={styles.finNotes}>{p.notes}</Text> : null}
            </View>
            {renderBadge(p.status, statusColor(p.status))}
          </View>
          {p.status === 'Requisitioned' && (
            <View style={styles.finActions}>
              <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.success }]} onPress={() => { store.approveProcurement(p.id); Alert.alert('Success', 'Approved.'); }}>
                <Text style={styles.finBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.danger }]} onPress={() => { store.rejectProcurement(p.id); Alert.alert('Success', 'Rejected.'); }}>
                <Text style={styles.finBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
          {p.status === 'Approved' && (
            <View style={styles.finActions}>
              <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.primary }]} onPress={() => { store.orderProcurement(p.id); Alert.alert('Success', 'Marked as ordered.'); }}>
                <Text style={styles.finBtnText}>Mark Ordered</Text>
              </TouchableOpacity>
            </View>
          )}
          {p.status === 'Ordered' && (
            <View style={styles.finActions}>
              <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.success }]} onPress={() => { setShowDeliver(p.id); setDeliverForm({ actualCost: '' }); }}>
                <Text style={styles.finBtnText}>Mark Delivered</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      {detailProc && (
        <Modal visible={!!showDeliver} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mark Delivered — {detailProc.item}</Text>
              <Text style={styles.payMeta}>Est. Cost: {formatGH(detailProc.estimatedCost)}</Text>
              <Text style={styles.inputLabel}>Actual Cost (GH₵)</Text>
              <TextInput style={styles.textInput} value={deliverForm.actualCost} onChangeText={(v) => setDeliverForm({ actualCost: v })} placeholder={String(detailProc.estimatedCost)} keyboardType="numeric" />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowDeliver(null)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleDeliver}>
                  <Text style={styles.modalBtnTextSubmit}>Confirm Delivery</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

// ── Feeding Page ──

function FeedingPage({ feeding, store, renderBadge, feedingByMeal }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), meal: MEAL_TYPES[0], headcount: '', costPerHead: '', notes: '' });

  const statusColor = (s: string) => s === 'Served' ? colors.success : s === 'Absent' ? colors.danger : colors.warning;
  const totalFeedingCost = feeding.reduce((s: number, f: any) => s + f.totalCost, 0);

  const handleAdd = () => {
    const hc = parseInt(form.headcount);
    const cph = parseFloat(form.costPerHead);
    if (isNaN(hc) || hc <= 0 || isNaN(cph) || cph <= 0) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    store.addFeedingRecord({ ...form, headcount: hc, costPerHead: cph, status: 'Served' });
    setForm({ date: new Date().toISOString().slice(0, 10), meal: MEAL_TYPES[0], headcount: '', costPerHead: '', notes: '' });
    setShowForm(false);
    Alert.alert('Success', 'Feeding record added.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Feeding Account</Text>
      <Text style={styles.pageSubtitle}>{feeding.length} records — Total: {formatGH(totalFeedingCost)}</Text>

      <CardGrid>
        {feedingByMeal.map((m: any) => (
          <StatCard key={m.meal} label={m.meal} value={formatGH(m.total)} subtitle={`${m.count} meals`} accentColor={m.meal === 'Breakfast' ? colors.warning : m.meal === 'Lunch' ? colors.primary : colors.info} />
        ))}
      </CardGrid>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Add Feeding Record</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Feeding Record</Text>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput style={styles.textInput} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" />
            <Text style={styles.inputLabel}>Meal</Text>
            <View style={styles.pickerRow}>
              {MEAL_TYPES.map((m) => (
                <TouchableOpacity key={m} style={[styles.pickerChip, form.meal === m && styles.pickerChipActive]} onPress={() => setForm({ ...form, meal: m })}>
                  <Text style={[styles.pickerChipText, form.meal === m && styles.pickerChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Headcount</Text>
            <TextInput style={styles.textInput} value={form.headcount} onChangeText={(v) => setForm({ ...form, headcount: v })} placeholder="480" keyboardType="numeric" />
            <Text style={styles.inputLabel}>Cost Per Head (GH₵)</Text>
            <TextInput style={styles.textInput} value={form.costPerHead} onChangeText={(v) => setForm({ ...form, costPerHead: v })} placeholder="5" keyboardType="numeric" />
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput style={[styles.textInput, { minHeight: 50 }]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Menu description" multiline />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                <Text style={styles.modalBtnTextSubmit}>Add Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'meal', label: 'Meal', render: (i: any) => i.meal },
          { key: 'headcount', label: 'Headcount', render: (i: any) => String(i.headcount) },
          { key: 'costPerHead', label: 'Cost/Head', render: (i: any) => formatGH(i.costPerHead) },
          { key: 'totalCost', label: 'Total', render: (i: any) => formatGH(i.totalCost) },
          { key: 'status', label: 'Status', render: (i: any) => renderBadge(i.status, statusColor(i.status)) },
        ]}
        data={feeding}
      />
    </ScrollView>
  );
}

// ── Boarding Supplies Page ──

function BoardingSuppliesPage({ supplies, store, total }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ item: '', quantity: '', unit: SUPPLY_UNITS[0], unitCost: '', datePurchased: new Date().toISOString().slice(0, 10), supplier: '', house: HOUSES[0], notes: '' });

  const handleAdd = () => {
    const qty = parseInt(form.quantity);
    const uc = parseFloat(form.unitCost);
    if (!form.item || isNaN(qty) || qty <= 0 || isNaN(uc) || uc <= 0 || !form.supplier) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    store.addBoardingSupply({ ...form, quantity: qty, unitCost: uc });
    setForm({ item: '', quantity: '', unit: SUPPLY_UNITS[0], unitCost: '', datePurchased: new Date().toISOString().slice(0, 10), supplier: '', house: HOUSES[0], notes: '' });
    setShowForm(false);
    Alert.alert('Success', 'Boarding supply added.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Boarding Supplies</Text>
      <Text style={styles.pageSubtitle}>{supplies.length} items — Total: {formatGH(total)}</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Add Boarding Supply</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Boarding Supply</Text>
              <Text style={styles.inputLabel}>Item</Text>
              <TextInput style={styles.textInput} value={form.item} onChangeText={(v) => setForm({ ...form, item: v })} />
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput style={styles.textInput} value={form.quantity} onChangeText={(v) => setForm({ ...form, quantity: v })} placeholder="20" keyboardType="numeric" />
              <Text style={styles.inputLabel}>Unit</Text>
              <View style={styles.pickerRow}>
                {SUPPLY_UNITS.map((u) => (
                  <TouchableOpacity key={u} style={[styles.pickerChip, form.unit === u && styles.pickerChipActive]} onPress={() => setForm({ ...form, unit: u })}>
                    <Text style={[styles.pickerChipText, form.unit === u && styles.pickerChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Unit Cost (GH₵)</Text>
              <TextInput style={styles.textInput} value={form.unitCost} onChangeText={(v) => setForm({ ...form, unitCost: v })} placeholder="80" keyboardType="numeric" />
              <Text style={styles.inputLabel}>Date Purchased</Text>
              <TextInput style={styles.textInput} value={form.datePurchased} onChangeText={(v) => setForm({ ...form, datePurchased: v })} placeholder="YYYY-MM-DD" />
              <Text style={styles.inputLabel}>Supplier</Text>
              <TextInput style={styles.textInput} value={form.supplier} onChangeText={(v) => setForm({ ...form, supplier: v })} />
              <Text style={styles.inputLabel}>House</Text>
              <View style={styles.pickerRow}>
                {HOUSES.map((h) => (
                  <TouchableOpacity key={h} style={[styles.pickerChip, form.house === h && styles.pickerChipActive]} onPress={() => setForm({ ...form, house: h })}>
                    <Text style={[styles.pickerChipText, form.house === h && styles.pickerChipTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={[styles.textInput, { minHeight: 50 }]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextSubmit}>Add Supply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DataTable
        columns={[
          { key: 'item', label: 'Item', render: (i: any) => i.item },
          { key: 'qty', label: 'Qty', render: (i: any) => `${i.quantity} ${i.unit}` },
          { key: 'unitCost', label: 'Unit Cost', render: (i: any) => formatGH(i.unitCost) },
          { key: 'totalCost', label: 'Total', render: (i: any) => formatGH(i.totalCost) },
          { key: 'house', label: 'House', render: (i: any) => i.house },
          { key: 'date', label: 'Date', render: (i: any) => i.datePurchased },
        ]}
        data={supplies}
      />
    </ScrollView>
  );
}

// ── Returns Page ──

function ReturnsPage({ returns, store, renderBadge }: any) {
  const [showGen, setShowGen] = useState(false);
  const [genForm, setGenForm] = useState({ period: 'Daily' as 'Daily' | 'Weekly' | 'Monthly', dateFrom: new Date().toISOString().slice(0, 10), dateTo: new Date().toISOString().slice(0, 10) });

  const statusColor = (s: string) => s === 'Approved' ? colors.success : s === 'Submitted' ? colors.info : s === 'Rejected' ? colors.danger : colors.textSecondary;

  const handleGenerate = () => {
    store.generateReturn(genForm.period, genForm.dateFrom, genForm.dateTo);
    setShowGen(false);
    Alert.alert('Success', 'Return generated from cash transactions.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Daily / Monthly Returns</Text>
      <Text style={styles.pageSubtitle}>{returns.length} returns — {returns.filter((r: any) => r.status === 'Draft').length} drafts</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowGen(true)}>
        <Text style={styles.actionBtnText}>+ Generate Return</Text>
      </TouchableOpacity>

      <Modal visible={showGen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Return</Text>
            <Text style={styles.inputLabel}>Period</Text>
            <View style={styles.pickerRow}>
              {RETURN_PERIODS.map((p) => (
                <TouchableOpacity key={p} style={[styles.pickerChip, genForm.period === p && styles.pickerChipActive]} onPress={() => setGenForm({ ...genForm, period: p })}>
                  <Text style={[styles.pickerChipText, genForm.period === p && styles.pickerChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>From Date</Text>
            <TextInput style={styles.textInput} value={genForm.dateFrom} onChangeText={(v) => setGenForm({ ...genForm, dateFrom: v })} placeholder="YYYY-MM-DD" />
            <Text style={styles.inputLabel}>To Date</Text>
            <TextInput style={styles.textInput} value={genForm.dateTo} onChangeText={(v) => setGenForm({ ...genForm, dateTo: v })} placeholder="YYYY-MM-DD" />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowGen(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleGenerate}>
                <Text style={styles.modalBtnTextSubmit}>Generate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {returns.map((r: any) => (
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
            {renderBadge(r.status, statusColor(r.status))}
          </View>
          {r.status === 'Draft' && (
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary, marginTop: spacing.sm }]} onPress={() => { store.submitReturn(r.id); Alert.alert('Success', 'Return submitted to Accountant.'); }}>
              <Text style={styles.modalBtnTextSubmit}>Submit to Accountant</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Disbursements Page ──

function DisbursementsPage({ approvedBudgetSubs, approvedKitchenReqs, processedPayroll, totalToDisburse, bursaryStore, kitchenStore, bursarStore, renderBadge, userName }: any) {
  const handleDisburseBudget = (id: string, dept: string, amount: number) => {
    bursaryStore.disburseBudgetSubmission(id, userName);
    bursarStore.recordCashTransaction({
      date: new Date().toISOString().slice(0, 10),
      type: 'Expense',
      category: 'Miscellaneous',
      description: `Disbursement — ${dept} budget (Accountant approved)`,
      amount,
      paidTo: dept,
      handledBy: userName,
    });
    Alert.alert('Success', `Disbursed ${formatGH(amount)} to ${dept}.`);
  };

  const handleDisburseKitchen = (id: string, purpose: string, amount: number) => {
    kitchenStore.updateFinancialReqStatus(id, 'Disbursed');
    bursarStore.recordCashTransaction({
      date: new Date().toISOString().slice(0, 10),
      type: 'Expense',
      category: 'Feeding',
      description: `Disbursement — Kitchen: ${purpose}`,
      amount,
      paidTo: 'Catering Department',
      handledBy: userName,
    });
    Alert.alert('Success', `Disbursed ${formatGH(amount)} for kitchen request.`);
  };

  const handlePaySalary = (id: string, staffName: string, amount: number) => {
    bursaryStore.payPayroll(id);
    bursarStore.recordCashTransaction({
      date: new Date().toISOString().slice(0, 10),
      type: 'Expense',
      category: 'Miscellaneous',
      description: `Salary payment — ${staffName}`,
      amount,
      paidTo: staffName,
      handledBy: userName,
    });
    Alert.alert('Success', `Paid ${formatGH(amount)} to ${staffName}.`);
  };

  const hasNothing = approvedBudgetSubs.length === 0 && approvedKitchenReqs.length === 0 && processedPayroll.length === 0;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Disbursements</Text>
      <Text style={styles.pageSubtitle}>Items approved by the Accountant — disburse cash as directed</Text>

      <CardGrid>
        <StatCard label="Total to Disburse" value={formatGH(totalToDisburse)} subtitle="Approved by Accountant" accentColor={colors.primary} />
        <StatCard label="Budget Submissions" value={approvedBudgetSubs.length} subtitle="Approved" accentColor={colors.info} />
        <StatCard label="Kitchen Requests" value={approvedKitchenReqs.length} subtitle="Approved" accentColor={colors.warning} />
        <StatCard label="Payroll (Processed)" value={processedPayroll.length} subtitle="Awaiting payment" accentColor={colors.success} />
      </CardGrid>

      {hasNothing && (
        <Text style={styles.emptyText}>No approved items awaiting disbursement.</Text>
      )}

      {approvedBudgetSubs.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Approved Budget Submissions</Text>
          {approvedBudgetSubs.map((b: any) => (
            <View key={b.id} style={styles.finCard}>
              <View style={styles.finHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.finAmount}>{formatGH(b.totalRequested)}</Text>
                  <Text style={styles.finMeta}>{b.department} — Submitted by: {b.submittedBy}</Text>
                  <Text style={styles.finBy}>Accountant approved: {b.accountantApprovedDate}</Text>
                  {b.accountantNotes ? <Text style={styles.finNotes}>{b.accountantNotes}</Text> : null}
                </View>
                {renderBadge('Approved', colors.info)}
              </View>
              <View style={styles.finActions}>
                <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.success }]} onPress={() => handleDisburseBudget(b.id, b.department, b.totalRequested)}>
                  <Text style={styles.finBtnText}>Disburse {formatGH(b.totalRequested)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {approvedKitchenReqs.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Approved Kitchen Finance Requests</Text>
          {approvedKitchenReqs.map((r: any) => (
            <View key={r.id} style={styles.finCard}>
              <View style={styles.finHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.finAmount}>{formatGH(r.amount)}</Text>
                  <Text style={styles.finMeta}>{r.date} | {r.purpose}</Text>
                  <Text style={styles.finBy}>Requested by: {r.requestedBy}</Text>
                  {r.notes ? <Text style={styles.finNotes}>{r.notes}</Text> : null}
                </View>
                {renderBadge('Approved', colors.info)}
              </View>
              <View style={styles.finActions}>
                <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.success }]} onPress={() => handleDisburseKitchen(r.id, r.purpose, r.amount)}>
                  <Text style={styles.finBtnText}>Disburse {formatGH(r.amount)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {processedPayroll.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Processed Payroll — Awaiting Payment</Text>
          {processedPayroll.map((p: any) => (
            <View key={p.id} style={styles.finCard}>
              <View style={styles.finHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.finAmount}>{formatGH(p.netSalary)}</Text>
                  <Text style={styles.finMeta}>{p.staffName} — {p.position}</Text>
                  <Text style={styles.finBy}>{p.department} — {p.payPeriod}</Text>
                  <Text style={styles.finBy}>Gross: {formatGH(p.grossSalary)} — SSF: {formatGH(p.ssfContribution)} — Tax: {formatGH(p.taxDeduction)}</Text>
                </View>
                {renderBadge('Processed', colors.info)}
              </View>
              <View style={styles.finActions}>
                <TouchableOpacity style={[styles.finBtn, { backgroundColor: colors.success }]} onPress={() => handlePaySalary(p.id, p.staffName, p.netSalary)}>
                  <Text style={styles.finBtnText}>Pay {formatGH(p.netSalary)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── Reports Page ──

function ReportsPage({ generatePDF, totals }: any) {
  const reportTypes = [
    { key: 'overview', name: 'Bursary Overview', desc: 'Complete summary', color: colors.primary },
    { key: 'cashbook', name: 'Cash Book', desc: `${formatGH(totals.totalIncome)} in, ${formatGH(totals.totalExpense)} out`, color: colors.success },
    { key: 'studentAccounts', name: 'Student Accounts', desc: `${totals.studentAccounts} accounts`, color: colors.info },
    { key: 'pettyCash', name: 'Petty Cash', desc: `${totals.pendingPettyCash} pending`, color: colors.warning },
    { key: 'imprest', name: 'Imprest Accounts', desc: 'All imprest records', color: colors.purple },
    { key: 'procurement', name: 'Procurement', desc: `${totals.pendingProcurement} pending`, color: colors.accent },
    { key: 'feeding', name: 'Feeding Account', desc: `${totals.feeding} records`, color: colors.warning },
    { key: 'boarding', name: 'Boarding Supplies', desc: `${formatGH(totals.boardingTotal)} total`, color: colors.danger },
    { key: 'returns', name: 'Daily/Monthly Returns', desc: 'All returns', color: colors.primary },
  ];

  const incomePct = (totals.totalIncome + totals.totalExpense) > 0 ? Math.round((totals.totalIncome / (totals.totalIncome + totals.totalExpense)) * 100) : 0;
  const expensePct = (totals.totalIncome + totals.totalExpense) > 0 ? Math.round((totals.totalExpense / (totals.totalIncome + totals.totalExpense)) * 100) : 0;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Bursary Reports</Text>
      <Text style={styles.pageSubtitle}>Generate printable PDF reports for bursary operations</Text>

      <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
        <Text style={styles.pdfFullBtnText}>Generate Full Bursary Report (PDF)</Text>
      </TouchableOpacity>

      <View style={styles.pdfBtnRow}>
        {reportTypes.map((r) => (
          <TouchableOpacity key={r.key} style={[styles.pdfBtn, { backgroundColor: r.color }]} onPress={() => generatePDF(r.key)}>
            <Text style={styles.pdfBtnText}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Cash Flow</Text>
        <TouchableOpacity onPress={() => generatePDF('cashbook')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Income</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${incomePct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{formatGH(totals.totalIncome)}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Expense</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${expensePct}%`, backgroundColor: colors.danger }]} />
          </View>
          <Text style={styles.reportBarCount}>{formatGH(totals.totalExpense)}</Text>
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

  searchRow: { marginBottom: spacing.sm },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },

  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

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

  payMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },

  // Alert cards (overview)
  alertCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: colors.warning },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  // Cash / Petty / Imprest / Proc cards
  finCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  finHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  finAmount: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  finMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  finBy: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  finNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic' as const, marginTop: 2 },
  finActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  finBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: 'center' },
  finBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  // Student Accounts
  accountCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  accountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accountName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  accountMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  accountBalance: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.success, marginTop: 4 },
  expandToggle: { fontSize: fontSize.xl, color: colors.primary, fontWeight: fontWeight.bold },
  accountDetail: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  subJustLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  txnDate: { fontSize: fontSize.xs, color: colors.textSecondary, width: 80 },
  txnDesc: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  txnAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  subActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },

  // Imprest
  imprestCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },

  // Procurement
  procCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  procItem: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },

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
