# ADR-0010: Figma V3 is the visual source of truth at design time only

- Status: Accepted (amends ADR-0005 and ADR-0007)
- Date: 2026-11-14 (accepted 2026-11-14, roadmap decision R-2)
- Deciders: @hsnrzv (owner)

## Context

The approved Figma file `zlFVZJ57AYBHUBhoIsT030` (V3, "Quiet Tide") defines the visual design: colour variables in
dark and light modes, Manrope + Inter typography, 24 px Tabler icons with stroke 2, flat elevation, a green primary
action and a four-circle brand symbol. `design-instructions.md`, `design/tokens/*.json`, ADR-0005 (stroke 1.75) and
ADR-0007 (JSON as the single source of truth) were written before V3 and differ from it in palette, fonts, icon stroke,
navigation styling and bottom-nav height ([design-tokens.md](../design/design-tokens.md)).

The production brief says Figma wins on visual styling. The owner also requires that Figma never becomes a dependency
of the application, the build or CI/CD, and that the tooling stays minimal.

## Decision

1. **Figma defines the visual design.** Its components, variables, typography, spacing, colours, icons and layouts are
   the visual reference. `project-instruction.md` and the ADRs remain the source for behaviour, domain rules, UI
   vocabulary (ADR-0006) and accessibility.
2. **Figma-to-code translation is a development-time activity.** A developer, assisted by GitHub Copilot, reads Figma
   (for example through the Figma MCP server) as context and writes or changes components, SCSS, TypeScript and the
   token JSON.
3. **The implementation lives in Git.** It is version-controlled and reviewed, and must visually conform to Figma.
   PRs name the Figma node IDs they implement and include a Figma-vs-build comparison of the touched states.
4. **`design/tokens/*.json` stays as an internal implementation artefact** because it already drives the generated
   SCSS/TypeScript and the contrast gate (ADR-0007 pipeline unchanged). It is not an independent visual source: when
   it conflicts with Figma, Figma wins and the JSON is corrected in a reviewed PR.
5. **Builds, tests and deployment are independent of Figma.** No Figma API calls, access tokens, runtime
   dependencies, synchronisation services, variable snapshots, drift checks or mandatory Figma connections in CI.
6. **Accessibility is checked against the implementation.** The WCAG 2.2 AA contrast gate (`tokens:check`), axe and
   manual checks run on the code. If a Figma value fails a requirement, the PR reports the conflict for a design
   decision; it is not silently corrected.
7. **Amends ADR-0005:** default icon stroke is **2**; registry glyphs follow the Figma icon set
   ([component-mapping.md §2](../design/component-mapping.md#2-icons)).
8. **Amends ADR-0007:** heading font is Manrope (OFL 1.1, self-hosted); DM Serif Display is removed. Primitive names
   follow Figma (`tide`, `green`, `violet`, `gold`); semantic CSS names stay stable where the meaning is unchanged.
   "Single source of truth" in ADR-0007 now means "single source in code".

## Consequences

- Token, font, icon and logo changes land first (roadmap phase 2, T-1…T-5) before feature UI.
- The Material palette is regenerated with jade `#205D55` as primary.
- No new scripts, mapping files or CI jobs are introduced for Figma. Keeping code aligned with Figma relies on review,
  node IDs per component and screenshots, which is cheaper but can miss a silent Figma change; a design freeze per
  phase gate limits that risk.
- Copilot needs Figma access only on a developer machine; CI and contributors without Figma access can still build,
  test and deploy.

## Alternatives considered

- **Keep JSON as the only source and treat Figma as a mock-up:** contradicts the approved design and the brief.
- **Committed variable snapshots with a `tokens:figma-diff` CI check:** extra tooling and a mapping file to maintain;
  rejected by the owner to keep Figma out of the build.
- **Generate tokens from the Figma Variables REST API:** needs an Enterprise plan and a Figma token in CI.
- **Tokens Studio / Style Dictionary:** extra tooling and licences for little gain over the existing generator.

## References

- [figma-handoff.md](../design/figma-handoff.md), [design-tokens.md](../design/design-tokens.md),
  [component-mapping.md](../design/component-mapping.md)
- ADR-0005 (icon library), ADR-0007 (design tokens)
