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
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '@store/authStore';
import { useRegistryStore } from '@store/registryStore';
import type { Programme, PaymentMethod } from '@store/registryStore';
import { PROGRAMMES } from '@store/registryStore';
import { colors } from '@theme/index';
import { loginStyles as s } from './loginStyles';

type Tab = 'signin' | 'apply' | 'status';
type AdmissionStep = 'search' | 'payment' | 'form' | 'submitted';
type StatusStep = 'lookup' | 'result';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_NARROW = SCREEN_WIDTH < 900;

const INFO_SLIDES = [
  { image: '/slide1.jpg', title: 'Excellence in Education', text: 'Top-performing WASSCE students for over 25 years, with a 98% university placement rate.', accent: colors.primaryLight },
  { image: '/slide2.jpg', title: 'Vibrant Campus Life', text: 'Inter-house sports, drama club, debate society, and STEM fairs — something for every student.', accent: colors.accent },
  { image: '/slide3.jpg', title: 'Recent Achievements', text: '2025 Regional Athletics Champions · National Science Quiz semi-finalists · Best Debate Team.', accent: colors.success },
  { image: '/slide4.jpg', title: 'Upcoming Events', text: 'Open Day — July 15 · Speech & Prize Giving — July 28 · GTU Exams begin August 5.', accent: colors.info },
  { image: '/slide5.jpg', title: 'Our Community', text: 'Over 1,800 students, 120 dedicated staff, and a thriving PTA working together for success.', accent: colors.purple },
];

const QUICK_STATS = [
  { label: 'Students', value: '1,800+' },
  { label: 'Staff', value: '120' },
  { label: 'Placement', value: '98%' },
  { label: 'Founded', value: '2000' },
];

export function LoginScreen() {
  const { login, loginTemp, isLoading, error, clearError } = useAuthStore();
  const registryStore = useRegistryStore();

  const [activeTab, setActiveTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleAdmissionSubmit = () => {
    if (!parentName.trim() || !parentPhone.trim()) { Alert.alert('Error', 'Parent name and phone are required'); return; }
    setAdmissionLoading(true);
    registryStore.addAdmission({
      applicantName: wardName.trim(), parentName: parentName.trim(), parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(), programme: selectedProgramme, photoUrl: null,
      csspsRef: placementRef.trim() || null, notes: '',
      fee: { amount: registryStore.applicationFeeAmount, method: paymentMethod!, status: 'Paid',
        reference: paymentMethod === 'Mobile Money' ? mmRef.trim() : scratchSerial.trim(),
        paidAt: new Date().toISOString().slice(0, 10), verifiedBy: null },
    } as any);
    setAdmissionLoading(false);
    setAdmissionStep('submitted');
  };

  const handleStatusCheck = () => {
    if (!statusName.trim() || !statusRef.trim()) { Alert.alert('Error', 'Please enter both name and CSSPS reference'); return; }
    const admission = registryStore.getAdmissionByCredentials(statusName.trim(), statusRef.trim());
    if (!admission) { Alert.alert('Not Found', 'No application found with the provided details.'); return; }
    setStatusResult(admission);
    setStatusStep('result');
  };

  const resetAdmission = () => {
    setAdmissionStep('search'); setWardName(''); setPlacementRef(''); setParentName('');
    setParentPhone(''); setParentEmail(''); setSelectedProgramme('Science'); setMatchedPlacement(null);
    setPaymentMethod(null); setMmNumber(''); setMmRef(''); setScratchPin(''); setScratchSerial('');
  };

  const resetStatus = () => { setStatusStep('lookup'); setStatusName(''); setStatusRef(''); setStatusResult(null); };

  // ── Render ──
  return (
    <View style={s.screen}>
      {IS_NARROW && (
        <View style={s.compactHeader}>
          <View style={s.compactLogoRow}>
            <View style={s.compactLogoRing}><Text style={s.compactLogoText}>SIMS</Text></View>
            <View><Text style={s.compactTitle}>SIMS</Text><Text style={s.compactSubtitle}>School Management System</Text></View>
          </View>
        </View>
      )}
      <View style={s.splitContainer}>
        {!IS_NARROW && (
          <View style={s.brandPanel}>
            <Image source={{ uri: '/banner3.png' }} style={s.brandBgImage} resizeMode="cover" />
            <View style={s.brandOverlay} />
            <View style={s.brandContent}>
              <View style={s.brandLogoSection}>
                <View style={s.logoRing}><View style={s.logoInner}><Text style={s.logoText}>SIMS</Text></View></View>
                <Text style={s.brandTitle}>School Information{'\n'}Management System</Text>
                <Text style={s.brandTagline}>Empowering Ghanaian Senior High Schools</Text>
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
                <Text style={s.formWelcome}>Welcome Back</Text>
                <Text style={s.formWelcomeSub}>Sign in to your account or apply for admission</Text>
              </View>
            )}
            {/* Tab Bar */}
            <View style={s.tabBar}>
              {([{ key: 'signin', label: 'Sign In' }, { key: 'apply', label: 'Apply' }, { key: 'status', label: 'Check Status' }] as { key: Tab; label: string }[]).map((tab) => (
                <TouchableOpacity key={tab.key} style={s.tabItem} onPress={() => switchTab(tab.key)} activeOpacity={0.7}>
                  <Text style={[s.tabLabel, activeTab === tab.key && s.tabLabelActive]}>{tab.label}</Text>
                  {activeTab === tab.key && <View style={s.tabIndicator} />}
                </TouchableOpacity>
              ))}
            </View>
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
                        {statusResult.credentialsExpired ? (
                          <View style={s.resultBoxDanger}>
                            <View style={s.resultIconWrapDanger}><Text style={s.resultIcon}>✕</Text></View>
                            <Text style={s.resultTitleDanger}>Application Denied</Text>
                            <Text style={s.resultTextDanger}>We're sorry, your application has been rejected. Your credentials have expired. Please contact the school's admissions office.</Text>
                          </View>
                        ) : statusResult.status === 'Approved' ? (
                          <View>
                            <View style={s.resultBoxSuccess}>
                              <View style={s.resultIconWrapSuccess}><Text style={s.resultIcon}>✓</Text></View>
                              <Text style={s.resultTitleSuccess}>Admission Approved!</Text>
                              <Text style={s.resultTextSuccess}>Congratulations! Your ward has been admitted.</Text>
                              <Text style={s.resultDetailText}>Programme: {statusResult.programme}</Text>
                              <Text style={s.resultDetailText}>Status: {statusResult.status}</Text>
                              <Text style={s.resultDetailText}>Date Applied: {statusResult.dateApplied}</Text>
                            </View>
                            {(() => { const pa = registryStore.getParentAccountByAdmission(statusResult.id); return pa ? (
                              <View style={s.credentialsBox}>
                                <Text style={s.credentialsTitle}>Your Parent Account</Text>
                                <Text style={s.credentialsDetail}>Username: {pa.username}</Text>
                                <Text style={s.credentialsDetail}>Password: {pa.password}</Text>
                                <Text style={s.credentialsHint}>Use these credentials to sign in to the Parent Portal.</Text>
                              </View>
                            ) : null; })()}
                            {(() => {
                              const pl = registryStore.getProspectusForParent(registryStore.getParentAccountByAdmission(statusResult.id)?.username || '');
                              if (pl.length === 0) return <Text style={s.hintText}>No prospectus published yet. Check back later.</Text>;
                              return (
                                <View>
                                  <Text style={s.formSectionTitle}>Prospectus Available</Text>
                                  {pl.map((p: any) => (
                                    <View key={p.id} style={s.prospectusCard}>
                                      <Text style={s.prospectusTitle}>{p.title}</Text>
                                      <Text style={s.prospectusMeta}>{p.academicYear}</Text>
                                      <Text style={s.prospectusPreview} numberOfLines={3}>{p.content}</Text>
                                      <TouchableOpacity style={s.downloadBtn} onPress={() => {
                                        const w = window.open('', '_blank');
                                        if (w) { w.document.write(`<html><head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;margin:40px;color:#1A1A2E;}h1{color:#0F4C75;border-bottom:2px solid #0F4C75;padding-bottom:8px;}pre{white-space:pre-wrap;font-size:14px;line-height:1.6;}</style></head><body><h1>${p.title}</h1><p style='color:#5C6370;font-size:12px;'>Academic Year: ${p.academicYear} | Published: ${p.datePublished}</p><pre>${p.content}</pre></body></html>`); w.document.close(); w.focus(); setTimeout(() => w.print(), 500); }
                                      }}>
                                        <Text style={s.downloadBtnText}>⬇ Download / Print Prospectus</Text>
                                      </TouchableOpacity>
                                    </View>
                                  ))}
                                </View>
                              );
                            })()}
                          </View>
                        ) : (
                          <View style={s.resultBoxWarning}>
                            <View style={s.resultIconWrapWarning}><Text style={s.resultIcon}>⏳</Text></View>
                            <Text style={s.resultTitleWarning}>Application {statusResult.status}</Text>
                            <Text style={s.resultTextWarning}>Applicant: {statusResult.applicantName}</Text>
                            <Text style={s.resultTextWarning}>Programme: {statusResult.programme}</Text>
                            <Text style={s.resultTextWarning}>Date Applied: {statusResult.dateApplied}</Text>
                            <Text style={s.resultSubtext}>Your application is being reviewed. Please check back later for updates.</Text>
                            {statusResult.fee && statusResult.fee.status === 'Unpaid' && <Text style={s.feeWarning}>⚠ Application fee is unpaid. Please complete payment.</Text>}
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
          <View style={s.footerBar}><Text style={s.footerText}>© 2026 Ghana SHS SIMS · v0.1.0</Text></View>
        </View>
      </View>
    </View>
  );
}
