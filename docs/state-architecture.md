---
title: State Architecture Overview
version: 1.0
date_created: 2025-09-09
last_updated: 2025-09-09
owner: deadronos
---

This document summarizes state management patterns and invariants used in CivWeb‑Lite.

Patterns

- Immutable snapshots: All state transitions use pure reducers returning frozen snapshots.
- Determinism: Same seed + same action sequence => identical final state hash.
- Separation: Simulation (in `src/game/**`) is decoupled from rendering (`src/scene/**`).
- Event bus: Structured events (`turn:start`, `turn:end`, `tech:unlocked`, `action:applied`).
- Structured logs: `GameLogEntry` with ring buffer policy (capacity 50 by default).

Invariants

- `turn` increments only via `END_TURN`.
- `map.tiles` is regenerated only by `INIT`.
- `players[*].researching.progress` never exceeds target `tech.cost` post‑reducer.
- Log capacity bounded; oldest entries evicted first.

Deterministic Replay

- See `src/game/utils/replay.ts` for stable stringify + hash and sequence replay.

Performance Hooks

- Benchmarks under `scripts/*` for world gen, AI eval, and turn resolution.
- Rendering components use memoization; instanced tiles scaffolded for future use.
