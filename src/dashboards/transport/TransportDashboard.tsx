import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { RequisitionModal } from '@components/index';
import {
  useTransportStore,
  VEHICLE_STATUSES, VEHICLE_TYPES, MAINTENANCE_STATUSES, MAINTENANCE_TYPES,
  DRIVER_STATUSES, LICENSE_CLASSES,
} from '@store/transportStore';
import type {
  VehicleStatus, VehicleType, MaintenanceType,
  DriverStatus, LicenseClass,
} from '@store/transportStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'vehicles', label: 'Vehicle Registry' },
  { key: 'trips', label: 'Trip Log' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'fuel', label: 'Fuel & Supplies' },
  { key: 'drivers', label: 'Driver Roster' },
  { key: 'reports', label: 'Reports' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysUntil = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export function TransportDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showReqModal, setShowReqModal] = useState(false);
  const { user, logout } = useAuthStore();

  const {
    vehicles, trips, maintenance, fuelLogs, drivers,
    addVehicle, updateVehicle, deleteVehicle, getActiveVehicles, getMaintenanceVehicles, getExpiringInsurance,
    addTrip, deleteTrip, getTodayTrips,
    addMaintenance, updateMaintenanceStatus, deleteMaintenance, getUpcomingMaintenance, getInProgressMaintenance,
    addFuelLog, deleteFuelLog, getTotalFuelCost, getTotalFuelLitres,
    addDriver, updateDriver, deleteDriver, getOnDutyDrivers,
  } = useTransportStore();

  // ── Form state ──
  const [vehicleForm, setVehicleForm] = useState({
    plate: '', type: 'Coaster Bus (30-seater)' as VehicleType,
    insuranceExpiry: '', roadworthinessExpiry: '', status: 'Active' as VehicleStatus,
    assignedDriver: '', notes: '',
  });
  const [tripForm, setTripForm] = useState({
    vehiclePlate: vehicles[0]?.plate || '', driverName: vehicles[0]?.assignedDriver || '',
    route: '', mileage: '', purpose: '', departureTime: '08:00', returnTime: '',
  });
  const [maintForm, setMaintForm] = useState({
    vehiclePlate: vehicles[0]?.plate || '', type: 'Oil Change' as MaintenanceType,
    dueDate: todayStr(), cost: '', notes: '',
  });
  const [fuelForm, setFuelForm] = useState({
    vehiclePlate: vehicles[0]?.plate || '', litres: '', costPerLitre: '14',
    odometer: '', filledBy: '',
  });
  const [driverForm, setDriverForm] = useState({
    name: '', phone: '', license: 'C' as LicenseClass, licenseExpiry: '',
    assignedVehicle: '', status: 'Off Duty' as DriverStatus, dutyStart: '', dutyEnd: '',
  });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => { setShowModal(false); };

  // ── Handlers ──
  const handleSaveVehicle = () => {
    if (!vehicleForm.plate.trim()) { Alert.alert('Error', 'Vehicle plate is required'); return; }
    addVehicle({
      plate: vehicleForm.plate.trim(), type: vehicleForm.type,
      insuranceExpiry: vehicleForm.insuranceExpiry || '2026-12-31',
      roadworthinessExpiry: vehicleForm.roadworthinessExpiry || '2026-12-31',
      status: vehicleForm.status,
      assignedDriver: vehicleForm.assignedDriver.trim() || undefined,
      notes: vehicleForm.notes.trim() || undefined,
    });
    setVehicleForm({ plate: '', type: 'Coaster Bus (30-seater)', insuranceExpiry: '', roadworthinessExpiry: '', status: 'Active', assignedDriver: '', notes: '' });
    closeModal();
  };

  const handleSaveTrip = () => {
    if (!tripForm.route.trim() || !tripForm.mileage.trim()) { Alert.alert('Error', 'Route and mileage are required'); return; }
    addTrip({
      date: todayStr(), vehiclePlate: tripForm.vehiclePlate, driverName: tripForm.driverName,
      route: tripForm.route.trim(), mileage: parseInt(tripForm.mileage) || 0,
      purpose: tripForm.purpose.trim(), departureTime: tripForm.departureTime,
      returnTime: tripForm.returnTime || undefined,
    });
    setTripForm({ vehiclePlate: vehicles[0]?.plate || '', driverName: vehicles[0]?.assignedDriver || '', route: '', mileage: '', purpose: '', departureTime: '08:00', returnTime: '' });
    closeModal();
  };

  const handleSaveMaintenance = () => {
    if (!maintForm.vehiclePlate) { Alert.alert('Error', 'Vehicle is required'); return; }
    addMaintenance({
      vehiclePlate: maintForm.vehiclePlate, type: maintForm.type,
      dueDate: maintForm.dueDate, status: 'Upcoming',
      cost: maintForm.cost ? parseFloat(maintForm.cost) : undefined,
      notes: maintForm.notes.trim() || undefined,
    });
    setMaintForm({ vehiclePlate: vehicles[0]?.plate || '', type: 'Oil Change', dueDate: todayStr(), cost: '', notes: '' });
    closeModal();
  };

  const handleSaveFuel = () => {
    if (!fuelForm.vehiclePlate || !fuelForm.litres.trim()) { Alert.alert('Error', 'Vehicle and litres are required'); return; }
    const litres = parseFloat(fuelForm.litres) || 0;
    const costPerLitre = parseFloat(fuelForm.costPerLitre) || 0;
    addFuelLog({
      date: todayStr(), vehiclePlate: fuelForm.vehiclePlate, litres,
      costPerLitre, totalCost: litres * costPerLitre,
      odometer: fuelForm.odometer ? parseInt(fuelForm.odometer) : undefined,
      filledBy: fuelForm.filledBy.trim() || 'Transport Officer',
    });
    setFuelForm({ vehiclePlate: vehicles[0]?.plate || '', litres: '', costPerLitre: '14', odometer: '', filledBy: '' });
    closeModal();
  };

  const handleSaveDriver = () => {
    if (!driverForm.name.trim()) { Alert.alert('Error', 'Driver name is required'); return; }
    addDriver({
      name: driverForm.name.trim(), phone: driverForm.phone.trim(),
      license: driverForm.license, licenseExpiry: driverForm.licenseExpiry || '2027-12-31',
      assignedVehicle: driverForm.assignedVehicle, status: driverForm.status,
      dutyStart: driverForm.dutyStart || undefined, dutyEnd: driverForm.dutyEnd || undefined,
    });
    setDriverForm({ name: '', phone: '', license: 'C', licenseExpiry: '', assignedVehicle: '', status: 'Off Duty', dutyStart: '', dutyEnd: '' });
    closeModal();
  };

  const handleDelete = (id: string, type: string, name: string) =>
    Alert.alert('Delete', `Delete this ${type}${name ? ` (${name})` : ''}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        if (type === 'vehicle') deleteVehicle(id);
        else if (type === 'trip') deleteTrip(id);
        else if (type === 'maintenance') deleteMaintenance(id);
        else if (type === 'fuel log') deleteFuelLog(id);
        else if (type === 'driver') deleteDriver(id);
      } },
    ]);

  // ── Computed ──
  const activeVehicles = getActiveVehicles();
  const maintenanceVehicles = getMaintenanceVehicles();
  const expiringInsurance = getExpiringInsurance(90);
  const todayTrips = getTodayTrips();
  const upcomingMaintenance = getUpcomingMaintenance();
  const inProgressMaintenance = getInProgressMaintenance();
  const onDutyDrivers = getOnDutyDrivers();
  const totalFuelCost = getTotalFuelCost();
  const totalFuelLitres = getTotalFuelLitres();

  const statusColor = (s: string) =>
    s === 'Active' || s === 'On Duty' || s === 'Completed' ? colors.success :
    s === 'Maintenance' || s === 'In Progress' || s === 'Scheduled' ? colors.warning :
    s === 'Retired' || s === 'Off Duty' ? colors.textSecondary :
    s === 'On Leave' || s === 'Upcoming' ? colors.info : colors.primary;

  // ── PDF Generation ──
  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    const dateStr = todayStr();
    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'activity') {
      title = 'Transport Activity Summary';
      body += `<h2>Overview</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Vehicles</td><td style="padding:8px 12px;border:1px solid #ddd">${vehicles.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Active Vehicles</td><td style="padding:8px 12px;border:1px solid #ddd">${activeVehicles.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">In Maintenance</td><td style="padding:8px 12px;border:1px solid #ddd">${maintenanceVehicles.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Trips Today</td><td style="padding:8px 12px;border:1px solid #ddd">${todayTrips.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">On-Duty Drivers</td><td style="padding:8px 12px;border:1px solid #ddd">${onDutyDrivers.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Fuel Cost</td><td style="padding:8px 12px;border:1px solid #ddd">GHS ${totalFuelCost.toFixed(2)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Fuel (Litres)</td><td style="padding:8px 12px;border:1px solid #ddd">${totalFuelLitres} L</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'vehicles') {
      title = reportType === 'full' ? title : 'Vehicle Registry Report';
      body += `<h2>Vehicle Registry</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Plate</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Insurance Expiry</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Roadworthiness</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Driver</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      vehicles.forEach(v => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${v.plate}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.insuranceExpiry}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.roadworthinessExpiry}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.assignedDriver || '-'}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${v.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'trips') {
      title = reportType === 'full' ? title : 'Trip Log Report';
      body += `<h2>Trip Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vehicle</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Driver</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Route</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Mileage</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Purpose</th>
      </tr></thead><tbody>`;
      trips.forEach(t => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${t.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.vehiclePlate}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.driverName}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.route}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.mileage} km</td><td style="padding:4px 8px;border:1px solid #ddd">${t.purpose}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'maintenance') {
      title = reportType === 'full' ? title : 'Maintenance Report';
      body += `<h2>Maintenance Schedule</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vehicle</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Due Date</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Status</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Cost (GHS)</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Notes</th>
      </tr></thead><tbody>`;
      maintenance.forEach(m => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${m.vehiclePlate}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.dueDate}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.status}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.cost ? m.cost.toFixed(2) : '-'}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.notes || '-'}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'fuel') {
      title = reportType === 'full' ? title : 'Fuel Log Report';
      body += `<h2>Fuel Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vehicle</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Litres</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Cost/L (GHS)</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Total (GHS)</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Filled By</th>
      </tr></thead><tbody>`;
      fuelLogs.forEach(f => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${f.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${f.vehiclePlate}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.litres}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.costPerLitre.toFixed(2)}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${f.totalCost.toFixed(2)}</td><td style="padding:4px 8px;border:1px solid #ddd">${f.filledBy}</td></tr>`;
      });
      body += `</tbody></table>`;
      body += `<p><strong>Total Fuel Cost: GHS ${totalFuelCost.toFixed(2)}</strong> | <strong>Total Litres: ${totalFuelLitres} L</strong></p>`;
    }

    if (reportType === 'full' || reportType === 'drivers') {
      title = reportType === 'full' ? 'Comprehensive Transport Report' : 'Driver Roster Report';
      body += `<h2>Driver Roster</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Phone</th>
        <th style="padding:6px 8px;border:1px solid #ddd">License</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">License Expiry</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vehicle</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      drivers.forEach(d => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${d.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.phone}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">Class ${d.license}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.licenseExpiry}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.assignedVehicle || '-'}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${d.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        * { font-family: 'Segoe UI', Arial, sans-serif; }
        body { padding: 40px; color: #1A1A2E; max-width: 900px; margin: 0 auto; }
        h1 { color: #0F4C75; border-bottom: 3px solid #0F4C75; padding-bottom: 10px; }
        h2 { color: #2D3142; margin-top: 30px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #888; }
        .confidential { background: #FEF6E7; border-left: 4px solid #F59E0B; padding: 10px 15px; margin: 15px 0; font-size: 13px; color: #92400E; }
        table { font-size: 13px; }
        th { font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #aaa; text-align: center; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header"><span>SIMS — Transport Unit</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1>
      <div class="confidential">INTERNAL USE — This report contains transport operational data for school administration purposes.</div>
      ${body}
      <div class="footer">School Information Management System (SIMS) — Transport Unit Report — ${dateStr}</div>
      <script>window.onload = function() { window.print(); }</script>
      </body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  // ── Render helpers ──
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

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );

  const renderPage = () => {
    switch (activePage) {
      // ── OVERVIEW ──
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Vehicles" value={vehicles.length} subtitle={`${activeVehicles.length} active`} accentColor={colors.primary} />
              <StatCard label="In Maintenance" value={maintenanceVehicles.length} accentColor={colors.warning} />
              <StatCard label="Trips Today" value={todayTrips.length} accentColor={colors.info} />
              <StatCard label="On-Duty Drivers" value={onDutyDrivers.length} subtitle={`${drivers.length} total`} accentColor={colors.success} />
            </CardGrid>

            {/* Insurance Expiry Alerts */}
            {expiringInsurance.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={[styles.alertTitle, { color: colors.warning }]}>Insurance Expiring Soon ({expiringInsurance.length})</Text>
                {expiringInsurance.map((v) => {
                  const days = daysUntil(v.insuranceExpiry);
                  return (
                    <TouchableOpacity key={v.id} onPress={() => setActivePage('vehicles')}>
                      <Text style={styles.alertText}>{v.plate} — expires {v.insuranceExpiry} ({days > 0 ? `${days} days` : 'EXPIRED'})</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Maintenance Alerts */}
            {inProgressMaintenance.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
                <Text style={[styles.alertTitle, { color: colors.danger }]}>Maintenance In Progress ({inProgressMaintenance.length})</Text>
                {inProgressMaintenance.map((m) => (
                  <Text key={m.id} style={styles.alertText}>{m.vehiclePlate} — {m.type}{m.notes ? ` | ${m.notes}` : ''}</Text>
                ))}
              </View>
            )}

            {/* Upcoming Maintenance */}
            {upcomingMaintenance.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.info }]}>
                <Text style={[styles.alertTitle, { color: colors.info }]}>Upcoming Maintenance ({upcomingMaintenance.length})</Text>
                {upcomingMaintenance.map((m) => (
                  <Text key={m.id} style={styles.alertText}>{m.vehiclePlate} — {m.type} due {m.dueDate}</Text>
                ))}
              </View>
            )}

            {/* Today's Trips */}
            {todayTrips.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.success }]}>
                <Text style={[styles.alertTitle, { color: colors.success }]}>Today's Trips ({todayTrips.length})</Text>
                {todayTrips.map((t) => (
                  <Text key={t.id} style={styles.alertText}>{t.vehiclePlate} — {t.route} | {t.driverName} | {t.departureTime}{t.returnTime ? ` → ${t.returnTime}` : ''}</Text>
                ))}
              </View>
            )}

            {/* Fuel Summary */}
            <Text style={styles.sectionTitle}>Fuel Summary</Text>
            <View style={styles.fuelSummaryCard}>
              <View style={styles.fuelSummaryItem}>
                <Text style={styles.fuelSummaryValue}>GHS {totalFuelCost.toFixed(2)}</Text>
                <Text style={styles.fuelSummaryLabel}>Total Cost</Text>
              </View>
              <View style={styles.fuelSummaryItem}>
                <Text style={styles.fuelSummaryValue}>{totalFuelLitres} L</Text>
                <Text style={styles.fuelSummaryLabel}>Total Litres</Text>
              </View>
              <View style={styles.fuelSummaryItem}>
                <Text style={styles.fuelSummaryValue}>{fuelLogs.length}</Text>
                <Text style={styles.fuelSummaryLabel}>Fill-ups</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => { setTripForm({ vehiclePlate: vehicles[0]?.plate || '', driverName: vehicles[0]?.assignedDriver || '', route: '', mileage: '', purpose: '', departureTime: '08:00', returnTime: '' }); openModal('trip'); }}>
                <Text style={styles.quickBtnText}>+ Log Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => { setFuelForm({ vehiclePlate: vehicles[0]?.plate || '', litres: '', costPerLitre: '14', odometer: '', filledBy: '' }); openModal('fuel'); }}>
                <Text style={styles.quickBtnText}>+ Log Fuel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.warning }]} onPress={() => { setMaintForm({ vehiclePlate: vehicles[0]?.plate || '', type: 'Oil Change', dueDate: todayStr(), cost: '', notes: '' }); openModal('maintenance'); }}>
                <Text style={styles.quickBtnText}>+ Schedule Maint.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => { setVehicleForm({ plate: '', type: 'Coaster Bus (30-seater)', insuranceExpiry: '', roadworthinessExpiry: '', status: 'Active', assignedDriver: '', notes: '' }); openModal('vehicle'); }}>
                <Text style={styles.quickBtnText}>+ Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      // ── VEHICLE REGISTRY ──
      case 'vehicles':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={vehicles.length} accentColor={colors.primary} />
              <StatCard label="Active" value={activeVehicles.length} accentColor={colors.success} />
              <StatCard label="Maintenance" value={maintenanceVehicles.length} accentColor={colors.warning} />
              <StatCard label="Retired" value={vehicles.filter(v => v.status === 'Retired').length} accentColor={colors.textSecondary} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setVehicleForm({ plate: '', type: 'Coaster Bus (30-seater)', insuranceExpiry: '', roadworthinessExpiry: '', status: 'Active', assignedDriver: '', notes: '' }); openModal('vehicle'); }}>
              <Text style={styles.actionBtnText}>+ Add Vehicle</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Vehicle Registry</Text>
            {vehicles.map((v) => {
              const insDays = daysUntil(v.insuranceExpiry);
              const rwDays = daysUntil(v.roadworthinessExpiry);
              return (
                <View key={v.id} style={[styles.vehicleCard, { borderLeftColor: statusColor(v.status) }]}>
                  <View style={styles.vehicleHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vehiclePlate}>{v.plate}</Text>
                      <Text style={styles.vehicleType}>{v.type}</Text>
                      <Text style={styles.vehicleMeta}>Insurance: {v.insuranceExpiry} ({insDays > 0 ? `${insDays}d left` : 'EXPIRED'})</Text>
                      <Text style={styles.vehicleMeta}>Roadworthiness: {v.roadworthinessExpiry} ({rwDays > 0 ? `${rwDays}d left` : 'EXPIRED'})</Text>
                      {v.assignedDriver && <Text style={styles.vehicleMeta}>Driver: {v.assignedDriver}</Text>}
                      {v.notes && <Text style={styles.vehicleNotes}>{v.notes}</Text>}
                    </View>
                    {renderBadge(v.status, statusColor(v.status))}
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => {
                      const idx = VEHICLE_STATUSES.indexOf(v.status);
                      const next = VEHICLE_STATUSES[(idx + 1) % VEHICLE_STATUSES.length];
                      updateVehicle(v.id, { status: next });
                    }}>
                      <Text style={styles.actionLink}>Status: {v.status} →</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(v.id, 'vehicle', v.plate)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        );

      // ── TRIP LOG ──
      case 'trips':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Trips" value={trips.length} accentColor={colors.primary} />
              <StatCard label="Today" value={todayTrips.length} accentColor={colors.info} />
              <StatCard label="Total Mileage" value={`${trips.reduce((s, t) => s + t.mileage, 0)} km`} accentColor={colors.success} />
              <StatCard label="Active Vehicles" value={activeVehicles.length} accentColor={colors.warning} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setTripForm({ vehiclePlate: vehicles[0]?.plate || '', driverName: vehicles[0]?.assignedDriver || '', route: '', mileage: '', purpose: '', departureTime: '08:00', returnTime: '' }); openModal('trip'); }}>
              <Text style={styles.actionBtnText}>+ Log New Trip</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Trip History</Text>
            {trips.length === 0 ? (
              <Text style={styles.emptyText}>No trips logged.</Text>
            ) : (
              trips.map((t) => (
                <View key={t.id} style={styles.tripCard}>
                  <View style={styles.tripHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tripDate}>{t.date} — {t.vehiclePlate}</Text>
                      <Text style={styles.tripRoute}>{t.route} ({t.mileage} km)</Text>
                      <Text style={styles.tripMeta}>Driver: {t.driverName} | Purpose: {t.purpose}</Text>
                      <Text style={styles.tripMeta}>Departure: {t.departureTime}{t.returnTime ? ` | Return: ${t.returnTime}` : ''}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleDelete(t.id, 'trip', '')}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      // ── MAINTENANCE ──
      case 'maintenance':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Records" value={maintenance.length} accentColor={colors.primary} />
              <StatCard label="In Progress" value={inProgressMaintenance.length} accentColor={colors.danger} />
              <StatCard label="Upcoming" value={upcomingMaintenance.length} accentColor={colors.warning} />
              <StatCard label="Completed" value={maintenance.filter(m => m.status === 'Completed').length} accentColor={colors.success} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setMaintForm({ vehiclePlate: vehicles[0]?.plate || '', type: 'Oil Change', dueDate: todayStr(), cost: '', notes: '' }); openModal('maintenance'); }}>
              <Text style={styles.actionBtnText}>+ Schedule Maintenance</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Maintenance Schedule</Text>
            {maintenance.map((m) => (
              <View key={m.id} style={[styles.maintCard, { borderLeftColor: statusColor(m.status) }]}>
                <View style={styles.maintHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.maintVehicle}>{m.vehiclePlate} — {m.type}</Text>
                    <Text style={styles.maintMeta}>Due: {m.dueDate}{m.completedDate ? ` | Completed: ${m.completedDate}` : ''}</Text>
                    {m.cost && <Text style={styles.maintMeta}>Cost: GHS {m.cost.toFixed(2)}</Text>}
                    {m.notes && <Text style={styles.maintNotes}>{m.notes}</Text>}
                  </View>
                  {renderBadge(m.status, statusColor(m.status))}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => {
                    const idx = MAINTENANCE_STATUSES.indexOf(m.status);
                    const next = MAINTENANCE_STATUSES[(idx + 1) % MAINTENANCE_STATUSES.length];
                    updateMaintenanceStatus(m.id, next);
                  }}>
                    <Text style={styles.actionLink}>Status: {m.status} →</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(m.id, 'maintenance', '')}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      // ── FUEL & SUPPLIES ──
      case 'fuel':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Cost" value={`GHS ${totalFuelCost.toFixed(0)}`} accentColor={colors.danger} />
              <StatCard label="Total Litres" value={totalFuelLitres} accentColor={colors.info} />
              <StatCard label="Fill-ups" value={fuelLogs.length} accentColor={colors.primary} />
              <StatCard label="Avg/Fill" value={`${fuelLogs.length > 0 ? (totalFuelLitres / fuelLogs.length).toFixed(0) : 0} L`} accentColor={colors.success} />
            </CardGrid>

            <View style={styles.fuelBtnRow}>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginBottom: 0 }]} onPress={() => { setFuelForm({ vehiclePlate: vehicles[0]?.plate || '', litres: '', costPerLitre: '14', odometer: '', filledBy: '' }); openModal('fuel'); }}>
                <Text style={styles.actionBtnText}>+ Log Fuel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginBottom: 0, backgroundColor: colors.info }]} onPress={() => setShowReqModal(true)}>
                <Text style={styles.actionBtnText}>Request Supplies</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Fuel Log</Text>
            {fuelLogs.map((f) => (
              <View key={f.id} style={styles.fuelCard}>
                <View style={styles.fuelHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fuelDate}>{f.date} — {f.vehiclePlate}</Text>
                    <Text style={styles.fuelMeta}>{f.litres} L @ GHS {f.costPerLitre.toFixed(2)}/L = GHS {f.totalCost.toFixed(2)}</Text>
                    {f.odometer && <Text style={styles.fuelMeta}>Odometer: {f.odometer} km</Text>}
                    <Text style={styles.fuelMeta}>Filled by: {f.filledBy}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(f.id, 'fuel log', '')}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      // ── DRIVER ROSTER ──
      case 'drivers':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Drivers" value={drivers.length} accentColor={colors.primary} />
              <StatCard label="On Duty" value={onDutyDrivers.length} accentColor={colors.success} />
              <StatCard label="Off Duty" value={drivers.filter(d => d.status === 'Off Duty').length} accentColor={colors.textSecondary} />
              <StatCard label="On Leave" value={drivers.filter(d => d.status === 'On Leave').length} accentColor={colors.warning} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setDriverForm({ name: '', phone: '', license: 'C', licenseExpiry: '', assignedVehicle: '', status: 'Off Duty', dutyStart: '', dutyEnd: '' }); openModal('driver'); }}>
              <Text style={styles.actionBtnText}>+ Add Driver</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Driver Roster</Text>
            {drivers.map((d) => {
              const licDays = daysUntil(d.licenseExpiry);
              return (
                <View key={d.id} style={[styles.driverCard, { borderLeftColor: statusColor(d.status) }]}>
                  <View style={styles.driverHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.driverName}>{d.name}</Text>
                      <Text style={styles.driverMeta}>Phone: {d.phone} | License: Class {d.license}</Text>
                      <Text style={styles.driverMeta}>License Expiry: {d.licenseExpiry} ({licDays > 0 ? `${licDays}d left` : 'EXPIRED'})</Text>
                      <Text style={styles.driverMeta}>Assigned: {d.assignedVehicle || 'Unassigned'}</Text>
                      {d.dutyStart && <Text style={styles.driverMeta}>Duty: {d.dutyStart}{d.dutyEnd ? ` - ${d.dutyEnd}` : ''}</Text>}
                    </View>
                    {renderBadge(d.status, statusColor(d.status))}
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => {
                      const idx = DRIVER_STATUSES.indexOf(d.status);
                      const next = DRIVER_STATUSES[(idx + 1) % DRIVER_STATUSES.length];
                      updateDriver(d.id, { status: next });
                    }}>
                      <Text style={styles.actionLink}>Status: {d.status} →</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(d.id, 'driver', d.name)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        );

      // ── REPORTS ──
      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports & Analytics</Text>
            <Text style={styles.pageSubtitle}>Real-time transport data insights</Text>
            <CardGrid>
              <StatCard label="Total Vehicles" value={vehicles.length} accentColor={colors.primary} />
              <StatCard label="Total Trips" value={trips.length} accentColor={colors.info} />
              <StatCard label="Fuel Cost" value={`GHS ${totalFuelCost.toFixed(0)}`} accentColor={colors.danger} />
              <StatCard label="Drivers" value={drivers.length} accentColor={colors.success} />
            </CardGrid>

            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
              <Text style={styles.pdfFullBtnText}>Generate Full Report (PDF)</Text>
            </TouchableOpacity>

            <View style={styles.pdfBtnRow}>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={() => generatePDF('activity')}>
                <Text style={styles.pdfBtnText}>Activity Summary</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.info }]} onPress={() => generatePDF('vehicles')}>
                <Text style={styles.pdfBtnText}>Vehicle Registry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.success }]} onPress={() => generatePDF('trips')}>
                <Text style={styles.pdfBtnText}>Trip Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.warning }]} onPress={() => generatePDF('maintenance')}>
                <Text style={styles.pdfBtnText}>Maintenance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.danger }]} onPress={() => generatePDF('fuel')}>
                <Text style={styles.pdfBtnText}>Fuel Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.purple }]} onPress={() => generatePDF('drivers')}>
                <Text style={styles.pdfBtnText}>Driver Roster</Text>
              </TouchableOpacity>
            </View>

            {/* Vehicle Status Breakdown */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Vehicle Status Breakdown</Text>
              <TouchableOpacity onPress={() => generatePDF('vehicles')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {VEHICLE_STATUSES.map((st) => {
                const count = vehicles.filter(v => v.status === st).length;
                const pct = vehicles.length > 0 ? Math.round((count / vehicles.length) * 100) : 0;
                return (
                  <View key={st} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{st}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: statusColor(st) }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            {/* Maintenance Status Breakdown */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Maintenance Status</Text>
              <TouchableOpacity onPress={() => generatePDF('maintenance')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {MAINTENANCE_STATUSES.map((st) => {
                const count = maintenance.filter(m => m.status === st).length;
                const pct = maintenance.length > 0 ? Math.round((count / maintenance.length) * 100) : 0;
                return (
                  <View key={st} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{st}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: statusColor(st) }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            {/* Fuel Cost by Vehicle */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Fuel Cost by Vehicle</Text>
              <TouchableOpacity onPress={() => generatePDF('fuel')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {vehicles.map((v) => {
                const vFuel = fuelLogs.filter(f => f.vehiclePlate === v.plate);
                const vCost = vFuel.reduce((s, f) => s + f.totalCost, 0);
                const pct = totalFuelCost > 0 ? Math.round((vCost / totalFuelCost) * 100) : 0;
                return (
                  <View key={v.id} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{v.plate}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: colors.danger }]} />
                    </View>
                    <Text style={styles.reportBarCount}>GHS {vCost.toFixed(0)}</Text>
                  </View>
                );
              })}
            </View>

            {/* Driver Status */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Driver Status</Text>
              <TouchableOpacity onPress={() => generatePDF('drivers')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {DRIVER_STATUSES.map((st) => {
                const count = drivers.filter(d => d.status === st).length;
                const pct = drivers.length > 0 ? Math.round((count / drivers.length) * 100) : 0;
                return (
                  <View key={st} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{st}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: statusColor(st) }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            {/* Mileage by Vehicle */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Mileage by Vehicle</Text>
              <TouchableOpacity onPress={() => generatePDF('trips')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {vehicles.map((v) => {
                const vMileage = trips.filter(t => t.vehiclePlate === v.plate).reduce((s, t) => s + t.mileage, 0);
                const totalMileage = trips.reduce((s, t) => s + t.mileage, 0);
                const pct = totalMileage > 0 ? Math.round((vMileage / totalMileage) * 100) : 0;
                return (
                  <View key={v.id} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{v.plate}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: colors.info }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{vMileage} km</Text>
                  </View>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // ── Modal rendering ──
  const renderModal = () => {
    const titles: Record<string, string> = {
      vehicle: 'Add Vehicle', trip: 'Log New Trip', maintenance: 'Schedule Maintenance',
      fuel: 'Log Fuel Entry', driver: 'Add Driver',
    };

    return (
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{titles[modalType] || ''}</Text>

              {modalType === 'vehicle' && (
                <View>
                  <Text style={styles.inputLabel}>Plate Number *</Text>
                  <TextInput style={styles.input} placeholder="e.g. GV-1122-1" placeholderTextColor={colors.textLight} value={vehicleForm.plate} onChangeText={(v) => setVehicleForm({ ...vehicleForm, plate: v })} autoCapitalize="none" />
                  {renderSelect('Vehicle Type', vehicleForm.type, VEHICLE_TYPES, (v) => setVehicleForm({ ...vehicleForm, type: v as VehicleType }))}
                  {renderSelect('Status', vehicleForm.status, VEHICLE_STATUSES, (v) => setVehicleForm({ ...vehicleForm, status: v as VehicleStatus }))}
                  <Text style={styles.inputLabel}>Insurance Expiry Date</Text>
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={vehicleForm.insuranceExpiry} onChangeText={(v) => setVehicleForm({ ...vehicleForm, insuranceExpiry: v })} />
                  <Text style={styles.inputLabel}>Roadworthiness Expiry Date</Text>
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={vehicleForm.roadworthinessExpiry} onChangeText={(v) => setVehicleForm({ ...vehicleForm, roadworthinessExpiry: v })} />
                  <Text style={styles.inputLabel}>Assigned Driver</Text>
                  <TextInput style={styles.input} placeholder="Driver name (optional)" placeholderTextColor={colors.textLight} value={vehicleForm.assignedDriver} onChangeText={(v) => setVehicleForm({ ...vehicleForm, assignedDriver: v })} />
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput style={[styles.input, styles.textArea]} placeholder="Additional notes" placeholderTextColor={colors.textLight} value={vehicleForm.notes} onChangeText={(v) => setVehicleForm({ ...vehicleForm, notes: v })} multiline />
                </View>
              )}

              {modalType === 'trip' && (
                <View>
                  {renderSelect('Vehicle', tripForm.vehiclePlate, vehicles.map(v => v.plate), (v) => {
                    const veh = vehicles.find(x => x.plate === v);
                    setTripForm({ ...tripForm, vehiclePlate: v, driverName: veh?.assignedDriver || '' });
                  })}
                  <Text style={styles.inputLabel}>Driver Name</Text>
                  <TextInput style={styles.input} placeholder="Driver name" placeholderTextColor={colors.textLight} value={tripForm.driverName} onChangeText={(v) => setTripForm({ ...tripForm, driverName: v })} />
                  <Text style={styles.inputLabel}>Route *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Campus -> Kumasi" placeholderTextColor={colors.textLight} value={tripForm.route} onChangeText={(v) => setTripForm({ ...tripForm, route: v })} />
                  <Text style={styles.inputLabel}>Mileage (km) *</Text>
                  <TextInput style={styles.input} placeholder="e.g. 85" placeholderTextColor={colors.textLight} value={tripForm.mileage} onChangeText={(v) => setTripForm({ ...tripForm, mileage: v })} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Purpose</Text>
                  <TextInput style={styles.input} placeholder="e.g. Stores procurement" placeholderTextColor={colors.textLight} value={tripForm.purpose} onChangeText={(v) => setTripForm({ ...tripForm, purpose: v })} />
                  <Text style={styles.inputLabel}>Departure Time</Text>
                  <TextInput style={styles.input} placeholder="08:00" placeholderTextColor={colors.textLight} value={tripForm.departureTime} onChangeText={(v) => setTripForm({ ...tripForm, departureTime: v })} />
                  <Text style={styles.inputLabel}>Return Time</Text>
                  <TextInput style={styles.input} placeholder="14:00 (optional)" placeholderTextColor={colors.textLight} value={tripForm.returnTime} onChangeText={(v) => setTripForm({ ...tripForm, returnTime: v })} />
                </View>
              )}

              {modalType === 'maintenance' && (
                <View>
                  {renderSelect('Vehicle', maintForm.vehiclePlate, vehicles.map(v => v.plate), (v) => setMaintForm({ ...maintForm, vehiclePlate: v }))}
                  {renderSelect('Maintenance Type', maintForm.type, MAINTENANCE_TYPES, (v) => setMaintForm({ ...maintForm, type: v as MaintenanceType }))}
                  <Text style={styles.inputLabel}>Due Date</Text>
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={maintForm.dueDate} onChangeText={(v) => setMaintForm({ ...maintForm, dueDate: v })} />
                  <Text style={styles.inputLabel}>Estimated Cost (GHS)</Text>
                  <TextInput style={styles.input} placeholder="e.g. 1200" placeholderTextColor={colors.textLight} value={maintForm.cost} onChangeText={(v) => setMaintForm({ ...maintForm, cost: v })} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput style={[styles.input, styles.textArea]} placeholder="Maintenance notes" placeholderTextColor={colors.textLight} value={maintForm.notes} onChangeText={(v) => setMaintForm({ ...maintForm, notes: v })} multiline />
                </View>
              )}

              {modalType === 'fuel' && (
                <View>
                  {renderSelect('Vehicle', fuelForm.vehiclePlate, vehicles.map(v => v.plate), (v) => setFuelForm({ ...fuelForm, vehiclePlate: v }))}
                  <Text style={styles.inputLabel}>Litres *</Text>
                  <TextInput style={styles.input} placeholder="e.g. 60" placeholderTextColor={colors.textLight} value={fuelForm.litres} onChangeText={(v) => setFuelForm({ ...fuelForm, litres: v })} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Cost per Litre (GHS)</Text>
                  <TextInput style={styles.input} placeholder="e.g. 14" placeholderTextColor={colors.textLight} value={fuelForm.costPerLitre} onChangeText={(v) => setFuelForm({ ...fuelForm, costPerLitre: v })} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Odometer Reading (km)</Text>
                  <TextInput style={styles.input} placeholder="e.g. 45200" placeholderTextColor={colors.textLight} value={fuelForm.odometer} onChangeText={(v) => setFuelForm({ ...fuelForm, odometer: v })} keyboardType="numeric" />
                  <Text style={styles.inputLabel}>Filled By</Text>
                  <TextInput style={styles.input} placeholder="Driver/officer name" placeholderTextColor={colors.textLight} value={fuelForm.filledBy} onChangeText={(v) => setFuelForm({ ...fuelForm, filledBy: v })} />
                </View>
              )}

              {modalType === 'driver' && (
                <View>
                  <Text style={styles.inputLabel}>Driver Name *</Text>
                  <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textLight} value={driverForm.name} onChangeText={(v) => setDriverForm({ ...driverForm, name: v })} />
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput style={styles.input} placeholder="Phone number" placeholderTextColor={colors.textLight} value={driverForm.phone} onChangeText={(v) => setDriverForm({ ...driverForm, phone: v })} />
                  {renderSelect('License Class', driverForm.license, LICENSE_CLASSES, (v) => setDriverForm({ ...driverForm, license: v as LicenseClass }))}
                  <Text style={styles.inputLabel}>License Expiry Date</Text>
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={driverForm.licenseExpiry} onChangeText={(v) => setDriverForm({ ...driverForm, licenseExpiry: v })} />
                  {renderSelect('Status', driverForm.status, DRIVER_STATUSES, (v) => setDriverForm({ ...driverForm, status: v as DriverStatus }))}
                  <Text style={styles.inputLabel}>Assigned Vehicle Plate</Text>
                  <TextInput style={styles.input} placeholder="e.g. GV-1122-1" placeholderTextColor={colors.textLight} value={driverForm.assignedVehicle} onChangeText={(v) => setDriverForm({ ...driverForm, assignedVehicle: v })} autoCapitalize="none" />
                  <Text style={styles.inputLabel}>Duty Start Time</Text>
                  <TextInput style={styles.input} placeholder="e.g. 08:00" placeholderTextColor={colors.textLight} value={driverForm.dutyStart} onChangeText={(v) => setDriverForm({ ...driverForm, dutyStart: v })} />
                  <Text style={styles.inputLabel}>Duty End Time</Text>
                  <TextInput style={styles.input} placeholder="e.g. 16:00" placeholderTextColor={colors.textLight} value={driverForm.dutyEnd} onChangeText={(v) => setDriverForm({ ...driverForm, dutyEnd: v })} />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSubmit]}
                  onPress={() => {
                    if (modalType === 'vehicle') handleSaveVehicle();
                    else if (modalType === 'trip') handleSaveTrip();
                    else if (modalType === 'maintenance') handleSaveMaintenance();
                    else if (modalType === 'fuel') handleSaveFuel();
                    else if (modalType === 'driver') handleSaveDriver();
                  }}
                >
                  <Text style={styles.modalBtnTextLight}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <DashboardLayout
      title="Transport"
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
      <RequisitionModal
        visible={showReqModal}
        onClose={() => setShowReqModal(false)}
        department="Transport"
        requestedBy={user?.displayName ?? 'Transport Officer'}
        defaultItem="Fuel (Diesel)"
        defaultUnit="litres"
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },

  // Alerts
  alertCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4 },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },

  // Quick actions
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  // Badges
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  // Fuel summary
  fuelSummaryCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  fuelSummaryItem: { flex: 1, alignItems: 'center' },
  fuelSummaryValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  fuelSummaryLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  // Vehicles
  vehicleCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4 },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vehiclePlate: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  vehicleType: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  vehicleMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  vehicleNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },

  // Trips
  tripCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripDate: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  tripRoute: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold, marginTop: 2 },
  tripMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  // Maintenance
  maintCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4 },
  maintHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  maintVehicle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  maintMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  maintNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },

  // Fuel
  fuelBtnRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  fuelCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  fuelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fuelDate: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  fuelMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  // Drivers
  driverCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4 },
  driverHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  driverName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  driverMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  // Card actions
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap' },
  actionLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary },
  deleteLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.danger },

  // Reports
  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pdfLink: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.danger, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.danger + '15', borderRadius: radius.sm },
  pdfFullBtn: { backgroundColor: colors.danger, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.md },
  pdfFullBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  pdfBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pdfBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.xs },
  pdfBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  reportSectionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  reportBarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  reportBarLabel: { fontSize: fontSize.sm, color: colors.textSecondary, width: 130 },
  reportBarTrack: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4 },
  reportBarFill: { height: 8, borderRadius: 4 },
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text, width: 60, textAlign: 'right' },

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
