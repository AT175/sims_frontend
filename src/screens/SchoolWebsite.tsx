import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Dimensions } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { apiClient, SchoolBranding } from '@shared/api/apiClient';
import { LoginScreen } from '@screens/LoginScreen';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@theme/index';
import { getCachedBranding, cacheBranding } from '@db/indexedDBAdapter';
import { useConnectionStatus } from '@shared/hooks/useConnectionStatus';

interface SchoolWebsiteProps {
  tenantKey: string;
}

const DEFAULT_SLIDES = [
  { image: '/b1.jpg', caption: 'Welcome to our school' },
  { image: '/b3.jpeg', caption: 'Quality Education & Discipline' },
  { image: '/b4.jpeg', caption: 'A Center for Excellence' },
  { image: '/b5.jpeg', caption: 'Building Future Leaders' },
  { image: '/b6.jpeg', caption: 'Serving Our Community' },
  { image: '/b7.jpeg', caption: 'Our Campus' },
];

const DEFAULT_STATS = [
  { label: 'Students', value: '500+' },
  { label: 'Programmes', value: '6' },
  { label: 'Staff', value: '40+' },
  { label: 'Founded', value: '2010' },
];

interface GalleryFrameProps {
  uri: string;
  index: number;
  total: number;
  maxWidth: number;
  onPress: () => void;
  primary: string;
}

function GalleryFrame({ uri, index, total, maxWidth, onPress, primary }: GalleryFrameProps) {
  const [aspect, setAspect] = useState<number | null>(null);
  const [frameW, setFrameW] = useState(maxWidth);

  useEffect(() => {
    setAspect(null);
    Image.getSize(uri, (w, h) => setAspect(w / h), () => setAspect(1.5));
  }, [uri]);

  const minH = 180;
  let frameHeight = 340;
  if (aspect !== null) {
    frameHeight = Math.max(frameW / aspect, minH);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[s.galleryFrame, { maxWidth }]}
      onPress={onPress}
      onLayout={(e) => setFrameW(e.nativeEvent.layout.width)}
    >
      <View style={[s.galleryFrameImgWrap, { height: frameHeight }]}>
        {aspect === null ? (
          <View style={s.galleryFrameLoading}>
            <ActivityIndicator size="small" color={primary} />
          </View>
        ) : (
          <Image source={{ uri }} style={s.galleryFrameImg} resizeMode="cover" />
        )}
      </View>
      <View style={[s.galleryFrameOverlay, { backgroundColor: `${primary}10` }]}>
        <Text style={[s.galleryFrameNum, { color: primary }]}>Photo {index + 1} of {total}</Text>
      </View>
    </TouchableOpacity>
  );
}

function useSortedGallery(images: string[]): string[] {
  const [sorted, setSorted] = useState<string[]>(images);
  useEffect(() => {
    if (images.length <= 1) { setSorted(images); return; }
    let cancelled = false;
    const results: { uri: string; aspect: number }[] = [];
    let done = 0;
    images.forEach((uri) => {
      Image.getSize(uri, (w, h) => {
        results.push({ uri, aspect: w / h });
        done++;
        if (done === images.length && !cancelled) {
          const landscape = results.filter(r => r.aspect >= 1).sort((a, b) => b.aspect - a.aspect);
          const portrait = results.filter(r => r.aspect < 1).sort((a, b) => a.aspect - b.aspect);
          setSorted([...landscape.map(r => r.uri), ...portrait.map(r => r.uri)]);
        }
      }, () => {
        results.push({ uri, aspect: 1.5 });
        done++;
        if (done === images.length && !cancelled) {
          const landscape = results.filter(r => r.aspect >= 1).sort((a, b) => b.aspect - a.aspect);
          const portrait = results.filter(r => r.aspect < 1).sort((a, b) => a.aspect - b.aspect);
          setSorted([...landscape.map(r => r.uri), ...portrait.map(r => r.uri)]);
        }
      });
    });
    return () => { cancelled = true; };
  }, [images.join(',')]);
  return sorted;
}

export function SchoolWebsite({ tenantKey }: SchoolWebsiteProps) {
  const [branding, setBranding] = useState<SchoolBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPortal, setShowPortal] = useState(false);
  const [portalTab, setPortalTab] = useState<'signin' | 'apply' | 'status'>('signin');
  const [heroSlide, setHeroSlide] = useState(0);
  const heroSlidesRef = useRef(6);
  const [, setActiveSection] = useState('home');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryPage, setGalleryPage] = useState(0);
  const lightboxScrollRef = useRef<ScrollView>(null);
  const { isOnline } = useConnectionStatus();

  const heroFade = useRef(new Animated.Value(1)).current;
  const heroScale = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<any>(null);
  const aboutY = useRef(0);

  const { width: windowWidth } = useWindowDimensions();
  const IS_NARROW = windowWidth < 768;
  const IS_VERY_NARROW = windowWidth < 480;

  const galleryImgs = branding?.galleryImages || [];
  const sortedGallery = useSortedGallery(galleryImgs);

  useEffect(() => {
    loadBranding();
  }, [tenantKey]);

  useEffect(() => {
    if (loading || error) return;
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ]).start(() => {
        setHeroSlide((prev) => (prev + 1) % heroSlidesRef.current);
        heroScale.setValue(1.08);
        Animated.parallel([
          Animated.timing(heroFade, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(heroScale, { toValue: 1, duration: 4000, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        ]).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [heroFade, heroScale, loading, error]);

  const loadBranding = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Step 1: Try to load from IndexedDB cache first for instant render
    try {
      const cached = await getCachedBranding(tenantKey);
      if (cached) {
        setBranding(cached);
        setLoading(false);
        setIsOfflineMode(!isOnline);
      }
    } catch {
      // Cache read failed — continue to network fetch
    }

    // Step 2: Fetch from API (network)
    try {
      const data = await apiClient.getPublicBranding(tenantKey);
      setBranding(data);
      setIsOfflineMode(false);
      // Update cache with fresh data
      cacheBranding(tenantKey, data).catch(() => {});
    } catch (err: any) {
      // Step 3: If API failed and we have cached data, keep showing it
      const cached = await getCachedBranding(tenantKey);
      if (cached) {
        setBranding(cached);
        setIsOfflineMode(true);
      } else {
        setError(err.message || 'Failed to load school information');
      }
    } finally {
      setLoading(false);
    }
  }, [tenantKey, isOnline]);

  const scrollToAbout = () => {
    setActiveSection('home');
    setTimeout(() => scrollViewRef.current?.scrollTo?.({ y: aboutY.current, animated: true }), 100);
  };

  const openPortal = (tab: 'signin' | 'apply' | 'status') => {
    setPortalTab(tab);
    setShowPortal(true);
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.primary, fontSize: fontSize.md }}>Loading school website...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.loadingContainer}>
        <Text style={{ fontSize: 24, fontWeight: fontWeight.bold, color: colors.danger, marginBottom: 8 }}>
          School Not Found
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 16, fontSize: fontSize.md }}>
          {error}
        </Text>
        <TouchableOpacity style={s.retryBtn} onPress={loadBranding}>
          <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showPortal) {
    return <LoginScreen presetTenantKey={tenantKey} presetTab={portalTab} onBack={() => setShowPortal(false)} />;
  }

  if (!branding) return null;

  const schoolName = branding.schoolName || 'School';
  const schoolShort = schoolName.split(' ').map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  const motto = branding.motto || '';
  const primary = branding.primaryColor || colors.primary;
  const accent = '#FFC93C';
  const primaryDark = primary === colors.primary ? colors.primaryDark : primary;

  const galleryImages = sortedGallery;
  const heroSlides = galleryImgs.length > 0
    ? galleryImgs.map((img, i) => ({
        image: img,
        caption: i === 0 ? (motto || `Welcome to ${schoolName}`) : ['Quality Education & Discipline', 'A Center for Excellence', 'Building Future Leaders', 'Serving Our Community', 'Our Campus', 'A Tradition of Excellence'][i % 6] || 'School Life',
      }))
    : branding.bannerImage
      ? [{ image: branding.bannerImage, caption: motto }, ...DEFAULT_SLIDES.slice(1)]
      : DEFAULT_SLIDES;
  heroSlidesRef.current = heroSlides.length || 1;
  if (heroSlide >= heroSlides.length) setHeroSlide(0);

  const programmes = branding.programmes || [];
  const stats = [
    { label: 'Students', value: branding.maxStudents ? `${branding.maxStudents}+` : '500+' },
    { label: 'Programmes', value: String(programmes.length || 6) },
    { label: 'Staff', value: branding.maxStaff ? `${branding.maxStaff}+` : '40+' },
    { label: 'Levels', value: branding.offeredLevels && branding.offeredLevels.length > 0 ? String(branding.offeredLevels.length) : '3' },
  ];

  const newsItems = branding.newsItems || [];
  const staffProfiles = branding.staffProfiles || [];
  const upcomingEvents = branding.upcomingEvents || [];
  const testimonials = branding.testimonials || [];

  return (
    <View style={s.homeScreen}>
      <ScrollView ref={scrollViewRef} style={s.homeScroll} contentContainerStyle={s.homeScrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={[s.header, IS_NARROW && { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 }]}>
          <TouchableOpacity style={s.headerLogoRow} onPress={() => scrollViewRef.current?.scrollTo?.({ y: 0, animated: true })}>
            {branding.logoUrl ? (
              <Image source={{ uri: branding.logoUrl }} style={s.headerLogoImg} resizeMode="contain" />
            ) : (
              <View style={[s.headerLogoBox, { backgroundColor: primary }]}><Text style={s.headerLogoText}>{schoolShort}</Text></View>
            )}
            {!IS_VERY_NARROW && (
              <View>
                <Text style={[s.headerSchoolName, { color: primary }]}>{schoolName.length > 30 ? schoolName.substring(0, 28) + '...' : schoolName}</Text>
                {motto ? <Text style={s.headerSchoolSub}>{motto.length > 40 ? motto.substring(0, 38) + '...' : motto}</Text> : null}
              </View>
            )}
          </TouchableOpacity>
          <View style={[s.headerNav, IS_NARROW && { gap: spacing.sm }]}>
            {!IS_NARROW && (
              <>
                <TouchableOpacity onPress={() => scrollViewRef.current?.scrollTo?.({ y: 0, animated: true })}><Text style={s.headerNavLink}>Home</Text></TouchableOpacity>
                <TouchableOpacity onPress={scrollToAbout}><Text style={s.headerNavLink}>About Us</Text></TouchableOpacity>
                {newsItems.length > 0 && <TouchableOpacity onPress={() => setActiveSection('news')}><Text style={s.headerNavLink}>News</Text></TouchableOpacity>}
                <TouchableOpacity onPress={() => setActiveSection('admissions')}><Text style={s.headerNavLink}>Admissions</Text></TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={[s.headerGhostBtn, { borderColor: primary }, IS_NARROW && { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]} onPress={() => openPortal('signin')}>
              <Text style={[s.headerGhostText, { color: primary }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.headerCtaBtn, { backgroundColor: primary }, IS_NARROW && { paddingVertical: spacing.sm, paddingHorizontal: spacing.md + 4 }]} onPress={() => openPortal('apply')}>
              <Text style={s.headerCtaText}>Apply</Text>
            </TouchableOpacity>
            {isOfflineMode && (
              <View style={s.offlineBadge}><Text style={s.offlineBadgeText}>● Offline</Text></View>
            )}
          </View>
        </View>

        {/* ── Hero ── */}
        <View style={[s.hero, IS_NARROW && { minHeight: 500 }]}>
        <View style={s.heroBgWrap} pointerEvents="none">
          {heroSlides.map((slide, i) => (
            <Animated.Image
              key={i}
              source={{ uri: slide.image }}
              style={[
                s.heroBg,
                {
                  opacity: i === heroSlide ? heroFade : 0,
                  transform: i === heroSlide ? [{ scale: heroScale }] : [{ scale: 1 }],
                },
              ]}
              resizeMode="cover"
            />
          ))}
          <View style={[s.heroOverlay, { backgroundColor: `${primary}40` }]} />
        </View>
          <View style={[s.heroContent, IS_NARROW && { paddingHorizontal: spacing.md, width: '100%' }]}>
            <View style={s.heroBadge}><Text style={s.heroBadgeText}>{branding.region ? `${branding.region.toUpperCase()} · GES ACCREDITED` : 'GES ACCREDITED SCHOOL'}</Text></View>
            <Text style={[s.heroTitle, IS_NARROW && { fontSize: 30, lineHeight: 38 }]}>Welcome to{'\n'}<Text style={[s.heroTitleAccent, { color: accent }]}>{schoolName}</Text></Text>
            {motto ? <Text style={[s.heroSubtitle, IS_NARROW && { fontSize: fontSize.md, lineHeight: fontSize.md * 1.5 }]}>"{motto}"</Text> : null}
            <View style={s.heroBtnRow}>
              <TouchableOpacity style={[s.heroBtnPrimary, { backgroundColor: accent }, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('apply')} activeOpacity={0.85}>
                <Text style={[s.heroBtnPrimaryText, { color: primaryDark }, IS_NARROW && { fontSize: fontSize.sm }]}>Apply for Admission</Text>
                <Text style={[s.heroBtnPrimaryText, { color: primaryDark }, IS_NARROW && { fontSize: fontSize.sm }]}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.heroBtnSecondary, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('signin')} activeOpacity={0.85}>
                <Text style={[s.heroBtnSecondaryText, IS_NARROW && { fontSize: fontSize.sm }]}>Staff / Student Login</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.heroDots}>
            {heroSlides.map((_, i) => (
              <View key={i} style={[s.heroDot, i === heroSlide && { backgroundColor: accent }]} />
            ))}
          </View>
        </View>

        {/* ── About Section ── */}
        <View style={[s.section, s.aboutBg, IS_NARROW && { paddingVertical: spacing.xl + 8, paddingHorizontal: spacing.md }]} onLayout={(e) => { aboutY.current = e.nativeEvent.layout.y; }}>
          <View style={s.sectionNarrow}>
            <Text style={[s.sectionTitle, { color: primary }]}>About <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>Our School</Text></Text>
            <Text style={s.sectionSubtitle}>
              {branding.aboutText || `Welcome to ${schoolName}. We are dedicated to providing high-quality education and discipline to our learners.`}
            </Text>
            <View style={s.aboutGrid}>
              <View style={[s.aboutCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🎯</Text></View>
                <Text style={[s.aboutCardTitle, { color: primary }]}>Our Mission</Text>
                <Text style={s.aboutCardText}>{branding.mission || 'To train learners to high levels of education standards through the collaborative effort of all relevant stakeholders.'}</Text>
              </View>
              <View style={[s.aboutCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🌟</Text></View>
                <Text style={[s.aboutCardTitle, { color: primary }]}>Our Vision</Text>
                <Text style={s.aboutCardText}>{branding.vision || 'A center for quality education and discipline, serving our community with dedication and excellence.'}</Text>
              </View>
              <View style={[s.aboutCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🤝</Text></View>
                <Text style={[s.aboutCardTitle, { color: primary }]}>Our Motto</Text>
                <Text style={s.aboutCardText}>{motto ? `"${motto}"` : 'We believe in nurturing both the intellect and character of every student through collaborative effort and discipline.'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Principal's Message ── */}
        {branding.principalsMessage && (
          <View style={[s.section, { backgroundColor: '#f0f4ff' }, IS_NARROW && { paddingHorizontal: spacing.md }]}>
            <View style={s.sectionNarrow}>
              <Text style={[s.sectionTitle, { color: primary }]}>Principal's <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>Message</Text></Text>
              <Text style={[s.sectionSubtitle, { fontStyle: 'italic' }]}>{branding.principalsMessage}</Text>
            </View>
          </View>
        )}

        {/* ── News Section ── */}
        {newsItems.length > 0 && (
          <View style={[s.section, s.aboutBg, IS_NARROW && { paddingHorizontal: spacing.md }]}>
            <View style={s.sectionNarrow}>
              <Text style={[s.sectionTitle, { color: primary }]}>Latest <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>News</Text></Text>
              <Text style={s.sectionSubtitle}>Stay updated with the latest announcements and events</Text>
              <View style={s.featuresGrid}>
                {newsItems.slice(0, 6).map((news, i) => (
                  <View key={i} style={[s.featureCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                    <View style={[s.featureIconWrap, { backgroundColor: `${primary}1A` }]}><Text style={s.featureIcon}>📰</Text></View>
                    <Text style={[s.featureTitle, { color: primary }]}>{news.title}</Text>
                    <Text style={[s.featureText, { fontSize: 10, color: colors.textLight, marginBottom: 4 }]}>{news.date}</Text>
                    <Text style={s.featureText}>{news.body}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Gallery Section ── */}
        {galleryImages.length > 0 && (() => {
          const perPage = IS_NARROW ? 1 : 2;
          const totalPages = Math.ceil(galleryImages.length / perPage);
          const safePage = Math.min(galleryPage, totalPages - 1);
          const startIdx = safePage * perPage;
          const pageImages = galleryImages.slice(startIdx, startIdx + perPage);
          return (
            <View style={[s.section, s.featuresBg, IS_NARROW && { paddingHorizontal: spacing.md }]}>
              <View style={s.sectionNarrow}>
                <Text style={[s.sectionTitle, { color: primary }]}>Our <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>Gallery</Text></Text>
                <Text style={s.sectionSubtitle}>A glimpse of life at {schoolName} — click to enlarge</Text>

                <View style={s.galleryCarouselWrap}>
                  {/* Prev button */}
                  {totalPages > 1 && (
                    <TouchableOpacity
                      style={[s.galleryNavBtn, { borderColor: primary }, safePage === 0 && s.galleryNavBtnDisabled]}
                      disabled={safePage === 0}
                      onPress={() => setGalleryPage(Math.max(0, safePage - 1))}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.galleryNavBtnText, { color: primary }, safePage === 0 && { color: colors.textLight }]}>‹</Text>
                    </TouchableOpacity>
                  )}

                  {/* Image frames */}
                  <View style={[s.galleryFramesRow, IS_NARROW && { flexDirection: 'column' }]}>
                    {pageImages.map((img, i) => {
                      const globalIdx = startIdx + i;
                      const frameMaxW = IS_NARROW ? windowWidth - 120 : 480;
                      return (
                        <GalleryFrame
                          key={globalIdx}
                          uri={img}
                          index={globalIdx}
                          total={galleryImages.length}
                          maxWidth={frameMaxW}
                          onPress={() => setLightboxIndex(globalIdx)}
                          primary={primary}
                        />
                      );
                    })}
                  </View>

                  {/* Next button */}
                  {totalPages > 1 && (
                    <TouchableOpacity
                      style={[s.galleryNavBtn, { borderColor: primary }, safePage >= totalPages - 1 && s.galleryNavBtnDisabled]}
                      disabled={safePage >= totalPages - 1}
                      onPress={() => setGalleryPage(Math.min(totalPages - 1, safePage + 1))}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.galleryNavBtnText, { color: primary }, safePage >= totalPages - 1 && { color: colors.textLight }]}>›</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Page dots */}
                {totalPages > 1 && (
                  <View style={s.galleryDots}>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <TouchableOpacity key={i} onPress={() => setGalleryPage(i)}>
                        <View style={[s.galleryDot, i === safePage && { backgroundColor: primary }]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })()}

        {/* ── Gallery Lightbox Modal ── */}
        <Modal visible={lightboxIndex !== null} transparent animationType="fade" onRequestClose={() => setLightboxIndex(null)}>
          <View style={s.lightboxOverlay}>
            <TouchableOpacity style={s.lightboxClose} onPress={() => setLightboxIndex(null)} activeOpacity={0.7}>
              <Text style={s.lightboxCloseText}>✕</Text>
            </TouchableOpacity>
            {lightboxIndex !== null && (
              <>
                <ScrollView
                  ref={lightboxScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={{ flex: 1, width: '100%' }}
                  contentContainerStyle={{ flexGrow: 1 }}
                  onLayout={() => {
                    const w = Dimensions.get('window').width;
                    lightboxScrollRef.current?.scrollTo({ x: w * lightboxIndex, animated: false });
                    setTimeout(() => {
                      lightboxScrollRef.current?.scrollTo({ x: w * lightboxIndex, animated: false });
                    }, 100);
                  }}
                  onMomentumScrollEnd={(e) => {
                    const w = Dimensions.get('window').width;
                    const idx = Math.round(e.nativeEvent.contentOffset.x / w);
                    setLightboxIndex(idx);
                  }}
                >
                  {galleryImages.map((img, i) => (
                    <View key={i} style={s.lightboxImageWrap}>
                      <Image source={{ uri: img }} style={s.lightboxImage} resizeMode="contain" />
                    </View>
                  ))}
                </ScrollView>
                {/* Prev / Next arrows inside lightbox */}
                {lightboxIndex > 0 && (
                  <TouchableOpacity style={s.lightboxNavLeft} onPress={() => {
                    const w = Dimensions.get('window').width;
                    const newIdx = lightboxIndex - 1;
                    setLightboxIndex(newIdx);
                    lightboxScrollRef.current?.scrollTo({ x: w * newIdx, animated: true });
                  }} activeOpacity={0.7}>
                    <Text style={s.lightboxNavText}>‹</Text>
                  </TouchableOpacity>
                )}
                {lightboxIndex < galleryImages.length - 1 && (
                  <TouchableOpacity style={s.lightboxNavRight} onPress={() => {
                    const w = Dimensions.get('window').width;
                    const newIdx = lightboxIndex + 1;
                    setLightboxIndex(newIdx);
                    lightboxScrollRef.current?.scrollTo({ x: w * newIdx, animated: true });
                  }} activeOpacity={0.7}>
                    <Text style={s.lightboxNavText}>›</Text>
                  </TouchableOpacity>
                )}
                {/* Counter */}
                <View style={s.lightboxCounter}>
                  <Text style={s.lightboxCounterText}>{lightboxIndex + 1} / {galleryImages.length}</Text>
                </View>
              </>
            )}
          </View>
        </Modal>

        {/* ── Programmes Section ── */}
        {programmes.length > 0 && (
          <View style={[s.section, s.aboutBg, IS_NARROW && { paddingHorizontal: spacing.md }]}>
            <View style={s.sectionNarrow}>
              <Text style={[s.sectionTitle, { color: primary }]}>Our <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>Programmes</Text></Text>
              <Text style={s.sectionSubtitle}>Academic programmes offered at {schoolName}</Text>
              <View style={s.featuresGrid}>
                {programmes.map((prog, i) => (
                  <View key={i} style={[s.featureCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                    <View style={[s.featureIconWrap, { backgroundColor: `${primary}1A` }]}>
                      <Text style={s.featureIcon}>{prog.icon || '📚'}</Text>
                    </View>
                    <Text style={[s.featureTitle, { color: primary }]}>{prog.name}</Text>
                    <Text style={s.featureText}>{prog.description}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Staff / Leadership Showcase ── */}
        {staffProfiles.length > 0 && (
          <View style={[s.section, s.featuresBg, IS_NARROW && { paddingHorizontal: spacing.md }]}>
            <View style={s.sectionNarrow}>
              <Text style={[s.sectionTitle, { color: primary }]}>Our <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>Leadership</Text></Text>
              <Text style={s.sectionSubtitle}>Meet the dedicated team behind {schoolName}</Text>
              <View style={s.featuresGrid}>
                {staffProfiles.map((staff, i) => (
                  <View key={i} style={[s.featureCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                    {staff.photoUrl ? (
                      <Image source={{ uri: staff.photoUrl }} style={s.staffPhoto} resizeMode="cover" />
                    ) : (
                      <View style={[s.staffPhotoPlaceholder, { backgroundColor: `${primary}1A` }]}>
                        <Text style={[s.staffPhotoInitial, { color: primary }]}>{staff.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={[s.featureTitle, { color: primary, marginTop: spacing.md }]}>{staff.name}</Text>
                    <Text style={[s.featureText, { fontWeight: fontWeight.semibold, color: colors.textSecondary }]}>{staff.title}</Text>
                    {staff.bio && <Text style={[s.featureText, { marginTop: spacing.xs }]}>{staff.bio}</Text>}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Events Calendar ── */}
        {upcomingEvents.length > 0 && (
          <View style={[s.section, s.aboutBg, IS_NARROW && { paddingHorizontal: spacing.md }]}>
            <View style={s.sectionNarrow}>
              <Text style={[s.sectionTitle, { color: primary }]}>Upcoming <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>Events</Text></Text>
              <Text style={s.sectionSubtitle}>Stay informed about what's happening at {schoolName}</Text>
              <View style={{ marginTop: spacing.lg }}>
                {upcomingEvents.map((event, i) => {
                  const eventDate = new Date(event.date);
                  const day = eventDate.getDate().toString().padStart(2, '0');
                  const month = eventDate.toLocaleString('en', { month: 'short' }).toUpperCase();
                  return (
                    <View key={i} style={[s.eventRow, IS_NARROW && { padding: spacing.md }]}>
                      <View style={[s.eventDateBadge, { backgroundColor: primary }]}>
                        <Text style={s.eventDateDay}>{day}</Text>
                        <Text style={s.eventDateMonth}>{month}</Text>
                      </View>
                      <View style={s.eventInfo}>
                        <Text style={[s.eventTitle, { color: primary }]}>{event.title}</Text>
                        <Text style={s.eventDescription}>{event.description}</Text>
                        <View style={[s.eventTypeBadge, { backgroundColor: `${primary}1A` }]}>
                          <Text style={[s.eventTypeText, { color: primary }]}>{event.type}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ── Testimonials ── */}
        {testimonials.length > 0 && (
          <View style={[s.section, s.featuresBg, IS_NARROW && { paddingHorizontal: spacing.md }]}>
            <View style={s.sectionNarrow}>
              <Text style={[s.sectionTitle, { color: primary }]}>What People <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>Say</Text></Text>
              <Text style={s.sectionSubtitle}>Testimonials from our students and parents</Text>
              <View style={s.featuresGrid}>
                {testimonials.map((testimonial, i) => (
                  <View key={i} style={[s.featureCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                    <Text style={s.testimonialStars}>
                      {'★'.repeat(Math.min(testimonial.rating || 5, 5))}
                      {'☆'.repeat(Math.max(0, 5 - (testimonial.rating || 5)))}
                    </Text>
                    <Text style={[s.featureText, { fontStyle: 'italic', marginBottom: spacing.md }]}>"{testimonial.content}"</Text>
                    <View style={s.testimonialAuthorRow}>
                      <View style={[s.testimonialAvatar, { backgroundColor: `${primary}1A` }]}>
                        <Text style={[s.testimonialAvatarText, { color: primary }]}>{testimonial.author.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text style={[s.featureTitle, { color: primary, fontSize: fontSize.sm }]}>{testimonial.author}</Text>
                        <Text style={[s.featureText, { fontSize: 10 }]}>{testimonial.role}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Stats Band ── */}
        <View style={[s.statsBand, { backgroundColor: primary }, IS_NARROW && { paddingHorizontal: spacing.md }]}>
          <View style={[s.statsBandGrid, IS_NARROW && { gap: spacing.lg }]}>
            {stats.map((st) => (
              <View key={st.label} style={s.statsBandItem}>
                <Text style={[s.statsBandValue, { color: accent }, IS_NARROW && { fontSize: 28 }]}>{st.value}</Text>
                <Text style={s.statsBandLabel}>{st.label.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Admissions Section ── */}
        <View style={[s.section, s.aboutBg, IS_NARROW && { paddingHorizontal: spacing.md }]}>
          <View style={s.sectionNarrow}>
            <Text style={[s.sectionTitle, { color: primary }]}>Admissions <Text style={[s.sectionTitleAccent, { color: colors.accentDark }]}>Information</Text></Text>
            <Text style={s.sectionSubtitle}>
              {branding.admissionsInfo || `Admissions are open for the academic year. Contact us or apply online to join ${schoolName}.`}
            </Text>
            <View style={s.heroBtnRow}>
              <TouchableOpacity style={[s.heroBtnPrimary, { backgroundColor: accent }, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('apply')} activeOpacity={0.85}>
                <Text style={[s.heroBtnPrimaryText, { color: primaryDark }, IS_NARROW && { fontSize: fontSize.sm }]}>Apply Now</Text>
                <Text style={[s.heroBtnPrimaryText, { color: primaryDark }, IS_NARROW && { fontSize: fontSize.sm }]}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.heroBtnSecondary, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('status')} activeOpacity={0.85}>
                <Text style={[s.heroBtnSecondaryText, IS_NARROW && { fontSize: fontSize.sm }]}>Check Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── CTA Section ── */}
        <View style={[s.ctaSection, IS_NARROW && { paddingVertical: spacing.xl + 8, paddingHorizontal: spacing.md }]}>
          <Text style={[s.ctaTitle, { color: primary }]}>Ready to Join Our Community?</Text>
          <Text style={s.ctaText}>Apply for admission today or contact us for more information. We're here to help you every step of the way.</Text>
          <View style={s.heroBtnRow}>
            <TouchableOpacity style={[s.heroBtnPrimary, { backgroundColor: accent }, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('apply')} activeOpacity={0.85}>
              <Text style={[s.heroBtnPrimaryText, { color: primaryDark }, IS_NARROW && { fontSize: fontSize.sm }]}>Apply Now</Text>
              <Text style={[s.heroBtnPrimaryText, { color: primaryDark }, IS_NARROW && { fontSize: fontSize.sm }]}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.heroBtnSecondary, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('signin')} activeOpacity={0.85}>
              <Text style={[s.heroBtnSecondaryText, IS_NARROW && { fontSize: fontSize.sm }]}>Staff / Student Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={[s.footer, { backgroundColor: primaryDark }, IS_NARROW && { paddingHorizontal: spacing.md }]}>
          <View style={s.footerGrid}>
            <View style={[s.footerColWide, IS_NARROW && { minWidth: 200 }]}>
              <View style={s.footerBrandRow}>
                {branding.logoUrl ? (
                  <Image source={{ uri: branding.logoUrl }} style={s.footerBrandImg} resizeMode="contain" />
                ) : (
                  <View style={[s.footerBrandBox, { backgroundColor: accent }]}><Text style={[s.footerBrandText, { color: primaryDark }]}>{schoolShort}</Text></View>
                )}
                <Text style={s.footerBrandName}>{schoolName}</Text>
              </View>
              <Text style={s.footerAbout}>
                {branding.aboutText ? branding.aboutText.substring(0, 200) + '...' : `A school dedicated to quality education and discipline. "${motto || 'Excellence in Education'}"`}
              </Text>
            </View>
            <View style={[s.footerCol, IS_NARROW && { minWidth: 140 }]}>
              <Text style={[s.footerColTitle, { color: accent }]}>Quick Links</Text>
              <TouchableOpacity onPress={() => scrollViewRef.current?.scrollTo?.({ y: 0, animated: true })}><Text style={s.footerLink}>Home</Text></TouchableOpacity>
              <TouchableOpacity onPress={scrollToAbout}><Text style={s.footerLink}>About Us</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => openPortal('apply')}><Text style={s.footerLink}>Admissions</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => openPortal('signin')}><Text style={s.footerLink}>Staff Login</Text></TouchableOpacity>
            </View>
            <View style={[s.footerCol, IS_NARROW && { minWidth: 140 }]}>
              <Text style={[s.footerColTitle, { color: accent }]}>Contact Us</Text>
              {branding.address && <View style={s.footerContactRow}><Text style={s.footerContactIcon}>📍</Text><Text style={s.footerContactText}>{branding.address}</Text></View>}
              {branding.phone && <View style={s.footerContactRow}><Text style={s.footerContactIcon}>📞</Text><Text style={s.footerContactText}>{branding.phone}</Text></View>}
              {branding.email && <View style={s.footerContactRow}><Text style={s.footerContactIcon}>✉</Text><Text style={s.footerContactText}>{branding.email}</Text></View>}
              {branding.region && <View style={s.footerContactRow}><Text style={s.footerContactIcon}>🗺</Text><Text style={s.footerContactText}>{branding.region}{branding.district ? `, ${branding.district}` : ''}</Text></View>}
            </View>
            {(branding.facebookUrl || branding.instagramUrl || branding.twitterUrl) && (
              <View style={[s.footerCol, IS_NARROW && { minWidth: 140 }]}>
                <Text style={[s.footerColTitle, { color: accent }]}>Follow Us</Text>
                {branding.facebookUrl && <TouchableOpacity onPress={() => Linking.openURL(branding.facebookUrl!)}><Text style={s.footerLink}>Facebook</Text></TouchableOpacity>}
                {branding.instagramUrl && <TouchableOpacity onPress={() => Linking.openURL(branding.instagramUrl!)}><Text style={s.footerLink}>Instagram</Text></TouchableOpacity>}
                {branding.twitterUrl && <TouchableOpacity onPress={() => Linking.openURL(branding.twitterUrl!)}><Text style={s.footerLink}>Twitter</Text></TouchableOpacity>}
              </View>
            )}
          </View>
          <View style={s.footerBottom}>
            <Text style={s.footerCopyright}>© {new Date().getFullYear()} {schoolName} · Powered by SIMS Ghana · All rights reserved</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff', padding: 20 },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.md },
  // Home
  homeScreen: { flex: 1, backgroundColor: '#f0f4ff' },
  homeScroll: { flex: 1 },
  homeScrollContent: { flexGrow: 1 },
  // Header
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl + 8, paddingVertical: spacing.md,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any : {}),
    backgroundColor: 'rgba(255, 255, 255, 0.85)', borderBottomWidth: 1, borderBottomColor: 'rgba(15, 76, 117, 0.08)',
  },
  headerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  headerLogoBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', ...shadows.sm },
  headerLogoImg: { width: 44, height: 44, borderRadius: 12, ...shadows.sm },
  headerLogoText: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, color: colors.white, letterSpacing: 1.5 },
  headerSchoolName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
  headerSchoolSub: { fontSize: 10, color: colors.textSecondary, fontWeight: fontWeight.medium, letterSpacing: 0.5 },
  headerNav: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  headerNavLink: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, letterSpacing: 0.3 },
  headerCtaBtn: { borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg + 4, ...shadows.sm },
  headerCtaText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.white, letterSpacing: 0.5 },
  headerGhostBtn: { borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, borderWidth: 1.5, backgroundColor: 'rgba(15, 76, 117, 0.05)' },
  headerGhostText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, letterSpacing: 0.3 },
  // Hero
  hero: { position: 'relative', minHeight: 620, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  heroBgWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroContent: { zIndex: 2, alignItems: 'center', paddingHorizontal: spacing.xl, maxWidth: 720 },
  heroBadge: { backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 20, paddingHorizontal: spacing.md + 4, paddingVertical: spacing.xs + 2, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)' },
  heroBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.white, letterSpacing: 1 },
  heroTitle: { fontSize: 42, fontWeight: fontWeight.extrabold, color: colors.white, textAlign: 'center', lineHeight: 52, marginBottom: spacing.md },
  heroTitleAccent: { fontSize: 42, fontWeight: fontWeight.extrabold },
  heroSubtitle: { fontSize: fontSize.lg, color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center', lineHeight: fontSize.lg * 1.5, marginBottom: spacing.xl, maxWidth: 560 },
  heroBtnRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', justifyContent: 'center' },
  heroBtnPrimary: { borderRadius: radius.md + 2, paddingVertical: spacing.md, paddingHorizontal: spacing.xl + 4, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, ...shadows.lg },
  heroBtnPrimaryText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  heroBtnSecondary: { borderRadius: radius.md + 2, paddingVertical: spacing.md, paddingHorizontal: spacing.xl + 4, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.6)', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  heroBtnSecondaryText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white, letterSpacing: 0.3 },
  heroDots: { position: 'absolute', bottom: 24, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8, zIndex: 3 },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  // Section
  section: { paddingVertical: spacing.xxl + 16, paddingHorizontal: spacing.xl + 8 },
  sectionNarrow: { maxWidth: 1100, alignSelf: 'center', width: '100%' },
  sectionTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, textAlign: 'center', marginBottom: spacing.xs },
  sectionTitleAccent: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold },
  sectionSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, maxWidth: 560, alignSelf: 'center', lineHeight: fontSize.md * 1.6 },
  // About
  aboutBg: { backgroundColor: '#ffffff' },
  aboutGrid: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg, flexWrap: 'wrap', justifyContent: 'center' },
  aboutCard: { flex: 1, minWidth: 280, maxWidth: 340, backgroundColor: 'rgba(240, 244, 255, 0.8)', borderRadius: radius.lg, padding: spacing.xl, borderWidth: 1, borderColor: 'rgba(15, 76, 117, 0.08)', ...shadows.sm },
  aboutCardIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255, 201, 60, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  aboutCardIcon: { fontSize: 24 },
  aboutCardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  aboutCardText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.6 },
  // Features
  featuresBg: { backgroundColor: '#f0f4ff' },
  featuresGrid: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg, flexWrap: 'wrap', justifyContent: 'center' },
  featureCard: { flex: 1, minWidth: 240, maxWidth: 300, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: radius.lg, padding: spacing.xl, borderWidth: 1, borderColor: 'rgba(15, 76, 117, 0.06)', ...shadows.md },
  featureIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(15, 76, 117, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  featureIcon: { fontSize: 22 },
  featureTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  featureText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.5 },
  // Gallery
  galleryCarouselWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  galleryFramesRow: { flexDirection: 'row', flex: 1, gap: spacing.md, justifyContent: 'center' },
  galleryFrame: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', ...shadows.lg, backgroundColor: '#fff' },
  galleryFrameImgWrap: { width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  galleryFrameImg: { width: '100%', height: '100%' },
  galleryFrameLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  galleryFrameOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  galleryFrameNum: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5 },
  galleryNavBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...shadows.md },
  galleryNavBtnDisabled: { opacity: 0.4 },
  galleryNavBtnText: { fontSize: 28, fontWeight: fontWeight.bold, lineHeight: 30 },
  galleryDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: spacing.lg },
  galleryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(15, 76, 117, 0.2)' },
  // Lightbox
  lightboxOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.92)', justifyContent: 'center', alignItems: 'center' },
  lightboxClose: { position: 'absolute', top: 40, right: 24, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' },
  lightboxCloseText: { fontSize: 20, color: '#fff', fontWeight: fontWeight.bold },
  lightboxImageWrap: { width: Dimensions.get('window').width, height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center' },
  lightboxImage: { width: '92%', height: '80%' },
  lightboxNavLeft: { position: 'absolute', left: 16, top: '50%', marginTop: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  lightboxNavRight: { position: 'absolute', right: 16, top: '50%', marginTop: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  lightboxNavText: { fontSize: 32, color: '#fff', fontWeight: fontWeight.bold, lineHeight: 34 },
  lightboxCounter: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  lightboxCounterText: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: fontWeight.semibold },
  // Stats band
  statsBand: { paddingVertical: spacing.xl + 8, paddingHorizontal: spacing.xl + 8 },
  statsBandGrid: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxl, flexWrap: 'wrap' },
  statsBandItem: { alignItems: 'center' },
  statsBandValue: { fontSize: 36, fontWeight: fontWeight.extrabold },
  statsBandLabel: { fontSize: fontSize.sm, color: 'rgba(255, 255, 255, 0.7)', marginTop: 4, letterSpacing: 0.5 },
  // CTA
  ctaSection: { paddingVertical: spacing.xxl + 20, paddingHorizontal: spacing.xl + 8, alignItems: 'center', backgroundColor: '#ffffff' },
  ctaTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, textAlign: 'center', marginBottom: spacing.sm },
  ctaText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, maxWidth: 480 },
  // Footer
  footer: { paddingVertical: spacing.xl + 8, paddingHorizontal: spacing.xl + 8 },
  footerGrid: { flexDirection: 'row', gap: spacing.xl, flexWrap: 'wrap', maxWidth: 1100, alignSelf: 'center' },
  footerCol: { flex: 1, minWidth: 200 },
  footerColWide: { flex: 1.5, minWidth: 280 },
  footerBrandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, marginBottom: spacing.md },
  footerBrandBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  footerBrandImg: { width: 40, height: 40, borderRadius: 10 },
  footerBrandText: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, letterSpacing: 1 },
  footerBrandName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.white },
  footerAbout: { fontSize: fontSize.sm, color: 'rgba(255, 255, 255, 0.6)', lineHeight: fontSize.sm * 1.6 },
  footerColTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginBottom: spacing.md, letterSpacing: 0.5 },
  footerLink: { fontSize: fontSize.sm, color: 'rgba(255, 255, 255, 0.6)', marginBottom: spacing.sm + 2 },
  footerContactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm + 2 },
  footerContactIcon: { fontSize: fontSize.sm, opacity: 0.7 },
  footerContactText: { fontSize: fontSize.sm, color: 'rgba(255, 255, 255, 0.6)' },
  footerBottom: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)', marginTop: spacing.xl, paddingTop: spacing.lg, alignItems: 'center' },
  footerCopyright: { fontSize: fontSize.xs, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: 0.3 },
  // Offline badge
  offlineBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  offlineBadgeText: { fontSize: 10, fontWeight: fontWeight.bold, color: '#ef4444' },
  // Staff photos
  staffPhoto: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center' },
  staffPhotoPlaceholder: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
  staffPhotoInitial: { fontSize: 28, fontWeight: fontWeight.bold },
  // Events
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg, backgroundColor: 'rgba(240, 244, 255, 0.6)', borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(15, 76, 117, 0.06)' },
  eventDateBadge: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  eventDateDay: { fontSize: 22, fontWeight: fontWeight.extrabold, color: colors.white },
  eventDateMonth: { fontSize: 10, fontWeight: fontWeight.bold, color: 'rgba(255, 255, 255, 0.8)', letterSpacing: 1 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: 4 },
  eventDescription: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.5, marginBottom: spacing.xs },
  eventTypeBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  eventTypeText: { fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5 },
  // Testimonials
  testimonialStars: { fontSize: 16, color: '#FFC93C', marginBottom: spacing.sm, letterSpacing: 2 },
  testimonialAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  testimonialAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  testimonialAvatarText: { fontSize: 16, fontWeight: fontWeight.bold },
});
