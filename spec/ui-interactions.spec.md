# UI Interactions Specification — Unit Movement, City Production, Research

This spec captures user stories, UI flows, action payloads, and acceptance tests for three core UI interactions:
- Unit movement (select, path, confirm, cancel, attack)
- City production selection (choose unit/building/improvement, queue, reorder)
- Research selection (choose tech, queue, auto-recommend)

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
