# [TASK-032 / TASK-033] AI micro-benchmarks & optimizations

**Status:** Not Started

**Added:** 2025-09-12

**Owner suggestion:** core-engineer

## Original request

Reconcile plan: AI decision function exists but micro-benchmarks across representative seeds/map-sizes have not been measured. We need a harness that measures per-decision latency and surfaces mean/median/95th percentile across representative maps and leader counts.

## Goal

- Measure AI decision function wall time across representative seeds, map sizes, and leader counts.
- Surface aggregated metrics (mean, median, p95) and raw sample distributions.
- If average decision ms > 50ms, propose and implement targeted optimizations (heuristic pruning, memoization, bounded search).

## Acceptance criteria

- `scripts/ai-bench.ts` (or .mjs) exists and runs headlessly (node) against `src/game/ai/*` decision entrypoint.
- Bench produces a JSON report under `test-results/ai-bench-<timestamp>.json` containing per-seed/per-map-size metrics and aggregate numbers.
- A short doc `docs/ai-bench-results.md` is created summarizing findings and recommendations.
- If mean decision time > 50ms for representative configs, a follow-up PR is opened with at least one optimization and its re-run results.

## Implementation notes

- Prefer Node-based harness that imports core AI logic directly to avoid browser/integration noise.
- Use a seeded RNG and a small `fakeGameState(seed, mapSize, leaderCount)` generator to create representative states.
- Run X iterations per config (configurable, default 50) and record individual timings (process.hrtime.bigint()).
- Aggregate using simple statistics (mean, median, p95) and write a JSON file.
- Keep harness lightweight: avoid bundling or building; require Node >= 18.

## Tasks

- [ ] Create `scripts/ai-bench.ts` that loads AI decision function and runs the benchmark harness.
- [ ] Add a README snippet or `docs/ai-bench-results.md` for results.
- [ ] If needed, open follow-up PR(s) for optimizations with before/after metrics.

## ETA

- 1–2 days for harness + initial run. 1–3 days for optimizations depending on findings.
