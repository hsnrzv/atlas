# ADR-0001: Record architecture decisions

- Status: Accepted
- Date: 2026-11-12
- Deciders: @hsnrzv (owner)

## Context

`project-instruction.md` §0.1 requires that decisions which materially affect future work are recorded before
implementation, and §21 forbids silently assuming answers to open questions. IKIGAI ATLAS spans three repositories:
`atlas` (this one), `atlas-microservices` and `atlas-infra`. Some decisions belong to a single repository; others,
such as repository topology, UI vocabulary and the roadmap, cut across all three.

## Decision

- We record decisions as Architecture Decision Records (Michael Nygard's format) in `docs/adr/` of the repository that
  owns the decision. Each repository numbers its own ADRs from `0001`. `0000-template.md` is the template and
  `README.md` is the index.
- Format: `# ADR-NNNN: Title`, then `- Status`, `- Date`, `- Deciders`, then Context, Decision, Consequences,
  Alternatives considered, References. Researched facts carry a source and an access date.
- Status values: **Proposed** (open, awaiting owner review), **Accepted** (owner decision, or a baseline implemented
  and verified in Phase 1), **Superseded by ADR-NNNN**. Accepted ADRs are not rewritten; a changed decision gets a new
  ADR, and the old one only receives the status change and a link.
- **This repository holds the cross-cutting ADRs** (topology, UI stack, visualization, icons, vocabulary, tokens) in
  addition to frontend-only ones. Other repositories cite them as "see `atlas` ADR-NNNN (title)". In this repository,
  backend and infrastructure ADRs are cited as "`atlas-microservices` ADR-NNNN" and "`atlas-infra` ADR-NNNN".

## Consequences

- Reviewers and coding agents have one fixed place per repository to check before changing an architectural rule.
- Adding or updating an ADR is part of the Definition of Done for PRs that change such a rule.
- Numbers are local, so every cross-repository reference must name the repository.

## Alternatives considered

- **One ADR log for all three repositories:** a single place to look, but backend and infrastructure PRs could not
  update their decisions atomically with their code.
- **Free-form wiki pages:** easier to write, but harder to review, not versioned with the code, and without a status
  lifecycle.

## References

- `project-instruction.md` §0.1, §0.2, §21
- Michael Nygard, "Documenting Architecture Decisions" (2011),
  <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions> (accessed 2026-11-12)
- `atlas-microservices` ADR-0001, `atlas-infra` ADR-0001 (same format)
