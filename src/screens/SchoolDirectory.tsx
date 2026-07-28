import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  TextInput,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { apiClient } from '@shared/api/apiClient';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@theme/index';

interface PublicTenant {
  tenantKey: string;
  schoolName: string;
  schoolCode: string | null;
  logoUrl: string | null;
  motto: string | null;
  primaryColor: string;
  region: string | null;
  district: string | null;
  bannerImage: string | null;
}

const NAV_LINKS = [
  { label: 'Features', target: 'features' },
  { label: 'Schools', target: 'schools' },
  { label: 'About', target: 'about' },
];

const FEATURES = [
  { icon: '📊', title: 'Comprehensive Analytics', desc: 'Real-time dashboards for attendance, grades, finances, and staff performance — all in one place.' },
  { icon: '👥', title: 'Role-Based Access', desc: '30+ role dashboards from Headmaster to Bursary, Registry, Security, and Parent portals.' },
  { icon: '📱', title: 'Offline-First', desc: 'Full offline support with automatic sync. Works without internet — syncs when connected.' },
  { icon: '🔐', title: 'Enterprise Security', desc: 'JWT authentication, role guards, rate limiting, and encrypted data transmission.' },
  { icon: '🏫', title: 'Multi-School', desc: 'Manage unlimited schools on a single platform. Each school gets its own branding and portal.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized with IndexedDB caching, service worker prefetch, and background sync.' },
];

const STATS = [
  { value: '30+', label: 'Role Dashboards' },
  { value: '15+', label: 'Modules' },
  { value: '100%', label: 'Offline Capable' },
  { value: '24/7', label: 'Access Anywhere' },
];

export function SchoolDirectory({ onNavigateToSchool }: { onNavigateToSchool?: (tenantKey: string) => void }) {
  const [tenants, setTenants] = useState<PublicTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { width } = useWindowDimensions();
  const IS_NARROW = width < 768;
  const scrollViewRef = useRef<any>(null);
  const sectionRefs = useRef<Record<string, any>>({});
  const sectionOffsets = useRef<Record<string, number>>({});
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(heroSlide, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();
  }, []);

  useEffect(() => {
    apiClient
      .getAllPublicTenants()
      .then((data) => { setTenants(data); setLoading(false); })
      .catch((err) => { setError(err.message || 'Failed to load schools'); setLoading(false); });
  }, []);

  const navigateToSchool = (tenantKey: string) => {
    if (onNavigateToSchool) {
      onNavigateToSchool(tenantKey);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/${tenantKey}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const scrollToSection = (key: string) => {
    const el = sectionRefs.current[key];
    if (!el) return;
    if (Platform.OS === 'web' && el.getBoundingClientRect) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const y = sectionOffsets.current[key];
      if (y !== undefined) {
        scrollViewRef.current?.scrollTo?.({ y, animated: true });
      } else {
        el.measureLayout?.(
          scrollViewRef.current,
          (_x: number, y: number) => { scrollViewRef.current?.scrollTo?.({ y, animated: true }); },
          () => {},
        );
      }
    }
  };

  const filtered = tenants.filter(
    (t) =>
      t.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      (t.region || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.district || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogoRing}><Text style={styles.loadingLogoText}>SIMS</Text></View>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: spacing.lg }} />
        <Text style={styles.loadingText}>Loading platform...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Unable to Load</Text>
        <Text style={styles.errorSub}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => typeof window !== 'undefined' && window.location.reload()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* ── Navigation Bar ── */}
      <View style={[styles.navBar, IS_NARROW && { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity style={styles.navLogoRow} onPress={() => scrollViewRef.current?.scrollTo?.({ y: 0, animated: true })}>
          <View style={styles.navLogoBox}><Text style={styles.navLogoText}>SIMS</Text></View>
          <View>
            <Text style={styles.navLogoTitle}>SIMS</Text>
            <Text style={styles.navLogoSub}>School Management Platform</Text>
          </View>
        </TouchableOpacity>
        {!IS_NARROW && (
          <View style={styles.navLinksRow}>
            {NAV_LINKS.map((link) => (
              <TouchableOpacity key={link.target} onPress={() => scrollToSection(link.target)}>
                <Text style={styles.navLink}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.navCtaBtn} onPress={() => scrollToSection('schools')}>
          <Text style={styles.navCtaText}>Find Your School</Text>
        </TouchableOpacity>
      </View>

      {/* ── Hero Section ── */}
      <View style={[styles.hero, IS_NARROW && { paddingHorizontal: spacing.md, paddingVertical: spacing.xxl }]}>
        <Animated.View style={[styles.heroContent, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeDot}>●</Text>
            <Text style={styles.heroBadgeText}>ENTERPRISE SCHOOL MANAGEMENT</Text>
          </View>
          <Text style={[styles.heroTitle, IS_NARROW && { fontSize: 32, lineHeight: 40 }]}>
            The Complete Platform for{'\n'}<Text style={styles.heroTitleAccent}>School Management</Text>
          </Text>
          <Text style={[styles.heroSubtitle, IS_NARROW && { fontSize: fontSize.md, lineHeight: 24 }]}>
            From admissions to graduation, SIMS empowers schools with comprehensive tools for attendance, grading, finance, staff management, and parent communication — all in one unified platform.
          </Text>
          <View style={[styles.heroBtnRow, IS_NARROW && { flexDirection: 'column', gap: spacing.sm }]}>
            <TouchableOpacity style={[styles.heroPrimaryBtn, IS_NARROW && { width: '100%' }]} onPress={() => scrollToSection('schools')} activeOpacity={0.85}>
              <Text style={styles.heroPrimaryBtnText}>Browse Schools</Text>
              <Text style={styles.heroPrimaryBtnArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.heroSecondaryBtn, IS_NARROW && { width: '100%' }]} onPress={() => scrollToSection('features')} activeOpacity={0.85}>
              <Text style={styles.heroSecondaryBtnText}>Explore Features</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* ── Stats Band ── */}
      <View style={[styles.statsBand, IS_NARROW && { paddingHorizontal: spacing.md, paddingVertical: spacing.lg }]}>
        <View style={[styles.statsGrid, IS_NARROW && { flexDirection: 'column', gap: spacing.lg }]}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statsItem}>
              <Text style={[styles.statsValue, IS_NARROW && { fontSize: 28 }]}>{stat.value}</Text>
              <Text style={styles.statsLabel}>{stat.label.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Features Section ── */}
      <View
        ref={(el) => { sectionRefs.current['features'] = el; }}
        onLayout={(e) => { sectionOffsets.current['features'] = e.nativeEvent.layout.y; }}
        style={[styles.section, IS_NARROW && { paddingHorizontal: spacing.md, paddingVertical: spacing.xxl }]}
      >
        <View style={[styles.sectionInner, IS_NARROW && { width: '100%' }]}>
          <Text style={styles.sectionEyebrow}>PLATFORM CAPABILITIES</Text>
          <Text style={styles.sectionTitle}>Everything Your School Needs</Text>
          <Text style={styles.sectionSubtitle}>A unified, enterprise-grade system designed to streamline every aspect of school administration.</Text>
          <View style={[styles.featuresGrid, IS_NARROW && { flexDirection: 'column' }]}>
            {FEATURES.map((f) => (
              <View key={f.title} style={[styles.featureCard, IS_NARROW && { width: '100%' }]}>
                <View style={styles.featureIconWrap}><Text style={styles.featureIcon}>{f.icon}</Text></View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── Schools Directory Section ── */}
      <View
        ref={(el) => { sectionRefs.current['schools'] = el; }}
        onLayout={(e) => { sectionOffsets.current['schools'] = e.nativeEvent.layout.y; }}
        style={[styles.schoolsSection, IS_NARROW && { paddingHorizontal: spacing.md, paddingVertical: spacing.xxl }]}
      >
        <View style={[styles.sectionInner, IS_NARROW && { width: '100%' }]}>
          <Text style={styles.sectionEyebrow}>DIRECTORY</Text>
          <Text style={styles.sectionTitle}>Find Your School</Text>
          <Text style={styles.sectionSubtitle}>Browse all schools on the SIMS platform. Click any school to visit its portal.</Text>

          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by school name, region, or district..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.textLight}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClearBtn}>
                <Text style={styles.searchClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.searchResultsCount}>
            {filtered.length} school{filtered.length !== 1 ? 's' : ''} {search.length > 0 ? 'found' : 'available'}
          </Text>

          <View style={[styles.schoolGrid, IS_NARROW && { flexDirection: 'column' }]}>
            {filtered.map((t) => (
              <TouchableOpacity
                key={t.tenantKey}
                style={[styles.schoolCard, IS_NARROW && { width: '100%' }]}
                onPress={() => navigateToSchool(t.tenantKey)}
                activeOpacity={0.9}
              >
                {t.bannerImage ? (
                  <Image source={{ uri: t.bannerImage }} style={styles.schoolCardBanner} resizeMode="cover" />
                ) : (
                  <View style={[styles.schoolCardBanner, { backgroundColor: t.primaryColor || colors.primary }]}>
                    <Text style={styles.schoolCardBannerLetter}>{t.schoolName.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.schoolCardBody}>
                  <View style={styles.schoolCardHeader}>
                    {t.logoUrl ? (
                      <Image source={{ uri: t.logoUrl }} style={styles.schoolCardLogo} resizeMode="contain" />
                    ) : (
                      <View style={[styles.schoolCardLogoPlaceholder, { backgroundColor: t.primaryColor || colors.primary }]}>
                        <Text style={styles.schoolCardLogoText}>{t.schoolName.charAt(0)}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.schoolCardName} numberOfLines={2}>{t.schoolName}</Text>
                      {t.motto && <Text style={styles.schoolCardMotto} numberOfLines={1}>"{t.motto}"</Text>}
                    </View>
                  </View>
                  <View style={styles.schoolCardMetaRow}>
                    {t.region && (
                      <View style={styles.schoolCardMetaChip}>
                        <Text style={styles.schoolCardMetaIcon}>📍</Text>
                        <Text style={styles.schoolCardMetaText}>{t.region}{t.district ? `, ${t.district}` : ''}</Text>
                      </View>
                    )}
                    {t.schoolCode && (
                      <View style={styles.schoolCardMetaChip}>
                        <Text style={styles.schoolCardMetaIcon}>🏫</Text>
                        <Text style={styles.schoolCardMetaText}>{t.schoolCode}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.schoolCardFooter}>
                    <Text style={styles.schoolCardVisitText}>Visit Portal</Text>
                    <Text style={styles.schoolCardVisitArrow}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No Schools Found</Text>
              <Text style={styles.emptyText}>Try adjusting your search terms.</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── About Section ── */}
      <View
        ref={(el) => { sectionRefs.current['about'] = el; }}
        onLayout={(e) => { sectionOffsets.current['about'] = e.nativeEvent.layout.y; }}
        style={[styles.aboutSection, IS_NARROW && { paddingHorizontal: spacing.md, paddingVertical: spacing.xxl }]}
      >
        <View style={[styles.sectionInner, IS_NARROW && { width: '100%' }]}>
          <View style={[styles.aboutGrid, IS_NARROW && { flexDirection: 'column' }]}>
            <View style={[styles.aboutCard, IS_NARROW && { width: '100%' }]}>
              <View style={styles.aboutIconWrap}><Text style={styles.aboutIcon}>🎯</Text></View>
              <Text style={styles.aboutCardTitle}>Our Mission</Text>
              <Text style={styles.aboutCardText}>To digitize and streamline school management across Africa, making administration effortless so educators can focus on what matters — teaching.</Text>
            </View>
            <View style={[styles.aboutCard, IS_NARROW && { width: '100%' }]}>
              <View style={styles.aboutIconWrap}><Text style={styles.aboutIcon}>🌐</Text></View>
              <Text style={styles.aboutCardTitle}>Our Vision</Text>
              <Text style={styles.aboutCardText}>A future where every school — regardless of location or internet access — has access to world-class management tools that empower students, staff, and parents.</Text>
            </View>
            <View style={[styles.aboutCard, IS_NARROW && { width: '100%' }]}>
              <View style={styles.aboutIconWrap}><Text style={styles.aboutIcon}>🤝</Text></View>
              <Text style={styles.aboutCardTitle}>Our Commitment</Text>
              <Text style={styles.aboutCardText}>Built with offline-first architecture, SIMS works in the most remote schools. No internet? No problem. Data syncs automatically when connectivity returns.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── CTA Section ── */}
      <View style={[styles.ctaSection, IS_NARROW && { paddingHorizontal: spacing.md, paddingVertical: spacing.xxl }]}>
        <View style={[styles.ctaInner, IS_NARROW && { width: '100%' }]}>
          <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
          <Text style={styles.ctaText}>Find your school on our platform and access your portal today.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => scrollToSection('schools')} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>Browse Schools Directory</Text>
            <Text style={styles.ctaBtnArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Footer ── */}
      <View style={[styles.footer, IS_NARROW && { paddingHorizontal: spacing.md }]}>
        <View style={[styles.footerInner, IS_NARROW && { flexDirection: 'column', gap: spacing.lg }]}>
          <View style={styles.footerBrandCol}>
            <View style={styles.footerLogoRow}>
              <View style={styles.footerLogoBox}><Text style={styles.footerLogoText}>SIMS</Text></View>
              <View>
                <Text style={styles.footerBrandName}>SIMS Platform</Text>
                <Text style={styles.footerBrandSub}>School Information Management System</Text>
              </View>
            </View>
            <Text style={styles.footerAbout}>An enterprise-grade school management platform built for African schools. Offline-first, role-based, and designed for scale.</Text>
          </View>
          <View style={styles.footerLinksCol}>
            <Text style={styles.footerColTitle}>Platform</Text>
            <TouchableOpacity onPress={() => scrollToSection('features')}><Text style={styles.footerLink}>Features</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => scrollToSection('schools')}><Text style={styles.footerLink}>Schools</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => scrollToSection('about')}><Text style={styles.footerLink}>About</Text></TouchableOpacity>
          </View>
          <View style={styles.footerLinksCol}>
            <Text style={styles.footerColTitle}>Resources</Text>
            <Text style={styles.footerLink}>Documentation</Text>
            <Text style={styles.footerLink}>Offline Support</Text>
            <Text style={styles.footerLink}>Multi-School Setup</Text>
          </View>
          <View style={styles.footerLinksCol}>
            <Text style={styles.footerColTitle}>Contact</Text>
            <Text style={styles.footerLink}>📧 admin@sims.edu</Text>
            <Text style={styles.footerLink}>📞 +233 (0) 24 471 3468</Text>
            <Text style={styles.footerLink}>🌐 sims-platform.com</Text>
          </View>
        </View>
        <View style={styles.footerBottom}>
          <Text style={styles.footerCopyright}>© 2026 SIMS Platform · All rights reserved · Built with ❤ for African Schools</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
  contentContainer: { paddingBottom: 0 },

  // ── Loading ──
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryDark },
  loadingLogoRing: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  loadingLogoText: { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.accent, letterSpacing: 1 },
  loadingText: { marginTop: spacing.md, fontSize: fontSize.md, color: 'rgba(255,255,255,0.5)' },
  errorTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.danger, marginBottom: spacing.sm },
  errorSub: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.5)', marginBottom: spacing.lg, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xl },
  retryBtnText: { color: colors.primaryDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },

  // ── Nav Bar ──
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl, paddingVertical: spacing.md,
    backgroundColor: 'rgba(6, 40, 61, 0.95)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    ...(Platform.OS === 'web' ? { position: 'sticky', top: 0, zIndex: 100 } as any : {}),
  },
  navLogoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  navLogoBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  navLogoText: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, color: colors.primaryDark, letterSpacing: 0.5 },
  navLogoTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.white, lineHeight: fontSize.lg * 1.1 },
  navLogoSub: { fontSize: 10, color: colors.accent, fontWeight: fontWeight.medium, letterSpacing: 0.3 },
  navLinksRow: { flexDirection: 'row', gap: spacing.xl },
  navLink: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.65)', fontWeight: fontWeight.medium, letterSpacing: 0.3 },
  navCtaBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  navCtaText: { color: colors.primaryDark, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  // ── Hero ──
  hero: {
    paddingVertical: spacing.xxxl + spacing.xl, paddingHorizontal: spacing.xxl,
    alignItems: 'center', backgroundColor: colors.primaryDark,
  },
  heroContent: { maxWidth: 720, alignItems: 'center' },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,201,60,0.12)', borderRadius: radius.pill,
    paddingVertical: 6, paddingHorizontal: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(255,201,60,0.25)',
  },
  heroBadgeDot: { fontSize: 8, color: colors.accent },
  heroBadgeText: { fontSize: fontSize.xs, color: colors.accent, fontWeight: fontWeight.semibold, letterSpacing: 1.5 },
  heroTitle: { fontSize: fontSize.hero, fontWeight: fontWeight.extrabold, color: colors.white, textAlign: 'center', lineHeight: fontSize.hero * 1.15, marginBottom: spacing.md },
  heroTitleAccent: { color: colors.accent },
  heroSubtitle: { fontSize: fontSize.lg, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: fontSize.lg * 1.6, maxWidth: 600, marginBottom: spacing.xl },
  heroBtnRow: { flexDirection: 'row', gap: spacing.md },
  heroPrimaryBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  heroPrimaryBtnText: { color: colors.primaryDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  heroPrimaryBtnArrow: { color: colors.primaryDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  heroSecondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  heroSecondaryBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  // ── Stats Band ──
  statsBand: { backgroundColor: colors.surface, paddingVertical: spacing.xl, paddingHorizontal: spacing.xxl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', maxWidth: 800, width: '100%' },
  statsItem: { alignItems: 'center' },
  statsValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: colors.primary },
  statsLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4, letterSpacing: 1, fontWeight: fontWeight.medium },

  // ── Section Common ──
  section: { paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xxl, backgroundColor: colors.background, alignItems: 'center' },
  sectionInner: { maxWidth: 1100, width: '100%' },
  sectionEyebrow: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.bold, letterSpacing: 2, marginBottom: spacing.sm, textAlign: 'center' },
  sectionTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  sectionSubtitle: { fontSize: fontSize.lg, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xxl, maxWidth: 600, alignSelf: 'center', lineHeight: fontSize.lg * 1.5 },

  // ── Features ──
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'center' },
  featureCard: { width: 340, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, ...shadows.md },
  featureIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primary + '12', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  featureDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.6 },

  // ── Schools Section ──
  schoolsSection: { paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xxl, backgroundColor: colors.surface, alignItems: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.md, maxWidth: 560, width: '100%', alignSelf: 'center' },
  searchIcon: { fontSize: fontSize.lg, marginRight: spacing.sm, opacity: 0.4 },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text },
  searchClearBtn: { padding: spacing.xs },
  searchClearText: { fontSize: fontSize.md, color: colors.textLight },
  searchResultsCount: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg, textAlign: 'center', fontWeight: fontWeight.medium },
  schoolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'center' },
  schoolCard: { width: 360, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadows.lg },
  schoolCardBanner: { height: 140, width: '100%', justifyContent: 'center', alignItems: 'center' },
  schoolCardBannerLetter: { fontSize: 56, fontWeight: '800', color: 'rgba(255,255,255,0.25)' },
  schoolCardBody: { padding: spacing.lg },
  schoolCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  schoolCardLogo: { width: 44, height: 44, borderRadius: 10 },
  schoolCardLogoPlaceholder: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  schoolCardLogoText: { fontSize: 20, fontWeight: '800', color: colors.white },
  schoolCardName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, flexShrink: 1 },
  schoolCardMotto: { fontSize: fontSize.xs, color: colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  schoolCardMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  schoolCardMetaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: spacing.sm },
  schoolCardMetaIcon: { fontSize: 10 },
  schoolCardMetaText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  schoolCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  schoolCardVisitText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  schoolCardVisitArrow: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },

  // ── Empty State ──
  emptyState: { padding: spacing.xxl, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  emptyText: { fontSize: fontSize.md, color: colors.textLight },

  // ── About Section ──
  aboutSection: { paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xxl, backgroundColor: colors.background, alignItems: 'center' },
  aboutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'center' },
  aboutCard: { width: 340, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, ...shadows.md },
  aboutIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.accent + '15', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  aboutIcon: { fontSize: 24 },
  aboutCardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  aboutCardText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.6 },

  // ── CTA Section ──
  ctaSection: { paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xxl, backgroundColor: colors.primary, alignItems: 'center' },
  ctaInner: { maxWidth: 600, alignItems: 'center' },
  ctaTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.white, textAlign: 'center', marginBottom: spacing.sm },
  ctaText: { fontSize: fontSize.lg, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: spacing.xl, lineHeight: fontSize.lg * 1.5 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  ctaBtnText: { color: colors.primaryDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  ctaBtnArrow: { color: colors.primaryDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },

  // ── Footer ──
  footer: { backgroundColor: colors.primaryDark, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xxl },
  footerInner: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: 1100, gap: spacing.xl, marginBottom: spacing.xl },
  footerBrandCol: { flex: 1.5, minWidth: 250 },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  footerLogoBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  footerLogoText: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, color: colors.primaryDark, letterSpacing: 0.5 },
  footerBrandName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.white },
  footerBrandSub: { fontSize: fontSize.xs, color: colors.accent, marginTop: 2 },
  footerAbout: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.5)', lineHeight: fontSize.sm * 1.6 },
  footerLinksCol: { minWidth: 140 },
  footerColTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.white, marginBottom: spacing.md, letterSpacing: 0.5 },
  footerLink: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.5)', marginBottom: spacing.sm, lineHeight: fontSize.sm * 1.4 },
  footerBottom: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: spacing.lg },
  footerCopyright: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
});
