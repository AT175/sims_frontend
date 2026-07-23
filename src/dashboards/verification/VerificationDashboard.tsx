import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';


export function VerificationDashboard() {
  const [code, setCode] = useState('');

  const handleVerify = () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    Alert.alert('Verified', 'Identity verified successfully. You can now access the system.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <Text style={styles.headerSubtitle}>Complete verification to access the system</Text>
      </View>

      <ScrollView style={styles.content}>
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verification Required</Text>
            <Text style={styles.cardText}>
              You are logged in with a temporary credential. Please enter the verification code
              provided to you to complete the login process.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Verification Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              placeholderTextColor={colors.textLight}
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity style={styles.btn} onPress={handleVerify}>
              <Text style={styles.btnText}>Verify Identity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primaryDark, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textInverse },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  content: { flex: 1, padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  cardText: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md, backgroundColor: colors.surfaceAlt },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  btnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
