# UI Interactions Specification — Unit Movement, City Production, Research

This spec captures user stories, UI flows, action payloads, and acceptance tests for three core UI interactions:

- Unit movement (select, path, confirm, cancel, attack)
- City production selection (choose unit/building/improvement, queue, reorder)
- Research selection (choose tech, queue, auto-recommend)

**Implementation Status (as of 2025-09-12):** This specification describes advanced UI interactions that are planned but not yet implemented. The core game foundation (world generation, turn engine, tech trees, AI, save/load) is complete, and basic HUD components are partially implemented per `plan/hud-ui-implementation-plan.md`. These interactions (unit movement, city production, combat) are future features requiring additional specification and implementation.

Audience: frontend engineers, game logic engineers, QA.

1. User stories and flows

1.1 Unit movement

Summary: selecting a unit shows movement range, path preview, and allows issuing moves (single-tile or multi-tile) with cancellation and attack confirmation.

Primary actions (payloads):

- selectUnit: { unitId: string }
- previewPath: { unitId: string, targetTileId: string, computedPath: string[] , totalCost: number }
- issueMove: { unitId: string, path: string[], confirmCombat?: boolean }
- cancelSelection: { unitId: string }

Acceptance tests:

- Selecting a unit produces a UI overlay with highlighted movement range computed from unit.movementRemaining and tiles[].movementCost.
- previewPath shows the computed path and an accurate totalCost.
- issueMove moves the unit if pathCost <= movementRemaining or queues partial move otherwise (configurable). Movement updates unit.location and movementRemaining.
- issueMove into enemy tile triggers a combat preview and requires confirmCombat true to proceed.

Edge cases and notes:

- If tile's passable==false for the unit abilities, the UI must gray out the tile.
- If path computation fails (no path) the preview indicates "No valid path".

  1.2 City production selection

Summary: open the city panel, view allowed builds (units/buildings/improvements), choose an item, specify target tile for tile-specific improvements, manage queue and reorder.

Primary actions (payloads):

- openCityPanel: { cityId: string }
- chooseProductionItem: { cityId: string, order: { type: 'unit'|'improvement'|'building', itemId: string, targetTileId?: string } }
- reorderProductionQueue: { cityId: string, newQueue: ProductionOrder[] }
- cancelOrder: { cityId: string, orderIndex: number }

Acceptance tests:

- City panel lists only items available to the player (based on playerState.researchedTechs) and shows cost and turnsRemaining.
- Choosing an improvement that requires a target prompts tile selection; the chosen tile is stored in the queued order.
- Reordering updates which order consumes production next turn.

Edge cases and notes:

- If the target tile becomes invalid before worker acts, the order should be flagged and player notified; the order may be auto-canceled or re-targeted.

  1.3 Research selection

Summary: open research panel, choose available techs, queue or auto-recommend, and handle mid-research switching policy.

Primary actions (payloads):

- openResearchPanel: {}
- startResearch: { playerId: string, techId: string }
- queueResearch: { playerId: string, techId: string }
- switchResearchPolicy: { playerId: string, policy: 'preserveProgress'|'discardProgress' }

Acceptance tests:

- Starting a tech moves it into in-progress and reduces turnsRemaining each tick.
- Completing a tech adds techId to playerState.researchedTechs and updates availableUnits/improvements.
- Attempting to start a locked tech shows missing prerequisites tooltip.

Edge cases and notes:

- Science per turn changing while researching must either (A) recompute turnsRemaining from remaining cost, or (B) keep accumulated progress and only use updated science for future ticks. The project must pick one and tests must reflect it.

2. UI contracts (components & events)

Suggested components and emitted events (frontend):

- UnitSelectionOverlay
  - Props: selectedUnitId, computedRangeTiles[], computedPath?: string[]
  - Events: onPreviewPath(targetTileId), onIssueMove(path), onCancel
- CityPanel
  - Props: cityId, productionQueue[], availableItems[], productionPerTurn
  - Events: onChooseItem(order), onReorderQueue(newQueue), onCancelOrder(index)
- ResearchPanel
  - Props: playerId, currentResearch, queue[], availableTechs[]
  - Events: onStartResearch(techId), onQueueResearch(techId), onAutoRecommend()

3. Acceptance test skeletons (Vitest-style pseudocode)

test('select unit shows valid range', () => {
// setup: unit with movement=2 on tile with plain/forest next to it
// action: selectUnit(unitId)
// assert: overlay shows tiles with movement cost respected
})

test('city chooses improvement with tile target', () => {
// setup: city with production, improvement farm available
// action: openCityPanel(cityId); chooseProductionItem with improvement => triggers tile selection
// action: choose target tile
// assert: queue contains order with targetTileId
})

test('start research unlocks improvement', () => {
// setup: player with science and no agriculture researched
// action: startResearch(playerId, 'agriculture') and tick until completion
// assert: playerState.availableImprovements includes 'farm'
})

4. Implementation notes

- Keep payloads minimal and JSON-serializable. All events can be forwarded to `GameProvider` which validates and applies state changes.
- UI should always read authoritative state from `useGame()` or `GameProvider` and use optimistic UI only with caution. For single-player prototype, optimistic updates are acceptable.

End of UI interactions spec

## Game loop & turn actions

This section describes how a single-player or hotseat/AI turn can play out, the canonical turn structure, player and AI actions, the action payloads passed to the game core, and acceptance tests that validate the full-loop behavior.

1. Turn structure (canonical)

- startTurn(playerId)
  - System: advance game clock to player's turn, refresh movement/production/resources, process start-of-turn events (e.g., unit heals, city growth).
- playerActionPhase(playerId)
  - Player/AI: issue any number of legal actions (movement, attack, build, research, diplomacy) until they either end turn or run out of actionable inputs.
- endTurn(playerId)
  - System: validate queued actions, process movement/combat resolution, consume production, advance tech progress, run end-of-turn triggers, then pass control to next player or AI.

2. Player & AI actions (user stories + payloads)

2.1 Move/Action Resolution

User story: When a player issues an action (move, attack, build), those actions are validated and applied deterministically in the order submitted. The UI shows previews and final outcomes.

Payloads (canonical):

- issueActions: { playerId: string, actions: GameAction[] }
  - GameAction is a tagged union with shapes like:
    - { type: 'move', unitId: string, path: string[] }
    - { type: 'attack', unitId: string, targetUnitId: string, confirm?: boolean }
    - { type: 'build', cityId: string, itemId: string, targetTileId?: string }
    - { type: 'research', playerId: string, techId: string }
    - { type: 'endTurn' }

Events emitted by the engine (for UI and replay):

- actionAccepted: { requestId: string, appliedAtTick: number }
- actionRejected: { requestId: string, reason: string }
- actionsResolved: { tick: number, results: ActionResult[] }

Acceptance tests:

- Submitting a valid move action results in actionAccepted and later an actionsResolved event where the unit's final position equals the end of the submitted path.
- Submitting an illegal action (e.g., move through impassable tile) results in actionRejected with a human-friendly reason.

  2.2 Turn-based AI Behavior

User story: AI players construct a list of actions during their playerActionPhase and submit them as a single batch. The engine should apply AI actions in the same deterministic way as human player actions.

Payloads:

- aiComputeAndSubmit: { aiId: string, playerId: string, computedActions: GameAction[] }

Acceptance tests:

- Deterministic AI: given a fixed random seed and fixed game state, calling aiComputeAndSubmit should produce the same computedActions on repeated runs.
- AI parity: For a given valid action sequence computed by AI, the engine returns actionAccepted and actionsResolved and the resulting state is equivalent to a human-submitted action sequence with the same actions.

  2.3 Production & Queue Resolution

User story: During the endTurn phase, cities consume production to advance their current queue items. If production finishes, the new unit/building is spawned or the improvement order is flagged for worker assignment.

Payloads and events:

- applyProductionTick: { tick: number }
- productionCompleted: { cityId: string, itemId: string, spawnedEntityId?: string }

Acceptance tests:

- A city with exactly enough production finishes the item during endTurn and emits productionCompleted with spawnedEntityId set.
- If a queued improvement requires a target tile and no valid tile exists at endTurn, the order is marked as failed and a productionFailure event is emitted.

  2.4 Combat & Resolution

User story: When movement or attack actions result in combat, combat should be resolved during the resolution step. Combat may be instant or multi-round depending on unit rules. All combat results are emitted as structured events so the UI can animate them.

Payloads and events:

- combatResolved: { tick: number, combats: CombatEvent[] }

Acceptance tests:

- Initiating an attack action against an enemy unit results in a combatResolved event where the defender or attacker is removed or has updated HP according to deterministic combat rules.
- If simultaneous movement causes unit collisions, the engine resolves collisions deterministically (document the collision policy: mover-first or simultaneous) and emits appropriate actionResults.

  2.5 Resource & Tech Tick

User story: At the start or end of turn (project chooses standard), resource generation (gold, science, food) and research progress must be applied consistently.

Payloads and events:

- applyResourceTick: { tick: number }
- researchProgress: { playerId: string, techId: string, progress: number, completed?: boolean }

Acceptance tests:

- Resource accumulation matches the sums of yields from tiles and city modifiers for the player at each applyResourceTick.
- Completing a tech emits researchProgress with completed=true and the player's availableUnits/Improvements update accordingly.

3. Failure modes & edge cases

- Partially-applied action batches: If some actions in a batch are invalid, the engine may (A) reject the entire batch, (B) accept a prefix up to the first invalid action, or (C) apply valid actions and reject invalid ones. The project should pick one policy; tests should assert the chosen policy.
- Interleaved AI & Player turns (asynchronous): For hotseat or simultaneous turns with AI concurrently computing, ensure action timestamps and ordering are well-defined; use a tick/sequence number to sequence actions.
- Rollback and replays: All action events must include a requestId and deterministic inputs so replays and rollback are possible for debugging and AI training.

4. UI contracts and replay

- The UI should listen for engine events (actionAccepted, actionsResolved, combatResolved, productionCompleted, researchProgress) and render safe, consistent animations.
- For replays or deterministic testing, the UI can replay the event stream; events must contain enough information to reproduce state changes (e.g., unit id, before/after HP, positions).

End of Game loop & turn actions
