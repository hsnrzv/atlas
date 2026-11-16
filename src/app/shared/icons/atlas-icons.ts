import type { TablerIcon } from '@tabler/icons-angular';
import {
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconAward,
  IconBell,
  IconBriefcase,
  IconCalendarWeek,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleX,
  IconCompass,
  IconDots,
  IconFlag,
  IconFocus2,
  IconHeart,
  IconHeartbeat,
  IconHelp,
  IconHome,
  IconLayoutGrid,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconList,
  IconListCheck,
  IconLoader2,
  IconLock,
  IconMapPin,
  IconMenu2,
  IconNotebook,
  IconOrbit,
  IconPencil,
  IconPlayerSkipForward,
  IconPlus,
  IconRoute,
  IconSearch,
  IconSettings,
  IconSitemap,
  IconSparkles,
  IconTrash,
  IconUser,
  IconUsers,
  IconWallet,
  IconX,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from '@tabler/icons-angular';

/**
 * Semantic icon registry (ADR-0005: Tabler Icons, outline family only). Glyphs are the closest Tabler match to
 * Figma V3 `Atlas/V3/Icon` (152:2139); see docs/design/component-mapping.md §2.
 * Features reference icons by meaning, never by Tabler name, so a glyph can be swapped in one place.
 * Each entry is a tree-shakable icon object; no global icon provider is required.
 */
export const ATLAS_ICONS = {
  // Primary navigation (UI vocabulary, ADR-0006).
  'my-atlas': IconCompass,
  destinations: IconFlag,
  waypoints: IconMapPin,
  steps: IconListCheck,
  connections: IconSitemap,
  'journey-overview': IconRoute,
  'milestone-awards': IconAward,
  'life-dimensions': IconOrbit,

  // Life Dimensions (must match design/tokens/design-tokens.json → lifeDimensions.icons).
  career: IconBriefcase,
  finance: IconWallet,
  health: IconHeartbeat,
  love: IconHeart,
  passion: IconSparkles,
  friendship: IconUsers,
  family: IconHome,

  // Actions and utilities.
  add: IconPlus,
  edit: IconPencil,
  delete: IconTrash,
  notes: IconNotebook,
  calendar: IconCalendarWeek,
  filter: IconAdjustmentsHorizontal,
  search: IconSearch,
  settings: IconSettings,
  profile: IconUser,
  help: IconHelp,
  notifications: IconBell,
  next: IconArrowRight,
  check: IconCheck,
  alert: IconAlertCircle,
  loading: IconLoader2,
  expand: IconChevronRight,
  collapse: IconChevronDown,
  back: IconArrowLeft,
  close: IconX,
  menu: IconMenu2,
  more: IconDots,
  locked: IconLock,
  'sidebar-collapse': IconLayoutSidebarLeftCollapse,
  'sidebar-expand': IconLayoutSidebarLeftExpand,
  'view-grid': IconLayoutGrid,
  'view-list': IconList,
  // Not in Figma V3: reorder a Waypoint or Step among its siblings (F3-2).
  'move-up': IconArrowUp,
  'move-down': IconArrowDown,
  // Connections graph toolbar (Figma page 09).
  'zoom-in': IconZoomIn,
  'zoom-out': IconZoomOut,
  'zoom-reset': IconZoomReset,
  focus: IconFocus2,

  // Status (always paired with a text label; colour is never the only signal).
  // Glyphs follow the Figma V3 status chips (Foundations 214:1794).
  'status-success': IconCheck,
  'status-in-progress': IconLoader2,
  'status-upcoming': IconCalendarWeek,
  'status-at-risk': IconAlertCircle,
  'status-blocked': IconLock,
  'status-not-started': IconFlag,
  // Not in Figma V3: neutral glyphs for the stored SKIPPED and CANCELLED work states (D14).
  'status-skipped': IconPlayerSkipForward,
  'status-cancelled': IconCircleX,
} as const satisfies Record<string, TablerIcon>;

export type AtlasIconName = keyof typeof ATLAS_ICONS;
