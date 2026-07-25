import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@theme/index';

interface GeneratedPasswordModalProps {
  visible: boolean;
  username: string;
  password: string;
  onClose: () => void;
  title?: string;
}

export function GeneratedPasswordModal({
  visible,
  username,
  password,
  onClose,
  title = 'Password Generated',
}: GeneratedPasswordModalProps) {
  const handleCopy = () => {
    Alert.alert('Copied', `Password copied: ${password}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            A random password has been generated for{' '}
            <Text style={styles.username}>{username}</Text>.
          </Text>
          <Text style={styles.subtitle}>
            The user will be required to change this password on first login.
          </Text>

          <View style={styles.passwordBox}>
            <Text style={styles.passwordLabel}>Generated Password</Text>
            <Text style={styles.passwordValue}>{password}</Text>
          </View>

          <Text style={styles.warning}>
            Please share this password securely with the user. It will not be shown again.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Text style={styles.copyBtnText}>Copy Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  username: {
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  passwordBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  passwordValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  warning: {
    fontSize: fontSize.xs,
    color: colors.warning || '#E65100',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  copyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  copyBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
