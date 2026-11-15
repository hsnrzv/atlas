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
  tide: {
    space: '#0B1020',
    indigo: '#151B35',
    navy: '#202A46',
    panel: '#273452',
    'border-dark': '#36435D',
    muted: '#8290AA',
    secondary: '#A8B4CC',
    white: '#F5F7FC',
  },
  green: { forest: '#123F3C', jade: '#205D55', emerald: '#2D7266', teal: '#4B9387' },
  violet: { deep: '#493566', base: '#65518C', purple: '#8469B5', accent: '#B8A5D0' },
  gold: { dark: '#D4B477', light: '#A17A3F' },
  light: {
    page: '#F5F7FA',
    card: '#FFFFFF',
    raised: '#EAF0F4',
    green: '#E8F1EE',
    text: '#1D2935',
    secondary: '#586578',
    action: '#2D6A61',
    border: '#DCE4E9',
  },
  brand: { venn: { blue: '#5685B5', teal: '#348F84', violet: '#8A73BB', rose: '#B17D9E' } },
} as const;

export const semanticColors = {
  light: {
    surface: {
      page: '#F5F7FA',
      navigation: '#FFFFFF',
      card: '#FFFFFF',
      raised: '#EAF0F4',
      subtle: '#E8F1EE',
      hero: '#FFFFFF',
      achievement: '#F4EFE5',
    },
    text: { primary: '#1D2935', secondary: '#586578', muted: '#586578', achievement: '#765728' },
    action: {
      primary: '#2D6A61',
      'primary-hover': '#205D55',
      'primary-pressed': '#123F3C',
      'on-primary': '#FFFFFF',
      disabled: '#EAF0F4',
      'on-disabled': '#586578',
      destructive: '#924D53',
      'on-destructive': '#FFFFFF',
    },
    border: { subtle: '#DCE4E9', control: '#798B88', action: '#2D6A61' },
    focus: { ring: '#65518C' },
    progress: { fill: '#2D6A61', track: '#DCE4E9' },
    nav: { active: '#E8F1EE', 'active-accent': '#1D2935', 'bottom-active-accent': '#2D6A61' },
    edge: { '0': '#76968D', '1': '#71918E', '2': '#858B9E', '3': '#9583AE' },
    status: {
      success: { DEFAULT: '#2D6A61', tint: '#E8F1EE' },
      'in-progress': { DEFAULT: '#426D9B', tint: '#EAF1F8' },
      upcoming: { DEFAULT: '#765728', tint: '#F4EFE5' },
      'at-risk': { DEFAULT: '#8F5D36', tint: '#F4EFE5' },
      blocked: { DEFAULT: '#924D53', tint: '#F8EEEA' },
      'not-started': { DEFAULT: '#586578', tint: '#EAF0F4' },
    },
    dimension: {
      career: { DEFAULT: '#426D9B', strong: '#426D9B', tint: '#EAF1F8' },
      finance: { DEFAULT: '#805B2F', strong: '#805B2F', tint: '#F6EFE3' },
      health: { DEFAULT: '#52765B', strong: '#52765B', tint: '#EDF3EE' },
      love: { DEFAULT: '#965B4A', strong: '#965B4A', tint: '#F8EEEA' },
      passion: { DEFAULT: '#6F5C98', strong: '#6F5C98', tint: '#F1EEF7' },
      friendship: { DEFAULT: '#3F7776', strong: '#3F7776', tint: '#EAF3F2' },
      family: { DEFAULT: '#80683E', strong: '#80683E', tint: '#F5F0E5' },
    },
  },
  dark: {
    surface: {
      page: '#0B1020',
      navigation: '#151B35',
      card: '#202A46',
      raised: '#273452',
      subtle: '#151B35',
      hero: '#151B35',
      achievement: '#2E2B27',
    },
    text: { primary: '#F5F7FC', secondary: '#A8B4CC', muted: '#A8B4CC', achievement: '#D4B477' },
    action: {
      primary: '#205D55',
      'primary-hover': '#2D7266',
      'primary-pressed': '#123F3C',
      'on-primary': '#F5F7FC',
      disabled: '#273452',
      'on-disabled': '#A8B4CC',
      destructive: '#DBA6A6',
      'on-destructive': '#0B1020',
    },
    border: { subtle: '#36435D', control: '#8290AA', action: '#4B9387' },
    focus: { ring: '#B8A5D0' },
    progress: { fill: '#4B9387', track: '#273452' },
    nav: { active: '#1B302C', 'active-accent': '#4B9387', 'bottom-active-accent': '#4B9387' },
    edge: { '0': '#123F3C', '1': '#205D55', '2': '#353D60', '3': '#493566' },
    status: {
      success: { DEFAULT: '#9BBBA7', tint: '#1B302C' },
      'in-progress': { DEFAULT: '#A6C3DF', tint: '#1B2D44' },
      upcoming: { DEFAULT: '#D4B477', tint: '#2E2B27' },
      'at-risk': { DEFAULT: '#D6AE8F', tint: '#2E2B27' },
      blocked: { DEFAULT: '#DBA6A6', tint: '#35242E' },
      'not-started': { DEFAULT: '#A8B4CC', tint: '#273452' },
    },
    dimension: {
      career: { DEFAULT: '#A6C3DF', strong: '#A6C3DF', tint: '#1B2D44' },
      finance: { DEFAULT: '#D4B477', strong: '#D4B477', tint: '#302A24' },
      health: { DEFAULT: '#9BBBA7', strong: '#9BBBA7', tint: '#1B302C' },
      love: { DEFAULT: '#D5A498', strong: '#D5A498', tint: '#35242E' },
      passion: { DEFAULT: '#B8A5D0', strong: '#B8A5D0', tint: '#2C263D' },
      friendship: { DEFAULT: '#9AC2BC', strong: '#9AC2BC', tint: '#193337' },
      family: { DEFAULT: '#C6B184', strong: '#C6B184', tint: '#302C25' },
    },
  },
} as const;

export const statusColors = {
  success: { DEFAULT: '#2D6A61', tint: '#E8F1EE' },
  'in-progress': { DEFAULT: '#426D9B', tint: '#EAF1F8' },
  upcoming: { DEFAULT: '#765728', tint: '#F4EFE5' },
  'at-risk': { DEFAULT: '#8F5D36', tint: '#F4EFE5' },
  blocked: { DEFAULT: '#924D53', tint: '#F8EEEA' },
  'not-started': { DEFAULT: '#586578', tint: '#EAF0F4' },
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
