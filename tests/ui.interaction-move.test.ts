import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests as initialState } from '../src/test-utils/game-provider';
import { computeMovementRange } from '../src/game/pathfinder';

describe('UI interaction movement flow', () => {
  it('selects unit, previews path and issues move', () => {
    let state = initialState();
    state = applyAction(state, {
      type: 'NEW_GAME',
      payload: { seed: 'test', totalPlayers: 1, humanPlayers: 1 }
    });
    const extension = state.contentExt!;
    const unitId = Object.keys(extension.units)[0];
    const range = computeMovementRange(extension, unitId, state.map.width, state.map.height);
    expect(range.reachable.length).toBeGreaterThan(0);
    const target = range.reachable[0];
    state = applyAction(state, { type: 'SELECT_UNIT', payload: { unitId } });
    state = applyAction(state, { type: 'PREVIEW_PATH', payload: { unitId, targetTileId: target } });
    const path = state.ui.previewPath!;
    state = applyAction(state, { type: 'ISSUE_MOVE', payload: { unitId, path } });
    expect(state.contentExt!.units[unitId].location).toBe(target);
    expect(state.ui.selectedUnitId).toBeUndefined();
  });
});
