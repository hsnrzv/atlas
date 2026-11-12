# IKIGAI ATLAS — Product, Architecture and Copilot Implementation Specification

> **Purpose:** This document is the source of truth for GitHub Copilot (including Copilot Agent) to plan and implement the Atlas application in controlled, reviewable phases. It defines the product, user experience, domain model, frontend, backend, database, infrastructure, CI/CD, security, and acceptance criteria.
>
> **Document status:** Initial product and architecture specification. Decisions marked **Proposed** should be validated in the planning phase and recorded as ADRs before implementation.
>
> **Research baseline:** 10 November 2026. Re-check current framework versions, platform requirements, package licenses, cloud prices, and store submission rules when scaffolding the repositories. Do not blindly copy version numbers from this document.

---

## 0. Instructions for GitHub Copilot — read this first

You are acting as a senior product engineer and solution architect. Implement this product incrementally. Do not attempt to generate the entire application in one pass.

### 0.1 Mandatory execution order

1. **Inspect first.** Inspect the current repository, existing code, Git history, build tools, and any existing conventions. Do not overwrite working code or assume the repository is empty.
2. **Plan all work before implementation.** Produce separate, actionable plans for:
   - frontend and cross-platform client;
   - backend and domain modules;
   - database and data migrations;
   - infrastructure, environments, security, and CI/CD.
3. **Record architecture decisions.** Create ADRs for decisions that materially affect future work. At minimum record the modular-monolith choice, UI component stack, visualization stack, database, authentication, and hosting/deployment approach.
4. **Stop at the plan gate.** After generating the plans, summarize dependencies, risks, and the proposed implementation sequence. Wait for human review before implementing application features. Do not silently treat an unreviewed plan as approved.
5. **Implement one phase at a time.** Keep changes small enough to review. Run relevant formatters, lint, unit tests, integration tests, and builds after each phase. Fix failures before moving on.
6. **Keep documentation current.** Update the plan checkboxes, README, API contract, architecture diagrams, and ADRs as decisions or implementation status change.
7. **Do not invent facts.** Do not fabricate course URLs, university curriculum, certification requirements, investment returns, property yields, health recommendations, or dates. Use user-provided planning placeholders until real data is supplied.

### 0.2 Required planning outputs

Create these files (or equivalent files in the repository that owns each concern):

- `docs/plan/PLAN-FRONTEND.md`
- `docs/plan/PLAN-BACKEND.md`
- `docs/plan/PLAN-DATABASE.md`
- `docs/plan/PLAN-INFRASTRUCTURE-CICD.md`
- `docs/architecture/CONTEXT.md` — system context, boundaries, and repository ownership.
- `docs/architecture/DOMAIN-MODULES.md` — module responsibilities and allowed dependencies.
- `docs/architecture/API-CONTRACT.md` — initial endpoint and DTO plan.
- `docs/adr/` — numbered Architecture Decision Records.
- `docs/plan/IMPLEMENTATION-ROADMAP.md` — phases, dependencies, exit criteria, and status.

Each plan must state: scope, assumptions, proposed packages/files, dependencies, sequence, test approach, security implications, deployment implications, risks, and measurable acceptance criteria. Where a detail is unknown, mark it as an open decision instead of guessing.

### 0.3 Repository boundaries

Use two application repositories, as requested, plus a recommended third GitOps repository:

| Repository | Owns | Must not own |
|---|---|---|
| `atlas-frontend` | Angular source, Capacitor projects, frontend tests, static assets, frontend container build | Database migrations, backend business rules, production secrets |
| `atlas-backend` | Spring Boot source, domain modules, API contract, Flyway migrations, backend tests, backend container build | Angular implementation, cluster/environment secrets |
| `atlas-infra` *(recommended)* | Kubernetes manifests/Helm or Kustomize overlays, Argo CD applications, environment configuration templates, operational runbooks | Application business logic, credentials committed in plain text |

The user requested separate frontend and backend repositories. Preserve that separation. The third repository is recommended because GitOps manifests should have an independent lifecycle and review history. If the user elects to keep only two repositories, put the GitOps directory in the backend repository without mixing it into Java source packages.

### 0.4 Copilot working rules

- Prefer simple, explicit code over abstractions that have no current use case.
- Do not create microservices, Kafka topics, event brokers, a plugin marketplace, or an AI agent in the MVP.
- Do not add dependencies merely because they are familiar. Every dependency must have a concrete use, a current compatible release, an acceptable license, and a reason it is not covered by the platform.
- Do not use proprietary paid components for timelines, charts, calendars, or icons.
- Do not put business logic in Angular components or chart callbacks.
- Do not expose persistence entities directly through REST APIs.
- Do not store access tokens, passwords, signing keys, or cloud credentials in source control or browser local storage.
- Do not use hard-coded dates in business logic. Dates in demo data are sample values only.
- Do not make an external API call, financial action, health recommendation, or LLM-generated plan executable without explicit user review and approval.
- Avoid large generated diffs. Implement and verify one bounded task at a time.

---

## 1. Product vision

**Atlas is a private, responsive, cross-platform personal planning system that turns long-term life goals into an understandable visual roadmap, makes the next action clear, and shows how goals affect time, finances, and the user's chosen Ikigai areas.**

The central experience is progressive disclosure:

- At the top level, show the big picture: life areas, a handful of active goals, major milestones, upcoming deadlines, progress, and the most important financial/time implications.
- Clicking a goal opens its roadmap.
- Clicking a milestone focuses the interface on that milestone and reveals its own sub-milestones, tasks, notes, deadlines, evidence, and rewards.
- Users can always navigate back through breadcrumbs and zoom out to the overall plan.

The app should make progress visible and motivating without creating guilt, pressure, or a false impression that all life outcomes can be reduced to one score.

### 1.1 Product principles

1. **Big picture first; details on demand.** The dashboard must not become a wall of tasks.
2. **One consistent goal model.** A goal can contain milestones, milestones can contain sub-milestones, and the hierarchy can continue as deeply as is useful.
3. **A goal is more than a checklist.** It can have a target outcome, time range, progress policy, dependencies, notes, evidence, costs, expected benefits, time requirements, and a reward.
4. **Progress is explainable.** Every percentage must be traceable to completed work and its weighting.
5. **Life areas interact.** A change in one goal may affect another goal, available time, cash flow, or other life areas.
6. **Planning assumptions are not facts.** Planned income or savings must remain distinct from realized income or savings.
7. **User remains in control.** Users can change, pause, archive, or override plans. AI suggestions are advisory and require approval.
8. **Privacy by default.** Financial, health, and relationship information is sensitive. Collect only what has an explicit use.
9. **Cross-platform without duplicated product logic.** Angular is the shared UI; Capacitor supplies native packaging and device integration.
10. **Open-source first.** Prefer maintained libraries with permissive licenses and avoid premium-only features.

### 1.2 Target platforms

- Responsive web application and installable PWA.
- iOS application through Capacitor.
- Android application through Capacitor.
- Desktop browser is a first-class experience for planning and exports.
- Phone is optimized for quick progress updates, notes, and viewing the next steps.

The interface must work at narrow mobile widths, tablet widths, and desktop widths. Do not design a desktop-only dashboard and shrink it for mobile.

---

## 2. Scope and release boundaries

### 2.1 MVP scope

The MVP must deliver a usable personal planning application, not a complete implementation of every life-domain module.

**MVP capabilities:**

- Welcome experience and editable onboarding wizard.
- Baseline profile for income, expenses, savings, selected personal context, and preferences.
- Ikigai areas and goal-to-area mapping.
- Create, view, edit, archive, and delete goals.
- Arbitrarily nested milestones/tasks, notes, status changes, dependencies, due dates, progress, and rewards.
- Goal overview and focused drill-down view.
- Dashboard with one sample goal in development/demo mode only.
- Timeline visualization and a conventional month/list calendar for deadlines.
- Progress charts and simple life-area visualization.
- Basic time-capacity and financial-impact views based on manually entered assumptions.
- Export of a selected roadmap as a high-resolution PNG/JPEG and export of deadlines as a calendar PDF.
- Authentication and secure persistence before public/internet deployment.
- Automated tests, container builds, CI, and GitOps deployment manifests.

### 2.2 Post-MVP domain capabilities

Implement these as separate feature modules after the core goal engine is stable:

1. Professional development and career transition.
2. Property/investment project tracking and cash-flow scenarios.
3. Fitness and strength tracking.
4. Freelance income and side-project tracking.
5. Trading education and trade journaling.
6. Hobbies and skill development.
7. Relationship/living-arrangement planning.
8. LLM-assisted planning and optimization.

The initial data model must leave clean extension points for these domains, but do not implement all their workflows in the first release.

### 2.3 Explicit non-goals for MVP

- No multi-user collaboration, social network, public sharing, or public profiles.
- No bank account connection, automatic transaction ingestion, brokerage connection, or payment processing.
- No automated trading, financial product recommendations, or promised profit calculations.
- No diagnosis, treatment, supplement prescription, or medical claims.
- No LLM-generated plans that automatically update user data.
- No Kafka or separate domain microservices.
- No requirement to use MongoDB/Cosmos DB. PostgreSQL is the primary system of record.
- No calendar synchronization with Google/Outlook in the first release.

---

## 3. Core user experience and information architecture

### 3.1 Main navigation

Use a responsive navigation model:

- **Dashboard** — overview, upcoming milestones, focus for this week, progress, and selected life/finance indicators.
- **Goals** — searchable/filterable goal list and goal creation.
- **Timeline** — cross-goal and focused goal timeline.
- **Calendar** — key deadlines by month/list.
- **Ikigai** — seven life-area overview and goal distribution.
- **Finances** — baseline income, expenses, savings, and planned impacts.
- **Insights** — progress trends, capacity warnings, and goal dependencies.
- **Settings** — profile, onboarding answers, preferences, data export, and privacy controls.

Domain-specific navigation can appear contextually within a goal rather than adding every possible module to the top-level navigation.

### 3.2 Dashboard layout

The dashboard should contain these components, ordered by usefulness rather than by visual novelty:

1. **Welcome/focus header:** short greeting, current date, and one clear suggested focus item based on explicit plan data.
2. **Life balance view:** a radar, segmented wheel, or comparable visual with the seven Ikigai areas. Treat it as a self-reflection view, not an objective happiness score.
3. **Active goals:** compact cards with title, category, progress, next milestone, target date, and a visible reward preview.
4. **Big-picture timeline:** key milestones from active goals. Keep detail low until the user drills in.
5. **Upcoming deadlines:** only important near-term dates; allow the user to change the horizon.
6. **Money snapshot:** current monthly income, expenses, savings contribution, and separately labeled planned impacts.
7. **Time capacity:** planned hours versus user-defined available hours per week. Warn about overcommitment; do not silently move tasks.
8. **Recent achievements:** completed milestones and earned rewards.

Users must be able to hide/reorder optional dashboard widgets eventually. Do not build a complex dashboard editor in the MVP.

### 3.3 Goal list and goal detail

A goal card should show:

- Name and short outcome statement.
- Primary Ikigai area and optional secondary areas.
- Status and priority.
- Progress percentage and a visual progress bar.
- Planned start/end period.
- Next available milestone.
- Estimated weekly effort and known financial impact, if present.
- Reward/celebration preview.

The goal detail screen should show a high-level roadmap, milestones, and a concise summary. Clicking a milestone opens a focused milestone view rather than expanding every descendant inline.

### 3.4 Progressive drill-down and unlock behavior

Use a consistent route/focus model such as:

- `/goals/:goalId`
- `/goals/:goalId/nodes/:nodeId`

A focused view must include:

- Breadcrumb path from goal to the selected node.
- Selected milestone title, outcome, description, status, date range, and notes.
- Progress within the focused node's descendants.
- Its direct children in a timeline or checklist appropriate to their dates and relationships.
- Dependencies and the reason an item is locked, when applicable.
- Reward and completion action.

A future milestone may be visible but locked. It becomes available when its prerequisite conditions are met. Support both automatic unlock from dependencies and an audited manual override. Do not make a locked milestone appear broken or disappear without explanation.

### 3.5 Add/edit goal flow

Goal creation/editing must support:

- Name and outcome statement.
- Description and optional image/icon.
- One primary Ikigai area and zero or more secondary areas.
- Priority and status.
- Start date, target date, and date precision (exact day, month, quarter, year, or approximate).
- Expected weekly effort.
- Progress calculation mode.
- Initial milestones.
- Optional financial/time impacts.
- Optional reward policy.

All fields except a useful name/title should be optional. Users must be able to create a goal quickly and add detail later.

### 3.6 Motivation and rewards

Motivation should come from clear progress and meaningful achievements, not manipulative gamification.

- Allow a reward to be attached to a milestone or goal.
- Display the reward near the milestone, including before completion when configured.
- Record whether the reward is planned, earned, or redeemed.
- Celebrate completion with a restrained animation or visual state; respect reduced-motion settings.
- Never use shame language, punitive streaks, or red warning states for ordinary delays.
- Status must be conveyed by text/icon as well as color.

### 3.7 Responsive behavior

- **Desktop:** sidebar navigation, multi-column dashboard, broad timeline, side detail panel where appropriate.
- **Tablet:** collapsible navigation, two-column dashboard, horizontal scrolling timeline with usable touch targets.
- **Mobile:** bottom navigation or compact drawer, single-column cards, vertical milestone list when a horizontal timeline is too dense, full-screen goal/node detail, touch-friendly controls.
- Charts must resize and preserve readable labels; do not render tiny desktop charts on mobile.
- Ensure keyboard navigation, visible focus, semantic headings, accessible labels, and WCAG 2.2 AA as the target.

---

## 4. Ikigai and life areas

Seed these seven configurable areas:

1. Profession
2. Passion
3. Finance
4. Love
5. Health
6. Friendship
7. Family

A goal may contribute to more than one area. Store a primary relationship and optional secondary relationships, including an optional contribution weight. The user may rename, reorder, recolor, or hide areas later.

Do not treat Ikigai as a mathematically objective score. The visual should support reflection: current focus, goals, time allocation, or user-defined satisfaction. The user chooses which measure is displayed.

The UI should make imbalance visible without prescribing that all areas must have equal scores or equal time.

---

## 5. Goal hierarchy, progress, and dependencies

### 5.1 Unified hierarchical model

Use one reusable goal hierarchy rather than separate custom milestone systems for every domain.

- A **Goal** is a top-level outcome.
- A **GoalNode** is a milestone, sub-milestone, task, or checkpoint inside a goal.
- A GoalNode may have a parent GoalNode and any number of children.
- The same node detail UI is reused at every depth.
- Domain modules may attach typed detail records to a goal/node, but must not replace the shared hierarchy.

### 5.2 Node types

Initial node types:

- `MILESTONE` — meaningful outcome or phase, usually with children.
- `TASK` — actionable unit of work.
- `CHECKPOINT` — review/decision/verification point.

Do not force every user plan into a fixed number of hierarchy levels.

### 5.3 Statuses

Suggested goal statuses:

- `DRAFT`
- `ACTIVE`
- `PAUSED`
- `COMPLETED`
- `ARCHIVED`

Suggested node statuses:

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`
- `SKIPPED`
- `CANCELLED`

`LOCKED`/`BLOCKED` should normally be derived from dependencies, not stored as the canonical work status. If a user overrides a dependency, record who/when/why.

### 5.4 Progress calculation

The default progress calculation must be deterministic and explainable:

- Calculate roll-up progress from leaf nodes to the root.
- Use explicit node weights when provided; otherwise use weight `1`.
- Do not count both a parent milestone and its descendants, which would double-count work.
- Exclude cancelled nodes from the denominator; define and document how skipped nodes affect progress.
- A parent with children derives progress from its descendants unless the user explicitly chooses a manual progress policy.
- A task with no children contributes its weight based on status.
- Show the calculation policy in goal settings and expose a tooltip or detail view that explains the percentage.

Support a manual progress mode only as an explicit alternative, not as the default.

### 5.5 Dependencies and unlocks

Model dependencies explicitly between nodes. A node can depend on one or more prerequisite nodes. Define whether all prerequisites or any prerequisite are required; default to all prerequisites.

- Prevent circular dependencies.
- Validate dependencies stay within the same goal in the MVP. Cross-goal dependencies can be added later through goal links.
- A dependent node is available when its prerequisites satisfy the configured condition.
- Completion of a prerequisite recalculates unlock state.
- Users can override a lock with an explanation; preserve an audit entry.

### 5.6 Notes, evidence, and history

Allow notes at goal and node level. Notes should support plain text or Markdown with safe rendering. Keep an update history for significant changes, including status, dates, dependency overrides, and progress policy changes.

Attachments/evidence can be added in a later phase. Define an attachment abstraction now, but do not add object-storage complexity until there is an actual upload feature.

---

## 6. Domain modules and example use cases

Every domain module should own its frontend feature area, backend package, DTOs, persistence tables, tests, and relevant user workflows. Shared goal primitives remain in the Goals module. Do not create a separate service/repository per domain module in the MVP.

### 6.1 Profile and onboarding module

First launch should show a welcome screen followed by a wizard/modal flow. It must be possible to skip optional sections and complete onboarding later from Settings.

Capture only information with a clear purpose:

**Financial baseline**
- Primary employment income.
- Freelance/side-project income.
- Rental income.
- Other income sources.
- Income amount, currency, period, and whether it is gross or net.
- Recurring expenses with category, amount, frequency, and optional notes.
- Savings/investment balances or contributions by category (ETF, stock, emergency reserve, etc.).

Example expense categories: rent, groceries, internet, insurance (allow multiple policies), electricity, gym, clothes, hobbies, TV/streaming, Spotify, Prime, online courses, public transport, and other.

**Personal context**
- Height and current weight, with units.
- Optional relationship status selected from a neutral, editable list.
- Optional other preferences needed by enabled modules.

**Preferences**
- Currency (EUR may be the initial default; user can change it).
- Locale and timezone (use device/browser preference as the initial suggestion, but allow editing).
- Week start day, preferred measurement units, theme, and notification preferences.

Requirements:
- Make all nonessential profile questions optional.
- Clearly explain why a sensitive field is requested and which feature uses it.
- Never ask for bank credentials, brokerage credentials, partner identity, or medical records.
- Store onboarding completion state and allow answers to be edited.
- Store baseline snapshots/history so a later change does not silently rewrite historical forecasts.

### 6.2 Professional development module

Example: transition from Software Architect to AI Engineering & Platform Architect.

Support:
- Current role/skill baseline and desired target role.
- Skills/competencies with current and target self-assessed levels.
- Courses, books, learning resources, and direct links supplied by the user.
- Certifications, prerequisites, costs, and target dates.
- Learning milestones, study hours/week, practice projects, and evidence/notes.

Do not invent course links or claim that a certification is required. A future LLM may suggest resources, but every external link and claim must be verified and shown as a suggestion.

### 6.3 Property and investment-project module

Example workflow:

`Search for object → Shortlist → Evaluate → Contact bank → Financing/loan decision → Contact broker/seller → Offer/negotiation → Sign → Buy → Prepare → Rent`

Support:
- Property candidates and comparison notes.
- Purchase price, fees, renovation budget, expected rent, vacancy assumption, maintenance reserve, financing principal/rate/term, and recurring costs.
- Scenario calculations that clearly separate user-provided assumptions from actual results.
- Milestones and documents/links.
- Cash-flow impact projections linked to the relevant goal.

Do not present projected yields or loan calculations as financial advice. Show assumptions, gross/net labels, uncertainty, and the date of the estimate. Tax and legal calculations are out of scope unless later integrated with an authoritative source and reviewed.

### 6.4 Relationship and living-arrangement module

Example workflow:

`Discuss expectations → Stabilize shared plans → Define practical requirements → Plan move → Move in → Review arrangements`

Keep this module private and optional. Do not model another person as an account/user without consent. Avoid storing intimate details. A goal may have financial/time impacts such as:

- Reduced individual rent after moving in.
- Potential rental income from a current apartment.
- New shared household costs.
- Moving expenses, furnishing, or deposits.

These must be separate line items with assumptions and activation dates, not one opaque “savings” number.

### 6.5 Fitness and strength module

Support:
- Current baseline: weight, height, optional body measurements, current training sessions/week, and self-assessed strength.
- User-defined target weight/strength/body-composition metrics and target dates.
- Training sessions and progress history.
- Weekly training availability and recovery/rest planning.
- Optional user-entered supplement/product notes and associated cost.

This is a tracking and planning feature, not a medical or nutrition advisor. Do not recommend “boosters,” drugs, hormones, or supplements. Do not infer health status. Do not make a target weight or body composition recommendation; the user enters their own goals.

### 6.6 Freelance and side-project module

Support:
- Current monthly side income and its period/currency.
- Desired side income and target date.
- Number/type of desired side projects.
- Client/project pipeline and project milestones.
- Estimated weekly capacity and actual hours.
- Expected/actual income, clearly separated.

Avoid double-counting income: realized freelance payments may be recorded in Finance once and linked to a freelance project, rather than entered again as independent income.

### 6.7 Trading education and journal module

Support learning milestones in:
- Technical analysis.
- Fundamental analysis.
- Economic/macro analysis.
- Risk management.
- Trading routine and review discipline.
- Paper-trading practice and optional trade journaling.

The app may track user-defined goals such as study hours, planned trades/week, journal completion, or user-entered performance. Any profit-percentage target is a user-entered aspiration, not a forecast or recommendation.

Do not provide buy/sell signals, automated trading, leverage recommendations, expected returns, or a claim that a target profit is realistic. Include a visible statement that historical/user-entered results do not predict future performance if performance charts are added.

### 6.8 Hobbies and skills module

Examples: swimming and electric guitar.

Support:
- Hobby name and priority.
- Current self-assessed level and desired level.
- Desired outcome (e.g. swimming competency or a guitar skill level).
- Practice sessions/week, available time windows, milestones, and notes.
- Optional equipment/course costs.

Hobbies can be linked to Passion, Health, Friendship, or other areas. The planner should show capacity conflicts rather than assuming every hobby can be pursued simultaneously.

---

## 7. Cross-goal impact and planning engine

This is a core differentiator. Goals must be able to affect global financial and time views.

### 7.1 Goal relationships

Provide typed links between goals, for example:

- `SUPPORTS`
- `DEPENDS_ON`
- `CONFLICTS_WITH`
- `AFFECTS`
- `RELATED_TO`

A relationship should have a source goal, target goal, type, optional description, and optional effective period. Prevent accidental cycles where the relationship type requires a directed acyclic graph.

### 7.2 Financial impacts

Create an explicit `GoalFinancialImpact` concept with:

- Goal reference.
- Impact category (income, expense, savings, asset, liability, debt service, or one-time cost).
- Amount and ISO currency code.
- Frequency (one-time, weekly, monthly, quarterly, yearly, custom).
- Start/end/effective date and date precision.
- Planned, scenario, committed, or realized state.
- Scenario/assumption notes and optional confidence range.
- Optional category/account mapping.

Examples:

1. Moving in with a partner might reduce current rent, add shared household costs, and create possible rental income from an existing flat. Model each effect separately. Do not assume the flat will be rented or that rent equals net income.
2. A master's degree may add a total of EUR 1,000 in costs over 2.5 years. Allow a schedule across months or terms; do not treat the total as a monthly expense.

**Critical rule:** planned impacts affect a scenario projection but must not modify actual baseline income/expenses until the user confirms they have become real. When realized, prevent double counting by linking the realized transaction/recurring item back to the planned impact.

### 7.3 Cash-flow projections

The first iteration can provide a deterministic monthly projection:

`Projected net cash flow = projected income - projected expenses - planned goal costs + planned goal income`

Show the inputs and period. Include a scenario switch (baseline vs selected goal scenarios). This is not a tax calculator, investment advisor, or a guaranteed forecast.

Support EUR initially but keep currency at every amount. Do not add values with different currencies without an explicit exchange rate and valuation date. No live exchange-rate service is required in MVP.

### 7.4 Time capacity and schedule conflicts

Capture:
- User-defined available hours per week.
- Estimated hours per goal/node.
- Planned study/training/practice hours.
- Recurring personal commitments, if the user chooses to enter them.

Provide a capacity view and warnings when planned hours exceed available hours. MVP behavior is explainable conflict detection and user-controlled rescheduling. Do not auto-reschedule or assume free time.

---

## 8. Future LLM and MCP integration

Design for an LLM without making the MVP depend on one.

### 8.1 Architecture requirements

- Define an `AiPlanningPort`/interface in a dedicated AI integration boundary.
- Keep provider-specific SDKs and secrets in adapters, never in domain modules.
- The domain model must expose clear read models for goal trees, dependencies, finance assumptions, time capacity, and Ikigai mappings.
- Use structured JSON output with a versioned schema for any generated plan.
- Record prompt/template version, provider/model identifier, request time, user-selected data scope, and approval state for important suggestions.
- Provide a dry-run/suggestion mode first. The model must not directly write to the database.
- Applying a suggestion must use normal application use cases and require explicit user confirmation.
- Support future providers through configuration; avoid coupling the domain to a single vendor.

### 8.2 Safety and trust requirements

- Never send all user information by default. Build explicit, minimal data scopes for each planning request.
- Exclude highly sensitive relationship, health, or finance details unless directly needed and explicitly approved.
- Treat notes, pasted URLs, and imported documents as untrusted content. Do not allow prompt injection in those materials to override system instructions or authorize actions.
- Show assumptions and data sources for generated recommendations.
- Distinguish AI-generated suggestions from user-authored goals.
- Require confirmation before creating, changing, completing, deleting, or scheduling goals.
- No investment, medical, legal, or relationship decision should be delegated to the model as an authority.

### 8.3 Events and integration seams

Use internal domain events such as:

- `GoalCreated`
- `GoalUpdated`
- `GoalArchived`
- `GoalNodeCompleted`
- `GoalDependencyChanged`
- `GoalFinancialImpactChanged`
- `FinancialBaselineChanged`
- `TimeCapacityChanged`

Start with in-process application/domain events. Add a transactional outbox only when an actual asynchronous consumer or reliable external delivery requirement exists. Kafka is not required for the initial personal application.

---

## 9. Recommended technology stack

The choices below optimize for Angular/Java experience, cross-platform reuse, open-source tooling, maintainability, and low running cost. Verify current compatibility before scaffolding.

### 9.1 Frontend

| Concern | Proposed choice | Reason / guardrail |
|---|---|---|
| Application framework | Angular 22, latest stable patch in the supported 22.x line | Current supported Angular major at the research baseline; use standalone components, lazy routes, strict TypeScript, signals where appropriate. |
| Language | TypeScript version explicitly supported by the selected Angular patch | Do not independently upgrade TypeScript beyond Angular's compatibility matrix. |
| Native packaging | Capacitor 8 stable line (8.5.x at research baseline) | Shared Angular client for iOS/Android; keep all official Capacitor packages on one major. Do not use 9 alpha for production. |
| UI components | Angular Material + Angular CDK | Stable, accessible Angular-native foundation. Use Material components for forms, dialogs, menus, tables, tabs, and overlays. |
| Styling | SCSS/CSS custom properties and Material theming | Build a deliberate visual system; avoid a second utility framework unless a demonstrated need exists. |
| Icons | Tabler Icons (`@tabler/icons`, MIT) | Large consistent SVG set (over 6,000 icons at research baseline). Create a typed icon wrapper/registry and import only used assets. |
| Charts | Apache ECharts 6-compatible stable release plus `ngx-echarts` matching Angular 22 | Rich charts/graphs under Apache 2.0; wrapper version must match Angular major. Put charts behind app-level components/adapters. |
| Goal timeline | `vis-timeline` 8.5.x (MIT or Apache-2.0) | Interactive time axis with zoom/pan/groups; wrap it in a dedicated Angular component and test mobile behavior. |
| Calendar | FullCalendar Standard only (MIT) | Use month/week/day/list date views. Do not use Premium scheduler/resource timeline features. |
| Custom visualization fallback | D3 7.9.x (ISC) only when needed | D3 remains open source and active. It is low-level; do not use it to rebuild ordinary charts already handled by ECharts. |
| E2E testing | Playwright | Cross-browser web flows and mobile viewport checks. |
| Unit/component tests | Angular-supported test runner (use current CLI default if mature) plus Testing Library where useful | Align to current Angular tooling rather than pinning an outdated runner. |

**UI direction:** Use Angular Material for functional controls, but customize the visual identity through a calm, motivating design system: generous spacing, clear hierarchy, meaningful colors by Ikigai area, milestone cards, subtle progress motion, and accessible light/dark themes. Material should be the component foundation, not the final visual design.

**Do not make Ionic a required UI dependency.** Ionic Framework is not discontinued: its official support page lists v9 as active and v8 in maintenance at the research baseline. It is nevertheless unnecessary for this selected stack because Angular Material + CDK provides the web UI and Capacitor provides native packaging. If Ionic is reconsidered later, verify the current Angular and Capacitor compatibility matrix first.

### 9.2 Visualization library decision

Use a small set of purpose-specific tools rather than one library for everything:

- `vis-timeline` for interactive milestone time ranges, zoom, pan, and grouped lanes.
- FullCalendar Standard for date-centric calendar navigation and deadline lists.
- Apache ECharts for progress, cash-flow, distribution, trend, radar, and graph-style relationship views.
- Native SVG/CSS for milestone cards and the high-resolution poster layout.
- D3 only for a custom layout/interaction that the other libraries cannot provide cleanly.

Do not use FullCalendar Premium timeline views. The Standard package is MIT; advanced scheduler/timeline/resource views are Premium.

### 9.3 Backend

| Concern | Proposed choice | Reason / guardrail |
|---|---|---|
| Language/runtime | Java 21 LTS | Conservative LTS baseline; confirm selected Spring Boot support and container JRE. |
| Framework | Spring Boot 4.1.x (4.1.2 stable at research baseline) | Familiar stack, production-ready HTTP, security, validation, metrics, and configuration. |
| Architecture | Modular monolith, optionally enforced/documented with Spring Modulith 2.1.x | Strong module boundaries without microservice deployment/operations overhead. |
| API | REST + versioned `/api/v1` + OpenAPI | Easy for Angular, Capacitor, tests, and future external/LLM adapters. |
| Persistence | Spring Data JPA/Hibernate | Relational domain and transactions; keep repositories private to their owning module. |
| Schema migration | Flyway | Versioned, reviewable SQL migrations. |
| Validation | Jakarta Bean Validation | Validate at API boundary and in domain use cases. |
| Security | Spring Security, OIDC/OAuth2 | Use Authorization Code with PKCE/BFF-compatible secure sessions; never invent a custom password scheme. |
| Observability | Actuator + Micrometer; structured logs | Health checks and basic runtime insight without a paid observability platform requirement. |
| Tests | JUnit from Spring BOM, Testcontainers PostgreSQL, Spring Modulith tests | Test against real PostgreSQL behavior and verify module boundaries. |
| Build | Maven Wrapper | Repeatable builds in local development and GitHub Actions. |

### 9.4 Database and storage

- **Primary database: PostgreSQL 18**, current supported major at the research baseline. Use the latest supported 18.x patch available when setting up environments.
- Use relational tables for canonical business data.
- Use `JSONB` only for genuinely flexible metadata or versioned AI payloads, not as a substitute for the relational goal/finance model.
- Use object/blob storage only when file attachments or backup archives are implemented.
- Do not introduce MongoDB/Cosmos DB for the initial model. The data is strongly relational and needs transactions, constraints, and queryable financial relationships.

### 9.5 Infrastructure and delivery

- GitHub Actions for PR validation, build, test, image build, release, and mobile packaging.
- Argo CD for GitOps deployment to Kubernetes.
- Kustomize overlays or Helm (choose one as the main packaging approach; Kustomize is a reasonable default for a small application).
- OCI container images.
- Azure as an optional hosting target; use a cost review before creating paid resources.
- Managed PostgreSQL is preferable for durable production data when affordable; for an early low-cost environment, use a deliberately designed backup/restore setup and document the risk if self-hosting the database.
- Azure Blob Storage can be used for encrypted backups/export artifacts if needed.

### 9.6 Libraries and license policy

Before adding a library, verify the actual package version's license, maintenance status, compatibility, and whether required features are free. Maintain a `THIRD-PARTY-NOTICES.md` or equivalent.

Avoid assuming PrimeNG is still an MIT-only choice for new major releases. Its former repository now describes a transition to PrimeUI, and current PrimeUI packages have a Community License with eligibility and renewal terms. Existing historical PrimeNG releases remain MIT, but Angular Material is the simpler licensing choice for this project.

---

## 10. Frontend architecture (`atlas-frontend`)

### 10.1 Architectural principles

- Standalone Angular components and lazy-loaded feature routes.
- Feature modules organized by product domain, not by generic technical folders alone.
- Angular signals for local/feature UI state; RxJS for asynchronous streams and HTTP composition where useful.
- Avoid introducing NgRx until state complexity demonstrates a real need.
- API calls must go through typed data-access services/adapters.
- Components render state and emit user intent; domain calculations live in services/domain utilities or the backend.
- Charts and timeline libraries must be encapsulated. A feature must not depend directly on `vis-timeline` or ECharts internals.

### 10.2 Proposed frontend structure

```text
src/app/
  core/
    auth/
    config/
    http/
    layout/
    navigation/
    error-handling/
    accessibility/
  shared/
    design-system/
    icons/
    badges/
    progress/
    dialogs/
    forms/
    date-time/
    charts/
    timeline/
    calendar/
    export/
    pipes/
    utilities/
  features/
    onboarding/
    dashboard/
    goals/
      data-access/
      models/
      pages/
      components/
      services/
    ikigai/
    finance/
    insights/
    profile/
    career/
    property/
    fitness/
    freelance/
    trading-learning/
    hobbies/
    relationship/
  app.routes.ts
  app.config.ts
```

Do not create empty feature folders for every future module just to make the tree look complete. Add a feature when its implementation phase begins.

### 10.3 Required shared components

- `AppShellComponent` — responsive navigation and content frame.
- `PageHeaderComponent` — consistent title, description, actions, and breadcrumbs.
- `GoalCardComponent` — progress, next milestone, Ikigai area, target period, reward preview.
- `GoalProgressComponent` — accessible percentage and progress bar.
- `GoalTreeComponent` — hierarchy visualization/list.
- `MilestoneTimelineComponent` — `vis-timeline` wrapper with keyboard/touch-accessible alternative.
- `MilestoneDetailComponent` — one focused node and its children.
- `MilestoneStatusBadgeComponent` — icon + text + accessible color.
- `RewardBadgeComponent` — planned/earned/redeemed state.
- `IkigaiAreaChipComponent` — consistent area label/icon/color.
- `MoneyAmountComponent` — locale/currency-aware formatting.
- `ChartHostComponent` or typed wrappers for chart types.
- `DeadlineCalendarComponent` — FullCalendar Standard wrapper.
- `EmptyStateComponent` — useful next action when no goals or data exist.
- `ConfirmActionDialogComponent` — destructive/status-changing confirmation.

### 10.4 Frontend repository phases

1. Scaffold Angular and Capacitor with strict compiler settings and a working web build.
2. Add Material/CDK, theming, Tabler icon wrapper, app shell, navigation, and responsive layout.
3. Build typed sample models and a mock repository adapter for exactly one default sample goal.
4. Implement dashboard, goal list, goal detail, milestone focus/drill-down, status changes, notes, and reward display against the mock adapter.
5. Implement timeline, calendar, and chart wrappers behind stable component interfaces.
6. Implement create/edit/archive/delete goal forms and nested milestone editing.
7. Implement onboarding wizard and local form validation.
8. Implement export UI and client-side rendering.
9. Replace mock adapter with generated/typed API adapter without changing presentation components.
10. Add Capacitor native configuration and test on real/simulated iOS and Android devices.

### 10.5 Mock data boundary

Create one development-only sample goal:

**“Complete an online Master’s degree in Computer Science / AI”**

Include a small illustrative hierarchy:

- Submit application — planned for December 2026 (month precision, not an invented exact day).
- Receive admission decision — date not set.
- Start studying — planned for Fall 2027 (approximate period).
- Complete foundational coursework — children can include generic placeholders such as Machine Learning, Deep Learning, and AI Ethics.
- Complete elective coursework — generic placeholders such as Advanced Deep Learning and Advanced Generative Models.
- Complete thesis/capstone — optional and explicitly dependent on the actual programme requirements.
- Graduate — target end of 2030 (approximate period).

This is only a UI sample based on the supplied description. Do not assert that these are actual UT Austin course names, curriculum requirements, admission dates, or programme rules. No additional demo goals should be created.

The mock repository must be replaceable with an HTTP repository. Do not embed sample values in components. Demo seeding must not run in production.

---

## 11. Backend architecture (`atlas-backend`)

### 11.1 Architecture style

Use a **modular monolith**. Each business capability is a module with a public API and private implementation. A module may publish events; other modules must not reach into its private repositories or persistence entities.

Spring Modulith may be used to verify module boundaries, generate module documentation, and run module integration tests. Module boundaries are logical boundaries inside one deployable application, not separate services.

### 11.2 Proposed package structure

```text
com.example.atlas/
  AtlasApplication.java
  shared/
    api/
    security/
    time/
    money/
    events/
    validation/
  profile/
    api/
    application/
    domain/
    infrastructure/
  onboarding/
    api/
    application/
    domain/
    infrastructure/
  ikigai/
    api/
    application/
    domain/
    infrastructure/
  goals/
    api/
    application/
    domain/
    infrastructure/
  finance/
    api/
    application/
    domain/
    infrastructure/
  capacity/
    api/
    application/
    domain/
    infrastructure/
  dashboard/
    api/
    application/
    readmodel/
  career/          # later phase
  property/        # later phase
  fitness/         # later phase
  freelance/       # later phase
  tradinglearning/ # later phase
  hobbies/         # later phase
  relationship/    # later phase
  ai/              # later phase
```

Use the actual project base package chosen during scaffolding instead of copying `com.example` literally.

### 11.3 Module responsibilities

| Module | Owns | Main public operations |
|---|---|---|
| `profile` | User profile, units, locale, timezone, preferences, sensitive profile fields | Read/update profile and preferences |
| `onboarding` | Wizard completion state and baseline capture workflow | Read/save onboarding steps, complete/reopen onboarding |
| `ikigai` | Life-area definitions and goal-area assignments | Manage areas and assignments |
| `goals` | Goals, hierarchical nodes, statuses, notes, rewards, dependencies, goal links, progress rules | CRUD goals/nodes, complete/reopen, dependencies, focus tree, progress |
| `finance` | Baseline income/expenses/savings, planned impacts, scenarios, monthly projections | CRUD financial baseline, define impact, calculate scenario |
| `capacity` | Weekly availability, time estimates, planned load, over-capacity detection | Read/update capacity and compute conflict summaries |
| `dashboard` | Read-only aggregation of module-owned read models | Get dashboard view model |
| Domain modules | Their own typed domain details and tracking | Domain-specific use cases and read models |
| `ai` | Provider-neutral planning port, schemas, approval workflow | Generate suggestion, review/apply suggestion |

`dashboard` may query published read models or call exposed module APIs. It must not access private repositories of other modules.

### 11.4 Layering rules

- `api`: REST controllers, request/response DTOs, API error mapping.
- `application`: use cases, transaction orchestration, authorization checks.
- `domain`: business entities/value objects/rules; no Spring MVC or persistence annotations where practical.
- `infrastructure`: repositories, JPA mappings, external providers, adapters.

Keep transactions in application use cases. Domain logic must be unit-testable without starting Spring.

### 11.5 API conventions

- Prefix APIs with `/api/v1`.
- Use JSON and ISO 8601 date/time representations.
- Use `LocalDate` semantics for date-only due dates; use `Instant`/offset-aware timestamps for events and audit data.
- Include currency code and decimal amount as separate fields for money.
- Use UUID IDs.
- Validate input and return consistent `Problem Details`-style error responses.
- Use pagination/filtering for list endpoints from the beginning, even if personal data volume is small.
- Use optimistic locking/version fields for concurrent updates and avoid silent lost updates.
- Do not expose JPA entities.

Example endpoint family (adjust names during planning):

```text
GET    /api/v1/dashboard
GET    /api/v1/profile
PUT    /api/v1/profile
GET    /api/v1/onboarding
PUT    /api/v1/onboarding/steps/{stepKey}
POST   /api/v1/onboarding/complete
GET    /api/v1/ikigai/areas
POST   /api/v1/goals
GET    /api/v1/goals
GET    /api/v1/goals/{goalId}
PATCH  /api/v1/goals/{goalId}
DELETE /api/v1/goals/{goalId}
POST   /api/v1/goals/{goalId}/nodes
GET    /api/v1/goals/{goalId}/nodes/{nodeId}
PATCH  /api/v1/goals/{goalId}/nodes/{nodeId}
POST   /api/v1/goals/{goalId}/nodes/{nodeId}/complete
POST   /api/v1/goals/{goalId}/nodes/{nodeId}/reopen
GET    /api/v1/goals/{goalId}/nodes/{nodeId}/tree
GET    /api/v1/finance/baseline
PUT    /api/v1/finance/baseline
POST   /api/v1/finance/goal-impacts
GET    /api/v1/finance/projections?scenarioId=...
GET    /api/v1/capacity/summary
```

Use HTTP semantics consistently. `DELETE` may archive by default if preserving history is safer; document whether hard deletion is a separate operation.

### 11.6 API contract generation

- Generate and publish an OpenAPI document from backend code or a reviewed contract-first source.
- Frontend should generate TypeScript API types/client from the published contract or use a typed adapter that conforms to it.
- Add CI validation so frontend assumptions do not silently drift from backend DTOs.
- Breaking changes require an API version or an explicit compatibility plan.

---

## 12. Database design

### 12.1 General rules

- PostgreSQL is the single source of truth.
- Use UUID primary keys.
- Use `NUMERIC`, never floating-point types, for money.
- Store ISO 4217 currency codes per amount.
- Store units with measurements; do not infer kg/lb or cm/in from a raw number.
- Use `DATE` for date-only business deadlines and `TIMESTAMPTZ` for event timestamps.
- Store date precision/approximation separately when the user has only a month, quarter, or season.
- Use `created_at`, `updated_at`, and optional `version` consistently.
- Add `owner_id`/user ownership at the aggregate boundary from the beginning, even if the first deployment is single-user.
- Enforce foreign keys, uniqueness, not-null, and check constraints where appropriate.
- Use Flyway migrations only; never rely on Hibernate schema auto-update in shared/staging/production environments.

### 12.2 Core table concepts

This is a conceptual starting point. Refine names, indexes, and exact constraints in `PLAN-DATABASE.md` and ADRs.

**Identity/profile**
- `app_user` — internal user identifier and identity-provider subject mapping.
- `user_profile` — display preferences and non-auth profile attributes.
- `user_preferences` — locale, timezone, currency, theme, units, week start.
- `onboarding_progress` — completed steps and completion timestamp.
- `profile_baseline_snapshot` — dated baseline snapshot/version.

**Ikigai**
- `ikigai_area` — configurable area definitions.
- `goal_ikigai_area` — many-to-many relationship and optional contribution weight.

**Goals**
- `goal` — top-level outcome, owner, status, priority, periods, progress mode, description.
- `goal_node` — goal_id, parent_id, node type, title, outcome/description, status, date range, date precision, effort estimate, progress weight, sort order.
- `goal_node_dependency` — prerequisite node and dependent node, condition, override metadata.
- `goal_note` — goal/node note, timestamps, author/owner, visibility scope.
- `goal_reward` — linked goal/node, reward description, planned/earned/redeemed status.
- `goal_link` — typed relationship between goals.
- `goal_change_log` — auditable important changes.

**Finance**
- `financial_income_source` — baseline/actual income source and frequency.
- `financial_expense` — baseline/actual recurring or one-time expense.
- `financial_saving_position` — user-entered saving/investment category and valuation date.
- `financial_impact` — planned or realized goal impact with amount, currency, frequency, and date range.
- `financial_scenario` — named set of selected assumptions/goal impacts.
- `financial_projection_snapshot` — optional cached projection results, never the source of truth.

**Capacity**
- `weekly_capacity` — user availability by weekday or total weekly hours.
- `time_commitment` — recurring/one-time time allocation.
- `goal_time_estimate` — effort estimate or planned hours attached to a goal/node.

**Future module tables**
- Career: `skill`, `skill_assessment`, `learning_resource`, `course_plan`, `certification_plan`, `practice_project`.
- Property: `property_candidate`, `property_financing_assumption`, `property_operating_cost`, `property_rental_assumption`.
- Fitness: `fitness_measurement`, `training_session`, `strength_metric`, `fitness_target`.
- Freelance: `side_project`, `client_pipeline_item`, `project_income_record`, `project_time_record`.
- Trading learning: `trading_learning_topic`, `trading_journal_entry`, `paper_trade_record`, `risk_review`.
- Hobbies: `hobby_profile`, `practice_session`, `skill_level_assessment`.
- Relationship: only minimal user-controlled planning records; avoid sensitive/intimate data by design.

### 12.3 Module ownership and schema strategy

Keep module package ownership strict. During planning, choose one of these database organization strategies and record it in an ADR:

- Single PostgreSQL schema with module-prefixed table names and strict repository ownership; or
- Separate PostgreSQL schemas per module, with module-specific Flyway locations and explicit cross-module references.

For the MVP, a single schema with explicit ownership is operationally simpler. If separate schemas are chosen, do not create cross-module foreign keys that make every module change coupled. Cross-module references can use UUIDs and published module APIs/read models.

### 12.4 Financial data correctness

- Amounts must be decimal, currency-aware, and period-aware.
- Every recurring amount must carry a frequency and effective dates.
- Distinguish gross, net, tax, and unknown when relevant; never assume.
- Distinguish asset value, cash balance, income, expense, and debt.
- A rental income assumption must not be treated as net profit without operating expenses, vacancy, maintenance, financing, and other user-entered assumptions.
- Prevent planned and realized values from being counted simultaneously in the same actuals view.
- Store the date/assumption set used to generate projections.

### 12.5 Data retention and deletion

Provide an export of user data and a deletion workflow. Define retention for audit history and backups. A delete action must explain whether data is archived, soft-deleted, or permanently removed. Backups must have a documented expiry/rotation policy.

---

## 13. Security, privacy, and reliability

This application stores personal, financial, health-related, and relationship context. Treat it as sensitive even though the first deployment may have one user.

### 13.1 Authentication and authorization

- Require authentication before deploying to a publicly reachable environment.
- Use OIDC/OAuth2 rather than inventing password storage.
- Use Authorization Code with PKCE for public/native clients. For web, prefer a secure BFF/session arrangement where practical.
- Backend must validate issuer, audience, signature, expiry, and scopes/claims.
- Enforce owner-level authorization on every data query and mutation. Never trust a client-supplied owner ID.
- Use secure, HttpOnly, appropriately scoped cookies for web sessions if using a BFF; implement CSRF protection.
- For native auth, use system-browser OAuth flow and a maintained Capacitor-compatible integration; store tokens only in appropriate secure native storage.
- Local test profiles may use a test identity, but production must not accept the test profile.

The exact production identity provider is an open deployment decision. Keep Spring Security configuration provider-neutral. Keycloak can be used locally for development/testing, but self-hosting it in production adds operational and compute cost; compare a managed OIDC provider before deciding.

### 13.2 Data protection

- TLS for every external connection.
- Encrypt persistent storage/backups at rest using cloud/storage capabilities where available.
- Store secrets in a secret manager or Kubernetes secret integration, never in Git.
- Do not log financial amounts, notes, health measurements, authentication tokens, or full request bodies by default.
- Restrict analytics/telemetry; no third-party tracking SDK in the MVP.
- Use least-privilege service identities and network rules.
- Apply dependency scanning, container scanning, and secret scanning in CI.
- Provide explicit data export and account deletion.

### 13.3 Backup and recovery

- Automated database backup appropriate to the selected hosting service.
- Additional encrypted logical backups to separate storage if affordable.
- Document RPO/RTO assumptions.
- Test restoration to a clean environment before calling backup complete.
- Back up object storage if/when attachments are introduced.

### 13.4 Reliability and accessibility

- Health/readiness/liveness endpoints.
- Graceful API errors and retry rules only for safe/idempotent operations.
- Idempotency where a repeated client action could duplicate a financial impact or completion record.
- WCAG 2.2 AA target.
- Responsive interaction and reduced-motion support.
- No critical information conveyed by color alone.

---

## 14. Export subsystem

Exports are user-facing product features, not screenshots of the current browser viewport. Build export layouts from structured data and an explicit export configuration.

### 14.1 Wallpaper and printable roadmap

Options:
- Phone wallpaper presets (common aspect ratios; allow custom dimensions).
- Desktop wallpaper presets.
- A4 and A3 portrait/landscape.
- PNG and JPEG output.
- 300 DPI target for print-oriented raster output.

User-selectable settings:
- Selected goals or Ikigai areas.
- Date range.
- Detail level: `OVERVIEW`, `KEY_MILESTONES`, `DETAILED`.
- Light/dark/theme selection.
- Include/exclude rewards, notes, and financial impact labels.

Rendering requirements:
- Render from SVG/vector-friendly layout so output scales cleanly.
- Use a defined export canvas and calculate pixel dimensions from physical page size and DPI.
- Do not simply enlarge a low-resolution screenshot.
- Preserve text legibility and avoid overlapping milestone labels.
- Add page-fit/layout warnings where a detailed plan cannot fit cleanly.
- Never include private notes or financial details unless the user explicitly opts in.

### 14.2 Calendar PDF

- Provide month-by-month pages or a selected date range.
- Default to only important deadlines/milestones; do not dump all tasks into the calendar.
- Include a small badge/note for goal/category/reward where useful.
- Support A4 portrait as the default and landscape as an option.
- Make page count and included date range visible before export.
- Ensure dates respect the user's timezone and locale.

### 14.3 Technical approach

Create an export module with stable interfaces:

- `RoadmapExportModel` — filtered, presentation-ready data.
- `WallpaperRenderer` — vector layout and PNG/JPEG generation.
- `CalendarPdfRenderer` — paginated calendar model and PDF generation.
- `ExportOptions` — page size, orientation, DPI, detail level, date range, inclusion flags.

Start with client-side generation where practical. A likely implementation is SVG for the poster/timeline, canvas rasterization for PNG/JPEG, and an open-source PDF library such as jsPDF plus SVG support or an equivalent permissively licensed renderer. Verify library license, export fidelity, memory behavior, and Capacitor compatibility in a small technical spike before locking the dependency.

Keep rendering local to the device where possible. A server-side export service is not required for MVP and should be introduced only if client rendering fails a measurable requirement.

---

## 15. Infrastructure and DevOps architecture (`atlas-infra`)

### 15.1 Environment model

Use these logical environments:

- `local` — Docker Compose; local PostgreSQL, backend, frontend, and optional Keycloak.
- `dev` — shared development deployment for integrated testing.
- `staging` — release candidate and end-to-end acceptance.
- `prod` — user data and production application.

For a single-user low-cost deployment, the first Kubernetes cluster may host separate namespaces/overlays for dev and staging, with prod isolated as strongly as the budget allows. Namespaces are organization boundaries, not a complete security boundary. Do not claim namespace separation is equivalent to separate clusters.

### 15.2 Azure cost approach

Azure's free account is not “everything free for 12 months.” Eligible accounts receive a limited credit period and specified quantities of selected free services; usage above quotas and resources after expiry can be charged. Add budget alerts, cost anomaly alerts, and a documented resource teardown procedure before creating cloud resources.

If Argo CD is mandatory, Kubernetes is required. AKS Free tier does not charge for cluster management, but worker VMs, disks, load balancers, networking, and other resources still cost money. Microsoft positions the Free tier for development/test/learning and does not provide a financially backed uptime SLA. For production, decide explicitly between:

- **Cost-first/self-managed:** a small Azure VM running a lightweight Kubernetes distribution such as k3s with Argo CD. Lower managed-control-plane cost, but the operator owns upgrades, security, node availability, and recovery.
- **Managed Kubernetes:** AKS with a production-appropriate tier after pricing review. More managed operations and a stronger SLA profile, but ongoing node and cluster-related costs.

Do not use an AKS Free tier cluster as a production-grade availability promise. For a private personal app, the owner may knowingly accept that risk, but it must be documented.

A simpler alternative is Azure Container Apps or a static web host, but these do not provide the requested Argo CD deployment model by themselves. Do not mix deployment approaches without writing down why.

### 15.3 Initial infrastructure components

- Kubernetes cluster (AKS or k3s; decision in infrastructure plan).
- Argo CD.
- Ingress controller and TLS certificates.
- Frontend container served by a lightweight web server, or an explicitly chosen static hosting path.
- Backend Spring Boot container.
- PostgreSQL (managed service preferred for production; self-host only with a tested backup/restore plan).
- Secret management integration.
- Container registry.
- Optional blob storage for backups/exports.
- Metrics/logging at a minimal cost level.

### 15.4 GitOps structure

Recommended structure:

```text
atlas-infra/
  apps/
    frontend/
    backend/
    postgres/              # only if intentionally self-hosted
  argocd/
    projects/
    applications/
  environments/
    dev/
      kustomization.yaml
      frontend/
      backend/
    staging/
      kustomization.yaml
      frontend/
      backend/
    prod/
      kustomization.yaml
      frontend/
      backend/
  charts/ or base/         # choose Helm or Kustomize base
  policies/
  scripts/
  docs/
```

Use pinned image tags or immutable digests in deployment manifests. Do not deploy `latest` to staging or production.

### 15.5 Kubernetes operational requirements

- Resource requests/limits for every workload.
- Readiness/liveness/startup probes for backend.
- Graceful shutdown and rolling update configuration.
- Separate config from secrets.
- Network policies where supported and practical.
- Persistent storage and backup policy for PostgreSQL if self-hosted.
- Migration job/sync ordering so schema is ready before a new backend version relies on it.
- Rollback plan, including forward-compatible database migrations.
- TLS and secure ingress.
- Avoid exposing PostgreSQL publicly.

---

## 16. GitHub Actions and release flow

### 16.1 Frontend workflows

Suggested workflows:

- `frontend-ci.yml` — install from lockfile, lint, type-check, unit tests, build, Playwright smoke tests.
- `frontend-container.yml` — build/publish immutable frontend image on approved branch/tag.
- `mobile-validation.yml` — Capacitor sync, Android build/test, iOS build/test on macOS runner when applicable.
- `mobile-release.yml` — manually approved store release workflow.

### 16.2 Backend workflows

Suggested workflows:

- `backend-ci.yml` — Maven verify, unit tests, Spring Modulith architecture tests, Testcontainers integration tests, coverage report, dependency/security scan.
- `backend-container.yml` — build and publish immutable image, generate SBOM, scan image.
- `openapi-publish.yml` — publish/version OpenAPI artifact and detect incompatible contract changes.

### 16.3 Infrastructure/GitOps workflow

- Build workflows publish images and then open a pull request to update the relevant image digest/tag in `atlas-infra`.
- An authorized reviewer approves the environment change.
- Argo CD detects the Git change and syncs the target environment.
- Production promotion should be explicit and auditable; do not deploy to prod simply because a feature branch merged.
- Prefer GitHub OIDC federation to cloud where supported; avoid long-lived cloud credentials.

### 16.4 Stage promotion

Recommended flow:

`Pull Request → CI → merge to main → deploy dev → integration tests → release candidate/tag → staging → manual approval → prod`

Keep `dev`, `staging`, and `prod` configuration separate. Database migrations must be backward-compatible across the deployment window:

1. Add nullable/new schema elements.
2. Deploy code that can use both old and new structures.
3. Backfill safely if needed.
4. Switch reads/writes.
5. Remove obsolete structures in a later release.

### 16.5 App Store Connect

- Use a macOS GitHub Actions runner for iOS build/signing/upload.
- Use Fastlane or the current supported App Store Connect tooling.
- Store App Store Connect API key, signing certificate, provisioning profile, and passwords only in GitHub Environments/Secrets or an approved secret manager.
- Use a protected `release` environment with human approval.
- Set bundle identifier, version, build number, privacy declarations, icons, screenshots, and export compliance as explicit release configuration.
- Build and test Android separately. Add Google Play release only when requested; do not assume App Store Connect deploys Android.
- App store submission and approval are external processes; CI can upload a build but cannot guarantee review approval.

---

## 17. Testing strategy

### 17.1 Frontend tests

- Unit tests for progress calculations, date precision, currency formatting, and UI state adapters.
- Component tests for goal cards, progress bars, node detail, rewards, and onboarding forms.
- Accessibility checks for form labels, keyboard navigation, dialogs, chart alternatives, and status badges.
- Playwright flows for:
  - first-run onboarding;
  - create/edit/archive a goal;
  - add a nested milestone;
  - complete a prerequisite and unlock a dependent node;
  - navigate into a milestone and back via breadcrumbs;
  - dashboard responsive layout;
  - export options and generated output existence.
- Visual checks for mobile, tablet, and desktop breakpoints.
- Mock the API only at the data-access boundary.

### 17.2 Backend tests

- Domain unit tests for progress, dependency graph validation, unlock rules, impact projections, and money/frequency calculations.
- Module integration tests using Spring Modulith.
- Repository/integration tests using Testcontainers PostgreSQL.
- API tests for validation, authorization, pagination, and error contracts.
- Security tests for unauthenticated and cross-owner access attempts.
- Migration tests from an empty database and from the previous schema version.
- Contract tests for OpenAPI compatibility.

### 17.3 Database tests

- Verify Flyway migrations from empty schema.
- Verify check constraints, uniqueness, and foreign-key behavior.
- Test planned-versus-realized impact transitions and prevention of double counting.
- Test date-only/timezone edge cases, including daylight-saving changes.
- Test progress recalculation against nested trees and cancelled/skipped nodes.

### 17.4 Infrastructure tests

- Validate Kubernetes manifests/Helm/Kustomize in CI.
- Validate container health checks and startup ordering.
- Scan containers and dependencies.
- Run a staging smoke test after Argo CD sync.
- Exercise backup restoration in a disposable environment.
- Verify rollback and database migration compatibility.

---

## 18. Implementation roadmap and phase gates

The Copilot planning phase must refine this roadmap into individual tasks and PR-sized work items. Do not skip the gates.

### Phase 0 — Discovery, plans, and ADRs

**Deliverables**
- Repository inspection report.
- Four plans: frontend, backend, database, infrastructure/CI-CD.
- Context diagram, module map, API draft, ADRs.
- Dependency and license matrix.
- Cost comparison for AKS vs k3s vs non-Argo alternative.

**Exit criteria**
- All open decisions listed.
- Plan reviewed by the user.
- No application feature code written before plan approval.

### Phase 1 — Repository foundations and developer experience

**Frontend**
- Angular 22 scaffold, strict configuration, lint/test/build scripts.
- Capacitor 8 scaffold and web build integration.
- Material/CDK, theme tokens, Tabler icon wrapper.
- Responsive app shell with placeholder routes.

**Backend**
- Spring Boot 4.1.x scaffold, Java 21, Maven Wrapper.
- Health endpoint, config profiles, structured logging.
- Spring Modulith structure and architecture test.
- Dockerfile and local run instructions.

**Database**
- PostgreSQL 18 local container.
- First Flyway migration and connection configuration.
- No production schema auto-generation.

**Infrastructure**
- `docker-compose.yml` for local stack.
- CI workflows for frontend/backend.
- Container image build validation.

**Exit criteria**
- Fresh clone can run locally by following README.
- Frontend and backend build/test in CI.
- Backend connects to PostgreSQL through Flyway.

### Phase 2 — Frontend shell and single sample goal (mock-backed)

- Dashboard layout and responsive navigation.
- One development-only sample Master's goal.
- Goal card, overview timeline, goal detail, nested milestone focus.
- Progress bar/percentage and reward display.
- Breadcrumb navigation and lock/unlock visual state.
- Mock repository interface isolated from components.

**Exit criteria**
- User can navigate overview → goal → milestone → nested milestone and back.
- Sample data appears only in development/demo mode.
- UI passes desktop/tablet/mobile smoke tests.

### Phase 3 — Core backend domain and database

Implement in this order:

1. Profile and onboarding persistence.
2. Ikigai area and goal-area relationship.
3. Goal aggregate and goal-node tree.
4. Dependency graph validation/unlock logic.
5. Progress calculation and rewards.
6. Notes and change history.
7. Dashboard read model.

**Exit criteria**
- Domain tests cover hierarchical progress and dependency behavior.
- PostgreSQL integration tests pass.
- API contract is published.
- Ownership and authorization checks are enforced.

### Phase 4 — Frontend/backend integration

- Generate/adapt typed API client.
- Replace mock repository with HTTP repository using environment configuration.
- Implement loading, empty, error, retry, and optimistic-update behavior deliberately.
- Verify onboarding, goal CRUD, node CRUD, completion, notes, and rewards end-to-end.

**Exit criteria**
- The frontend works using the backend and database without demo-only hard-coded domain data.
- End-to-end tests pass in staging.

### Phase 5 — Timeline, calendar, and chart layer

- Integrate `vis-timeline` behind `MilestoneTimelineComponent`.
- Integrate FullCalendar Standard for date views.
- Integrate ECharts for progress, Ikigai, capacity, and cash-flow summaries.
- Add textual/list alternatives for charts and timeline items.
- Test dense data and narrow viewports.

**Exit criteria**
- Timeline zoom/focus behavior matches the nested goal model.
- Calendar shows only scheduled dates and respects locale/timezone.
- Charts use data from backend/read models and are accessible.

### Phase 6 — Finance and time capacity

- Capture and edit baseline income, expenses, savings.
- Add goal financial impacts and monthly scenario projection.
- Prevent planned/actual double counting.
- Capture weekly capacity and effort estimates.
- Show overcommitment and projected cash flow with assumptions.

**Exit criteria**
- User can model the degree example cost and a hypothetical move/rental scenario without changing actuals.
- Every figure is traceable to entered assumptions.

### Phase 7 — Export system

- Export configuration UI.
- SVG roadmap layout.
- High-resolution PNG/JPEG rendering for wallpaper/A4/A3.
- Paginated calendar PDF.
- Export tests for dimensions, page count, date range, and privacy inclusion flags.
- Capacitor file-save/share integration.

**Exit criteria**
- A4/A3 and selected wallpaper sizes produce correctly sized files.
- Calendar PDF includes only selected key deadlines.
- Private notes/finance are excluded unless explicitly selected.

### Phase 8 — Domain extensions

Implement one domain module at a time in this order (subject to user priority):

1. Professional development.
2. Hobbies/skills.
3. Fitness tracking.
4. Freelance projects/income.
5. Property scenario planning.
6. Relationship/living-arrangement planning.
7. Trading education/journal.

Each module must define its bounded context, schema, APIs, UI routes/components, tests, and links to core Goal/Finance/Capacity concepts. Do not create separate goal systems.

### Phase 9 — Identity hardening and production deployment

- Finalize production OIDC provider.
- Security configuration, secret management, TLS, and access controls.
- Backup/restore and operational runbooks.
- GitOps promotion to staging/prod.
- Cost budget alerts and resource cleanup automation.
- Threat model review and dependency/container scans.

**Exit criteria**
- External deployment requires authentication.
- Cross-owner access is denied.
- Backups have a tested restore procedure.
- Argo CD deployments and rollback are documented.

### Phase 10 — Mobile store release

- iOS/Android native configuration, app icons, splash, permissions, deep links, and secure auth flow.
- Device testing and accessibility checks.
- App privacy declarations and store metadata.
- Protected GitHub Actions release workflow.
- TestFlight/App Store Connect upload; Android store track when separately enabled.

**Exit criteria**
- Production build installs and authenticates on supported devices.
- Store upload workflow is repeatable and secrets are protected.

### Phase 11 — LLM planning assistant

Only after stable domain APIs and privacy controls exist:
- Provider-neutral adapter.
- Read-only context retrieval.
- Structured plan suggestions with assumptions and provenance.
- User review/approve workflow.
- Audited application of approved changes through normal use cases.

**Exit criteria**
- No model can directly mutate the database.
- User controls data scope and confirms every applied change.
- Prompt-injection and sensitive-data handling tests exist.

---

## 19. Definition of done

A task is complete only when all applicable conditions are met:

- Acceptance criteria are met and demonstrated.
- Code follows repository and module boundaries.
- No business logic is duplicated in UI and backend.
- Automated tests cover the behavior and important edge cases.
- Accessibility and responsive behavior are verified for UI work.
- API and database changes are versioned and documented.
- Security/privacy implications are considered.
- CI passes, and no new critical/high vulnerability is ignored without a documented exception.
- No secrets or personal sample data are committed.
- README/plan/ADR updates are made where needed.
- A concise PR summary explains changes, tests, migration steps, and known limitations.

---

## 20. Acceptance criteria for the first usable release

The first usable release is accepted when a user can:

1. Open the app on desktop and mobile and complete or skip the editable onboarding wizard.
2. See a dashboard with exactly one sample Master's goal in demo mode, or an empty-state dashboard in a clean production account.
3. Create, update, archive, and delete a goal.
4. Add multiple levels of milestones/tasks under a goal.
5. Add/edit notes and due dates to goals and milestones.
6. Complete a task/milestone and see progress recalculate correctly.
7. Configure a dependency so the next milestone becomes unlocked after prerequisites are completed.
8. Open a milestone as a focused view, navigate deeper, and return using breadcrumbs.
9. See a milestone reward before/after achievement according to its state.
10. View goal deadlines on a timeline and calendar.
11. View basic progress and Ikigai charts without relying on color alone.
12. Export a roadmap as high-resolution PNG/JPEG and a selected deadline calendar as PDF.
13. Enter a financial baseline and add a planned goal cost/benefit without changing actual values.
14. See an explanatory warning if planned weekly effort exceeds declared capacity.
15. Use the app with authentication in a deployed environment and be prevented from accessing another owner's data.

---

## 21. Open decisions for the planning phase

Copilot must explicitly evaluate and recommend each item; do not silently assume an answer:

1. **Authentication provider:** managed OIDC vs self-hosted Keycloak; native Capacitor login mechanism.
2. **Kubernetes platform:** AKS Standard, AKS Free for non-production, or k3s on a VM. Include a monthly cost estimate and operational trade-offs.
3. **Database hosting:** Azure Database for PostgreSQL vs self-hosted PostgreSQL with tested backups.
4. **Frontend hosting:** container behind Kubernetes ingress vs static web hosting. If static hosting is selected, explain how Argo CD fits the deployment process.
5. **Database schema strategy:** one schema with module table ownership vs separate schemas.
6. **Progress rule details:** how skipped nodes and partially completed work affect progress.
7. **Date precision model:** exact dates, month/quarter/season/year, and approximate ranges.
8. **Export renderer:** choose and spike a permissively licensed solution for vector PDF and high-resolution raster images.
9. **Mobile authentication/storage:** supported Capacitor 8-compatible plugins and secure storage approach.
10. **Production secrets:** Azure Key Vault/External Secrets or another protected solution.
11. **Backup/restore policy:** retention, RPO/RTO, and cost.
12. **Single-user vs future multi-user:** preserve owner boundaries now without prematurely implementing collaboration.

---

## 22. Research references and version checks

The following references were used as the initial verification baseline on 10 November 2026. Re-check them before implementation because releases, package names, licensing, service pricing, and support windows change.

### Frameworks and platform support

- [Angular release and support schedule](https://angular.dev/reference/releases)
- [Angular version compatibility](https://angular.dev/reference/versions)
- [Ionic Framework support policy](https://ionicframework.com/docs/reference/support) — Ionic v9 is active at the research baseline; this specification simply does not require Ionic UI.
- [Capacitor releases](https://github.com/ionic-team/capacitor/releases)
- [Capacitor 8 upgrade guide and platform requirements](https://capacitorjs.com/docs/updating/8-0)
- [Spring Boot documentation and stable releases](https://docs.spring.io/spring-boot/)
- [Spring Boot system requirements](https://docs.spring.io/spring-boot/system-requirements.html)
- [Spring Modulith project](https://spring.io/projects/spring-modulith/)
- [Spring Modulith module fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html)

### Visualizations, icons, and calendar

- [Apache ECharts download and Apache 2.0 license](https://echarts.apache.org/en/download.html)
- [ngx-echarts Angular compatibility versions](https://www.npmjs.com/package/ngx-echarts)
- [vis-timeline package and dual MIT/Apache-2.0 license](https://www.npmjs.com/package/vis-timeline)
- [FullCalendar pricing and Standard/Premium feature split](https://fullcalendar.io/pricing)
- [FullCalendar license](https://fullcalendar.io/license)
- [Tabler Icons repository and MIT license](https://github.com/tabler/tabler-icons)
- [D3 repository](https://github.com/d3/d3) and [D3 npm package](https://www.npmjs.com/package/d3) — D3 remains open source; use only where its low-level flexibility is justified.
- [PrimeNG repository transition notice](https://github.com/primefaces/primeng)
- [PrimeUI license overview](https://primeui.dev/licenses)

### Database, GitOps, and cloud cost

- [PostgreSQL versioning/support policy](https://www.postgresql.org/support/versioning/)
- [PostgreSQL 18 documentation](https://www.postgresql.org/docs/18/)
- [Argo CD overview](https://argo-cd.readthedocs.io/en/latest/)
- [Argo CD getting started](https://argo-cd.readthedocs.io/en/latest/getting_started/)
- [Azure free account: avoid unexpected charges](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/avoid-charges-free-account)
- [Azure AKS Free/Standard/Premium pricing tiers](https://learn.microsoft.com/en-us/azure/aks/free-standard-pricing-tiers)
- [Azure AKS cost management overview](https://learn.microsoft.com/en-us/azure/architecture/aws-professional/eks-to-aks/cost-management)
- [Azure Container Apps billing and monthly free grants](https://learn.microsoft.com/en-us/azure/container-apps/billing) — relevant only if evaluating a non-Argo deployment alternative.

---

## 23. First task for Copilot

**Do not start feature implementation yet.** First:

1. Inspect the frontend, backend, and infrastructure repositories that exist (or confirm that they need to be created).
2. Create the four planning documents listed in Section 0.2.
3. Create initial ADRs for the proposed stack and deployment options.
4. Draw a Mermaid context diagram and module/dependency diagram in `docs/architecture/`.
5. Produce a dependency/license matrix and a current cloud cost comparison for the selected Azure region and account type.
6. Propose a PR-sized implementation backlog for Phases 1–4.
7. Present the plans, unresolved decisions, and recommended defaults for human review.

After approval, begin with Phase 1. Keep the app modular, keep the data model extensible, and deliver a working vertical slice before expanding into every life domain.

## 24. Suggested first prompt to paste into GitHub Copilot Chat

Open the relevant repository (or a multi-root workspace containing the frontend, backend, and GitOps repositories), attach this file as context, and start with this prompt:

> Read `project-instruction.md` completely and treat it as the product and architecture source of truth. First inspect the repositories and their current state. Do not implement application features or modify existing business code yet. Produce the four planning documents for frontend, backend, database, and infrastructure/CI-CD, along with the context diagram, module map, API draft, initial ADRs, dependency/license matrix, and cloud cost comparison required by Section 0.2 and Section 23. Identify conflicts between the specification and the existing repositories instead of overwriting code. Mark unresolved choices as open decisions and recommend a default with trade-offs. Finish with a PR-sized backlog for Phases 1–4 and stop for my review.

After the plan is reviewed and approved, use this follow-up prompt one phase at a time:

> Implement only the approved tasks for the next phase in `IMPLEMENTATION-ROADMAP.md`. Follow the repository and module boundaries in `project-instruction.md`. Before editing, summarize the files and behavior you intend to change. Implement the smallest coherent slice, add/update tests and documentation, run all relevant checks, fix failures, update the plan status, and report what is complete plus any remaining risks. Do not start the next phase until I ask.
