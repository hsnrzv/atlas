// GENERATED FILE - DO NOT EDIT.
// Source: design/tokens/*.json. Regenerate with `npm run tokens:build`.

export const LIFE_DIMENSION_KEYS = [
  'career',
  'finance',
  'health',
  'love',
  'passion',
  'friendship',
  'family',
] as const;

export type LifeDimensionKey = (typeof LIFE_DIMENSION_KEYS)[number];

export const colorPrimitives = {
  brand: {
    midnight: { '700': '#304A65', '800': '#203650', '900': '#14243A', '950': '#101D32' },
    ivory: { '50': '#FBF9F4', '100': '#F5F0E6', '200': '#EAE2D4' },
    gold: {
      '200': '#EBD9B9',
      '500': '#D5AD70',
      '600': '#B88D52',
      '700': '#A77C43',
      '800': '#805B2F',
      '900': '#765329',
    },
    venn: { blue: '#5685B5', teal: '#348F84', violet: '#8A73BB', rose: '#B17D9E' },
  },
  neutral: {
    '100': '#F0F1F1',
    '200': '#E5E7E8',
    '300': '#D4D8DC',
    '500': '#747E89',
    '600': '#5F6873',
    '700': '#4D5661',
    '900': '#252B33',
  },
  white: '#FFFFFF',
  dimension: {
    career: { DEFAULT: '#759ECA', strong: '#426D9B', tint: '#EAF1F8' },
    finance: { DEFAULT: '#D5AD70', strong: '#805B2F', tint: '#F6EFE3' },
    health: { DEFAULT: '#91AD99', strong: '#52765B', tint: '#EDF3EE' },
    love: { DEFAULT: '#CA8A76', strong: '#965B4A', tint: '#F8EEEA' },
    passion: { DEFAULT: '#A99ACB', strong: '#6F5C98', tint: '#F1EEF7' },
    friendship: { DEFAULT: '#78AFAE', strong: '#3F7776', tint: '#EAF3F2' },
    family: { DEFAULT: '#C5A66D', strong: '#80683E', tint: '#F5F0E5' },
  },
  status: {
    success: '#4F8064',
    'in-progress': '#426D9B',
    upcoming: '#9A7A43',
    'at-risk': '#B56B45',
    blocked: '#A65353',
    'not-started': '#747E89',
  },
  'status-on-dark': {
    success: '#9CB6A5',
    'in-progress': '#95ACC3',
    upcoming: '#C6B393',
    'at-risk': '#D5AB94',
    blocked: '#CC9E9B',
    'not-started': '#B1B5B9',
  },
} as const;

export const semanticColors = {
  light: {
    surface: {
      page: '#FBF9F4',
      card: '#FFFFFF',
      subtle: '#F5F0E6',
      sunken: '#F0F1F1',
      inverse: '#14243A',
      'inverse-strong': '#101D32',
      'inverse-raised': '#203650',
      achievement: '#EBD9B9',
    },
    text: {
      primary: '#252B33',
      secondary: '#4D5661',
      muted: '#5F6873',
      disabled: '#747E89',
      inverse: '#F5F0E6',
      'inverse-secondary': '#D4D8DC',
      achievement: '#805B2F',
      link: '#203650',
    },
    border: {
      subtle: '#EAE2D4',
      default: '#D4D8DC',
      divider: '#E5E7E8',
      control: '#747E89',
      inverse: '#304A65',
    },
    action: {
      primary: '#14243A',
      'primary-hover': '#203650',
      'on-primary': '#FFFFFF',
      secondary: '#14243A',
      destructive: '#A65353',
      'on-destructive': '#FFFFFF',
    },
    focus: { ring: '#14243A', 'ring-inverse': '#D5AD70' },
    nav: { indicator: '#D5AD70' },
  },
  dark: {
    surface: {
      page: '#101D32',
      card: '#14243A',
      subtle: '#203650',
      sunken: '#101D32',
      inverse: '#101D32',
      'inverse-strong': '#101D32',
      'inverse-raised': '#203650',
      achievement: '#203650',
    },
    text: {
      primary: '#F5F0E6',
      secondary: '#EAE2D4',
      muted: '#D4D8DC',
      disabled: '#747E89',
      inverse: '#F5F0E6',
      'inverse-secondary': '#D4D8DC',
      achievement: '#D5AD70',
      link: '#F5F0E6',
    },
    border: {
      subtle: '#304A65',
      default: '#304A65',
      divider: '#203650',
      control: '#747E89',
      inverse: '#304A65',
    },
    action: {
      primary: '#D5AD70',
      'primary-hover': '#EBD9B9',
      'on-primary': '#101D32',
      secondary: '#F5F0E6',
      destructive: '#CC9E9B',
      'on-destructive': '#101D32',
    },
    focus: { ring: '#D5AD70', 'ring-inverse': '#D5AD70' },
    nav: { indicator: '#D5AD70' },
    status: {
      success: '#9CB6A5',
      'in-progress': '#95ACC3',
      upcoming: '#C6B393',
      'at-risk': '#D5AB94',
      blocked: '#CC9E9B',
      'not-started': '#B1B5B9',
    },
    dimension: {
      career: { strong: '#759ECA', tint: '#203650' },
      finance: { strong: '#D5AD70', tint: '#203650' },
      health: { strong: '#91AD99', tint: '#203650' },
      love: { strong: '#CA8A76', tint: '#203650' },
      passion: { strong: '#A99ACB', tint: '#203650' },
      friendship: { strong: '#78AFAE', tint: '#203650' },
      family: { strong: '#C5A66D', tint: '#203650' },
    },
  },
} as const;

export const dimensionColors = {
  career: { accent: '#759ECA', strong: '#426D9B', tint: '#EAF1F8' },
  finance: { accent: '#D5AD70', strong: '#805B2F', tint: '#F6EFE3' },
  health: { accent: '#91AD99', strong: '#52765B', tint: '#EDF3EE' },
  love: { accent: '#CA8A76', strong: '#965B4A', tint: '#F8EEEA' },
  passion: { accent: '#A99ACB', strong: '#6F5C98', tint: '#F1EEF7' },
  friendship: { accent: '#78AFAE', strong: '#3F7776', tint: '#EAF3F2' },
  family: { accent: '#C5A66D', strong: '#80683E', tint: '#F5F0E5' },
} as const;

export const statusColors = {
  success: '#4F8064',
  'in-progress': '#426D9B',
  upcoming: '#9A7A43',
  'at-risk': '#B56B45',
  blocked: '#A65353',
  'not-started': '#747E89',
} as const;

export const breakpoints = { xs: 0, sm: 480, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;

export const durations = { instant: 0, micro: 140, standard: 200, page: 280 } as const;

export const easings = {
  enter: 'cubic-bezier(0.2, 0, 0, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const lifeDimensionMeta = {
  career: {
    apiKey: 'CAREER',
    label: 'Career',
    longLabel: 'Career / Profession',
    icon: 'briefcase',
  },
  finance: { apiKey: 'FINANCE', label: 'Finance', longLabel: 'Finance', icon: 'wallet' },
  health: { apiKey: 'HEALTH', label: 'Health', longLabel: 'Health', icon: 'heartbeat' },
  love: { apiKey: 'LOVE', label: 'Love', longLabel: 'Love / Partnership', icon: 'heart' },
  passion: { apiKey: 'PASSION', label: 'Passion', longLabel: 'Passion', icon: 'sparkles' },
  friendship: { apiKey: 'FRIENDSHIP', label: 'Friendship', longLabel: 'Friendship', icon: 'users' },
  family: { apiKey: 'FAMILY', label: 'Family', longLabel: 'Family', icon: 'home' },
} as const;
