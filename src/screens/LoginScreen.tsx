import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  useWindowDimensions,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '@store/authStore';
import { useRegistryStore } from '@store/registryStore';
import type { Programme, PaymentMethod } from '@store/registryStore';
import { PROGRAMMES } from '@store/registryStore';
import { colors, spacing } from '@theme/index';
import { loginStyles as s } from './loginStyles';

type Tab = 'signin' | 'apply' | 'status';
type AdmissionStep = 'search' | 'payment' | 'form' | 'submitted';
type StatusStep = 'lookup' | 'result';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HERO_SLIDES = [
  { image: '/b1.jpg', caption: 'Terchire Senior High School' },
  { image: '/b3.jpeg', caption: 'Quality Education & Discipline' },
  { image: '/b4.jpeg', caption: 'A Center for Excellence in Ahafo' },
  { image: '/b5.jpeg', caption: 'Nimdɛɛ Firi Onyame' },
  { image: '/b6.jpeg', caption: 'Building Future Leaders' },
  { image: '/b7.jpeg', caption: 'Serving Tano North Since 2011' },
  { image: '/8.jpeg', caption: 'Our Campus Community' },
];

const INFO_SLIDES = [
  { image: '/slide1.jpg', title: 'Quality Education', text: 'Dedicated to training learners to high education standards through collaborative stakeholder efforts.', accent: colors.primaryLight },
  { image: '/slide2.jpg', title: 'Discipline & Character', text: 'Instilling moral integrity and discipline in every student, creating responsible citizens.', accent: colors.accent },
  { image: '/slide3.jpg', title: 'Our Programmes', text: 'General Arts, Business, and Agriculture programmes designed to prepare students for the future.', accent: colors.success },
  { image: '/slide4.jpg', title: 'Ahafo Region', text: 'Serving the Tano North District since 2011, providing accessible secondary education to the community.', accent: colors.info },
  { image: '/slide5.jpg', title: 'Our Community', text: 'A growing school community of students, teachers, and stakeholders working together for excellence.', accent: colors.purple },
];

const QUICK_STATS = [
  { label: 'Students', value: '164+' },
  { label: 'Programmes', value: '3' },
  { label: 'Region', value: 'Ahafo' },
  { label: 'Founded', value: '2011' },
];

export function LoginScreen() {
  const { login, loginTemp, isLoading, error, clearError } = useAuthStore();
  const registryStore = useRegistryStore();
  const { width: windowWidth } = useWindowDimensions();
  const IS_NARROW = windowWidth < 768;
  const IS_VERY_NARROW = windowWidth < 480;

  const [view, setView] = useState<'home' | 'portal'>('home');
  const [activeTab, setActiveTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const openPortal = (tab: Tab) => { setView('portal'); setActiveTab(tab); clearError(); };
  const goHome = () => setView('home');

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
  const [selectedProgramme, setSelectedProgramme] = useState<Programme>('Science');
  const [matchedPlacement, setMatchedPlacement] = useState<any>(null);
  const [admissionLoading, setAdmissionLoading] = useState(false);

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
        setSlideIndex((prev) => (prev + 1) % INFO_SLIDES.length);
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
        setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
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
    const u = username.trim(), p = password.trim();
    if (u.startsWith('VOTER_')) {
      try { await loginTemp(u, p); return; } catch { /* fall through */ }
    }
    login(u, p);
  };

  const handleAdmissionSearch = () => {
    if (!wardName.trim()) { Alert.alert('Error', "Please enter your ward's name"); return; }
    const placement = registryStore.searchPlacement(wardName.trim());
    if (placement) { setMatchedPlacement(placement); setPlacementRef(placement.csspsRef); setSelectedProgramme(placement.programme); }
    else { setMatchedPlacement(null); }
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
      });
      setAdmissionLoading(false);
      setAdmissionStep('submitted');
    } catch (err: any) {
      setAdmissionLoading(false);
      Alert.alert('Error', err.message || 'Failed to submit application. Please try again.');
    }
  };

  const handleStatusCheck = async () => {
    if (!statusName.trim() || !statusRef.trim()) { Alert.alert('Error', 'Please enter both name and CSSPS reference'); return; }
    try {
      const result = await apiClient.post<any>('/admissions/check-status', {
        applicantName: statusName.trim(),
        csspsPlacementRef: statusRef.trim(),
      });
      setStatusResult(result);
      setStatusStep('result');
    } catch (err: any) {
      Alert.alert('Not Found', err.message || 'No application found with the provided details.');
    }
  };

  const resetAdmission = () => {
    setAdmissionStep('search'); setWardName(''); setPlacementRef(''); setParentName('');
    setParentPhone(''); setParentEmail(''); setSelectedProgramme('Science'); setMatchedPlacement(null);
    setPaymentMethod(null); setMmNumber(''); setMmRef(''); setScratchPin(''); setScratchSerial('');
  };

  const resetStatus = () => { setStatusStep('lookup'); setStatusName(''); setStatusRef(''); setStatusResult(null); };

  // ── Render ──
  return (
    <View style={s.homeScreen}>
      {view === 'home' ? (
        <ScrollView ref={scrollViewRef} style={s.homeScroll} contentContainerStyle={s.homeScrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.headerLogoRow} onPress={goHome}>
              <View style={s.headerLogoBox}><Text style={s.headerLogoText}>TSHS</Text></View>
              {!IS_VERY_NARROW && <View><Text style={s.headerSchoolName}>Terchire SHS</Text><Text style={s.headerSchoolSub}>Nimdɛɛ Firi Onyame</Text></View>}
            </TouchableOpacity>
            <View style={s.headerNav}>
              {!IS_NARROW && <>
                <TouchableOpacity onPress={goHome}><Text style={s.headerNavLink}>Home</Text></TouchableOpacity>
                <TouchableOpacity onPress={scrollToAbout}><Text style={s.headerNavLink}>About Us</Text></TouchableOpacity>
              </>}
              <TouchableOpacity style={s.headerGhostBtn} onPress={() => openPortal('signin')}><Text style={s.headerGhostText}>Login</Text></TouchableOpacity>
              <TouchableOpacity style={s.headerCtaBtn} onPress={() => openPortal('apply')}><Text style={s.headerCtaText}>Apply</Text></TouchableOpacity>
            </View>
          </View>

          {/* Hero with flash animation carousel */}
          <View style={s.hero}>
            {HERO_SLIDES.map((slide, i) => (
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
            <View style={s.heroOverlay} />
            <View style={s.heroContent}>
              <View style={s.heroBadge}><Text style={s.heroBadgeText}>★ EST. 2011 · AHAFO REGION · GES ACCREDITED</Text></View>
              <Text style={s.heroTitle}>Welcome to{'\n'}<Text style={s.heroTitleAccent}>Terchire Senior High School</Text></Text>
              <Text style={s.heroSubtitle}>A center for quality education and discipline in the Ahafo Region. "Nimdɛɛ Firi Onyame" — Knowledge comes from God.</Text>
              <View style={s.heroBtnRow}>
                <TouchableOpacity style={s.heroBtnPrimary} onPress={() => openPortal('apply')} activeOpacity={0.85}>
                  <Text style={s.heroBtnPrimaryText}>Apply for Admission</Text>
                  <Text style={s.heroBtnPrimaryText}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.heroBtnSecondary} onPress={() => openPortal('signin')} activeOpacity={0.85}>
                  <Text style={s.heroBtnSecondaryText}>Staff / Student Login</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Hero dots indicator */}
            <View style={s.heroDots}>
              {HERO_SLIDES.map((_, i) => (
                <View key={i} style={[s.heroDot, i === heroSlide && s.heroDotActive]} />
              ))}
            </View>
          </View>

          {/* About Section */}
          <View style={[s.section, s.aboutBg]} onLayout={(e) => { aboutY.current = e.nativeEvent.layout.y; }}>
            <View style={s.sectionNarrow}>
              <Text style={s.sectionTitle}>About <Text style={s.sectionTitleAccent}>Our School</Text></Text>
              <Text style={s.sectionSubtitle}>Established in 2011 in Terchire, Tano North District of the Ahafo Region, Terchire Senior High School is dedicated to providing high-quality education and discipline to its learners.</Text>
              <View style={s.aboutGrid}>
                <View style={s.aboutCard}>
                  <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🎯</Text></View>
                  <Text style={s.aboutCardTitle}>Our Mission</Text>
                  <Text style={s.aboutCardText}>To train learners to high levels of education standards through the collaborative effort of all relevant stakeholders.</Text>
                </View>
                <View style={s.aboutCard}>
                  <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🌟</Text></View>
                  <Text style={s.aboutCardTitle}>Our Vision</Text>
                  <Text style={s.aboutCardText}>A center for quality education and discipline, serving the Tano North District and the Ahafo Region with dedication and excellence.</Text>
                </View>
                <View style={s.aboutCard}>
                  <View style={s.aboutCardIconWrap}><Text style={s.aboutCardIcon}>🤝</Text></View>
                  <Text style={s.aboutCardTitle}>Our Motto</Text>
                  <Text style={s.aboutCardText}>"Nimdɛɛ Firi Onyame" — Knowledge comes from God. We believe in nurturing both the intellect and character of every student through collaborative effort and discipline.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Features Section */}
          <View style={[s.section, s.featuresBg]}>
            <View style={s.sectionNarrow}>
              <Text style={s.sectionTitle}>Why Choose <Text style={s.sectionTitleAccent}>Terchire SHS?</Text></Text>
              <Text style={s.sectionSubtitle}>A single-track public senior high school committed to collaborative learning and discipline in the Ahafo Region.</Text>
              <View style={s.featuresGrid}>
                <View style={s.featureCard}>
                  <View style={s.featureIconWrap}><Text style={s.featureIcon}>📚</Text></View>
                  <Text style={s.featureTitle}>Quality Education</Text>
                  <Text style={s.featureText}>Dedicated teachers committed to training learners to high education standards through collaborative stakeholder efforts.</Text>
                </View>
                <View style={s.featureCard}>
                  <View style={s.featureIconWrap}><Text style={s.featureIcon}>🏆</Text></View>
                  <Text style={s.featureTitle}>Discipline & Character</Text>
                  <Text style={s.featureText}>We instill discipline and moral integrity in every student, creating responsible citizens ready to serve their community.</Text>
                </View>
                <View style={s.featureCard}>
                  <View style={s.featureIconWrap}><Text style={s.featureIcon}>💻</Text></View>
                  <Text style={s.featureTitle}>Agriculture Programme</Text>
                  <Text style={s.featureText}>Hands-on agricultural training that equips students with practical skills for food production and agribusiness.</Text>
                </View>
                <View style={s.featureCard}>
                  <View style={s.featureIconWrap}><Text style={s.featureIcon}>🏡</Text></View>
                  <Text style={s.featureTitle}>Business & Arts</Text>
                  <Text style={s.featureText}>Comprehensive Business and General Arts programmes that prepare students for university and professional careers.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Band */}
          <View style={s.statsBand}>
            <View style={s.statsBandGrid}>
              {QUICK_STATS.map((st) => (
                <View key={st.label} style={s.statsBandItem}>
                  <Text style={s.statsBandValue}>{st.value}</Text>
                  <Text style={s.statsBandLabel}>{st.label.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <View style={s.ctaSection}>
            <Text style={s.ctaTitle}>Ready to Join Our Community?</Text>
            <Text style={s.ctaText}>Apply for admission today or check your application status. Our admissions team is here to help you every step of the way.</Text>
            <View style={s.heroBtnRow}>
              <TouchableOpacity style={s.heroBtnPrimary} onPress={() => openPortal('apply')} activeOpacity={0.85}>
                <Text style={s.heroBtnPrimaryText}>Apply Now</Text>
                <Text style={s.heroBtnPrimaryText}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.heroBtnSecondary} onPress={() => openPortal('status')} activeOpacity={0.85}>
                <Text style={s.heroBtnSecondaryText}>Check Status</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <View style={s.footerGrid}>
              <View style={s.footerColWide}>
                <View style={s.footerBrandRow}>
                  <View style={s.footerBrandBox}><Text style={s.footerBrandText}>TSHS</Text></View>
                  <Text style={s.footerBrandName}>Terchire Senior High School</Text>
                </View>
                <Text style={s.footerAbout}>A public senior high school in Terchire, Ahafo Region, dedicated to quality education and discipline since 2011. "Nimdɛɛ Firi Onyame" — Knowledge comes from God.</Text>
              </View>
              <View style={s.footerCol}>
                <Text style={s.footerColTitle}>Quick Links</Text>
                <TouchableOpacity onPress={goHome}><Text style={s.footerLink}>Home</Text></TouchableOpacity>
                <TouchableOpacity onPress={scrollToAbout}><Text style={s.footerLink}>About Us</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => openPortal('apply')}><Text style={s.footerLink}>Apply for Admission</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => openPortal('status')}><Text style={s.footerLink}>Check Status</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => openPortal('signin')}><Text style={s.footerLink}>Staff Login</Text></TouchableOpacity>
              </View>
              <View style={s.footerCol}>
                <Text style={s.footerColTitle}>Programmes</Text>
                <Text style={s.footerLink}>General Arts</Text>
                <Text style={s.footerLink}>Business</Text>
                <Text style={s.footerLink}>Agriculture</Text>
              </View>
              <View style={s.footerCol}>
                <Text style={s.footerColTitle}>Contact Us</Text>
                <View style={s.footerContactRow}><Text style={s.footerContactIcon}>📍</Text><Text style={s.footerContactText}>P.O. Box 1, Terchire, Ahafo Region</Text></View>
                <View style={s.footerContactRow}><Text style={s.footerContactIcon}>📞</Text><Text style={s.footerContactText}>+233 24 471 3468</Text></View>
                <View style={s.footerContactRow}><Text style={s.footerContactIcon}>✉</Text><Text style={s.footerContactText}>terchireshs@ges.gov.gh</Text></View>
                <View style={s.footerContactRow}><Text style={s.footerContactIcon}>🕐</Text><Text style={s.footerContactText}>Mon–Fri: 7:30 AM – 3:30 PM</Text></View>
              </View>
            </View>
            <View style={s.footerBottom}>
              <Text style={s.footerCopyright}>© 2026 Terchire Senior High School · SIMS v0.1.0 · All rights reserved</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={s.portalOverlay}>
          <View style={s.portalCloseBar}>
            <TouchableOpacity style={s.portalCloseLogo} onPress={goHome}>
              <View style={s.portalCloseLogoBox}><Text style={s.portalCloseLogoText}>TSHS</Text></View>
              {!IS_VERY_NARROW && <Text style={s.portalCloseSchool}>Terchire SHS</Text>}
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
            <View style={s.splitContainer}>
        {!IS_NARROW && (
          <View style={s.brandPanel}>
            <Image source={{ uri: '/banner3.png' }} style={s.brandBgImage} resizeMode="cover" />
            <View style={s.brandOverlay} />
            <View style={s.brandContent}>
              <View style={s.brandLogoSection}>
                <View style={s.logoRing}><View style={s.logoInner}><Text style={s.logoText}>TSHS</Text></View></View>
                <Text style={s.brandTitle}>Terchire Senior{'\n'}High School</Text>
                <Text style={s.brandTagline}>Nimdɛɛ Firi Onyame — Knowledge comes from God</Text>
              </View>
              <View style={s.carouselContainer}>
                <Animated.View style={[s.carouselSlide, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                  <Image source={{ uri: INFO_SLIDES[slideIndex].image }} style={s.carouselImage} resizeMode="cover" />
                  <View style={s.carouselImageOverlay} />
                  <View style={s.carouselTextWrap}>
                    <View style={[s.carouselAccentBar, { backgroundColor: INFO_SLIDES[slideIndex].accent }]} />
                    <Text style={s.carouselTitle}>{INFO_SLIDES[slideIndex].title}</Text>
                    <Text style={s.carouselText}>{INFO_SLIDES[slideIndex].text}</Text>
                  </View>
                </Animated.View>
                <View style={s.carouselDots}>
                  {INFO_SLIDES.map((_, i) => (
                    <View key={i} style={[s.carouselDot, i === slideIndex && s.carouselDotActive, i === slideIndex && { backgroundColor: INFO_SLIDES[slideIndex].accent }]} />
                  ))}
                </View>
              </View>
              <View style={s.statsRow}>
                {QUICK_STATS.map((st) => (
                  <View key={st.label} style={s.statItem}>
                    <Text style={s.statValue}>{st.value}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        <View style={s.formPanel}>
          <Image source={{ uri: '/bg6.jpg' }} style={s.formPanelBg} resizeMode="cover" />
          <View style={s.formPanelBgOverlay} />
          <View style={s.formPanelInner}>
            {!IS_NARROW && (
              <View style={s.formHeader}>
                <Text style={s.formWelcome}>{activeTab === 'signin' ? 'Welcome Back' : activeTab === 'apply' ? 'Admission Application' : 'Check Application Status'}</Text>
                <Text style={s.formWelcomeSub}>{activeTab === 'signin' ? 'Sign in to your account' : activeTab === 'apply' ? 'Apply for admission to Terchire SHS' : 'Enter your details to check your status'}</Text>
              </View>
            )}
            {/* Direct form view - no tabs, each button links directly */}
            <Animated.View style={[s.formContent, { opacity: tabAnim, transform: [{ translateY: tabAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
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
                        <TouchableOpacity style={s.secondaryButton} onPress={() => { resetAdmission(); switchTab('status'); }} activeOpacity={0.85}><Text style={s.secondaryButtonText}>Check Admission Status</Text></TouchableOpacity>
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
                        <Text style={s.fieldLabel}>Programme</Text>
                        <View style={s.paymentMethodRow}>
                          {PROGRAMMES.map((p) => (
                            <TouchableOpacity key={p} style={[s.paymentMethodCard, selectedProgramme === p && s.paymentMethodActive]} onPress={() => setSelectedProgramme(p)} activeOpacity={0.85}><Text style={s.paymentMethodLabel}>{p}</Text></TouchableOpacity>
                          ))}
                        </View>
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
                        <View style={s.fieldGroup}><Text style={s.fieldLabel}>Applicant Full Name</Text><View style={s.inputContainer}><Text style={s.inputIcon}>👤</Text><TextInput style={s.textInput} placeholder="Enter ward's name" placeholderTextColor={colors.textLight} value={statusName} onChangeText={setStatusName} /></View></View>
                        <View style={s.fieldGroup}><Text style={s.fieldLabel}>CSSPS Placement Reference</Text><View style={s.inputContainer}><Text style={s.inputIcon}>📋</Text><TextInput style={s.textInput} placeholder="e.g. CSSPS/2026/0451" placeholderTextColor={colors.textLight} value={statusRef} onChangeText={setStatusRef} autoCapitalize="none" /></View></View>
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
