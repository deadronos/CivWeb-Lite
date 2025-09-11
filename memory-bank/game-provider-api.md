````markdown
# GameProvider API (reference)

This document describes the public shapes and APIs exposed by the `GameProvider` in `src/contexts/game-provider.tsx` and related game modules. It's intended as a quick reference for contributors.

## Exports and public hooks

- `GameProvider` — React context provider component. Wraps app to provide game state and dispatch.
- `GameStateContext` — React context holding the current `GameState` object (frozen). Use `useContext` or `useGame()` helper hook to consume.
- `GameDispatchContext` — React context holding the `dispatch` function for `GameAction` objects.
- `initialState`, `initialStateForTests` — helpers to create initial GameState for tests.

## Context usage

Typical consumption via a `useGame()` hook (project convention):

```ts
const state = useContext(GameStateContext);
const dispatch = useContext(GameDispatchContext);
```
````

The `GameStateContext` value is frozen (Object.freeze) — do not mutate directly.

## Dispatch signature

Dispatch expects a `GameAction` object. The types are defined in `src/game/actions` and handled by `src/game/reducer.ts`.

Simplified shape:

```ts
type Dispatch = (action: GameAction) => void;

type GameAction =
  | { type: 'INIT' }
  | {
      type: 'NEW_GAME';
      payload: {
        seed?: string;
        width?: number;
        height?: number;
        totalPlayers: number;
        humanPlayers?: number;
        selectedLeaders?: string[];
      };
    }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'END_TURN' }
  | { type: 'AUTO_SIM_TOGGLE'; payload?: { enabled?: boolean } }
  | { type: 'SET_RESEARCH'; playerId: string; payload: { techId: string } }
  | { type: 'ADVANCE_RESEARCH'; playerId: string; payload?: { points?: number } }
  | {
      type: 'EXT_ADD_UNIT';
      payload: { unitId: string; type: string; ownerId: string; tileId: string };
    }
  | {
      type: 'EXT_ADD_CITY';
      payload: { cityId: string; name: string; ownerId: string; tileId: string };
    };
// ...and other EXT_ and UI-related action shapes handled by reducer
```

Refer to `src/game/actions.ts` and `src/game/reducer.ts` for the full list and precise payload shapes.

## Events emitted via `globalGameBus`

The game uses an event bus (`globalGameBus`) to broadcast internal lifecycle events. Consumers and UI may listen to these events.

- `turn:start` — payload: `{ turn: number }` triggered at start of a turn or simulation step.
- `turn:end` — payload: `{ turn: number }` triggered at end of turn.
- `tech:unlocked` — payload: `{ playerId: string; techId: string }` when a tech completes.
- `action:applied` — payload: `{ action }` emitted whenever an action is applied via the reducer (useful for logging and audit).

UI components should prefer reading the frozen `GameState` over relying on events for state, but events are useful for side-effects and instrumentation.

## Notes and best practices

- Do not mutate `GameState` directly; always dispatch actions.
- Test helpers like `simulateAdvanceTurn`, `triggerAutoSimOnce`, and `cover*` functions exist in the provider module for unit tests. Consider using them from tests only. Future cleanup: move these helpers to a `tests/test-utils` module or guard them behind `NODE_ENV === 'test'`.
- Use `LOAD_STATE` to set an external saved state (it will become frozen as-is by the reducer).

## Where to look in code

- Provider: `src/contexts/game-provider.tsx`
- Reducer and actions: `src/game/reducer.ts`, `src/game/actions.ts`
- Game types: `src/game/types.ts` and `src/game/types/index.ts`
- Event bus: `src/game/events.ts`

```

```
