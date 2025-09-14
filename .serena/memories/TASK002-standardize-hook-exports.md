# TASK002 - Standardize hook exports

**Status:** Not Started
**Added:** 2025-09-14

## Objective
Standardize hook exports across `src/hooks/` to use named exports (preferred) for consistency, easier tree-shaking, and clearer import patterns.

## Motivation
- Named exports make refactors safer, reduce ambiguity, and are the pattern already used by important hooks (e.g., `useGame` is a named export).
- Avoid mixing default and named hook exports which can cause inconsistent import style and make automated edits harder.

## Implementation Plan
1. Inventory hooks in `src/hooks/` and identify default-exported hooks.
2. For each default-exported hook:
   - Convert to a named export.
   - Update all import sites (search and replace) to use named import syntax: `import { useThing } from '../hooks/use-thing';`.
   - Run tests to ensure no regressions.
3. Add a small lint rule or repo guideline to prefer named exports for hooks (optional: eslint rule config).
4. Add a changelog entry for the refactor.

## Acceptance Criteria
- All hooks in `src/hooks/` use named exports unless there's a documented reason to remain default-exported.
- All import sites updated; build and tests pass.
- A short PR describing the change with references to updated files.

## Risk & Rollback
- Use codemods or precise automated search/replace. Rollback by reverting the PR if critical breakage occurs.

## Estimated Effort
2-4 hours (depending on number of default-exported hooks and test run time)
