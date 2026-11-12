## Summary

<!-- What changed and why. Link the issue / roadmap item (docs/plan/IMPLEMENTATION-ROADMAP.md). -->

## How it was tested

<!-- Commands run, screenshots (desktop + mobile, light + dark) for UI changes. -->

## Migration / rollout notes and known limitations

<!-- API contract changes, feature flags, follow-ups. Write "None" if not applicable. -->

## Definition of Done (project-instruction §19)

- [ ] Acceptance criteria met and demonstrated
- [ ] Code respects repository and module boundaries; no business logic duplicated from the backend
- [ ] Automated tests cover the behaviour and important edge cases
- [ ] Accessibility (keyboard, focus, names, contrast, colour not the only signal, reduced motion) and responsive behaviour verified
- [ ] API contract changes are versioned and documented (atlas-microservices `docs/architecture/API-CONTRACT.md`)
- [ ] Security / privacy implications considered
- [ ] CI passes; no new critical/high vulnerability ignored without a documented exception
- [ ] No secrets or personal sample data committed
- [ ] README / plan / ADR updated where needed

## Design system (when UI is touched)

- [ ] Uses tokens (`var(--…)`, `abstracts` mixins); no raw colours, sizes or font stacks
- [ ] Token changes made in `design/tokens/*.json` and regenerated (`npm run tokens:build`)
- [ ] Icons referenced through `<atlas-icon>` semantic names
- [ ] UI wording follows the vocabulary in ADR-0006 (Destination, Waypoint, Step, …)
