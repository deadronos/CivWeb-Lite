# [TASK-052..054] Performance benchmarks & rendering optimizations

**Status:** Not Started

**Added:** 2025-09-12

**Owner suggestion:** graphics-engineer

## Original request

Plan shows benchmarks and instancing as complete; commentary flagged that larger perf tasks may still be open or require verification. We need a canonical benchmark run and a short report documenting results and next actions.

## Goal

- Provide measurable per-turn timing for representative map sizes (30x30, 50x50, 100x100).
- Verify React.memo and instancing changes actually improve render/perf characteristics.
- Create `docs/perf-bench-results.md` summarizing runs and any proposed follow-ups.

## Acceptance criteria

- `scripts/benchWorld.ts` (or bench-world.mjs) runs headlessly and logs per-turn ms and memory usage.
- Bench runs for map sizes 30/50/100 and outputs JSON results to `test-results/bench-<timestamp>.json`.
- If rendering is the bottleneck at target sizes, a follow-up PR is opened implementing instancing behind a feature flag and re-running the bench.

## Implementation notes

- Prefer Node-run harness that exercises the game's turn pipeline and rendering hookup where possible. For pure render timing, a small headless puppeteer/Playwright page can measure frame times with `requestAnimationFrame` in a real browser if needed.
- Keep bench runs reproducible (seeded RNG) and document commands used.

## Tasks

- [ ] Add `scripts/benchWorld.ts` to run per-turn benchmark harness.
- [ ] Add `docs/perf-bench-results.md` with findings and suggested follow-up.
- [ ] If needed, open PR to gate instancing behind `FEATURE_INSTANCING` flag and re-run bench.

## ETA

- 1–3 days depending on whether a browser-assisted render bench is required.
