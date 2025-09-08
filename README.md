# CivWeb-Lite

CivWeb-Lite is a lightweight, extensible implementation of a Civ-like, turn-based simulation built with React, TypeScript, Vite, and Three.js (via @react-three/fiber).

This repository is for an evolving deterministic simulation: procedural hex-world generation, a turn engine, tech progression, and AI players. The work here is intended to be modular, testable, and easy to extend.

Key goals:

- Deterministic simulation (seedable RNG) for reproducible runs and replays.
- Modular systems: world generation, turn engine, tech trees, AI heuristics, and save/load.
- Small, testable core so features can be iteratively added and verified.

Status: Planned / in development. See `spec/spec-architecture-civweb-lite-core.md` and `plan/feature-core-game-foundation-1.md` for detailed requirements and the implementation plan.

## Quick start

Install dependencies and run the dev server:

```powershell
npm install
npm run dev
```

Build for production:

```powershell
npm run build
```

Preview a production build:

```powershell
npm run preview
```

## Project structure

This project follows a canonical `src/` layout. The structure below is authoritative — it should inform where new code goes. If you need to deviate, open a short proposal and update the `spec/` and `plan/` documents with the rationale.

```text
src/
├── assets/
│   └── # Images, sounds, and other media
├── components/
│   ├── ui/
│   │   └── # Reusable UI elements like Button.tsx, Modal.tsx, etc.
│   └── game/
│       └── # Game-specific components like CityInfo.tsx, UnitSprite.tsx
├── constants/
│   └── # Game constants, like technology costs or unit stats
├── contexts/
│   └── GameProvider.tsx  # Central state management
├── hooks/
│   └── # Custom hooks, e.g., useGame.ts to access game state
├── scenes/
│   ├── GameScene.tsx     # The main game view
│   └── MainMenu.tsx    # A main menu, for example
├── styles/
│   └── # Global and shared styles
├── types/
│   └── index.ts          # TypeScript interfaces for game objects (e.g., City, Unit)
├── game-logic/
│   ├── systems/
│   │   └── # Core game systems, e.g., technology.ts, combat.ts
│   └── utils/
│       └── # Helper functions
├── App.tsx
└── main.tsx
```

## How to contribute

- Follow the authoritative `src/` layout above. If a feature requires a different layout, create a short proposal and update both `spec/spec-architecture-civweb-lite-core.md` and `plan/feature-core-game-foundation-1.md` documenting the reason and the proposed file placement.
- Keep changes small and focused. Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, etc.
- Add tests for logic-heavy modules (Vitest recommended) and include at least one happy-path test plus 1-2 edge cases for new behaviors.
- Avoid committing secrets. Use environment variables for any keys or tokens.

## Development practices

- Use the `useGame()` hook from `src/contexts/GameProvider.tsx` to read the canonical, read-only game state in UI components.
- Prefer pure functions for simulation logic so state transitions are deterministic and testable.
- Use the provided seedable RNG utilities in `src/game-logic/utils/rng.ts` rather than `Math.random()` to ensure reproducibility.

## Documentation & planning

- Specification: `spec/spec-architecture-civweb-lite-core.md` — definitive requirements and constraints.
- Implementation plan: `plan/feature-core-game-foundation-1.md` — tasks, phases, tests, and files to implement.

## License

This project is licensed under the MIT license — see `LICENSE`.

## Contact

Owner: deadronos — open issues or PRs for collaboration.

---

If you'd like, I can now: (1) run a markdown-lint pass to normalize headings/blank lines across the spec/plan/README, (2) commit these edits to `impl-phase1` and open a PR, or (3) both. Which would you like next?

- npm run dev - start dev server
- npm run build - build production
