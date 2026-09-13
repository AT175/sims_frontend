import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { DashboardLayout, NavItem } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { apiClient } from '@shared/api/apiClient';

const isWeb = Platform.OS === 'web';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Platform Overview' },
  { key: 'opportunity', label: 'Investment Opportunity' },
  { key: 'portfolio', label: 'My Portfolio' },
  { key: 'revenue', label: 'Revenue Performance' },
  { key: 'schools', label: 'School Breakdown' },
  { key: 'growth', label: 'Growth Analytics' },
  { key: 'documents', label: 'Documents & Terms' },
];

export function InvestorDashboard() {
  const { logout } = useAuthStore();
  const [activePage, setActivePage] = useState('overview');

  const [overview, setOverview] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [schoolGrowth, setSchoolGrowth] = useState<any[]>([]);
  const [schoolBreakdown, setSchoolBreakdown] = useState<any[]>([]);
  const [terms, setTerms] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ov, rt, sg, sb, trms] = await Promise.all([
        apiClient.get<any>('/investor/platform-overview').catch(() => null),
        apiClient.get<any[]>('/investor/revenue-trends').catch(() => []),
        apiClient.get<any[]>('/investor/school-growth').catch(() => []),
        apiClient.get<any[]>('/investor/school-breakdown').catch(() => []),
        apiClient.get<any>('/investor/terms').catch(() => null),
      ]);
      setOverview(ov);
      setRevenueTrends(rt || []);
      setSchoolGrowth(sg || []);
      setSchoolBreakdown(sb || []);
      setTerms(trms);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const data = await apiClient.get<any>('/investor/portfolio');
      setPortfolio(data);
    } catch (e) {
      // Investor profile may not exist yet
    }
  };

  useEffect(() => {
    if (activePage === 'portfolio') loadPortfolio();
  }, [activePage]);

  const renderPage = () => {
    if (loading && activePage !== 'documents') {
      return (
        <View>
          <Text style={styles.pageTitle}>Loading...</Text>
          <Text style={styles.pageSubtitle}>Fetching platform data</Text>
        </View>
      );
    }

    switch (activePage) {
      case 'overview':
        return <OverviewPage overview={overview} />;
      case 'opportunity':
        return <OpportunityPage overview={overview} terms={terms} />;
      case 'portfolio':
        return <PortfolioPage portfolio={portfolio} />;
      case 'revenue':
        return <RevenuePage trends={revenueTrends} overview={overview} />;
      case 'schools':
        return <SchoolsPage breakdown={schoolBreakdown} />;
      case 'growth':
        return <GrowthPage growth={schoolGrowth} overview={overview} />;
      case 'documents':
        return <DocumentsPage terms={terms} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Investor Portal"
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
    </DashboardLayout>
  );
}

// ── Overview Page ──────────────────────────────────────────────

function OverviewPage({ overview }: { overview: any }) {
  if (!overview) return <Text style={styles.emptyText}>No data available.</Text>;

  const { platform, equity } = overview;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Platform Overview</Text>
      <Text style={styles.pageSubtitle}>Real-time metrics across all schools on the SIMS platform</Text>

      {/* Key Metrics */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{platform.totalSchools}</Text>
          <Text style={styles.statLabel}>Active Schools</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{platform.totalStudents}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{platform.activeSubscriptions}</Text>
          <Text style={styles.statLabel}>Active Subscriptions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>GHS {Number(platform.totalRevenue).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Equity Offering Summary */}
      <Text style={styles.sectionTitle}>Equity Offering Summary</Text>
      <View style={styles.card}>
        <View style={styles.equityBarContainer}>
          <View style={[styles.equityBarFill, { width: `${equity.equityAllocated}%` }]} />
        </View>
        <View style={styles.equityLegend}>
          <Text style={styles.equityAllocated}>{equity.equityAllocated}% Allocated</Text>
          <Text style={styles.equityRemaining}>{equity.equityRemaining}% Available</Text>
        </View>
        <View style={styles.equityDetails}>
          <View style={styles.equityDetailItem}>
            <Text style={styles.equityDetailLabel}>Total Offered</Text>
            <Text style={styles.equityDetailValue}>{equity.totalOffered}%</Text>
          </View>
          <View style={styles.equityDetailItem}>
            <Text style={styles.equityDetailLabel}>Platform Valuation</Text>
            <Text style={styles.equityDetailValue}>GHS {equity.platformValuation.toLocaleString()}</Text>
          </View>
          <View style={styles.equityDetailItem}>
            <Text style={styles.equityDetailLabel}>Total Invested</Text>
            <Text style={styles.equityDetailValue}>GHS {Number(equity.totalInvested).toLocaleString()}</Text>
          </View>
          <View style={styles.equityDetailItem}>
            <Text style={styles.equityDetailLabel}>Investors</Text>
            <Text style={styles.equityDetailValue}>{equity.investorCount} confirmed, {equity.pendingInvestorCount} pending</Text>
          </View>
        </View>
      </View>

      {/* Revenue Snapshot */}
      <Text style={styles.sectionTitle}>Revenue Snapshot</Text>
      <View style={styles.card}>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Collected Revenue</Text>
          <Text style={styles.revenueValue}>GHS {Number(platform.totalRevenue).toLocaleString()}</Text>
        </View>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Pending Revenue</Text>
          <Text style={styles.revenueValue}>GHS {Number(platform.pendingRevenue).toLocaleString()}</Text>
        </View>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Active Subscriptions</Text>
          <Text style={styles.revenueValue}>{platform.activeSubscriptions} / {platform.totalSubscriptions}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ── Investment Opportunity Page ─────────────────────────────────

function OpportunityPage({ overview, terms }: { overview: any; terms: any }) {
  if (!terms) return <Text style={styles.emptyText}>Loading offering details...</Text>;
  const { offering, terms: termList, platformHighlights } = terms;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Investment Opportunity</Text>
      <Text style={styles.pageSubtitle}>20% equity in the SIMS platform</Text>

      {/* Offering Card */}
      <View style={[styles.card, styles.offeringCard]}>
        <Text style={styles.offeringTitle}>SIMS Platform Equity Offering</Text>
        <Text style={styles.offeringSubtitle}>School Information Management System</Text>

        <View style={styles.offeringGrid}>
          <View style={styles.offeringItem}>
            <Text style={styles.offeringItemLabel}>Equity Offered</Text>
            <Text style={styles.offeringItemValue}>{offering.equityOffered}%</Text>
          </View>
          <View style={styles.offeringItem}>
            <Text style={styles.offeringItemLabel}>Platform Valuation</Text>
            <Text style={styles.offeringItemValue}>GHS {offering.platformValuation.toLocaleString()}</Text>
          </View>
          <View style={styles.offeringItem}>
            <Text style={styles.offeringItemLabel}>Minimum Investment</Text>
            <Text style={styles.offeringItemValue}>GHS {offering.minInvestment.toLocaleString()}</Text>
          </View>
          <View style={styles.offeringItem}>
            <Text style={styles.offeringItemLabel}>Min Equity</Text>
            <Text style={styles.offeringItemValue}>{offering.minEquity}%</Text>
          </View>
          <View style={styles.offeringItem}>
            <Text style={styles.offeringItemLabel}>Max Equity per Investor</Text>
            <Text style={styles.offeringItemValue}>{offering.maxEquityPerInvestor}%</Text>
          </View>
          <View style={styles.offeringItem}>
            <Text style={styles.offeringItemLabel}>Currency</Text>
            <Text style={styles.offeringItemValue}>{offering.currency}</Text>
          </View>
        </View>

        {overview && (
          <View style={styles.availabilityCard}>
            <Text style={styles.availabilityTitle}>Availability</Text>
            <View style={styles.equityBarContainer}>
              <View style={[styles.equityBarFill, { width: `${overview.equity.equityAllocated}%` }]} />
            </View>
            <Text style={styles.availabilityText}>
              {overview.equity.equityRemaining}% of {overview.equity.totalOffered}% still available
            </Text>
          </View>
        )}
      </View>

      {/* Platform Highlights */}
      <Text style={styles.sectionTitle}>Why Invest in SIMS?</Text>
      <View style={styles.card}>
        {platformHighlights.map((h: string, i: number) => (
          <View key={i} style={styles.highlightItem}>
            <Text style={styles.highlightBullet}>★</Text>
            <Text style={styles.highlightText}>{h}</Text>
          </View>
        ))}
      </View>

      {/* Terms */}
      <Text style={styles.sectionTitle}>Investment Terms</Text>
      <View style={styles.card}>
        {termList.map((term: string, i: number) => (
          <View key={i} style={styles.termItem}>
            <Text style={styles.termNumber}>{i + 1}</Text>
            <Text style={styles.termText}>{term}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Portfolio Page ────────────────────────────────────────────

function PortfolioPage({ portfolio }: { portfolio: any }) {
  if (!portfolio) {
    return (
      <View>
        <Text style={styles.pageTitle}>My Portfolio</Text>
        <Text style={styles.pageSubtitle}>Your investment details</Text>
        <View style={styles.card}>
          <Text style={styles.emptyText}>No investor profile linked to your account yet.</Text>
          <Text style={styles.emptySubtext}>Please contact the platform administrator to link your investment.</Text>
        </View>
      </View>
    );
  }

  const { investor, portfolio: pf, platformSnapshot } = portfolio;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>My Portfolio</Text>
      <Text style={styles.pageSubtitle}>{investor.fullName}{investor.organization ? ` — ${investor.organization}` : ''}</Text>

      {/* Portfolio Value */}
      <View style={[styles.card, styles.portfolioHeroCard]}>
        <Text style={styles.portfolioHeroLabel}>Portfolio Value</Text>
        <Text style={styles.portfolioHeroValue}>GHS {Number(pf.portfolioValue).toLocaleString()}</Text>
        <View style={styles.portfolioHeroRow}>
          <View style={styles.portfolioHeroItem}>
            <Text style={styles.portfolioHeroItemLabel}>Equity</Text>
            <Text style={styles.portfolioHeroItemValue}>{pf.equityPercentage}%</Text>
          </View>
          <View style={styles.portfolioHeroItem}>
            <Text style={styles.portfolioHeroItemLabel}>Invested</Text>
            <Text style={styles.portfolioHeroItemValue}>GHS {Number(investor.amountInvested).toLocaleString()}</Text>
          </View>
          <View style={styles.portfolioHeroItem}>
            <Text style={styles.portfolioHeroItemLabel}>ROI</Text>
            <Text style={[styles.portfolioHeroItemValue, { color: parseFloat(pf.roi) >= 0 ? colors.success : colors.danger }]}>
              {parseFloat(pf.roi) >= 0 ? '+' : ''}{pf.roi}%
            </Text>
          </View>
        </View>
      </View>

      {/* Investment Details */}
      <Text style={styles.sectionTitle}>Investment Details</Text>
      <View style={styles.card}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Investor Name</Text>
          <Text style={styles.detailValue}>{investor.fullName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{investor.email || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Organization</Text>
          <Text style={styles.detailValue}>{investor.organization || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount Invested</Text>
          <Text style={styles.detailValue}>GHS {Number(investor.amountInvested).toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Equity Percentage</Text>
          <Text style={styles.detailValue}>{investor.equityPercentage}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Investment Date</Text>
          <Text style={styles.detailValue}>{investor.investmentDate || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={[styles.detailValue, { color: investor.status === 'active' ? colors.success : investor.status === 'confirmed' ? colors.primary : colors.warning, fontWeight: fontWeight.semibold }]}>
            {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Revenue Share */}
      <Text style={styles.sectionTitle}>Revenue Share</Text>
      <View style={styles.card}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Your Equity Share</Text>
          <Text style={styles.detailValue}>{pf.equityPercentage}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Platform Total Revenue</Text>
          <Text style={styles.detailValue}>GHS {Number(platformSnapshot.totalRevenue).toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Your Revenue Share</Text>
          <Text style={[styles.detailValue, { fontWeight: fontWeight.bold, color: colors.success }]}>
            GHS {Number(pf.revenueShare).toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Platform Valuation</Text>
          <Text style={styles.detailValue}>GHS {pf.platformValuation.toLocaleString()}</Text>
        </View>
      </View>

      {/* Platform Snapshot */}
      <Text style={styles.sectionTitle}>Platform Snapshot</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{platformSnapshot.totalSchools}</Text>
          <Text style={styles.statLabel}>Schools</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{platformSnapshot.totalStudents}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>GHS {Number(platformSnapshot.totalRevenue).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ── Revenue Page ───────────────────────────────────────────────

function RevenuePage({ trends, overview }: { trends: any[]; overview: any }) {
  const maxRevenue = Math.max(...trends.map((t) => Number(t.revenue)), 1);

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Revenue Performance</Text>
      <Text style={styles.pageSubtitle}>Monthly subscription revenue trends</Text>

      {overview && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>GHS {Number(overview.platform.totalRevenue).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Collected</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>GHS {Number(overview.platform.pendingRevenue).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overview.platform.activeSubscriptions}</Text>
            <Text style={styles.statLabel}>Active Subs</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Monthly Revenue</Text>
      {trends.length > 0 ? (
        <View style={styles.chartContainer}>
          {trends.map((t, i) => (
            <View key={i} style={styles.chartBarRow}>
              <Text style={styles.chartLabel}>{t.month}</Text>
              <View style={styles.chartBarBg}>
                <View style={[styles.chartBarFill, { width: `${(Number(t.revenue) / maxRevenue) * 100}%` }]} />
              </View>
              <Text style={styles.chartValue}>GHS {Number(t.revenue).toLocaleString()}</Text>
              <Text style={styles.chartSub}>{t.newSubscriptions} new</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No revenue data available yet.</Text>
      )}
    </ScrollView>
  );
}

// ── Schools Page ───────────────────────────────────────────────

function SchoolsPage({ breakdown }: { breakdown: any[] }) {
  return (
    <ScrollView>
      <Text style={styles.pageTitle}>School Breakdown</Text>
      <Text style={styles.pageSubtitle}>Performance metrics per school on the platform</Text>

      {breakdown.length > 0 ? (
        breakdown.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.schoolHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.schoolName}>{s.schoolName}</Text>
                <Text style={styles.schoolMeta}>{s.region || '—'} | {s.district || '—'} | {s.schoolLevel}</Text>
              </View>
              <View style={[styles.planBadge, { backgroundColor: s.subscriptionPlan === 'Premium' ? colors.primary : s.subscriptionPlan === 'Standard' ? colors.info : colors.surfaceAlt }]}>
                <Text style={styles.planBadgeText}>{s.subscriptionPlan}</Text>
              </View>
            </View>
            <View style={styles.schoolStats}>
              <View style={styles.schoolStat}>
                <Text style={styles.schoolStatValue}>{s.studentCount}</Text>
                <Text style={styles.schoolStatLabel}>Students</Text>
              </View>
              <View style={styles.schoolStat}>
                <Text style={styles.schoolStatValue}>GHS {Number(s.revenue).toLocaleString()}</Text>
                <Text style={styles.schoolStatLabel}>Revenue</Text>
              </View>
              <View style={styles.schoolStat}>
                <Text style={styles.schoolStatValue}>{s.subscriptionExpiry || '—'}</Text>
                <Text style={styles.schoolStatLabel}>Expires</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No schools on the platform yet.</Text>
      )}
    </ScrollView>
  );
}

// ── Growth Page ────────────────────────────────────────────────

function GrowthPage({ growth, overview }: { growth: any[]; overview: any }) {
  const maxSchools = growth.length > 0 ? growth[growth.length - 1].totalSchools : 1;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Growth Analytics</Text>
      <Text style={styles.pageSubtitle}>Platform adoption over time</Text>

      {overview && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overview.platform.totalSchools}</Text>
            <Text style={styles.statLabel}>Total Schools</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overview.platform.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overview.platform.totalSubscriptions}</Text>
            <Text style={styles.statLabel}>Subscriptions</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>School Growth Over Time</Text>
      {growth.length > 0 ? (
        <View style={styles.chartContainer}>
          {growth.map((g, i) => (
            <View key={i} style={styles.chartBarRow}>
              <Text style={styles.chartLabel}>{g.month}</Text>
              <View style={styles.chartBarBg}>
                <View style={[styles.chartBarFill, { width: `${(g.totalSchools / maxSchools) * 100}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={styles.chartValue}>{g.totalSchools} schools</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No growth data available yet.</Text>
      )}
    </ScrollView>
  );
}

// ── Documents Page ─────────────────────────────────────────────

function DocumentsPage({ terms }: { terms: any }) {
  if (!terms) return <Text style={styles.emptyText}>Loading terms...</Text>;
  const { terms: termList } = terms;

  const downloadTerms = () => {
    if (isWeb) {
      const content = `SIMS PLATFORM - INVESTMENT TERMS\n\n${termList.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n\n')}\n\n— Generated by SIMS Investor Portal`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SIMS_Investment_Terms.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Documents & Terms</Text>
      <Text style={styles.pageSubtitle}>Investment agreement and term sheet</Text>

      <TouchableOpacity style={styles.downloadBtn} onPress={downloadTerms}>
        <Text style={styles.downloadBtnText}>Download Term Sheet</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Investment Terms</Text>
      <View style={styles.card}>
        {termList.map((term: string, i: number) => (
          <View key={i} style={styles.termItem}>
            <Text style={styles.termNumber}>{i + 1}</Text>
            <Text style={styles.termText}>{term}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Disclaimer</Text>
      <View style={styles.card}>
        <Text style={styles.disclaimerText}>
          This investment offering is a private placement and is not registered with any securities regulatory authority.
          Past performance is not indicative of future results. All investments carry risk, including the potential loss of
          principal. Please consult with a qualified financial advisor before making any investment decisions. The information
          presented in this dashboard is provided for informational purposes only and does not constitute an offer to sell
          or a solicitation of an offer to buy any security.
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.danger, borderRadius: radius.sm },
  logoutText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, minWidth: 140, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.lg },
  emptySubtext: { fontSize: fontSize.sm, color: colors.textLight, textAlign: 'center', marginTop: spacing.xs },

  // Equity bar
  equityBarContainer: { height: 24, backgroundColor: colors.surfaceAlt, borderRadius: 12, overflow: 'hidden', marginBottom: spacing.sm },
  equityBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 12 },
  equityLegend: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  equityAllocated: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  equityRemaining: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.semibold },
  equityDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  equityDetailItem: { flex: 1, minWidth: 120 },
  equityDetailLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  equityDetailValue: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: 2 },

  // Revenue
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  revenueLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  revenueValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },

  // Offering
  offeringCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  offeringTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  offeringSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  offeringGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  offeringItem: { flex: 1, minWidth: 130 },
  offeringItemLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  offeringItemValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, marginTop: 2 },
  availabilityCard: { marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  availabilityTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  availabilityText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  // Highlights
  highlightItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.xs },
  highlightBullet: { fontSize: fontSize.md, color: colors.primary },
  highlightText: { fontSize: fontSize.sm, color: colors.text, flex: 1 },

  // Terms
  termItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  termNumber: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary, minWidth: 24 },
  termText: { fontSize: fontSize.sm, color: colors.text, flex: 1 },

  // Portfolio
  portfolioHeroCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  portfolioHeroLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  portfolioHeroValue: { fontSize: 32, fontWeight: fontWeight.bold, color: '#fff', marginTop: spacing.xs, marginBottom: spacing.md },
  portfolioHeroRow: { flexDirection: 'row', gap: spacing.md },
  portfolioHeroItem: { flex: 1 },
  portfolioHeroItemLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)' },
  portfolioHeroItemValue: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: '#fff', marginTop: 2 },

  // Details
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  detailValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },

  // Chart
  chartContainer: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  chartBarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  chartLabel: { fontSize: fontSize.xs, color: colors.textSecondary, minWidth: 70 },
  chartBarBg: { flex: 1, height: 20, backgroundColor: colors.surfaceAlt, borderRadius: 10, overflow: 'hidden' },
  chartBarFill: { height: '100%', backgroundColor: colors.success, borderRadius: 10 },
  chartValue: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text, minWidth: 100 },
  chartSub: { fontSize: fontSize.xs, color: colors.textLight },

  // Schools
  schoolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  schoolName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  schoolMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  planBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12 },
  planBadgeText: { fontSize: fontSize.xs, color: '#fff', fontWeight: fontWeight.semibold },
  schoolStats: { flexDirection: 'row', gap: spacing.md },
  schoolStat: { flex: 1 },
  schoolStatValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  schoolStatLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  // Documents
  downloadBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignSelf: 'flex-start', marginBottom: spacing.md },
  downloadBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  disclaimerText: { fontSize: fontSize.sm, color: colors.textSecondary, fontStyle: 'italic' },
});
