import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'sims_pwa_install_dismissed';
const DISMISS_DURATION = 8; // seconds before auto-dismiss

export function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check if already dismissed or already installed (standalone mode)
    const dismissed = localStorage.getItem(DISMISS_KEY);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;

    if (dismissed || isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(evt);

      // Show after a short delay so it doesn't appear instantly
      setTimeout(() => {
        setVisible(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also listen for appinstalled to hide
    const installedHandler = () => {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, '1');
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  // Animate in
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after DISMISS_DURATION seconds
      timerRef.current = setTimeout(() => {
        dismiss();
      }, DISMISS_DURATION * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, '1');
    });
  };

  const handleInstall = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted' || choice.outcome === 'dismissed') {
        setDeferredPrompt(null);
        dismiss();
      }
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📱</Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Install SIMS</Text>
          <Text style={styles.subtitle}>Add to your home screen for quick access</Text>
        </View>
        <TouchableOpacity style={styles.installBtn} onPress={handleInstall} activeOpacity={0.8}>
          <Text style={styles.installBtnText}>Install</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={dismiss} activeOpacity={0.6}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 16,
    backgroundColor: '#06283D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 480,
    alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 201, 60, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 22,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  installBtn: {
    backgroundColor: '#FFC93C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexShrink: 0,
  },
  installBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06283D',
  },
  closeBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  closeBtnText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
});
