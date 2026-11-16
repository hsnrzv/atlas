# ADR-0004: Visualization stack — purpose-specific, open-source libraries behind Atlas wrappers

- Status: Accepted for the Connections graph and the Journey timeline (P-V1, 2026-11-15); charts and calendar stay
  proposed until a screen needs them
- Date: 2026-11-12, amended 2026-11-15 with the P-V1 spike result
- Deciders: @hsnrzv (owner); proposed during Phase 0 planning

## Context

Atlas needs several kinds of visualization: progress and Life Dimension charts, cash-flow and capacity trends,
relationship (Connection) graphs, an interactive Journey Overview time axis, deadline calendars, and a print-quality
roadmap poster. `project-instruction.md` §9.1–§9.2 propose Apache ECharts with `ngx-echarts`, `vis-timeline`,
FullCalendar Standard (MIT only), native SVG/CSS, and D3 as a fallback only. It forbids paid timeline, chart, calendar
or icon components (§0.4) and charts in business logic (§10.1). `design-instructions.md` §9 asks to _evaluate_ a
timeline library against a focused SVG/CSS component, to add a graph library only if needed, and to always provide a
text, list or table alternative.

Nothing in Phase 1 needs a chart, so no visualization package is installed yet. Releases seen on the npm registry on
2026-11-12:

| Package                 | Version | License           | Notes                                                                                |
| ----------------------- | ------- | ----------------- | ------------------------------------------------------------------------------------ |
| `echarts`               | 6.1.0   | Apache-2.0        | tree-shakable via `echarts/core`                                                     |
| `ngx-echarts`           | 22.0.0  | MIT               | peer `@angular/core >=22`, `echarts >=5`                                             |
| `vis-timeline`          | 8.5.6   | Apache-2.0 OR MIT | peers include `vis-data`, `vis-util`, `moment`, `@egjs/hammerjs`, `xss`, `uuid`      |
| `@fullcalendar/angular` | 7.1.4   | MIT               | depends on the v7 `fullcalendar` package and `temporal-polyfill`; peer Angular 16–22 |
| `d3`                    | 7.9.2   | ISC               | low-level fallback                                                                   |

## Decision (proposed default)

1. **Charts:** Apache ECharts 6 through `ngx-echarts` 22, imported per chart type from `echarts/core` (no full
   bundle). Use the SVG renderer by default for crisp text and export; switch to canvas only for dense data.
   Relationship graphs use the ECharts `graph` series before any dedicated graph library is considered.
2. **Journey Overview time axis:** a **Phase 5 spike** compares `vis-timeline` 8.5 with a focused native SVG/CSS
   component. Criteria: mobile touch and pinch, keyboard access, bundle size, CSP compatibility, maintenance, and the
   weight of the `moment` and hammer.js peers. Default if the spike is inconclusive: `vis-timeline`, as in §9.2.
3. **Calendar:** FullCalendar **Standard only** (MIT), v7 packages. Premium scheduler, timeline and resource plugins
   are excluded and must never be added. The spike verifies the v7 package structure and the `temporal-polyfill`
   dependency.
4. **Waypoint path, cards, progress and poster:** native SVG/CSS components built from tokens.
5. **D3** only for a layout that none of the above can provide, decided in a follow-up ADR.
6. **Encapsulation:** features use only Atlas wrappers in `shared/charts`, `shared/timeline` and `shared/calendar`
   (for example `ChartHost`, `JourneyTimeline`, `DeadlineCalendar`). These take typed view models and emit intents.
   They never expose library types, and they are lazy-loaded with the routes that need them.
7. **Accessibility is part of the component contract.** Every wrapper renders a text summary and a list or table
   alternative. Colour encodes Life Dimensions together with labels or patterns, never alone. Reduced motion
   disables animations.

## Spike result (P-V1, 2026-11-15)

The spike built the Figma page 09 graph (one Destination, seven dimension nodes, solid and dashed curves) and the page
10 timeline (ranges, Today line, approximate dates) three ways and measured a production build of each, isolated from
the app:

| Option                                       | Raw       | Gzip      | Notes                                                                                       |
| -------------------------------------------- | --------- | --------- | ------------------------------------------------------------------------------------------- |
| ECharts 6.1.0 (`graph` series, tree-shaken)  | 563,730 B | 194,849 B | canvas or SVG renderer; node focus and keyboard order need custom work                      |
| `vis-timeline` 8.5.6 standalone build        | 551,958 B | 159,490 B | bundles `moment`; touch works; markers are not focusable                                    |
| `vis-timeline` peer build + `vis-data`       | 606,930 B | 187,092 B | 39 `innerHTML` sites to audit against the "no `innerHTML` with user content" rule           |
| Native SVG and HTML (`shared/visualization`) | < 15 kB   | < 5 kB    | lazy with the feature routes; real buttons and links; tokens only; reduced motion respected |

The two Figma views are small: a two-column graph with at most a few dozen nodes and a single-axis timeline with a
handful of lanes. Neither needs force layout, pinch zoom or virtualisation, and both must be keyboard- and
screen-reader-first. The libraries would add 160–195 kB gzip each, `innerHTML` rendering and custom accessibility work.

**Decision:** the Connections graph and the Journey timeline are native components:
`shared/visualization/connection-graph` (HTML buttons positioned over an SVG layer of curves) and
`shared/visualization/journey-timeline` (an ordered list of links on a CSS time axis, with `journeyScale` for the
ranges). Both take typed view models, have no library types in their API and ship with a list alternative on the page
(the relationship list and the chronological agenda). No visualisation package is installed. ECharts (point 1) and
FullCalendar Standard (point 3) remain the defaults for future charts and calendars and need their own bundle check
when a screen requires them.

## Consequences

- Each library does what it is best at; swapping one later touches only its wrapper.
- The graph and the timeline add no dependency, no inline script and no `innerHTML`; the CSP is unchanged.
- The native components own their layout code (`connection-graph-layout.ts`, `journey-scale.ts`) and its tests. A
  future need for force layout, pinch zoom or thousands of items reopens this ADR.
- ECharts or FullCalendar, if added later, must pass the same bundle and CSP check; budgets in `angular.json` catch
  regressions. Both inject inline styles, which the current policy allows (`style-src 'unsafe-inline'`).
- Library upgrades and licenses are re-checked when installing (THIRD-PARTY-NOTICES, dependency matrix).

## Alternatives considered

- **One library for everything (ECharts only):** fewer dependencies, but a weak calendar and time-axis interaction.
- **Chart.js:** simpler and smaller, but fewer chart types (no graph, no rich time axis).
- **Commercial or premium suites (Highcharts, FullCalendar Premium, Syncfusion, …):** excluded by §0.4 and the
  open-source policy.
- **D3 for all visualizations:** maximum control, but it would rebuild solved problems and cost much more
  accessibility work.

## References

- `project-instruction.md` §0.4, §9.1, §9.2, §10.1, §10.3, Phase 5 in §18
- `design-instructions.md` §9, §11
- npm registry pages for `echarts`, `ngx-echarts`, `vis-timeline`, `@fullcalendar/angular`, `d3` (accessed 2026-11-12)
- FullCalendar license and Standard/Premium split: <https://fullcalendar.io/license> (accessed 2026-11-12)
