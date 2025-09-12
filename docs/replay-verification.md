# Replay Verification

This guide covers automated deterministic replay checks.

## Running the test

```bash
npm test tests/deterministic-replay.test.ts
```

The test runs a set of randomized seeds (default 10). To use more seeds, set
`REPLAY_SEEDS`:

```bash
REPLAY_SEEDS=50 npm test tests/deterministic-replay.test.ts
```

If a mismatch is detected, a reproduction file is written to
`test-results/replay-failure-<seed>.json`.

## CI notes

The test is lightweight by default but can be configured with a higher seed
count in CI to surface non-deterministic behavior.
