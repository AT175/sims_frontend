import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  useWindowDimensions,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '@store/authStore';
import { useRegistryStore } from '@store/registryStore';
import type { Programme, PaymentMethod } from '@store/registryStore';
import { PROGRAMMES } from '@store/registryStore';
import { apiClient, SchoolBranding } from '@shared/api/apiClient';
import { colors, spacing, fontSize } from '@theme/index';
import { getCachedBranding, cacheBranding } from '@shared/db/indexedDBAdapter';
import { useConnectionStatus } from '@shared/hooks/useConnectionStatus';
import { loginStyles as s } from './loginStyles';
import { SCHOOL_LEVEL_LABELS } from '@shared/types';

type Tab = 'signin' | 'apply' | 'status';
type AdmissionStep = 'search' | 'payment' | 'form' | 'submitted';
type StatusStep = 'lookup' | 'result';

const DEFAULT_HERO_SLIDES = [
  { image: '/b1.jpg', caption: 'Welcome to our school' },
  { image: '/b3.jpeg', caption: 'Quality Education & Discipline' },
  { image: '/b4.jpeg', caption: 'A Center for Excellence' },
  { image: '/b5.jpeg', caption: 'Building Future Leaders' },
  { image: '/b6.jpeg', caption: 'Serving Our Community' },
  { image: '/b7.jpeg', caption: 'Our Campus' },
];

const DEFAULT_INFO_SLIDES = [
  { image: '/slide1.jpg', title: 'Quality Education', text: 'Dedicated to training learners to high education standards through collaborative stakeholder efforts.', accent: colors.primaryLight },
  { image: '/slide2.jpg', title: 'Discipline & Character', text: 'Instilling moral integrity and discipline in every student, creating responsible citizens.', accent: colors.accent },
  { image: '/slide3.jpg', title: 'Our Programmes', text: 'A range of programmes designed to prepare students for the future.', accent: colors.success },
  { image: '/slide4.jpg', title: 'Our Region', text: 'Serving the community with accessible secondary education.', accent: colors.info },
  { image: '/slide5.jpg', title: 'Our Community', text: 'A growing school community of students, teachers, and stakeholders working together for excellence.', accent: colors.purple },
];

export function LoginScreen({ presetTenantKey, onBack, presetTab }: { presetTenantKey?: string; onBack?: () => void; presetTab?: Tab }) {
  const { login, loginTemp, isLoading, error, clearError } = useAuthStore();
  const registryStore = useRegistryStore();
  const { width: windowWidth } = useWindowDimensions();
  const IS_NARROW = windowWidth < 768;
  const IS_VERY_NARROW = windowWidth < 480;
  const { isOnline: _isOnline } = useConnectionStatus();
  void _isOnline;

  const [branding, setBranding] = useState<SchoolBranding | null>(null);
  const [, setBrandingLoading] = useState(true);

  const [view, setView] = useState<'home' | 'portal'>(presetTenantKey ? 'portal' : 'home');
  const [activeTab, setActiveTab] = useState<Tab>(presetTab || 'signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Brute force protection
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutMsg, setLockoutMsg] = useState('');
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 60_000; // 1 minute

  const openPortal = (tab: Tab) => { setView('portal'); setActiveTab(tab); clearError(); };
  const goHome = () => { if (onBack) { onBack(); } else { setView('home'); } };

  // ── Fetch tenant branding ──
  useEffect(() => {
    if (!presetTenantKey) { setBrandingLoading(false); return; }
    let cancelled = false;
    (async () => {
      setBrandingLoading(true);
      try {
        const cached = await getCachedBranding(presetTenantKey);
        if (cached && !cancelled) { setBranding(cached); setBrandingLoading(false); }
      } catch { /* cache read failed */ }
      try {
        const data = await apiClient.getPublicBranding(presetTenantKey);
        if (!cancelled) { setBranding(data); cacheBranding(presetTenantKey, data).catch(() => {}); }
      } catch { /* API fetch failed */ }
      if (!cancelled) setBrandingLoading(false);
    })();
    return () => { cancelled = true; };
  }, [presetTenantKey]);

  // ── Derived branding values ──
  const schoolName = branding?.schoolName || 'School';
  const schoolShort = schoolName.split(' ').map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  const motto = branding?.motto || '';
  const _primary = branding?.primaryColor || colors.primary;
  void _primary;
  const aboutText = branding?.aboutText || '';
  const mission = branding?.mission || '';
  const vision = branding?.vision || '';
  const phone = branding?.phone || '';
  const email = branding?.email || '';
  const address = branding?.address || '';
  const region = branding?.region || '';
  const _facebookUrl = branding?.facebookUrl || '';
  const _instagramUrl = branding?.instagramUrl || '';
  void _facebookUrl; void _instagramUrl;
  const tenantProgrammes = branding?.programmes || [];

  const heroSlides = (branding?.galleryImages && branding.galleryImages.length > 0)
    ? branding.galleryImages.slice(0, 6).map((img, i) => ({
        image: img,
        caption: i === 0 ? (motto || `Welcome to ${schoolName}`) : ['Quality Education & Discipline', 'A Center for Excellence', 'Building Future Leaders', 'Serving Our Community', 'Our Campus'][i - 1] || 'Our Campus',
      }))
    : branding?.bannerImage
      ? [{ image: branding.bannerImage, caption: motto || `Welcome to ${schoolName}` }, ...DEFAULT_HERO_SLIDES.slice(1)]
      : DEFAULT_HERO_SLIDES;

  const infoSlides = DEFAULT_INFO_SLIDES.map((slide, i) => ({
    ...slide,
    text: i === 0 && mission ? mission : i === 1 && vision ? vision : i === 2 && tenantProgrammes.length > 0 ? `${tenantProgrammes.map(p => p.name).join(', ')} programmes designed to prepare students for the future.` : slide.text,
    title: i === 3 && region ? `${region} Region` : slide.title,
  }));

  const quickStats = [
    { label: 'Programmes', value: String(tenantProgrammes.length || '6') },
    { label: 'Region', value: region || '—' },
    { label: 'Type', value: 'Public' },
    { label: 'Motto', value: motto ? motto.split(' ').slice(0, 2).join(' ') : '—' },
  ];

  const heroSlidesRef = useRef(6);
  heroSlidesRef.current = heroSlides.length;

  const scrollViewRef = useRef<any>(null);
  const aboutY = useRef(0);
  const scrollToAbout = () => {
    setView('home');
    setTimeout(() => scrollViewRef.current?.scrollTo?.({ y: aboutY.current, animated: true }), 100);
  };

  // Admission
  const [admissionStep, setAdmissionStep] = useState<AdmissionStep>('search');
  const [wardName, setWardName] = useState('');
  const [placementRef, setPlacementRef] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState<Programme>('General Science');
  const [matchedPlacement, setMatchedPlacement] = useState<any>(null);
  const [admissionLoading, setAdmissionLoading] = useState(false);

  // Level-aware admission fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [previousClass, setPreviousClass] = useState('');
  const [appliedClassLevel, setAppliedClassLevel] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [mmNumber, setMmNumber] = useState('');
  const [mmRef, setMmRef] = useState('');
  const [scratchPin, setScratchPin] = useState('');
  const [scratchSerial, setScratchSerial] = useState('');

  // Status
  const [statusStep, setStatusStep] = useState<StatusStep>('lookup');
  const [statusName, setStatusName] = useState('');
  const [statusRef, setStatusRef] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);

  // Carousel
  const [slideIndex, setSlideIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const tabAnim = useRef(new Animated.Value(1)).current;

  // Hero flash animation carousel
  const [heroSlide, setHeroSlide] = useState(0);
  const heroFade = useRef(new Animated.Value(1)).current;
  const heroScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.ease }),
        Animated.timing(slideAnim, { toValue: -15, duration: 400, useNativeDriver: true, easing: Easing.ease }),
      ]).start(() => {
        setSlideIndex((prev) => (prev + 1) % infoSlides.length);
        slideAnim.setValue(15);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        ]).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim]);

  // Hero flash animation - crossfade + Ken Burns zoom
  useEffect(() => {
    if (view !== 'home') return;
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
  }, [heroFade, heroScale, view]);

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    Animated.timing(tabAnim, { toValue: 0, duration: 150, useNativeDriver: true, easing: Easing.in(Easing.ease) }).start(() => {
      setActiveTab(tab);
      clearError();
      Animated.timing(tabAnim, { toValue: 1, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start();
    });
  };

  // ── Handlers ──
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { Alert.alert('Error', 'Please enter your username and password'); return; }

    // Brute force protection: check lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      Alert.alert('Account Locked', `Too many failed attempts. Please wait ${remaining}s before trying again.`);
      return;
    }
    // Reset lockout if expired
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setLockoutUntil(null);
      setLockoutMsg('');
      setLoginAttempts(0);
    }

    const u = username.trim(), p = password.trim();
    if (u.startsWith('VOTER_')) {
      try { await loginTemp(u, p); return; } catch { /* fall through */ }
    }
    try {
      await login(u, p);
      setLoginAttempts(0);
    } catch {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);
      if (nextAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(until);
        setLockoutMsg(`Too many failed attempts. Account locked for 60 seconds.`);
        Alert.alert('Account Locked', lockoutMsg || `Too many failed attempts. Account locked for 60 seconds.`);
      } else {
        const remaining = MAX_ATTEMPTS - nextAttempts;
        Alert.alert('Login Failed', `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`);
      }
    }
  };

  const handleAdmissionSearch = () => {
    if (!wardName.trim()) { Alert.alert('Error', "Please enter your ward's name"); return; }
    const placement = registryStore.searchPlacement(wardName.trim());
    if (placement) { setMatchedPlacement(placement); setPlacementRef(placement.csspsRef); setSelectedProgramme(placement.programme); }
    else { setMatchedPlacement(null); }
    setAdmissionStep('payment');
  };

  const handleDirectApplication = () => {
    if (!wardName.trim()) { Alert.alert('Error', "Please enter your ward's name"); return; }
    setMatchedPlacement(null);
    setPlacementRef('');
    setAdmissionStep('payment');
  };

  const handlePaymentSubmit = () => {
    if (!paymentMethod) { Alert.alert('Error', 'Please select a payment method'); return; }
    if (paymentMethod === 'Mobile Money') {
      if (!mmNumber.trim() || !mmRef.trim()) { Alert.alert('Error', 'Please enter your mobile money number and transaction reference'); return; }
      setAdmissionStep('form');
    } else {
      if (!scratchPin.trim() || !scratchSerial.trim()) { Alert.alert('Error', 'Please enter the scratch card PIN and serial number'); return; }
      const card = registryStore.validateScratchCard(scratchPin.trim(), scratchSerial.trim(), wardName.trim());
      if (!card) { Alert.alert('Error', 'Invalid or already used scratch card.'); return; }
      setMmRef(card.serial);
      setAdmissionStep('form');
    }
  };

  const handleAdmissionSubmit = async () => {
    if (!parentName.trim() || !parentPhone.trim()) { Alert.alert('Error', 'Parent name and phone are required'); return; }
    setAdmissionLoading(true);
    try {
      await apiClient.post('/admissions/apply', {
        applicantName: wardName.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim() || undefined,
        csspsPlacementRef: placementRef.trim() || undefined,
        programme: selectedProgramme,
        appliedClassLevel: appliedClassLevel.trim() || undefined,
        previousSchool: previousSchool.trim() || undefined,
        previousClass: previousClass.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        gender: gender.trim() || undefined,
        isDirectApplication: !placementRef.trim(),
      });
      setAdmissionLoading(false);
      setAdmissionStep('submitted');
    } catch (err: any) {
      setAdmissionLoading(false);
      Alert.alert('Error', err.message || 'Failed to submit application. Please try again.');
    }
  };

  const [statusLookupMethod, setStatusLookupMethod] = useState<'cssps' | 'phone'>('cssps');
  const [statusPhone, setStatusPhone] = useState('');

  const handleStatusCheck = async () => {
    if (!statusName.trim()) { Alert.alert('Error', 'Please enter applicant name'); return; }
    try {
      let result: any;
      if (statusLookupMethod === 'cssps') {
        if (!statusRef.trim()) { Alert.alert('Error', 'Please enter CSSPS reference'); return; }
        result = await apiClient.post<any>('/admissions/check-status', {
          applicantName: statusName.trim(),
          csspsPlacementRef: statusRef.trim(),
        });
      } else {
        if (!statusPhone.trim()) { Alert.alert('Error', 'Please enter parent phone number'); return; }
        result = await apiClient.post<any>('/admissions/check-status-by-phone', {
          applicantName: statusName.trim(),
          parentPhone: statusPhone.trim(),
        });
      }
      setStatusResult(result);
      setStatusStep('result');
    } catch (err: any) {
      Alert.alert('Not Found', err.message || 'No application found with the provided details.');
    }
  };

  const resetAdmission = () => {
    setAdmissionStep('search'); setWardName(''); setPlacementRef(''); setParentName('');
    setParentPhone(''); setParentEmail(''); setSelectedProgramme('General Science'); setMatchedPlacement(null);
    setPaymentMethod(null); setMmNumber(''); setMmRef(''); setScratchPin(''); setScratchSerial('');
    setDateOfBirth(''); setGender(''); setPreviousSchool(''); setPreviousClass(''); setAppliedClassLevel('');
  };

  const resetStatus = () => { setStatusStep('lookup'); setStatusName(''); setStatusRef(''); setStatusPhone(''); setStatusResult(null); };

  // ── Render ──
  return (
    <View style={s.homeScreen}>
      {view === 'home' ? (
        <ScrollView ref={scrollViewRef} style={s.homeScroll} contentContainerStyle={s.homeScrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[s.header, IS_NARROW && { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 }]}>
            <TouchableOpacity style={s.headerLogoRow} onPress={goHome}>
              <View style={s.headerLogoBox}><Text style={s.headerLogoText}>{schoolShort}</Text></View>
              {!IS_VERY_NARROW && <View><Text style={s.headerSchoolName}>{schoolName}</Text><Text style={s.headerSchoolSub}>{motto}</Text></View>}
            </TouchableOpacity>
            <View style={[s.headerNav, IS_NARROW && { gap: spacing.sm }]}>
              {!IS_NARROW && <>
                <TouchableOpacity onPress={goHome}><Text style={s.headerNavLink}>Home</Text></TouchableOpacity>
                <TouchableOpacity onPress={scrollToAbout}><Text style={s.headerNavLink}>About Us</Text></TouchableOpacity>
              </>}
              <TouchableOpacity style={[s.headerGhostBtn, IS_NARROW && { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]} onPress={() => openPortal('signin')}><Text style={s.headerGhostText}>Login</Text></TouchableOpacity>
              <TouchableOpacity style={[s.headerCtaBtn, IS_NARROW && { paddingVertical: spacing.sm, paddingHorizontal: spacing.md + 4 }]} onPress={() => openPortal('apply')}><Text style={s.headerCtaText}>Apply</Text></TouchableOpacity>
            </View>
          </View>

          {/* Hero with flash animation carousel */}
          <View style={[s.hero, IS_NARROW && { minHeight: 500 }]}>
            <View style={s.heroBg} pointerEvents="none">
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
            </View>
            <View style={s.heroOverlay} pointerEvents="none" />
            <View style={[s.heroContent, IS_NARROW && { paddingHorizontal: spacing.md, width: '100%' }]}>
              <View style={s.heroBadge}><Text style={s.heroBadgeText}>★ {schoolName.toUpperCase()}</Text></View>
              <Text style={[s.heroTitle, IS_NARROW && { fontSize: 30, lineHeight: 38 }]}>Welcome to{'\n'}<Text style={s.heroTitleAccent}>{schoolName}</Text></Text>
              <Text style={[s.heroSubtitle, IS_NARROW && { fontSize: fontSize.md, lineHeight: fontSize.md * 1.5 }]}>{aboutText ? aboutText.slice(0, 180) + (aboutText.length > 180 ? '...' : '') : 'A center for quality education and discipline.'}</Text>
              <View style={s.heroBtnRow}>
                <TouchableOpacity style={[s.heroBtnPrimary, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('apply')} activeOpacity={0.85}>
                  <Text style={[s.heroBtnPrimaryText, IS_NARROW && { fontSize: fontSize.sm }]}>Apply for Admission</Text>
                  <Text style={[s.heroBtnPrimaryText, IS_NARROW && { fontSize: fontSize.sm }]}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.heroBtnSecondary, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('signin')} activeOpacity={0.85}>
                  <Text style={[s.heroBtnSecondaryText, IS_NARROW && { fontSize: fontSize.sm }]}>Staff / Student Login</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Hero dots indicator */}
            <View style={s.heroDots}>
              {heroSlides.map((_, i) => (
                <View key={i} style={[s.heroDot, i === heroSlide && s.heroDotActive]} />
              ))}
            </View>
          </View>

          {/* About Section */}
          <View style={[s.section, s.aboutBg, IS_NARROW && { paddingVertical: spacing.xl + 8, paddingHorizontal: spacing.md }]} onLayout={(e) => { aboutY.current = e.nativeEvent.layout.y; }}>
            <View style={s.sectionNarrow}>
              <Text style={s.sectionTitle}>About <Text style={s.sectionTitleAccent}>Our School</Text></Text>
              <Text style={s.sectionSubtitle}>{aboutText || 'Welcome to our school.'}</Text>
              <View style={s.aboutGrid}>
                <View style={[s.aboutCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                  <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🎯</Text></View>
                  <Text style={s.aboutCardTitle}>Our Mission</Text>
                  <Text style={s.aboutCardText}>{mission || 'To train learners to high levels of education standards through the collaborative effort of all relevant stakeholders.'}</Text>
                </View>
                <View style={[s.aboutCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                  <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🌟</Text></View>
                  <Text style={s.aboutCardTitle}>Our Vision</Text>
                  <Text style={s.aboutCardText}>{vision || 'A center for quality education and discipline.'}</Text>
                </View>
                <View style={[s.aboutCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                  <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🤝</Text></View>
                  <Text style={s.aboutCardTitle}>Our Motto</Text>
                  <Text style={s.aboutCardText}>{motto ? `"${motto}"` : 'Our school motto reflects our commitment to excellence and discipline.'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Features Section */}
          <View style={[s.section, s.featuresBg, IS_NARROW && { paddingVertical: spacing.xl + 8, paddingHorizontal: spacing.md }]}>
            <View style={s.sectionNarrow}>
              <Text style={s.sectionTitle}>Why Choose <Text style={s.sectionTitleAccent}>{schoolShort}?</Text></Text>
              <Text style={s.sectionSubtitle}>{vision || 'A center for quality education and discipline.'}</Text>
              <View style={s.featuresGrid}>
                {tenantProgrammes.length > 0 ? tenantProgrammes.map((p) => (
                  <View key={p.name} style={[s.featureCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                    <View style={s.featureIconWrap}><Text style={s.featureIcon}>{p.icon}</Text></View>
                    <Text style={s.featureTitle}>{p.name}</Text>
                    <Text style={s.featureText}>{p.description}</Text>
                  </View>
                )) : (
                  <View style={[s.featureCard, IS_NARROW && { flexBasis: '100%', maxWidth: '100%', padding: spacing.lg }]}>
                    <View style={s.featureIconWrap}><Text style={s.featureIcon}>📚</Text></View>
                    <Text style={s.featureTitle}>Quality Education</Text>
                    <Text style={s.featureText}>Dedicated teachers committed to training learners to high education standards.</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Stats Band */}
          <View style={[s.statsBand, IS_NARROW && { paddingHorizontal: spacing.md }]}>
            <View style={[s.statsBandGrid, IS_NARROW && { gap: spacing.lg }]}>
              {quickStats.map((st) => (
                <View key={st.label} style={s.statsBandItem}>
                  <Text style={[s.statsBandValue, IS_NARROW && { fontSize: 28 }]}>{st.value}</Text>
                  <Text style={s.statsBandLabel}>{st.label.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <View style={[s.ctaSection, IS_NARROW && { paddingVertical: spacing.xl + 8, paddingHorizontal: spacing.md }]}>
            <Text style={s.ctaTitle}>Ready to Join Our Community?</Text>
            <Text style={s.ctaText}>Apply for admission today or check your application status. Our admissions team is here to help you every step of the way.</Text>
            <View style={s.heroBtnRow}>
              <TouchableOpacity style={[s.heroBtnPrimary, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('apply')} activeOpacity={0.85}>
                <Text style={[s.heroBtnPrimaryText, IS_NARROW && { fontSize: fontSize.sm }]}>Apply Now</Text>
                <Text style={[s.heroBtnPrimaryText, IS_NARROW && { fontSize: fontSize.sm }]}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.heroBtnSecondary, IS_NARROW && { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]} onPress={() => openPortal('status')} activeOpacity={0.85}>
                <Text style={[s.heroBtnSecondaryText, IS_NARROW && { fontSize: fontSize.sm }]}>Check Status</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={[s.footer, IS_NARROW && { paddingHorizontal: spacing.md }]}>
            <View style={s.footerGrid}>
              <View style={[s.footerColWide, IS_NARROW && { minWidth: 200 }]}>
                <View style={s.footerBrandRow}>
                  <View style={s.footerBrandBox}><Text style={s.footerBrandText}>{schoolShort}</Text></View>
                  <Text style={s.footerBrandName}>{schoolName}</Text>
                </View>
                <Text style={s.footerAbout}>{aboutText || `${schoolName} — ${motto || 'Excellence in education.'}`}</Text>
              </View>
              <View style={[s.footerCol, IS_NARROW && { minWidth: 140 }]}>
                <Text style={s.footerColTitle}>Quick Links</Text>
                <TouchableOpacity onPress={goHome}><Text style={s.footerLink}>Home</Text></TouchableOpacity>
                <TouchableOpacity onPress={scrollToAbout}><Text style={s.footerLink}>About Us</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => openPortal('apply')}><Text style={s.footerLink}>Apply for Admission</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => openPortal('status')}><Text style={s.footerLink}>Check Status</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => openPortal('signin')}><Text style={s.footerLink}>Staff Login</Text></TouchableOpacity>
              </View>
              <View style={[s.footerCol, IS_NARROW && { minWidth: 140 }]}>
                <Text style={s.footerColTitle}>Programmes</Text>
                {tenantProgrammes.length > 0 ? tenantProgrammes.map((p) => (
                  <Text key={p.name} style={s.footerLink}>{p.name}</Text>
                )) : <Text style={s.footerLink}>Programmes available</Text>}
              </View>
              <View style={[s.footerCol, IS_NARROW && { minWidth: 140 }]}>
                <Text style={s.footerColTitle}>Contact Us</Text>
                <View style={s.footerContactRow}><Text style={s.footerContactIcon}>📍</Text><Text style={s.footerContactText}>{address || 'Contact school for address'}</Text></View>
                {phone ? <View style={s.footerContactRow}><Text style={s.footerContactIcon}>📞</Text><Text style={s.footerContactText}>{phone}</Text></View> : null}
                {email ? <View style={s.footerContactRow}><Text style={s.footerContactIcon}>✉</Text><Text style={s.footerContactText}>{email}</Text></View> : null}
              </View>
            </View>
            <View style={s.footerBottom}>
              <Text style={s.footerCopyright}>© 2026 {schoolName} · SIMS v0.1.0 · All rights reserved</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={s.portalOverlay}>
          <View style={s.portalCloseBar}>
            <TouchableOpacity style={s.portalCloseLogo} onPress={goHome}>
              <View style={s.portalCloseLogoBox}><Text style={s.portalCloseLogoText}>{schoolShort}</Text></View>
              {!IS_VERY_NARROW && <Text style={s.portalCloseSchool}>{schoolShort === 'SCHL' ? 'School' : schoolName.split(' ').slice(0, 2).join(' ')}</Text>}
            </TouchableOpacity>
            <View style={s.portalCloseBtnRow}>
              {!IS_VERY_NARROW && (
                <>
                  <TouchableOpacity onPress={() => { setActiveTab('signin'); clearError(); }} style={[s.portalCloseBtn, activeTab === 'signin' && { backgroundColor: 'rgba(255,201,60,0.15)' }]}>
                    <Text style={[s.portalCloseText, activeTab === 'signin' && { color: colors.accent }]}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setActiveTab('apply'); clearError(); }} style={[s.portalCloseBtn, activeTab === 'apply' && { backgroundColor: 'rgba(255,201,60,0.15)' }]}>
                    <Text style={[s.portalCloseText, activeTab === 'apply' && { color: colors.accent }]}>Apply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setActiveTab('status'); clearError(); }} style={[s.portalCloseBtn, activeTab === 'status' && { backgroundColor: 'rgba(255,201,60,0.15)' }]}>
                    <Text style={[s.portalCloseText, activeTab === 'status' && { color: colors.accent }]}>Status</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={s.portalCloseBtn} onPress={goHome}>
                <Text style={s.portalCloseText}>← Home</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.portalBody}>
            <View style={[s.splitContainer, IS_NARROW && { flexDirection: 'column' }]}>
        {!IS_NARROW && (
          <View style={s.brandPanel}>
            <View style={s.brandBgImage} pointerEvents="none">
            <Image source={{ uri: '/banner3.png' }} style={s.brandBgImage} resizeMode="cover" />
          </View>
            <View style={s.brandOverlay} pointerEvents="none" />
            <View style={s.brandContent}>
              <View style={s.brandLogoSection}>
                <View style={s.logoRing}><View style={s.logoInner}><Text style={s.logoText}>{schoolShort}</Text></View></View>
                <Text style={s.brandTitle}>{schoolName}</Text>
                <Text style={s.brandTagline}>{motto || 'Excellence in education'}</Text>
              </View>
              <View style={s.carouselContainer}>
                <Animated.View style={[s.carouselSlide, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                  <Image source={{ uri: infoSlides[slideIndex].image }} style={s.carouselImage} resizeMode="cover" />
                  <View style={s.carouselImageOverlay} />
                  <View style={s.carouselTextWrap}>
                    <View style={[s.carouselAccentBar, { backgroundColor: infoSlides[slideIndex].accent }]} />
                    <Text style={s.carouselTitle}>{infoSlides[slideIndex].title}</Text>
                    <Text style={s.carouselText}>{infoSlides[slideIndex].text}</Text>
                  </View>
                </Animated.View>
                <View style={s.carouselDots}>
                  {infoSlides.map((_, i) => (
                    <View key={i} style={[s.carouselDot, i === slideIndex && s.carouselDotActive, i === slideIndex && { backgroundColor: infoSlides[slideIndex].accent }]} />
                  ))}
                </View>
              </View>
              <View style={s.statsRow}>
                {quickStats.map((st) => (
                  <View key={st.label} style={s.statItem}>
                    <Text style={s.statValue}>{st.value}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        <View style={[s.formPanel, IS_NARROW && { flex: 1 }]}>
          <View style={s.formPanelBg} pointerEvents="none">
            <Image source={{ uri: '/bg6.jpg' }} style={s.formPanelBg} resizeMode="cover" />
          </View>
          <View style={s.formPanelBgOverlay} pointerEvents="none" />
          <View style={s.formPanelInner}>
            {!IS_NARROW && (
              <View style={s.formHeader}>
                <Text style={s.formWelcome}>{activeTab === 'signin' ? 'Welcome Back' : activeTab === 'apply' ? 'Admission Application' : 'Check Application Status'}</Text>
                <Text style={s.formWelcomeSub}>{activeTab === 'signin' ? 'Sign in to your account' : activeTab === 'apply' ? `Apply for admission to ${schoolName}` : 'Enter your details to check your status'}</Text>
              </View>
            )}
            {/* Direct form view - no tabs, each button links directly */}
            <Animated.View style={[s.formContent, { opacity: tabAnim, transform: [{ translateY: tabAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]} pointerEvents="auto">
              <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'signin' && (
                  <View>
                    {error && (
                      <View style={s.errorBox}>
                        <View style={s.errorIconWrap}><Text style={s.errorIcon}>!</Text></View>
                        <Text style={s.errorText}>{error}</Text>
                        <TouchableOpacity onPress={clearError} style={s.errorDismissBtn}><Text style={s.errorDismiss}>✕</Text></TouchableOpacity>
                      </View>
                    )}
                    <View style={s.fieldGroup}>
                      <Text style={s.fieldLabel}>Username</Text>
                      <View style={s.inputContainer}>
                        <Text style={s.inputIcon}>👤</Text>
                        <TextInput style={s.textInput} placeholder="Staff ID / Student ID / Username" placeholderTextColor={colors.textLight} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
                      </View>
                    </View>
                    <View style={s.fieldGroup}>
                      <Text style={s.fieldLabel}>Password</Text>
                      <View style={s.inputContainer}>
                        <Text style={s.inputIcon}>🔒</Text>
                        <TextInput style={s.textInput} placeholder="Enter your password" placeholderTextColor={colors.textLight} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.passwordToggle}>
                          <Text style={s.passwordToggleText}>{showPassword ? '🙈' : '👁'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={s.forgotRow}>
                      <TouchableOpacity><Text style={s.forgotText}>Forgot password?</Text></TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[s.primaryButton, isLoading && s.primaryButtonDisabled]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
                      {isLoading ? <ActivityIndicator color={colors.white} /> : (<><Text style={s.primaryButtonText}>Sign In</Text><Text style={s.primaryButtonArrow}>→</Text></>)}
                    </TouchableOpacity>
                    <View style={s.dividerRow}>
                      <View style={s.dividerLine} /><Text style={s.dividerText}>SECURE LOGIN</Text><View style={s.dividerLine} />
                    </View>
                    <View style={s.trustRow}>
                      <View style={s.trustItem}><Text style={s.trustIcon}>🔐</Text><Text style={s.trustText}>Encrypted</Text></View>
                      <View style={s.trustItem}><Text style={s.trustIcon}>✓</Text><Text style={s.trustText}>GDPR Compliant</Text></View>
                      <View style={s.trustItem}><Text style={s.trustIcon}>⚡</Text><Text style={s.trustText}>Fast Access</Text></View>
                    </View>
                  </View>
                )}
                {activeTab === 'apply' && (
                  <View>
                    {admissionStep !== 'submitted' && (
                      <View style={s.stepIndicatorRow}>
                        {['Search', 'Payment', 'Form'].map((label, i) => {
                          const order = ['search', 'payment', 'form']; const ci = order.indexOf(admissionStep);
                          const done = i < ci, cur = i === ci;
                          return (
                            <View key={label} style={s.stepIndicatorItem}>
                              <View style={[s.stepCircle, done && s.stepCircleComplete, cur && s.stepCircleCurrent]}>
                                <Text style={[s.stepCircleText, (done || cur) && s.stepCircleTextActive]}>{done ? '✓' : i + 1}</Text>
                              </View>
                              <Text style={[s.stepLabel, (done || cur) && s.stepLabelActive]}>{label}</Text>
                              {i < 2 && <View style={[s.stepConnector, done && s.stepConnectorComplete]} />}
                            </View>
                          );
                        })}
                      </View>
                    )}
                    {admissionStep === 'search' && (
                      <View>
                        <Text style={s.formSectionTitle}>Find Your Placement</Text>
                        <Text style={s.formSectionSub}>Enter your ward's details to begin the application</Text>
                        <View style={s.fieldGroup}>
                          <Text style={s.fieldLabel}>Ward's Full Name</Text>
                          <View style={s.inputContainer}><Text style={s.inputIcon}>👤</Text><TextInput style={s.textInput} placeholder="Enter ward's full name" placeholderTextColor={colors.textLight} value={wardName} onChangeText={setWardName} /></View>
                        </View>
                        <View style={s.fieldGroup}>
                          <Text style={s.fieldLabel}>CSSPS Placement Reference (optional)</Text>
                          <View style={s.inputContainer}><Text style={s.inputIcon}>📋</Text><TextInput style={s.textInput} placeholder="e.g. CSSPS/2026/0451" placeholderTextColor={colors.textLight} value={placementRef} onChangeText={setPlacementRef} autoCapitalize="none" /></View>
                        </View>
                        <Text style={s.privacyNotice}>By continuing, you consent to the school collecting and processing the information provided for admission purposes. Parental consent is required for applicants under 18.</Text>
                        <TouchableOpacity style={s.primaryButton} onPress={handleAdmissionSearch} activeOpacity={0.85}><Text style={s.primaryButtonText}>Search Placement</Text><Text style={s.primaryButtonArrow}>→</Text></TouchableOpacity>
                        <TouchableOpacity style={s.secondaryButton} onPress={handleDirectApplication} activeOpacity={0.85} pointerEvents="auto"><Text style={s.secondaryButtonText}>Apply Directly (No CSSPS)</Text></TouchableOpacity>
                        <TouchableOpacity style={s.backBtn} onPress={() => { resetAdmission(); switchTab('status'); }}><Text style={s.backBtnText}>Check Admission Status</Text></TouchableOpacity>
                      </View>
                    )}
                    {admissionStep === 'payment' && (
                      <View>
                        {matchedPlacement ? (
                          <View style={s.alertBoxSuccess}><View style={s.alertIconWrapSuccess}><Text style={s.alertIcon}>✓</Text></View><Text style={s.alertTextSuccess}>Placement found for "{wardName}". Programme: {matchedPlacement.programme}</Text></View>
                        ) : (
                          <View style={s.alertBoxWarning}><View style={s.alertIconWrapWarning}><Text style={s.alertIcon}>!</Text></View><Text style={s.alertTextWarning}>No placement found for "{wardName}". You can still apply — the school will verify.</Text></View>
                        )}
                        <Text style={s.formSectionTitle}>Application Fee Payment</Text>
                        <Text style={s.formSectionSub}>Fee: GH₵{registryStore.applicationFeeAmount}</Text>
                        <Text style={s.fieldLabel}>Select Payment Method</Text>
                        <View style={s.paymentMethodRow}>
                          <TouchableOpacity style={[s.paymentMethodCard, paymentMethod === 'Mobile Money' && s.paymentMethodActive]} onPress={() => setPaymentMethod('Mobile Money')} activeOpacity={0.85}><Text style={s.paymentMethodIcon}>📱</Text><Text style={s.paymentMethodLabel}>Mobile Money</Text></TouchableOpacity>
                          <TouchableOpacity style={[s.paymentMethodCard, paymentMethod === 'Scratch Card' && s.paymentMethodActive]} onPress={() => setPaymentMethod('Scratch Card')} activeOpacity={0.85}><Text style={s.paymentMethodIcon}>🎫</Text><Text style={s.paymentMethodLabel}>Scratch Card</Text></TouchableOpacity>
                        </View>
                        {paymentMethod === 'Mobile Money' && (
                          <View>
                            <View style={s.fieldGroup}><Text style={s.fieldLabel}>Mobile Money Number</Text><View style={s.inputContainer}><Text style={s.inputIcon}>📱</Text><TextInput style={s.textInput} placeholder="024-XXX-XXXX" placeholderTextColor={colors.textLight} value={mmNumber} onChangeText={setMmNumber} keyboardType="phone-pad" /></View></View>
                            <View style={s.fieldGroup}><Text style={s.fieldLabel}>Transaction Reference</Text><View style={s.inputContainer}><Text style={s.inputIcon}>#</Text><TextInput style={s.textInput} placeholder="Enter MM transaction ref" placeholderTextColor={colors.textLight} value={mmRef} onChangeText={setMmRef} autoCapitalize="none" /></View></View>
                          </View>
                        )}
                        {paymentMethod === 'Scratch Card' && (
                          <View>
                            <View style={s.fieldGroup}><Text style={s.fieldLabel}>Scratch Card Serial</Text><View style={s.inputContainer}><Text style={s.inputIcon}>🎫</Text><TextInput style={s.textInput} placeholder="e.g. SC-002" placeholderTextColor={colors.textLight} value={scratchSerial} onChangeText={setScratchSerial} autoCapitalize="none" /></View></View>
                            <View style={s.fieldGroup}><Text style={s.fieldLabel}>Scratch Card PIN</Text><View style={s.inputContainer}><Text style={s.inputIcon}>🔑</Text><TextInput style={s.textInput} placeholder="e.g. 2345-6789" placeholderTextColor={colors.textLight} value={scratchPin} onChangeText={setScratchPin} autoCapitalize="none" /></View></View>
                            <Text style={s.hintText}>Demo cards: SC-002 / 2345-6789, SC-003 / 3456-7890, SC-004 / 4567-8901</Text>
                          </View>
                        )}
                        <View style={s.stepNavRow}>
                          <TouchableOpacity style={s.backBtn} onPress={() => setAdmissionStep('search')}><Text style={s.backBtnText}>← Back</Text></TouchableOpacity>
                          <TouchableOpacity style={s.primaryButtonSmall} onPress={handlePaymentSubmit} activeOpacity={0.85}><Text style={s.primaryButtonText}>Pay & Continue</Text></TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {admissionStep === 'form' && (
                      <View>
                        <View style={s.alertBoxSuccess}><View style={s.alertIconWrapSuccess}><Text style={s.alertIcon}>✓</Text></View><Text style={s.alertTextSuccess}>Payment confirmed. Complete your application.</Text></View>
                        <Text style={s.formSectionTitle}>Application Form</Text>
                        {branding?.schoolLevel && branding.schoolLevel !== 'shs' && (
                          <View style={s.alertBoxWarning}><View style={s.alertIconWrapWarning}><Text style={s.alertIcon}>!</Text></View><Text style={s.alertTextWarning}>Applying for: {SCHOOL_LEVEL_LABELS[branding.schoolLevel as keyof typeof SCHOOL_LEVEL_LABELS] || branding.schoolLevel}</Text></View>
                        )}
                        {branding?.schoolLevel === 'shs' || !branding?.schoolLevel ? (
                          <>
                            <Text style={s.fieldLabel}>Programme</Text>
                            <View style={s.paymentMethodRow}>
                              {PROGRAMMES.map((p) => (
                                <TouchableOpacity key={p} style={[s.paymentMethodCard, selectedProgramme === p && s.paymentMethodActive]} onPress={() => setSelectedProgramme(p)} activeOpacity={0.85}><Text style={s.paymentMethodLabel}>{p}</Text></TouchableOpacity>
                              ))}
                            </View>
                          </>
                        ) : (
                          <>
                            <View style={s.fieldGroup}>
                              <Text style={s.fieldLabel}>Date of Birth</Text>
                              <View style={s.inputContainer}><Text style={s.inputIcon}>🎂</Text><TextInput style={s.textInput} placeholder="DD/MM/YYYY" placeholderTextColor={colors.textLight} value={dateOfBirth} onChangeText={setDateOfBirth} /></View>
                            </View>
                            <View style={s.fieldGroup}>
                              <Text style={s.fieldLabel}>Gender</Text>
                              <View style={s.paymentMethodRow}>
                                <TouchableOpacity style={[s.paymentMethodCard, gender === 'Male' && s.paymentMethodActive]} onPress={() => setGender('Male')} activeOpacity={0.85}><Text style={s.paymentMethodLabel}>Male</Text></TouchableOpacity>
                                <TouchableOpacity style={[s.paymentMethodCard, gender === 'Female' && s.paymentMethodActive]} onPress={() => setGender('Female')} activeOpacity={0.85}><Text style={s.paymentMethodLabel}>Female</Text></TouchableOpacity>
                              </View>
                            </View>
                            {branding?.offeredLevels && branding.offeredLevels.length > 0 && (
                              <View style={s.fieldGroup}>
                                <Text style={s.fieldLabel}>Class Level Applying For</Text>
                                <View style={s.paymentMethodRow}>
                                  {branding.offeredLevels.map((lvl: string) => (
                                    <TouchableOpacity key={lvl} style={[s.paymentMethodCard, appliedClassLevel === lvl && s.paymentMethodActive]} onPress={() => setAppliedClassLevel(lvl)} activeOpacity={0.85}>
                                      <Text style={s.paymentMethodLabel}>{branding.classLevelNames?.[lvl] || lvl}</Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              </View>
                            )}
                            <View style={s.fieldGroup}>
                              <Text style={s.fieldLabel}>Previous School (if transferring)</Text>
                              <View style={s.inputContainer}><Text style={s.inputIcon}>🏫</Text><TextInput style={s.textInput} placeholder="Previous school name" placeholderTextColor={colors.textLight} value={previousSchool} onChangeText={setPreviousSchool} /></View>
                            </View>
                            <View style={s.fieldGroup}>
                              <Text style={s.fieldLabel}>Previous Class (if transferring)</Text>
                              <View style={s.inputContainer}><Text style={s.inputIcon}>📚</Text><TextInput style={s.textInput} placeholder="e.g. Basic 5" placeholderTextColor={colors.textLight} value={previousClass} onChangeText={setPreviousClass} /></View>
                            </View>
                          </>
                        )}
                        <View style={s.fieldGroup}><Text style={s.fieldLabel}>Parent / Guardian Name</Text><View style={s.inputContainer}><Text style={s.inputIcon}>👤</Text><TextInput style={s.textInput} placeholder="Full name" placeholderTextColor={colors.textLight} value={parentName} onChangeText={setParentName} /></View></View>
                        <View style={s.fieldGroup}><Text style={s.fieldLabel}>Phone Number</Text><View style={s.inputContainer}><Text style={s.inputIcon}>📞</Text><TextInput style={s.textInput} placeholder="024-XXX-XXXX" placeholderTextColor={colors.textLight} value={parentPhone} onChangeText={setParentPhone} keyboardType="phone-pad" /></View></View>
                        <View style={s.fieldGroup}><Text style={s.fieldLabel}>Email (optional)</Text><View style={s.inputContainer}><Text style={s.inputIcon}>✉</Text><TextInput style={s.textInput} placeholder="parent@example.com" placeholderTextColor={colors.textLight} value={parentEmail} onChangeText={setParentEmail} keyboardType="email-address" autoCapitalize="none" /></View></View>
                        <View style={s.stepNavRow}>
                          <TouchableOpacity style={s.backBtn} onPress={() => setAdmissionStep('payment')}><Text style={s.backBtnText}>← Back</Text></TouchableOpacity>
                          <TouchableOpacity style={[s.primaryButtonSmall, admissionLoading && s.primaryButtonDisabled]} onPress={handleAdmissionSubmit} disabled={admissionLoading} activeOpacity={0.85}>
                            {admissionLoading ? <ActivityIndicator color={colors.white} /> : <Text style={s.primaryButtonText}>Submit Application</Text>}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {admissionStep === 'submitted' && (
                      <View style={s.successContainer}>
                        <View style={s.successIconWrap}><Text style={s.successIcon}>✓</Text></View>
                        <Text style={s.successTitle}>Application Submitted!</Text>
                        <Text style={s.successSubtext}>Your application has been received. The school's admissions office will review it.</Text>
                        <Text style={s.successSubtext2}>Use "Check Status" to track your application progress.</Text>
                        <TouchableOpacity style={s.primaryButton} onPress={() => { resetAdmission(); switchTab('status'); }} activeOpacity={0.85}><Text style={s.primaryButtonText}>Check Admission Status</Text><Text style={s.primaryButtonArrow}>→</Text></TouchableOpacity>
                        <TouchableOpacity style={s.backBtn} onPress={resetAdmission}><Text style={s.backBtnText}>← Back to Login</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
                {activeTab === 'status' && (
                  <View>
                    {statusStep === 'lookup' && (
                      <View>
                        <Text style={s.formSectionTitle}>Check Admission Status</Text>
                        <Text style={s.formSectionSub}>Enter your details to track your application</Text>
                        <View style={s.paymentMethodRow}>
                          <TouchableOpacity style={[s.paymentMethodCard, statusLookupMethod === 'cssps' && s.paymentMethodActive]} onPress={() => setStatusLookupMethod('cssps')} activeOpacity={0.85}><Text style={s.paymentMethodLabel}>By CSSPS Ref</Text></TouchableOpacity>
                          <TouchableOpacity style={[s.paymentMethodCard, statusLookupMethod === 'phone' && s.paymentMethodActive]} onPress={() => setStatusLookupMethod('phone')} activeOpacity={0.85}><Text style={s.paymentMethodLabel}>By Phone</Text></TouchableOpacity>
                        </View>
                        <View style={s.fieldGroup}><Text style={s.fieldLabel}>Applicant Full Name</Text><View style={s.inputContainer}><Text style={s.inputIcon}>👤</Text><TextInput style={s.textInput} placeholder="Enter ward's name" placeholderTextColor={colors.textLight} value={statusName} onChangeText={setStatusName} /></View></View>
                        {statusLookupMethod === 'cssps' ? (
                          <View style={s.fieldGroup}><Text style={s.fieldLabel}>CSSPS Placement Reference</Text><View style={s.inputContainer}><Text style={s.inputIcon}>📋</Text><TextInput style={s.textInput} placeholder="e.g. CSSPS/2026/0451" placeholderTextColor={colors.textLight} value={statusRef} onChangeText={setStatusRef} autoCapitalize="none" /></View></View>
                        ) : (
                          <View style={s.fieldGroup}><Text style={s.fieldLabel}>Parent Phone Number</Text><View style={s.inputContainer}><Text style={s.inputIcon}>📞</Text><TextInput style={s.textInput} placeholder="024-XXX-XXXX" placeholderTextColor={colors.textLight} value={statusPhone} onChangeText={setStatusPhone} keyboardType="phone-pad" /></View></View>
                        )}
                        <TouchableOpacity style={s.primaryButton} onPress={handleStatusCheck} activeOpacity={0.85}><Text style={s.primaryButtonText}>Check Status</Text><Text style={s.primaryButtonArrow}>→</Text></TouchableOpacity>
                        <TouchableOpacity style={s.backBtn} onPress={() => { resetStatus(); switchTab('apply'); }}><Text style={s.backBtnText}>← Back to Apply</Text></TouchableOpacity>
                      </View>
                    )}
                    {statusStep === 'result' && statusResult && (
                      <View>
                        {statusResult.status === 'approved' ? (
                          <View>
                            <View style={s.resultBoxSuccess}>
                              <View style={s.resultIconWrapSuccess}><Text style={s.resultIcon}>✓</Text></View>
                              <Text style={s.resultTitleSuccess}>Admission Approved!</Text>
                              <Text style={s.resultTextSuccess}>Congratulations! Your ward has been admitted.</Text>
                              <Text style={s.resultDetailText}>Programme: {statusResult.programme || 'N/A'}</Text>
                              <Text style={s.resultDetailText}>Status: {statusResult.status}</Text>
                              <Text style={s.resultDetailText}>Date Applied: {statusResult.createdAt ? new Date(statusResult.createdAt).toLocaleDateString() : 'N/A'}</Text>
                            </View>
                            {statusResult.generatedUsername && (
                              <View style={[s.resultBoxSuccess, { marginTop: 12 }]}>
                                <Text style={[s.resultTitleSuccess, { fontSize: 16 }]}>Parent Dashboard Login</Text>
                                <Text style={s.resultTextSuccess}>Your parent account has been created. Use these credentials to log in:</Text>
                                <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>Username: {statusResult.generatedUsername}</Text>
                                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>Password: {statusResult.generatedPassword}</Text>
                                </View>
                                <Text style={[s.resultDetailText, { marginTop: 8, fontSize: 12 }]}>You now have access to the Parent Portal. Log in to view your ward's information and pay your subscription.</Text>
                                <TouchableOpacity style={[s.primaryButton, { marginTop: 12 }]} onPress={() => { resetStatus(); switchTab('signin'); }} activeOpacity={0.85}><Text style={s.primaryButtonText}>Login to Parent Portal</Text><Text style={s.primaryButtonArrow}>→</Text></TouchableOpacity>
                              </View>
                            )}
                          </View>
                        ) : statusResult.status === 'rejected' ? (
                          <View style={s.resultBoxDanger}>
                            <View style={s.resultIconWrapDanger}><Text style={s.resultIcon}>✕</Text></View>
                            <Text style={s.resultTitleDanger}>Application Denied</Text>
                            <Text style={s.resultTextDanger}>We're sorry, your application has been rejected. Please contact the school's admissions office.</Text>
                          </View>
                        ) : (
                          <View style={s.resultBoxWarning}>
                            <View style={s.resultIconWrapWarning}><Text style={s.resultIcon}>⏳</Text></View>
                            <Text style={s.resultTitleWarning}>Application {statusResult.status}</Text>
                            <Text style={s.resultTextWarning}>Applicant: {statusResult.applicantName}</Text>
                            <Text style={s.resultTextWarning}>Programme: {statusResult.programme || 'N/A'}</Text>
                            <Text style={s.resultTextWarning}>Date Applied: {statusResult.createdAt ? new Date(statusResult.createdAt).toLocaleDateString() : 'N/A'}</Text>
                            <Text style={s.resultSubtext}>Your application is being reviewed. Please check back later for updates.</Text>
                          </View>
                        )}
                        <TouchableOpacity style={s.backBtn} onPress={() => setStatusStep('lookup')}><Text style={s.backBtnText}>← Check Another</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </View>
          </View>
        </View>
        </View>
      </View>
      )}
    </View>
  );
}
