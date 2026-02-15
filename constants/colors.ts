/**
 * Design system color tokens.
 *
 * The default export (`Colors`) is the dark theme palette.
 * `LightColors` overrides the surface/text colors for light mode.
 * Both palettes share accent, status, and category colors.
 */
const Colors = {
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',
  accent: '#10B981',
  accentDark: '#059669',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  danger: '#EF4444',
  dangerLight: '#FCA5A5',

  background: '#0B1426',
  backgroundSecondary: '#111D33',
  backgroundTertiary: '#1A2A45',
  card: '#162038',
  cardElevated: '#1E2D4A',
  cardBorder: '#243352',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  courseCompleted: '#10B981',
  courseInProgress: '#F59E0B',
  courseLocked: '#EF4444',
  courseAvailable: '#94A3B8',
  courseFuture: '#475569',

  gpaExcellent: '#10B981',
  gpaGood: '#0EA5E9',
  gpaAverage: '#F59E0B',
  gpaLow: '#EF4444',

  // Per-category accent colors used in course cards, map nodes, and charts
  categoryColors: {
    'Foundation': '#8B5CF6',
    'Mathematics': '#3B82F6',
    'Science': '#EC4899',
    'Computer Engineering': '#0EA5E9',
    'Computer Science': '#14B8A6',
    'Electrical Engineering': '#F97316',
    'Engineering Core': '#10B981',
    'General Education': '#6366F1',
    'Elective': '#A855F7',
    'Capstone': '#F59E0B',
  } as Record<string, string>,

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  light: {
    text: '#F1F5F9',
    background: '#0B1426',
    tint: '#0EA5E9',
    tabIconDefault: '#64748B',
    tabIconSelected: '#0EA5E9',
  },
};

/** Light theme overrides — only surface and text colors change */
export const LightColors = {
  ...Colors,
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  backgroundTertiary: '#E2E8F0',
  card: '#FFFFFF',
  cardElevated: '#F8FAFC',
  cardBorder: '#E2E8F0',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#F1F5F9',
};

export default Colors;
