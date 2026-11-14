# Architecture Decision Records (atlas)

Format and rules: [ADR-0001](0001-record-architecture-decisions.md). Copy [`0000-template.md`](0000-template.md) for a
new record and use the next free number.

This repository holds the **cross-cutting** decisions for all three repositories (topology, UI stack, visualization,
icons, vocabulary, tokens) and the frontend-only ones.

| ADR                                               | Title                                                                               | Status   | Date       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ---------- |
| [0001](0001-record-architecture-decisions.md)     | Record architecture decisions                                                       | Accepted | 2026-11-12 |
| [0002](0002-repository-topology-and-ownership.md) | Repository topology and ownership                                                   | Accepted | 2026-11-12 |
| [0003](0003-ui-component-stack.md)                | UI component stack — Angular 22, Angular Material/CDK, SCSS tokens, Capacitor 8     | Accepted | 2026-11-12 |
| [0004](0004-visualization-stack.md)               | Visualization stack — purpose-specific, open-source libraries behind Atlas wrappers | Proposed | 2026-11-12 |
| [0005](0005-icon-library-tabler.md)               | Icon library — Tabler Icons behind a semantic `<atlas-icon>` registry               | Accepted | 2026-11-12 |
| [0006](0006-ui-vocabulary-and-domain-mapping.md)  | UI vocabulary and domain mapping                                                    | Accepted | 2026-11-12 |
| [0007](0007-design-tokens-source-of-truth.md)     | Design tokens in JSON are the single source of truth                                | Accepted | 2026-11-12 |
| [0008](0008-frontend-test-toolchain.md)           | Frontend test toolchain — Vitest via the Angular CLI, Playwright with axe-core      | Accepted | 2026-11-12 |
| [0009](0009-signal-forms.md)                      | Use Angular Signal Forms for all forms                                              | Accepted | 2026-11-14 |
| [0010](0010-figma-visual-source-of-truth.md)      | Figma V3 is the visual source of truth at design time only (amends 0005, 0007)      | Accepted | 2026-11-14 |

Status meanings: **Proposed** (awaiting owner review), **Accepted** (owner decision or Phase 1 baseline implemented and
verified), **Superseded by ADR-NNNN**.

Decisions owned by the other repositories:

- `atlas-microservices/docs/adr/`: modular monolith, PostgreSQL/Flyway/JPA, schema strategy, authentication (OIDC,
  BFF, PKCE), REST/OpenAPI/Problem Details, Java/Spring Boot baseline.
- `atlas-infra/docs/adr/`: GitOps (Argo CD + Kustomize), Kubernetes platform, database hosting, secrets management,
  frontend hosting, database migration execution and more. See that index.
