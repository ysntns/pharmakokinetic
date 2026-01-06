export const colors = {
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#E0F2FE',
  secondary: '#14B8A6',
  background: '#F8FAFC',
  backgroundDark: '#0F172A',
  surface: '#FFFFFF',
  surfaceDark: '#1E293B',
  card: '#FFFFFF',
  cardDark: '#334155',
  text: '#0F172A',
  textDark: '#F1F5F9',
  textSecondary: '#64748B',
  textSecondaryDark: '#94A3B8',
  border: '#E2E8F0',
  borderDark: '#334155',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#0EA5E9',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};
