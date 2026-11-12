# Contributing to atlas (frontend)

## Workflow

- **Trunk-based development.** `main` is always releasable. Work on short-lived branches (a day or two) and merge
  through a pull request:
  - `feat/…` user-visible capability (e.g. `feat/app-shell`)
  - `fix/…` bug fixes (e.g. `fix/focus-ring-dark-theme`)
  - `docs/…` documentation, plans, ADRs, design docs
  - `chore/…` tooling, dependency updates, CI
- **Conventional Commits** for commit messages and PR titles, e.g. `feat(shell): add navigation rail`,
  `fix(theme): raise muted text contrast`, `docs(adr): propose visualization stack`, `chore(deps): bump angular to 22.2.8`.
  Use `!` or a `BREAKING CHANGE:` footer for breaking changes.
- No direct pushes to `main`. Branch protection should require the `Frontend CI` checks and a CODEOWNERS review.
- Implement **one roadmap item per PR** ([IMPLEMENTATION-ROADMAP](docs/plan/IMPLEMENTATION-ROADMAP.md)). Keep diffs
  reviewable; split refactors from behaviour changes.

## Before opening a pull request

```bash
npm run verify   # lockfile guard, design checks, ESLint, Stylelint, Prettier, unit tests, production build
npm run e2e      # Playwright + axe; required when templates, styles or routes change
```

For UI changes, attach screenshots for desktop and mobile, light and dark.

## Definition of Done (PR checklist)

The [pull request template](.github/pull_request_template.md) contains the checklist from `project-instruction.md` §19.
A change is done when:

1. Acceptance criteria are met and demonstrated.
2. Code follows repository and module boundaries. Components render state and emit intent; there is no business logic in
   components or chart callbacks, and nothing is duplicated from the backend.
3. Automated tests cover the behaviour and important edge cases.
4. Accessibility and responsive behaviour are verified: keyboard, visible focus, accessible names, contrast, colour
   never the only signal, reduced motion, 390 px / tablet / desktop.
5. API changes are versioned and documented in `atlas-microservices/docs/architecture/API-CONTRACT.md`.
6. Security and privacy implications are considered: no tokens in `localStorage`, no new CSP exceptions without an ADR.
7. CI passes, and no new critical/high vulnerability is ignored without a documented exception.
8. No secrets and no personal sample data are committed.
9. README, plan and ADRs are updated where needed.
10. The PR summary explains the changes, tests, migration steps and known limitations.

## Code conventions

- Angular 22 standalone components, `OnPush` (the default), zoneless, signals for local state, `inject()` for DI,
  native control flow (`@if`, `@for`), lazy routes per feature. Strict TypeScript and strict templates are on.
- Organise by product feature (`src/app/features/<feature>`) when features arrive. Do not create empty folders for
  future features. Cross-cutting building blocks live in `src/app/core` (singletons) and `src/app/shared` (reusable UI).
- Component selectors use the `atlas-` prefix. File names have no `.component` suffix (Angular 20+ style guide).
- Styling: semantic tokens through `var(--color-…)`, `var(--space-…)` etc. and `@use 'abstracts' as atlas;`; prefer
  semantic (`--color-text-secondary`) over primitive (`--color-neutral-…`) tokens. No raw colour literals in `src/app` (Stylelint
  enforces this). Prefer Material component overrides in `src/styles/material/_theme.scss` to ad-hoc `::ng-deep`.
- Icons: add the Tabler icon to `ATLAS_ICONS` under a semantic name and use `<atlas-icon>`. Never import Tabler icons
  directly in feature components.
- Copy: use the design vocabulary ([ADR-0006](docs/adr/0006-ui-vocabulary-and-domain-mapping.md)).

## Design tokens and assets

1. Edit `design/tokens/*.json` (and `contrast-pairs.json` if you add a foreground/background pair).
2. `npm run tokens:build`, then `npm run contrast:check`. Commit the JSON together with the regenerated files.
3. Brand SVG masters live in `design/svg/logo`. After a change, run `npm run assets:export` and `npm run assets:validate`.
4. Do not hand-edit anything under `src/styles/tokens/`, `tokens.generated.ts`, `_theme-colors.scss` or
   `design/exports/`.

## Dependencies

Every new dependency needs a concrete use, a current release compatible with Angular 22, and an acceptable license
(no copyleft in the shipped bundle and no premium-only features). Record it in
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and the
[dependency/license matrix](docs/architecture/DEPENDENCY-LICENSE-MATRIX.md) in the same PR. Keep
`package-lock.json` on the public npm registry (`npm run lockfile:check`).

## Architecture decisions

Significant or hard-to-reverse choices get an ADR in [`docs/adr/`](docs/adr/README.md), copied from
[`0000-template.md`](docs/adr/0000-template.md). Open decisions stay `Proposed` until the owner accepts them.
Cross-repository decisions (topology, vocabulary, roadmap) are recorded here. Backend and infrastructure decisions
live in their own repositories.
