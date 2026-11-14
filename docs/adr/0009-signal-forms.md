# ADR-0009: Use Angular Signal Forms for all forms

- Status: Accepted (2026-11-14, roadmap decision R-1)
- Date: 2026-11-14
- Deciders: @hsnrzv (owner)

## Context

The app needs forms for Destinations, Waypoints, Steps, notes, onboarding and settings (Figma V3 pages 06–08 and 14;
backlog F3-1…F3-4). `.github/copilot-instructions.md` currently says "typed reactive forms" and F3-1 says "Material
forms". The production brief (2026-11-14) asks for Signal Forms over Reactive Forms.

Facts verified on 2026-11-14 in `node_modules/@angular/forms` 22.2.6: the `@angular/forms/signals` entry point exports
`form()`, `schema()`, validators (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `email`,
`validate`, `validateStandardSchema`), `submit()` and the `FormField` directive (`[formField]`). `form()` is
annotated `@publicApi 22.0`. Only `provideExperimentalWebMcpForms` is marked experimental.

State in the app is held in signals (frontend architecture §7). Signal Forms keeps the form model as a signal and
validation as a schema, so stores and forms share one reactive model.

## Decision

- We will build every new form with Signal Forms (`@angular/forms/signals`). Reactive and template-driven forms are
  not used in new code.
- Inputs are Angular Material form controls (`mat-form-field`, `matInput`, `mat-select`, `mat-datepicker`) bound with
  `[formField]`.
- Validation lives in a `schema` next to the form model. Server validation errors (Problem Details field errors) map to
  field errors through the submit result.
- A spike (backlog F3-0) checks Material error-state matching, `aria-describedby`/`aria-invalid` and the date picker
  with Signal Forms before F3-1. If a gap is found, a small `atlas` directive bridges it; we do not fall back to
  Reactive Forms without amending this ADR.

## Consequences

- One reactive model (signals) across stores and forms; less RxJS in components.
- `.github/copilot-instructions.md` and F3-1 change from "typed reactive forms" to Signal Forms.
- Fewer community examples than Reactive Forms; the F3-0 spike reduces the risk.
- Component tests cover validation messages, keyboard use and screen-reader announcements for each form.

## Alternatives considered

- **Typed reactive forms:** mature and well documented, but a second reactive model (Observables) next to signals,
  and no longer the recommended direction for new Angular code.
- **Template-driven forms:** weaker typing and harder to test for complex nested forms.

## References

- `@angular/forms/signals` in Angular 22.2 (`node_modules/@angular/forms/types/signals.d.ts`)
- [frontend.md §8](../architecture/frontend.md#8-forms)
- ADR-0003 (UI component stack)
