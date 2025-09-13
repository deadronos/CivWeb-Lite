---
title: FUT-* TODO Registry
version: 1.0
date_created: 2025-09-09
last_updated: 2025-09-09
owner: deadronos
---

Convention

- Prefix long‑lived future work items with `FUT-<ID>` in code comments and docs.
- Track them here for discoverability and triage.

Registry

- FUT-001: Replace placeholder TileMesh with hex geometry.
- FUT-002: Wire InstancedTiles into Scene when map rendering lands.
- FUT-003: Expand Playwright axe assertions once baseline is clean.

- FUT-004: TASK005 follow-ups — accessibility & docs
	- Review axe JSON outputs in `test-results/a11y-axe-*.json` and triage violations as UI changes are made.
	- Add developer-facing documentation in `src/components/ui/` describing expected aria-labels for unit badges and examples.
	- Add a CI guide for running Playwright accessibility checks and establishing/recording a baseline.
