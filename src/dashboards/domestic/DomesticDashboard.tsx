import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable, KitchenMenuWidget } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRequisitionStore } from '@store/requisitionStore';
import { useBoardingStore } from '@store/boardingStore';
import { useKitchenStore } from '@store/kitchenStore';
import { useTransportStore } from '@store/transportStore';
import { useCleaningStore } from '@store/cleaningStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'boarding', label: 'Boarding Houses' },
  { key: 'catering', label: 'Catering & Kitchen' },
  { key: 'transport', label: 'Transport' },
  { key: 'cleaning', label: 'Cleaning & Maintenance' },
  { key: 'approvals', label: 'Requisition Approvals' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'reports', label: 'Reports' },
];

export function DomesticDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuthStore();
  const recordedBy = user?.displayName ?? 'Asst. Headmaster (Domestic)';

  const {
    getPendingDomestic, approveByDomestic, rejectRequisition,
    requisitions,
  } = useRequisitionStore();

  const boardingStore = useBoardingStore();
  const kitchenStore = useKitchenStore();
  const transportStore = useTransportStore();
  const cleaningStore = useCleaningStore();

  const pendingApprovals = getPendingDomestic();
  const allBoardingReqs = requisitions.filter(r => r.department === 'Boarding');

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}><Text style={[styles.statusText, { color }]}>{text}</Text></View>
  );

  const handleApprove = (id: string, itemName: string) => {
    approveByDomestic(id, recordedBy);
    Alert.alert('Approved', `${itemName} approved and forwarded to Stores for issuance.`);
  };

  const handleReject = (id: string, itemName: string) => {
    rejectRequisition(id, 'domestic', recordedBy);
    Alert.alert('Rejected', `${itemName} requisition rejected and sent back.`);
  };

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    const dateStr = todayStr();
    const {
      houses, students, rooms, discipline, welfare,
    } = boardingStore;
    const { stock, issues, customMenus } = kitchenStore;
    const { vehicles, trips, maintenance, fuelLogs } = transportStore;
    const { tasks, inspections, cleaningIssues } = {
      tasks: cleaningStore.tasks,
      inspections: cleaningStore.inspections,
      cleaningIssues: cleaningStore.issues,
    };

    const totalCapacity = houses.reduce((s: number, h: any) => s + h.capacity, 0);
    const totalOccupied = houses.reduce((s: number, h: any) => s + h.occupied, 0);
    const lowStock = stock.filter((s: any) => s.quantity > 0 && s.quantity <= s.reorderLevel);
    const outOfStock = stock.filter((s: any) => s.quantity === 0);
    const openIssues = cleaningIssues.filter((i: any) => i.status !== 'Fixed');
    const complianceScore = inspections.length > 0
      ? Math.round(inspections.reduce((s: number, i: any) => s + i.score, 0) / inspections.length)
      : 100;
    const totalFuelCost = fuelLogs.reduce((s: number, f: any) => s + f.totalCost, 0);
    const totalFuelLitres = fuelLogs.reduce((s: number, f: any) => s + f.litres, 0);
    const unresolvedWelfare = welfare.filter((w: any) => !w.resolved);
    const escalatedDiscipline = discipline.filter((d: any) => d.escalated);

    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'overview') {
      title = 'Domestic Operations Overview';
      body += `<h2>Overview</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Houses</td><td style="padding:8px 12px;border:1px solid #ddd">${houses.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Students</td><td style="padding:8px 12px;border:1px solid #ddd">${students.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Boarding Occupancy</td><td style="padding:8px 12px;border:1px solid #ddd">${totalOccupied}/${totalCapacity}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Kitchen Stock Items</td><td style="padding:8px 12px;border:1px solid #ddd">${stock.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Low/Out of Stock</td><td style="padding:8px 12px;border:1px solid #ddd">${lowStock.length + outOfStock.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Vehicles</td><td style="padding:8px 12px;border:1px solid #ddd">${vehicles.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Vehicles in Maintenance</td><td style="padding:8px 12px;border:1px solid #ddd">${vehicles.filter((v: any) => v.status === 'Maintenance').length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Cleaning Tasks Pending</td><td style="padding:8px 12px;border:1px solid #ddd">${tasks.filter((t: any) => !t.done).length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Open Maintenance Issues</td><td style="padding:8px 12px;border:1px solid #ddd">${openIssues.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Compliance Score</td><td style="padding:8px 12px;border:1px solid #ddd">${complianceScore}%</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Unresolved Welfare</td><td style="padding:8px 12px;border:1px solid #ddd">${unresolvedWelfare.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Escalated Discipline</td><td style="padding:8px 12px;border:1px solid #ddd">${escalatedDiscipline.length}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'boarding') {
      title = reportType === 'full' ? title : 'Boarding Occupancy Report';
      body += `<h2>House Summary</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Housemaster</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Phone</th><th style="padding:6px 8px;border:1px solid #ddd">Capacity</th><th style="padding:6px 8px;border:1px solid #ddd">Occupied</th>
      </tr></thead><tbody>`;
      houses.forEach((h: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${h.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${h.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${h.housemaster}</td><td style="padding:4px 8px;border:1px solid #ddd">${h.phone || '-'}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${h.capacity}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${h.occupied}</td></tr>`;
      });
      body += `</tbody></table>`;

      body += `<h2>Room Allocation</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Room</th><th style="padding:6px 8px;border:1px solid #ddd">Beds</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Students</th>
      </tr></thead><tbody>`;
      rooms.forEach((r: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${r.house}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.room}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${r.occupied}/${r.beds}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.studentNames.join(', ')}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'catering') {
      title = reportType === 'full' ? title : 'Catering & Meal Report';
      body += `<h2>Kitchen Stock Levels</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Item</th><th style="padding:6px 8px;border:1px solid #ddd">Quantity</th><th style="padding:6px 8px;border:1px solid #ddd">Reorder Level</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Category</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      stock.forEach((s: any) => {
        const status = s.quantity === 0 ? 'OUT OF STOCK' : s.quantity <= s.reorderLevel ? 'LOW STOCK' : 'OK';
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${s.name}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${s.quantity} ${s.unit}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${s.reorderLevel} ${s.unit}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.category}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${status}</td></tr>`;
      });
      body += `</tbody></table>`;

      body += `<h2>Kitchen Issue Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Item</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Issued To</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Purpose</th>
      </tr></thead><tbody>`;
      issues.forEach((i: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${i.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.itemName} (${i.quantity} ${i.unit})</td><td style="padding:4px 8px;border:1px solid #ddd">${i.issuedTo}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.purpose}</td></tr>`;
      });
      body += `</tbody></table>`;

      if (customMenus.length > 0) {
        body += `<h2>Special Dietary Menus</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Person</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Role</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Reason</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Day</th><th style="padding:6px 8px;border:1px solid #ddd">Active</th>
        </tr></thead><tbody>`;
        customMenus.forEach((c: any) => {
          body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${c.personName}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.personRole}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.reason}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.day}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.active ? 'Yes' : 'No'}</td></tr>`;
        });
        body += `</tbody></table>`;
      }
    }

    if (reportType === 'full' || reportType === 'transport') {
      title = reportType === 'full' ? title : 'Transport Log Summary';
      body += `<h2>Vehicle Fleet</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Plate</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Insurance Exp.</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Roadworthiness</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Driver</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      vehicles.forEach((v: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${v.plate}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.insuranceExpiry}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.roadworthinessExpiry}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.assignedDriver || '-'}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${v.status}</td></tr>`;
      });
      body += `</tbody></table>`;

      body += `<h2>Trip Logs</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vehicle</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Driver</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Route</th><th style="padding:6px 8px;border:1px solid #ddd">Mileage</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Purpose</th>
      </tr></thead><tbody>`;
      trips.forEach((t: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${t.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.vehiclePlate}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.driverName}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.route}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.mileage} km</td><td style="padding:4px 8px;border:1px solid #ddd">${t.purpose}</td></tr>`;
      });
      body += `</tbody></table>`;

      body += `<h2>Maintenance Records</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vehicle</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Due Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Status</th><th style="padding:6px 8px;border:1px solid #ddd">Cost (GHS)</th>
      </tr></thead><tbody>`;
      maintenance.forEach((m: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${m.vehiclePlate}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.dueDate}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.status}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${m.cost ? m.cost.toFixed(2) : '-'}</td></tr>`;
      });
      body += `</tbody></table>`;

      body += `<h2>Fuel Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vehicle</th><th style="padding:6px 8px;border:1px solid #ddd">Litres</th><th style="padding:6px 8px;border:1px solid #ddd">Cost/L</th><th style="padding:6px 8px;border:1px solid #ddd">Total (GHS)</th>
      </tr></thead><tbody>`;
      fuelLogs.forEach((f: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${f.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${f.vehiclePlate}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.litres}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.costPerLitre.toFixed(2)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.totalCost.toFixed(2)}</td></tr>`;
      });
      body += `</tbody></table>`;
      body += `<p><strong>Total Fuel Cost: GHS ${totalFuelCost.toFixed(2)}</strong> | <strong>Total Litres: ${totalFuelLitres} L</strong></p>`;
    }

    if (reportType === 'full' || reportType === 'cleaning') {
      title = reportType === 'full' ? title : 'Cleaning & Compliance Report';
      body += `<h2>Cleaning Tasks</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Task</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Area</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Assigned To</th><th style="padding:6px 8px;border:1px solid #ddd">Priority</th><th style="padding:6px 8px;border:1px solid #ddd">Done</th>
      </tr></thead><tbody>`;
      tasks.forEach((t: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${t.task}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.area}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.assignedTo}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.priority}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.done ? 'Yes' : 'No'}</td></tr>`;
      });
      body += `</tbody></table>`;

      body += `<h2>Maintenance Issues</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Location</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Issue</th><th style="padding:6px 8px;border:1px solid #ddd">Priority</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      cleaningIssues.forEach((i: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${i.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.location}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.issue}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.priority}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.status}</td></tr>`;
      });
      body += `</tbody></table>`;

      body += `<h2>Inspection Reports</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Area</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Inspector</th><th style="padding:6px 8px;border:1px solid #ddd">Result</th><th style="padding:6px 8px;border:1px solid #ddd">Score</th>
      </tr></thead><tbody>`;
      inspections.forEach((i: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${i.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.area}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.inspector}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.result}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${i.score}%</td></tr>`;
      });
      body += `</tbody></table>`;
      body += `<p><strong>Overall Compliance Score: ${complianceScore}%</strong></p>`;
    }

    if (reportType === 'full' || reportType === 'welfare') {
      title = reportType === 'full' ? 'Comprehensive Domestic Operations Report' : 'Welfare & Discipline Summary';
      body += `<h2>Discipline Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Incident</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Severity</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Action</th><th style="padding:6px 8px;border:1px solid #ddd">Escalated</th>
      </tr></thead><tbody>`;
      discipline.forEach((d: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${d.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.house}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.incident}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.severity}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.actionTaken}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${d.escalated ? 'Yes' : 'No'}</td></tr>`;
      });
      body += `</tbody></table>`;

      body += `<h2>Welfare Notes</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Note</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">By</th><th style="padding:6px 8px;border:1px solid #ddd">Resolved</th>
      </tr></thead><tbody>`;
      welfare.forEach((w: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${w.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.house}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.note}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.recordedBy}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${w.resolved ? 'Yes' : 'No'}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:40px;color:#1A1A2E;max-width:900px;margin:0 auto}h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}h2{color:#2D3142;margin-top:30px}.header{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#888}.confidential{background:#FEF6E7;border-left:4px solid #F59E0B;padding:10px 15px;margin:15px 0;font-size:13px;color:#92400E}table{font-size:13px}th{font-weight:600}.footer{margin-top:40px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><span>SIMS — Asst. Headmaster (Domestic)</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1><div class="confidential">INTERNAL USE — This report contains domestic operations data for school administration purposes.</div>${body}
      <div class="footer">SIMS — Domestic Operations Report — ${dateStr}</div>
      <script>window.onload=function(){window.print()}</script></body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage pendingApprovals={pendingApprovals} boardingStore={boardingStore} kitchenStore={kitchenStore} transportStore={transportStore} cleaningStore={cleaningStore} setActivePage={setActivePage} />;

      case 'boarding':
        return <BoardingPage boardingStore={boardingStore} />;

      case 'catering':
        return <CateringPage kitchenStore={kitchenStore} />;

      case 'transport':
        return <TransportPage transportStore={transportStore} />;

      case 'cleaning':
        return <CleaningPage cleaningStore={cleaningStore} />;

      case 'approvals':
        return (
          <ApprovalsPage
            pendingApprovals={pendingApprovals}
            allBoardingReqs={allBoardingReqs}
            handleApprove={handleApprove}
            handleReject={handleReject}
            renderBadge={renderBadge}
          />
        );

      case 'compliance':
        return <CompliancePage cleaningStore={cleaningStore} transportStore={transportStore} kitchenStore={kitchenStore} />;

      case 'reports':
        return <ReportsPage boardingStore={boardingStore} kitchenStore={kitchenStore} transportStore={transportStore} cleaningStore={cleaningStore} generatePDF={generatePDF} />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Asst. Headmaster (Domestic)"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
    >
      <ScrollView>
        {renderPage()}
      </ScrollView>
    </DashboardLayout>
  );
}

// ── Overview Page ──

function OverviewPage({ pendingApprovals, boardingStore, kitchenStore, transportStore, cleaningStore, setActivePage }: any) {
  const totalCapacity = boardingStore.houses.reduce((s: number, h: any) => s + h.capacity, 0);
  const totalOccupied = boardingStore.houses.reduce((s: number, h: any) => s + h.occupied, 0);
  const lowStock = kitchenStore.getLowStock();
  const outOfStock = kitchenStore.getOutOfStock();
  const activeVehicles = transportStore.getActiveVehicles();
  const maintVehicles = transportStore.getMaintenanceVehicles();
  const openIssues = cleaningStore.issues.filter((i: any) => i.status !== 'Fixed');
  const pendingTasks = cleaningStore.tasks.filter((t: any) => !t.done);
  const welfareUnresolved = boardingStore.welfare.filter((w: any) => !w.resolved);
  const disciplineEscalated = boardingStore.discipline.filter((d: any) => d.escalated);

  return (
    <View>
      <CardGrid>
        <StatCard label="Boarding Occupancy" value={`${totalOccupied}/${totalCapacity}`} subtitle={`${boardingStore.houses.length} houses`} accentColor={colors.primary} />
        <StatCard label="Pending Requisitions" value={pendingApprovals.length} subtitle="awaiting approval" accentColor={pendingApprovals.length > 0 ? colors.warning : colors.success} />
        <StatCard label="Kitchen Alerts" value={lowStock.length + outOfStock.length} subtitle={`${outOfStock.length} out of stock`} accentColor={lowStock.length + outOfStock.length > 0 ? colors.danger : colors.success} />
        <StatCard label="Vehicles Active" value={activeVehicles.length} subtitle={`${maintVehicles.length} in maintenance`} accentColor={colors.info} />
      </CardGrid>

      <CardGrid>
        <StatCard label="Cleaning Tasks Pending" value={pendingTasks.length} subtitle={`of ${cleaningStore.tasks.length} total`} accentColor={pendingTasks.length > 0 ? colors.warning : colors.success} />
        <StatCard label="Maintenance Issues" value={openIssues.length} subtitle="unresolved" accentColor={openIssues.length > 0 ? colors.danger : colors.success} />
        <StatCard label="Welfare Concerns" value={welfareUnresolved.length} subtitle="unresolved" accentColor={welfareUnresolved.length > 0 ? colors.warning : colors.success} />
        <StatCard label="Discipline Escalated" value={disciplineEscalated.length} subtitle="to Headmaster" accentColor={disciplineEscalated.length > 0 ? colors.danger : colors.success} />
      </CardGrid>

      <Text style={styles.pageTitle}>Houses Summary</Text>
      <DataTable
        columns={[
          { key: 'name', label: 'House', render: (i: any) => i.name },
          { key: 'type', label: 'Type', render: (i: any) => i.type },
          { key: 'occupancy', label: 'Occupancy', render: (i: any) => `${i.occupied}/${i.capacity}` },
          { key: 'housemaster', label: 'Housemaster', render: (i: any) => i.housemaster },
        ]}
        data={boardingStore.houses}
      />

      {pendingApprovals.length > 0 && (
        <TouchableOpacity style={styles.alertBanner} onPress={() => setActivePage('approvals')}>
          <Text style={styles.alertBannerText}>{pendingApprovals.length} requisition(s) awaiting your approval →</Text>
        </TouchableOpacity>
      )}

      {welfareUnresolved.length > 0 && (
        <TouchableOpacity style={[styles.alertBanner, { backgroundColor: colors.dangerBg, borderLeftColor: colors.danger }]} onPress={() => setActivePage('boarding')}>
          <Text style={[styles.alertBannerText, { color: colors.danger }]}>{welfareUnresolved.length} unresolved welfare concern(s) in boarding →</Text>
        </TouchableOpacity>
      )}

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <TouchableOpacity style={[styles.alertBanner, { backgroundColor: colors.warningBg, borderLeftColor: colors.warning }]} onPress={() => setActivePage('catering')}>
          <Text style={[styles.alertBannerText, { color: colors.warning }]}>{lowStock.length + outOfStock.length} kitchen stock item(s) need reordering →</Text>
        </TouchableOpacity>
      )}

      {openIssues.length > 0 && (
        <TouchableOpacity style={[styles.alertBanner, { backgroundColor: colors.dangerBg, borderLeftColor: colors.danger }]} onPress={() => setActivePage('cleaning')}>
          <Text style={[styles.alertBannerText, { color: colors.danger }]}>{openIssues.length} maintenance issue(s) unresolved →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Boarding Page ──

function BoardingPage({ boardingStore }: any) {
  const [subTab, setSubTab] = useState('houses');
  const tabs = ['houses', 'rollcall', 'discipline', 'welfare'];

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Students" value={boardingStore.students.length} accentColor={colors.primary} />
        <StatCard label="Houses" value={boardingStore.houses.length} accentColor={colors.info} />
        <StatCard label="Welfare Open" value={boardingStore.welfare.filter((w: any) => !w.resolved).length} accentColor={colors.warning} />
        <StatCard label="Discipline Cases" value={boardingStore.discipline.length} accentColor={colors.danger} />
      </CardGrid>

      <View style={styles.subTabRow}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} style={[styles.subTab, subTab === t && styles.subTabActive]} onPress={() => setSubTab(t)}>
            <Text style={[styles.subTabText, subTab === t && styles.subTabTextActive]}>{t === 'houses' ? 'Houses & Rooms' : t === 'rollcall' ? 'Roll Call' : t === 'discipline' ? 'Discipline' : 'Welfare'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {subTab === 'houses' && (
        <View>
          <Text style={styles.pageTitle}>Boarding Houses</Text>
          <DataTable
            columns={[
              { key: 'name', label: 'House', render: (i: any) => i.name },
              { key: 'type', label: 'Type', render: (i: any) => i.type },
              { key: 'occ', label: 'Occupancy', render: (i: any) => `${i.occupied}/${i.capacity}` },
              { key: 'housemaster', label: 'Housemaster', render: (i: any) => i.housemaster },
              { key: 'phone', label: 'Phone', render: (i: any) => i.phone },
            ]}
            data={boardingStore.houses}
          />

          <Text style={styles.sectionTitle}>Room Allocation</Text>
          <DataTable
            columns={[
              { key: 'house', label: 'House', render: (i: any) => i.house },
              { key: 'room', label: 'Room', render: (i: any) => i.room },
              { key: 'beds', label: 'Beds', render: (i: any) => `${i.occupied}/${i.beds}` },
              { key: 'students', label: 'Students', render: (i: any) => i.studentNames.join(', ') },
            ]}
            data={boardingStore.rooms}
          />
        </View>
      )}

      {subTab === 'rollcall' && (
        <View>
          <Text style={styles.pageTitle}>Today's Roll Call</Text>
          <Text style={styles.pageSubtitle}>Attendance across all houses</Text>
          <DataTable
            columns={[
              { key: 'house', label: 'House', render: (i: any) => i.house },
              { key: 'student', label: 'Student', render: (i: any) => i.studentName },
              { key: 'room', label: 'Room', render: (i: any) => i.room },
              { key: 'status', label: 'Status', render: (i: any) => i.status },
              { key: 'notes', label: 'Notes', render: (i: any) => i.notes ?? '-' },
            ]}
            data={boardingStore.rollCalls}
          />
        </View>
      )}

      {subTab === 'discipline' && (
        <View>
          <Text style={styles.pageTitle}>Discipline Log</Text>
          <Text style={styles.pageSubtitle}>All discipline incidents across houses</Text>
          {boardingStore.discipline.map((d: any) => (
            <View key={d.id} style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{d.studentName} — {d.incident}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (d.severity === 'Critical' || d.severity === 'Serious' ? colors.danger : d.severity === 'Moderate' ? colors.warning : colors.success) + '20' }]}>
                  <Text style={[styles.statusText, { color: d.severity === 'Critical' || d.severity === 'Serious' ? colors.danger : d.severity === 'Moderate' ? colors.warning : colors.success }]}>{d.severity}</Text>
                </View>
              </View>
              <Text style={styles.detailMeta}>{d.date} | {d.house} House | By: {d.recordedBy}</Text>
              <Text style={styles.detailBody}>Action: {d.actionTaken}</Text>
              {d.escalated && <Text style={styles.escalatedTag}>⚠ Escalated to Headmaster</Text>}
            </View>
          ))}
        </View>
      )}

      {subTab === 'welfare' && (
        <View>
          <Text style={styles.pageTitle}>Welfare Notes</Text>
          <Text style={styles.pageSubtitle}>Student wellbeing monitoring</Text>
          {boardingStore.welfare.map((w: any) => (
            <View key={w.id} style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{w.studentName} — {w.house} House</Text>
                <View style={[styles.statusBadge, { backgroundColor: (w.resolved ? colors.success : colors.warning) + '20' }]}>
                  <Text style={[styles.statusText, { color: w.resolved ? colors.success : colors.warning }]}>{w.resolved ? 'Resolved' : 'Open'}</Text>
                </View>
              </View>
              <Text style={styles.detailMeta}>{w.date} | By: {w.recordedBy}</Text>
              <Text style={styles.detailBody}>{w.note}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Catering Page ──

function CateringPage({ kitchenStore }: any) {
  const [subTab, setSubTab] = useState('stock');
  const tabs = ['stock', 'menu', 'issues'];
  const lowStock = kitchenStore.getLowStock();
  const outOfStock = kitchenStore.getOutOfStock();

  return (
    <View>
      <CardGrid>
        <StatCard label="Stock Items" value={kitchenStore.stock.length} accentColor={colors.primary} />
        <StatCard label="Low Stock" value={lowStock.length} accentColor={colors.warning} />
        <StatCard label="Out of Stock" value={outOfStock.length} accentColor={colors.danger} />
        <StatCard label="Custom Menus" value={kitchenStore.customMenus.filter((c: any) => c.active).length} accentColor={colors.info} />
      </CardGrid>

      <View style={styles.subTabRow}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} style={[styles.subTab, subTab === t && styles.subTabActive]} onPress={() => setSubTab(t)}>
            <Text style={[styles.subTabText, subTab === t && styles.subTabTextActive]}>{t === 'stock' ? 'Stock Levels' : t === 'menu' ? 'Weekly Menu' : 'Issue Log'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {subTab === 'stock' && (
        <View>
          <Text style={styles.pageTitle}>Kitchen Stock Levels</Text>
          <DataTable
            columns={[
              { key: 'name', label: 'Item', render: (i: any) => i.name },
              { key: 'qty', label: 'Quantity', render: (i: any) => `${i.quantity} ${i.unit}` },
              { key: 'reorder', label: 'Reorder Level', render: (i: any) => `${i.reorderLevel} ${i.unit}` },
              { key: 'category', label: 'Category', render: (i: any) => i.category },
              { key: 'status', label: 'Status', render: (i: any) => i.quantity === 0 ? 'OUT' : i.quantity <= i.reorderLevel ? 'LOW' : 'OK' },
            ]}
            data={kitchenStore.stock}
          />
        </View>
      )}

      {subTab === 'menu' && (
        <View>
          <Text style={styles.pageTitle}>Weekly Menu</Text>
          <KitchenMenuWidget />

          <Text style={styles.sectionTitle}>Special Dietary Menus</Text>
          {kitchenStore.customMenus.map((c: any) => (
            <View key={c.id} style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{c.personName} ({c.personRole})</Text>
                <View style={[styles.statusBadge, { backgroundColor: (c.active ? colors.success : colors.textLight) + '20' }]}>
                  <Text style={[styles.statusText, { color: c.active ? colors.success : colors.textLight }]}>{c.active ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
              <Text style={styles.detailMeta}>Reason: {c.reason} | Day: {c.day}</Text>
              <Text style={styles.detailBody}>B: {c.breakfast}</Text>
              <Text style={styles.detailBody}>L: {c.lunch}</Text>
              <Text style={styles.detailBody}>D: {c.dinner}</Text>
            </View>
          ))}
        </View>
      )}

      {subTab === 'issues' && (
        <View>
          <Text style={styles.pageTitle}>Kitchen Issue Log</Text>
          <Text style={styles.pageSubtitle}>Items issued from stock to kitchen</Text>
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (i: any) => i.date },
              { key: 'item', label: 'Item', render: (i: any) => `${i.itemName} (${i.quantity} ${i.unit})` },
              { key: 'to', label: 'Issued To', render: (i: any) => i.issuedTo },
              { key: 'purpose', label: 'Purpose', render: (i: any) => i.purpose },
            ]}
            data={kitchenStore.issues}
          />
        </View>
      )}
    </View>
  );
}

// ── Transport Page ──

function TransportPage({ transportStore }: any) {
  const [subTab, setSubTab] = useState('fleet');
  const tabs = ['fleet', 'maintenance', 'trips', 'drivers'];
  const activeVehicles = transportStore.getActiveVehicles();
  const maintVehicles = transportStore.getMaintenanceVehicles();
  const upcomingMaint = transportStore.getUpcomingMaintenance();
  const inProgressMaint = transportStore.getInProgressMaintenance();
  const onDutyDrivers = transportStore.getOnDutyDrivers();

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Vehicles" value={transportStore.vehicles.length} accentColor={colors.primary} />
        <StatCard label="Active" value={activeVehicles.length} accentColor={colors.success} />
        <StatCard label="In Maintenance" value={maintVehicles.length} accentColor={colors.warning} />
        <StatCard label="Drivers On Duty" value={onDutyDrivers.length} accentColor={colors.info} />
      </CardGrid>

      <View style={styles.subTabRow}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} style={[styles.subTab, subTab === t && styles.subTabActive]} onPress={() => setSubTab(t)}>
            <Text style={[styles.subTabText, subTab === t && styles.subTabTextActive]}>{t === 'fleet' ? 'Fleet' : t === 'maintenance' ? 'Maintenance' : t === 'trips' ? 'Trip Logs' : 'Drivers'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {subTab === 'fleet' && (
        <View>
          <Text style={styles.pageTitle}>Vehicle Fleet</Text>
          <DataTable
            columns={[
              { key: 'plate', label: 'Plate', render: (i: any) => i.plate },
              { key: 'type', label: 'Type', render: (i: any) => i.type },
              { key: 'status', label: 'Status', render: (i: any) => i.status },
              { key: 'driver', label: 'Driver', render: (i: any) => i.assignedDriver ?? '-' },
              { key: 'insurance', label: 'Insurance Exp.', render: (i: any) => i.insuranceExpiry },
            ]}
            data={transportStore.vehicles}
          />
        </View>
      )}

      {subTab === 'maintenance' && (
        <View>
          <Text style={styles.pageTitle}>Maintenance Records</Text>
          <CardGrid>
            <StatCard label="Upcoming/Scheduled" value={upcomingMaint.length} accentColor={colors.warning} />
            <StatCard label="In Progress" value={inProgressMaint.length} accentColor={colors.danger} />
          </CardGrid>
          {transportStore.maintenance.map((m: any) => (
            <View key={m.id} style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{m.vehiclePlate} — {m.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (m.status === 'Completed' ? colors.success : m.status === 'In Progress' ? colors.danger : m.status === 'Scheduled' ? colors.info : colors.warning) + '20' }]}>
                  <Text style={[styles.statusText, { color: m.status === 'Completed' ? colors.success : m.status === 'In Progress' ? colors.danger : m.status === 'Scheduled' ? colors.info : colors.warning }]}>{m.status}</Text>
                </View>
              </View>
              <Text style={styles.detailMeta}>Due: {m.dueDate}{m.cost ? ` | Cost: GH₵${m.cost.toLocaleString()}` : ''}</Text>
              {m.notes && <Text style={styles.detailBody}>{m.notes}</Text>}
              {m.completedDate && <Text style={styles.detailBody}>Completed: {m.completedDate}</Text>}
            </View>
          ))}
        </View>
      )}

      {subTab === 'trips' && (
        <View>
          <Text style={styles.pageTitle}>Trip Logs</Text>
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (i: any) => i.date },
              { key: 'vehicle', label: 'Vehicle', render: (i: any) => i.vehiclePlate },
              { key: 'driver', label: 'Driver', render: (i: any) => i.driverName },
              { key: 'route', label: 'Route', render: (i: any) => i.route },
              { key: 'mileage', label: 'Mileage', render: (i: any) => `${i.mileage} km` },
              { key: 'purpose', label: 'Purpose', render: (i: any) => i.purpose },
            ]}
            data={transportStore.trips}
          />
        </View>
      )}

      {subTab === 'drivers' && (
        <View>
          <Text style={styles.pageTitle}>Drivers</Text>
          <DataTable
            columns={[
              { key: 'name', label: 'Name', render: (i: any) => i.name },
              { key: 'phone', label: 'Phone', render: (i: any) => i.phone },
              { key: 'license', label: 'License', render: (i: any) => `Class ${i.license} (exp: ${i.licenseExpiry})` },
              { key: 'vehicle', label: 'Assigned Vehicle', render: (i: any) => i.assignedVehicle },
              { key: 'status', label: 'Status', render: (i: any) => i.status },
            ]}
            data={transportStore.drivers}
          />
        </View>
      )}
    </View>
  );
}

// ── Cleaning & Maintenance Page ──

function CleaningPage({ cleaningStore }: any) {
  const [subTab, setSubTab] = useState('tasks');
  const tabs = ['tasks', 'issues', 'inspections', 'staff'];
  const pendingTasks = cleaningStore.tasks.filter((t: any) => !t.done);
  const openIssues = cleaningStore.issues.filter((i: any) => i.status !== 'Fixed');
  const presentStaff = cleaningStore.getPresentStaff();
  const complianceScore = cleaningStore.getComplianceScore();

  return (
    <View>
      <CardGrid>
        <StatCard label="Tasks Pending" value={pendingTasks.length} subtitle={`of ${cleaningStore.tasks.length}`} accentColor={pendingTasks.length > 0 ? colors.warning : colors.success} />
        <StatCard label="Maintenance Issues" value={openIssues.length} accentColor={openIssues.length > 0 ? colors.danger : colors.success} />
        <StatCard label="Staff Present" value={presentStaff.length} subtitle={`of ${cleaningStore.staff.length}`} accentColor={colors.info} />
        <StatCard label="Compliance Score" value={`${complianceScore}%`} accentColor={complianceScore >= 80 ? colors.success : complianceScore >= 60 ? colors.warning : colors.danger} />
      </CardGrid>

      <View style={styles.subTabRow}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} style={[styles.subTab, subTab === t && styles.subTabActive]} onPress={() => setSubTab(t)}>
            <Text style={[styles.subTabText, subTab === t && styles.subTabTextActive]}>{t === 'tasks' ? 'Tasks' : t === 'issues' ? 'Maintenance Issues' : t === 'inspections' ? 'Inspections' : 'Staff'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {subTab === 'tasks' && (
        <View>
          <Text style={styles.pageTitle}>Cleaning Tasks — Today</Text>
          <DataTable
            columns={[
              { key: 'task', label: 'Task', render: (i: any) => i.task },
              { key: 'area', label: 'Area', render: (i: any) => i.area },
              { key: 'assignedTo', label: 'Assigned To', render: (i: any) => i.assignedTo },
              { key: 'priority', label: 'Priority', render: (i: any) => i.priority },
              { key: 'done', label: 'Status', render: (i: any) => i.done ? '✓ Done' : 'Pending' },
            ]}
            data={cleaningStore.tasks}
          />
        </View>
      )}

      {subTab === 'issues' && (
        <View>
          <Text style={styles.pageTitle}>Maintenance Issues</Text>
          {cleaningStore.issues.map((i: any) => (
            <View key={i.id} style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{i.issue} — {i.location}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (i.status === 'Fixed' ? colors.success : i.status === 'Repair Scheduled' ? colors.info : colors.danger) + '20' }]}>
                  <Text style={[styles.statusText, { color: i.status === 'Fixed' ? colors.success : i.status === 'Repair Scheduled' ? colors.info : colors.danger }]}>{i.status}</Text>
                </View>
              </View>
              <Text style={styles.detailMeta}>{i.date} | Priority: {i.priority} | By: {i.reportedBy}</Text>
              {i.notes && <Text style={styles.detailBody}>{i.notes}</Text>}
            </View>
          ))}
        </View>
      )}

      {subTab === 'inspections' && (
        <View>
          <Text style={styles.pageTitle}>Inspection Reports</Text>
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (i: any) => i.date },
              { key: 'area', label: 'Area', render: (i: any) => i.area },
              { key: 'inspector', label: 'Inspector', render: (i: any) => i.inspector },
              { key: 'result', label: 'Result', render: (i: any) => i.result },
              { key: 'score', label: 'Score', render: (i: any) => `${i.score}%` },
            ]}
            data={cleaningStore.inspections}
          />
        </View>
      )}

      {subTab === 'staff' && (
        <View>
          <Text style={styles.pageTitle}>Cleaning Staff</Text>
          <DataTable
            columns={[
              { key: 'name', label: 'Name', render: (i: any) => i.name },
              { key: 'role', label: 'Role', render: (i: any) => i.role },
              { key: 'area', label: 'Area', render: (i: any) => i.area },
              { key: 'status', label: 'Status', render: (i: any) => i.status },
              { key: 'checkin', label: 'Checked In', render: (i: any) => i.todayCheckedIn ? '✓' : '✗' },
            ]}
            data={cleaningStore.staff}
          />
        </View>
      )}
    </View>
  );
}

// ── Approvals Page ──

function ApprovalsPage({ pendingApprovals, allBoardingReqs, handleApprove, handleReject, renderBadge }: any) {
  return (
    <View>
      <CardGrid>
        <StatCard label="Pending" value={pendingApprovals.length} accentColor={pendingApprovals.length > 0 ? colors.warning : colors.success} />
        <StatCard label="Urgent" value={pendingApprovals.filter((r: any) => r.priority === 'Urgent').length} accentColor={colors.danger} />
        <StatCard label="Normal" value={pendingApprovals.filter((r: any) => r.priority === 'Normal').length} accentColor={colors.info} />
        <StatCard label="Low" value={pendingApprovals.filter((r: any) => r.priority === 'Low').length} accentColor={colors.textSecondary} />
      </CardGrid>

      <Text style={styles.pageTitle}>Requisition Approvals</Text>
      <Text style={styles.pageSubtitle}>Requisitions approved by Senior Housemaster — review and forward to Stores for issuance</Text>

      {pendingApprovals.length === 0 && <Text style={styles.emptyText}>No pending approvals. All caught up!</Text>}

      {pendingApprovals.map((r: any) => (
        <View key={r.id} style={[styles.approvalCard, { borderLeftColor: r.priority === 'Urgent' ? colors.danger : colors.warning }]}>
          <View style={styles.approvalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.approvalType}>{r.itemName} — {r.quantity} {r.unit}</Text>
              <Text style={styles.approvalFrom}>From: {r.requestedBy}{r.house ? ` | ${r.house} House` : ''}</Text>
              <Text style={styles.approvalFrom}>Date: {r.date} | Priority: {r.priority}</Text>
              {r.notes && <Text style={styles.approvalFrom}>Notes: {r.notes}</Text>}
              {r.approvals.find((a: any) => a.step === 'senior_housemaster') && (
                <Text style={styles.approvalFrom}>Senior Housemaster: {r.approvals.find((a: any) => a.step === 'senior_housemaster')?.approver} on {r.approvals.find((a: any) => a.step === 'senior_housemaster')?.date}</Text>
              )}
            </View>
            {renderBadge(r.priority, r.priority === 'Urgent' ? colors.danger : r.priority === 'Normal' ? colors.info : colors.textSecondary)}
          </View>
          <View style={styles.approvalActions}>
            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(r.id, r.itemName)}>
              <Text style={styles.approveText}>Approve &amp; Forward to Stores</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(r.id, r.itemName)}>
              <Text style={styles.rejectText}>Send Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>All Boarding Requisitions</Text>
      {allBoardingReqs.map((r: any) => (
        <View key={r.id} style={styles.reqHistoryCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reqHistoryTitle}>{r.itemName} — {r.quantity} {r.unit}</Text>
            <Text style={styles.reqHistoryMeta}>{r.date} | {r.requestedBy}{r.house ? ` | ${r.house}` : ''}</Text>
          </View>
          {renderBadge(r.status, r.status === 'Received' ? colors.success : r.status === 'Issued' ? colors.info : r.status === 'Domestic Approved' ? colors.purple : r.status === 'Senior Housemaster Approved' ? colors.primaryLight : r.status === 'Rejected' ? colors.danger : colors.warning)}
        </View>
      ))}
    </View>
  );
}

// ── Compliance Page ──

function CompliancePage({ cleaningStore, transportStore, kitchenStore }: any) {
  const complianceScore = cleaningStore.getComplianceScore();
  const expiringInsurance = transportStore.getExpiringInsurance(90);
  const lowStock = kitchenStore.getLowStock();
  const outOfStock = kitchenStore.getOutOfStock();
  const openIssues = cleaningStore.issues.filter((i: any) => i.status !== 'Fixed');

  return (
    <View>
      <CardGrid>
        <StatCard label="Cleaning Compliance" value={`${complianceScore}%`} accentColor={complianceScore >= 80 ? colors.success : complianceScore >= 60 ? colors.warning : colors.danger} />
        <StatCard label="Insurance Expiring" value={expiringInsurance.length} subtitle="within 90 days" accentColor={expiringInsurance.length > 0 ? colors.warning : colors.success} />
        <StatCard label="Kitchen Stock Alerts" value={lowStock.length + outOfStock.length} accentColor={lowStock.length + outOfStock.length > 0 ? colors.danger : colors.success} />
        <StatCard label="Open Maintenance" value={openIssues.length} accentColor={openIssues.length > 0 ? colors.danger : colors.success} />
      </CardGrid>

      <Text style={styles.pageTitle}>Compliance Tracker</Text>
      <Text style={styles.pageSubtitle}>Hygiene, safety, and regulatory inspections</Text>

      <Text style={styles.sectionTitle}>Cleaning Inspections</Text>
      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (i: any) => i.date },
          { key: 'area', label: 'Area', render: (i: any) => i.area },
          { key: 'inspector', label: 'Inspector', render: (i: any) => i.inspector },
          { key: 'result', label: 'Result', render: (i: any) => i.result },
          { key: 'score', label: 'Score', render: (i: any) => `${i.score}%` },
        ]}
        data={cleaningStore.inspections}
      />

      <Text style={styles.sectionTitle}>Vehicle Insurance & Roadworthiness</Text>
      <DataTable
        columns={[
          { key: 'plate', label: 'Plate', render: (i: any) => i.plate },
          { key: 'type', label: 'Type', render: (i: any) => i.type },
          { key: 'insurance', label: 'Insurance Exp.', render: (i: any) => i.insuranceExpiry },
          { key: 'roadworthy', label: 'Roadworthiness Exp.', render: (i: any) => i.roadworthinessExpiry },
          { key: 'status', label: 'Status', render: (i: any) => i.status },
        ]}
        data={transportStore.vehicles}
      />

      <Text style={styles.sectionTitle}>Kitchen Stock Alerts</Text>
      {outOfStock.length === 0 && lowStock.length === 0 ? (
        <Text style={styles.emptyText}>All kitchen stock items are at healthy levels.</Text>
      ) : (
        <DataTable
          columns={[
            { key: 'name', label: 'Item', render: (i: any) => i.name },
            { key: 'qty', label: 'Current', render: (i: any) => `${i.quantity} ${i.unit}` },
            { key: 'reorder', label: 'Reorder At', render: (i: any) => `${i.reorderLevel} ${i.unit}` },
            { key: 'status', label: 'Status', render: (i: any) => i.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK' },
          ]}
          data={[...outOfStock, ...lowStock]}
        />
      )}
    </View>
  );
}

// ── Reports Page ──

function ReportsPage({ boardingStore, kitchenStore, transportStore, cleaningStore, generatePDF }: any) {
  const { houses, students, discipline, welfare } = boardingStore;
  const { stock, issues } = kitchenStore;
  const { vehicles, trips, fuelLogs } = transportStore;
  const { tasks, inspections, issues: cleaningIssues } = cleaningStore;

  const totalCapacity = houses.reduce((s: number, h: any) => s + h.capacity, 0);
  const totalOccupied = houses.reduce((s: number, h: any) => s + h.occupied, 0);
  const lowStock = stock.filter((s: any) => s.quantity > 0 && s.quantity <= s.reorderLevel);
  const outOfStock = stock.filter((s: any) => s.quantity === 0);
  const complianceScore = inspections.length > 0
    ? Math.round(inspections.reduce((s: number, i: any) => s + i.score, 0) / inspections.length)
    : 100;
  const totalFuelCost = fuelLogs.reduce((s: number, f: any) => s + f.totalCost, 0);
  const unresolvedWelfare = welfare.filter((w: any) => !w.resolved);
  const escalatedDiscipline = discipline.filter((d: any) => d.escalated);
  const openCleaningIssues = cleaningIssues.filter((i: any) => i.status !== 'Fixed');
  const pendingTasks = tasks.filter((t: any) => !t.done);
  const okStock = stock.filter((s: any) => s.quantity > s.reorderLevel).length;
  const okStockPct = stock.length > 0 ? Math.round((okStock / stock.length) * 100) : 100;
  const lowStockPct = stock.length > 0 ? Math.round((lowStock.length / stock.length) * 100) : 0;
  const outOfStockPct = stock.length > 0 ? Math.round((outOfStock.length / stock.length) * 100) : 0;
  const completedTasks = tasks.filter((t: any) => t.done).length;
  const completedPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const pendingPct = tasks.length > 0 ? Math.round((pendingTasks.length / tasks.length) * 100) : 0;
  const openIssuesPct = cleaningIssues.length > 0 ? Math.round((openCleaningIssues.length / cleaningIssues.length) * 100) : 0;
  const unresolvedWelfarePct = welfare.length > 0 ? Math.round((unresolvedWelfare.length / welfare.length) * 100) : 0;
  const escalatedPct = discipline.length > 0 ? Math.round((escalatedDiscipline.length / discipline.length) * 100) : 0;

  const reportTypes = [
    { key: 'overview', name: 'Operations Overview', desc: `${houses.length} houses, ${stock.length} stock items, ${vehicles.length} vehicles`, color: colors.primary },
    { key: 'boarding', name: 'Boarding Occupancy', desc: `${students.length} students, ${totalOccupied}/${totalCapacity} occupancy`, color: colors.info },
    { key: 'catering', name: 'Catering & Meal', desc: `${stock.length} stock items, ${issues.length} issues logged, ${lowStock.length + outOfStock.length} alerts`, color: colors.success },
    { key: 'transport', name: 'Transport Log', desc: `${vehicles.length} vehicles, ${trips.length} trips, GHS ${totalFuelCost.toFixed(0)} fuel`, color: colors.warning },
    { key: 'cleaning', name: 'Cleaning & Compliance', desc: `${tasks.length} tasks, ${inspections.length} inspections, ${complianceScore}% compliance`, color: colors.purple },
    { key: 'welfare', name: 'Welfare & Discipline', desc: `${unresolvedWelfare.length} open welfare, ${discipline.length} discipline, ${escalatedDiscipline.length} escalated`, color: colors.danger },
  ];

  return (
    <View>
      <Text style={styles.pageTitle}>Domestic Operations Reports</Text>
      <Text style={styles.pageSubtitle}>Generate printable PDF reports across all domestic operations</Text>

      <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
        <Text style={styles.pdfFullBtnText}>Generate Full Report (PDF)</Text>
      </TouchableOpacity>

      <View style={styles.pdfBtnRow}>
        {reportTypes.map((r) => (
          <TouchableOpacity key={r.key} style={[styles.pdfBtn, { backgroundColor: r.color }]} onPress={() => generatePDF(r.key)}>
            <Text style={styles.pdfBtnText}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Visual breakdowns */}

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Boarding Occupancy by House</Text>
        <TouchableOpacity onPress={() => generatePDF('boarding')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        {houses.map((h: any) => {
          const pct = h.capacity > 0 ? Math.round((h.occupied / h.capacity) * 100) : 0;
          return (
            <View key={h.id} style={styles.reportBarRow}>
              <Text style={styles.reportBarLabel}>{h.name}</Text>
              <View style={styles.reportBarTrack}>
                <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: pct >= 95 ? colors.danger : pct >= 80 ? colors.warning : colors.success }]} />
              </View>
              <Text style={styles.reportBarCount}>{h.occupied}/{h.capacity}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Kitchen Stock Status</Text>
        <TouchableOpacity onPress={() => generatePDF('catering')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>OK</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${okStockPct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{okStock}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Low Stock</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${lowStockPct}%`, backgroundColor: colors.warning }]} />
          </View>
          <Text style={styles.reportBarCount}>{lowStock.length}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Out of Stock</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${outOfStockPct}%`, backgroundColor: colors.danger }]} />
          </View>
          <Text style={styles.reportBarCount}>{outOfStock.length}</Text>
        </View>
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Vehicle Status</Text>
        <TouchableOpacity onPress={() => generatePDF('transport')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        {['Active', 'Maintenance', 'Retired'].map((st) => {
          const count = vehicles.filter((v: any) => v.status === st).length;
          const pct = vehicles.length > 0 ? Math.round((count / vehicles.length) * 100) : 0;
          return (
            <View key={st} style={styles.reportBarRow}>
              <Text style={styles.reportBarLabel}>{st}</Text>
              <View style={styles.reportBarTrack}>
                <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: st === 'Active' ? colors.success : st === 'Maintenance' ? colors.warning : colors.textLight }]} />
              </View>
              <Text style={styles.reportBarCount}>{count}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Cleaning Task Completion</Text>
        <TouchableOpacity onPress={() => generatePDF('cleaning')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Completed</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${completedPct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{completedTasks}/{tasks.length}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Pending</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${pendingPct}%`, backgroundColor: colors.warning }]} />
          </View>
          <Text style={styles.reportBarCount}>{pendingTasks.length}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Open Issues</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${openIssuesPct}%`, backgroundColor: colors.danger }]} />
          </View>
          <Text style={styles.reportBarCount}>{openCleaningIssues.length}</Text>
        </View>
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Welfare & Discipline</Text>
        <TouchableOpacity onPress={() => generatePDF('welfare')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Unresolved Welfare</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${unresolvedWelfarePct}%`, backgroundColor: colors.warning }]} />
          </View>
          <Text style={styles.reportBarCount}>{unresolvedWelfare.length}/{welfare.length}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Escalated Discipline</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${escalatedPct}%`, backgroundColor: colors.danger }]} />
          </View>
          <Text style={styles.reportBarCount}>{escalatedDiscipline.length}/{discipline.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },

  alertBanner: { backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.warning },
  alertBannerText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.warning },

  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  subTabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' },
  subTab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  subTabActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  subTabText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  subTabTextActive: { color: colors.primary, fontWeight: fontWeight.bold },

  detailCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.border },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  detailTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1, marginRight: spacing.sm },
  detailMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  detailBody: { fontSize: fontSize.sm, color: colors.text, marginBottom: 2 },
  escalatedTag: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger, marginTop: spacing.xs, letterSpacing: 0.5 },

  approvalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderLeftWidth: 4 },
  approvalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  approvalType: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  approvalFrom: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  approvalActions: { flexDirection: 'row', gap: spacing.sm },
  approveBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  approveText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rejectBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.danger },
  rejectText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  reqHistoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  reqHistoryTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  reqHistoryMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  reportDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  reportDetail: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  reportAction: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },

  pdfFullBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  pdfFullBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  pdfBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pdfBtn: { borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  pdfBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  pdfLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },

  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
  reportSectionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  reportBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  reportBarLabel: { fontSize: fontSize.sm, color: colors.textSecondary, width: 120, flexShrink: 0 },
  reportBarTrack: { flex: 1, height: 12, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, marginHorizontal: spacing.sm, overflow: 'hidden' },
  reportBarFill: { height: '100%', borderRadius: radius.sm },
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, width: 50, textAlign: 'right' },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
