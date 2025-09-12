# [TASK-051] Deterministic replay harness verification

**Status:** Completed on 2025-09-12

**Added:** 2025-09-12

**Owner suggestion:** core-engineer

## Original request

Plan marks deterministic replay as complete but notes that automated verification is important. We need a Vitest that records action lists from runs seeded with RNG, replays them against an isolated RNG, and asserts the final canonical hash matches.

## Goal

- Provide automated verification that recorded action replay produces an identical final game state for N random seeds.
- Surface any non-determinism found during replay along with a minimal repro seed/action log.

## Acceptance criteria

- A Vitest test `tests/deterministic-replay.test.ts` is added that:
  - Runs K random seeds (configurable), records actions during a run to memory (or temp files), replays them in a fresh environment with the same seed, and asserts final state hash equality.
  - On failure, writes a minimal repro (seed + action list) to `test-results/replay-failure-<seed>.json` for debugging.

## Implementation notes

- Use the project's RNG wrapper and reducer (`applyAction`) directly to avoid UI integration.
- Canonicalize state JSON before hashing (stable key ordering) and use SHA-256.
- Keep the test cheap by default (K=10) but allow larger runs in CI if desired.

## Tasks

- [x] Add `tests/deterministic-replay.test.ts` with basic K=10 run and replay assertions.
- [x] Add `docs/replay-verification.md` with run instructions and CI notes.
- [x] Add small utility `tests/utils/replay-helper.ts` if helpful to isolate record/replay logic.

## ETA

- 1 day to add tests + utility and 1 additional day to integrate into CI if required.
