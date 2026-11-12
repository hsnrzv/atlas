# ADR-0006: UI vocabulary and domain mapping

- Status: Accepted
- Date: 2026-11-12
- Deciders: @hsnrzv (owner)

## Context

`project-instruction.md` describes the domain in technical terms: Dashboard, Goal, goal node (milestone, checkpoint,
task), dependencies and goal relationships, timeline, reward, Ikigai area. `design-instructions.md` §1.2 and §6.1 define
a cartographic UI vocabulary: My Atlas, Destination, Waypoint, Step, Connection, Journey Overview, Milestone Award,
Life Dimension. Without a fixed mapping, UI copy, API names and code drift apart. On 2026-11-12 the owner decided:
**UI follows the design vocabulary; domain, API and database keep the project-instruction names.**

## Decision

| UI term (copy, navigation, routes) | Domain / API / DB term                                              | Notes                          |
| ---------------------------------- | ------------------------------------------------------------------- | ------------------------------ |
| My Atlas                           | Dashboard (`GET /api/v1/dashboard`)                                 | big-picture home               |
| Destination                        | `Goal`                                                              | top-level outcome              |
| Waypoint                           | `GoalNode` with `nodeType = MILESTONE` (and `CHECKPOINT`)           | intermediate outcome; may nest |
| Step                               | `GoalNode` with `nodeType = TASK`                                   | actionable item                |
| Connection                         | `GoalLink` (between goals) and `GoalNodeDependency` (within a goal) | dependency or impact           |
| Journey Overview                   | timeline read model                                                 | movement over time             |
| Milestone Award                    | `GoalReward` (`PLANNED` / `EARNED` / `REDEEMED`)                    | celebrates progress            |
| Life Dimension                     | Ikigai area                                                         | seven canonical keys below     |

- **Life Dimension keys are stable and never renamed:** `CAREER` (Career / Profession), `FINANCE`, `HEALTH`, `LOVE`
  (Love / Partnership), `PASSION`, `FRIENDSHIP`, `FAMILY`. The API and database use upper case; tokens, CSS and SVG file
  names use lower case (`--color-dimension-career`, `career.svg`). Labels are display defaults and can later be
  edited per user without changing keys. The frontend registry `LIFE_DIMENSIONS`
  (`src/app/shared/design-system/life-dimensions.ts`) holds both forms.
- **Code naming:** frontend _feature, component and route_ names use the UI vocabulary (for example `features/destinations`,
  `DestinationCard`, `/destinations/:id`). _Data-access models and API clients_ use the API names (`Goal`, `GoalNode`).
  The mapping happens in the feature's data-access or view-model layer, not in templates.
- Status labels shown to users: Completed, In progress, Upcoming, At risk, Blocked, Not started. The mapping from domain
  statuses (§5.3) is defined with the backend status model in Phase 3.
- Primary navigation order (desktop): My Atlas, Destinations, Waypoints, Steps, Connections, Journey Overview, Milestone
  Awards, Life Dimensions. Mobile bottom navigation: My Atlas, Destinations, Journey, Awards, More
  (`design-instructions.md` §6.1, §6.4).

## Consequences

- Users see one consistent, motivating language. Backend and database stay aligned with the specification and the
  `atlas-microservices` API contract.
- Developers must translate at a single boundary. Reviewers check copy against this table (PR template).
- Waypoint covers two node types (`MILESTONE`, `CHECKPOINT`). If the UI ever needs to tell them apart, it adds a
  qualifier ("Checkpoint waypoint") rather than a new top-level term.

## Alternatives considered

- **Domain names everywhere (Goal, Milestone, Task):** a simpler mapping, but it loses the brand experience the design
  system is built around.
- **Design names everywhere, including the API and database:** one vocabulary, but it diverges from the specification,
  and marketing language would leak into persistent schemas.

## References

- `project-instruction.md` §3, §4, §5.2–§5.3, §11.5
- `design-instructions.md` §1.2, §6.1, §6.4, §7
- `atlas-microservices` `docs/architecture/API-CONTRACT.md` and `DOMAIN-MODULES.md`
