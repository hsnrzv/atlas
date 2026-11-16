import type { AtlasIconName } from '../../shared/icons/atlas-icons';

/** One destination in the app navigation. Labels use the UI vocabulary (ADR-0006). */
export interface AtlasNavLink {
  readonly label: string;
  /** Shorter label for the bottom navigation, when it differs. */
  readonly shortLabel?: string;
  readonly path: string;
  readonly icon: AtlasIconName;
}

export const MY_ATLAS: AtlasNavLink = { label: 'My Atlas', path: '/atlas', icon: 'my-atlas' };
export const DESTINATIONS: AtlasNavLink = {
  label: 'Destinations',
  path: '/destinations',
  icon: 'destinations',
};
export const WAYPOINTS: AtlasNavLink = {
  label: 'Waypoints',
  path: '/waypoints',
  icon: 'waypoints',
};
export const STEPS: AtlasNavLink = { label: 'Steps', path: '/steps', icon: 'steps' };
export const CONNECTIONS: AtlasNavLink = {
  label: 'Connections',
  path: '/connections',
  icon: 'connections',
};
export const JOURNEY: AtlasNavLink = {
  label: 'Journey Overview',
  shortLabel: 'Journey',
  path: '/journey',
  icon: 'journey-overview',
};
export const AWARDS: AtlasNavLink = {
  label: 'Milestone Awards',
  shortLabel: 'Awards',
  path: '/awards',
  icon: 'milestone-awards',
};
export const DIMENSIONS: AtlasNavLink = {
  label: 'Life Dimensions',
  path: '/dimensions',
  icon: 'life-dimensions',
};
export const SETTINGS: AtlasNavLink = { label: 'Settings', path: '/settings', icon: 'settings' };
export const PROFILE: AtlasNavLink = { label: 'Profile', path: '/profile', icon: 'profile' };
export const HELP: AtlasNavLink = { label: 'Help', path: '/help', icon: 'help' };
export const MORE: AtlasNavLink = { label: 'More', path: '/more', icon: 'menu' };
/** Onboarding (F3-4), outside the app shell and the navigation. */
export const WELCOME = { label: 'Welcome', path: '/welcome', setup: '/welcome/setup' } as const;

/** Sidebar and rail, "YOUR ATLAS" group (Figma Atlas/V3/Sidebar 152:5175). */
export const PRIMARY_NAV: readonly AtlasNavLink[] = [
  MY_ATLAS,
  DESTINATIONS,
  WAYPOINTS,
  STEPS,
  CONNECTIONS,
  JOURNEY,
  AWARDS,
  DIMENSIONS,
];

/** Sidebar and rail, bottom group. */
export const ACCOUNT_NAV: readonly AtlasNavLink[] = [SETTINGS, PROFILE, HELP];

/** Bottom navigation below 768 px (Figma Atlas/V3/BottomNavigation 152:5351). */
export const BOTTOM_NAV: readonly AtlasNavLink[] = [MY_ATLAS, DESTINATIONS, JOURNEY, AWARDS, MORE];

/** Areas reached through "More" on mobile (Figma page 05, 230:24819). */
export const MORE_GROUPS: readonly {
  readonly label: string;
  readonly links: readonly AtlasNavLink[];
}[] = [
  { label: 'Your Atlas', links: [WAYPOINTS, STEPS, CONNECTIONS, DIMENSIONS] },
  { label: 'Your space', links: [SETTINGS, PROFILE, HELP] },
];

/** Paths that keep the "More" bottom-navigation item active on mobile. */
export const MORE_PATHS: readonly string[] = [
  MORE.path,
  ...MORE_GROUPS.flatMap((group) => group.links.map((link) => link.path)),
];
