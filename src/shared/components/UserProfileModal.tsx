import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { ROLE_LABELS } from '@shared/navigation/roleMap';
import type { RoleId } from '@shared/types';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
}

export function UserProfileModal({ visible, onClose, title }: UserProfileModalProps) {
  const { user, updateProfile, changePassword, uploadProfilePicture, isLoading, error, clearError } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (visible) {
      setDisplayName(user?.displayName ?? '');
      setEditMode(false);
      setPasswordMode(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      clearError();
    }
  }, [visible, user?.displayName]);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) { Alert.alert('Error', 'Display name is required'); return; }
    await updateProfile({ displayName: displayName.trim() });
    setEditMode(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { Alert.alert('Error', 'All password fields are required'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Error', 'New passwords do not match'); return; }
    if (newPassword.length < 6) { Alert.alert('Error', 'New password must be at least 6 characters'); return; }
    await changePassword(currentPassword, newPassword);
    setPasswordMode(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Success', 'Password changed successfully');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { Alert.alert('Error', 'Please select an image file'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) uploadProfilePicture(base64);
    };
    reader.readAsDataURL(file);
  };

  const avatarSource = user?.profilePictureUrl ? { uri: user.profilePictureUrl } : null;
  const avatarInitial = (user?.displayName ?? 'U').charAt(0).toUpperCase();
  const roleLabel = user?.activeRole ? ROLE_LABELS[user.activeRole as RoleId] : title;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.avatarWrap}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarInitial}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Text style={styles.uploadBtnText}>+</Text>
              </TouchableOpacity>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </View>
            <Text style={styles.name}>{user?.displayName ?? 'User'}</Text>
            <Text style={styles.role}>{roleLabel}</Text>
          </View>

          {isLoading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />}

          <View style={styles.body}>
            <View style={styles.row}>
              <Text style={styles.label}>Display Name</Text>
              {editMode ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.textInput}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Display name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TouchableOpacity style={styles.smallBtn} onPress={handleSaveDisplayName} disabled={isLoading}>
                    <Text style={styles.smallBtnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, styles.cancelBtn]} onPress={() => { setEditMode(false); setDisplayName(user?.displayName ?? ''); }}>
                    <Text style={styles.smallBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.valueRow}>
                  <Text style={styles.value}>{user?.displayName ?? '-'}</Text>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => setEditMode(true)}>
                    <Text style={styles.smallBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Username</Text>
              <Text style={styles.value}>{user?.username ?? '-'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>School</Text>
              <Text style={styles.value}>{user?.schoolName ?? '-'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>All Roles</Text>
              <Text style={styles.value}>{user?.roles.map((r) => ROLE_LABELS[r as RoleId] ?? r).join(', ') ?? '-'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Password</Text>
              {passwordMode ? (
                <View style={styles.passwordForm}>
                  <TextInput style={styles.textInput} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" placeholderTextColor={colors.textSecondary} secureTextEntry />
                  <TextInput style={styles.textInput} value={newPassword} onChangeText={setNewPassword} placeholder="New password" placeholderTextColor={colors.textSecondary} secureTextEntry />
                  <TextInput style={styles.textInput} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm new password" placeholderTextColor={colors.textSecondary} secureTextEntry />
                  <View style={styles.editRow}>
                    <TouchableOpacity style={styles.smallBtn} onPress={handleChangePassword} disabled={isLoading}>
                      <Text style={styles.smallBtnText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, styles.cancelBtn]} onPress={() => { setPasswordMode(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>
                      <Text style={styles.smallBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.valueRow}>
                  <Text style={styles.value}>••••••••</Text>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => setPasswordMode(true)}>
                    <Text style={styles.smallBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
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
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  uploadBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  uploadBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    lineHeight: 20,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  role: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'column',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  textInput: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  smallBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  cancelBtn: {
    backgroundColor: colors.textSecondary,
  },
  smallBtnText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  passwordForm: {
    gap: spacing.sm,
  },
  closeBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  closeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});
