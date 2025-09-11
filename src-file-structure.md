# CivWeb-Lite Source File Structure

This document outlines the recommended file structure for the `src` directory to ensure the project remains modular, scalable, and maintainable.

## Directory Structure

```
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

### Why this structure?

- **Separation of Concerns:** It clearly separates UI (`components`), state (`contexts`), core logic (`game-logic`), and visual scenes (`scenes`).
- **Scalability:** When you add a new feature, like a diplomacy system, you can add a new file in `game-logic/systems/` and its corresponding UI in `components/game/`.
- **Reusability:** Generic UI elements in `components/ui/` can be used anywhere, keeping your visual style consistent.
- **Maintainability:** It's easier to find and modify code when it's organized by its domain or purpose.

## File Naming & Conventions

- Use kebab-case for all filenames under `src/` (e.g., `overlay-ui.tsx`, `camera-controls.tsx`, `unit-model-switch.tsx`).
- Export React components in PascalCase, but keep the file itself in kebab-case.
- Tests mirror files with `.test.ts(x)` suffix in kebab-case (e.g., `overlay-ui.test.tsx`).
- Legacy files using PascalCase are allowed temporarily for backward compatibility and will be renamed incrementally; prefer kebab-case for all new files.
- Linting: the repo enforces this via ESLint’s filename-case rule (exceptions are annotated inline until fully migrated).
