import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { apiClient, SchoolBranding } from '@shared/api/apiClient';
import { LoginScreen } from '@screens/LoginScreen';

interface SchoolWebsiteProps {
  tenantKey: string;
  onPortalLogin?: () => void;
}

export function SchoolWebsite({ tenantKey, onPortalLogin }: SchoolWebsiteProps) {
  const [branding, setBranding] = useState<SchoolBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPortal, setShowPortal] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    loadBranding();
  }, [tenantKey]);

  const loadBranding = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getPublicBranding(tenantKey);
      setBranding(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load school information');
    } finally {
      setLoading(false);
    }
  };

  const primary = branding?.primaryColor || '#0F4C75';
  const secondary = branding?.secondaryColor || '#FFFFFF';

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: secondary }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={{ marginTop: 12, color: primary }}>Loading school website...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#fff' }]}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#E5484D', marginBottom: 8 }}>
          School Not Found
        </Text>
        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: primary }]} onPress={loadBranding}>
          <Text style={{ color: secondary, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showPortal) {
    return <LoginScreen presetTenantKey={tenantKey} onBack={() => setShowPortal(false)} />;
  }

  if (!branding) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: secondary }]}>
      {/* ── Navbar ── */}
      <View style={[styles.navbar, { backgroundColor: primary }]}>
        {branding.logoUrl ? (
          <Image source={{ uri: branding.logoUrl }} style={styles.navbarLogo} resizeMode="contain" />
        ) : (
          <View style={[styles.navbarLogoPlaceholder, { backgroundColor: secondary }]}>
            <Text style={{ color: primary, fontWeight: 'bold', fontSize: 18 }}>
              {branding.schoolName.charAt(0)}
            </Text>
          </View>
        )}
        <Text style={styles.navbarSchoolName}>{branding.schoolName}</Text>
        <View style={styles.navbarLinks}>
          {['home', 'about', 'news', 'admissions', 'contact'].map((section) => (
            <TouchableOpacity key={section} onPress={() => setActiveSection(section)}>
              <Text
                style={[
                  styles.navbarLink,
                  activeSection === section && styles.navbarLinkActive,
                ]}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.portalBtn, { backgroundColor: secondary }]}
          onPress={() => setShowPortal(true)}
        >
          <Text style={{ color: primary, fontWeight: '700' }}>Portal Login</Text>
        </TouchableOpacity>
      </View>

      {/* ── Home Section ── */}
      {activeSection === 'home' && (
        <View>
          {/* Hero Banner */}
          <View style={[styles.hero, { backgroundColor: primary }]}>
            {branding.bannerImage ? (
              <Image source={{ uri: branding.bannerImage }} style={styles.heroImage} resizeMode="cover" />
            ) : null}
            <View style={styles.heroOverlay}>
              <Text style={styles.heroSchoolName}>{branding.schoolName}</Text>
              {branding.motto ? (
                <Text style={styles.heroMotto}>"{branding.motto}"</Text>
              ) : null}
              <TouchableOpacity
                style={[styles.heroBtn, { backgroundColor: secondary }]}
                onPress={() => setActiveSection('admissions')}
              >
                <Text style={{ color: primary, fontWeight: '700', fontSize: 16 }}>Apply for Admission</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoRow}>
            <View style={[styles.quickInfoCard, { borderColor: primary }]}>
              <Text style={[styles.quickInfoLabel, { color: primary }]}>Academic Year</Text>
              <Text style={styles.quickInfoValue}>2026/2027</Text>
            </View>
            <View style={[styles.quickInfoCard, { borderColor: primary }]}>
              <Text style={[styles.quickInfoLabel, { color: primary }]}>Region</Text>
              <Text style={styles.quickInfoValue}>{branding.region || 'Ghana'}</Text>
            </View>
            <View style={[styles.quickInfoCard, { borderColor: primary }]}>
              <Text style={[styles.quickInfoLabel, { color: primary }]}>Contact</Text>
              <Text style={styles.quickInfoValue}>{branding.phone || 'N/A'}</Text>
            </View>
          </View>

          {/* Principal's Message */}
          {branding.principalsMessage && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primary }]}>Principal's Message</Text>
              <Text style={styles.sectionBody}>{branding.principalsMessage}</Text>
            </View>
          )}

          {/* Mission & Vision */}
          {(branding.mission || branding.vision) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primary }]}>Our Mission & Vision</Text>
              {branding.mission && (
                <View style={styles.mvCard}>
                  <Text style={[styles.mvLabel, { color: primary }]}>Mission</Text>
                  <Text style={styles.mvBody}>{branding.mission}</Text>
                </View>
              )}
              {branding.vision && (
                <View style={styles.mvCard}>
                  <Text style={[styles.mvLabel, { color: primary }]}>Vision</Text>
                  <Text style={styles.mvBody}>{branding.vision}</Text>
                </View>
              )}
            </View>
          )}

          {/* Latest News */}
          {branding.newsItems.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primary }]}>Latest News</Text>
              {branding.newsItems.slice(0, 3).map((news, i) => (
                <View key={i} style={styles.newsCard}>
                  <Text style={styles.newsTitle}>{news.title}</Text>
                  <Text style={styles.newsDate}>{news.date}</Text>
                  <Text style={styles.newsBody}>{news.body}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Gallery */}
          {branding.galleryImages.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primary }]}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {branding.galleryImages.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={styles.galleryImage} resizeMode="cover" />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* ── About Section ── */}
      {activeSection === 'about' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>About {branding.schoolName}</Text>
          {branding.aboutText ? (
            <Text style={styles.sectionBody}>{branding.aboutText}</Text>
          ) : (
            <Text style={styles.sectionBody}>Information about the school will be available soon.</Text>
          )}
          {branding.mission && (
            <View style={styles.mvCard}>
              <Text style={[styles.mvLabel, { color: primary }]}>Mission</Text>
              <Text style={styles.mvBody}>{branding.mission}</Text>
            </View>
          )}
          {branding.vision && (
            <View style={styles.mvCard}>
              <Text style={[styles.mvLabel, { color: primary }]}>Vision</Text>
              <Text style={styles.mvBody}>{branding.vision}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── News Section ── */}
      {activeSection === 'news' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>News & Announcements</Text>
          {branding.newsItems.length > 0 ? (
            branding.newsItems.map((news, i) => (
              <View key={i} style={styles.newsCard}>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsDate}>{news.date}</Text>
                <Text style={styles.newsBody}>{news.body}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionBody}>No news items available.</Text>
          )}
        </View>
      )}

      {/* ── Admissions Section ── */}
      {activeSection === 'admissions' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>Admissions</Text>
          {branding.admissionsInfo ? (
            <Text style={styles.sectionBody}>{branding.admissionsInfo}</Text>
          ) : (
            <Text style={styles.sectionBody}>Admission information will be available soon. Please contact the school for details.</Text>
          )}
          <TouchableOpacity
            style={[styles.heroBtn, { backgroundColor: primary, marginTop: 16 }]}
            onPress={() => setShowPortal(true)}
          >
            <Text style={{ color: secondary, fontWeight: '700', fontSize: 16 }}>Login to Portal</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Contact Section ── */}
      {activeSection === 'contact' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>Contact Us</Text>
          <View style={styles.contactCard}>
            {branding.address && (
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: primary }]}>Address:</Text>
                <Text style={styles.contactValue}>{branding.address}</Text>
              </View>
            )}
            {branding.region && (
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: primary }]}>Region:</Text>
                <Text style={styles.contactValue}>{branding.region}{branding.district ? `, ${branding.district}` : ''}</Text>
              </View>
            )}
            {branding.phone && (
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: primary }]}>Phone:</Text>
                <Text style={styles.contactValue}>{branding.phone}</Text>
              </View>
            )}
            {branding.email && (
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: primary }]}>Email:</Text>
                <Text style={styles.contactValue}>{branding.email}</Text>
              </View>
            )}
          </View>

          {/* Social Links */}
          {(branding.facebookUrl || branding.instagramUrl || branding.twitterUrl) && (
            <View style={styles.socialRow}>
              {branding.facebookUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(branding.facebookUrl!)}>
                  <Text style={[styles.socialLink, { color: primary }]}>Facebook</Text>
                </TouchableOpacity>
              )}
              {branding.instagramUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(branding.instagramUrl!)}>
                  <Text style={[styles.socialLink, { color: primary }]}>Instagram</Text>
                </TouchableOpacity>
              )}
              {branding.twitterUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(branding.twitterUrl!)}>
                  <Text style={[styles.socialLink, { color: primary }]}>Twitter</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* ── Footer ── */}
      <View style={[styles.footer, { backgroundColor: primary }]}>
        <Text style={styles.footerText}>{branding.schoolName}</Text>
        {branding.motto && <Text style={styles.footerMotto}>"{branding.motto}"</Text>}
        <Text style={styles.footerPoweredBy}>Powered by SIMS Ghana</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexWrap: 'wrap',
    gap: 12,
  },
  navbarLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  navbarLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbarSchoolName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  navbarLinks: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  navbarLink: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  navbarLinkActive: {
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  portalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  // Hero
  hero: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  heroOverlay: {
    alignItems: 'center',
    padding: 20,
  },
  heroSchoolName: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroMotto: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  heroBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  // Quick Info
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  quickInfoCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  quickInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // Sections
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  // Mission & Vision
  mvCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  mvLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  mvBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  // News
  newsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  newsBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  // Gallery
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  // Contact
  contactCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactLabel: {
    fontWeight: 'bold',
    width: 100,
    fontSize: 15,
  },
  contactValue: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
  },
  socialLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Footer
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerMotto: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  footerPoweredBy: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 12,
  },
});
