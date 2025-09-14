# Contributing

Quick start for local development and common checks.

Prerequisites

- Node >= 18
- npm or yarn

Useful scripts

- Install dependencies

```powershell
npm install
```

- Run dev server

```powershell
npm run dev
```

- Run unit tests (Vitest)

```powershell
npm test
```

- Run lint

```powershell
npm run lint
```

- Quick CI check (lint + tests)

```powershell
npm run ci-check
```

If you add new action discriminators (in `src/game/actions.ts`) please add corresponding Zod schemas in `schema/action.schema.ts` or update `tests/action-schema-sync.test.ts` expectations.
