# Action Flow Diagrams

This document visualizes common action flows in CivWeb‑Lite using Mermaid diagrams.

## New Game Flow (Main Menu → World + Players)

```mermaid
flowchart TD
  A[MainMenu form submit] -->|dispatch NEW_GAME payload<br/>(seed,width,height,players,leaders)| B(GameProvider validates action)
  B --> C[applyAction]
  C --> D{lifecycleReducer.NEW_GAME}
  D --> E[generateWorld(seed,width,height)]
  E --> F[reset UI/players]
  F --> G[populateExtensionTiles]
  G --> H[spawnInitialUnits]
  H --> I[Freeze next state]
  I --> J[Render Scene/Overlays]
  D -. emit .-> K[globalGameBus 'action:applied']
  K --> L[GameProvider effect logs LOG_EVENT]
```

## Init Boot Flow (on App mount)

```mermaid
flowchart TD
  A[App mounts] --> B[GameProvider useEffect]
  B -->|dispatch INIT| C(GameProvider validates)
  C --> D[applyAction]
  D --> E{lifecycleReducer.INIT}
  E --> F[generateWorld(seed,width,height)]
  F --> G[populateExtensionTiles]
  G --> H[spawnInitialUnits + add Idle state]
  H --> I[Freeze next state]
  E -. emit .-> J[globalGameBus 'turn:start']
  I --> K[Scene renders from state]
```

## Unit Selection → Path Preview → Move (with combat confirm)

```mermaid
flowchart TD
  A[Tile click in Scene] --> B{Tile has unit?}
  B -- yes --> C[setSelectedUnitId]
  C -->|dispatch SELECT_UNIT| D[uiReducer SELECT_UNIT<br/>mark Selected if not Moved]
  B -- no --> E{selectedUnitId exists?}
  E -- yes --> F[hover/pointermove]
  F -->|dispatch PREVIEW_PATH(targetTileId)| G[uiReducer PREVIEW_PATH<br/>computePath -> previewPath + previewCombat]
  G --> H[Path/Combat overlays render]
  A --> I{click target while selected?}
  I -- yes --> J|dispatch ISSUE_MOVE(unitId,path,confirmCombat)|
  J --> K[uiReducer ISSUE_MOVE<br/>move along path via extension rules]
  K --> L{enemy encountered and confirmCombat?}
  L -- no --> M[Abort at enemy tile]
  L -- yes --> N[Proceed; clear Selected, add Moved]
```

## AutoSim Loop (per frame when enabled)

```mermaid
flowchart TD
  A[state.autoSim = true] --> B[requestAnimationFrame loop]
  B --> C[simulateAdvanceTurn]
  C --> D[globalGameBus 'turn:start']
  C --> E[For each AI player: evaluateAI]
  E --> F[dispatch SET_RESEARCH (if needed)]
  C --> G[dispatch RECORD_AI_PERF]
  C --> H[dispatch END_TURN]
  H --> I[Reducers apply turn effects]
  I --> J[Next frame scheduled]
```

## Save / Load Flow

```mermaid
flowchart TD
  subgraph Save
    A[HUD Save button] --> B[exportToFile(state)]
    B --> C[serializeState -> JSON]
    C --> D[Create Blob + temp URL]
    D --> E[Anchor click triggers download]
  end
  subgraph Load
    F[HUD Load input/file drop] --> G[importFromFile(file)]
    G --> H[ensureValidator(AJV)]
    H --> I[deserializeState(JSON)]
    I --> J{schemaVersion & AJV valid?}
    J -- yes --> K|dispatch LOAD_STATE|
    J -- no --> L[throw Validation/Version/Size error]
  end
```

## Research Panel and Production Queue

```mermaid
flowchart TD
  A[TopMenu Research] -->|dispatch OPEN_RESEARCH_PANEL| B[uiReducer: openPanels.researchPanel=true]
  C[TopMenu Cities] -->|dispatch OPEN_CITY_PANEL(cityId)| D[uiReducer: cityPanel=cityId]
  E[Choose production item] -->|dispatch CHOOSE_PRODUCTION_ITEM| F[playerReducer updates queue]
  G[End turn / ticks] --> H[content.rules: processProduction]
  H --> I{order completes?}
  I -- unit --> J[spawn unit at city]
  I -- improvement --> K[apply tile improvement]
  I -- building --> L[add building (yields may change)]
```

Notes
- Action validation uses Zod (`schema/action.schema.ts`); strict schema first, permissive fallback with log.
- The event bus (`globalGameBus`) produces logging hooks consumed by `GameProvider` to append `LOG_EVENT` entries.
- Movement rules and yields reside in `src/game/content/rules.ts`; world gen is in `src/game/world/generate.ts`.

