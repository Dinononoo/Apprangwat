import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Scale factor for responsive design
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Responsive sizing helpers
export const scale = (size) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export const COLORS = {
  // Primary colors
  primary: '#3B82F6',      // Bright blue
  primaryDark: '#1D4ED8',  // Darker blue
  primaryLight: '#93C5FD', // Light blue

  // Secondary colors
  secondary: '#10B981',    // Turquoise
  secondaryDark: '#059669', // Dark green
  secondaryLight: '#6EE7B7', // Light green

  // Accent colors
  accent: '#8B5CF6',        // Purple
  warning: '#FBBF24',       // Amber
  info: '#38BDF8',          // Sky blue
  danger: '#EF4444',        // Red

  // Neutrals
  dark: '#111827',          // Almost black
  light: '#F9FAFB',         // Off white
  white: '#FFFFFF',         // Pure white

  // Transparency
  transparentWhite: 'rgba(255, 255, 255, 0.85)',
  transparentDark: 'rgba(0, 0, 0, 0.05)',
  glassOverlay: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',

  // Functional colors
  background: '#F1F5F9',     // Slate background
  card: '#FFFFFF',
  text: '#1E293B',           // Main text
  textLight: '#475569',      // Secondary text
  placeholder: '#94A3B8',
  border: '#E2E8F0',
};

export const FONTS = {
  regular: {
    fontWeight: 'normal',
  },
  medium: {
    fontWeight: '500',
  },
  bold: {
    fontWeight: 'bold',
  },
  light: {
    fontWeight: '300',
  },
};

export const SIZES = {
  // Global sizes
  base: moderateScale(8),
  font: moderateScale(14),
  radius: moderateScale(12),
  padding: moderateScale(24),
  margin: moderateScale(20),

  // Font sizes
  largeTitle: moderateScale(32),
  h1: moderateScale(26),
  h2: moderateScale(22),
  h3: moderateScale(18),
  h4: moderateScale(16),
  h5: moderateScale(14),
  body1: moderateScale(16),
  body2: moderateScale(14),
  body3: moderateScale(12),
  small: moderateScale(10),

  // App dimensions
  width,
  height,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  dark: {
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const STYLES = {
  // Common screen container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Flexbox helpers
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnCenter: {
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const appTheme = { COLORS, FONTS, SIZES, SHADOWS, STYLES, scale, verticalScale, moderateScale };

export default appTheme;