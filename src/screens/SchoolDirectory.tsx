import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { apiClient } from '@shared/api/apiClient';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';

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

export function SchoolDirectory() {
  const [tenants, setTenants] = useState<PublicTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { width } = useWindowDimensions();
  const IS_NARROW = width < 768;

  useEffect(() => {
    apiClient
      .getAllPublicTenants()
      .then((data) => {
        setTenants(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load schools');
        setLoading(false);
      });
  }, []);

  const navigateToSchool = (tenantKey: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/${tenantKey}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading schools...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => window.location.reload()}>
          <Text style={styles.retryBtn}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogoBox}>
          <Text style={styles.headerLogoText}>SIMS</Text>
        </View>
        <Text style={styles.headerTitle}>School Information Management System</Text>
        <Text style={styles.headerSubtitle}>Find your school and access its portal</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by school name, region, or district..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>{filtered.length} school{filtered.length !== 1 ? 's' : ''} available</Text>
      </View>

      {/* School Cards */}
      <View style={[styles.grid, IS_NARROW && { flexDirection: 'column' }]}>
        {filtered.map((t) => (
          <TouchableOpacity
            key={t.tenantKey}
            style={[styles.card, IS_NARROW && { width: '100%' }]}
            onPress={() => navigateToSchool(t.tenantKey)}
            activeOpacity={0.85}
          >
            {t.bannerImage ? (
              <Image source={{ uri: t.bannerImage }} style={styles.cardBanner} resizeMode="cover" />
            ) : (
              <View style={[styles.cardBanner, styles.cardBannerPlaceholder, { backgroundColor: t.primaryColor || colors.primary }]}>
                <Text style={styles.cardBannerText}>{t.schoolName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <View style={styles.cardHeaderRow}>
                {t.logoUrl ? (
                  <Image source={{ uri: t.logoUrl }} style={styles.cardLogo} resizeMode="contain" />
                ) : (
                  <View style={[styles.cardLogoPlaceholder, { backgroundColor: t.primaryColor || colors.primary }]}>
                    <Text style={styles.cardLogoText}>{t.schoolName.charAt(0)}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{t.schoolName}</Text>
                  {t.motto && <Text style={styles.cardMotto}>"{t.motto}"</Text>}
                </View>
              </View>
              <View style={styles.cardMetaRow}>
                {t.region && (
                  <View style={styles.cardMetaItem}>
                    <Text style={styles.cardMetaIcon}>📍</Text>
                    <Text style={styles.cardMetaText}>{t.region}{t.district ? `, ${t.district}` : ''}</Text>
                  </View>
                )}
                {t.schoolCode && (
                  <View style={styles.cardMetaItem}>
                    <Text style={styles.cardMetaIcon}>🏫</Text>
                    <Text style={styles.cardMetaText}>Code: {t.schoolCode}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardVisitText}>Visit School Page →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No schools found matching your search.</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 SIMS · School Information Management System</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { paddingBottom: spacing.xl * 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: spacing.md, fontSize: fontSize.md, color: colors.textSecondary },
  errorText: { fontSize: fontSize.md, color: colors.danger, marginBottom: spacing.md },
  retryBtn: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  header: { alignItems: 'center', paddingVertical: spacing.xl * 2, paddingHorizontal: spacing.lg, backgroundColor: colors.primary },
  headerLogoBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  headerLogoText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: '#fff', textAlign: 'center' },
  headerSubtitle: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  searchContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text },
  statsBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: '#f5f5f5' },
  statsText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg, justifyContent: 'center' },
  card: { width: 340, backgroundColor: '#fff', borderRadius: radius.lg, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardBanner: { height: 120, width: '100%' },
  cardBannerPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardBannerText: { fontSize: 48, fontWeight: '800', color: 'rgba(255,255,255,0.3)' },
  cardBody: { padding: spacing.md },
  cardHeaderRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  cardLogo: { width: 40, height: 40, borderRadius: 8 },
  cardLogoPlaceholder: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardLogoText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cardName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, flexShrink: 1 },
  cardMotto: { fontSize: fontSize.xs, color: colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  cardMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  cardMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaIcon: { fontSize: 12 },
  cardMetaText: { fontSize: fontSize.xs, color: colors.textSecondary },
  cardFooter: { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm, marginTop: spacing.xs },
  cardVisitText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  emptyState: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, fontStyle: 'italic' },
  footer: { padding: spacing.lg, alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.borderLight },
  footerText: { fontSize: fontSize.xs, color: colors.textLight },
});
