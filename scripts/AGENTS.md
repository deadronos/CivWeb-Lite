# scripts — AGENTS

## Purpose

Utility and benchmarking scripts used for local analysis, AI bench runs, and turn-based benchmarks.

## Key files

- `ai-bench.ts` — Run AI benchmark scenarios.
- `benchWorld.ts` / `turn-benchmark.ts` — Scripts for perf benchmarking.
- `validate-content.mjs` — Content validation helper.

## Dependencies

- Node.js and project dependencies from `package.json`.

## Interactions

- Scripts are runnable developer tools; they read project code/data and produce reports or artifacts in `test-results/`.

## Important notes

- Keep scripts small and documented; prefer adding CLI flags for reproducibility.
