import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#0F4C75',
  primaryLight: '#3282B8',
  primaryDark: '#06283D',
  accent: '#FFC93C',
  accentLight: '#FFD966',
  accentDark: '#E6A900',
  background: '#F0F2F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F8FA',
  surfaceHover: '#EEF1F5',
  text: '#1A1A2E',
  textSecondary: '#5C6370',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',
  border: '#E4E7EC',
  borderLight: '#F0F1F4',
  success: '#0BA37A',
  successLight: '#10C995',
  successBg: '#E6F7F1',
  warning: '#F59E0B',
  warningBg: '#FEF6E7',
  danger: '#E5484D',
  dangerBg: '#FDECEC',
  info: '#3B82F6',
  infoBg: '#EBF2FE',
  purple: '#7C5CFC',
  purpleBg: '#F0EDFF',
  pink: '#E84393',
  pinkBg: '#FDF0F6',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(6, 40, 61, 0.55)',
  glassLight: 'rgba(255, 255, 255, 0.92)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 34,
  hero: 42,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const layout = {
  sidebarWidth: 280,
  tabBarHeight: 60,
  headerHeight: 64,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0F4C75',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F4C75',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F4C75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#06283D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#3282B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  bodyText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  caption: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
});
