# IKIGAI ATLAS: technical stack and architecture overview

Snapshot after Phase 0 (plans) and Phase 1 (foundations), 2026-11-12. Exact versions and licences are in
[DEPENDENCY-LICENSE-MATRIX.md](DEPENDENCY-LICENSE-MATRIX.md); the C4-style context and delivery views are in
[CONTEXT.md](CONTEXT.md).

**Status legend:** **In place** = built and verified in Phase 1. **Accepted** = owner decision recorded, not built
yet. **Proposed** = ADR written, waiting for the owner. **Planned** = later phase (see
[IMPLEMENTATION-ROADMAP.md](../plan/IMPLEMENTATION-ROADMAP.md)). **Open** = decision not made yet.

## Architecture graphic (target runtime on Azure)

The production path follows the arrows: clients → Azure edge → Kubernetes pods → managed PostgreSQL. The GitHub
delivery chain and the identity provider are shown at the bottom. A PNG export is in
[tech-stack.png](tech-stack.png); regenerate it when the Mermaid source changes.

```mermaid
flowchart TB
  subgraph clients["① Clients"]
    direction LR
    web["Web browser<br/>Angular 22 SPA · Material 22<br/><i>In place</i>"]
    mobile["iOS and Android apps<br/>same SPA in Capacitor 8<br/><i>Planned, Phase 10</i>"]
  end

  idp["Microsoft Entra External ID<br/>OIDC · free up to 50,000 MAU · sign-up disabled<br/><i>Accepted, Phase 9</i><br/>Keycloak optional for local dev"]

  subgraph azure["② Microsoft Azure · free account → pay-as-you-go · Germany West Central (proposed)"]
    dns["Azure DNS<br/>public zone (domain <i>Open</i>)<br/>private zone for PostgreSQL"]
    mon["Azure Monitor · Cost Management<br/>metric alerts · budgets<br/>Defender CSPM (free)"]
    subgraph k8s["③ Kubernetes: k3s on one Azure VM B2as_v2 · dev, staging, prod as namespaces"]
      ingress["Traefik Ingress (bundled with k3s)<br/>TLS termination · path routing<br/>acts as the API gateway"]
      certm["cert-manager<br/>Let's Encrypt certificates"]
      subgraph ns["Namespace atlas-dev / atlas-staging / atlas-prod<br/>PSA restricted · NetworkPolicies · non-root · read-only rootfs"]
        fe["atlas-frontend pod<br/>nginx 1.30 unprivileged<br/>static SPA · CSP headers"]
        be["atlas-backend pod<br/>Java 25 · Spring Boot 4.1<br/>Spring Modulith modular monolith<br/>REST /api/v1 · Problem Details"]
      end
      eso["External Secrets Operator"]
      argo["Argo CD 3.6<br/>GitOps controller"]
    end
    pg[("④ Azure Database for PostgreSQL<br/>Flexible Server B1ms · PostgreSQL 18<br/>non-prod + prod servers<br/>private access · PITR backups")]
    kv["Azure Key Vault<br/>non-prod + prod"]
  end

  subgraph github["⑤ GitHub: source, CI/CD, registry"]
    direction LR
    code["atlas · atlas-microservices<br/>source repositories"]
    gha["GitHub Actions<br/>lint · test · build · scan"]
    ghcr[("GHCR<br/>atlas-frontend · atlas-backend<br/>images")]
    infra["atlas-infra repository<br/>Kustomize bases + overlays"]
  end

  web -- "HTTPS · session cookie (BFF)" --> ingress
  mobile -- "HTTPS · Bearer JWT" --> ingress
  dns -. "resolves host" .-> ingress
  certm -. "TLS certificate<br/>DNS-01 via Azure DNS" .-> ingress
  ingress -- "/" --> fe
  ingress -- "/api" --> be
  be -- "JDBC · Flyway migrations" --> pg
  mon -. "metrics · alerts" .-> pg

  mobile -. "Auth Code + PKCE<br/>system browser" .-> idp
  be -. "OIDC client for web (BFF)<br/>JWT validation via JWKS" .-> idp

  kv -- "DB password<br/>OIDC client secret" --> eso
  eso -- "Kubernetes Secrets" --> be

  code --> gha
  gha -- "push image" --> ghcr
  gha -- "digest bump PR" --> infra
  argo -- "pulls desired state" --> infra
  argo -- "syncs" --> ns
  ghcr -. "image pull by digest" .-> ns
```

### Local development stack (In place)

```mermaid
flowchart LR
  browser["Developer browser"]
  subgraph compose["Docker Compose · atlas-infra/local"]
    edge["edge proxy<br/>nginx 1.30 · :8000"]
    fe["atlas-frontend<br/>nginx · :8080"]
    be["atlas-backend<br/>Spring Boot · :8080"]
    db[("PostgreSQL 18.6-alpine<br/>host port ATLAS_DB_PORT")]
  end
  ngserve["ng serve · :4200<br/>proxy.conf.json: /api → :8080"]

  browser -- ":8000" --> edge
  edge -- "/" --> fe
  edge -- "/api · /actuator/health" --> be
  be --> db
  browser -. "frontend-only work" .-> ngserve
  ngserve -. "/api" .-> be
```

## Frontend: `atlas`

| Area               | Technology                                                                                      | Version              | Status                                             |
| ------------------ | ----------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------------------- |
| Framework          | Angular: standalone components, signals, zoneless change detection, OnPush                      | 22.2                 | In place                                           |
| Language           | TypeScript · RxJS                                                                               | 6.0 · 7.8            | In place                                           |
| UI components      | Angular Material + CDK, Material 3 theme mapped to Atlas design tokens                          | 22.2                 | In place                                           |
| Icons and fonts    | Tabler Icons · Inter Variable and DM Serif Display (Fontsource, self-hosted)                    | 3.51 · 5.3           | In place                                           |
| Design tokens      | JSON tokens → Node generator → CSS custom properties, SCSS and TS; WCAG contrast gate           | n/a                  | In place                                           |
| Styling            | SCSS (Sass via `@angular/build`), stylelint                                                     | stylelint 18         | In place                                           |
| Build              | Angular CLI, `@angular/build` (esbuild, Vite dev server)                                        | 22.2                 | In place                                           |
| Unit tests         | Vitest + jsdom                                                                                  | 5 · 30               | In place                                           |
| E2E and a11y tests | Playwright + axe-core                                                                           | 1.65 · 4.14          | In place                                           |
| Lint and format    | ESLint + angular-eslint + typescript-eslint · Prettier                                          | 10 · 22.6 · 8.71 · 3 | In place                                           |
| Brand assets       | sharp (raster exports) and an asset validation script                                           | 0.35                 | In place                                           |
| Container          | Build `node:26-alpine` → runtime `nginxinc/nginx-unprivileged:1.30-alpine` (port 8080, UID 101) | 1.30                 | In place                                           |
| Mobile shell       | Capacitor for iOS and Android (`appId` `dev.myatlas.app`)                                       | 8.6                  | Core installed; native projects Planned (Phase 10) |
| API client         | Types generated from the backend OpenAPI document                                               | n/a                  | Planned (Phase 3 spike, D3)                        |
| Visualisation      | ECharts 6 + ngx-echarts, FullCalendar 7 Standard, vis-timeline (spike), d3 only if needed       | n/a                  | Planned (Phase 5)                                  |
| CI                 | GitHub Actions `frontend-ci.yml` and `frontend-container.yml`, Dependabot                       | n/a                  | In place (first GitHub run open)                   |

## Backend: `atlas-microservices`

| Area              | Technology                                                                                      | Version        | Status                                         |
| ----------------- | ----------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------- |
| Runtime           | Java LTS (Eclipse Temurin), backend ADR-0008                                                    | 25             | In place                                       |
| Framework         | Spring Boot (Spring Framework 7)                                                                | 4.1.2          | In place                                       |
| Architecture      | Spring Modulith modular monolith, one deployable; package `dev.myatlas`                         | 2.1.1          | In place                                       |
| Domain modules    | profile, onboarding, ikigai, goals, dashboard, timeline; later finance, capacity, export, ai    | n/a            | Planned (Phase 3 onwards)                      |
| Web and API       | Spring MVC on Tomcat 11, Jackson 3, Bean Validation; REST `/api/v1`, Problem Details (RFC 9457) | Boot-managed   | Scaffold in place; endpoints Planned (Phase 3) |
| API conventions   | ETag/If-Match, Idempotency-Key, money as string, `PlannedDate`                                  | n/a            | Specified in API-CONTRACT                      |
| Persistence       | Spring Data JPA / Hibernate, HikariCP, PostgreSQL JDBC                                          | 7.4 · 7 · 42.7 | In place                                       |
| Migrations        | Flyway, schema `atlas`                                                                          | 12.4           | In place                                       |
| Database          | PostgreSQL                                                                                      | 18.6           | In place (local and tests)                     |
| Operations        | Spring Boot Actuator (health, liveness, readiness, info), Micrometer, ECS JSON logs             | Boot-managed   | In place                                       |
| Security          | Spring Security OAuth2 resource server (JWT), provider-neutral OIDC                             | Boot-managed   | Proposed (ADR-0005), Planned (Phase 3)         |
| Web session (BFF) | Spring Security OAuth2 client + Spring Session JDBC, `__Host-` cookie                           | Boot-managed   | Planned (Phase 9)                              |
| API documentation | springdoc-openapi, code-first                                                                   | 3.x            | Planned (Phase 4)                              |
| Build             | Maven via wrapper                                                                               | 3.10           | In place                                       |
| Tests             | JUnit, Spring Modulith module verification, Testcontainers (PostgreSQL)                         | 6 · 2.1 · 2.0  | In place                                       |
| Container         | Eclipse Temurin 25 JRE (Ubuntu noble), port 8080, UID 10001                                     | 25.0.5         | In place                                       |
| CI                | GitHub Actions `backend-ci.yml` and `backend-container.yml`                                     | n/a            | In place (first GitHub run open)               |

## Infrastructure and delivery: `atlas-infra`

| Area                | Technology                                                                                                                                                          | Version         | Status                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------ |
| Manifests           | Kubernetes YAML, Kustomize bases (backend, frontend, ingress, namespace baseline) and dev/staging/prod overlays                                                     | kubectl 1.37    | In place                             |
| Security baseline   | Pod Security Admission `restricted`, default-deny NetworkPolicies, non-root, read-only rootfs, prod PDBs, image digests                                             | n/a             | In place                             |
| GitOps              | Argo CD AppProject + Applications (dev auto-sync; staging and prod manual sync)                                                                                     | 3.6.1           | Manifests in place; cluster Proposed |
| Validation          | kubeconform, yamllint, shellcheck, `scripts/validate.sh`, `manifests-ci.yml`                                                                                        | kubeconform 0.8 | In place                             |
| Local stack         | Docker Compose: PostgreSQL 18.6-alpine, backend, frontend, nginx 1.30 edge proxy                                                                                    | n/a             | In place                             |
| Registry            | GHCR `ghcr.io/hsnrzv/atlas-{frontend,backend}`; build once, promote the digest through bump PRs (GitHub App)                                                        | n/a             | Planned (Phase 2)                    |
| Cloud               | Microsoft Azure: free account, upgraded to pay-as-you-go within 30 days; budgets and alerts. Region Germany West Central                                            | n/a             | Accepted (ADR-0009); region Proposed |
| Compute             | k3s on one Azure VM Standard_B2as_v2 (2 vCPU, 8 GiB) for dev, staging and prod as namespaces; own prod VM is the upgrade path                                       | k3s 1.37.2      | Accepted (ADR-0003)                  |
| Ingress and gateway | Traefik bundled with k3s: TLS, `/api` → backend, `/` → frontend. No separate API gateway product                                                                    | k3s-bundled     | Proposed                             |
| TLS and DNS         | cert-manager + Let's Encrypt, DNS-01 challenge via an Azure DNS public zone; Azure Private DNS zone for PostgreSQL                                                  | n/a             | Accepted (ADR-0009); domain Open     |
| Database            | Azure Database for PostgreSQL Flexible Server B1ms: non-prod server (Phase 3) and prod server (Phase 9), private access, point-in-time restore                      | PostgreSQL 18   | Accepted (ADR-0004)                  |
| Secrets             | Azure Key Vault + External Secrets Operator                                                                                                                         | n/a             | Proposed (ADR-0005)                  |
| Identity provider   | Microsoft Entra External ID (external tenant, sign-up disabled); code stays provider-neutral OIDC; Keycloak optional for local full-stack work                      | n/a             | Accepted; Planned (Phase 9)          |
| Observability       | JSON logs to stdout, metrics-server, Argo CD health, Azure Monitor metric alerts, budget alerts; Log Analytics only within the 5 GB free quota; Prometheus deferred | n/a             | Proposed                             |
| Mobile release      | GitHub Actions macOS runner → TestFlight / App Store Connect; Android validation workflow                                                                           | n/a             | Planned (Phase 10)                   |

## Azure services (final MVP list)

Owner decision of 2026-11-12, based on the Azure free-service lists. The source of truth, with quotas, unit prices and
guardrails, is `atlas-infra` ADR-0009 (`docs/adr/0009-azure-services-and-free-tier.md`).

**Used from the free lists** (12 months = free for the first year only):

| Service                                         | Used for                                                       | Free quota                         |
| ----------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- |
| PostgreSQL Flexible Server (12 months)          | non-prod server (`atlas_dev`, `atlas_staging`)                 | 750 h B1ms, 32 GB storage + backup |
| Managed Disks (12 months)                       | P6 OS disk of the k3s VM                                       | 2 × P6                             |
| Key Vault (12 months)                           | secrets through External Secrets Operator                      | 10,000 operations                  |
| Blob Storage (12 months)                        | weekly prod `pg_dump` (Phase 9)                                | 5 GB Hot LRS                       |
| Bandwidth                                       | outbound traffic                                               | 100 GB + 15 GB (year 1) per month  |
| Virtual Network                                 | VNet, NSG, delegated PostgreSQL subnet                         | always free                        |
| Microsoft Entra ID                              | owner account, VM managed identity, GitHub OIDC federation     | always free                        |
| Cost Management                                 | budgets, anomaly alerts                                        | always free                        |
| Azure Monitor                                   | platform metrics, metric alerts, optional Log Analytics capped | 5 GB Log Analytics per month       |
| Defender for Cloud, Advisor, Policy, Update mgr | posture recommendations, tag/region policies, OS patches       | always free (CSPM tier)            |

**Needed but not in the free lists:**

| Item                                     | Phase    | EUR (excl. VAT)                               |
| ---------------------------------------- | -------- | --------------------------------------------- |
| VM Standard_B2as_v2 (k3s node)           | 3        | 56.65 / month                                 |
| Static public IPv4                       | 3        | 3.29 / month                                  |
| Azure DNS public zone + Private DNS zone | 3        | 0.90 / month + queries                        |
| PostgreSQL B1ms prod server              | 9        | 17.00 / month (the free quota covers one)     |
| Microsoft Entra External ID              | 4–9      | 0 up to 50,000 MAU                            |
| Domain name (external registrar)         | before 9 | ≈ 10–15 / year, to verify                     |
| Let's Encrypt certificates               | 3        | free                                          |
| GitHub (repos, Actions, GHCR)            | now      | GHCR currently free; Actions minutes per plan |
| Uptime check of prod `/healthz`          | 9        | App Insights test (per run) or free external  |
| Apple Developer Program, Google Play     | 10       | ≈ 99 USD / year, ≈ 25 USD once, to verify     |
| LLM provider                             | 11       | decided in Phase 11                           |

**Not used:** AKS (≈ 313 €/month minimum node pool), Container Apps, Static Web Apps and App Service (no Argo CD
path), the free 1 GiB VMs (too small for k3s), Load Balancer, API Management (Traefik is the gateway), Container
Registry (GHCR), Azure AD B2C (closed to new customers), other databases, messaging, AI and DevOps services.

**Expected monthly cost** (EUR, excl. VAT): Phases 3–8 ≈ 61 in year 1 and ≈ 88 after it; from Phase 9 with prod ≈ 78
and ≈ 105. Budget alerts at 75 €, raised to 125 € when prod exists or the free year ends.

## Runtime contract

| Item     | Value                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Ports    | backend 8080 · frontend container 8080 · PostgreSQL 5432 · `ng serve` 4200 · local edge proxy 8000                 |
| Routing  | Same origin for web: `/api` → backend, `/` → frontend, so no CORS. Native apps need CORS or the native HTTP plugin |
| Env vars | `SPRING_PROFILES_ACTIVE`, `SPRING_DATASOURCE_*`; from Phase 3 `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_*`        |
| Images   | `ghcr.io/hsnrzv/atlas-frontend`, `ghcr.io/hsnrzv/atlas-backend`, deployed by digest                                |
