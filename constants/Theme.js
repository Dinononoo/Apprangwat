export const COLORS = {
  primary: '#3366FF',
  primaryLight: '#D6E4FF',
  primaryDark: '#0044CC',
  secondary: '#00CFDD',
  accent: '#FF9500',
  success: '#00C48C',
  warning: '#FFE16A',
  danger: '#FF647C',
  dark: '#0A1931',
  grey: '#8F9BB3',
  lightGrey: '#EDF1F7',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F7F9FC',
  card: '#FFFFFF',
  text: '#1A2138',
  textLight: '#8F9BB3',
  border: '#EDF1F7',
  shadow: 'rgba(10, 25, 49, 0.08)',
};

export const FONTS = {
  heading: {
    fontFamily: 'System',
    fontWeight: '700',
  },
  subheading: {
    fontFamily: 'System',
    fontWeight: '600',
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  small: {
    fontFamily: 'System',
    fontWeight: '400',
  },
};

export const SIZES = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const BORDER_RADIUS = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  round: 50,
};

export const GRADIENTS = {
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  background: ['#0f0c29', '#302b63', '#24243e'],
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  success: ['#27ae60', '#2ecc71'],
  warning: ['#f39c12', '#e67e22'],
  error: ['#e74c3c', '#c0392b'],
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};