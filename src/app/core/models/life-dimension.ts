/** Backend Ikigai area key (API-CONTRACT §9.4). The UI calls these Life Dimensions (ADR-0006). */
export type IkigaiAreaKey =
  'CAREER' | 'FINANCE' | 'HEALTH' | 'LOVE' | 'PASSION' | 'FRIENDSHIP' | 'FAMILY';

/**
 * An item of `GET /api/v1/ikigai/areas` (API-CONTRACT §9.4). `focused` marks the areas chosen in onboarding
 * (FQ-17); `colorToken` names a design token, never a raw colour.
 */
export interface IkigaiArea {
  readonly key: IkigaiAreaKey;
  readonly label: string;
  readonly colorToken: string;
  readonly sortOrder: number;
  readonly hidden: boolean;
  readonly focused: boolean;
  readonly version: number;
}
