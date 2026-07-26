import React, { useState, useEffect } from 'react';
import { Text, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@store/authStore';
import { SchoolWebsite } from '@screens/SchoolWebsite';
import { SchoolDirectory } from '@screens/SchoolDirectory';
import { ROLE_DASHBOARD_MAP } from '@shared/navigation/roleMap';
import { RoleId } from '@shared/types';

import {
  HeadmasterDashboard,
  BursaryDashboard,
  RegistryDashboard,
  AcademicDashboard,
  DomesticDashboard,
  HouseDashboard,
  StudentDashboard,
  TeacherDashboard,
  StoresDashboard,
  SecurityDashboard,
  HealthDashboard,
  CateringDashboard,
  TransportDashboard,
  SRCDashboard,
  ElectoralCommissionDashboard,
  PTADashboard,
  GoverningBoardDashboard,
  StaffDashboard,
  WelfareCommitteeDashboard,
  SubjectHODDashboard,
  CounsellingDashboard,
  LibraryICTDashboard,
  SportsClubsDashboard,
  PLCDashboard,
  SeniorHousemasterDashboard,
  CleaningDashboard,
  AdminDashboard,
  ParentDashboard,
  AccountantDashboard,
  SystemAdminDashboard,
  ChaplainDashboard,
  AcademicBoardDashboard,
  DiningHallDashboard,
  ExamCommitteeDashboard,
  SafeSpaceDashboard,
  InternalAuditorDashboard,
  HeadmasterSecretaryDashboard,
} from '@dashboards/index';
import { VerificationDashboard } from '@dashboards/verification/VerificationDashboard';
import { ForceChangePasswordModal } from '@shared/components/ForceChangePasswordModal';
import { SyncStatusIndicator } from '@shared/components/SyncStatusIndicator';


const DASHBOARD_COMPONENTS: Record<string, React.ComponentType> = {
  Headmaster: HeadmasterDashboard,
  Bursary: BursaryDashboard,
  Registry: RegistryDashboard,
  Academic: AcademicDashboard,
  Domestic: DomesticDashboard,
  House: HouseDashboard,
  Student: StudentDashboard,
  Teacher: TeacherDashboard,
  Stores: StoresDashboard,
  Security: SecurityDashboard,
  Health: HealthDashboard,
  Catering: CateringDashboard,
  Transport: TransportDashboard,
  SRC: SRCDashboard,
  ElectoralCommission: ElectoralCommissionDashboard,
  PTA: PTADashboard,
  GoverningBoard: GoverningBoardDashboard,
  Staff: StaffDashboard,
  WelfareCommittee: WelfareCommitteeDashboard,
  SubjectHOD: SubjectHODDashboard,
  Counselling: CounsellingDashboard,
  LibraryICT: LibraryICTDashboard,
  SportsClubs: SportsClubsDashboard,
  PLC: PLCDashboard,
  SeniorHousemaster: SeniorHousemasterDashboard,
  Cleaning: CleaningDashboard,
  Admin: AdminDashboard,
  Parent: ParentDashboard,
  Accountant: AccountantDashboard,
  SystemAdmin: SystemAdminDashboard,
  Chaplain: ChaplainDashboard,
  AcademicBoard: AcademicBoardDashboard,
  DiningHall: DiningHallDashboard,
  ExamCommittee: ExamCommitteeDashboard,
  SafeSpace: SafeSpaceDashboard,
  InternalAuditor: InternalAuditorDashboard,
  HeadmasterSecretary: HeadmasterSecretaryDashboard,
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App Error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>
            Runtime Error
          </Text>
          <Text style={{ fontSize: 14, color: '#333', marginBottom: 10 }}>
            {this.state.error.message}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {this.state.error.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isAuthenticated, user, isTempLogin } = useAuthStore();
  const [routeTenantKey, setRouteTenantKey] = useState<string | null>(null);

  useEffect(() => {
    const detectRoute = () => {
      if (typeof window !== 'undefined' && window.location) {
        const path = window.location.pathname;
        // Match /:tenantKey (e.g. /stmary, /achimota)
        // Exclude known asset paths and root
        if (path && path !== '/' && !path.startsWith('/api') && !path.includes('.')) {
          const segments = path.split('/').filter(Boolean);
          if (segments.length === 1) {
            setRouteTenantKey(segments[0]);
          } else {
            setRouteTenantKey(null);
          }
        } else {
          setRouteTenantKey(null);
        }
      }
    };
    detectRoute();
    window.addEventListener('popstate', detectRoute);
    return () => window.removeEventListener('popstate', detectRoute);
  }, []);

  // If URL has a tenant key and user is not authenticated, show school website
  if (routeTenantKey && !isAuthenticated) {
    return <SchoolWebsite tenantKey={routeTenantKey} />;
  }

  // If no tenant key and not authenticated, show school directory
  if (!isAuthenticated || !user) {
    return <SchoolDirectory />;
  }

  // If temp login, redirect to Verification Dashboard
  if (isTempLogin) {
    return <VerificationDashboard />;
  }

  const routeName = ROLE_DASHBOARD_MAP[user.activeRole as RoleId] ?? 'Headmaster';
  const DashboardComponent = DASHBOARD_COMPONENTS[routeName] ?? HeadmasterDashboard;

  return (
    <>
      <DashboardComponent />
      <ForceChangePasswordModal />
      <SyncStatusIndicator />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
