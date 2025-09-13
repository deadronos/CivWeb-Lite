# [TASK-055..057] CI, test stability, and Playwright E2E resilience

**Status:** Not Started

**Added:** 2025-09-12

**Owner suggestion:** devops / frontend

## Original request

CI occasionally shows flaky test failures and Playwright E2E runs are brittle in CI. This task groups work to stabilize CI, reduce flakiness, and make E2E suites reliable and actionable.

## Goal

- Reduce flaky test rate across Vitest unit tests and Playwright E2E tests.
- Harden Playwright tests for common CI-only flakiness (timing, network, rendering differences).
- Add CI guards and diagnostic artifacts (screenshots, traces, logs) to speed triage.

## Acceptance criteria

- Average flaky rate (retries needed) for Playwright E2E is reduced below 1% on CI for a representative run.
- Vitest suite reliably completes under 60s on CI (where previously it flaked or timed out) for base test set.
- Playwright CI workflow uploads traces/screenshots on failure and exposes a `--ci-diagnostics` flag in package.json scripts.
- A short-run `npm run test:e2e:ci` script exists that runs a minimal smoke E2E suite and returns machine-readable diagnostics on failure.

## Implementation notes

- Start by collecting reproducible failure examples from CI runs (log artifacts, failing test names, stack traces).
- Use Playwright's built-in retries and trace-on-first-retry; but prefer fixing flakiness by improving locators, avoiding hard-coded waits, and adding resilient waits for elements.
- Add per-test `test.step()` grouping in Playwright to clarify failure points.
- Consider isolating environment-dependent tests behind env flags and run them only when required.
- Where possible, mock network responses (e.g., tile assets, AI endpoints) to reduce network unpredictability in CI.

## Tasks

- [ ] Collect last 10 CI failing runs, save failure traces/logs for analysis.
- [ ] Add Playwright trace-on-failure and screenshot-on-failure to CI workflow.
- [ ] Create `npm run test:e2e:ci` that runs a minimal smoke subset of critical Playwright tests.
- [ ] Audit failing Playwright tests and convert brittle locators to role-based or text-based selectors.
- [ ] Add `test.describe.serial` or `test.fixme` markers where order or flakiness requires temporary isolation.
- [ ] Add a CI retry policy only for known-flaky tests, document reasons, and open issues to fix root cause.
- [ ] Update `playwright.config.ts` timeouts and `use` options for CI environments (e.g., slower machines).
- [ ] Add a PR checklist item: run `npm test` and `npm run test:e2e:ci` locally before requesting review.

## ETA

- 2–4 days to stabilize the most critical flaky tests (investigation first, fixes next).

## How to mark resolved

- Merge PRs that add diagnostic artifacts and fixes. Re-run CI for 10 consecutive runs to verify flaky-rate reduction.
