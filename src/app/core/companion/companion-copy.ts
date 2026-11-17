/**
 * Static, curated companion copy and expression art keyed by trigger (frontend.md §9, Figma pages 05, 11 and 14 and
 * the V3 refinement expressions). Nothing is generated, scored or inferred: the companion only frames values the
 * backend reported. It lives in `core` because more than one feature shows it and features never import each other.
 */
export type CompanionTrigger =
  'next-step' | 'waypoint-achieved' | 'welcome' | 'fresh-start' | 'plan-unchanged';

/**
 * The eight companion expressions of Figma "Reference · V3 approved refinement" → B · Intelligent companion →
 * `Atlas/Refine/V3/Companion/Expressions` (`141:2443`). Expressions change the face, never the body.
 */
export type CompanionExpression =
  | 'welcome'
  | 'encouraging'
  | 'celebrating'
  | 'surprised'
  | 'thinking'
  | 'guiding'
  | 'supportive'
  | 'idle';

export interface CompanionArt {
  /** Figma `State=` variant name. */
  readonly label: string;
  /** Raster in `public/companion/`, exported from the Figma image node. */
  readonly src: string;
  /** Figma usage note for the expression. */
  readonly usage: string;
  readonly figmaNode: string;
}

/**
 * Raster candidates from Figma (240 × 240, baked-in dark background). They are shown only when the `companionArt`
 * flag is on; otherwise the art slot shows the Atlas symbol (roadmap R-9: the art is not rights-cleared yet).
 */
export const COMPANION_ART: Readonly<Record<CompanionExpression, CompanionArt>> = {
  welcome: {
    label: 'Welcome',
    src: 'companion/welcome.png',
    usage: 'First greeting and onboarding.',
    figmaNode: '141:2395',
  },
  encouraging: {
    label: 'Happy · Encouraging',
    src: 'companion/encouraging.png',
    usage: 'Small user-confirmed steps; encouragement without evaluation.',
    figmaNode: '141:2401',
  },
  celebrating: {
    label: 'Celebrating',
    src: 'companion/celebrating.png',
    usage: 'User-confirmed milestones only.',
    figmaNode: '141:2407',
  },
  surprised: {
    label: 'Surprised',
    src: 'companion/surprised.png',
    usage: 'Optional playful response. Never for errors or risk.',
    figmaNode: '141:2413',
  },
  thinking: {
    label: 'Thinking',
    src: 'companion/thinking.png',
    usage: 'Illustrative pose only. Never claims analysis.',
    figmaNode: '141:2419',
  },
  guiding: {
    label: 'Guiding',
    src: 'companion/guiding.png',
    usage: 'Opt-in next-step cue.',
    figmaNode: '141:2425',
  },
  supportive: {
    label: 'Supportive',
    src: 'companion/supportive.png',
    usage: 'Offers a choice to pause or continue. Never pity or disappointment.',
    figmaNode: '141:2431',
  },
  idle: {
    label: 'Idle · Neutral',
    src: 'companion/idle.png',
    usage: 'Quiet resting state.',
    figmaNode: '141:2437',
  },
};

export interface CompanionCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly expression: CompanionExpression;
}

export const COMPANION_COPY: Readonly<Record<CompanionTrigger, CompanionCopy>> = {
  'next-step': {
    eyebrow: 'At your pace',
    title: 'Choose one meaningful next step.',
    expression: 'guiding',
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
  'fresh-start': {
    eyebrow: 'At your pace',
    title: 'One meaningful intention is enough to begin.',
    expression: 'encouraging',
  },
  'plan-unchanged': {
    eyebrow: 'Your companion',
    title: 'Pause here, or try again when you are ready.',
    expression: 'supportive',
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
