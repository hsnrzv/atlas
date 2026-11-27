# ADR-0002: Repository topology and ownership

- Status: Accepted
- Date: 2026-11-12, amended 2026-11-27 (documentation ownership)
- Deciders: @hsnrzv (owner)

## Context

`project-instruction.md` §0.3 asks for separate frontend and backend repositories and recommends a third GitOps
repository, because manifests should have their own lifecycle and review history. The owner had already created three
empty GitHub repositories: `hsnrzv/atlas`, `hsnrzv/atlas-microservices` and `hsnrzv/atlas-infra`. The specification
calls them `atlas-frontend`, `atlas-backend` and `atlas-infra`. §2.3 and §11.1 require a modular monolith, not
microservices.

## Decision

Three repositories, each with a single owner role:

| Repository (GitHub)   | Spec name        | Owns                                                                                                                                                                                                                                            | Must not own                                           |
| --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `atlas`               | `atlas-frontend` | Angular 22 + Capacitor 8 client, frontend tests, static and brand assets, the `design/` system, the frontend container build, **cross-repository docs** (system context, implementation roadmap, dependency/license matrix, cross-cutting ADRs) | migrations, backend business rules, production secrets |
| `atlas-microservices` | `atlas-backend`  | Spring Boot **modular monolith** (one deployable, base package `dev.myatlas`), Flyway migrations, the API contract, backend tests, the backend container build, backend/database plans                                                          | Angular code, cluster or environment secrets           |
| `atlas-infra`         | `atlas-infra`    | local full-stack Compose, Kustomize bases/overlays, Argo CD project and applications, environment configuration templates, runbooks, infrastructure/CI-CD plan, cost comparison                                                                 | business logic, plaintext credentials                  |

- The name `atlas-microservices` is historical. It contains one modular monolith (`atlas-microservices` ADR-0002), and
  its README says so.
- npm package `atlas-frontend` and Maven artifact `atlas-backend` keep the specification names. Images are
  `ghcr.io/hsnrzv/atlas-frontend` and `ghcr.io/hsnrzv/atlas-backend`, with immutable tags or digests (never `latest`
  outside local).
- **Integration contract.** Both containers listen on `8080`. The edge or Ingress routes `/api/` to the backend and
  everything else to the frontend. The API base path is `/api/v1`. Frontend health is `GET /healthz`; backend health
  is `/actuator/health/{liveness,readiness}`. The backend is configured through `SPRING_PROFILES_ACTIVE` and
  `SPRING_DATASOURCE_*`. Local ports: PostgreSQL 5432, backend 8080, `ng serve` 4200 (proxying `/api`), full-stack
  edge 8000. The frontend calls the API with same-origin relative URLs, so no API host is baked into the bundle.
- **Delivery flow.** The application repositories build and test, then publish images. A bot PR in `atlas-infra`
  updates the tag and digest per environment, and Argo CD syncs (`atlas-infra` ADR-0002). The repositories are checked
  out side by side (`project-atlas/{atlas,atlas-microservices,atlas-infra}`) for the local full stack.

## Consequences

- Each repository has a focused CI, CODEOWNERS and release cadence. Deployments are auditable as PRs in
  `atlas-infra`.
- A change that crosses the API boundary needs coordinated PRs: backend first (backward-compatible), then frontend.
  The roadmap orders them that way.
- Cross-repository documentation lives in one place (`atlas/docs`), but every repository's README links to it. It
  stays at system level; repository-specific details live in their repository (amendment 2026-11-27).
- Same-origin routing avoids CORS and keeps cookie-based BFF authentication possible (`atlas-microservices`
  ADR-0005, proposed).

## Amendment 2026-11-27 (documentation ownership)

The cross-repository docs in `atlas` had started to repeat backend versions, the backend dependency inventory and
backend item status. They drifted after every backend upgrade. From now on:

- `atlas/docs` keeps only **system-level** material: system context and runtime contract, cross-repository phase
  coordination and gates (backend items as ID ranges only), the licence **policy** and artifact summary, cross-cutting
  ADRs, and the frontend's own plans and design docs.
- Each repository owns its **stack versions, dependency inventory (`THIRD-PARTY-NOTICES.md`), plans, backlog,
  item-level status and open licence items**. For the backend that is `atlas-microservices` (README, `PLAN-BACKEND`,
  `PLAN-DATABASE`, `docs/implementation/roadmap.md`, `THIRD-PARTY-NOTICES.md`, ADRs).
- `atlas` documents link to the backend sources instead of copying them. A backend dependency change updates only the
  backend repository, unless it changes the licence policy, what ships in an artifact, or the integration contract.

## Alternatives considered

- **Two repositories with GitOps inside the backend repository** (allowed by §0.3): fewer repositories, but
  deployment history gets mixed with Java changes, and application CI gains write access to environment state.
- **Monorepo (Nx or similar) for all three:** atomic cross-cutting changes, but it contradicts the requested
  separation, adds tooling, and couples release cadences.
- **Renaming `atlas-microservices` to `atlas-backend`:** clearer, but the owner decided to keep the existing
  repository. Rename later if wanted; GitHub redirects old URLs.

## References

- `project-instruction.md` §0.3, §2.3, §11.1, §15.4, §16
- `atlas-microservices` ADR-0002 (modular monolith), `atlas-infra` ADR-0002 (GitOps with Argo CD and Kustomize in a separate infra repo)
- [CONTEXT.md](../architecture/CONTEXT.md)
