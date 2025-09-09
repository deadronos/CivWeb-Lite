import { describe, test, expect } from 'vitest';
import { initialState } from '../src/contexts/GameProvider';
import { applyAction } from '../src/game/reducer';

describe('reducer INIT and END_TURN', () => {
  test('INIT generates world and updates seed and map', () => {
    const s = initialState();
    const next = applyAction(s, {
      type: 'INIT',
      payload: { seed: 'abc', width: 3, height: 3 },
    } as any);
    expect(next.seed).toBe('abc');
    expect(next.map.width).toBe(3);
    expect(next.map.height).toBe(3);
  });

  test('END_TURN advances research and emits unlock when complete', () => {
    const s = initialState();
    // make a fake tech catalog entry with small cost
    s.techCatalog = [
      { id: 't1', tree: 'science', name: 'T1', cost: 1, prerequisites: [], effects: [] } as any,
    ];
    s.players = [
      {
        id: 'p1',
        isHuman: true,
        leader: {
          id: 'l',
          name: 'L',
          aggression: 0.5,
          scienceFocus: 0.5,
          cultureFocus: 0.5,
          expansionism: 0.5,
        },
        sciencePoints: 1,
        culturePoints: 0,
        researchedTechIds: [],
        researching: { techId: 't1', progress: 0 },
      } as any,
    ];
    const next = applyAction(s, { type: 'END_TURN' } as any);
    expect(next.turn).toBe(s.turn + 1);
    expect(next.players[0].researching).toBeNull();
    expect(next.players[0].researchedTechIds).toContain('t1');
  });
});
