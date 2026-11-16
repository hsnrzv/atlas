/**
 * Static, curated companion copy keyed by trigger (frontend.md §9, Figma pages 05, 11 and 14). Nothing is generated,
 * scored or inferred: the companion only frames values the backend reported. It lives in `core` because more than
 * one feature shows it and features never import each other.
 */
export type CompanionTrigger = 'next-step' | 'waypoint-achieved' | 'welcome';

/** Figma companion expressions; the art slot uses them once the art is cleared (roadmap R-9). */
export type CompanionExpression = 'welcome' | 'encouraging' | 'celebrating' | 'supportive';

export interface CompanionCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly expression: CompanionExpression;
}

export const COMPANION_COPY: Readonly<Record<CompanionTrigger, CompanionCopy>> = {
  'next-step': {
    eyebrow: 'At your pace',
    title: 'Choose one meaningful next step.',
    expression: 'encouraging',
  },
  'waypoint-achieved': {
    eyebrow: 'Your companion',
    title: 'A meaningful step forward',
    expression: 'celebrating',
  },
  welcome: {
    eyebrow: 'Your companion',
    title: 'A little support, on your terms.',
    expression: 'welcome',
  },
};

export const COMPANION_MODE_COPY = {
  heading: 'Your companion, your choice',
  description:
    'The companion is optional. It never plays audio, analyses your plan or keeps streaks. Choose how it appears.',
  on: {
    label: 'Show companion',
    description: 'A short, static note with the companion art slot.',
  },
  muted: {
    label: 'Mute',
    description: 'A quieter note without art or animation.',
  },
  off: {
    label: 'Disable',
    description: 'No companion anywhere in the app.',
  },
} as const;
