import type { TablerIcon } from '@tabler/icons-angular';
import {
  IconAdjustmentsHorizontal,
  IconAffiliate,
  IconAlertTriangle,
  IconArrowLeft,
  IconAward,
  IconBan,
  IconBell,
  IconBriefcase,
  IconCalendarEvent,
  IconChevronRight,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleDot,
  IconCompass,
  IconDotsVertical,
  IconFlag,
  IconHeart,
  IconHeartbeat,
  IconHelp,
  IconHome,
  IconHourglass,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconListCheck,
  IconLock,
  IconMapPin,
  IconMenu2,
  IconNotebook,
  IconPencil,
  IconPlus,
  IconProgress,
  IconRoute,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTrash,
  IconUser,
  IconUsers,
  IconWallet,
  IconX,
} from '@tabler/icons-angular';

/**
 * Semantic icon registry (ADR-0005: Tabler Icons, outline family only).
 * Features reference icons by meaning, never by Tabler name, so a glyph can be swapped in one place.
 * Each entry is a tree-shakable icon object; no global icon provider is required.
 */
export const ATLAS_ICONS = {
  // Primary navigation (UI vocabulary, ADR-0006).
  'my-atlas': IconCompass,
  destinations: IconFlag,
  waypoints: IconMapPin,
  steps: IconListCheck,
  connections: IconAffiliate,
  'journey-overview': IconRoute,
  'milestone-awards': IconAward,
  'life-dimensions': IconCircleDot,

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
  calendar: IconCalendarEvent,
  filter: IconAdjustmentsHorizontal,
  search: IconSearch,
  settings: IconSettings,
  profile: IconUser,
  help: IconHelp,
  notifications: IconBell,
  expand: IconChevronRight,
  back: IconArrowLeft,
  close: IconX,
  menu: IconMenu2,
  more: IconDotsVertical,
  locked: IconLock,
  'sidebar-collapse': IconLayoutSidebarLeftCollapse,
  'sidebar-expand': IconLayoutSidebarLeftExpand,

  // Status (always paired with a text label; colour is never the only signal).
  'status-success': IconCircleCheck,
  'status-in-progress': IconProgress,
  'status-upcoming': IconHourglass,
  'status-at-risk': IconAlertTriangle,
  'status-blocked': IconBan,
  'status-not-started': IconCircleDashed,
} as const satisfies Record<string, TablerIcon>;

export type AtlasIconName = keyof typeof ATLAS_ICONS;
