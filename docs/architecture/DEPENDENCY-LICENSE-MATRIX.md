# Dependency and license matrix (all repositories)

- Status: Phase 0 deliverable (`project-instruction.md` §18). Snapshot of **2026-11-12**.
- Sources of truth: each repository's `THIRD-PARTY-NOTICES.md`, which lists exact versions, copyright holders and the
  method used to check them. This matrix consolidates them. It does not replace them, and if the two disagree, the
  repository notice wins.
  - `atlas/THIRD-PARTY-NOTICES.md` (frontend; checked against `package-lock.json` and package metadata)
  - `atlas-microservices/THIRD-PARTY-NOTICES.md` (backend; checked with `license-maven-plugin:add-third-party`)
  - `atlas-infra/THIRD-PARTY-NOTICES.md` (images, tools and Actions; checked against the GitHub license API)
- Project license: **not chosen** in any repository (open decision 21 in
  [IMPLEMENTATION-ROADMAP](../plan/IMPLEMENTATION-ROADMAP.md#4-open-decisions-consolidated)).

## 1. License policy

| Class                   | Licenses                                                                                                                                                                              | Rule                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Allowed                 | MIT, ISC, 0BSD, BSD-2-Clause, BSD-3-Clause, Apache-2.0, PostgreSQL, OFL-1.1 (fonts), EDL-1.0, CC0-1.0                                                                                 | Use freely; keep notices.                                                                         |
| Allowed with conditions | EPL-2.0, MPL-2.0, LGPL (dynamic linking), GPL-2.0 with Classpath Exception (JDK)                                                                                                      | Use unmodified binaries only. Record the use here. A change to the component itself needs an ADR. |
| Tool-only               | GPL-3.0 (ShellCheck, yamllint), LGPL-3.0 (libvips through `sharp`)                                                                                                                    | Allowed as CI/developer tools that are never linked into or shipped with an artifact.             |
| Not allowed             | GPL/AGPL linked into a shipped artifact; SSPL; BUSL and other source-available licenses; commercial or non-commercial-only licenses (for example FullCalendar Premium and Highcharts) | Rejected in review. Exceptions need an ADR and owner approval.                                    |
| Unknown                 | missing or ambiguous metadata                                                                                                                                                         | Resolve before merging. Record the evidence in the repository notice.                             |

Enforcement:

- `atlas` and `atlas-microservices` CI run `actions/dependency-review-action` on PRs.
- `atlas` checks that the lockfile resolves only from the public npm registry (`npm run lockfile:check`).
- An automated license allow-list gate is planned:
  - `atlas`: F2-11. License allow-list scan of the production tree; tool and license to verify.
  - `atlas-microservices`: BE-1.13, CycloneDX SBOM plus a policy check.

## 2. Summary by artifact

| Artifact                                       | What ships                                                                                       | License mix                                                          | Copyleft in the artifact                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------- |
| Frontend web bundle (`dist/atlas-frontend`)    | Angular, Material/CDK, Capacitor core, Tabler icons, RxJS, tslib, 2 fonts, 4 transitive packages | MIT, Apache-2.0, 0BSD, BSD-2-Clause, OFL-1.1                         | none                                                  |
| Frontend image `ghcr.io/hsnrzv/atlas-frontend` | bundle + `nginxinc/nginx-unprivileged:1.30-alpine`                                               | nginx BSD-2-Clause; Alpine packages (mixed, incl. GPL OS tools)      | OS packages only, unmodified                          |
| Backend jar `atlas-backend.jar`                | 89 libraries (Spring Boot 4.1.2, Hibernate 7.4, Tomcat 11, Jackson 3, Flyway 12, Modulith 2.1)   | mostly Apache-2.0; MIT, BSD, EPL-2.0, EDL-1.0, Logback EPL/LGPL dual | weak copyleft only (EPL-2.0, LGPL option), unmodified |
| Backend image `ghcr.io/hsnrzv/atlas-backend`   | jar + `eclipse-temurin:21-jre-noble`                                                             | OpenJDK GPL-2.0 with Classpath Exception; Ubuntu packages (mixed)    | JDK and OS, unmodified                                |
| `atlas-infra`                                  | manifests only; no redistributed binaries                                                        | —                                                                    | —                                                     |
| Native apps (Phase 10)                         | web bundle + Capacitor runtime and plugins                                                       | to assess in Phase 10                                                | to assess                                             |

## 3. Inventory

### 3.1 `atlas` (frontend)

| Component                                                                        | Version                                  | License                          | Scope                                  |
| -------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------- | -------------------------------------- |
| `@angular/core`, `common`, `compiler`, `forms`, `platform-browser`, `router`     | 22.2.6                                   | MIT                              | shipped                                |
| `@angular/material`, `@angular/cdk`                                              | 22.2.7                                   | MIT                              | shipped                                |
| `@capacitor/core`                                                                | 8.6.0                                    | MIT                              | shipped                                |
| `@tabler/icons-angular`, `@tabler/icons`                                         | 3.51.0                                   | MIT                              | shipped                                |
| `rxjs`                                                                           | 7.8.2                                    | Apache-2.0                       | shipped                                |
| `tslib`                                                                          | 2.9.1                                    | 0BSD                             | shipped                                |
| `@fontsource-variable/inter`, `@fontsource/dm-serif-display`                     | 5.3.0                                    | OFL-1.1                          | shipped                                |
| `parse5`, `entities`, `zod`, `@standard-schema/spec`                             | 8.1.1, 9.0.0, 4.6.6, 1.1.0               | MIT, BSD-2-Clause, MIT, MIT      | shipped (transitive)                   |
| `nginxinc/nginx-unprivileged:1.30-alpine`                                        | 1.30                                     | BSD-2-Clause (+ Alpine packages) | runtime image                          |
| `node:26-alpine`                                                                 | 26                                       | MIT (+ bundled)                  | build stage only                       |
| Angular CLI/build/compiler-cli, Capacitor CLI                                    | 22.2.6, 8.6.0                            | MIT                              | dev                                    |
| TypeScript                                                                       | 6.0.3                                    | Apache-2.0                       | dev                                    |
| Vitest, jsdom                                                                    | 5.1.0, 30.1.3                            | MIT                              | dev                                    |
| Playwright                                                                       | 1.65.0                                   | Apache-2.0                       | dev                                    |
| `@axe-core/playwright`, `axe-core`                                               | 4.14.0                                   | MPL-2.0                          | dev (tests, unmodified)                |
| ESLint, angular-eslint, typescript-eslint, stylelint, prettier                   | 10.14.0, 22.6.0, 8.71.0, 17.16.0, 3.10.1 | MIT                              | dev                                    |
| `sharp` / `@img/sharp-libvips-*`                                                 | 0.35.5 / 1.3.4                           | Apache-2.0 / LGPL-3.0-or-later   | dev tool (asset export), never shipped |
| Actions: `checkout`, `setup-node`, `upload-artifact`, `dependency-review-action` | v7, v7, v7, v5                           | MIT                              | CI                                     |
| Actions: `docker/setup-buildx-action`, `docker/build-push-action`                | v4, v7                                   | Apache-2.0                       | CI                                     |

### 3.2 `atlas-microservices` (backend)

| Component                                                                        | Version                                   | License                                                                     | Scope                                   |
| -------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------- |
| Spring Boot starters (webmvc, actuator, validation, data-jpa, flyway)            | 4.1.2                                     | Apache-2.0                                                                  | shipped                                 |
| Spring Framework / Spring Data JPA                                               | 7.0.10 / 4.1.2                            | Apache-2.0                                                                  | shipped (transitive)                    |
| Spring Modulith (core starter; api, core, moments)                               | 2.1.1                                     | Apache-2.0                                                                  | shipped                                 |
| Hibernate ORM / Hibernate Validator                                              | 7.4.13.Final / 9.1.5.Final                | Apache-2.0                                                                  | shipped (transitive)                    |
| Flyway core + `flyway-database-postgresql`                                       | 12.4.0                                    | Apache-2.0                                                                  | shipped                                 |
| PostgreSQL JDBC                                                                  | 42.7.14                                   | BSD-2-Clause                                                                | shipped                                 |
| Tomcat embed                                                                     | 11.0.27                                   | Apache-2.0                                                                  | shipped (transitive)                    |
| Jackson 3 / annotations 2.x                                                      | 3.1.7 / 2.21                              | Apache-2.0                                                                  | shipped (transitive)                    |
| HikariCP, Micrometer, SnakeYAML, Byte Buddy, ArchUnit, jMolecules                | 7.0.2, 1.17.2, 2.6, 1.18.15, 1.4.2, 2.0.1 | Apache-2.0                                                                  | shipped (transitive)                    |
| Logback                                                                          | 1.5.38                                    | EPL-2.0 OR LGPL-2.1-only                                                    | shipped (transitive, unmodified)        |
| SLF4J, Checker Qual                                                              | 2.0.20, 3.55.1                            | MIT                                                                         | shipped (transitive)                    |
| ANTLR 4 runtime                                                                  | 4.13.2                                    | BSD-3-Clause                                                                | shipped (transitive)                    |
| AspectJ weaver                                                                   | 1.9.25.1                                  | EPL-2.0                                                                     | shipped (transitive, unmodified)        |
| Jakarta Persistence / Annotations / Transaction APIs                             | 3.2.0 / 3.0.0 / 2.0.1                     | EPL-2.0 OR EDL-1.0 / EPL-2.0 OR GPL-2.0 with CPE                            | shipped (transitive)                    |
| Jakarta XML Binding, JAXB, Activation                                            | 4.0.x, 2.1.4, 2.0.3                       | EDL-1.0 (BSD-3-Clause)                                                      | shipped (transitive)                    |
| HdrHistogram                                                                     | 2.2.2                                     | BSD-2-Clause OR CC0-1.0                                                     | shipped (transitive)                    |
| `spring-boot-docker-compose`                                                     | 4.1.2                                     | Apache-2.0                                                                  | local runtime, optional, not in the jar |
| Testcontainers (junit-jupiter, postgresql)                                       | 2.0.5                                     | MIT                                                                         | test                                    |
| JUnit 6, Mockito, AssertJ, Hamcrest, Awaitility, JNA                             | 6.0.3, 5.23.0, 3.27.7, 3.0, 4.3.0, 5.18.1 | EPL-2.0, MIT, Apache-2.0, BSD-3-Clause, Apache-2.0, Apache-2.0 OR LGPL-2.1+ | test                                    |
| Maven 3.10.0 (Wrapper 3.3.4) and plugins                                         | —                                         | Apache-2.0                                                                  | build                                   |
| `eclipse-temurin:21-jdk-noble` / `21-jre-noble`                                  | 21.0.13                                   | GPL-2.0 with Classpath Exception (+ Ubuntu packages)                        | build / runtime image                   |
| `postgres:18.6-alpine`                                                           | 18.6                                      | PostgreSQL License; image definitions MIT                                   | local, tests, CI smoke                  |
| Actions: `checkout`, `setup-java`, `upload-artifact`, `dependency-review-action` | v7, v6, v7, v5                            | MIT                                                                         | CI                                      |
| Actions: `docker/setup-buildx-action`, `docker/build-push-action`                | v4, v7                                    | Apache-2.0                                                                  | CI                                      |

### 3.3 `atlas-infra`

| Component                                                | Version             | License                                                                       | Scope               |
| -------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------- | ------------------- |
| `postgres:18.6-alpine`                                   | 18.6                | PostgreSQL License; image definitions MIT                                     | local stack         |
| `nginx:1.30-alpine`                                      | 1.30                | BSD-2-Clause                                                                  | local edge proxy    |
| kubectl (bundled Kustomize)                              | v1.37.2             | Apache-2.0                                                                    | CI/local validation |
| kubeconform                                              | v0.8.0              | Apache-2.0                                                                    | CI/local validation |
| Kubernetes JSON schemas (`yannh/kubernetes-json-schema`) | fetched at run time | **to verify** (no SPDX on GitHub; derived from Apache-2.0 Kubernetes OpenAPI) | CI data             |
| CRDs catalog (`datreeio/CRDs-catalog`)                   | pinned commit       | MIT                                                                           | CI data             |
| ShellCheck, yamllint                                     | v0.11.0, 1.38.0     | GPL-3.0                                                                       | CI tools only       |
| pipx, Docker Compose                                     | runner-provided     | MIT, Apache-2.0                                                               | CI/local tools      |
| Actions: `checkout`, `upload-artifact`                   | v7                  | MIT                                                                           | CI                  |

## 4. Proposed, not installed

Versions are those seen on 2026-11-12. Re-verify the version and license when the component is added.

| Component                                                                    | Repo                  | Phase                        | Version seen        | License                  | Record                    |
| ---------------------------------------------------------------------------- | --------------------- | ---------------------------- | ------------------- | ------------------------ | ------------------------- |
| `echarts`, `ngx-echarts`                                                     | atlas                 | 5                            | 6.1.0, 22.0.0       | Apache-2.0, MIT          | ADR-0004 (atlas)          |
| `vis-timeline` (+ `vis-data`, `moment`, `@egjs/hammerjs`, …)                 | atlas                 | 5 (spike)                    | 8.5.6               | Apache-2.0 OR MIT        | ADR-0004 (atlas)          |
| `@fullcalendar/angular`, `fullcalendar`, `temporal-polyfill` (Standard only) | atlas                 | 5                            | 7.1.4, 7.1.4, 1.0.8 | MIT                      | ADR-0004 (atlas)          |
| `d3` (only if needed)                                                        | atlas                 | 5+                           | 7.9.2               | ISC                      | ADR-0004 (atlas)          |
| OpenAPI types generator                                                      | atlas                 | 3 (F3-5)                     | to verify           | to verify                | PLAN-FRONTEND D3          |
| Markdown renderer + sanitiser for notes                                      | atlas                 | later                        | to verify           | to verify                | PLAN-FRONTEND D13         |
| springdoc-openapi 3.x                                                        | backend               | 3 (BE-3.05)                  | to verify           | Apache-2.0 (to verify)   | backend ADR-0006          |
| Spring Security / OAuth2 resource server                                     | backend               | 3 (BE-3.03)                  | Boot-managed        | Apache-2.0               | backend ADR-0005          |
| `spring-modulith-starter-jpa`                                                | backend               | when needed (B-5)            | Modulith-managed    | Apache-2.0               | PLAN-BACKEND B-5          |
| Argo CD                                                                      | infra                 | 3                            | v3.6.1              | Apache-2.0               | infra ADR-0002            |
| k3s (+ bundled Traefik)                                                      | infra                 | 3                            | v1.37.2+k3s1        | Apache-2.0 (Traefik MIT) | infra ADR-0003            |
| External Secrets Operator                                                    | infra                 | 3                            | v2.15.0             | Apache-2.0               | infra ADR-0005            |
| cert-manager                                                                 | infra                 | 3                            | v1.21.3             | Apache-2.0               | infra plan (TLS)          |
| SOPS / Sealed Secrets (alternatives, not recommended)                        | infra                 | —                            | v3.13.3 / v0.41.2   | MPL-2.0 / Apache-2.0     | infra ADR-0005            |
| Container scanner, SBOM tooling                                              | backend, atlas, infra | 1–2 (BE-1.13, infra Phase 2) | to choose           | to verify                | infra plan (supply chain) |
| Capacitor platform packages and plugins (iOS, Android, secure storage, …)    | atlas                 | 10                           | to verify           | to verify                | PLAN-FRONTEND D5          |
| Export renderer (PDF/raster)                                                 | atlas                 | 7                            | to verify           | permissive required      | roadmap decision 8        |

## 5. Items that need attention

| #   | Item                                                | Why                                                                               | Action                                                                                                            | When                           |
| --- | --------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| L1  | No project license in any repository                | Others have no reuse rights; contributors' terms are unclear                      | Owner chooses a license or explicitly keeps "all rights reserved"                                                 | before any public release      |
| L2  | Frontend license texts are not served               | `3rdpartylicenses.txt` is generated but not in the image; it omits OFL font texts | "About / licenses" route with JS licenses + OFL texts (PLAN-FRONTEND F9-3)                                        | before public or store release |
| L3  | Backend jar license texts                           | Apache-2.0 NOTICE files and EPL/EDL texts must travel with distributed binaries   | Include the generated `THIRD-PARTY.txt` and NOTICE files in the image (for example `/licenses`) with BE-1.13      | before public release          |
| L4  | Base image OS packages                              | Alpine and Ubuntu images contain GPL/LGPL OS packages                             | Use unmodified official images; the SBOM lists them; offer the source on request if images are published publicly | with SBOM (Phase 2)            |
| L5  | Kubernetes JSON schemas have no SPDX                | Data fetched at CI time only; not redistributed                                   | Keep it as runtime-fetched data; do not vendor it                                                                 | —                              |
| L6  | `svg-tags` (dev tree) shows UNKNOWN in the lockfile | Legacy `licenses` field; the license is MIT                                       | none; documented in `atlas/THIRD-PARTY-NOTICES.md`                                                                | —                              |
| L7  | FullCalendar Premium and other commercial plugins   | Commercial licenses                                                               | Never add them (ADR-0004); reviewers reject them                                                                  | Phase 5                        |
| L8  | Native app stores                                   | App Store terms vs copyleft; plugin licenses unknown                              | License review of all Capacitor plugins before Phase 10 release                                                   | Phase 10                       |

## 6. How to update

1. Add or upgrade a dependency in its repository. Update that repository's `THIRD-PARTY-NOTICES.md` in the same PR,
   with the version, license and concrete use.
2. If the license is not in the "Allowed" class (§1), add an ADR or a row in §5 here.
3. Update this matrix in the same change set, or in a follow-up `atlas` PR linked from the original.
4. Re-run the checks:
   - frontend: `npm ls --omit=dev --all` plus package metadata
   - backend: `./mvnw org.codehaus.mojo:license-maven-plugin:add-third-party`
   - infra: GitHub license API for images, tools and Actions
